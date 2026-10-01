# Análise de UX e UI — portfólio Fabio Correa

Revisão feita em 30/09/2026, em 1440px e 390px, nos temas claro e escuro.

## 1. Diagnóstico da versão anterior

| # | Problema | Por que atrapalhava |
|---|----------|---------------------|
| 1 | Frase "Desenho. Filmo. Voo. Anuncio." e a anterior "Do traço ao tráfego" | Soavam como oferta de serviço. Um portfólio pessoal precisa convidar a olhar, não vender. |
| 2 | Página inteira em cinza, com granulação por cima de tudo | Sem hierarquia de superfície: tudo tinha o mesmo peso. Lima e céu, que são metade da paleta do manual, quase não apareciam. |
| 3 | Texto cinza-médio sobre prata (contraste 4,0:1) | Ficava abaixo do recomendado para leitura longa. |
| 4 | Faixa de números (leads, verba, seguidores) e bloco de resultados no case | Linguagem de proposta comercial, fora do objetivo de mostrar o trabalho. |
| 5 | Botão "Vamos conversar" no topo e "Chamar no WhatsApp" como CTA principal | Pressão de venda em toda a página. |
| 6 | Sem controle de tema | Só seguia o sistema; quem prefere o contrário não tinha escolha. |
| 7 | Legenda do hero ("01 / 04 Conquist · Fachada") sem ação | Mostrava o projeto mas não levava até ele. |
| 8 | Seções sem fio condutor | O visitante via blocos soltos, sem uma história. |

## 2. Narrativa: o caderno de traços

A página agora é lida como um caderno, em seis capítulos numerados. O rótulo em mono com número em bloco repete o "01" da própria identidade.

| Capítulo | Seção | Papel na história |
|----------|-------|-------------------|
| 01 · O traço | Abertura | "Toda marca começa num **traço.**" A palavra "traço" fica numa pílula, a mesma do "sou" e do "portifólio" no PDF. Na animação, o símbolo é desenhado em linha e vira forma lima: o traço virando marca. |
| 02 · As peças | Mosaico e índice | "Do rabisco ao mundo." É o trabalho em si. |
| 03 · Uma vertente | Faixa Ideato | "Da ideia ao ato." É o mesmo traço, agora em formato de estúdio. |
| 04 · Quem desenha | Sobre | "Curioso por ofício." Aqui entram o rosto e a trajetória pessoal. |
| 05 · O caminho | Trajetória e ferramentas | "Por onde o traço passou." |
| 06 · Até logo | Rodapé | "Obrigado por chegar até aqui." O contato aparece como convite, não como oferta. |

Botões principais: "Folhear as peças" (leitura, não compra) e "Currículo em PDF".

## 3. Sistema de cor: quem vai onde

As cores são as do manual: lima `#D5E538`, céu `#BDE1F7`, tinta `#1C1B1A`, papel `#F5F2EC`, e a prata da capa como degradê.

| Superfície | Onde | Texto e logo | Acento |
|------------|------|--------------|--------|
| **Prata com granulação** | Só na abertura, como na capa do manual | Tinta (9,6:1 no meio do degradê, 6,4:1 na ponta escura) | Símbolo em lima atrás da janela de trabalho |
| **Papel** | Peças, caminho e páginas de projeto, onde se lê | Tinta (15,4:1); secundário tinta-60 (6,3:1) | Botão tinta; etiquetas em céu |
| **Lima** | Sobre, como na página "Quem eu sou" | Tinta (12,4:1); corpo em oliva `#3D4015` (7,8:1) | Símbolo gigante em tom sobre tom; retrato com símbolo branco |
| **Grafite** | Faixa Ideato e rodapé | Branco (15,9:1); secundário `#B4AC9C` (7,6:1) | Lima em títulos e numeração (12,4:1) |
| **Céu** | Etiquetas de ferramentas e frentes dos projetos | Tinta (12,5:1) | Passa a lima ao passar o mouse |

**Regras de contraste**
- **Texto em lima:** só sobre grafite ou foto escurecida. Nunca sobre papel (1,2:1).
- **Texto branco:** nunca sobre lima (1,3:1).
- **Símbolo do logo no topo:** tinta no tema claro, lima no escuro e sobre grafite. Sobre a foto do retrato, em branco.
- **Lima como superfície:** aparece uma vez por página (seção Sobre). No resto é acento, como pede o design system da Ideato.

