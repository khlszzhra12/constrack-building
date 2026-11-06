/**
 * CONSTRACK - Construction Project Monitoring & Management System
 * js/data.js - Default Indonesian Construction Simulation (Demo) Data
 * 
 * Data disiapkan sesuai dengan standar AHSP (Analisis Harga Satuan Pekerjaan)
 * dan praktik manajemen konstruksi di Indonesia.
 */

const DEFAULT_PROJECTS = [
  {
    id: "PRJ-001",
    nama: "Pembangunan Gedung Perkantoran 3 Lantai",
    lokasi: "Jl. Kaliurang KM 9, Sleman, D.I. Yogyakarta",
    jenis: "Bangunan Gedung Komersial",
    kontraktor: "PT Graha Konstruksi Nusantara",
    konsultan: "PT Artha Pengawas Rekayasa",
    owner: "PT Citra Mandiri Sejahtera",
    nomorKontrak: "602/KTR-PBG/CMS-GKN/VI/2026",
    nilaiKontrak: 2500000000, // Rp 2.500.000.000
    nilaiRAB: 2400000000,     // Rp 2.400.000.000
    tanggalMulai: "2026-06-01",
    tanggalSelesaiRencana: "2026-11-27", // 180 hari kalender
    tanggalSelesaiAktual: "2026-12-05", // Proyeksi aktual jika ada keterlambatan
    durasiRencanaHari: 180,
    durasiMinggu: 26,
    mingguBerjalan: 14,
    status: "Sedang Berlangsung",
    deskripsi: "Pekerjaan konstruksi gedung kantor 3 lantai struktur beton bertulang dengan luas total lantai 720 m², termasuk pekerjaan arsitektur, MEP, dan lansekap halaman parkir.",
    isDemo: true
  },
  {
    id: "PRJ-002",
    nama: "Renovasi & Perluasan Gudang Logistik",
    lokasi: "Kawasan Industri Kendal, Jawa Tengah",
    jenis: "Bangunan Industri & Gudang",
    kontraktor: "PT Wijaya Bangun Perkasa",
    konsultan: "CV Rekatama Mandiri",
    owner: "PT Fast Express Logistik",
    nomorKontrak: "450/SPK-GDG/FEL/VII/2026",
    nilaiKontrak: 1850000000,
    nilaiRAB: 1750000000,
    tanggalMulai: "2026-07-15",
    tanggalSelesaiRencana: "2026-12-12",
    tanggalSelesaiAktual: "2026-12-12",
    durasiRencanaHari: 150,
    durasiMinggu: 22,
    mingguBerjalan: 8,
    status: "Sedang Berlangsung",
    deskripsi: "Proyek renovasi lantai gudang heavy-duty dengan floor hardener dan perluasan rangka baja WF bentang 24 meter.",
    isDemo: true
  }
];

