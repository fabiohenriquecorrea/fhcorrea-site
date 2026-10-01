"use client";

import { useEffect, useState } from "react";
import { THEME_KEY } from "@/lib/theme";

type Theme = "light" | "dark";
const KEY = THEME_KEY;

const media = () => window.matchMedia("(prefers-color-scheme: dark)");
const systemTheme = (): Theme => (media().matches ? "dark" : "light");

/**
 * Segue o tema do sistema por padrão. Se a pessoa escolher o oposto, a escolha fica
 * salva; se voltar a coincidir com o sistema, a escolha é apagada e o site volta a seguir o sistema.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const read = () =>
      (document.documentElement.dataset.theme as Theme | undefined) ??
      systemTheme();
    setTheme(read());
    const onChange = () => setTheme(read());
    const m = media();
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const apply = () => {
      try {
        if (next === systemTheme()) {
          delete root.dataset.theme;
          localStorage.removeItem(KEY);
        } else {
          root.dataset.theme = next;
          localStorage.setItem(KEY, next);
        }
      } catch {
        root.dataset.theme = next;
      }
      setTheme(next);
    };
    // troca com um crossfade da página inteira, quando o navegador suporta e o movimento é bem-vindo
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (doc.startViewTransition && !reduce) doc.startViewTransition(apply);
    else apply();
  };

  const dark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      data-theme-state={theme ?? "unknown"}
      aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
      onClick={toggle}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <mask id="theme-moon">
          <rect width="24" height="24" fill="#fff" />
          <circle className="theme-bite" cx="24" cy="4" r="7" fill="#000" />
        </mask>
        <circle
          className="theme-core"
          cx="12"
          cy="12"
          r="5"
          mask="url(#theme-moon)"
        />
        <g className="theme-rays">
          <path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
        </g>
      </svg>
    </button>
  );
}
