export const FRONTS = ["Marca", "Social", "Site", "3D"] as const;
export type Front = (typeof FRONTS)[number];

export type Size = "sm" | "wide" | "tall" | "lg";

export type Image = { src: string; alt: string; caption?: string; wide?: boolean };

export const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

/** Peça do mosaico da home — aponta para o projeto de onde saiu. */
export type Piece = {
  project: string;
  front: Front;
  title: string;
  image: string;
  alt: string;
  size: Size;
  /** fica cadastrada, mas não aparece no site */
  hidden?: boolean;
};

export type Project = {
  slug: string;
  client: string;
  /** nome curto, usado nas etiquetas do mosaico */
  short: string;
  title: string;
  summary: string;
  year?: string;
  role: string;
  fronts: Front[];
  cover: Image;
  challenge: string;
  decision: string;
  deliverables: string[];
  gallery: Image[];
  link?: { label: string; href: string };
};

/** Imagem, vídeo (.mp4/.webm) ou link do Vimeo; `poster` é a capa enquanto o vídeo carrega. */
export type Slide = { src: string; poster?: string; alt: string; label: string; project: string };

export const NETWORKS = [
  "instagram",
  "behance",
  "linkedin",
  "whatsapp",
  "youtube",
  "vimeo",
  "tiktok",
  "facebook",
  "x",
  "pinterest",
  "dribbble",
  "email",
  "site",
] as const;
export type Network = (typeof NETWORKS)[number];
/** `text` é o que aparece no link (ex.: “Mandar mensagem”); vazio = texto padrão da rede. */
export type Social = { network: Network; url: string; text?: string };

export type SiteMode = "online" | "maintenance" | "construction";
export type StatusScreen = {
  /** etiqueta no canto, ex.: “Volta às 18h” */
  note: string;
  title1: string;
  title2: string;
  text: string;
  image: string;
  /** 0–70 */
  opacity: number;
  showContact: boolean;
};

export type Corner = "square" | "soft" | "round" | "pill";

export type Job = { period: string; place: string; role: string; text: string };

export type Content = {
  status: { mode: SiteMode; construction: StatusScreen; maintenance: StatusScreen };
  /** “estilo” do site: cantos e tamanho da logo */
  style: { buttons: Corner; cards: Corner; logoScale: number };
  site: {
    name: string;
    role: string;
    base: string;
    since: string;
    email: string;
    seoTitle: string;
    seoDescription: string;
  };
  socials: Social[];
  hero: {
    kicker: string;
    title1: string;
    title2: string;
    /** terceira linha do título */
    pill: string;
    /** fundo da abertura: imagens/vídeos passando ou o prata da identidade */
    background: "slides" | "silver";
    lead: string;
    ctaPrimary: string;
    /** segundos por imagem de fundo */
    interval: number;
    slides: Slide[];
  };
  work: {
    kicker: string;
    title1: string;
    title2: string;
    intro: string;
    showFilters: boolean;
    showFront: boolean;
    showTitle: boolean;
    /** quantos cards antes do “ver mais” */
    limit: number;
    showMore: boolean;
    moreLabel: string;
  };
  pieces: Piece[];
  archive: { kicker: string; title1: string; title2: string; intro: string };
  projects: Project[];
  ideato: {
    kicker: string;
    title1: string;
    title2: string;
    text: string;
    image: string;
    alt: string;
    cta: string;
    href: string;
  };
  about: {
    kicker: string;
    title1: string;
    title2: string;
    lead: string;
    body: string[];
    image: string;
    alt: string;
    education: string;
  };
  journey: { kicker: string; title1: string; title2: string; intro: string };
  jobs: Job[];
  freelance: { title: string; clients: { name: string; scope: string }[] };
  skills: { group: string; items: string[] }[];
  courses: { name: string; school: string }[];
  contact: { kicker: string; title1: string; title2: string; text: string };
};