// Detail Rencana Anggaran Biaya (RAB) default untuk PRJ-001 (Total = Rp 2.400.000.000)
const DEFAULT_RAB_ITEMS = [
  // --- DIVISI I: PEKERJAAN PERSIAPAN (Total: Rp 75.000.000) ---
  {
    id: "RAB-101",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Persiapan",
    kodePekerjaan: "1.01",
    uraian: "Pembersihan lahan dan perataan permukaan tanah",
    volume: 450,
    satuan: "m²",
    hargaSatuan: 25000,
    jumlahHarga: 11250000,
    tglMulaiRencana: "2026-06-01",
    tglSelesaiRencana: "2026-06-07",
    tglMulaiAktual: "2026-06-01",
    tglSelesaiAktual: "2026-06-06",
    progresRencana: 100,
    progresAktual: 100,
    status: "Selesai"
  },
  {
    id: "RAB-102",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Persiapan",
    kodePekerjaan: "1.02",
    uraian: "Pemasangan pagar pengaman proyek seng gelombang t=2m",
    volume: 120,
    satuan: "m'",
    hargaSatuan: 185000,
    jumlahHarga: 22200000,
    tglMulaiRencana: "2026-06-03",
    tglSelesaiRencana: "2026-06-12",
    tglMulaiAktual: "2026-06-03",
    tglSelesaiAktual: "2026-06-11",
    progresRencana: 100,
    progresAktual: 100,
    status: "Selesai"
  },
  {
    id: "RAB-103",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Persiapan",
    kodePekerjaan: "1.03",
    uraian: "Pembuatan Direksi Keet, barak pekerja, dan gudang material",
    volume: 48,
    satuan: "m²",
    hargaSatuan: 650000,
    jumlahHarga: 31200000,
    tglMulaiRencana: "2026-06-05",
    tglSelesaiRencana: "2026-06-18",
    tglMulaiAktual: "2026-06-06",
    tglSelesaiAktual: "2026-06-19",
    progresRencana: 100,
    progresAktual: 100,
    status: "Selesai"
  },
  {
    id: "RAB-104",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Persiapan",
    kodePekerjaan: "1.04",
    uraian: "Pengukuran, pasang bouwplank & patok elevasi theodolite",
    volume: 145,
    satuan: "m'",
    hargaSatuan: 71379.31,
    jumlahHarga: 10350000,
    tglMulaiRencana: "2026-06-15",
    tglSelesaiRencana: "2026-06-21",
    tglMulaiAktual: "2026-06-15",
    tglSelesaiAktual: "2026-06-20",
    progresRencana: 100,
    progresAktual: 100,
    status: "Selesai"
  },

  // --- DIVISI II: PEKERJAAN TANAH (Total: Rp 65.000.000) ---
  {
    id: "RAB-201",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Tanah",
    kodePekerjaan: "2.01",
    uraian: "Galian tanah pondasi tapak & sloof dengan mini excavator",
    volume: 380,
    satuan: "m³",
    hargaSatuan: 95000,
    jumlahHarga: 36100000,
    tglMulaiRencana: "2026-06-20",
    tglSelesaiRencana: "2026-07-05",
    tglMulaiAktual: "2026-06-21",
    tglSelesaiAktual: "2026-07-06",
    progresRencana: 100,
    progresAktual: 100,
    status: "Selesai"
  },
  {
    id: "RAB-202",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Tanah",
    kodePekerjaan: "2.02",
    uraian: "Urugan pasir bawah pondasi tebal 10 cm dipadatkan",
    volume: 65,
    satuan: "m³",
    hargaSatuan: 220000,
    jumlahHarga: 14300000,
    tglMulaiRencana: "2026-07-01",
    tglSelesaiRencana: "2026-07-10",
    tglMulaiAktual: "2026-07-02",
    tglSelesaiAktual: "2026-07-11",
    progresRencana: 100,
    progresAktual: 100,
    status: "Selesai"
  },
  {
    id: "RAB-203",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Tanah",
    kodePekerjaan: "2.03",
    uraian: "Urugan tanah kembali dan pemadatan stamper per lapis",
    volume: 240,
    satuan: "m³",
    hargaSatuan: 60833.33,
    jumlahHarga: 14600000,
    tglMulaiRencana: "2026-07-15",
    tglSelesaiRencana: "2026-07-30",
    tglMulaiAktual: "2026-07-18",
    tglSelesaiAktual: "2026-08-02",
    progresRencana: 100,
    progresAktual: 100,
    status: "Selesai"
  },

  // --- DIVISI III: PEKERJAAN PONDASI (Total: Rp 280.000.000) ---
  {
    id: "RAB-301",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Pondasi",
    kodePekerjaan: "3.01",
    uraian: "Pekerjaan Strauss Pile dia 40 cm kedalaman 8 meter (32 titik)",
    volume: 256,
    satuan: "m'",
    hargaSatuan: 475000,
    jumlahHarga: 121600000,
    tglMulaiRencana: "2026-07-05",
    tglSelesaiRencana: "2026-07-25",
    tglMulaiAktual: "2026-07-07",
    tglSelesaiAktual: "2026-07-28",
    progresRencana: 100,
    progresAktual: 100,
    status: "Selesai"
  },
  {
    id: "RAB-302",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Pondasi",
    kodePekerjaan: "3.02",
    uraian: "Pondasi Batu Belah 1:4 jalur keliling bangunan",
    volume: 85,
    satuan: "m³",
    hargaSatuan: 850000,
    jumlahHarga: 72250000,
    tglMulaiRencana: "2026-07-12",
    tglSelesaiRencana: "2026-07-28",
    tglMulaiAktual: "2026-07-14",
    tglSelesaiAktual: "2026-07-31",
    progresRencana: 100,
    progresAktual: 100,
    status: "Selesai"
  },
  {
    id: "RAB-303",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Pondasi",
    kodePekerjaan: "3.03",
    uraian: "Pekerjaan Pile Cap beton bertulang K-300 & bekisting",
    volume: 42,
    satuan: "m³",
    hargaSatuan: 2051190.48,
    jumlahHarga: 86150000,
    tglMulaiRencana: "2026-07-20",
    tglSelesaiRencana: "2026-08-05",
    tglMulaiAktual: "2026-07-22",
    tglSelesaiAktual: "2026-08-08",
    progresRencana: 100,
    progresAktual: 100,
    status: "Selesai"
  },

  // --- DIVISI IV: PEKERJAAN STRUKTUR (Total: Rp 920.000.000) ---
  {
    id: "RAB-401",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Struktur",
    kodePekerjaan: "4.01",
    uraian: "Sloof beton bertulang S1 25/40 cm beton K-300",
    volume: 38,
    satuan: "m³",
    hargaSatuan: 4600000,
    jumlahHarga: 174800000,
    tglMulaiRencana: "2026-07-28",
    tglSelesaiRencana: "2026-08-16",
    tglMulaiAktual: "2026-08-01",
    tglSelesaiAktual: "2026-08-20",
    progresRencana: 100,
    progresAktual: 100,
    status: "Selesai"
  },
  {
    id: "RAB-402",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Struktur",
    kodePekerjaan: "4.02",
    uraian: "Kolom beton bertulang K1 40/40 cm Lantai 1, 2, 3 beton K-300",
    volume: 58,
    satuan: "m³",
    hargaSatuan: 5100000,
    jumlahHarga: 295800000,
    tglMulaiRencana: "2026-08-10",
    tglSelesaiRencana: "2026-09-25",
    tglMulaiAktual: "2026-08-15",
    tglSelesaiAktual: "2026-10-05",
    progresRencana: 100,
    progresAktual: 90,
    status: "Sedang Berlangsung"
  },
  {
    id: "RAB-403",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Struktur",
    kodePekerjaan: "4.03",
    uraian: "Balok beton bertulang B1 30/50 cm & B2 20/40 cm beton K-300",
    volume: 48,
    satuan: "m³",
    hargaSatuan: 4950000,
    jumlahHarga: 237600000,
    tglMulaiRencana: "2026-08-22",
    tglSelesaiRencana: "2026-10-10",
    tglMulaiAktual: "2026-08-28",
    tglSelesaiAktual: "2026-10-18",
    progresRencana: 95,
    progresAktual: 85,
    status: "Sedang Berlangsung"
  },
  {
    id: "RAB-404",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Struktur",
    kodePekerjaan: "4.04",
    uraian: "Pelat lantai beton bertulang t=12 cm wiremesh M8 double & bondek",
    volume: 36,
    satuan: "m³",
    hargaSatuan: 4850000,
    jumlahHarga: 174600000,
    tglMulaiRencana: "2026-08-28",
    tglSelesaiRencana: "2026-10-15",
    tglMulaiAktual: "2026-09-02",
    tglSelesaiAktual: "2026-10-25",
    progresRencana: 90,
    progresAktual: 75,
    status: "Sedang Berlangsung"
  },
  {
    id: "RAB-405",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Struktur",
    kodePekerjaan: "4.05",
    uraian: "Tangga beton bertulang lantai 1 ke 2 dan lantai 2 ke 3",
    volume: 8.5,
    satuan: "m³",
    hargaSatuan: 4376470.59,
    jumlahHarga: 37200000,
    tglMulaiRencana: "2026-09-10",
    tglSelesaiRencana: "2026-10-05",
    tglMulaiAktual: "2026-09-15",
    tglSelesaiAktual: "2026-10-12",
    progresRencana: 90,
    progresAktual: 80,
    status: "Sedang Berlangsung"
  },

  // --- DIVISI V: PEKERJAAN DINDING & ARSITEKTUR (Total: Rp 380.000.000) ---
  {
    id: "RAB-501",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Dinding & Arsitektur",
    kodePekerjaan: "5.01",
    uraian: "Pasangan dinding bata ringan Hebel t=10 cm + mortar instan",
    volume: 1350,
    satuan: "m²",
    hargaSatuan: 135000,
    jumlahHarga: 182250000,
    tglMulaiRencana: "2026-09-15",
    tglSelesaiRencana: "2026-10-30",
    tglMulaiAktual: "2026-09-20",
    tglSelesaiAktual: "2026-11-05",
    progresRencana: 50,
    progresAktual: 40,
    status: "Sedang Berlangsung"
  },
  {
    id: "RAB-502",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Dinding & Arsitektur",
    kodePekerjaan: "5.02",
    uraian: "Plesteran dan acian dinding mortar semen instan tebal 15 mm",
    volume: 2400,
    satuan: "m²",
    hargaSatuan: 54000,
    jumlahHarga: 129600000,
    tglMulaiRencana: "2026-09-25",
    tglSelesaiRencana: "2026-11-10",
    tglMulaiAktual: "2026-10-01",
    tglSelesaiAktual: "2026-11-15",
    progresRencana: 30,
    progresAktual: 20,
    status: "Sedang Berlangsung"
  },
  {
    id: "RAB-503",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Dinding & Arsitektur",
    kodePekerjaan: "5.03",
    uraian: "Kusen pintu & jendela aluminium 4 inch powder coating + kaca 6 mm",
    volume: 72,
    satuan: "unit",
    hargaSatuan: 946527.78,
    jumlahHarga: 68150000,
    tglMulaiRencana: "2026-10-10",
    tglSelesaiRencana: "2026-11-18",
    tglMulaiAktual: "2026-10-18",
    tglSelesaiAktual: "2026-11-25",
    progresRencana: 15,
    progresAktual: 10,
    status: "Sedang Berlangsung"
  },

  // --- DIVISI VI: PEKERJAAN ATAP (Total: Rp 160.000.000) ---
  {
    id: "RAB-601",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Atap",
    kodePekerjaan: "6.01",
    uraian: "Rangka atap baja ringan profil C75/0.75 SNI & reng",
    volume: 280,
    satuan: "m²",
    hargaSatuan: 265000,
    jumlahHarga: 74200000,
    tglMulaiRencana: "2026-10-01",
    tglSelesaiRencana: "2026-10-22",
    tglMulaiAktual: "2026-10-08",
    tglSelesaiAktual: "2026-10-30",
    progresRencana: 45,
    progresAktual: 30,
    status: "Sedang Berlangsung"
  },
  {
    id: "RAB-602",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Atap",
    kodePekerjaan: "6.02",
    uraian: "Penutup atap genteng metal berpasir + insulator aluminium foil",
    volume: 280,
    satuan: "m²",
    hargaSatuan: 195000,
    jumlahHarga: 54600000,
    tglMulaiRencana: "2026-10-15",
    tglSelesaiRencana: "2026-11-02",
    tglMulaiAktual: "2026-10-22",
    tglSelesaiAktual: "2026-11-10",
    progresRencana: 10,
    progresAktual: 0,
    status: "Belum Dimulai"
  },
  {
    id: "RAB-603",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Atap",
    kodePekerjaan: "6.03",
    uraian: "Lisplank kalsiboard 2x20 cm & talang jurai seng BJLS 30",
    volume: 110,
    satuan: "m'",
    hargaSatuan: 283636.36,
    jumlahHarga: 31200000,
    tglMulaiRencana: "2026-10-20",
    tglSelesaiRencana: "2026-11-05",
    tglMulaiAktual: "2026-10-28",
    tglSelesaiAktual: "2026-11-15",
    progresRencana: 0,
    progresAktual: 0,
    status: "Belum Dimulai"
  },

  // --- DIVISI VII: PEKERJAAN MEP (Total: Rp 290.000.000) ---
  {
    id: "RAB-701",
    projectId: "PRJ-001",
    divisi: "Pekerjaan MEP",
    kodePekerjaan: "7.01",
    uraian: "Instalasi pipa air bersih PPR & pipa air kotor PVC AW Rucika",
    volume: 1,
    satuan: "ls",
    hargaSatuan: 78500000,
    jumlahHarga: 78500000,
    tglMulaiRencana: "2026-09-20",
    tglSelesaiRencana: "2026-11-15",
    tglMulaiAktual: "2026-09-25",
    tglSelesaiAktual: "2026-11-20",
    progresRencana: 35,
    progresAktual: 25,
    status: "Sedang Berlangsung"
  },
  {
    id: "RAB-702",
    projectId: "PRJ-001",
    divisi: "Pekerjaan MEP",
    kodePekerjaan: "7.02",
    uraian: "Instalasi titik lampu kabel NYM Supreme 3x2.5mm & stop kontak",
    volume: 180,
    satuan: "titik",
    hargaSatuan: 325000,
    jumlahHarga: 58500000,
    tglMulaiRencana: "2026-09-25",
    tglSelesaiRencana: "2026-11-15",
    tglMulaiAktual: "2026-10-02",
    tglSelesaiAktual: "2026-11-20",
    progresRencana: 25,
    progresAktual: 15,
    status: "Sedang Berlangsung"
  },
  {
    id: "RAB-703",
    projectId: "PRJ-001",
    divisi: "Pekerjaan MEP",
    kodePekerjaan: "7.03",
    uraian: "Panel Listrik Utama (MDP) & Sub Panel tiap lantai Schneider",
    volume: 4,
    satuan: "unit",
    hargaSatuan: 16500000,
    jumlahHarga: 66000000,
    tglMulaiRencana: "2026-10-15",
    tglSelesaiRencana: "2026-11-20",
    tglMulaiAktual: "2026-10-25",
    tglSelesaiAktual: "2026-11-25",
    progresRencana: 0,
    progresAktual: 0,
    status: "Belum Dimulai"
  },
  {
    id: "RAB-704",
    projectId: "PRJ-001",
    divisi: "Pekerjaan MEP",
    kodePekerjaan: "7.04",
    uraian: "Pekerjaan Bio Septic Tank kapasitas 5000 liter + resapan",
    volume: 1,
    satuan: "unit",
    hargaSatuan: 37000000,
    jumlahHarga: 37000000,
    tglMulaiRencana: "2026-08-15",
    tglSelesaiRencana: "2026-09-05",
    tglMulaiAktual: "2026-08-18",
    tglSelesaiAktual: "2026-09-08",
    progresRencana: 100,
    progresAktual: 100,
    status: "Selesai"
  },
  {
    id: "RAB-705",
    projectId: "PRJ-001",
    divisi: "Pekerjaan MEP",
    kodePekerjaan: "7.05",
    uraian: "Pipa refrigran AC Split Duct & drainase AC seluruh lantai",
    volume: 1,
    satuan: "ls",
    hargaSatuan: 50000000,
    jumlahHarga: 50000000,
    tglMulaiRencana: "2026-10-05",
    tglSelesaiRencana: "2026-11-20",
    tglMulaiAktual: "2026-10-12",
    tglSelesaiAktual: "2026-11-25",
    progresRencana: 20,
    progresAktual: 10,
    status: "Sedang Berlangsung"
  },

  // --- DIVISI VIII: PEKERJAAN FINISHING (Total: Rp 230.000.000) ---
  {
    id: "RAB-801",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Finishing",
    kodePekerjaan: "8.01",
    uraian: "Penutup lantai homogenus tile Granit 60x60 cm unpolished & polished",
    volume: 680,
    satuan: "m²",
    hargaSatuan: 225000,
    jumlahHarga: 153000000,
    tglMulaiRencana: "2026-10-25",
    tglSelesaiRencana: "2026-11-24",
    tglMulaiAktual: "2026-11-01",
    tglSelesaiAktual: "2026-11-28",
    progresRencana: 0,
    progresAktual: 0,
    status: "Belum Dimulai"
  },
  {
    id: "RAB-802",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Finishing",
    kodePekerjaan: "8.02",
    uraian: "Pengecatan dinding interior & eksterior weathershield Dulux",
    volume: 2400,
    satuan: "m²",
    hargaSatuan: 22500,
    jumlahHarga: 54000000,
    tglMulaiRencana: "2026-11-01",
    tglSelesaiRencana: "2026-11-25",
    tglMulaiAktual: "2026-11-05",
    tglSelesaiAktual: "2026-11-28",
    progresRencana: 0,
    progresAktual: 0,
    status: "Belum Dimulai"
  },
  {
    id: "RAB-803",
    projectId: "PRJ-001",
    divisi: "Pekerjaan Finishing",
    kodePekerjaan: "8.03",
    uraian: "Sanitary ware kloset duduk Toto, wastafel, kran, dan urinal",
    volume: 12,
    satuan: "set",
    hargaSatuan: 1916666.67,
    jumlahHarga: 23000000,
    tglMulaiRencana: "2026-11-10",
    tglSelesaiRencana: "2026-11-26",
    tglMulaiAktual: "2026-11-15",
    tglSelesaiAktual: "2026-11-28",
    progresRencana: 0,
    progresAktual: 0,
    status: "Belum Dimulai"
  }
];

