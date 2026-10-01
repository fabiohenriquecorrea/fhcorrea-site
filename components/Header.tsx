"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Mark, Wordmark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

type Tone = "clear" | "clear-light" | "paper" | "night";

const LINKS = [
  { href: "/#trabalho", label: "Peças" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/#trajetoria", label: "Caminho" },
  { href: "/#contato", label: "Contato" },
];

export function Header() {
  const pathname = usePathname();
  const [tone, setTone] = useState<Tone>("paper");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    let raf = 0;
    const probe = 34; // meio da barra
    const update = () => {
      raf = 0;
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      if (hero) {
        const r = hero.getBoundingClientRect();
        if (r.top <= probe && r.bottom > 68) {
          // abertura prata: tinta sobre fundo claro; com imagens: branco sobre escuro
          const light = hero.dataset.heroTone === "light";
          if (window.scrollY < 24) return setTone(light ? "clear-light" : "clear");
          return setTone(light ? "paper" : "night");
        }
      }
      const night = Array.from(
        document.querySelectorAll<HTMLElement>("[data-night]"),
      ).some((el) => {
        const r = el.getBoundingClientRect();
        // o que sobra da abertura escondido sob a barra não conta: o conteúdo já é claro
        if (el.hasAttribute("data-hero")) return r.top <= probe && r.bottom > 68;
        return r.top <= probe && r.bottom >= probe;
      });
      setTone(night ? "night" : "paper");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // a abertura pode trocar de fundo sem mudar de página (prévia do painel)
    const main = document.getElementById("conteudo");
    const mo = new MutationObserver(onScroll);
    if (main) mo.observe(main, { childList: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className="site-header"
      data-tone={open ? "paper" : tone}
      data-menu={open}
    >
      <div className="wrap bar">
        <Link href="/" className="brand" aria-label="Fabio Correa — início">
          <Mark className="mark" />
          <Wordmark className="word" />
        </Link>

        <nav
          id="site-nav"
          className="site-nav"
          data-open={open}
          aria-label="Principal"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="nav-link"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="bar-actions">
          <ThemeToggle />
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
