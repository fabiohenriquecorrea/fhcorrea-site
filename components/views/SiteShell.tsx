import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RevealObserver } from "@/components/RevealObserver";
import { styleVars } from "@/lib/style";
import type { Content } from "@/lib/types";

/** Topo + conteúdo + rodapé, igual no site publicado e na prévia do painel. */
export function SiteShell({ content, children }: { content: Content; children: React.ReactNode }) {
  return (
    <div className="site-root" style={styleVars(content.style)}>
      <a className="skip" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">{children}</main>
      <Footer content={content} />
      <RevealObserver />
    </div>
  );
}
