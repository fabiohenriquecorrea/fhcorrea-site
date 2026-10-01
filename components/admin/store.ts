"use client";

import { REPO, repoConfigured } from "@/lib/repo-config";
import type { Content } from "@/lib/types";

/* ─────────────────────────────────────────────
   Onde o painel guarda o conteúdo.
   - GitHub: publicar = um commit em content/portfolio.json; a Cloudflare gera o site.
   - Local: só para testar o painel sem GitHub (nada vai ao ar).
   ───────────────────────────────────────────── */

export type MediaItem = { src: string; name: string; size: number };
export type Snapshot = { content: Content };

export interface Store {
  kind: "github" | "local";
  load(): Promise<Snapshot>;
  publish(snap: Snapshot): Promise<void>;
  listMedia(): Promise<MediaItem[]>;
  upload(file: File): Promise<string>;
  /** URL para exibir um arquivo no editor (inclusive recém-enviado) */
  mediaUrl(src: string): string;
}

export const MAX_UPLOAD_MB = 25;
const TOKEN_KEY = "fc_gh_token";
const CONTENT_PATH = "content/portfolio.json";
const MEDIA_DIRS = ["public/uploads", "public/images", "public/images/work", "public/images/ideato"];
const MEDIA_EXT = /\.(jpe?g|png|webp|avif|gif|mp4|webm|mov)$/i;

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (t: string | null) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
};

export const normalize = (c: Content): Snapshot => ({ content: c });

export function slugify(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "projeto"
  );
}

/** Garante endereços válidos e únicos antes de publicar, e limpa listas vazias. */
export function tidy(c: Content): Content {
  const seen = new Set<string>();
  const rename = new Map<string, string>();
  const projects = c.projects.map((p) => {
    let slug = slugify(p.slug || p.client || p.title);
    while (seen.has(slug)) slug += "-2";
    seen.add(slug);
    if (slug !== p.slug) rename.set(p.slug, slug);
    return { ...p, slug, deliverables: p.deliverables.filter((d) => d.trim()) };
  });
  // peças e imagens de fundo continuam apontando para o projeto certo
  const fix = (s: string) => rename.get(s) ?? s;
  return {
    ...c,
    projects,
    pieces: c.pieces.map((p) => ({ ...p, project: fix(p.project) })),
    hero: { ...c.hero, slides: c.hero.slides.map((s) => ({ ...s, project: fix(s.project) })) },
  };
}

const safeName = (name: string) => {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
  return `${Date.now().toString(36)}-${slugify(dot > 0 ? name.slice(0, dot) : name).slice(0, 40)}${ext}`;
};

/* ── utilidades base64 (UTF-8 seguro) ── */
const b64FromText = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const textFromB64 = (b64: string) =>
  new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, "")), (c) => c.charCodeAt(0)));
const b64FromFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

/* ─────────────────────────────────────────────
   GitHub
   ───────────────────────────────────────────── */
