import { NETWORK_LABEL } from "@/lib/social";
import { FRONTS, NETWORKS, type Content, type Project } from "@/lib/types";

export type Field =
  | { kind: "text"; key: string; label: string; hint?: string; placeholder?: string }
  | { kind: "textarea"; key: string; label: string; hint?: string; rows?: number }
  | { kind: "number"; key: string; label: string; min: number; max: number; suffix?: string; hint?: string }
  | { kind: "range"; key: string; label: string; min: number; max: number; suffix?: string; hint?: string }
  | { kind: "media"; key: string; label: string; hint?: string; vimeo?: boolean }
  | { kind: "select"; key: string; label: string; options: { value: string; label: string }[]; hint?: string }
  | { kind: "multi"; key: string; label: string; options: { value: string; label: string }[]; hint?: string }
  | { kind: "toggle"; key: string; label: string; hint?: string }
  | { kind: "mode"; key: string; label: string }
  | { kind: "strings"; key: string; label: string; addLabel: string; hint?: string }
  | { kind: "heading"; label: string; hint?: string }
  | {
      kind: "list";
      key: string;
      label: string;
      addLabel: string;
      itemTitle: (item: Record<string, unknown>, i: number) => string;
      itemMedia?: (item: Record<string, unknown>) => string | undefined;
      fields: Field[];
      create: () => Record<string, unknown>;
      hint?: string;
    }
  | { kind: "projects" };

export type Section = {
  id: string;
  label: string;
  /** âncora visível no site (#id) */
  anchor?: string;
  /** valor de data-edit no site, para seleção por clique e rolagem */
  target?: string;
  /** caminho no conteúdo, ex.: "hero" ou "projects.2"; vazio = conteúdo inteiro */
  root: string;
  fields: Field[];
  global?: boolean;
  note?: string;
};

export type Page = {
  id: string;
  label: string;
  url: string;
  group: "pages" | "cases" | "settings";
  /** tela de status a mostrar na prévia, quando a página é “Status do site” */
  screen?: boolean;
  sections: Section[];
};

const SIZES = [
  { value: "sm", label: "Pequeno 1×1" },
  { value: "tall", label: "Vertical 1×2" },
  { value: "wide", label: "Horizontal 2×1" },
  { value: "lg", label: "Destaque 2×2" },
];
const fronts = FRONTS.map((f) => ({ value: f, label: f }));
const alt = (key = "alt"): Field => ({
  kind: "text",
  key,
  label: "Descrição da imagem",
  hint: "Para quem usa leitor de tela e para o Google. Descreva o que aparece.",
});

const contactSection: Section = {
  id: "contato",
  label: "Contato",
  anchor: "contato",
  target: "contact",
  root: "contact",
  global: true,
  note: "Rodapé: aparece no fim de todas as páginas. E-mail, WhatsApp e LinkedIn ficam em Configurações.",
  fields: [
    { kind: "text", key: "kicker", label: "Rótulo acima do título" },
    { kind: "text", key: "title1", label: "Título — linha 1" },
    { kind: "text", key: "title2", label: "Título — linha 2 (em lima)" },
    { kind: "textarea", key: "text", label: "Texto", rows: 3 },
  ],
};

