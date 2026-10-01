"use client";

import { useEffect, useState } from "react";
import { StatusScreen } from "@/components/StatusScreen";
import { ArchiveView } from "@/components/views/ArchiveView";
import { HomeView } from "@/components/views/HomeView";
import { ProjectView } from "@/components/views/ProjectView";
import { SiteShell } from "@/components/views/SiteShell";
import type { Snapshot } from "./store";

export type PreviewMessage = {
  type: "fc:render";
  snap: Snapshot;
  path: string;
  /** mostra uma tela de status no lugar do site */
  screen?: "construction" | "maintenance" | null;
  mediaBase?: string;
  mediaMap?: Record<string, string>;
};

/** Renderiza o rascunho recebido do painel (mesmo domínio), sem recarregar a página. */
export function PreviewClient() {
  const [msg, setMsg] = useState<PreviewMessage | null>(null);

  useEffect(() => {
    // revelações por rolagem ficam sempre visíveis na prévia
    document.documentElement.classList.remove("js");
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "fc:render") return;
      const data = e.data as PreviewMessage;
      window.__FC_MEDIA_BASE = data.mediaBase;
      window.__FC_MEDIA_MAP = data.mediaMap;
      setMsg((prev) => {
        if (prev && (prev.path !== data.path || prev.screen !== data.screen)) window.scrollTo(0, 0);
        return data;
      });
    };
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: "fc:ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (msg) window.parent?.postMessage({ type: "fc:rendered" }, window.location.origin);
  }, [msg]);

  if (!msg) return <div className="preview-wait">Carregando prévia…</div>;

  const { snap, path, screen } = msg;
  if (screen) return <StatusScreen screen={snap.content.status[screen]} content={snap.content} />;
  const slug = path.startsWith("/trabalho/") ? path.slice("/trabalho/".length) : null;
  return (
    <SiteShell content={snap.content}>
      {slug ? (
        <ProjectView content={snap.content} slug={slug} />
      ) : path === "/trabalho" ? (
        <ArchiveView content={snap.content} />
      ) : (
        <HomeView content={snap.content} />
      )}
    </SiteShell>
  );
}