// Riwayat Biaya Aktual (Expenses Log)
const DEFAULT_EXPENSES = [
  {
    id: "EXP-001",
    projectId: "PRJ-001",
    tanggal: "2026-06-10",
    noBukti: "BKK-06/001",
    kategori: "Pekerjaan Persiapan",
    uraian: "Sewa alat berat pembersihan lahan & striping tanah",
    nominal: 11000000,
    vendor: "CV Jogja Alat Perkasa",
    metodeBayar: "Transfer Bank BCA"
  },
  {
    id: "EXP-002",
    projectId: "PRJ-001",
    tanggal: "2026-06-18",
    noBukti: "BKK-06/002",
    kategori: "Pekerjaan Persiapan",
    uraian: "Pengadaan seng gelombang, kayu kaso, dan tenda kerja direksi keet",
    nominal: 51200000,
    vendor: "TB Lestari Makmur",
    metodeBayar: "Transfer Bank Mandiri"
  },
  {
    id: "EXP-003",
    projectId: "PRJ-001",
    tanggal: "2026-06-25",
    noBukti: "BKK-06/003",
    kategori: "Pekerjaan Persiapan",
    uraian: "Honorarium juru ukur topografi & sewa Total Station",
    nominal: 9800000,
    vendor: "Geotama Surveying",
    metodeBayar: "Transfer Bank BCA"
  },
  {
    id: "EXP-004",
    projectId: "PRJ-001",
    tanggal: "2026-07-08",
    noBukti: "BKK-07/001",
    kategori: "Pekerjaan Tanah",
    uraian: "Sewa mini excavator Komatsu PC78 & solar industri 14 hari",
    nominal: 35500000,
    vendor: "PT Sumber Roda Bumi",
    metodeBayar: "Transfer Bank Mandiri"
  },
  {
    id: "EXP-005",
    projectId: "PRJ-001",
    tanggal: "2026-07-16",
    noBukti: "BKK-07/002",
    kategori: "Pekerjaan Tanah",
    uraian: "Pengadaan pasir urug 12 dump truck ritase",
    nominal: 13800000,
    vendor: "Koperasi Tambang Merapi",
    metodeBayar: "Tunai Kas Proyek"
  },
  {
    id: "EXP-006",
    projectId: "PRJ-001",
    tanggal: "2026-07-28",
    noBukti: "BKK-07/003",
    kategori: "Pekerjaan Pondasi",
    uraian: "Pekerjaan pemborongan Strauss Pile dia 40cm kedalaman 8m (Termin 100%)",
    nominal: 118000000,
    vendor: "Mandiri Bored Pile Spesialis",
    metodeBayar: "Transfer Bank BCA"
  },
  {
    id: "EXP-007",
    projectId: "PRJ-001",
    tanggal: "2026-07-31",
    noBukti: "BKK-07/004",
    kategori: "Pekerjaan Pondasi",
    uraian: "Pengadaan batu belah kali 90 m3 dan semen Padang 250 zak",
    nominal: 69500000,
    vendor: "TB Lestari Makmur",
    metodeBayar: "Transfer Bank Mandiri"
  },
  {
    id: "EXP-008",
    projectId: "PRJ-001",
    tanggal: "2026-08-08",
    noBukti: "BKK-08/001",
    kategori: "Pekerjaan Pondasi",
    uraian: "Beton Ready Mix K-300 Slump 12±2 untuk pile cap 42 m³ + pompa beton",
    nominal: 83500000,
    vendor: "PT Varia Usaha Beton",
    metodeBayar: "Transfer Bank Mandiri"
  },
  {
    id: "EXP-009",
    projectId: "PRJ-001",
    tanggal: "2026-08-20",
    noBukti: "BKK-08/002",
    kategori: "Pekerjaan Struktur",
    uraian: "Besi beton ulir BJTD 40 dia 13, 16, 19 dan besi polos dia 8, 10 mm (Tahap 1)",
    nominal: 185000000,
    vendor: "PT Master Baja Indonesia",
    metodeBayar: "Transfer Bank BCA"
  },
  {
    id: "EXP-010",
    projectId: "PRJ-001",
    tanggal: "2026-09-02",
    noBukti: "BKK-09/001",
    kategori: "Pekerjaan Struktur",
    uraian: "Ready Mix K-300 untuk sloof dan kolom lantai 1 (55 m³)",
    nominal: 115000000,
    vendor: "PT Varia Usaha Beton",
    metodeBayar: "Transfer Bank Mandiri"
  },
  {
    id: "EXP-011",
    projectId: "PRJ-001",
    tanggal: "2026-09-18",
    noBukti: "BKK-09/002",
    kategori: "Pekerjaan Struktur",
    uraian: "Besi beton ulir BJTD 40 & bondek 0.75mm + wiremesh M8 (Tahap 2)",
    nominal: 165000000,
    vendor: "PT Master Baja Indonesia",
    metodeBayar: "Transfer Bank BCA"
  },
  {
    id: "EXP-012",
    projectId: "PRJ-001",
    tanggal: "2026-09-28",
    noBukti: "BKK-09/003",
    kategori: "Pekerjaan Struktur",
    uraian: "Sewa perancah scaffolding 800 set 1 bulan + mobilisasi",
    nominal: 28000000,
    vendor: "Sewa Scaffolding Jogja",
    metodeBayar: "Transfer Bank BCA"
  },
  {
    id: "EXP-013",
    projectId: "PRJ-001",
    tanggal: "2026-10-05",
    noBukti: "BKK-10/001",
    kategori: "Pekerjaan Struktur",
    uraian: "Pengecoran pelat lantai 2 & 3 beton K-300 (68 m³) dengan boom pump",
    nominal: 142000000,
    vendor: "PT Varia Usaha Beton",
    metodeBayar: "Transfer Bank Mandiri"
  },
  {
    id: "EXP-014",
    projectId: "PRJ-001",
    tanggal: "2026-10-12",
    noBukti: "BKK-10/002",
    kategori: "Pekerjaan Dinding & Arsitektur",
    uraian: "Bata ringan Hebel 80 m³ + lem mortar perekat 120 sak",
    nominal: 74000000,
    vendor: "PT Blesscon Beton Ringan",
    metodeBayar: "Transfer Bank Mandiri"
  },
  {
    id: "EXP-015",
    projectId: "PRJ-001",
    tanggal: "2026-10-20",
    noBukti: "BKK-10/003",
    kategori: "Pekerjaan MEP",
    uraian: "Pengadaan bio septic tank 5000L + pipa PVC Rucika AW & fitting",
    nominal: 62000000,
    vendor: "PT Pipa Jaya Abadi",
    metodeBayar: "Transfer Bank BCA"
  },
  {
    id: "EXP-016",
    projectId: "PRJ-001",
    tanggal: "2026-10-28",
    noBukti: "BKK-10/004",
    kategori: "Pekerjaan Atap",
    uraian: "Baja ringan C75.75 TASO SNI + reng + sekrup self-drilling (Tahap 1)",
    nominal: 24700000,
    vendor: "Toko Baja TASO Yogya",
    metodeBayar: "Transfer Bank BCA"
  },
  {
    id: "EXP-017",
    projectId: "PRJ-001",
    tanggal: "2026-11-02",
    noBukti: "BKK-11/001",
    kategori: "Pekerjaan MEP",
    uraian: "Kabel NYM Supreme 3x2.5mm roll, pipa conduit EGA, kabel tray",
    nominal: 31000000,
    vendor: "Sentra Listrik Yogyakarta",
    metodeBayar: "Transfer Bank Mandiri"
  },
  {
    id: "EXP-018",
    projectId: "PRJ-001",
    tanggal: "2026-11-04",
    noBukti: "BKK-11/002",
    kategori: "Upah Tenaga Kerja",
    uraian: "Upah mandor, tukang batu, tukang besi, tukang cor (Opname Periode Oktober)",
    nominal: 63000000,
    vendor: "Mandor Sutrisno Group",
    metodeBayar: "Transfer Bank BRI"
  }
];

