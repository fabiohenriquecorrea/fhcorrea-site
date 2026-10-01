/** Rótulo curto acima dos títulos: diz do que a seção trata, sem numeração. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p className="eyebrow">{children}</p>;
}
