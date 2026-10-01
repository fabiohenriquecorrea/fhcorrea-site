"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { resolveMedia } from "@/lib/media-url";
import { FRONTS, type Content, type Front, type Piece } from "@/lib/types";
import { ArrowRight, ArrowUpRight } from "./Icons";

type Filter = "Tudo" | Front;
type Options = Pick<Content["work"], "showFilters" | "showFront" | "showTitle" | "limit" | "showMore" | "moreLabel">;

export function WorkMosaic({
  pieces,
  clients,
  options,
  total,
}: {
  pieces: Piece[];
  clients: Record<string, string>;
  options: Options;
  /** número de projetos, mostrado no card “ver mais” */
  total: number;
}) {
  const [filter, setFilter] = useState<Filter>("Tudo");
  const shown = useMemo(() => pieces.filter((p) => !p.hidden && p.image), [pieces]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Tudo: shown.length };
    for (const p of shown) c[p.front] = (c[p.front] ?? 0) + 1;
    return c;
  }, [shown]);

  const active = options.showFilters ? filter : "Tudo";
  const filtered = active === "Tudo" ? shown : shown.filter((p) => p.front === active);
  const limit = Math.max(1, options.limit || shown.length);
  const visible = active === "Tudo" ? filtered.slice(0, limit) : filtered;
  const filters: Filter[] = ["Tudo", ...FRONTS.filter((f) => counts[f])];
  const labels = options.showFront || options.showTitle;

  const choose = (f: Filter) => {
    if (f === filter) return;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (doc.startViewTransition && !reduce) doc.startViewTransition(() => flushSync(() => setFilter(f)));
    else setFilter(f);
  };

  return (
    <div className="mosaic-wrap">
      {options.showFilters && filters.length > 2 && (
        <div className="mosaic-bar">
          <div className="filters" role="group" aria-label="Filtrar por frente">
            {filters.map((f) => (
              <button key={f} type="button" className="filter" aria-pressed={active === f} onClick={() => choose(f)}>
                {f}
                <span className="count">{counts[f]}</span>
              </button>
            ))}
          </div>
          <p className="mosaic-count" aria-live="polite">
            {visible.length} {visible.length === 1 ? "peça" : "peças"}
          </p>
        </div>
      )}

      <ul className={`mosaic ${labels ? "" : "is-bare"}`}>
        {visible.map((p, i) => (
          <li
            key={`${p.image}-${i}`}
            className={`tile tile-${p.size}`}
            style={{ viewTransitionName: `tile-${p.image.replace(/\W/g, "")}`.slice(0, 60), ["--i" as string]: i }}
          >
            <Link href={`/trabalho/${p.project}`} className="tile-link" aria-label={labels ? undefined : `${p.title} — ${clients[p.project] ?? ""}`}>
              <div className="tile-media">
                <Image
                  src={resolveMedia(p.image)}
                  alt={p.alt}
                  fill
                  sizes={p.size === "lg" || p.size === "wide" ? "(max-width: 1000px) 100vw, 50vw" : "(max-width: 1000px) 50vw, 25vw"}
                />
              </div>
              {labels && (
                <div className="tile-info">
                  {options.showFront && (
                    <span className="tile-front">
                      {p.front}
                      <span className="tile-client"> · {clients[p.project]}</span>
                    </span>
                  )}
                  {options.showTitle && <h3>{p.title}</h3>}
                </div>
              )}
              <span className="tile-go" aria-hidden="true">
                <ArrowUpRight />
              </span>
            </Link>
          </li>
        ))}

        {options.showMore && (
          <li className="tile tile-sm tile-more" style={{ viewTransitionName: "tile-more", ["--i" as string]: visible.length }}>
            <Link href="/trabalho" className="tile-more-link">
              <span className="tile-more-count">
                {total} {total === 1 ? "projeto" : "projetos"}
              </span>
              <strong>{options.moreLabel || "Ver todos os trabalhos"}</strong>
              <ArrowRight className="tile-more-arrow" />
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
