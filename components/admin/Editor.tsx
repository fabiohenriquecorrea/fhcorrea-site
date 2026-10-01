"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Content, Project } from "@/lib/types";
import { REPO } from "@/lib/repo-config";
import { Mark } from "../Logo";
import { FieldView } from "./Fields";
import { MediaContext, Thumb } from "./MediaPicker";
import type { PreviewMessage } from "./PreviewClient";
import { buildPages, getAt, newProject, setAt, type Page, type Section } from "./schema";
import {
  GitHubError,
  getToken,
  githubStore,
  hasRepo,
  localStore,
  setToken,
  type Snapshot,
  type Store,
} from "./store";
import { TokenLogin } from "./TokenLogin";

type Device = "desktop" | "tablet" | "mobile";
const DEVICES: Record<Device, { w: number; h: number; label: string }> = {
  desktop: { w: 1440, h: 900, label: "Desktop" },
  tablet: { w: 820, h: 1180, label: "Tablet" },
  mobile: { w: 390, h: 844, label: "Celular" },
};

type Status = "idle" | "saved" | "error" | "publishing" | "published";
type Toast = { id: number; text: string; href?: string };

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);
const mod = isMac ? "⌘" : "Ctrl";
const PREVIEW_URL = "/admin-preview";

/* Porta de entrada: decide onde o conteúdo é guardado e pede a chave do GitHub se preciso. */
export function Editor({ initial }: { initial: Snapshot }) {
  const [token, setTok] = useState<string | null | undefined>(undefined);
  useEffect(() => setTok(getToken()), []);

  const store = useMemo<Store | null>(() => {
    if (!hasRepo()) return localStore(initial);
    return token ? githubStore(token) : null;
  }, [token, initial]);

  if (token === undefined) return <Loading />;
  if (!store) {
    return (
      <TokenLogin
        onDone={(t) => {
          setToken(t);
          setTok(t);
        }}
      />
    );
  }
  return (
    <EditorApp
      store={store}
      onAuthError={() => {
        setToken(null);
        setTok(null);
      }}
    />
  );
}

function Loading() {
  return (
    <div className="ed-loading">
      <Mark className="ed-loading-mark" />
      <span>Abrindo o painel…</span>
    </div>
  );
}

