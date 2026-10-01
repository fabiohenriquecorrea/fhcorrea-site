import { socialItems } from "@/lib/social";
import type { Content } from "@/lib/types";
import { Eyebrow } from "./Eyebrow";
import { ArrowUpRight } from "./Icons";
import { MARK_PATH, Mark, Wordmark } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { VariableProximity } from "./VariableProximity";

export function Footer({ content }: { content: Content }) {
  const { site, contact, socials } = content;
  const year = new Date().getFullYear();
  const items = socialItems(socials);

  return (
    <footer id="contato" className="site-footer on-night" data-night data-observe data-edit="contact" aria-labelledby="contato-title">
      <svg className="footer-mark" viewBox="-2 -2 105.43 66.72" aria-hidden="true">
        <path d={MARK_PATH} pathLength={1} />
      </svg>
      <div className="wrap">
        <div className="contact-block">
          <div>
            <Eyebrow>{contact.kicker}</Eyebrow>
            <VariableProximity
              id="contato-title"
              className="t-display"
              rest={300}
              lines={[[{ text: contact.title1 }], [{ text: contact.title2, className: "hl" }]]}
            />
          </div>
          <div className="contact-row">
            <div className="contact-main">
              <p>{contact.text}</p>
              {site.email && (
                <a href={`mailto:${site.email}`} className="contact-email">
                  {site.email} <ArrowUpRight />
                </a>
              )}
            </div>
            <SocialLinks socials={items} />
          </div>
        </div>

        <div className="footer-bottom">
          <a href="/" className="brand" aria-label="Fabio Correa — início">
            <Mark className="mark" />
            <Wordmark className="word" />
          </a>
          <nav aria-label="Rodapé" className="footer-nav">
            <a href="/trabalho">Trabalhos</a>
            <a href="/#sobre">Sobre</a>
            <a href="#">Voltar ao topo</a>
          </nav>
          <span>
            © {year} {site.name} · {site.base}
          </span>
        </div>
      </div>
    </footer>
  );
}
