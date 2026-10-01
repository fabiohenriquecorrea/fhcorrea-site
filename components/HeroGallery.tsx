"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { resolveMedia } from "@/lib/media-url";
import { isVideo, type Slide } from "@/lib/types";
import { isVimeo } from "@/lib/vimeo";
import { ArrowUpRight } from "./Icons";
import { VimeoBackground } from "./VimeoBackground";

type Props = { slides: Slide[]; interval?: number };

/**
 * Fundo da abertura: os próprios trabalhos (imagem, vídeo ou Vimeo) em crossfade.
 * Embaixo, a legenda leva ao projeto em tela e os traços permitem trocar de imagem.
 */
export function HeroGallery({ slides, interval = 6 }: Props) {
  const list = slides.filter((s) => s.src);
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [hidden, setHidden] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [hover, setHover] = useState(false);
  const figureRef = useRef<HTMLElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  const count = list.length;
  const current = Math.min(index, Math.max(0, count - 1));
  const paused = hidden || reduce || hover || count < 2;

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver(([e]) => setHidden(!e.isIntersecting || document.hidden));
    if (figureRef.current) io.observe(figureRef.current);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, []);

  const go = (to: number) => {
    if (to === current) return;
    setPrev(current);
    setIndex(to);
  };

  // Avança sozinho; pausa fora da tela, com a aba escondida, sob o cursor ou com movimento reduzido
  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => go((current + 1) % count), interval * 1000);
    return () => window.clearTimeout(id);
  });

  // Só o vídeo em tela toca
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === current && !hidden && !reduce) v.play().catch(() => {});
      else v.pause();
    });
  }, [current, hidden, reduce]);

  if (!count) return null;
  const slide = list[current];

  return (
    <>
      <figure ref={figureRef} className="hero-figure" aria-hidden="true">
        <div className="frame">
          {list.map((s, i) => {
            const state = i === current ? "active" : i === prev ? "leaving" : "idle";
            return (
              <div key={`${s.src}-${i}`} className="slide" data-state={state} onTransitionEnd={() => i === prev && setPrev(null)}>
                {isVimeo(s.src) ? (
                  <>
                    {s.poster && <Image src={resolveMedia(s.poster)} alt="" fill sizes="100vw" priority={i === 0} />}
                    {(i === current || i === prev) && <VimeoBackground src={s.src} />}
                  </>
                ) : isVideo(s.src) ? (
                  <video
                    ref={(el) => {
                      videos.current[i] = el;
                    }}
                    src={resolveMedia(s.src)}
                    poster={s.poster ? resolveMedia(s.poster) : undefined}
                    muted
                    loop
                    playsInline
                    preload={i === 0 ? "auto" : "metadata"}
                  />
                ) : (
                  <Image src={resolveMedia(s.src)} alt="" fill priority={i === 0} sizes="100vw" />
                )}
              </div>
            );
          })}
        </div>
      </figure>

      <div className="hero-now" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {slide.project ? (
          <Link href={`/trabalho/${slide.project}`} className="hero-now-label" key={current}>
            <span className="sr-only">Imagem de fundo: </span>
            {slide.label} <ArrowUpRight />
          </Link>
        ) : (
          <span className="hero-now-label" key={current}>
            {slide.label}
          </span>
        )}
        {count > 1 && (
          <div className="hero-dots" role="group" aria-label="Imagens de fundo">
            {list.map((s, i) => (
              <button
                key={`${s.src}-${i}`}
                type="button"
                className="hero-dot"
                aria-label={`Mostrar ${s.label}`}
                aria-pressed={i === current}
                onClick={() => go(i)}
              >
                <i style={i === current ? { animationDuration: `${interval}s`, animationPlayState: paused ? "paused" : "running" } : undefined} />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