// Arus Kas Bulanan (Cash Flow Planning & Realization)
const DEFAULT_CASH_FLOW = [
  {
    id: "CF-M01",
    projectId: "PRJ-001",
    bulan: "Bulan 1 (Juni 2026)",
    pemasukanRencana: 500000000, // Uang Muka (DP) 20% dari Nilai Kontrak
    pemasukanAktual: 500000000,
    uraianPemasukan: "Uang Muka (DP 20%) Kontrak Fisik",
    pengeluaranRencana: 95000000,
    pengeluaranAktual: 72000000,
    rincianPengeluaran: "Persiapan, Mobilisasi, Direksi Keet, Bowplank",
    keterangan: "Penerimaan DP tepat waktu sesuai BAST DP"
  },
  {
    id: "CF-M02",
    projectId: "PRJ-001",
    bulan: "Bulan 2 (Juli 2026)",
    pemasukanRencana: 0,
    pemasukanAktual: 0,
    uraianPemasukan: "Belum jatuh tempo termin",
    pengeluaranRencana: 260000000,
    pengeluaranAktual: 236800000,
    rincianPengeluaran: "Galian Tanah, Strauss Pile, Urugan, Pondasi Batu Kali",
    keterangan: "Pengeluaran pondasi dalam berjalan lancar"
  },
  {
    id: "CF-M03",
    projectId: "PRJ-001",
    bulan: "Bulan 3 (Agustus 2026)",
    pemasukanRencana: 625000000, // Termin I (25%) jika progres capai 25%
    pemasukanAktual: 625000000,
    uraianPemasukan: "Termin I (25%) Bobot Capaian Progres > 25%",
    pengeluaranRencana: 380000000,
    pengeluaranAktual: 352000000,
    rincianPengeluaran: "Besi Struktur Lt 1 & 2, Pile Cap, Ready Mix Sloof",
    keterangan: "Pencairan Termin I disetujui konsultan MK"
  },
  {
    id: "CF-M04",
    projectId: "PRJ-001",
    bulan: "Bulan 4 (September 2026)",
    pemasukanRencana: 0,
    pemasukanAktual: 0,
    uraianPemasukan: "Belum jatuh tempo termin",
    pengeluaranRencana: 450000000,
    pengeluaranAktual: 308000000,
    rincianPengeluaran: "Ready Mix Kolom, Balok, Bondek, Scaffolding, Dinding Hebel",
    keterangan: "Pekerjaan struktur lantai 2 & 3 intensif"
  },
  {
    id: "CF-M05",
    projectId: "PRJ-001",
    bulan: "Bulan 5 (Oktober 2026)",
    pemasukanRencana: 625000000, // Termin II (25%) saat bobot > 50%
    pemasukanAktual: 625000000,
    uraianPemasukan: "Termin II (25%) Bobot Capaian Progres > 50%",
    pengeluaranRencana: 520000000,
    pengeluaranAktual: 311200000,
    rincianPengeluaran: "Dinding, Plesteran, Baja Ringan Atap, Bio Septic Tank, MEP awal",
    keterangan: "Termin II cair setelah verifikasi opname fisik"
  },
  {
    id: "CF-M06",
    projectId: "PRJ-001",
    bulan: "Bulan 6 (November 2026)",
    pemasukanRencana: 500000000, // Termin III (20%) saat 100% fisik
    pemasukanAktual: 0, // Belum cair
    uraianPemasukan: "Termin III (20%) Serah Terima Pertama (PHO)",
    pengeluaranRencana: 445000000,
    pengeluaranAktual: 0,
    rincianPengeluaran: "Finishing Lantai, Pengecatan, Kusen Aluminium, PHO",
    keterangan: "Proyeksi penyelesaian fisik akhir November"
  },
  {
    id: "CF-M07",
    projectId: "PRJ-001",
    bulan: "Masa Pemeliharaan (Retensi)",
    pemasukanRencana: 250000000, // Retensi 10% saat FHO
    pemasukanAktual: 0,
    uraianPemasukan: "Retensi 10% setelah masa pemeliharaan 180 hari",
    pengeluaranRencana: 30000000,
    pengeluaranAktual: 0,
    rincianPengeluaran: "Pekerjaan garansi pemeliharaan & perbaikan cacat minor",
    keterangan: "Klaim pencairan retensi setelah FHO disetujui"
  }
];

// Baseline Data Kurva S Mingguan (26 Minggu)
// Progres Rencana Kumulatif dirancang mengikuti distribusi Sigmoid (Kurva S standar konstruksi)
// Progres Aktual dicatat sampai Minggu 14 (minggu saat ini)
const DEFAULT_S_CURVE = [
  { minggu: 1, label: "M-01", rencanaKumulatif: 0.85, aktualKumulatif: 0.95 },
  { minggu: 2, label: "M-02", rencanaKumulatif: 2.10, aktualKumulatif: 2.25 },
  { minggu: 3, label: "M-03", rencanaKumulatif: 3.90, aktualKumulatif: 4.10 },
  { minggu: 4, label: "M-04", rencanaKumulatif: 6.45, aktualKumulatif: 6.60 },
  { minggu: 5, label: "M-05", rencanaKumulatif: 9.80, aktualKumulatif: 9.70 },
  { minggu: 6, label: "M-06", rencanaKumulatif: 13.90, aktualKumulatif: 13.40 },
  { minggu: 7, label: "M-07", rencanaKumulatif: 18.75, aktualKumulatif: 17.80 },
  { minggu: 8, label: "M-08", rencanaKumulatif: 24.30, aktualKumulatif: 23.10 },
  { minggu: 9, label: "M-09", rencanaKumulatif: 30.50, aktualKumulatif: 28.90 },
  { minggu: 10, label: "M-10", rencanaKumulatif: 37.20, aktualKumulatif: 35.10 },
  { minggu: 11, label: "M-11", rencanaKumulatif: 44.20, aktualKumulatif: 41.70 },
  { minggu: 12, label: "M-12", rencanaKumulatif: 51.30, aktualKumulatif: 48.20 },
  { minggu: 13, label: "M-13", rencanaKumulatif: 58.40, aktualKumulatif: 54.85 }, // Minggu berjalan
  { minggu: 14, label: "M-14", rencanaKumulatif: 65.20, aktualKumulatif: null },
  { minggu: 15, label: "M-15", rencanaKumulatif: 71.60, aktualKumulatif: null },
  { minggu: 16, label: "M-16", rencanaKumulatif: 77.40, aktualKumulatif: null },
  { minggu: 17, label: "M-17", rencanaKumulatif: 82.50, aktualKumulatif: null },
  { minggu: 18, label: "M-18", rencanaKumulatif: 86.80, aktualKumulatif: null },
  { minggu: 19, label: "M-19", rencanaKumulatif: 90.30, aktualKumulatif: null },
  { minggu: 20, label: "M-20", rencanaKumulatif: 93.10, aktualKumulatif: null },
  { minggu: 21, label: "M-21", rencanaKumulatif: 95.30, aktualKumulatif: null },
  { minggu: 22, label: "M-22", rencanaKumulatif: 97.00, aktualKumulatif: null },
  { minggu: 23, label: "M-23", rencanaKumulatif: 98.30, aktualKumulatif: null },
  { minggu: 24, label: "M-24", rencanaKumulatif: 99.20, aktualKumulatif: null },
  { minggu: 25, label: "M-25", rencanaKumulatif: 99.80, aktualKumulatif: null },
  { minggu: 26, label: "M-26", rencanaKumulatif: 100.00, aktualKumulatif: null }
];


