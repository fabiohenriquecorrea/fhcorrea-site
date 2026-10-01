import { socialItems } from "@/lib/social";
import { styleVars } from "@/lib/style";
import type { Content, StatusScreen as Screen } from "@/lib/types";
import { resolveMedia } from "@/lib/media-url";
import { ArrowUpRight } from "./Icons";
import { MARK_PATH, Mark, Wordmark } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { VariableProximity } from "./VariableProximity";

/** Tela única exibida aos visitantes quando o site está em construção ou em manutenção. */
export function StatusScreen({ screen, content }: { screen: Screen; content: Content }) {
  const { site } = content;
  const items = socialItems(content.socials);
  return (
    <main className="status on-night" data-night style={styleVars(content.style)}>
      {screen.image && (
        <div className="status-bg" aria-hidden="true" style={{ opacity: Math.min(70, Math.max(0, screen.opacity)) / 100 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolveMedia(screen.image)} alt="" />
        </div>
      )}
      <svg className="status-lines" viewBox="-3 -3 107.43 68.72" aria-hidden="true">
        <path d={MARK_PATH} pathLength={1} />
      </svg>

      <header className="wrap status-top">
        <span className="brand" aria-label={site.name}>
          <Mark className="mark" />
          <Wordmark className="word" />
        </span>
        {screen.note && (
          <span className="status-note">
            <i aria-hidden="true" />
            {screen.note}
          </span>
        )}
      </header>

      <section className="wrap status-body" aria-labelledby="status-title">
        <VariableProximity
          as="h1"
          id="status-title"
          className="t-display"
          rest={300}
          peak={900}
          intro
          lines={[[{ text: screen.title1 }], [{ text: screen.title2, className: "hl" }]]}
        />
        {screen.text && <p className="t-lead">{screen.text}</p>}
        {screen.showContact && (
          <div className="status-actions">
            {site.email && (
              <a className="btn btn-accent" href={`mailto:${site.email}`}>
                {site.email} <ArrowUpRight />
              </a>
            )}
            <SocialLinks socials={items} />
          </div>
        )}
      </section>

      <footer className="wrap status-foot">
        <span>{site.base}</span>
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
      </footer>
    </main>
  );
}
