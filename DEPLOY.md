# Publicação (grátis): GitHub + Cloudflare Pages

Mesmo fluxo do site da Ideato. Custo mensal: **R$ 0** (você paga só o domínio).

## Como funciona

1. O código e o conteúdo ficam num repositório do GitHub.
2. A **Cloudflare Pages** gera o site a partir desse repositório e publica em `fhcorrea.com.br`.
3. No painel (`fhcorrea.com.br/admin`), **Publicar** grava `content/portfolio.json` no GitHub.
   A Cloudflare percebe e atualiza o site em ~2 minutos.
4. Imagens enviadas pelo painel vão para `public/uploads/` no mesmo repositório.

## Configuração (uma vez)

### GitHub
- Crie um repositório (ex.: `fhcorrea-site`) e envie este projeto para ele.
- Em `lib/repo-config.ts`, preencha `repo` com o nome do repositório.
  Enquanto estiver vazio, o painel abre em **modo local** (para testes; nada vai ao ar).

### Cloudflare Pages
- Workers & Pages → Criar → Pages → **Conectar ao Git** → escolha o repositório.
- Predefinição **Next.js (Static HTML Export)** · build `npx next build` · saída `out`.
- Variável opcional: `SITE_URL=https://fhcorrea.com.br`.
- Domínios personalizados: `fhcorrea.com.br` e `www.fhcorrea.com.br`.

### Chave do painel
- O painel pede uma chave do GitHub (fine-grained token) com **Contents: Read and write**
  apenas nesse repositório. O próprio painel tem o link “criar no GitHub”.
- A chave fica só no navegador onde foi colada.

## O painel

**Páginas:** Início (Abertura, Peças, Ideato, Sobre, Caminho, Contato), Todos os trabalhos e um item por projeto (Capa, Conteúdo, Galeria).

**Site**
- **Status do site:** no ar, em construção ou em manutenção, cada tela com texto e imagem próprios. Vale depois de **Publicar**.
- **Configurações:**
  - contato e dados, com a lista de redes, que aparecem no rodapé como links de texto, na ordem da lista;
  - estilo (cantos dos botões, cantos dos cards e imagens, tamanho da logo);
  - Google.

**Peças (mosaico)**
- **Filtros:** mostrar ou ocultar.
- **Cards:** mostrar ou não a categoria e o nome; definir quantos aparecem na página inicial; ligar o último card “ver todos os trabalhos”.
- **Cada card:** ocultar sem apagar.

**Abertura:** fundo em fotos e vídeos (.mp4 ou Vimeo) ou no prata da identidade.

- **Páginas → Seções (âncoras) → Campos**, como no editor do Wix.
- Clique em qualquer seção da prévia para editá-la; prévia em desktop, tablet e celular.
- Rascunho salvo no navegador; ⌘Z / ⌘⇧Z desfaz e refaz; **Publicar** coloca no ar.
- Biblioteca de imagens com envio por arrastar e soltar (até 25 MB por arquivo).
