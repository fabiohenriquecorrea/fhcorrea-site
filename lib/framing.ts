import type { CSSProperties } from "react";
import type { Fit, Focus, Framing, Ratio } from "./types";

const RATIO: Record<Exclude<Ratio, "original">, string> = {
  "16:9": "16 / 9",
  "4:3": "4 / 3",
  "1:1": "1 / 1",
  "4:5": "4 / 5",
  "3:4": "3 / 4",
  "9:16": "9 / 16",
};
const FOCUS: Record<Focus, string> = {
  center: "50% 50%",
  top: "50% 0%",
  bottom: "50% 100%",
  left: "0% 50%",
  right: "100% 50%",
};

/** Proporção do quadro, ou null quando a imagem deve manter a própria proporção. */
export const frameRatio = (f: Framing) => (!f.ratio || f.ratio === "original" ? null : RATIO[f.ratio]);

/** Estilo da imagem dentro de um quadro de proporção fixa. */
export const fitStyle = (f: { fit?: Fit; focus?: Focus }): CSSProperties => ({
  objectFit: f.fit ?? "cover",
  objectPosition: FOCUS[f.focus ?? "center"],
});
