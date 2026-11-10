import { frameRatio, fitStyle } from "@/lib/framing";
import { resolveMedia } from "@/lib/media-url";
import type { Image } from "@/lib/types";

/**
 * Imagem de projeto respeitando o enquadramento escolhido no painel:
 * proporção original (padrão, sem corte) ou um quadro fixo com encaixe e ponto de foco.
 */
export function FramedImage({ image, priority }: { image: Image; priority?: boolean }) {
  if (!image.src) return <div className="frame is-empty" aria-hidden="true" />;
  const ratio = frameRatio(image);
  const src = resolveMedia(image.src);

  if (!ratio) {
    return (
      <div className="frame is-natural">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={image.alt} loading={priority ? "eager" : "lazy"} decoding="async" />
      </div>
    );
  }
  return (
    <div className={`frame ${image.fit === "contain" ? "is-contain" : ""}`} style={{ aspectRatio: ratio }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={image.alt} loading={priority ? "eager" : "lazy"} decoding="async" style={fitStyle(image)} />
    </div>
  );
}