// ===================================================================
// TEMPLATE PROYEK KONSTRUKSI BERDASARKAN JENIS (UNTUK MAHASISWA)
// ===================================================================
const CONSTRUCTION_TYPE_TEMPLATES = {
  "Bangunan Gedung": {
    namaDefault: "Pembangunan Gedung Kuliah Terpadu 4 Lantai",
    lokasiDefault: "Kampus Terpadu, Sleman, D.I. Yogyakarta",
    nilaiKontrakDefault: 3200000000,
    nilaiRABDefault: 3050000000,
    durasiHariDefault: 210,
    divisi: [
      "Pekerjaan Persiapan", "Pekerjaan Struktur Bawah", "Pekerjaan Struktur Atas",
      "Pekerjaan Dinding & Arsitektur", "Pekerjaan Atap", "Pekerjaan MEP", "Pekerjaan Finishing"
    ],
    items: [
      { divisi: "Pekerjaan Persiapan", kode: "1.01", uraian: "Pembersihan lahan, pengukuran & pasang bouwplank theodolite", volume: 600, satuan: "m²", harga: 32000, durasi: 14 },
      { divisi: "Pekerjaan Persiapan", kode: "1.02", uraian: "Pagar pengaman seng gelombang t=2m & direksi keet", volume: 150, satuan: "m'", harga: 195000, durasi: 21 },
      { divisi: "Pekerjaan Struktur Bawah", kode: "2.01", uraian: "Galian tanah pondasi & tiang pancang / mini pile 25x25 cm", volume: 320, satuan: "m'", harga: 420000, durasi: 35 },
      { divisi: "Pekerjaan Struktur Bawah", kode: "2.02", uraian: "Pile cap & sloof beton bertulang mutu K-300", volume: 65, satuan: "m³", harga: 4450000, durasi: 28 },
      { divisi: "Pekerjaan Struktur Atas", kode: "3.01", uraian: "Kolom beton bertulang K1 45/45 cm mutu K-300", volume: 82, satuan: "m³", harga: 5150000, durasi: 42 },
      { divisi: "Pekerjaan Struktur Atas", kode: "3.02", uraian: "Balok B1 30/60 & pelat lantai t=12 cm wiremesh M8", volume: 96, satuan: "m³", harga: 4950000, durasi: 45 },
      { divisi: "Pekerjaan Dinding & Arsitektur", kode: "4.01", uraian: "Dinding bata ringan hebel t=10 cm + mortar instan", volume: 1850, satuan: "m²", harga: 138000, durasi: 40 },
      { divisi: "Pekerjaan Dinding & Arsitektur", kode: "4.02", uraian: "Plesteran + acian dinding semen instan t=15 mm", volume: 3200, satuan: "m²", harga: 55000, durasi: 45 },
      { divisi: "Pekerjaan Atap", kode: "5.01", uraian: "Rangka atap baja ringan profil C75 & penutup genteng metal", volume: 380, satuan: "m²", harga: 285000, durasi: 25 },
      { divisi: "Pekerjaan MEP", kode: "6.01", uraian: "Instalasi pipa air bersih PPR & air kotor PVC AW Rucika", volume: 1, satuan: "ls", harga: 95000000, durasi: 35 },
      { divisi: "Pekerjaan MEP", kode: "6.02", uraian: "Instalasi titik lampu, stop kontak & panel distribusi listrik", volume: 220, satuan: "titik", harga: 345000, durasi: 30 },
      { divisi: "Pekerjaan Finishing", kode: "7.01", uraian: "Lantai homogenus tile Granit 60x60 cm polished", volume: 920, satuan: "m²", harga: 235000, durasi: 35 },
      { divisi: "Pekerjaan Finishing", kode: "7.02", uraian: "Pengecatan dinding interior & eksterior weathershield", volume: 3200, satuan: "m²", harga: 24000, durasi: 30 }
    ]
  },
  "Proyek Jalan": {
    namaDefault: "Peningkatan Jalan Kolektor Primer STA 0+000 s/d 2+500",
    lokasiDefault: "Ruas Jalan Wates - Kulon Progo, D.I. Yogyakarta",
    nilaiKontrakDefault: 4500000000,
    nilaiRABDefault: 4280000000,
    durasiHariDefault: 150,
    divisi: [
      "Divisi 1 - Umum", "Divisi 2 - Drainase Jalan", "Divisi 3 - Pekerjaan Tanah & Geoteknik",
      "Divisi 5 - Perkerasan Berbutir", "Divisi 6 - Perkerasan Aspal", "Divisi 8 - Perlengkapan Jalan"
    ],
    items: [
      { divisi: "Divisi 1 - Umum", kode: "1.01", uraian: "Manajemen rekayasa lalu lintas & keselamatan kerja (SMKK)", volume: 1, satuan: "ls", harga: 45000000, durasi: 150 },
      { divisi: "Divisi 2 - Drainase Jalan", kode: "2.01", uraian: "Galian untuk selokan drainase dan saluran air samping", volume: 850, satuan: "m³", harga: 68000, durasi: 30 },
      { divisi: "Divisi 2 - Drainase Jalan", kode: "2.02", uraian: "Saluran berbentuk U Tipe DS-1 pasangan batu dengan mortar", volume: 1200, satuan: "m'", harga: 385000, durasi: 45 },
      { divisi: "Divisi 3 - Pekerjaan Tanah & Geoteknik", kode: "3.01", uraian: "Galian perkerasan beraspal tanpa cold milling machine", volume: 620, satuan: "m³", harga: 82000, durasi: 25 },
      { divisi: "Divisi 3 - Pekerjaan Tanah & Geoteknik", kode: "3.02", uraian: "Timbunan pilihan dari sumber galian (borrow material)", volume: 1400, satuan: "m³", harga: 135000, durasi: 30 },
      { divisi: "Divisi 5 - Perkerasan Berbutir", kode: "5.01", uraian: "Lapis Pondasi Agregat Kelas A tebal 15 cm dipadatkan", volume: 2250, satuan: "m³", harga: 345000, durasi: 40 },
      { divisi: "Divisi 5 - Perkerasan Berbutir", kode: "5.02", uraian: "Lapis Pondasi Agregat Kelas B untuk bahu jalan tebal 15 cm", volume: 950, satuan: "m³", harga: 310000, durasi: 30 },
      { divisi: "Divisi 6 - Perkerasan Aspal", kode: "6.01", uraian: "Lapis Resap Pengikat (Prime Coat) aspal cair 0.8 L/m²", volume: 15000, satuan: "liter", harga: 18500, durasi: 20 },
      { divisi: "Divisi 6 - Perkerasan Aspal", kode: "6.02", uraian: "Lapis Antara Aspal Beton (AC-BC) tebal 6 cm", volume: 2150, satuan: "ton", harga: 1120000, durasi: 35 },
      { divisi: "Divisi 6 - Perkerasan Aspal", kode: "6.03", uraian: "Lapis Aus Aspal Beton (AC-WC) tebal 4 cm modifikasi", volume: 1450, satuan: "ton", harga: 1250000, durasi: 25 },
      { divisi: "Divisi 8 - Perlengkapan Jalan", kode: "8.01", uraian: "Marka jalan termoplastik putih & kuning garis tepi", volume: 850, satuan: "m²", harga: 165000, durasi: 15 },
      { divisi: "Divisi 8 - Perlengkapan Jalan", kode: "8.02", uraian: "Rambu petunjuk, peringatan & patok pengarah jalan SNI", volume: 45, satuan: "buah", harga: 750000, durasi: 10 }
    ]
  },
  "Proyek Jembatan": {
    namaDefault: "Pembangunan Jembatan Gelagar Beton Pratekan Bentang 24 M",
    lokasiDefault: "Sungai Oyo, Imogiri, Bantul, D.I. Yogyakarta",
    nilaiKontrakDefault: 5800000000,
    nilaiRABDefault: 5500000000,
    durasiHariDefault: 180,
    divisi: [
      "Pekerjaan Persiapan & K3", "Pondasi Jembatan", "Struktur Bawah (Substructure)",
      "Struktur Atas (Superstructure)", "Perkerasan & Finishing Jembatan"
    ],
    items: [
      { divisi: "Pekerjaan Persiapan & K3", kode: "1.01", uraian: "Kistdam / dewatering sungai & jembatan kerja darurat", volume: 1, satuan: "ls", harga: 120000000, durasi: 30 },
      { divisi: "Pondasi Jembatan", kode: "2.01", uraian: "Bored Pile dia 80 cm kedalaman 18 meter (24 titik)", volume: 432, satuan: "m'", harga: 1350000, durasi: 45 },
      { divisi: "Struktur Bawah (Substructure)", kode: "3.01", uraian: "Abutment beton bertulang mutu fc' 30 MPa (K-350)", volume: 180, satuan: "m³", harga: 4850000, durasi: 40 },
      { divisi: "Struktur Bawah (Substructure)", kode: "3.02", uraian: "Wing wall / dinding sayap penahan tanah jembatan", volume: 75, satuan: "m³", harga: 4650000, durasi: 25 },
      { divisi: "Struktur Atas (Superstructure)", kode: "4.01", uraian: "Balok Gelagar Pratekan PCI Girder H=140 cm L=24 m (5 balok)", volume: 5, satuan: "buah", harga: 310000000, durasi: 50 },
      { divisi: "Struktur Atas (Superstructure)", kode: "4.02", uraian: "Ereksi balok girder dengan crawler crane 80 ton & stressing", volume: 1, satuan: "ls", harga: 175000000, durasi: 20 },
      { divisi: "Struktur Atas (Superstructure)", kode: "4.03", uraian: "Pelat lantai jembatan beton bertulang fc' 30 MPa t=20 cm", volume: 88, satuan: "m³", harga: 5200000, durasi: 30 },
      { divisi: "Struktur Atas (Superstructure)", kode: "4.04", uraian: "Elastomeric Bearing Pad karet jembatan 400x450x55 mm", volume: 10, satuan: "buah", harga: 7500000, durasi: 10 },
      { divisi: "Struktur Atas (Superstructure)", kode: "4.05", uraian: "Expansion Joint tipe Asphaltic Plug SNI", volume: 18, satuan: "m'", harga: 2200000, durasi: 12 },
      { divisi: "Perkerasan & Finishing Jembatan", kode: "5.01", uraian: "Aspal AC-WC t=5 cm di atas lantai jembatan & waterproofing", volume: 220, satuan: "m²", harga: 260000, durasi: 15 },
      { divisi: "Perkerasan & Finishing Jembatan", kode: "5.02", uraian: "Railing jembatan pipa galvanis dia 3 inch & tiang sandaran", volume: 52, satuan: "m'", harga: 850000, durasi: 18 }
    ]
  },
  "Proyek Drainase": {
    namaDefault: "Pembangunan Saluran Drainase Perkotaan U-Ditch 1.5 KM",
    lokasiDefault: "Kecamatan Depok, Sleman, D.I. Yogyakarta",
    nilaiKontrakDefault: 1950000000,
    nilaiRABDefault: 1850000000,
    durasiHariDefault: 120,
    divisi: [
      "Pekerjaan Persiapan", "Pekerjaan Tanah Drainase", "Pekerjaan Struktur Precast", "Pekerjaan Pelengkap"
    ],
    items: [
      { divisi: "Pekerjaan Persiapan", kode: "1.01", uraian: "Pengukuran kemiringan saluran & pasang patok elevasi", volume: 1500, satuan: "m'", harga: 15000, durasi: 15 },
      { divisi: "Pekerjaan Tanah Drainase", kode: "2.01", uraian: "Galian tanah saluran drainase dengan mini excavator", volume: 1800, satuan: "m³", harga: 72000, durasi: 35 },
      { divisi: "Pekerjaan Tanah Drainase", kode: "2.02", uraian: "Pasir urug bawah saluran tebal 10 cm dipadatkan", volume: 180, satuan: "m³", harga: 215000, durasi: 25 },
      { divisi: "Pekerjaan Struktur Precast", kode: "3.01", uraian: "Pemasangan U-Ditch Precast Bertulang 80x80x120 cm", volume: 1250, satuan: "buah", harga: 785000, durasi: 60 },
      { divisi: "Pekerjaan Struktur Precast", kode: "3.02", uraian: "Pemasangan Cover U-Ditch Heavy Duty t=12 cm", volume: 1250, satuan: "buah", harga: 320000, durasi: 45 },
      { divisi: "Pekerjaan Struktur Precast", kode: "3.03", uraian: "Pengecoran siar sambungan antar U-Ditch mortar kedap air", volume: 1500, satuan: "m'", harga: 38000, durasi: 40 },
      { divisi: "Pekerjaan Pelengkap", kode: "4.01", uraian: "Pembangunan Manhole / Bak Kontrol cor beton bertulang", volume: 15, satuan: "unit", harga: 3500000, durasi: 25 },
      { divisi: "Pekerjaan Pelengkap", kode: "4.02", uraian: "Inlet tangkapan air jalan besi grill siku grating", volume: 30, satuan: "titik", harga: 950000, durasi: 20 }
    ]
  },
  "Proyek Irigasi": {
    namaDefault: "Rehabilitasi Jaringan Saluran Irigasi Sekunder 3.0 KM",
    lokasiDefault: "Daerah Irigasi Selokan Mataram, Kalasan, Sleman",
    nilaiKontrakDefault: 1650000000,
    nilaiRABDefault: 1550000000,
    durasiHariDefault: 120,
    divisi: [
      "Pekerjaan Persiapan", "Pekerjaan Tanah & Normalisasi", "Pekerjaan Pasangan Batu", "Pekerjaan Bangunan Air"
    ],
    items: [
      { divisi: "Pekerjaan Persiapan", kode: "1.01", uraian: "Pengeringan saluran (kistdam karung pasir & pompa alir)", volume: 1, satuan: "ls", harga: 35000000, durasi: 30 },
      { divisi: "Pekerjaan Tanah & Normalisasi", kode: "2.01", uraian: "Pembersihan endapan sedimentasi lumpur saluran irigasi", volume: 2200, satuan: "m³", harga: 48000, durasi: 40 },
      { divisi: "Pekerjaan Tanah & Normalisasi", kode: "2.02", uraian: "Galian tanah talud saluran & perapihan profil trapesium", volume: 1100, satuan: "m³", harga: 58000, durasi: 35 },
      { divisi: "Pekerjaan Pasangan Batu", kode: "3.01", uraian: "Pasangan batu belah kali mortar 1:4 lining saluran t=25cm", volume: 950, satuan: "m³", harga: 865000, durasi: 65 },
      { divisi: "Pekerjaan Pasangan Batu", kode: "3.02", uraian: "Plesteran dan siar mortar 1:3 tebal 15 mm kedap air", volume: 4200, satuan: "m²", harga: 52000, durasi: 50 },
      { divisi: "Pekerjaan Bangunan Air", kode: "4.01", uraian: "Pintu air sorong baja ulir tunggal plat 6mm dia 60 cm", volume: 6, satuan: "unit", harga: 14500000, durasi: 20 },
      { divisi: "Pekerjaan Bangunan Air", kode: "4.02", uraian: "Rehabilitasi mercu bagi beton bertulang fc' 20 MPa", volume: 25, satuan: "m³", harga: 3800000, durasi: 25 }
    ]
  },
  "Proyek Infrastruktur Lainnya": {
    namaDefault: "Penataan Kawasan & Infrastruktur Ruang Publik Kampus",
    lokasiDefault: "Kawasan Boulevard Kampus Teknik, Yogyakarta",
    nilaiKontrakDefault: 1400000000,
    nilaiRABDefault: 1320000000,
    durasiHariDefault: 90,
    divisi: [
      "Pekerjaan Tanah & Pondasi", "Pekerjaan Perkerasan Paving", "Pekerjaan Lansekap & Utilitas"
    ],
    items: [
      { divisi: "Pekerjaan Tanah & Pondasi", kode: "1.01", uraian: "Kupas tanah humus tebal 20 cm & perataan tanah dasar", volume: 1200, satuan: "m²", harga: 22000, durasi: 15 },
      { divisi: "Pekerjaan Tanah & Pondasi", kode: "1.02", uraian: "Lapisan Geotekstil Woven penahan diferensiasi tanah", volume: 1200, satuan: "m²", harga: 28000, durasi: 12 },
      { divisi: "Pekerjaan Tanah & Pondasi", kode: "1.03", uraian: "Lapis pondasi agregat kelas B tebal 15 cm dipadatkan", volume: 220, satuan: "m³", harga: 320000, durasi: 20 },
      { divisi: "Pekerjaan Perkerasan Paving", kode: "2.01", uraian: "Pemasangan Paving Block tebal 8 cm mutu K-300 pola kombinasi", volume: 1200, satuan: "m²", harga: 185000, durasi: 30 },
      { divisi: "Pekerjaan Perkerasan Paving", kode: "2.02", uraian: "Pemasangan kanstin beton pracetak 15x30x40 cm pengunci", volume: 480, satuan: "m'", harga: 85000, durasi: 20 },
      { divisi: "Pekerjaan Lansekap & Utilitas", kode: "3.01", uraian: "Penerangan jalan umum solar cell LED 60 Watt tiang 6 meter", volume: 14, satuan: "titik", harga: 8500000, durasi: 15 },
      { divisi: "Pekerjaan Lansekap & Utilitas", kode: "3.02", uraian: "Penanaman pohon peneduh Tabebuya & rumput gajah mini", volume: 1, satuan: "ls", harga: 48000000, durasi: 20 }
    ]
  }
};

