import type { ContentSection } from "~/types";

const MUSHAF_SLUGS = new Set([
  "surat-yaasin",
  "surat-waqiah",
  "surat-al-mulk",
  "surat-al-kahfi-ringkas",
]);

export const MUSHAF_TITLES: Record<string, string> = {
  "surat-yaasin": "سُورَةُ يسٓ",
  "surat-waqiah": "سُورَةُ الْوَاقِعَة",
  "surat-al-mulk": "سُورَةُ الْمُلْك",
  "surat-al-kahfi-ringkas": "سُورَةُ الْكَهْف",
};

export function isMushafSlug(slug: string) {
  return MUSHAF_SLUGS.has(slug);
}

export function isBismillah(arabic: string) {
  return arabic.replace(/\s+/g, "").startsWith("بِسْمِ");
}

export type MushafLine = {
  id: number;
  arabic: string;
  number: number | null;
  translation: string;
};

export type MushafGroup = {
  title: string | null;
  items: MushafLine[];
};

export function buildMushafView(slug: string, sections: ContentSection[], numbering: boolean) {
  const quran = isMushafSlug(slug);
  let bismillah: string | null = null;
  const groups: MushafGroup[] = [];
  let sequential = 0;

  for (const section of sections) {
    const arabic = section.arabic.trim();
    if (!arabic) {
      continue;
    }

    if (quran && isBismillah(arabic) && !bismillah) {
      bismillah = arabic;
      continue;
    }

    sequential += 1;
    const number = numbering
      ? slug === "surat-al-kahfi-ringkas" && sequential > 10
        ? sequential - 10 + 100
        : sequential
      : null;

    const line: MushafLine = {
      id: section.id,
      arabic,
      number,
      translation: section.translation?.trim() || "",
    };

    const last = groups[groups.length - 1];
    if (last && last.title === section.title) {
      last.items.push(line);
    } else {
      groups.push({ title: section.title, items: [line] });
    }
  }

  return {
    arabicTitle: MUSHAF_TITLES[slug] || "",
    bismillah,
    groups,
  };
}