export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function githubStore(token: string): Store {
  const { owner, repo, branch } = REPO;
  const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (!res.ok) {
      const msg =
        res.status === 401
          ? "A chave de acesso do GitHub é inválida ou expirou."
          : res.status === 403 || res.status === 404
            ? "A chave de acesso não tem permissão para este repositório."
            : `Erro do GitHub (${res.status}).`;
      throw new GitHubError(msg, res.status);
    }
    return res.status === 204 ? (undefined as T) : res.json();
  };

  const readJson = async <T,>(path: string): Promise<T | null> => {
    try {
      const f = await api<{ content: string }>(`/contents/${path}?ref=${branch}`);
      return JSON.parse(textFromB64(f.content)) as T;
    } catch (e) {
      if (e instanceof GitHubError && e.status === 404) return null;
      throw e;
    }
  };

  /** Um único commit com vários arquivos. */
  const commit = async (files: { path: string; base64: string }[], message: string) => {
    const ref = await api<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
    const head = await api<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`);
    const tree = await Promise.all(
      files.map(async (f) => {
        const blob = await api<{ sha: string }>(`/git/blobs`, {
          method: "POST",
          body: JSON.stringify({ content: f.base64, encoding: "base64" }),
        });
        return { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
      }),
    );
    const newTree = await api<{ sha: string }>(`/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: head.tree.sha, tree }),
    });
    const c = await api<{ sha: string }>(`/git/commits`, {
      method: "POST",
      body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
    });
    await api(`/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: c.sha }) });
  };

  return {
    kind: "github",
    async load() {
      const content = await readJson<Content>(CONTENT_PATH);
      if (!content) throw new Error(`Não encontrei ${CONTENT_PATH} no repositório.`);
      return normalize(content);
    },
    async publish({ content }) {
      await commit(
        [{ path: CONTENT_PATH, base64: b64FromText(JSON.stringify(tidy(content), null, 2) + "\n") }],
        "Publicar conteúdo pelo painel",
      );
    },
    async listMedia() {
      const lists = await Promise.all(
        MEDIA_DIRS.map((d) =>
          api<{ name: string; path: string; size: number; type: string }[]>(`/contents/${d}?ref=${branch}`).catch(
            () => [],
          ),
        ),
      );
      return lists
        .flat()
        .filter((f) => f.type === "file" && MEDIA_EXT.test(f.name))
        .map((f) => ({ src: f.path.replace(/^public/, ""), name: f.name, size: f.size }));
    },
    async upload(file) {
      if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
        throw new Error(`Arquivo acima de ${MAX_UPLOAD_MB} MB. Comprima o vídeo/imagem e tente de novo.`);
      }
      const name = safeName(file.name);
      // [skip ci]: não gera o site agora; o arquivo entra no próximo "Publicar"
      await commit([{ path: `public/uploads/${name}`, base64: await b64FromFile(file) }], `Enviar ${name} [skip ci]`);
      return `/uploads/${name}`;
    },
    mediaUrl(src) {
      return src.startsWith("/uploads/")
        ? `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/public${src}`
        : src;
    },
  };
}

/** Confere se a chave funciona e pode gravar no repositório. */
export async function checkToken(token: string) {
  const res = await fetch(`https://api.github.com/repos/${REPO.owner}/${REPO.repo}`, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) return "Essa chave não é válida. Confira se copiou inteira.";
  if (!res.ok) return "Essa chave não tem acesso ao repositório do site.";
  const data = await res.json();
  if (!data.permissions?.push) return "A chave pode ler, mas não pode gravar. Dê permissão de escrita em “Contents”.";
  return null;
}

/* ─────────────────────────────────────────────
   Local (testes, sem GitHub)
   ───────────────────────────────────────────── */
export function localStore(initial: Snapshot): Store {
  const KEY = "fc_local_published";
  const blobs = new Map<string, string>();
  return {
    kind: "local",
    async load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) return JSON.parse(raw) as Snapshot;
      } catch {}
      return initial;
    },
    async publish(snap) {
      localStorage.setItem(KEY, JSON.stringify({ ...snap, content: tidy(snap.content) }));
    },
    async listMedia() {
      const known = new Set<string>();
      const walk = (v: unknown) => {
        if (typeof v === "string" && /^\/(images|video|uploads)\//.test(v)) known.add(v);
        else if (v && typeof v === "object") Object.values(v).forEach(walk);
      };
      walk(initial);
      blobs.forEach((_, k) => known.add(k));
      return [...known].map((src) => ({ src, name: src.split("/").pop()!, size: 0 }));
    },
    async upload(file) {
      const src = `/uploads/${safeName(file.name)}`;
      blobs.set(src, URL.createObjectURL(file));
      return src;
    },
    mediaUrl(src) {
      return blobs.get(src) ?? src;
    },
  };
}

export const hasRepo = repoConfigured;
