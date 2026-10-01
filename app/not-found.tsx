import Link from "next/link";
import { ArrowLeft } from "@/components/Icons";
import { SiteShell } from "@/components/views/SiteShell";
import { content } from "@/lib/content";

export default function NotFound() {
  return (
    <SiteShell content={content}>
    <section className="wrap case-hero" style={{ minHeight: "70svh" }}>
      <p className="label">Erro 404</p>
      <h1 className="t-h1" style={{ margin: "16px 0 32px" }}>
        Essa página
        <br />
        não saiu do papel.
      </h1>
      <Link href="/" className="arrow-link">
        <ArrowLeft /> <span>Voltar ao início</span>
      </Link>
    </section>
    </SiteShell>
  );
}
