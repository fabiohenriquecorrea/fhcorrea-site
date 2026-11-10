import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@/components/Icons";
import { FramedImage } from "@/components/FramedImage";
import { ProjectVideos } from "@/components/ProjectVideos";
import { fitStyle } from "@/lib/framing";
import { resolveMedia } from "@/lib/media-url";
import type { Content } from "@/lib/types";

export function ProjectView({ content, slug }: { content: Content; slug: string }) {
  const { projects } = content;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];
  const deliverables = p.deliverables.filter(Boolean);

  return (
    <article>
      {/* Topo em prata, como a capa do manual */}
      <header className="case-top grain" data-edit={`case:${p.slug}:capa`}>
        <div className="wrap case-hero">
          <nav className="crumbs" aria-label="Você está em">
            <Link href="/#trabalho" className="arrow-link">
              <ArrowLeft /> <span>Todas as peças</span>
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{p.client}</span>
          </nav>
          <div className="row">
            <h1 className="t-h1">{p.title}</h1>
            <p>{p.summary}</p>
          </div>

          <dl className="case-meta">
            <div>
              <dt className="label">Cliente</dt>
              <dd>{p.client}</dd>
            </div>
            <div>
              <dt className="label">Papel</dt>
              <dd>{p.role}</dd>
            </div>
            <div>
              <dt className="label">Frentes</dt>
              <dd className="case-fronts">
                {p.fronts.map((f) => (
                  <span key={f} className="chip chip-info">
                    {f}
                  </span>
                ))}
              </dd>
            </div>
            {p.year && (
              <div>
                <dt className="label">Período</dt>
                <dd>{p.year}</dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      <div className="wrap case-cover" data-edit={`case:${p.slug}:capa`}>
        <figure className="case-media">
          <FramedImage image={p.cover} priority />
        </figure>
      </div>

      <section className="wrap section" aria-label="Sobre o projeto" data-edit={`case:${p.slug}:conteudo`}>
        <div className="case-body">
          <div data-reveal>
            <span className="label">Desafio</span>
            <h2>O que precisava mudar</h2>
            <p>{p.challenge}</p>
          </div>
          <div data-reveal style={{ ["--d" as string]: 100 }}>
            <span className="label">Decisão</span>
            <h2>O raciocínio</h2>
            <p>{p.decision}</p>
          </div>
          {deliverables.length > 0 && (
            <div data-reveal style={{ ["--d" as string]: 200 }}>
              <span className="label">Entrega</span>
              <h2>O que foi feito</h2>
              <ul className="checklist">
                {deliverables.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {(p.videos?.length ?? 0) > 0 && (
        <section className="wrap case-videos-section" aria-label="Vídeos" data-edit={`case:${p.slug}:videos`}>
          <ProjectVideos videos={p.videos!} project={p.client} />
        </section>
      )}

      {p.gallery.length > 0 && (
        <section className="wrap case-gallery" aria-label="Galeria" data-edit={`case:${p.slug}:galeria`}>
          {p.gallery.map((g, i) => (
            <figure key={`${g.src}-${i}`} className={g.wide ? "is-wide" : undefined} data-reveal>
              <FramedImage image={g} />
              {g.caption && <figcaption className="t-caption">{g.caption}</figcaption>}
            </figure>
          ))}
        </section>
      )}

      {p.link?.href && (
        <div className="wrap case-link">
          <a href={p.link.href} target="_blank" rel="noreferrer" className="arrow-link">
            <span>{p.link.label || p.link.href}</span> <ArrowUpRight />
          </a>
        </div>
      )}

      {projects.length > 1 && (
        <div className="wrap case-next-wrap">
          <Link href={`/trabalho/${next.slug}`} className="case-next">
            <span className="case-next-thumb" aria-hidden="true">
              {next.cover.src && <Image src={resolveMedia(next.cover.src)} alt="" fill sizes="160px" style={fitStyle(next.cover)} />}
            </span>
            <div>
              <span className="label">Próximo projeto · {next.fronts.join(" · ")}</span>
              <strong>{next.client}</strong>
            </div>
            <ArrowRight />
          </Link>
        </div>
      )}
    </article>
  );
}
