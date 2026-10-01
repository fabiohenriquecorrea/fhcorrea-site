import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "@/components/Eyebrow";
import { ArrowLeft, ArrowUpRight } from "@/components/Icons";
import { VariableProximity } from "@/components/VariableProximity";
import { resolveMedia } from "@/lib/media-url";
import type { Content } from "@/lib/types";

/** Todos os projetos cadastrados, em cards — destino do “ver mais” do mosaico. */
export function ArchiveView({ content }: { content: Content }) {
  const { archive, projects } = content;
  return (
    <article>
      <header className="case-top grain" data-edit="archive">
        <div className="wrap case-hero">
          <nav className="crumbs" aria-label="Você está em">
            <Link href="/#trabalho" className="arrow-link">
              <ArrowLeft /> <span>Início</span>
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Trabalhos</span>
          </nav>
          <div className="row">
            <div>
              <Eyebrow>{archive.kicker}</Eyebrow>
              <VariableProximity
                as="h1"
                className="t-h1"
                lines={[[{ text: archive.title1 }], [{ text: archive.title2 }]]}
              />
            </div>
            <p>{archive.intro}</p>
          </div>
        </div>
      </header>

      <section className="wrap section archive" aria-label="Projetos">
        <ul className="archive-grid">
          {projects.map((p, i) => (
            <li key={p.slug} data-reveal style={{ ["--d" as string]: (i % 3) * 80 }}>
              <Link href={`/trabalho/${p.slug}`} className="archive-card">
                <span className="archive-thumb">
                  {p.cover.src && (
                    <Image src={resolveMedia(p.cover.src)} alt={p.cover.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                  )}
                  <span className="tile-go" aria-hidden="true">
                    <ArrowUpRight />
                  </span>
                </span>
                <span className="archive-meta">
                  <span className="label">
                    {p.fronts.join(" · ")}
                    {p.year ? ` · ${p.year}` : ""}
                  </span>
                  <strong>{p.client}</strong>
                  <span className="archive-summary">{p.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