// ===================================================================
// GLOSARIUM MANAJEMEN KONSTRUKSI UNTUK MAHASISWA (EDUKATIF)
// ===================================================================
const CIVIL_GLOSSARY = [
  {
    istilah: "RAB (Rencana Anggaran Biaya)",
    kategori: "Estimasi Biaya",
    singkatan: "RAB",
    penjelasan: "Perkiraan biaya total yang diperlukan untuk melaksanakan proyek konstruksi, dihitung berdasarkan volume fisik pekerjaan dikalikan analisa harga satuan (AHSP).",
    rumus: "Jumlah Harga = Volume × Harga Satuan; Total RAB = ∑ Jumlah Harga",
    tipsMahasiswa: "Pastikan satuan volume (m³, m², kg) sinkron dengan koefisien analisa harga satuan SNI."
  },
  {
    istilah: "WBS (Work Breakdown Structure)",
    kategori: "Manajemen Waktu",
    singkatan: "WBS",
    penjelasan: "Penguraian struktur hierarkis dari seluruh lingkup pekerjaan proyek menjadi bagian-bagian divisi dan paket kerja yang lebih kecil dan terkelola.",
    rumus: "Hierarki: Proyek → Divisi Pekerjaan → Item Sub-Pekerjaan",
    tipsMahasiswa: "WBS yang baik tidak boleh memiliki item pekerjaan ganda (overlapping)."
  },
  {
    istilah: "Bobot Pekerjaan (%)",
    kategori: "Perhitungan Progres",
    singkatan: "Weight (%)",
    penjelasan: "Porsi persentase nilai rupiah suatu item pekerjaan terhadap nilai total RAB proyek. Menunjukkan seberapa besar kontribusi item tersebut terhadap keseluruhan proyek.",
    rumus: "Bobot (%) = (Nilai Pekerjaan / Total Nilai RAB) × 100%",
    tipsMahasiswa: "Jumlah total seluruh bobot pekerjaan di dalam satu proyek WAJIB sama dengan 100.00%."
  },
  {
    istilah: "Kurva S (S-Curve)",
    kategori: "Monitoring Progres",
    singkatan: "S-Curve",
    penjelasan: "Grafik hubungan antara waktu pelaksanaan (sumbu X) dan persentase progres kumulatif pekerjaan (sumbu Y). Berbentuk huruf 'S' karena laju pekerjaan lambat di awal, cepat di pertengahan, dan melandai di tahap finishing.",
    rumus: "Progres Kumulatif Minggu-N = Progres Minggu Sebelumnya + Progres Minggu-N",
    tipsMahasiswa: "Jika garis aktual di bawah garis rencana, proyek mengalami keterlambatan (deviasi negatif)."
  },
  {
    istilah: "Gantt Chart",
    kategori: "Jadwal",
    singkatan: "Gantt",
    penjelasan: "Bagan balok horizontal yang memvisualisasikan jadwal pelaksanaan setiap pekerjaan, durasi, tanggal mulai, dan target selesai secara kronologis.",
    rumus: "Durasi = Tanggal Selesai - Tanggal Mulai + 1 Hari",
    tipsMahasiswa: "Gunakan untuk melihat ketergantungan antarpekerjaan (predecessor & successor)."
  },
  {
    istilah: "PV (Planned Value)",
    kategori: "Earned Value Management",
    singkatan: "PV / BCWS",
    penjelasan: "Nilai anggaran dari pekerjaan yang dijadwalkan harus sudah selesai sampai pada tanggal evaluasi tertentu sesuai rencana awal.",
    rumus: "PV = (Progres Rencana Kumulatif / 100) × BAC",
    tipsMahasiswa: "PV mencerminkan target komitmen jadwal yang seharusnya dicapai."
  },
  {
    istilah: "EV (Earned Value)",
    kategori: "Earned Value Management",
    singkatan: "EV / BCWP",
    penjelasan: "Nilai anggaran dari pekerjaan fisik yang benar-benar telah berhasil diselesaikan di lapangan sampai dengan waktu peninjauan.",
    rumus: "EV = (Progres Fisik Aktual Kumulatif / 100) × BAC",
    tipsMahasiswa: "EV mengukur hasil nyata terpasang, bukan sekadar uang yang telah dibelanjakan."
  },
  {
    istilah: "AC (Actual Cost)",
    kategori: "Earned Value Management",
    singkatan: "AC / ACWP",
    penjelasan: "Total biaya riil kas yang telah dikeluarkan untuk menyelesaikan pekerjaan sampai tanggal evaluasi (faktur nota, tagihan subkon, opname mandor).",
    rumus: "AC = ∑ Seluruh Pengeluaran Kas Riil",
    tipsMahasiswa: "Bandingkan AC dengan EV untuk mengetahui apakah proyek hemat atau boros."
  },
  {
    istilah: "SV (Schedule Variance)",
    kategori: "Earned Value Management",
    singkatan: "SV",
    penjelasan: "Selisih moneter antara nilai hasil pekerjaan (EV) dengan anggaran yang direncanakan (PV). Menunjukkan deviasi jadwal dalam satuan rupiah.",
    rumus: "SV = EV - PV (SV > 0: Cepat; SV = 0: Tepat; SV < 0: Terlambat)",
    tipsMahasiswa: "Nilai negatif menandakan adanya ketertinggalan volume fisik terpasang."
  },
  {
    istilah: "CV (Cost Variance)",
    kategori: "Earned Value Management",
    singkatan: "CV",
    penjelasan: "Selisih antara nilai hasil pekerjaan fisik (EV) dengan biaya aktual yang dikeluarkan (AC).",
    rumus: "CV = EV - AC (CV > 0: Hemat; CV = 0: Sesuai; CV < 0: Boros)",
    tipsMahasiswa: "CV positif menunjukkan efisiensi anggaran belanja proyek."
  },
  {
    istilah: "SPI (Schedule Performance Index)",
    kategori: "Earned Value Management",
    singkatan: "SPI",
    penjelasan: "Rasio efisiensi jadwal proyek. Mengukur seberapa efisien tim proyek memanfaatkan waktu yang tersedia dibandingkan dengan rencana awal.",
    rumus: "SPI = EV / PV (SPI > 1.0: Lebih cepat; SPI < 1.0: Terlambat)",
    tipsMahasiswa: "Contoh: SPI = 0.90 berarti proyek baru menuntaskan 90% dari pekerjaan yang dijadwalkan."
  },
  {
    istilah: "CPI (Cost Performance Index)",
    kategori: "Earned Value Management",
    singkatan: "CPI",
    penjelasan: "Rasio efisiensi biaya proyek. Mengukur nilai pekerjaan yang dihasilkan untuk setiap satu rupiah yang dikeluarkan.",
    rumus: "CPI = EV / AC (CPI > 1.0: Hemat; CPI < 1.0: Terjadi Cost Overrun)",
    tipsMahasiswa: "Contoh: CPI = 1.05 berarti setiap Rp 1.000 pengeluaran menghasilkan pekerjaan senilai Rp 1.050."
  },
  {
    istilah: "BAC (Budget at Completion)",
    kategori: "Earned Value Management",
    singkatan: "BAC",
    penjelasan: "Total keseluruhan anggaran biaya proyek yang disepakati di awal (Total Nilai RAB).",
    rumus: "BAC = Total Nilai RAB Proyek",
    tipsMahasiswa: "Menjadi patokan utama perhitungan PV, EV, dan perkiraan biaya akhir (EAC)."
  },
  {
    istilah: "EAC (Estimate at Completion)",
    kategori: "Forecasting Proyek",
    singkatan: "EAC",
    penjelasan: "Prakiraan total biaya proyek saat proyek selesai nanti, berdasarkan tren efisiensi biaya (CPI) saat ini.",
    rumus: "EAC = BAC / CPI",
    tipsMahasiswa: "Jika CPI < 1, EAC akan lebih besar dari BAC (terjadi pembengkakan total biaya proyek)."
  },
  {
    istilah: "ETC (Estimate to Complete)",
    kategori: "Forecasting Proyek",
    singkatan: "ETC",
    penjelasan: "Prakiraan sisa biaya yang masih harus dikeluarkan kontraktor untuk menyelesaikan seluruh pekerjaan yang tersisa.",
    rumus: "ETC = EAC - AC",
    tipsMahasiswa: "Sangat penting untuk mengatur ketersediaan modal kerja (working capital)."
  },
  {
    istilah: "VAC (Variance at Completion)",
    kategori: "Forecasting Proyek",
    singkatan: "VAC",
    penjelasan: "Prakiraan selisih keuntungan atau defisit anggaran pada akhir penyelesaian proyek.",
    rumus: "VAC = BAC - EAC (VAC > 0: Potensi Untung; VAC < 0: Potensi Rugi)",
    tipsMahasiswa: "Jika VAC positif, kontraktor berpotensi memperoleh sisa laba di luar estimasi awal."
  }
];

