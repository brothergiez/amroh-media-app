const TITLE_SLUGS = {
  "Doa Tawassul": "doa-tawassul",
  "Ratib Al-Atthos": "ratib-al-aththas",
  "Hizib Nawawi": "hizib-nawawi",
  "Sholawat Busyro": "sholawat-busyro",
  "Niat Ta'lim": "niat-talim",
  "Sholawat Ya Robbana Tarofna": "ya-robbana-tarofna",
  "Tawassul Sayyidil Walid Habib Abdurrahman bin Ahmad Assegaf":
    "tawassul-sayyidil-walid",
  "Dzikir Jalalah": "dzikir-jalalah",
  Penutup: "penutup",
  "Do'a Fajar": "doa-fajar",
  "Wirdul Lathif": "wirdul-lathif",
  "Surat Yaasin": "surat-yaasin",
  "Surat Waqi'ah": "surat-waqiah",
  "Surat Al-Mulk": "surat-al-mulk",
  "Surat Al-Kahfi (10 Ayat Awal & 10 Ayat Akhir)": "surat-al-kahfi-ringkas",
  "Hizib Nashr - Habib Abdullah bin Alawi Al-Haddad": "hizib-nashr",
  "Maulid Diba": "maulid-diba",
  "Sholawat Untuk Keselamatan IB Habib Rizieq Syihab":
    "sholawat-keselamatan-habib-rizieq",
  "Sholawat Dibaca Sebelum & Sesudah Belajar": "sholawat-belajar",
  "Sholawat Kheir": "sholawat-kheir",
};

export function slugify(title) {
  if (TITLE_SLUGS[title]) {
    return TITLE_SLUGS[title];
  }

  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `content-${Buffer.from(title).toString("hex").slice(0, 12)}`;
}
