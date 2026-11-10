import { parseVideo } from "@/lib/video";
import { resolveMedia } from "@/lib/media-url";
import type { Video } from "@/lib/types";
import { ArrowUpRight } from "./Icons";

/** Vídeos do projeto: players do Vimeo/YouTube, arquivos .mp4 ou links externos. */
export function ProjectVideos({ videos, project }: { videos: Video[]; project: string }) {
  const items = videos.map((v) => ({ ...v, parsed: parseVideo(v.url) })).filter((v) => v.parsed);
  if (!items.length) return null;

  return (
    <div className="case-videos">
      {items.map((v, i) => {
        const p = v.parsed!;
        const title = v.title || `Vídeo — ${project}`;
        const cls = `case-video ${v.vertical ? "is-vertical" : ""}`;

        if (p.kind === "link") {
          return (
            <a key={i} href={p.href} target="_blank" rel="noreferrer" className="case-video-link" data-reveal>
              <span className="case-video-play" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M8 5.5v13l10.5-6.5z" />
                </svg>
              </span>
              <span>
                <strong>{v.title || "Assistir ao vídeo"}</strong>
                <span className="label">{p.host}</span>
              </span>
              <ArrowUpRight />
            </a>
          );
        }

        return (
          <figure key={i} className={cls} data-reveal>
            <div className="case-video-frame">
              {p.kind === "file" ? (
                <video src={resolveMedia(p.embed!)} controls playsInline preload="metadata" aria-label={title} />
              ) : (
                <iframe
                  src={p.embed}
                  title={title}
                  loading="lazy"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
            </div>
            {v.title && <figcaption className="t-caption">{v.title}</figcaption>}
          </figure>
        );
      })}
    </div>
  );
}