// ===================================================================
// LATIHAN STUDI KASUS MAHASISWA (1-CLICK LOAD)
// ===================================================================
const STUDENT_EXERCISES = [
  {
    id: "EX-01",
    judul: "Studi Kasus 1: Peningkatan Jalan Kolektor (Keterlambatan Hujan)",
    tipe: "Proyek Jalan",
    deskripsi: "Proyek pekerjaan jalan raya 2.5 KM di mana pekerjaan pengaspalan AC-BC tertunda 1 minggu akibat intensitas hujan tinggi, tetapi biaya material hemat karena negosiasi quarry.",
    dataTemplateKey: "Proyek Jalan"
  },
  {
    id: "EX-02",
    judul: "Studi Kasus 2: Jembatan Gelagar Beton (Stressing Girder)",
    tipe: "Proyek Jembatan",
    deskripsi: "Proyek jembatan bentang 24 M dengan fokus evaluasi pada lintasan kritis pengadaan dan ereksi balok PCI Girder pratekan.",
    dataTemplateKey: "Proyek Jembatan"
  },
  {
    id: "EX-03",
    judul: "Studi Kasus 3: Drainase Perkotaan U-Ditch (On Schedule)",
    tipe: "Proyek Drainase",
    deskripsi: "Pemasangan saluran drainase U-Ditch precast perkotaan 1.5 KM dengan progres fisik berjalan sesuai target baseline jadwal rencana.",
    dataTemplateKey: "Proyek Drainase"
  }
];


