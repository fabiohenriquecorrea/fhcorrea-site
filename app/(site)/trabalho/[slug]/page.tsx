import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectView } from "@/components/views/ProjectView";
import { content } from "@/lib/content";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return content.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = content.projects.find((w) => w.slug === slug);
  if (!p) return {};
  return { title: p.client, description: p.summary, openGraph: p.cover.src ? { images: [p.cover.src] } : undefined };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!content.projects.some((p) => p.slug === slug)) notFound();
  return <ProjectView content={content} slug={slug} />;
}
