// src/data/sportsCatalog.ts
export type SportCatalog = {
  id: string
  name: string
  categories: { id: string; name: string }[]
}

// helper bikin id aman
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")

export const SPORTS_CATALOG: SportCatalog[] = [
  {
    id: "pencak_silat",
    name: "Pencak Silat (Tapak Suci)",
    categories: [
      // SMP/MTs - Tanding
      { id: slug("SMP Tanding 36-39 Putra/Putri"), name: "SMP/MTs • Tanding • 36–39 kg (Putra/Putri)" },
      { id: slug("SMP Tanding 39-42 Putra/Putri"), name: "SMP/MTs • Tanding • 39–42 kg (Putra/Putri)" },
      { id: slug("SMP Tanding 42-45 Putra/Putri"), name: "SMP/MTs • Tanding • 42–45 kg (Putra/Putri)" },
      { id: slug("SMP Tanding 45-48 Putra/Putri"), name: "SMP/MTs • Tanding • 45–48 kg (Putra/Putri)" },
      { id: slug("SMP Tanding 48-51 Putra/Putri"), name: "SMP/MTs • Tanding • 48–51 kg (Putra/Putri)" },
      { id: slug("SMP Tanding 51-54 Putra/Putri"), name: "SMP/MTs • Tanding • 51–54 kg (Putra/Putri)" },
      { id: slug("SMP Tanding 54-57 Putra/Putri"), name: "SMP/MTs • Tanding • 54–57 kg (Putra/Putri)" },

      // SMP/MTs - Seni
      { id: slug("SMP Seni Tunggal Tangan Kosong"), name: "SMP/MTs • Seni • Tunggal Tangan Kosong (Tapak Suci)" },
      { id: slug("SMP Seni Ganda IPSI"), name: "SMP/MTs • Seni • Ganda (IPSI)" },

      // SMA - Tanding
      { id: slug("SMA Tanding 43-47 Putra/Putri"), name: "SMA/SMK/MA • Tanding • 43–47 kg (Putra/Putri)" },
      { id: slug("SMA Tanding 47-51 Putra/Putri"), name: "SMA/SMK/MA • Tanding • 47–51 kg (Putra/Putri)" },
      { id: slug("SMA Tanding 51-55 Putra/Putri"), name: "SMA/SMK/MA • Tanding • 51–55 kg (Putra/Putri)" },
      { id: slug("SMA Tanding 55-59 Putra/Putri"), name: "SMA/SMK/MA • Tanding • 55–59 kg (Putra/Putri)" },
      { id: slug("SMA Tanding 59-63 Putra/Putri"), name: "SMA/SMK/MA • Tanding • 59–63 kg (Putra/Putri)" },
      { id: slug("SMA Tanding 63-67 Putra/Putri"), name: "SMA/SMK/MA • Tanding • 63–67 kg (Putra/Putri)" },

      // SMA - Seni
      { id: slug("SMA Seni Tunggal Tangan Kosong"), name: "SMA/SMK/MA • Seni • Tunggal Tangan Kosong" },
      { id: slug("SMA Seni Ganda IPSI"), name: "SMA/SMK/MA • Seni • Ganda (IPSI)" },

      // Mahasiswa - Putra
      { id: slug("Mhs Putra 45-50"), name: "Mahasiswa • Tanding Putra • 45–50 kg" },
      { id: slug("Mhs Putra 50-55"), name: "Mahasiswa • Tanding Putra • 50–55 kg" },
      { id: slug("Mhs Putra 55-60"), name: "Mahasiswa • Tanding Putra • 55–60 kg" },
      { id: slug("Mhs Putra 60-65"), name: "Mahasiswa • Tanding Putra • 60–65 kg" },
      { id: slug("Mhs Putra 65-70"), name: "Mahasiswa • Tanding Putra • 65–70 kg" },
      { id: slug("Mhs Putra 70-75"), name: "Mahasiswa • Tanding Putra • 70–75 kg" },
      { id: slug("Mhs Putra 75-80"), name: "Mahasiswa • Tanding Putra • 75–80 kg" },
      { id: slug("Mhs Putra 80-85"), name: "Mahasiswa • Tanding Putra • 80–85 kg" },
      { id: slug("Mhs Putra 85-90"), name: "Mahasiswa • Tanding Putra • 85–90 kg" },

      // Mahasiswa - Putri
      { id: slug("Mhs Putri 45-50"), name: "Mahasiswa • Tanding Putri • 45–50 kg" },
      { id: slug("Mhs Putri 50-55"), name: "Mahasiswa • Tanding Putri • 50–55 kg" },
      { id: slug("Mhs Putri 55-60"), name: "Mahasiswa • Tanding Putri • 55–60 kg" },
      { id: slug("Mhs Putri 60-65"), name: "Mahasiswa • Tanding Putri • 60–65 kg" },
      { id: slug("Mhs Putri 65-70"), name: "Mahasiswa • Tanding Putri • 65–70 kg" },
      { id: slug("Mhs Putri 70-75"), name: "Mahasiswa • Tanding Putri • 70–75 kg" },

      // Mahasiswa - Beregu
      { id: slug("Mhs Beregu Putra >=65"), name: "Mahasiswa • Bebas Beregu Putra ≥ 65 kg (5 atlet, bertanding 3)" },
      { id: slug("Mhs Beregu Putri >=55"), name: "Mahasiswa • Bebas Beregu Putri ≥ 55 kg (5 atlet, bertanding 3)" },

      // Mahasiswa - Seni
      { id: slug("Mhs Seni Tunggal"), name: "Mahasiswa • Seni • Tunggal Tangan Kosong" },
      { id: slug("Mhs Seni Ganda IPSI"), name: "Mahasiswa • Seni • Ganda (IPSI)" },
    ],
  },

  {
    id: "atletik",
    name: "Atletik",
    categories: [
      { id: slug("SMP 100m"), name: "SMP • 100 meter" },
      { id: slug("SMP 400m"), name: "SMP • 400 meter" },
      { id: slug("SMP 800m"), name: "SMP • 800 meter" },
      { id: slug("SMP Estafet 4x400"), name: "SMP • Estafet 4×400 m" },
      { id: slug("SMP Lompat Jauh"), name: "SMP • Lompat Jauh" },
      { id: slug("SMP Tolak Peluru"), name: "SMP • Tolak Peluru" },

      { id: slug("SMA 100m"), name: "SMA • 100 meter" },
      { id: slug("SMA 400m"), name: "SMA • 400 meter" },
      { id: slug("SMA 800m"), name: "SMA • 800 meter" },
      { id: slug("SMA Estafet 4x400"), name: "SMA • Estafet 4×400 m" },
      { id: slug("SMA Lompat Jauh"), name: "SMA • Lompat Jauh" },
      { id: slug("SMA Tolak Peluru"), name: "SMA • Tolak Peluru" },

      { id: slug("Mahasiswa 100m"), name: "Mahasiswa • 100 meter" },
      { id: slug("Mahasiswa 400m"), name: "Mahasiswa • 400 meter" },
    ],
  },

  {
    id: "panahan",
    name: "Panahan",
    categories: [
      { id: slug("Standar Nasional SD 20m"), name: "Standar Nasional • SD (20 m)" },
      { id: slug("Standar Nasional SMP 30m"), name: "Standar Nasional • SMP (30 m)" },

      { id: slug("Barebow SD 10m"), name: "Barebow • SD (10 m)" },
      { id: slug("Barebow SMP-SMA 20m"), name: "Barebow • SMP–SMA (20 m)" },

      { id: slug("Recurve SMP-SMA 60m"), name: "Recurve • SMP–SMA (60 m)" },
      { id: slug("Recurve Mahasiswa 70m"), name: "Recurve • Mahasiswa (70 m)" },

      { id: slug("Compound SMP-SMA 50m"), name: "Compound • SMP–SMA (50 m)" },

      { id: slug("Horsebow SD 10m"), name: "Horsebow • SD (10 m)" },
      { id: slug("Horsebow SMP 20m"), name: "Horsebow • SMP (20 m)" },
      { id: slug("Horsebow Mahasiswa 30m"), name: "Horsebow • Mahasiswa (30 m)" },
    ],
  },

  {
    id: "bulu_tangkis",
    name: "Bulu Tangkis",
    categories: [
      { id: slug("SMP Tunggal Putra"), name: "SMP • Tunggal Putra" },
      { id: slug("SMP Tunggal Putri"), name: "SMP • Tunggal Putri" },
      { id: slug("SMP Ganda Putra"), name: "SMP • Ganda Putra" },
      { id: slug("SMP Ganda Putri"), name: "SMP • Ganda Putri" },
      { id: slug("SMP Beregu Putra"), name: "SMP • Beregu Putra" },
      { id: slug("SMP Beregu Putri"), name: "SMP • Beregu Putri" },

      { id: slug("SMA Tunggal Putra"), name: "SMA • Tunggal Putra" },
      { id: slug("SMA Tunggal Putri"), name: "SMA • Tunggal Putri" },
      { id: slug("SMA Ganda Putra"), name: "SMA • Ganda Putra" },
      { id: slug("SMA Ganda Putri"), name: "SMA • Ganda Putri" },
      { id: slug("SMA Beregu Putra"), name: "SMA • Beregu Putra" },
      { id: slug("SMA Beregu Putri"), name: "SMA • Beregu Putri" },
    ],
  },

  {
    id: "tenis_meja",
    name: "Tenis Meja",
    categories: [
      { id: slug("Tunggal Putra"), name: "Tunggal Putra" },
      { id: slug("Tunggal Putri"), name: "Tunggal Putri" },
      { id: slug("Ganda Putra"), name: "Ganda Putra" },
      { id: slug("Ganda Putri"), name: "Ganda Putri" },
      { id: slug("Ganda Campuran"), name: "Ganda Campuran" },
      { id: slug("Beregu Putra"), name: "Beregu Putra" },
      { id: slug("Beregu Putri"), name: "Beregu Putri" },
    ],
  },

  {
    id: "voli_indoor",
    name: "Voli Indoor",
    categories: [
      { id: slug("Beregu Putra"), name: "Beregu Putra" },
      { id: slug("Beregu Putri"), name: "Beregu Putri" },
    ],
  },
]