**Tema escuro**
- **Papel:** vira grafite quente.
- **Prata:** vira degradê de grafite.
- **Seção lima:** deixa de ser superfície e vira oliva profundo com título lima, para não ofuscar à noite.

## 4. Tema claro/escuro

- **Padrão:** segue o sistema operacional (`prefers-color-scheme`).
- **Botão no topo:** sol e lua com transição entre os dois.
  - Escolher o oposto do sistema fica salvo no navegador.
  - Escolher o mesmo que o sistema apaga a escolha, e o site volta a seguir o sistema.
- **Sem piscar:** a escolha é aplicada antes da primeira pintura, com um script no `<head>`.
- **Troca suave:** crossfade da página inteira quando o navegador suporta (View Transitions), desligado com movimento reduzido.
- **Acessibilidade:** o rótulo diz a ação ("Usar tema escuro"), não o estado.

## 5. Tipografia e hierarquia

- **Título da abertura:** reduzido e dividido em 3 linhas (`clamp(44px, 5.6vw, 84px)`) para não invadir a janela de trabalho em 1280–1440px.
- **Texto de apoio da abertura:** em tinta cheia. Em cinza-médio sobre prata ficava com 4,0:1.
- **Rótulos de capítulo:** tamanho fixo, com correção de herança dentro dos cabeçalhos de seção. Antes o 02 e o 05 saíam maiores e desalinhados.
- **Pílula:** borda proporcional ao corpo (`0.055em`), para acompanhar o tamanho do título.

## 6. Interação e movimento

- **Janela da abertura:** a legenda virou link para o projeto em tela, com seta.
- **Assinatura:** o contorno do símbolo é desenhado (2,4 s) e se preenche de lima. Com movimento reduzido, a marca já aparece pronta.
- **Tipografia:** o peso reage à proximidade do cursor. Continua em todos os títulos.
- **Mosaico:** filtros com View Transitions. Etiquetas curtas em blocos pequenos no celular.
- **Estados:** todos os botões têm estado pressionado. Hover só em ponteiro fino, sem hover "grudado" no toque.

## 7. Acessibilidade

- **Estrutura:** link "Pular para o conteúdo", foco visível com anel lima e títulos em ordem (h1 → h2 → h3).
- **Imagens:** todas com `alt` descritivo. As decorativas ficam com `aria-hidden`.
- **Títulos cinéticos:** têm `aria-label` com o texto inteiro, então o leitor de tela não soletra letra por letra.
- **Movimento reduzido:** respeitado em galeria, desenho do símbolo, contagem, parallax e troca de tema.

## 8. Responsivo

- **Celular:** a janela de trabalho vai para baixo do texto, em vez de virar fundo. O símbolo lima fica no canto superior direito, sem passar por baixo do título. Sem rolagem horizontal em 390px.
- **Menu:** vira gaveta; o botão de tema continua visível ao lado.

## 9. Próximos passos recomendados

1. **Mais imagens reais nos cases** de Torre de Tokyo e Tecnológica (hoje têm 1–2 imagens cada). Um case forte pede de 4 a 6 imagens.
2. **Ano dos projetos** Tokyo e Tecnológica, para completar o índice.
3. **Imagem de compartilhamento (OG)** própria, em 1200×630, com a capa prata e o logo, em vez da fachada da Conquist.
4. **Revisar os textos de desafio e decisão** dos cases. Foram escritos a partir do PDF e do currículo.
5. **Vídeo:** se houver material de drone, trocar uma das imagens da abertura por um vídeo curto e sem som.

---

## Rodada 2 — 01/10/2026

### Mudanças pedidas
- **Abertura:** os trabalhos passam como fundo de tela inteira, com véu escuro para leitura. O traço do símbolo é desenhado em lima por cima.
- **Currículo:** removido de todo o site (botão, link e PDF publicado).
- **Rótulos:** sem numeração (01, 02…). Cada seção tem um rótulo curto e editável, com um traço antes.
- **Lista de projetos abaixo do mosaico:** removida, porque o mosaico já leva a cada projeto.
- **Logotipo:** novo, em linha única “fabio.correa”, com o ponto sempre lima.
- **Símbolo:** lima sempre que o fundo é escuro (abertura, faixas, rodapé e todo o tema escuro). Em tinta só no cabeçalho claro, onde o lima teria 1,2:1.
- **Mais azul (céu, do “Ativo 4”):**
  - a seção **Caminho** virou superfície céu, com texto em tinta (12,5:1);
  - o filtro ativo do mosaico é céu;
  - as etiquetas de frentes dos projetos são céu;
  - o sublinhado do e-mail no rodapé é céu.
