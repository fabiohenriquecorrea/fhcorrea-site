import { ArrowUpRight } from "./Icons";

type Item = { network: string; href: string; label: string; value: string };

/** Contatos em texto: rótulo pequeno + link com seta, como no restante do rodapé. */
export function SocialLinks({ socials }: { socials: Item[] }) {
  if (!socials.length) return null;
  return (
    <ul className="contact-links">
      {socials.map((s, i) => (
        <li key={`${s.network}-${i}`}>
          <span className="label">{s.label}</span>
          <a href={s.href} target={s.network === "email" ? undefined : "_blank"} rel="noreferrer" className="arrow-link">
            <span>{s.value}</span> <ArrowUpRight />
          </a>
        </li>
      ))}
    </ul>
  );
}