function EditorApp({ store, onAuthError }: { store: Store; onAuthError: () => void }) {
  const DRAFT_KEY = `fc_draft_${store.kind}`;
  const [content, setContent] = useState<Content | null>(null);
  const [published, setPublished] = useState<Snapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [pageId, setPageId] = useState("home");
  const [sectionId, setSectionId] = useState("abertura");
  const [device, setDevice] = useState<Device>("desktop");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ home: true });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [canvas, setCanvas] = useState({ w: 1000, h: 700 });
  const [loadingFrame, setLoadingFrame] = useState(true);
  const [mediaVersion, setMediaVersion] = useState(0);

  const past = useRef<Content[]>([]);
  const future = useRef<Content[]>([]);
  const lastPush = useRef(0);
  const latest = useRef<Content | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollOnRender = useRef(false);
  const [, force] = useState(0);

  latest.current = content;

  const toast = useCallback((text: string, href?: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, href }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  }, []);

  const fail = useCallback(
    (e: unknown, fallback: string) => {
      if (e instanceof GitHubError && e.status === 401) {
        onAuthError();
        return;
      }
      toast(e instanceof Error && e.message ? e.message : fallback);
    },
    [onAuthError, toast],
  );

  /* ── carregar: publicado + rascunho guardado neste navegador ── */
  useEffect(() => {
    let alive = true;
    store
      .load()
      .then((snap) => {
        if (!alive) return;
        setPublished(snap);
        let draft: Snapshot | null = null;
        try {
          const raw = localStorage.getItem(DRAFT_KEY);
          if (raw) draft = JSON.parse(raw);
        } catch {}
        const start = draft ?? snap;
        setContent(start.content);
      })
      .catch((e) => {
        if (e instanceof GitHubError && e.status === 401) return onAuthError();
        if (alive) setLoadError(e instanceof Error ? e.message : "Não foi possível carregar o conteúdo.");
      });
    return () => {
      alive = false;
    };
  }, [store, DRAFT_KEY, onAuthError]);

  const hasDraft = useMemo(() => {
    if (!published || !content) return false;
    return JSON.stringify(published.content) !== JSON.stringify(content);
  }, [published, content]);

  /* ── rascunho: salvo na hora, neste navegador ── */
  useEffect(() => {
    if (!content || !published) return;
    try {
      if (hasDraft) localStorage.setItem(DRAFT_KEY, JSON.stringify({ content }));
      else localStorage.removeItem(DRAFT_KEY);
    } catch {}
  }, [content, hasDraft, published, DRAFT_KEY]);

  /* ── páginas e seleção ───────────────────── */
  const pages = useMemo(() => (content ? buildPages(content) : []), [content]);
  const page: Page | undefined = pages.find((p) => p.id === pageId) ?? pages[0];
  const section: Section | undefined = page?.sections.find((s) => s.id === sectionId) ?? page?.sections[0];
  const currentPath = page?.url ?? "/";
  // na página “Status do site”, a prévia mostra a tela correspondente
  const mode = content?.status?.mode ?? "online";
  const screen: "construction" | "maintenance" | null = page?.screen
    ? section?.id === "construcao"
      ? "construction"
      : section?.id === "manutencao"
        ? "maintenance"
        : mode === "online"
          ? null
          : mode
    : null;

  /* ── prévia ao vivo ──────────────────────── */
  const postPreview = useCallback(() => {
    const win = frameRef.current?.contentWindow;
    if (!win || !latest.current) return;
    const mediaBase =
      store.kind === "github" ? `https://raw.githubusercontent.com/${REPO.owner}/${REPO.repo}/${REPO.branch}/public` : undefined;
    const mediaMap: Record<string, string> = {};
    if (store.kind === "local") {
      const walk = (v: unknown) => {
        if (typeof v === "string" && v.startsWith("/uploads/")) mediaMap[v] = store.mediaUrl(v);
        else if (v && typeof v === "object") Object.values(v).forEach(walk);
      };
      walk(latest.current);
    }
    const msg: PreviewMessage = {
      type: "fc:render",
      snap: { content: latest.current },
      path: currentPath,
      screen,
      mediaBase,
      mediaMap,
    };
    win.postMessage(msg, window.location.origin);
  }, [store, currentPath, screen]);

  useEffect(() => {
    postPreview();
  }, [content, postPreview, mediaVersion]);

  /* ── edição e histórico ──────────────────── */
  const commit = useCallback((next: Content, opts?: { coalesce?: boolean }) => {
    const prev = latest.current;
    if (!prev) return;
    const now = Date.now();
    if (!opts?.coalesce || now - lastPush.current > 900) {
      past.current = [...past.current.slice(-59), prev];
      future.current = [];
    }
    lastPush.current = now;
    latest.current = next;
    setContent(next);
    setStatus("saved");
  }, []);

  const updateField = useCallback(
    (root: string, key: string, value: unknown) => {
      if (!latest.current) return;
      const path = root ? `${root}.${key}` : key;
      commit(setAt(latest.current, path, value), { coalesce: typeof value === "string" });
    },
    [commit],
  );

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev || !latest.current) return;
    future.current.push(latest.current);
    latest.current = prev;
    setContent(prev);
    force((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next || !latest.current) return;
    past.current.push(latest.current);
    latest.current = next;
    setContent(next);
    force((n) => n + 1);
  }, []);

  /* ── projetos ────────────────────────────── */
  const projects = content?.projects ?? [];

  const selectPage = useCallback((id: string, sec?: string) => {
    setPageId(id);
    const first: Record<string, string> = { home: "abertura", settings: "info", status: "situacao", archive: "cabecalho" };
    setSectionId(sec ?? first[id] ?? "capa");
    setExpanded((e) => ({ ...e, [id]: true }));
    scrollOnRender.current = true;
  }, []);

  const addCase = useCallback(() => {
    if (!latest.current) return;
    const next = { ...latest.current, projects: [...latest.current.projects, newProject()] };
    commit(next);
    selectPage(`case:${next.projects.length - 1}`, "capa");
    toast("Projeto criado. Preencha a capa e o conteúdo.");
  }, [commit, selectPage, toast]);

  const moveCase = useCallback(
    (from: number, to: number) => {
      if (!latest.current) return;
      const list = [...latest.current.projects];
      const [w] = list.splice(from, 1);
      list.splice(to, 0, w);
      commit({ ...latest.current, projects: list });
      if (pageId === `case:${from}`) setPageId(`case:${to}`);
    },
    [commit, pageId],
  );

  const duplicateCase = useCallback(
    (i: number) => {
      if (!latest.current) return;
      const src = latest.current.projects[i];
      const copy: Project = {
        ...src,
        deliverables: [...src.deliverables],
        gallery: src.gallery.map((g) => ({ ...g })),
        client: `${src.client} (cópia)`,
        slug: `${src.slug}-copia`,
      };
      const list = [...latest.current.projects];
      list.splice(i + 1, 0, copy);
      commit({ ...latest.current, projects: list });
      selectPage(`case:${i + 1}`, "capa");
    },
    [commit, selectPage],
  );

  const deleteCase = useCallback(
    (i: number) => {
      if (!latest.current) return;
      const w = latest.current.projects[i];
      const used = latest.current.pieces.filter((p) => p.project === w.slug).length;
      const warn = used ? ` ${used} peça(s) do mosaico apontam para ele e também serão removidas.` : "";
      if (!window.confirm(`Excluir o projeto “${w.client}”?${warn} Dá para desfazer com ${mod}+Z antes de publicar.`)) return;
      commit({
        ...latest.current,
        projects: latest.current.projects.filter((_, j) => j !== i),
        pieces: latest.current.pieces.filter((p) => p.project !== w.slug),
      });
      selectPage("home", "pecas");
    },
    [commit, selectPage],
  );

  /* ── publicar / descartar ────────────────── */
  const publish = useCallback(async () => {
    if (!latest.current) return;
    setStatus("publishing");
    const snap = { content: latest.current };
    try {
      await store.publish(snap);
      setPublished(snap);
      setStatus("published");
      toast(
        store.kind === "github"
          ? "Publicado! O site atualiza sozinho em cerca de 2 minutos."
          : "Publicado no modo local (teste). Nada foi ao ar.",
        store.kind === "github" ? "/" : undefined,
      );
    } catch (e) {
      setStatus("error");
      fail(e, "Não foi possível publicar. Tente de novo.");
    }
  }, [store, toast, fail]);

  const discard = useCallback(() => {
    if (!published) return;
    if (!window.confirm("Descartar todas as alterações não publicadas? Isso não pode ser desfeito.")) return;
    past.current = [];
    future.current = [];
    latest.current = published.content;
    setContent(published.content);
    setStatus("idle");
    if (!buildPages(published.content).some((p) => p.id === pageId)) selectPage("home");
    toast("Alterações descartadas. Você está vendo a versão publicada.");
  }, [published, pageId, selectPage, toast]);

  const logout = useCallback(() => {
    if (!window.confirm("Sair do editor neste navegador? Suas alterações não publicadas continuam guardadas aqui.")) return;
    setToken(null);
    window.location.reload();
  }, []);

  /* ── atalhos ─────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const m = isMac ? e.metaKey : e.ctrlKey;
      if (!m) return;
      const k = e.key.toLowerCase();
      if (k === "s") {
        e.preventDefault();
        toast("O rascunho já fica salvo sozinho. Para colocar no ar, clique em Publicar.");
      } else if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((k === "z" && e.shiftKey) || k === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [redo, undo, toast]);

  /* ── canvas ──────────────────────────────── */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCanvas({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [content === null]);

  const devW = DEVICES[device].w;
  const devH = DEVICES[device].h;
  const pad = 32;
  const barH = 44;
  const scale = Math.min(1, (canvas.w - pad * 2) / devW, (canvas.h - barH - pad) / devH);
  const frameH = devH;

  /* ── ponte com a prévia (iframe) ─────────── */
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const pageIdRef = useRef(pageId);
  pageIdRef.current = pageId;
  const sectionIdRef = useRef(sectionId);
  sectionIdRef.current = sectionId;

  const selectByTarget = useRef<(t: string) => void>(() => {});
  selectByTarget.current = (target: string) => {
    if (!page) return;
    const s = page.sections.find((x) => x.target === target);
    if (s) return setSectionId(s.id);
    const settings = pages.find((p) => p.id === "settings");
    const g = settings?.sections.find((x) => x.target === target);
    if (g) selectPage("settings", g.id);
  };
  const openPath = useRef<(path: string) => void>(() => {});
  openPath.current = (path: string) => {
    const idx = projects.findIndex((w) => `/trabalho/${w.slug}` === path);
    if (idx >= 0) selectPage(`case:${idx}`, "capa");
    else if (path === "/trabalho") selectPage("archive", "cabecalho");
    else if (path === "/" || path.startsWith("/#")) selectPage("home", "abertura");
  };

  const markSelected = useCallback((scroll = false) => {
    const doc = frameRef.current?.contentDocument;
    const win = frameRef.current?.contentWindow;
    if (!doc || !win) return;
    const pg = pagesRef.current.find((p) => p.id === pageIdRef.current);
    const sec = pg?.sections.find((s) => s.id === sectionIdRef.current) ?? pg?.sections[0];
    const sel = doc.getElementById("ed-selected-style");
    const target = sec?.target ? CSS.escape(sec.target) : null;
    if (sel) {
      sel.textContent = target
        ? `[data-edit="${target}"],[data-edit="${target}"]:hover{outline:2px solid #BDE2F8!important;outline-offset:-2px}`
        : "";
    }
    if (!target || !scroll) return;
    const el = doc.querySelector<HTMLElement>(`[data-edit="${target}"]`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + win.scrollY - (el.hasAttribute("data-hero") ? 0 : 68);
    win.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  // mensagens da prévia: pronta para receber / terminou de desenhar
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frameRef.current?.contentWindow) return;
      if (e.data?.type === "fc:ready") postPreview();
      if (e.data?.type === "fc:rendered") {
        setLoadingFrame(false);
        markSelected(scrollOnRender.current);
        scrollOnRender.current = false;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [postPreview, markSelected]);

  const onFrameLoad = useCallback(() => {
    const win = frameRef.current?.contentWindow;
    const doc = frameRef.current?.contentDocument;
    if (!win || !doc) return;

    const style = doc.createElement("style");
    style.textContent = `
      [data-edit]{cursor:pointer}
      [data-edit]:hover{outline:2px dashed rgba(213,229,56,.95);outline-offset:-2px}
      .ed-tag{position:absolute;z-index:9999;pointer-events:none;background:#D5E538;color:#1C1B1A;font:500 11px/1 "IBM Plex Mono",monospace;padding:5px 7px;letter-spacing:.02em}
    `;
    doc.head.appendChild(style);
    const sel = doc.createElement("style");
    sel.id = "ed-selected-style";
    doc.head.appendChild(sel);
    const tag = doc.createElement("div");
    tag.className = "ed-tag";
    tag.hidden = true;
    doc.documentElement.appendChild(tag);

    const labelOf = (t: string) =>
      pagesRef.current.find((p) => p.id === pageIdRef.current)?.sections.find((s) => s.target === t)?.label;

    doc.addEventListener("mouseover", (e) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-edit]");
      if (!el) return void (tag.hidden = true);
      const r = el.getBoundingClientRect();
      const label = labelOf(el.dataset.edit!);
      tag.textContent = label ? `Editar · ${label}` : "Editar";
      tag.style.left = `${r.left + win.scrollX + 8}px`;
      tag.style.top = `${Math.max(r.top, 76) + win.scrollY + 8}px`;
      tag.hidden = false;
    });
    doc.addEventListener(
      "click",
      (e) => {
        const a = (e.target as HTMLElement).closest("a");
        if (a) {
          e.preventDefault();
          const href = a.getAttribute("href") || "";
          if (href.startsWith("/") && !href.startsWith("/#")) {
            openPath.current(href.split("#")[0]);
            return;
          }
        }
        const el = (e.target as HTMLElement).closest<HTMLElement>("[data-edit]");
        if (el) {
          e.preventDefault();
          selectByTarget.current(el.dataset.edit!);
        }
      },
      true,
    );
    postPreview();
  }, [postPreview]);

  useEffect(() => {
    scrollOnRender.current = true;
    markSelected(true);
  }, [sectionId, pageId, markSelected]);

  /* ── render ──────────────────────────────── */
  if (loadError) {
    return (
      <div className="ed-loading">
        <Mark className="ed-loading-mark" />
        <span>{loadError}</span>
        <button type="button" className="ed-btn ed-btn-ghost" onClick={() => window.location.reload()}>
          Tentar de novo
        </button>
      </div>
    );
  }
  if (!content || !page || !section) return <Loading />;

  const mediaCtx = { store, onUploaded: () => setMediaVersion((v) => v + 1) };

  const caseIndex = page.group === "cases" ? Number(page.id.split(":")[1]) : -1;
  const sectionData = (getAt(content, section.root) as Record<string, unknown>) ?? {};
  const dataForFields = section.id === "pecas" ? { ...sectionData, __projects: projects } : sectionData;

  const statusText: Record<Status, string> = {
    idle: hasDraft ? "Alterações não publicadas" : "Tudo publicado",
    saved: hasDraft ? "Rascunho salvo neste navegador" : "Tudo publicado",
    error: "Erro ao publicar — tente de novo",
    publishing: "Publicando…",
    published: hasDraft ? "Alterações não publicadas" : "Publicado",
  };

  const canPublish = hasDraft;

  return (
    <MediaContext.Provider value={mediaCtx}>
    <div className="ed">
      {/* Barra superior */}
      <header className="ed-top">
        <div className="ed-top-left">
          <a href="/admin" className="ed-brand" aria-label="Painel do portfólio">
            <Mark className="ed-brand-mark" />
            <span>Painel</span>
          </a>
          <label className="ed-page-select">
            <span className="sr-only">Página</span>
            <select value={page.id} onChange={(e) => selectPage(e.target.value)}>
              <optgroup label="Páginas">
                {pages
                  .filter((p) => p.group === "pages")
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Projetos">
                {pages
                  .filter((p) => p.group === "cases")
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Site">
                <option value="status">Status do site</option>
                <option value="settings">Configurações</option>
              </optgroup>
            </select>
          </label>
          {mode !== "online" && (
            <button type="button" className="ed-offline" onClick={() => selectPage("status", "situacao")} title="Visitantes não estão vendo o site">
              <i aria-hidden="true" />
              {mode === "construction" ? "Em construção" : "Em manutenção"}
            </button>
          )}
        </div>

        <div className="ed-top-center">
          <div className="ed-seg is-dark" role="group" aria-label="Tamanho da prévia">
            {(Object.keys(DEVICES) as Device[]).map((d) => (
              <button key={d} type="button" aria-pressed={device === d} onClick={() => setDevice(d)} title={DEVICES[d].label}>
                <DeviceIcon d={d} />
                <span className="sr-only">{DEVICES[d].label}</span>
              </button>
            ))}
          </div>
          <div className="ed-history">
            <button type="button" className="ed-icon-btn is-dark" onClick={undo} disabled={!past.current.length} title={`Desfazer (${mod}+Z)`}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M6 4 3 7l3 3M3.5 7H10a3 3 0 0 1 0 6H8" stroke="currentColor" strokeWidth="1.4" fill="none" />
              </svg>
              <span className="sr-only">Desfazer</span>
            </button>
            <button type="button" className="ed-icon-btn is-dark" onClick={redo} disabled={!future.current.length} title={`Refazer (${mod}+Shift+Z)`}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10 4l3 3-3 3M12.5 7H6a3 3 0 0 0 0 6h2" stroke="currentColor" strokeWidth="1.4" fill="none" />
              </svg>
              <span className="sr-only">Refazer</span>
            </button>
          </div>
        </div>

        <div className="ed-top-right">
          <span className={`ed-status is-${status}`} role="status" aria-live="polite">
            <i aria-hidden="true" />
            {statusText[status]}
          </span>
          <a className="ed-btn ed-btn-dark" href={currentPath} target="_blank" rel="noreferrer" title="Abre o site publicado">
            Ver site
          </a>
          {hasDraft && (
            <button type="button" className="ed-btn ed-btn-dark" onClick={discard}>
              Descartar
            </button>
          )}
          <button type="button" className="ed-btn ed-btn-accent" onClick={publish} disabled={!canPublish || status === "publishing"}>
            Publicar
          </button>
          <button type="button" className="ed-icon-btn is-dark" onClick={logout} title="Sair">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 3H3v10h3M10 5l3 3-3 3M13 8H6" stroke="currentColor" strokeWidth="1.4" fill="none" />
            </svg>
            <span className="sr-only">Sair</span>
          </button>
        </div>
      </header>

      {/* Árvore de páginas */}
      <nav className="ed-tree" aria-label="Páginas e seções">
        <TreeGroup title="Páginas">
          {pages
            .filter((p) => p.group === "pages")
            .map((p) => (
              <TreePage
                key={p.id}
                page={p}
                active={p.id === page.id}
                sectionId={section.id}
                open={expanded[p.id] ?? false}
                onToggle={() => setExpanded((e) => ({ ...e, [p.id]: !e[p.id] }))}
                onSelect={(sid) => selectPage(p.id, sid)}
              />
            ))}
        </TreeGroup>

        <TreeGroup
          title={`Projetos · ${projects.length}`}
          action={
            <button type="button" className="ed-link" onClick={addCase}>
              + Novo
            </button>
          }
        >
          {pages
            .filter((p) => p.group === "cases")
            .map((p, i) => (
              <TreePage
                key={p.id}
                page={p}
                thumb={projects[i]?.cover?.src}
                active={p.id === page.id}
                sectionId={section.id}
                open={expanded[p.id] ?? false}
                onToggle={() => setExpanded((e) => ({ ...e, [p.id]: !e[p.id] }))}
                onSelect={(sid) => selectPage(p.id, sid)}
              />
            ))}
        </TreeGroup>

        <TreeGroup title="Site">
          {pages
            .filter((p) => p.group === "settings")
            .map((p) => (
              <TreePage
                key={p.id}
                page={p}
                active={p.id === page.id}
                sectionId={section.id}
                open={expanded[p.id] ?? true}
                onToggle={() => setExpanded((e) => ({ ...e, [p.id]: !(e[p.id] ?? true) }))}
                onSelect={(sid) => selectPage(p.id, sid)}
              />
            ))}
        </TreeGroup>

        <p className="ed-tree-tip">
          Dica: clique em qualquer seção da prévia para editá-la. {mod}+S salva, {mod}+Z desfaz.
        </p>
      </nav>

      {/* Prévia */}
      <div className="ed-canvas" ref={canvasRef}>
        <div className="ed-canvas-bar">
          <span className="ed-url">
            <span className="ed-url-dot" aria-hidden="true" />
            {store.kind === "local" ? "modo local · " : ""}
            {currentPath === "/" ? "página inicial" : currentPath}
            {section.anchor ? <em>#{section.anchor}</em> : null}
          </span>
          <span className="ed-canvas-size">
            {devW}px{scale < 1 ? ` · ${Math.round(scale * 100)}%` : ""}
          </span>
        </div>
        <div
          className="ed-frame-wrap"
          style={{ width: devW * scale, height: frameH * scale }}
          data-loading={loadingFrame}
        >
          <iframe
            ref={frameRef}
            src={PREVIEW_URL}
            title="Prévia do site"
            onLoad={onFrameLoad}
            style={{ width: devW, height: frameH, transform: `scale(${scale})` }}
          />
        </div>
      </div>

      {/* Inspetor */}
      <aside className="ed-inspector" aria-label="Propriedades da seção">
          <>
        <div className="ed-insp-head">
          <p className="ed-crumbs">
            {page.label}
            <span aria-hidden="true">/</span>
          </p>
          <h2>{section.label}</h2>
          <div className="ed-insp-meta">
            {section.anchor && <span className="ed-chip">#{section.anchor}</span>}
            {section.global && <span className="ed-chip is-global">Global</span>}
          </div>
          {section.note && <p className="ed-note">{section.note}</p>}
          {page.sections.length > 1 && (
            <div className="ed-tabs" role="tablist" aria-label="Seções da página">
              {page.sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={s.id === section.id}
                  onClick={() => setSectionId(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ed-insp-body" key={`${page.id}-${section.id}`}>
          {section.fields.map((f) => (
            <FieldView
              key={"key" in f ? f.key : f.kind === "heading" ? f.label : f.kind}
              field={f}
              data={dataForFields}
              onChange={(k, v) => updateField(section.root, k, v)}
              onOpenCase={(i) => selectPage(`case:${i}`, "capa")}
              onAddCase={addCase}
              onMoveCase={moveCase}
            />
          ))}

          {caseIndex >= 0 && section.id === "capa" && (
            <div className="ed-case-actions">
              <span className="ed-label">Projeto</span>
              <div className="ed-row">
                <button type="button" className="ed-btn ed-btn-ghost" disabled={caseIndex === 0} onClick={() => moveCase(caseIndex, caseIndex - 1)}>
                  Mover antes
                </button>
                <button
                  type="button"
                  className="ed-btn ed-btn-ghost"
                  disabled={caseIndex === projects.length - 1}
                  onClick={() => moveCase(caseIndex, caseIndex + 1)}
                >
                  Mover depois
                </button>
                <button type="button" className="ed-btn ed-btn-ghost" onClick={() => duplicateCase(caseIndex)}>
                  Duplicar
                </button>
              </div>
              <button type="button" className="ed-btn ed-btn-danger" onClick={() => deleteCase(caseIndex)}>
                Excluir projeto
              </button>
            </div>
          )}
        </div>
          </>
      </aside>

      <div className="ed-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="ed-toast">
            {t.text}
            {t.href && (
              <a href={t.href} target="_blank" rel="noreferrer">
                Ver site
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
    </MediaContext.Provider>
  );
}

function TreeGroup({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="ed-tree-group">
      <header>
        <h3>{title}</h3>
        {action}
      </header>
      <ul>{children}</ul>
    </section>
  );
}

function TreePage({
  page,
  thumb,
  active,
  sectionId,
  open,
  onToggle,
  onSelect,
}: {
  page: Page;
  thumb?: string;
  active: boolean;
  sectionId: string;
  open: boolean;
  onToggle: () => void;
  onSelect: (sectionId: string) => void;
}) {
  return (
    <li className={`ed-tree-page ${active ? "is-active" : ""}`}>
      <div className="ed-tree-row">
        <button type="button" className="ed-tree-caret" aria-expanded={open} onClick={onToggle} aria-label={open ? "Recolher" : "Expandir"}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
        <button type="button" className="ed-tree-label" onClick={() => onSelect(page.sections[0].id)}>
          {page.group === "cases" ? (
            <Thumb src={thumb} className="is-mini" />
          ) : (
            <svg className="ed-tree-icon" viewBox="0 0 16 16" aria-hidden="true">
              {page.group === "settings" ? (
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" strokeWidth="1.2" fill="none" />
              ) : (
                <path d="M3.5 2.5h6l3 3v8h-9zM9.5 2.5v3h3" stroke="currentColor" strokeWidth="1.2" fill="none" />
              )}
            </svg>
          )}
          <span>{page.label}</span>
        </button>
      </div>
      {open && (
        <ul className="ed-tree-sections">
          {page.sections.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                aria-current={active && s.id === sectionId ? "true" : undefined}
                onClick={() => onSelect(s.id)}
              >
                <span>{s.label}</span>
                {s.anchor && <em>#{s.anchor}</em>}
                {s.global && !s.anchor && <em>global</em>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function DeviceIcon({ d }: { d: Device }) {
  if (d === "desktop")
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M1.5 3h13v8h-13zM6 14h4M8 11v3" stroke="currentColor" strokeWidth="1.3" fill="none" />
      </svg>
    );
  if (d === "tablet")
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3.5 1.5h9v13h-9zM7 12.5h2" stroke="currentColor" strokeWidth="1.3" fill="none" />
      </svg>
    );
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5 1.5h6v13H5zM7.3 12.5h1.4" stroke="currentColor" strokeWidth="1.3" fill="none" />
    </svg>
  );
}
