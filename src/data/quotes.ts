export type QuoteCategoryId =
  | "islam"
  | "kristen"
  | "katolik"
  | "hindu"
  | "buddha"
  | "umum"
  | "none"

export type QuotePresetId =
  | "islam-ar-rum-21"
  | "islam-an-nisa-1"
  | "islam-adz-dzariyat-49"
  | "kristen-matius-19-6"
  | "kristen-pengkhotbah-4-9"
  | "kristen-1-korintus-13-4"
  | "katolik-1-korintus-13-13"
  | "katolik-kolose-3-14"
  | "hindu-rgveda-10-85-42"
  | "hindu-atharvaveda-14-2-71"
  | "buddha-dhammapada"
  | "buddha-anguttara-nikaya"
  | "umum-saint-exupery"
  | "umum-kahlil-gibran"
  | "umum-sederhana"
  | "none"

export interface QuoteCategory {
  id: QuoteCategoryId
  label: string
}

export interface QuotePreset {
  id: QuotePresetId
  category: QuoteCategoryId
  label: string
  subtitle: string
  arabic: string
  translation: string
  source: string
  openingGreeting: string
  closingGreeting: string
  introText: string
  hidden?: boolean
}

export const DEFAULT_QUOTE_PRESET_ID: QuotePresetId = "islam-ar-rum-21"

export const QUOTE_CATEGORIES: QuoteCategory[] = [
  { id: "islam", label: "Islam" },
  { id: "kristen", label: "Kristen" },
  { id: "katolik", label: "Katolik" },
  { id: "hindu", label: "Hindu" },
  { id: "buddha", label: "Buddha" },
  { id: "umum", label: "Umum" },
  { id: "none", label: "Tanpa Kutipan" },
]

const ISLAM_GREETINGS = {
  openingGreeting: "Assalamu'alaikum Wr. Wb.",
  closingGreeting: "Wassalamu'alaikum Warahmatullahi Wabarakatuh",
  introText:
    "Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:",
}

const KRISTEN_GREETINGS = {
  openingGreeting: "Salam Sejahtera",
  closingGreeting: "Tuhan Yesus Memberkati",
  introText:
    "Dengan memohon berkat dan kasih karunia Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan putra-putri kami:",
}

const KATOLIK_GREETINGS = {
  openingGreeting: "Salam Sejahtera dalam Kasih Kristus",
  closingGreeting: "Berkat Tuhan Menyertai Kita Semua",
  introText:
    "Dengan memohon berkat dan rahmat Tuhan Yang Maha Pengasih, kami bermaksud menyelenggarakan pernikahan putra-putri kami:",
}

const HINDU_GREETINGS = {
  openingGreeting: "Om Swastiastu",
  closingGreeting: "Om Shanti, Shanti, Shanti Om",
  introText:
    "Atas Asung Kertha Wara Nugraha Ida Sang Hyang Widhi Wasa, kami bermaksud menyelenggarakan upacara pernikahan putra-putri kami:",
}

const BUDDHA_GREETINGS = {
  openingGreeting: "Namo Buddhaya",
  closingGreeting: "Sadhu, Sadhu, Sadhu",
  introText:
    "Dengan penuh rasa syukur dan kebahagiaan, kami bermaksud menyelenggarakan pernikahan putra-putri kami:",
}

const UMUM_GREETINGS = {
  openingGreeting: "Salam Hangat",
  closingGreeting: "Terima Kasih Atas Doa & Kehadiran Anda",
  introText:
    "Dengan penuh rasa syukur dan kebahagiaan, kami bermaksud menyelenggarakan pernikahan putra-putri kami:",
}

