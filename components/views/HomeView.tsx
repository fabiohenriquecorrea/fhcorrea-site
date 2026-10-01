import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "@/components/Eyebrow";
import { HeroGallery } from "@/components/HeroGallery";
import { ArrowDown, ArrowRight } from "@/components/Icons";
import { MARK_PATH } from "@/components/Logo";
import { VariableProximity } from "@/components/VariableProximity";
import { WorkMosaic } from "@/components/WorkMosaic";
import { resolveMedia } from "@/lib/media-url";
import type { Content } from "@/lib/types";

export function HomeView({ content }: { content: Content }) {
  const { site, hero, work, pieces, projects, ideato, about, journey, jobs, freelance, skills, courses } = content;
  const clients = Object.fromEntries(projects.map((p) => [p.slug, p.short]));

  const heroCopy = (
    <div className="hero-copy">
      <Eyebrow>{hero.kicker}</Eyebrow>
      <VariableProximity
        as="h1"
        id="hero-title"
        className="t-display"
        rest={hero.background === "silver" ? 380 : 300}
        peak={900}
        intro
        lines={[[{ text: hero.title1 }], [{ text: hero.title2 }], [{ text: hero.pill }]]}
      />
      <p className="t-lead">{hero.lead}</p>
      <a href="#trabalho" className={`btn ${hero.background === "silver" ? "btn-primary" : "btn-accent"}`}>
        {hero.ctaPrimary} <ArrowDown />
      </a>
    </div>
  );

  return (
    <>
      {/* ── Abertura: imagens/vídeos como fundo, ou o prata da identidade ── */}
      {hero.background === "silver" ? (
        <section
          id="inicio"
          className="hero hero-silver grain"
          data-hero
          data-hero-tone="light"
          data-edit="hero"
          aria-labelledby="hero-title"
        >
          {/* o traço é desenhado e depois vira marca: contorno em tinta, preenchimento em lima */}
          <svg className="hero-burst" viewBox="-3 -3 107.43 68.72" aria-hidden="true">
            <path className="burst-fill" d={MARK_PATH} />
            <path className="burst-line" d={MARK_PATH} pathLength={1} />
          </svg>
          <div className="wrap hero-grid">{heroCopy}</div>
        </section>
      ) : (
        <section id="inicio" className="hero on-night" data-hero data-night data-edit="hero" aria-labelledby="hero-title">
          <svg className="hero-lines" viewBox="-3 -3 107.43 68.72" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
            <path d={MARK_PATH} pathLength={1} />
          </svg>
          <div className="wrap hero-grid">{heroCopy}</div>
          <HeroGallery slides={hero.slides} interval={Math.max(3, hero.interval || 6)} />
        </section>
      )}

      {/* ── As peças ───────────────────────── */}
      <section id="trabalho" className="section" data-edit="work" aria-labelledby="trabalho-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <Eyebrow>{work.kicker}</Eyebrow>
              <VariableProximity
                id="trabalho-title"
                className="t-h1"
                lines={[[{ text: work.title1 }], [{ text: work.title2 }]]}
              />
            </div>
            <p>{work.intro}</p>
          </div>
          <WorkMosaic pieces={pieces} clients={clients} options={work} total={projects.length} />
        </div>
      </section>

      {/* ── Uma vertente: Ideato ───────────── */}
      <section id="ideato" className="band" data-parallax data-night data-edit="ideato" aria-labelledby="ideato-title">
        {ideato.image && <Image src={resolveMedia(ideato.image)} alt={ideato.alt} fill sizes="100vw" />}
        <div className="wrap">
          <div>
            <Eyebrow>{ideato.kicker}</Eyebrow>
            <VariableProximity
              id="ideato-title"
              className="t-h1"
              rest={420}
              lines={[[{ text: ideato.title1 }], [{ text: ideato.title2, className: "hl" }]]}
            />
          </div>
          <div className="band-side">
            <p>{ideato.text}</p>
            <Link href={ideato.href} className="btn btn-outline">
              {ideato.cta} <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quem desenha (lima) ────────────── */}
      <section id="sobre" className="section section-lima" data-edit="about" aria-labelledby="sobre-title">
        <svg className="lima-rays" viewBox="0 0 101.43 62.72" aria-hidden="true">
          <path d={MARK_PATH} />
        </svg>
        <div className="wrap studio">
          <figure className="studio-figure portrait">
            <div className="frame">
              {about.image && (
                <Image src={resolveMedia(about.image)} alt={about.alt} fill sizes="(max-width: 900px) 440px, 36vw" />
              )}
              <svg className="portrait-mark" viewBox="0 0 101.43 62.72" aria-hidden="true">
                <path d={MARK_PATH} />
              </svg>
            </div>
          </figure>

          <div className="studio-copy">
            <Eyebrow>{about.kicker}</Eyebrow>
            <VariableProximity
              id="sobre-title"
              className="t-h1"
              lines={[[{ text: about.title1 }], [{ text: about.title2 }]]}
            />
            <p className="t-lead">{about.lead}</p>
            {about.body.filter(Boolean).map((p, i) => (
              <p className="t-body" key={i}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── O caminho (céu) ────────────────── */}
      <section id="trajetoria" className="section section-ceu" data-edit="journey" aria-labelledby="trajetoria-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <Eyebrow>{journey.kicker}</Eyebrow>
              <VariableProximity
                id="trajetoria-title"
                className="t-h1"
                lines={[[{ text: journey.title1 }], [{ text: journey.title2 }]]}
              />
            </div>
            <p>{journey.intro}</p>
          </div>

          <ol className="timeline">
            {jobs.map((j, i) => (
              <li key={`${j.place}-${i}`} data-reveal style={{ ["--d" as string]: i * 80 }}>
                <span className="timeline-period mono">{j.period}</span>
                <div>
                  <h3 className="t-h3">{j.place}</h3>
                  <p className="timeline-role">{j.role}</p>
                </div>
                <p className="t-body">{j.text}</p>
              </li>
            ))}
          </ol>

          <div className="craft">
            <div data-reveal>
              <h3 className="label">{freelance.title}</h3>
              <ul className="clients">
                {freelance.clients.map((c, i) => (
                  <li key={`${c.name}-${i}`}>
                    <strong>{c.name}</strong>
                    <span>{c.scope}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div data-reveal style={{ ["--d" as string]: 100 }}>
              <h3 className="label">Ferramentas</h3>
              <div className="skill-groups">
                {skills.map((g, gi) => (
                  <div key={`${g.group}-${gi}`}>
                    <p className="skill-group">{g.group}</p>
                    <ul className="skill-list">
                      {g.items.filter(Boolean).map((s) => (
                        <li key={s} className="chip">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div data-reveal style={{ ["--d" as string]: 200 }}>
              <h3 className="label">Cursos</h3>
              <ul className="checklist">
                {courses.map((c, i) => (
                  <li key={`${c.name}-${i}`}>
                    {c.name} <span className="course-school">{c.school}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
