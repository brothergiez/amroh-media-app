export function categoryLabel(name: string | null | undefined) {
  return (name || "").replace(/^Group\s+/i, "").trim();
}
