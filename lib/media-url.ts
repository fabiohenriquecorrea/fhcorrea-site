declare global {
  interface Window {
    __FC_MEDIA_BASE?: string;
    __FC_MEDIA_MAP?: Record<string, string>;
  }
}

/**
 * Na prévia do editor, arquivos recém-enviados ainda não estão no site publicado;
 * eles são lidos direto do repositório. No site público, o caminho fica igual.
 */
export function resolveMedia(src: string) {
  if (typeof window === "undefined" || !src) return src;
  const mapped = window.__FC_MEDIA_MAP?.[src];
  if (mapped) return mapped;
  if (window.__FC_MEDIA_BASE && src.startsWith("/uploads/")) return window.__FC_MEDIA_BASE + src;
  return src;
}
