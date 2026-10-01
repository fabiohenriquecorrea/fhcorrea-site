import type { Metadata } from "next";
import { ArchiveView } from "@/components/views/ArchiveView";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Trabalhos",
  description: content.archive.intro,
};

export default function ArchivePage() {
  return <ArchiveView content={content} />;
}
