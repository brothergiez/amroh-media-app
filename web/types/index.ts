export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Content = {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  description: string | null;
  content_type: "single" | "multiple";
  numbering: boolean;
  sort_order: number;
  is_active: boolean;
  status: string;
  updated_at: string;
};

export type ContentSection = {
  id: number;
  content_id: number;
  section_type: string;
  title: string | null;
  arabic: string;
  transliteration: string;
  translation: string;
  sort_order: number;
};

export type Catalog = {
  version: number;
  updated_at: string;
  categories: Category[];
  contents: Content[];
  sections: ContentSection[];
};
