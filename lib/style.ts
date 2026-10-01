import type { CSSProperties } from "react";
import type { Content, Corner } from "./types";

const BUTTON: Record<Corner, string> = { square: "0px", soft: "6px", round: "12px", pill: "999px" };
const CARD: Record<Corner, string> = { square: "0px", soft: "6px", round: "14px", pill: "24px" };

/** Variáveis de “estilo” aplicadas ao site inteiro (cantos e tamanho da logo). */
export function styleVars(style: Content["style"] | undefined): CSSProperties {
  const s = style ?? { buttons: "square", cards: "square", logoScale: 100 };
  return {
    ["--r-btn" as string]: BUTTON[s.buttons] ?? "0px",
    ["--r-card" as string]: CARD[s.cards] ?? "0px",
    ["--logo" as string]: Math.min(2, Math.max(0.6, (s.logoScale || 100) / 100)),
  };
}
