# Fabio Correa — portfólio

Portfólio pessoal em Next.js (export estático), feito sobre a mesma base do site da
Ideato Studio: tokens papel/tinta/lima/céu, Bounded variável + IBM Plex Mono, cantos retos,
grades de 1px e tipografia cinética de proximidade.

## Rodar

```bash
npm install
npm run dev -- -p 3200
```

`npm run build` gera o site estático em `out/` (sobe em Cloudflare Pages, Netlify ou
qualquer hospedagem de arquivos — mesmo fluxo do site da Ideato).

## Editar conteúdo

Pelo painel: `/admin` (veja [DEPLOY.md](DEPLOY.md) para publicar de verdade).
Tudo fica em `content/portfolio.json`.

- **Novo projeto:** adicione um item em `projects` (gera `/trabalho/<slug>` sozinho).
- **Nova peça no mosaico:** adicione em `pieces`, apontando `project` para o slug.
  Tamanhos: `sm` (1×1), `wide` (2×1), `tall` (1×2), `lg` (2×2) numa grade de 4 colunas.
- **Imagens:** em `public/images/work/` (projetos) e `public/images/ideato/`.

## Motion

- Títulos com varredura de peso (eixo `wght`) e reação ao cursor.
- Abertura: os trabalhos passam como fundo; o símbolo é desenhado em linha lima por cima.
- A legenda leva ao projeto em tela; os traços embaixo trocam de imagem e pausam sob o cursor.
- Mosaico filtra com View Transitions; botão de tema claro/escuro (segue o sistema por padrão).
- Tudo respeita `prefers-reduced-motion`.
