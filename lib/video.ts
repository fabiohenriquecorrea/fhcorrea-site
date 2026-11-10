import { parseVimeo, vimeoPlayerUrl } from "./vimeo";

export type VideoKind = "vimeo" | "youtube" | "file" | "link";
export type ParsedVideo = { kind: VideoKind; embed?: string; href: string; host: string };

/** YouTube: watch?v=, youtu.be/, /shorts/, /embed/, /live/ */
function youtubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
  if (!host.endsWith("youtube.com") && !host.endsWith("youtube-nocookie.com")) return null;
  if (url.searchParams.get("v")) return url.searchParams.get("v");
  const m = url.pathname.match(/\/(shorts|embed|live)\/([\w-]{6,})/);
  return m ? m[2] : null;
}

/**
 * Entende o link colado no painel: Vimeo e YouTube viram player dentro da página,
 * arquivo de vídeo toca direto e qualquer outro endereço vira um link “Assistir”.
 */
export function parseVideo(raw: string): ParsedVideo | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^\/[^/]/.test(v) && /\.(mp4|webm|mov)$/i.test(v)) return { kind: "file", href: v, embed: v, host: "" };
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  const vimeo = parseVimeo(url.href);
  if (vimeo) return { kind: "vimeo", href: url.href, embed: vimeoPlayerUrl(vimeo), host };
  const yt = youtubeId(url);
  if (yt) {
    const q = new URLSearchParams({ rel: "0", modestbranding: "1" });
    return { kind: "youtube", href: url.href, embed: `https://www.youtube-nocookie.com/embed/${yt}?${q}`, host };
  }
  if (/\.(mp4|webm|mov)$/i.test(url.pathname)) return { kind: "file", href: url.href, embed: url.href, host };
  return { kind: "link", href: url.href, host };
}
