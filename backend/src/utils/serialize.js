export function serializeCategory(doc) {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    sort_order: doc.sort_order,
    is_active: doc.is_active,
  };
}

export function serializeContent(doc, extras = {}) {
  return {
    id: doc.id,
    category_id: doc.category_id,
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    content_type: doc.content_type,
    numbering: doc.numbering,
    sort_order: doc.sort_order,
    is_active: doc.is_active,
    status: doc.status,
    updated_at: doc.updated_at,
    ...extras,
  };
}

export function serializeSection(doc) {
  return {
    id: doc.id,
    content_id: doc.content_id,
    section_type: doc.section_type,
    title: doc.title,
    arabic: doc.arabic,
    transliteration: doc.transliteration,
    translation: doc.translation,
    sort_order: doc.sort_order,
  };
}
