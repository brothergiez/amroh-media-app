import type { ContentSection } from "~/types";

export type Pasal = {
  index: number;
  title: string;
  sections: ContentSection[];
};

export function pasalFromSections(sections: ContentSection[]): Pasal[] {
  const result: Pasal[] = [];

  for (const section of sections) {
    const title = section.title?.trim() || "";
    const last = result[result.length - 1];

    if (title && last && last.title === title) {
      last.sections.push(section);
      continue;
    }

    if (!title && last) {
      last.sections.push(section);
      continue;
    }

    result.push({
      index: result.length + 1,
      title: title || `Pasal ${result.length + 1}`,
      sections: [section],
    });
  }

  return result;
}

export function shouldIndexPasal(contentType: string, pasal: Pasal[]) {
  return contentType === "multiple" && pasal.length > 1;
}