export function buildPages(content: Content): Page[] {
  const projectOptions = content.projects.map((p) => ({ value: p.slug, label: p.short || p.client }));

  const home: Page = {
    id: "home",
    label: "Início",
    url: "/",
    group: "pages",
    sections: [
      {
        id: "abertura",
        label: "Abertura",
        anchor: "inicio",
        target: "hero",
        root: "hero",
        note: "Primeira tela. As imagens passam sozinhas como fundo.",
        fields: [
          { kind: "text", key: "kicker", label: "Rótulo acima do título" },
          { kind: "text", key: "title1", label: "Título — linha 1" },
          { kind: "text", key: "title2", label: "Título — linha 2" },
          { kind: "text", key: "pill", label: "Título — linha 3" },
          {
            kind: "select",
            key: "background",
            label: "Fundo",
            options: [
              { value: "slides", label: "Fotos e vídeos" },
              { value: "silver", label: "Prata da identidade" },
            ],
            hint: "Fotos e vídeos: os trabalhos passam como fundo. Prata: o degradê cinza do manual, com o símbolo lima.",
          },
          { kind: "textarea", key: "lead", label: "Texto de apoio", rows: 4 },
          { kind: "text", key: "ctaPrimary", label: "Botão", hint: "Leva até as peças." },
          { kind: "number", key: "interval", label: "Tempo por imagem", min: 3, max: 20, suffix: "s" },
          {
            kind: "list",
            key: "slides",
            label: "Fotos e vídeos de fundo",
            addLabel: "Adicionar foto ou vídeo",
            hint: "Só aparecem com o fundo “Fotos e vídeos”. Use as setas para mudar a ordem; a legenda leva ao projeto escolhido.",
            itemTitle: (s) => (s.label as string) || "Sem legenda",
            itemMedia: (s) => (s.poster as string) || (s.src as string),
            fields: [
              { kind: "media", key: "src", label: "Foto ou vídeo", vimeo: true, hint: "Vídeo: .mp4 leve (até 25 MB) ou um link do Vimeo. Toca sem som, em loop." },
              { kind: "media", key: "poster", label: "Capa do vídeo", hint: "Só para vídeo: aparece enquanto ele carrega." },
              { kind: "text", key: "label", label: "Legenda", hint: "Ex.: Conquist · Fachada" },
              { kind: "select", key: "project", label: "Leva ao projeto", options: projectOptions },
              alt(),
            ],
            create: () => ({ src: "", poster: "", alt: "", label: "Nova imagem", project: content.projects[0]?.slug ?? "" }),
          },
        ],
      },
      {
        id: "pecas",
        label: "Peças",
        anchor: "trabalho",
        target: "work",
        root: "",
        fields: [
          { kind: "text", key: "work.kicker", label: "Rótulo acima do título" },
          { kind: "text", key: "work.title1", label: "Título — linha 1" },
          { kind: "text", key: "work.title2", label: "Título — linha 2" },
          { kind: "textarea", key: "work.intro", label: "Introdução", rows: 3 },
          { kind: "heading", label: "Como o mosaico aparece" },
          { kind: "toggle", key: "work.showFilters", label: "Mostrar filtros (Marca, Social, Site…)" },
          { kind: "toggle", key: "work.showFront", label: "Mostrar a categoria nos cards" },
          { kind: "toggle", key: "work.showTitle", label: "Mostrar o nome do trabalho nos cards" },
          { kind: "number", key: "work.limit", label: "Cards na página inicial", min: 1, max: 40, hint: "Os demais ficam na página “Todos os trabalhos”." },
          { kind: "toggle", key: "work.showMore", label: "Último card: “ver todos os trabalhos”" },
          { kind: "text", key: "work.moreLabel", label: "Texto do último card" },
          {
            kind: "list",
            key: "pieces",
            label: "Cards do mosaico",
            addLabel: "Adicionar card",
            hint: "Cada card é uma imagem que abre um trabalho cadastrado. Ocultar mantém o card guardado, fora do site. A grade tem 4 colunas.",
            itemTitle: (p) => `${p.hidden ? "Oculto · " : ""}${(p.title as string) || "Sem título"} · ${p.front}`,
            itemMedia: (p) => p.image as string,
            fields: [
              { kind: "toggle", key: "hidden", label: "Ocultar do site" },
              { kind: "media", key: "image", label: "Imagem" },
              { kind: "text", key: "title", label: "Título" },
              { kind: "select", key: "front", label: "Frente (filtro)", options: fronts },
              { kind: "select", key: "size", label: "Tamanho no mosaico", options: SIZES },
              { kind: "select", key: "project", label: "Abre o projeto", options: projectOptions },
              alt(),
            ],
            create: () => ({
              image: "",
              alt: "",
              title: "Nova peça",
              front: "Marca",
              size: "sm",
              hidden: false,
              project: content.projects[0]?.slug ?? "",
            }),
          },
          { kind: "projects" },
        ],
      },
      {
        id: "ideato",
        label: "Ideato",
        anchor: "ideato",
        target: "ideato",
        root: "ideato",
        fields: [
          { kind: "text", key: "kicker", label: "Rótulo acima do título" },
          { kind: "text", key: "title1", label: "Título — linha 1" },
          { kind: "text", key: "title2", label: "Título — linha 2 (em lima)" },
          { kind: "textarea", key: "text", label: "Texto", rows: 3 },
          { kind: "text", key: "cta", label: "Botão" },
          { kind: "text", key: "href", label: "Link do botão", hint: "Página do projeto (/trabalho/ideato) ou um endereço externo." },
          { kind: "media", key: "image", label: "Imagem de fundo" },
          alt(),
        ],
      },
      {
        id: "sobre",
        label: "Sobre",
        anchor: "sobre",
        target: "about",
        root: "about",
        fields: [
          { kind: "text", key: "kicker", label: "Rótulo acima do título" },
          { kind: "text", key: "title1", label: "Título — linha 1" },
          { kind: "text", key: "title2", label: "Título — linha 2" },
          { kind: "textarea", key: "lead", label: "Destaque", rows: 2 },
          { kind: "strings", key: "body", label: "Parágrafos", addLabel: "Adicionar parágrafo" },
          { kind: "media", key: "image", label: "Retrato" },
          alt(),
        ],
      },
      {
        id: "caminho",
        label: "Caminho",
        anchor: "trajetoria",
        target: "journey",
        root: "",
        fields: [
          { kind: "text", key: "journey.kicker", label: "Rótulo acima do título" },
          { kind: "text", key: "journey.title1", label: "Título — linha 1" },
          { kind: "text", key: "journey.title2", label: "Título — linha 2" },
          { kind: "textarea", key: "journey.intro", label: "Introdução", rows: 2 },
          {
            kind: "list",
            key: "jobs",
            label: "Trajetória",
            addLabel: "Adicionar experiência",
            hint: "O primeiro item ganha o ponto lima de “atual”.",
            itemTitle: (j) => `${(j.place as string) || "Sem nome"} · ${j.period}`,
            fields: [
              { kind: "text", key: "period", label: "Período", placeholder: "2019 – 2026" },
              { kind: "text", key: "place", label: "Onde" },
              { kind: "text", key: "role", label: "Cargo" },
              { kind: "textarea", key: "text", label: "O que fez", rows: 3 },
            ],
            create: () => ({ period: "", place: "Nova experiência", role: "", text: "" }),
          },
          { kind: "text", key: "freelance.title", label: "Título dos clientes em paralelo" },
          {
            kind: "list",
            key: "freelance.clients",
            label: "Clientes em paralelo",
            addLabel: "Adicionar cliente",
            itemTitle: (c) => (c.name as string) || "Sem nome",
            fields: [
              { kind: "text", key: "name", label: "Cliente" },
              { kind: "text", key: "scope", label: "O que fez" },
            ],
            create: () => ({ name: "Novo cliente", scope: "" }),
          },
          {
            kind: "list",
            key: "skills",
            label: "Ferramentas",
            addLabel: "Adicionar grupo",
            itemTitle: (g) => (g.group as string) || "Sem nome",
            fields: [
              { kind: "text", key: "group", label: "Grupo" },
              { kind: "strings", key: "items", label: "Ferramentas", addLabel: "Adicionar ferramenta" },
            ],
            create: () => ({ group: "Novo grupo", items: [] }),
          },
          {
            kind: "list",
            key: "courses",
            label: "Cursos",
            addLabel: "Adicionar curso",
            itemTitle: (c) => (c.name as string) || "Sem nome",
            fields: [
              { kind: "text", key: "name", label: "Curso" },
              { kind: "text", key: "school", label: "Escola" },
            ],
            create: () => ({ name: "Novo curso", school: "" }),
          },
        ],
      },
      contactSection,
    ],
  };

  const archive: Page = {
    id: "archive",
    label: "Todos os trabalhos",
    url: "/trabalho",
    group: "pages",
    sections: [
      {
        id: "cabecalho",
        label: "Cabeçalho",
        target: "archive",
        root: "archive",
        note: "Destino do último card do mosaico. Os projetos aparecem sozinhos, na ordem da lista de projetos.",
        fields: [
          { kind: "text", key: "kicker", label: "Rótulo acima do título" },
          { kind: "text", key: "title1", label: "Título — linha 1" },
          { kind: "text", key: "title2", label: "Título — linha 2" },
          { kind: "textarea", key: "intro", label: "Introdução", rows: 3 },
        ],
      },
      contactSection,
    ],
  };

  const screenFields: Field[] = [
    { kind: "text", key: "note", label: "Etiqueta", hint: "Aparece no canto superior. Ex.: “Volta às 18h”." },
    { kind: "text", key: "title1", label: "Título — linha 1" },
    { kind: "text", key: "title2", label: "Título — linha 2 (em lima)" },
    { kind: "textarea", key: "text", label: "Texto", rows: 3 },
    { kind: "media", key: "image", label: "Imagem de fundo" },
    { kind: "range", key: "opacity", label: "Opacidade do fundo", min: 0, max: 70, suffix: "%" },
    { kind: "toggle", key: "showContact", label: "Mostrar e-mail e redes sociais" },
  ];

  const status: Page = {
    id: "status",
    label: "Status do site",
    url: "/",
    group: "settings",
    screen: true,
    sections: [
      {
        id: "situacao",
        label: "No ar ou fora do ar",
        target: "status",
        root: "status",
        note: "Escolha o que os visitantes veem e clique em Publicar. O site muda em cerca de 2 minutos.",
        fields: [{ kind: "mode", key: "mode", label: "O que os visitantes veem" }],
      },
      { id: "construcao", label: "Tela: em construção", target: "status", root: "status.construction", fields: screenFields },
      { id: "manutencao", label: "Tela: em manutenção", target: "status", root: "status.maintenance", fields: screenFields },
    ],
  };

  const cases: Page[] = content.projects.map((p: Project, i) => ({
    id: `case:${i}`,
    label: p.client || "Projeto sem nome",
    url: `/trabalho/${p.slug}`,
    group: "cases",
    sections: [
      {
        id: "capa",
        label: "Capa",
        target: `case:${p.slug}:capa`,
        root: `projects.${i}`,
        fields: [
          { kind: "text", key: "client", label: "Cliente" },
          { kind: "text", key: "short", label: "Nome curto", hint: "Aparece nas etiquetas do mosaico. Ex.: Conquist." },
          { kind: "textarea", key: "title", label: "Título da página", rows: 2 },
          { kind: "textarea", key: "summary", label: "Resumo", rows: 3 },
          { kind: "text", key: "role", label: "Seu papel" },
          { kind: "text", key: "year", label: "Período", placeholder: "2024 ou 2019 – 2026", hint: "Vazio = não aparece." },
          { kind: "multi", key: "fronts", label: "Frentes", options: fronts },
          { kind: "media", key: "cover.src", label: "Imagem de capa" },
          alt("cover.alt"),
          { kind: "text", key: "slug", label: "Endereço", hint: "Ex.: conquist → /trabalho/conquist. Só letras, números e hífen." },
        ],
      },
      {
        id: "conteudo",
        label: "Conteúdo",
        target: `case:${p.slug}:conteudo`,
        root: `projects.${i}`,
        fields: [
          { kind: "textarea", key: "challenge", label: "Desafio", rows: 5 },
          { kind: "textarea", key: "decision", label: "Decisão", rows: 5 },
          { kind: "strings", key: "deliverables", label: "Entregas", addLabel: "Adicionar entrega" },
          { kind: "heading", label: "Link externo", hint: "Opcional. Ex.: perfil no Instagram ou site no ar." },
          { kind: "text", key: "link.label", label: "Texto do link" },
          { kind: "text", key: "link.href", label: "Endereço", placeholder: "https://…" },
        ],
      },
      {
        id: "galeria",
        label: "Galeria",
        target: `case:${p.slug}:galeria`,
        root: `projects.${i}`,
        fields: [
          {
            kind: "list",
            key: "gallery",
            label: "Imagens",
            addLabel: "Adicionar imagem",
            hint: "Imagens largas ocupam a linha inteira; as outras ficam em pares.",
            itemTitle: (g) => (g.caption as string) || "Sem legenda",
            itemMedia: (g) => g.src as string,
            fields: [
              { kind: "media", key: "src", label: "Imagem" },
              { kind: "text", key: "caption", label: "Legenda" },
              { kind: "toggle", key: "wide", label: "Ocupar a linha inteira" },
              alt(),
            ],
            create: () => ({ src: "", alt: "", caption: "", wide: false }),
          },
        ],
      },
      contactSection,
    ],
  }));

  const settings: Page = {
    id: "settings",
    label: "Configurações",
    url: "/",
    group: "settings",
    sections: [
      {
        id: "info",
        label: "Contato e dados",
        target: "contact",
        root: "",
        note: "Usados no rodapé e nas telas de status.",
        fields: [
          { kind: "text", key: "site.name", label: "Nome" },
          { kind: "text", key: "site.role", label: "Profissão" },
          { kind: "text", key: "site.base", label: "Base", placeholder: "Cidade · UF" },
          { kind: "text", key: "site.since", label: "Desde", placeholder: "2017" },
          { kind: "text", key: "site.email", label: "E-mail", hint: "Aparece em destaque no rodapé. Vazio = não aparece." },
          {
            kind: "list",
            key: "socials",
            label: "Redes e contatos no rodapé",
            addLabel: "Adicionar rede",
            hint: "Aparecem como links de texto ao lado do e-mail, na ordem da lista.",
            itemTitle: (r) => NETWORK_LABEL[r.network as keyof typeof NETWORK_LABEL] ?? "Rede",
            fields: [
              { kind: "select", key: "network", label: "Rede", options: NETWORKS.map((n) => ({ value: n, label: NETWORK_LABEL[n] })) },
              {
                kind: "text",
                key: "url",
                label: "Endereço",
                placeholder: "https://…",
                hint: "WhatsApp: só o número com DDI e DDD (5544999999999). E-mail: só o endereço.",
              },
              { kind: "text", key: "text", label: "Texto do link", placeholder: "Ver perfil", hint: "Vazio = “Mandar mensagem” no WhatsApp e “Ver perfil” nas outras." },
            ],
            create: () => ({ network: "instagram", url: "", text: "" }),
          },
        ],
      },
      {
        id: "estilo",
        label: "Estilo",
        root: "style",
        note: "Vale para o site inteiro.",
        fields: [
          {
            kind: "select",
            key: "buttons",
            label: "Cantos dos botões",
            options: [
              { value: "square", label: "Retos" },
              { value: "soft", label: "Suaves" },
              { value: "round", label: "Arredondados" },
              { value: "pill", label: "Pílula" },
            ],
          },
          {
            kind: "select",
            key: "cards",
            label: "Cantos dos cards e imagens",
            options: [
              { value: "square", label: "Retos" },
              { value: "soft", label: "Suaves" },
              { value: "round", label: "Arredondados" },
              { value: "pill", label: "Bem arredondados" },
            ],
          },
          { kind: "range", key: "logoScale", label: "Tamanho da logo", min: 60, max: 200, suffix: "%", hint: "100% é o padrão. Vale para o topo, o rodapé e as telas de status." },
        ],
      },
      {
        id: "seo",
        label: "Google e compartilhamento",
        root: "site",
        fields: [
          { kind: "text", key: "seoTitle", label: "Título da página", hint: "Aparece na aba e no Google. Ideal: até 60 caracteres." },
          { kind: "textarea", key: "seoDescription", label: "Descrição", rows: 3, hint: "Ideal: até 155 caracteres." },
        ],
      },
    ],
  };

  return [home, archive, ...cases, status, settings];
}

export function newProject(): Project {
  const id = Date.now().toString(36);
  return {
    slug: `novo-projeto-${id}`,
    client: "Novo projeto",
    short: "Novo",
    title: "Título do projeto",
    summary: "",
    role: "",
    fronts: ["Marca"],
    cover: { src: "", alt: "" },
    challenge: "",
    decision: "",
    deliverables: [],
    gallery: [],
  };
}

/* utilidades de caminho */
export function getAt(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split(".").reduce<unknown>((o, k) => (o == null ? o : (o as Record<string, unknown>)[k]), obj);
}

export function setAt<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const clone = Array.isArray(obj) ? [...obj] : { ...(obj as object) };
  let cur: Record<string, unknown> = clone as Record<string, unknown>;
  let src: Record<string, unknown> = obj as Record<string, unknown>;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      cur[k] = value;
      return;
    }
    const next = src?.[k];
    const copy = Array.isArray(next) ? [...next] : { ...(next as object) };
    cur[k] = copy;
    cur = copy as Record<string, unknown>;
    src = next as Record<string, unknown>;
  });
  return clone as T;
}