// ===================================================================
// CONTOH PENGISIAN EDUKATIF MAHASISWA (TERPISAH DARI DATA PENGGUNA)
// ===================================================================
const EXAMPLE_GUIDES = {
  proyek: {
    title: "Contoh Pengisian Identitas Proyek",
    icon: "fa-folder-open",
    badge: "Identitas Proyek",
    description: "Formulir proyek pengguna dimulai dalam keadaan KOSONG. Berikut adalah contoh data standar proyek konstruksi gedung untuk latihan mahasiswa Teknik Sipil.",
    fields: [
      { label: "Nama Proyek", contoh: "Pembangunan Gedung Laboratorium dan Ruang Kuliah 3 Lantai", tips: "Gunakan nama resmi yang mencerminkan fungsi dan jumlah lantai/bentang." },
      { label: "Jenis Proyek", contoh: "Bangunan Gedung", tips: "Pilih salah satu dari 6 jenis konstruksi (Gedung, Jalan, Jembatan, Drainase, Irigasi, atau Lainnya)." },
      { label: "Lokasi", contoh: "Jl. Kaliurang KM 9, Sleman, D.I. Yogyakarta", tips: "Sebutkan nama jalan/wilayah lokasi tapak proyek berada." },
      { label: "Pemilik Proyek (Owner)", contoh: "PPK Institusi Perguruan Tinggi / Dinas PUPR", tips: "Pihak pemberi tugas atau dinas yang mendanai proyek." },
      { label: "Kontraktor Pelaksana", contoh: "PT Graha Rekayasa Konstruksi", tips: "Perusahaan jasa pelaksana konstruksi yang memenangkan lelang tender." },
      { label: "Konsultan Pengawas (MK)", contoh: "PT Rekayasa Pengawas Utama", tips: "Konsultan Manajemen Konstruksi yang mengawasi mutu, waktu, dan biaya di lapangan." },
      { label: "Tanggal Mulai", contoh: "2026-01-05 (5 Januari 2026)", tips: "Tanggal terbitnya Surat Perintah Mulai Kerja (SPMK)." },
      { label: "Tanggal Target Selesai", contoh: "2026-06-30 (30 Juni 2026)", tips: "Batas akhir waktu pelaksanaan kontrak sebelum serah terima PHO." },
      { label: "Durasi Rencana", contoh: "176 Hari Kalender (26 Minggu)", tips: "Durasi total yang disepakati dalam dokumen kontrak kerja." },
      { label: "Nilai Kontrak", contoh: "Rp 2.500.000.000", tips: "Nilai penawaran kontrak termasuk PPN 11%." },
      { label: "Pagu Nilai RAB (BAC)", contoh: "Rp 2.400.000.000", tips: "Total Rencana Anggaran Biaya pelaksanaan (Budget at Completion)." }
    ]
  },
  rab: {
    title: "Contoh Pengisian Rencana Anggaran Biaya (RAB)",
    icon: "fa-calculator",
    badge: "RAB & AHSP",
    description: "Formulir RAB pengguna harus kosong. Mahasiswa menghitung volume berdasarkan gambar kerja (bestek) dan harga satuan dari Analisa Harga Satuan Pekerjaan (AHSP SNI).",
    formula: "Jumlah Harga = Volume × Harga Satuan\nBobot Item (%) = (Jumlah Harga Item / Total Nilai RAB) × 100%",
    items: [
      { uraian: "Galian tanah biasa sedalam 1-2 meter", volume: "100.00", satuan: "m³", hargaSatuan: "Rp 100.000", jumlah: "Rp 10.000.000", bobot: "16.67%" },
      { uraian: "Pasangan dinding bata merah tebal 1/2 bata", volume: "200.00", satuan: "m²", hargaSatuan: "Rp 150.000", jumlah: "Rp 30.000.000", bobot: "50.00%" },
      { uraian: "Pengecoran beton mutu f'c = 21.7 MPa (K-250)", volume: "20.00", satuan: "m³", hargaSatuan: "Rp 1.000.000", jumlah: "Rp 20.000.000", bobot: "33.33%" }
    ],
    totalContoh: "Rp 60.000.000 (Total Bobot: 100.00%)",
    penjelasan: "Mahasiswa harus mengisi volume dan harga satuan berdasarkan data proyeknya sendiri. Satuan standar: m³ untuk volume tanah/beton, m² untuk luasan dinding/lantai, m' untuk panjang saluran, dan kg/ton untuk baja."
  },
  jadwal: {
    title: "Contoh Pengisian Jadwal Pekerjaan & Gantt Chart",
    icon: "fa-calendar-days",
    badge: "Jadwal & Waktu",
    description: "Jadwal dan durasi ditentukan berdasarkan produktivitas harian tenaga kerja dan ketersediaan alat berat.",
    formula: "Durasi Hari = Volume Pekerjaan / (Produktivitas Harian × Jumlah Regu Kerja)",
    items: [
      { pekerjaan: "Pekerjaan Persiapan & Mobilisasi", mulai: "5 Jan 2026", selesai: "10 Jan 2026", durasi: "6 Hari", status: "Selesai" },
      { pekerjaan: "Pekerjaan Galian Tanah Pondasi", mulai: "11 Jan 2026", selesai: "25 Jan 2026", durasi: "15 Hari", status: "Selesai" },
      { pekerjaan: "Pekerjaan Pondasi Strauss / Telapak", mulai: "26 Jan 2026", selesai: "15 Feb 2026", durasi: "21 Hari", status: "Sedang Berlangsung" }
    ],
    penjelasan: "Pekerjaan yang tidak dapat dimulai sebelum pekerjaan lain tuntas disebut memiliki ketergantungan (Finish-to-Start). Gantt chart di CONSTRACK otomatis memetakan durasi minggu pelaksanaan secara visual."
  },
  progres: {
    title: "Contoh Pengisian Capaian Progres Fisik",
    icon: "fa-list-check",
    badge: "Progres Fisik",
    description: "Progres fisik diukur melalui opname lapangan mingguan dengan membandingkan volume riil terpasang terhadap volume kontrak.",
    formula: "Kontribusi Progres Item (%) = (Bobot Item × % Progres Aktual) / 100\nDeviasi Progres (%) = Progres Aktual Kumulatif - Progres Rencana Kumulatif",
    contohKasus: [
      { parameter: "Target Progres Rencana Kumulatif (Minggu ke-10)", nilai: "40.00%" },
      { parameter: "Realisasi Capaian Aktual Kumulatif (Minggu ke-10)", nilai: "35.00%" },
      { parameter: "Selisih / Deviasi Progres Fisik", nilai: "-5.00% (Keterlambatan)" }
    ],
    penjelasan: "Jika progres aktual lebih kecil daripada rencana (deviasi negatif), proyek mengalami keterlambatan terhadap jadwal rencana pada periode tersebut. Kontraktor perlu menambah jam kerja lembur atau menambah regu tenaga kerja."
  },
  kurvas: {
    title: "Contoh & Konsep Pembacaan Kurva S",
    icon: "fa-chart-line",
    badge: "Kurva S",
    description: "Kurva S adalah grafik akumulasi progres rencana dan aktual dari minggu ke-1 sampai minggu akhir.",
    penjelasan: "Kurva S berbentuk huruf 'S' karena pada awal proyek pekerjaan berupa persiapan dengan bobot kecil (landai), pada pertengahan proyek pekerjaan struktur berjalan cepat dengan bobot besar (curam), dan pada akhir proyek pekerjaan finishing melandai kembali. Kurva S akan terbentuk setelah mahasiswa memasukkan data jadwal, bobot RAB, dan progres mingguan.",
    contohTabel: [
      { minggu: "Minggu 1", rencanaMinggu: "1.20%", rencanaKum: "1.20%", aktualMinggu: "1.20%", aktualKum: "1.20%", deviasi: "0.00%" },
      { minggu: "Minggu 5", rencanaMinggu: "4.50%", rencanaKum: "14.80%", aktualMinggu: "4.20%", aktualKum: "13.90%", deviasi: "-0.90%" },
      { minggu: "Minggu 10", rencanaMinggu: "6.80%", rencanaKum: "40.00%", aktualMinggu: "5.50%", aktualKum: "35.00%", deviasi: "-5.00%" }
    ]
  },
  cashflow: {
    title: "Contoh Pengisian Arus Kas (Cash Flow Proyek)",
    icon: "fa-money-bill-trend-up",
    badge: "Cash Flow",
    description: "Memantau likuiditas kas operasional antara penerimaan termin dari pemilik proyek dengan pengeluaran belanja modal kerja di lapangan.",
    formula: "Net Cash Flow Bulanan = Pemasukan Termin - Pengeluaran Kas (BKK)\nSaldo Kas Kumulatif = Saldo Bulan Lalu + Net Cash Flow Bulan Ini",
    transaksi: [
      { jenis: "Pemasukan", keterangan: "Uang Muka (DP 20%) dari Pemilik Proyek", nominal: "Rp 500.000.000" },
      { jenis: "Pemasukan", keterangan: "Pembayaran Termin Pertama (Progres 30%)", nominal: "Rp 100.000.000" },
      { jenis: "Pengeluaran", keterangan: "Pembelian Material Pasir, Semen, dan Besi Beton", nominal: "Rp 25.000.000" },
      { jenis: "Pengeluaran", keterangan: "Upah Mingguan Mandor dan Tukang Batu", nominal: "Rp 15.000.000" }
    ],
    penjelasan: "Saldo kumulatif tidak boleh mengalami defisit (minus) berkepanjangan agar kelangsungan operasional proyek tidak terhenti."
  },
  evm: {
    title: "Contoh Analisis Earned Value Management (EVM)",
    icon: "fa-chart-pie",
    badge: "EVM",
    description: "EVM mengintegrasikan 3 dimensi proyek: Ruang Lingkup (Scope), Waktu (Schedule), dan Biaya (Cost) untuk mengevaluasi kinerja dan memproyeksikan biaya akhir.",
    dataSimulasi: {
      bac: "Rp 100.000.000",
      rencana: "40.00%",
      aktual: "35.00%",
      ac: "Rp 32.000.000"
    },
    parameter: [
      { notasi: "PV (Planned Value)", rumus: "40% × BAC", hasil: "Rp 40.000.000", arti: "Nilai anggaran pekerjaan yang dijadwalkan selesai." },
      { notasi: "EV (Earned Value)", rumus: "35% × BAC", hasil: "Rp 35.000.000", arti: "Nilai hasil pekerjaan fisik yang telah selesai dikerjakan." },
      { notasi: "AC (Actual Cost)", rumus: "Total BKK", hasil: "Rp 32.000.000", arti: "Uang kas riil yang telah dibayarkan untuk progres fisik tersebut." },
      { notasi: "SV (Schedule Variance)", rumus: "EV - PV", hasil: "-Rp 5.000.000", arti: "SV < 0 menandakan proyek terlambat terhadap rencana waktu." },
      { notasi: "CV (Cost Variance)", rumus: "EV - AC", hasil: "+Rp 3.000.000", arti: "CV > 0 menandakan terjadi penghematan biaya (Cost Underrun)." },
      { notasi: "SPI (Schedule Index)", rumus: "EV / PV", hasil: "0.875", arti: "SPI < 1.0 -> Progres fisik lebih lambat dari target rencana." },
      { notasi: "CPI (Cost Index)", rumus: "EV / AC", hasil: "1.094", arti: "CPI > 1.0 -> Pengeluaran lebih hemat dari anggaran rencana." },
      { notasi: "EAC (Estimate at Completion)", rumus: "BAC / CPI", hasil: "Rp 91.407.678", arti: "Perkiraan total biaya saat proyek rampung dengan tren efisiensi saat ini." },
      { notasi: "VAC (Variance at Completion)", rumus: "BAC - EAC", hasil: "+Rp 8.592.322", arti: "Potensi laba sisa efisiensi anggaran di akhir proyek." }
    ],
    penjelasan: "Jika pengguna belum memasukkan data item RAB atau pengeluaran, modul EVM akan menampilkan status N/A dan panduan pengisian."
  }
};