- **Ritmo da página:** as quatro cores do “Ativo 4” aparecem em sequência. Abertura escura → peças em papel → Ideato escura → Sobre em lima → Caminho em céu → rodapé em tinta.

### Varredura de layout
- **Cabeçalho:** transparente só no topo da abertura. Ao rolar, vira barra escura com desfoque, para não passar por cima do título. A sobra da abertura escondida sob a barra não escurece mais o menu ao pular para “Peças”.
- **Menu sobre fotos claras:** sombra de texto e véu superior mais forte.
- **Navegação da abertura:** traços clicáveis no lugar de “01 / 04”. Pausam sob o cursor e mostram o tempo de cada imagem. No celular ficam na base da tela.
- **Páginas de projeto:**
  - topo em prata com granulação (a capa do manual);
  - capa sobreposta à faixa prata;
  - “Todas as peças” para voltar;
  - “Próximo projeto” com miniatura.
- **Rodapé:** só e-mail, WhatsApp e LinkedIn. Cada link some sozinho se o campo estiver vazio.

### Painel (`/admin`)
- **Estrutura:** Páginas → Seções (âncoras) → Campos, como no Wix.
  - **Início:** Abertura `#inicio`, Peças `#trabalho`, Ideato `#ideato`, Sobre `#sobre`, Caminho `#trajetoria`, Contato `#contato`.
  - **Projetos:** cada um com Capa, Conteúdo e Galeria. Dá para criar, duplicar, mover e excluir.
  - **Configurações:** contato e dados; Google e compartilhamento.
- **Prévia ao vivo:** em desktop, tablet e celular. Clicar numa seção da prévia abre os campos dela.
- **Trabalho seguro:** rascunho salvo no navegador, desfazer e refazer, descartar.
- **Imagens:** biblioteca com envio por arrastar e soltar.
- **Publicação:** um botão grava no GitHub, e a Cloudflare atualiza o site. Configuração em `DEPLOY.md`.

---

## Rodada 3 — 01/10/2026

- **Fundo da abertura:** escolhido no painel, em fotos e vídeos ou no prata da identidade. No prata, o traço do símbolo é desenhado e vira forma lima, e o menu fica em tinta.
- **Logo:** sem animação. Tamanho ajustável de 60% a 200%, no topo, no rodapé e nas telas de status.
- **Estilo:** cantos dos botões (retos, suaves, arredondados, pílula) e dos cards e imagens, aplicados ao site inteiro por variáveis de CSS. Não há custo de desempenho.
- **Telas de construção e manutenção:**
  - com etiqueta, título, texto, imagem e opacidade;
  - o e-mail e as redes aparecem só se você ativar;
  - ficam fora do Google enquanto o site está fora do ar;
  - aviso no topo do painel enquanto o site não está no ar.
- **Redes sociais:**
  - 13 redes com ícones de traço desenhados no próprio código: nenhuma biblioteca, nenhum arquivo extra;
  - WhatsApp aceita só o número; e-mail aceita só o endereço;
  - rede sem endereço não aparece.
- **Mosaico:**
  - filtros ligáveis; categoria e nome dos cards ligáveis;
  - sem legendas, o card fica limpo e só escurece no hover;
  - limite de cards na página inicial; cards ocultos ficam guardados;
  - o último card é “Ver todos os trabalhos”, em céu (vira lima no hover) e com o total de projetos.
- **Página “Todos os trabalhos” (`/trabalho`):** cards com capa, frentes, ano, cliente e resumo, editável no painel.

- **Redes sociais (revisão):** os ícones saíram a pedido. Os contatos voltaram a ser links de texto: rótulo pequeno + texto com seta, como “WhatsApp · Mandar mensagem ↗”. A lista continua editável em Configurações › Contato e dados, com um texto opcional por link.
