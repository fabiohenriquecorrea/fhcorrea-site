import type { Network, Social } from "./types";

export const NETWORK_LABEL: Record<Network, string> = {
  instagram: "Instagram",
  behance: "Behance",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  youtube: "YouTube",
  vimeo: "Vimeo",
  tiktok: "TikTok",
  facebook: "Facebook",
  x: "X",
  pinterest: "Pinterest",
  dribbble: "Dribbble",
  email: "E-mail",
  site: "Site",
};

/** Aceita o que a pessoa colar: número de WhatsApp, e-mail ou endereço com/sem https. */
export function socialHref({ network, url }: Social) {
  const v = url.trim();
  if (!v) return "";
  if (network === "whatsapp" && !/^https?:/i.test(v)) return `https://wa.me/${v.replace(/\D/g, "")}`;
  if (network === "email") return v.startsWith("mailto:") ? v : `mailto:${v}`;
  return /^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/+/, "")}`;
}

const DEFAULT_TEXT: Partial<Record<Network, string>> = {
  whatsapp: "Mandar mensagem",
  email: "Escrever",
  site: "Visitar",
};

/** Redes prontas para exibir: só as que têm endereço válido. */
export const socialItems = (socials: Social[] = []) =>
  socials
    .map((s) => ({
      ...s,
      href: socialHref(s),
      label: NETWORK_LABEL[s.network] ?? s.network,
      value: s.text?.trim() || DEFAULT_TEXT[s.network] || "Ver perfil",
    }))
    .filter((s) => s.href);