export const QUOTE_PRESETS: QuotePreset[] = [
  // ===================== ISLAM (3 OPSI) =====================
  {
    id: "islam-ar-rum-21",
    category: "islam",
    label: "Q.S. Ar-Rum : 21",
    subtitle: "Sakinah, Mawaddah & Rahmah",
    arabic:
      "وَمِنْ ءَايَٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا لِّتَسْكُنُوٓا۟ إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    translation:
      "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
    source: "Q.S. Ar-Rum : 21",
    ...ISLAM_GREETINGS,
  },
  {
    id: "islam-an-nisa-1",
    category: "islam",
    label: "Q.S. An-Nisa : 1",
    subtitle: "Diciptakan dari Jiwa yang Satu",
    arabic:
      "يَٰٓأَيُّهَا ٱلنَّاسُ ٱتَّقُوا۟ رَبَّكُمُ ٱلَّذِى خَلَقَكُم مِّن نَّفْسٍ وَٰحِدَةٍ وَخَلَقَ مِنْهَا زَوْجَهَا",
    translation:
      "Wahai manusia, bertakwalah kepada Tuhanmu yang telah menciptakan kamu dari diri yang satu, dan daripadanya Allah menciptakan pasangannya, serta memperkembangbiakkan keturunan yang baik dari keduanya.",
    source: "Q.S. An-Nisa : 1",
    ...ISLAM_GREETINGS,
  },
  {
    id: "islam-adz-dzariyat-49",
    category: "islam",
    label: "Q.S. Adz-Dzariyat : 49",
    subtitle: "Diciptakan Berpasang-pasangan",
    arabic:
      "وَمِن كُلِّ شَىْءٍ خَلَقْنَا زَوْجَيْنِ لَعَلَّكُمْ تَذَكَّرُونَ",
    translation:
      "Dan segala sesuatu Kami ciptakan berpasang-pasangan agar kamu mengingat kebesaran Allah.",
    source: "Q.S. Adz-Dzariyat : 49",
    ...ISLAM_GREETINGS,
  },

  // ===================== KRISTEN (3 OPSI) =====================
  {
    id: "kristen-matius-19-6",
    category: "kristen",
    label: "Matius 19 : 6",
    subtitle: "Dipersatukan oleh Allah",
    arabic: "",
    translation:
      "Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.",
    source: "Matius 19 : 6",
    ...KRISTEN_GREETINGS,
  },
  {
    id: "kristen-pengkhotbah-4-9",
    category: "kristen",
    label: "Pengkhotbah 4 : 9–10",
    subtitle: "Berdua Lebih Baik",
    arabic: "",
    translation:
      "Berdua lebih baik daripada seorang diri, karena mereka menerima upah yang baik dalam jerih payah mereka. Karena jikalau mereka jatuh, yang seorang mengangkat temannya.",
    source: "Pengkhotbah 4 : 9–10",
    ...KRISTEN_GREETINGS,
  },
  {
    id: "kristen-1-korintus-13-4",
    category: "kristen",
    label: "1 Korintus 13 : 4–7",
    subtitle: "Kasih Itu Sabar & Murah Hati",
    arabic: "",
    translation:
      "Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia menutupi segala sesuatu, percaya segala sesuatu, mengharapkan segala sesuatu, sabar menanggung segala sesuatu.",
    source: "1 Korintus 13 : 4–7",
    ...KRISTEN_GREETINGS,
  },

  // ===================== KATOLIK (2 OPSI) =====================
  {
    id: "katolik-1-korintus-13-13",
    category: "katolik",
    label: "1 Korintus 13 : 13",
    subtitle: "Iman, Pengharapan & Kasih",
    arabic: "",
    translation:
      "Demikianlah tinggal ketiga hal ini, yaitu iman, pengharapan, dan kasih; dan yang paling besar di antaranya ialah kasih.",
    source: "1 Korintus 13 : 13",
    ...KATOLIK_GREETINGS,
  },
  {
    id: "katolik-kolose-3-14",
    category: "katolik",
    label: "Kolose 3 : 14",
    subtitle: "Kasih yang Mempersatukan",
    arabic: "",
    translation:
      "Dan di atas semuanya itu: kenakanlah kasih, sebagai pengikat yang mempersatukan dan menyempurnakan.",
    source: "Kolose 3 : 14",
    ...KATOLIK_GREETINGS,
  },

  // ===================== HINDU (2 OPSI) =====================
  {
    id: "hindu-rgveda-10-85-42",
    category: "hindu",
    label: "Rgveda X.85.42",
    subtitle: "Kebahagiaan Rumah Tangga",
    arabic: "",
    translation:
      "Ya Tuhanku Yang Maha Pengasih, anugerahkanlah kepada pasangan pengantin ini kebahagiaan. Bersatulah mereka dan jangan pernah terpisahkan, mencapai panjang umur dan berbahagia di rumah tangga sendiri.",
    source: "Rgveda X.85.42",
    ...HINDU_GREETINGS,
  },
  {
    id: "hindu-atharvaveda-14-2-71",
    category: "hindu",
    label: "Atharvaveda XIV.2.71",
    subtitle: "Harmoni Suami & Istri",
    arabic: "",
    translation:
      "Aku adalah kata dan engkau adalah iramanya; bersama dalam satu keselarasan, marilah kita melangkah membangun kehidupan rumah tangga yang penuh kasih dan kedamaian.",
    source: "Atharvaveda XIV.2.71",
    ...HINDU_GREETINGS,
  },

  // ===================== BUDDHA (2 OPSI) =====================
  {
    id: "buddha-dhammapada",
    category: "buddha",
    label: "Cinta Kasih Universal",
    subtitle: "Sabbe Satta Bhavantu Sukhitatta",
    arabic: "",
    translation:
      "Dengan penuh cinta kasih, pengertian, dan saling menghormati, dua hati melangkah bersama menapaki kehidupan yang harmonis, damai, dan penuh berkah.",
    source: "Sabbe Satta Bhavantu Sukhitatta",
    ...BUDDHA_GREETINGS,
  },
  {
    id: "buddha-anguttara-nikaya",
    category: "buddha",
    label: "Anguttara Nikaya IV.55",
    subtitle: "Keselarasan Keyakinan & Kebajikan",
    arabic: "",
    translation:
      "Bila pasangan suami istri memiliki keyakinan, kebajikan, kemurahan hati, dan kebijaksanaan yang selaras, maka kebahagiaan dan ketenteraman akan senantiasa menyertai perjalanan hidup mereka.",
    source: "Anguttara Nikaya IV.55",
    ...BUDDHA_GREETINGS,
  },

  // ===================== UMUM / ROMANTIS (3 OPSI) =====================
  {
    id: "umum-saint-exupery",
    category: "umum",
    label: "Satu Arah Pandang",
    subtitle: "Antoine de Saint-Exupéry",
    arabic: "",
    translation:
      "Cinta sejati bukan tentang saling menatap satu sama lain, melainkan tentang bersama-sama memandang ke arah yang sama sepanjang hayat.",
    source: "Antoine de Saint-Exupéry",
    ...UMUM_GREETINGS,
  },
  {
    id: "umum-kahlil-gibran",
    category: "umum",
    label: "Dua Jiwa, Satu Perjalanan",
    subtitle: "Kahlil Gibran",
    arabic: "",
    translation:
      "Cintailah satu sama lain, namun jangan menjadikan cinta sebagai belenggu; biarlah ia menjadi lautan yang mengalir hangat di antara pantai jiwa kalian berdua.",
    source: "Kahlil Gibran",
    ...UMUM_GREETINGS,
  },
  {
    id: "umum-sederhana",
    category: "umum",
    label: "Janji Sederhana",
    subtitle: "Kutipan Pernikahan Modern",
    arabic: "",
    translation:
      "Di antara ribuan pertemuan di dunia, kami bersyukur menemukan rumah di dalam satu sama lain—tempat pulang paling tenang untuk hari ini dan selamanya.",
    source: "Janji Pernikahan",
    ...UMUM_GREETINGS,
  },

  // ===================== TANPA KUTIPAN (1 OPSI) =====================
  {
    id: "none",
    category: "none",
    label: "Tanpa Kutipan",
    subtitle: "Sembunyikan section ayat/kutipan",
    arabic: "",
    translation: "",
    source: "",
    ...UMUM_GREETINGS,
    hidden: true,
  },
]

// Backward-compatible mapping if DB stores short category IDs
const LEGACY_PRESET_ALIASES: Record<string, QuotePresetId> = {
  islam: "islam-ar-rum-21",
  kristen: "kristen-matius-19-6",
  katolik: "katolik-1-korintus-13-13",
  hindu: "hindu-rgveda-10-85-42",
  buddha: "buddha-dhammapada",
  umum: "umum-saint-exupery",
  none: "none",
}

export function getQuotePreset(id?: string | null): QuotePreset {
  const normalized = (id || "").trim().toLowerCase()
  const resolvedId = LEGACY_PRESET_ALIASES[normalized] || normalized
  return (
    QUOTE_PRESETS.find((p) => p.id === resolvedId) ||
    QUOTE_PRESETS[0]
  )
}
