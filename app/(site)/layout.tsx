import type { Metadata } from "next";
import { StatusScreen } from "@/components/StatusScreen";
import { SiteShell } from "@/components/views/SiteShell";
import { content } from "@/lib/content";

export function generateMetadata(): Metadata {
  // fora do ar: a tela temporária não deve ir para o Google
  return content.status?.mode === "online" ? {} : { robots: { index: false, follow: false } };
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const mode = content.status?.mode ?? "online";
  if (mode !== "online") return <StatusScreen screen={content.status[mode]} content={content} />;
  return <SiteShell content={content}>{children}</SiteShell>;
}
