/**
 * Repositório do GitHub onde o painel publica o conteúdo.
 * Enquanto `repo` estiver vazio, o painel funciona em "modo local" (só para testes).
 * Passo a passo em DEPLOY.md.
 */
export const REPO = {
  owner: "fabiohenriquecorrea",
  repo: "fhcorrea-site",
  branch: "main",
};

export const repoConfigured = () => Boolean(REPO.owner && REPO.repo);
