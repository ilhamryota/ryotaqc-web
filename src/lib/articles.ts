// Article data for Informasi & Maintenance sections.
// Thumbnails reference local generated images.
import thumbSoftware from "@/assets/thumb-software.jpg";
import thumbHardware from "@/assets/thumb-hardware.jpg";
import thumbStorage from "@/assets/thumb-storage.jpg";
import thumbBattery from "@/assets/thumb-battery.jpg";
import thumbLcd from "@/assets/thumb-lcd.jpg";
import thumbKeyboard from "@/assets/thumb-keyboard.jpg";
import thumbCpu from "@/assets/thumb-cpu.jpg";
import thumbNetwork from "@/assets/thumb-network.jpg";
import thumbMacbook from "@/assets/thumb-macbook.jpg";

export const THUMBS = {
  software: thumbSoftware,
  hardware: thumbHardware,
  storage: thumbStorage,
  battery: thumbBattery,
  lcd: thumbLcd,
  keyboard: thumbKeyboard,
  cpu: thumbCpu,
  network: thumbNetwork,
  macbook: thumbMacbook,
} as const;

export type ThumbKey = keyof typeof THUMBS;

export type ArticleSection = "informasi" | "maintenance";
export type ArticleKind = "software" | "hardware";

export interface ArticleBlock {
  heading?: string;
  body: string;
}

export interface Article {
  slug: string;
  section: ArticleSection;
  kind: ArticleKind;
  title: string;
  summary: string;
  thumb: ThumbKey;
  author: string;
  date: string; // ISO
  readMinutes: number;
  tags: string[];
  blocks: ArticleBlock[];
}

const A = (a: Article) => a;

export const ARTICLES: Article[] = [
  // ============ INFORMASI — SOFTWARE (5) ============
  A({
    slug: "membaca-spesifikasi-windows",
    section: "informasi", kind: "software", thumb: "software",
    title: "Cara Membaca Spesifikasi Windows di Laptop",
    summary: "Pahami informasi sistem Windows seperti edisi, versi, build, dan tipe sistem untuk validasi QC.",
    author: "Tim Ryota QC", date: "2026-01-12", readMinutes: 4,
    tags: ["Windows", "System Info", "Dasar"],
    blocks: [
      { heading: "Kenapa Penting?", body: "Spesifikasi Windows dipakai sebagai data dasar pada laporan QC. Pastikan setiap unit dicatat edisi, versi, dan tipe sistemnya agar konsisten dengan SOP." },
      { heading: "Cara Cek Cepat", body: "Tekan tombol Windows + Pause/Break, atau buka Settings → System → About. Catat: Windows Edition (Home/Pro), Version (22H2/23H2), OS Build, dan System Type (64-bit)." },
      { heading: "Yang Perlu Dicatat", body: "Edition, Version & Build, Installed RAM, Processor, System type (x64), Device name, Product ID. Semua field ini wajib lengkap pada laporan QC." },
      { heading: "Catatan", body: "Jika OS belum aktivasi, beri tanda khusus pada laporan dan lanjut ke prosedur aktivasi sesuai SOP." },
    ],
  }),
  A({
    slug: "apa-itu-driver-laptop",
    section: "informasi", kind: "software", thumb: "software",
    title: "Apa Itu Driver Laptop & Mengapa Penting",
    summary: "Driver adalah jembatan antara hardware dan sistem operasi. Tanpa driver lengkap, fitur perangkat tidak optimal.",
    author: "Tim Ryota QC", date: "2026-01-14", readMinutes: 5,
    tags: ["Driver", "Software", "Dasar"],
    blocks: [
      { heading: "Definisi Driver", body: "Driver adalah perangkat lunak yang memungkinkan sistem operasi berkomunikasi dengan komponen hardware seperti VGA, audio, WiFi, Bluetooth, kamera, dan touchpad." },
      { heading: "Driver Utama yang Wajib Ada", body: "Chipset, VGA (Intel/AMD/NVIDIA), Audio, LAN/WLAN, Bluetooth, Camera, Touchpad, Card Reader, dan Management Engine. Cek di Device Manager — pastikan tidak ada tanda seru kuning." },
      { heading: "Sumber Driver Resmi", body: "Selalu unduh dari situs resmi pabrikan (Lenovo, HP, Dell, ASUS, Acer, Apple). Hindari driver dari sumber tidak resmi karena rawan malware." },
      { heading: "Konsekuensi Driver Hilang", body: "WiFi tidak terdeteksi, audio mati, kamera blank, brightness tidak bisa diatur, hingga performa GPU turun drastis." },
    ],
  }),
  A({
    slug: "perbedaan-windows-10-dan-11",
    section: "informasi", kind: "software", thumb: "software",
    title: "Perbedaan Windows 10 dan Windows 11",
    summary: "Ringkasan perbedaan utama tampilan, syarat hardware, dan fitur baru Windows 11.",
    author: "Tim Ryota QC", date: "2026-01-16", readMinutes: 4,
    tags: ["Windows", "Software"],
    blocks: [
      { heading: "Tampilan & UX", body: "Windows 11 memakai Start Menu di tengah, sudut window membulat, taskbar lebih ramping, dan fitur Snap Layouts untuk multitasking." },
      { heading: "Syarat Hardware", body: "Windows 11 wajib TPM 2.0, Secure Boot, UEFI, RAM minimal 4GB, storage 64GB, dan processor masuk daftar kompatibel (Intel Gen 8+ / AMD Ryzen 2000+)." },
      { heading: "Fitur Baru", body: "Widgets, Microsoft Store baru, integrasi Teams, dukungan Android Subsystem, dan DirectStorage untuk gaming." },
      { heading: "Rekomendasi QC", body: "Selalu cek kompatibilitas TPM/Secure Boot sebelum upgrade. Jika tidak kompatibel, tetap pakai Windows 10 yang masih disupport sampai 2025." },
    ],
  }),
  A({
    slug: "bios-dan-uefi",
    section: "informasi", kind: "software", thumb: "software",
    title: "Apa Itu BIOS dan UEFI?",
    summary: "Pengertian dasar BIOS, UEFI, dan kapan dipakai dalam proses QC laptop.",
    author: "Tim Ryota QC", date: "2026-01-18", readMinutes: 4,
    tags: ["BIOS", "UEFI", "Firmware"],
    blocks: [
      { heading: "Apa Itu BIOS", body: "BIOS (Basic Input Output System) adalah firmware lama yang menginisialisasi hardware sebelum sistem operasi dimuat. Mode booting Legacy/MBR." },
      { heading: "Apa Itu UEFI", body: "UEFI adalah penerus BIOS dengan antarmuka grafis, dukungan storage >2TB, Secure Boot, dan booting lebih cepat. Standar laptop modern." },
      { heading: "Akses BIOS/UEFI", body: "Tekan F2, F10, F12, Esc, atau Del saat booting (tergantung merek). Contoh: Lenovo (F2/F1), HP (Esc/F10), Dell (F2), ASUS (Esc/F2)." },
      { heading: "Wajib Dicek di QC", body: "Versi BIOS, mode booting, status TPM, status Secure Boot, password BIOS (harus kosong saat dijual), dan tanggal manufaktur." },
    ],
  }),
  A({
    slug: "cek-aktivasi-windows",
    section: "informasi", kind: "software", thumb: "software",
    title: "Cara Cek Aktivasi Windows yang Benar",
    summary: "Pastikan lisensi Windows aktif & valid sebelum unit dinyatakan lolos QC.",
    author: "Tim Ryota QC", date: "2026-01-20", readMinutes: 3,
    tags: ["Aktivasi", "Lisensi"],
    blocks: [
      { heading: "Cek via Settings", body: "Settings → System → Activation. Status harus 'Windows is activated' dengan jenis lisensi: Digital license atau Product key." },
      { heading: "Cek via Command Prompt", body: "Jalankan: slmgr /xpr → akan muncul status permanen / trial. Untuk detail lisensi: slmgr /dlv." },
      { heading: "Jenis Lisensi", body: "OEM (terkunci ke motherboard, paling umum di laptop baru), Retail (bisa pindah PC), Volume (untuk korporat)." },
      { heading: "Tindakan QC", body: "Jika tidak aktif → reaktivasi via product key OEM yang tersimpan di BIOS, atau eskalasi ke teknisi." },
    ],
  }),
  // ============ INFORMASI — HARDWARE (5) ============
  A({
    slug: "perbedaan-ssd-dan-hdd",
    section: "informasi", kind: "hardware", thumb: "storage",
    title: "Perbedaan SSD dan HDD Pada Laptop",
    summary: "Pahami beda performa, harga, daya, dan ketahanan SSD vs HDD untuk rekomendasi konsumen.",
    author: "Tim Ryota QC", date: "2026-01-22", readMinutes: 4,
    tags: ["Storage", "SSD", "HDD"],
    blocks: [
      { heading: "Prinsip Kerja", body: "HDD memakai piringan magnetik yang berputar dan head pembaca mekanis. SSD memakai chip flash NAND tanpa komponen bergerak." },
      { heading: "Performa", body: "SSD jauh lebih cepat: boot Windows <15 detik, transfer file sampai 3500 MB/s (NVMe). HDD typically 80-160 MB/s, boot >40 detik." },
      { heading: "Daya & Suhu", body: "SSD lebih hemat daya, lebih dingin, dan tidak berisik. Cocok untuk laptop tipis dan baterai lebih awet." },
      { heading: "Ketahanan & Harga", body: "SSD tahan goncangan; HDD masih lebih murah per GB untuk kapasitas besar (1TB+). Rekomendasi: SSD untuk OS, HDD untuk storage data." },
    ],
  }),
  A({
    slug: "membaca-spek-processor-intel",
    section: "informasi", kind: "hardware", thumb: "cpu",
    title: "Cara Membaca Spesifikasi Processor Intel",
    summary: "Pahami kode Core i3/i5/i7/i9, generasi, sufiks U/H/HX, dan implikasinya pada performa.",
    author: "Tim Ryota QC", date: "2026-01-24", readMinutes: 5,
    tags: ["Processor", "Intel"],
    blocks: [
      { heading: "Format Penamaan", body: "Contoh: Intel Core i7-1360P. 'i7' = kelas, '13' = generasi, '60' = SKU, 'P' = sufiks (kelas TDP)." },
      { heading: "Sufiks Penting", body: "U = ultra low power (hemat daya), P = performance (15-28W), H = high performance (45W), HX = extreme (laptop gaming/workstation), K = unlocked (desktop)." },
      { heading: "Generasi", body: "Selalu lihat 2 digit pertama setelah dash: 12xxx (Gen 12 Alder Lake), 13xxx (Gen 13 Raptor Lake), dst. Semakin baru biasanya lebih efisien & cepat." },
      { heading: "Cek Cepat di QC", body: "Buka System Info atau CPU-Z. Catat nama lengkap processor, jumlah core/thread, base clock, dan TDP." },
    ],
  }),
  A({
    slug: "ram-ddr3-ddr4-ddr5",
    section: "informasi", kind: "hardware", thumb: "hardware",
    title: "Apa Itu RAM DDR3, DDR4, dan DDR5",
    summary: "Perbedaan generasi RAM laptop dan cara memastikan tipe RAM kompatibel.",
    author: "Tim Ryota QC", date: "2026-01-26", readMinutes: 4,
    tags: ["RAM", "Memory"],
    blocks: [
      { heading: "DDR3", body: "Generasi lama, voltase 1.5V (DDR3L 1.35V), kecepatan 800-2133 MHz. Masih ditemukan di laptop tua." },
      { heading: "DDR4", body: "Voltase 1.2V, kecepatan 2133-3200 MHz. Standar laptop modern (2016-2022). Notch berbeda dari DDR3 — tidak bisa saling pasang." },
      { heading: "DDR5", body: "Voltase 1.1V, kecepatan mulai 4800 MHz, mendukung ECC on-die. Untuk laptop generasi terbaru (Intel Gen 12+, AMD Ryzen 6000+)." },
      { heading: "Cek Tipe & Slot", body: "Pakai CPU-Z tab SPD. Catat: tipe, kecepatan, kapasitas per slot, jumlah slot, max capacity. Jangan campur DDR berbeda." },
    ],
  }),
  A({
    slug: "vga-integrated-vs-dedicated",
    section: "informasi", kind: "hardware", thumb: "hardware",
    title: "Perbedaan VGA Integrated dan Dedicated",
    summary: "Kapan butuh VGA dedicated dan kapan VGA integrated sudah cukup.",
    author: "Tim Ryota QC", date: "2026-01-28", readMinutes: 4,
    tags: ["VGA", "GPU"],
    blocks: [
      { heading: "VGA Integrated", body: "Tertanam pada processor (Intel UHD/Iris, AMD Radeon Graphics). Hemat daya, cukup untuk Office, browsing, video, dan editing ringan." },
      { heading: "VGA Dedicated", body: "Chip GPU terpisah dengan VRAM sendiri (NVIDIA RTX/MX, AMD Radeon RX). Diperlukan untuk gaming, rendering, dan AI/ML." },
      { heading: "Cek Cepat", body: "Buka Device Manager → Display Adapters. Jika ada dua entri (Intel + NVIDIA), laptop punya dual-GPU dengan auto-switching." },
      { heading: "Catatan QC", body: "Cek driver GPU terpasang, jalankan GPU-Z untuk validasi VRAM, dan jalankan stress test ringan jika kategori gaming." },
    ],
  }),
  A({
    slug: "ciri-baterai-laptop-rusak",
    section: "informasi", kind: "hardware", thumb: "battery",
    title: "Ciri-Ciri Baterai Laptop Mulai Rusak",
    summary: "Tanda-tanda baterai aus & perlu diganti — penting untuk validasi QC battery health.",
    author: "Tim Ryota QC", date: "2026-01-30", readMinutes: 4,
    tags: ["Battery", "Hardware"],
    blocks: [
      { heading: "Gejala Umum", body: "Battery cepat habis, persentase loncat tidak akurat, laptop mati mendadak meski indikator masih ada, casing menggelembung." },
      { heading: "Cek via Powershell", body: "Jalankan: powercfg /batteryreport. Bandingkan Design Capacity vs Full Charge Capacity. Selisih >25% = baterai aus." },
      { heading: "Cycle Count", body: "Battery laptop umumnya tahan 500-1000 cycle. Cek cycle count via report yang sama. Mendekati limit → siap retur/ganti." },
      { heading: "Penanganan Aman", body: "Baterai menggelembung WAJIB lepas dan jangan dipakai. Bahaya kebakaran. Simpan di tempat tidak mudah terbakar." },
    ],
  }),
  // ============ MAINTENANCE — SOFTWARE (5) ============
  A({
    slug: "mengatasi-windows-lemot",
    section: "maintenance", kind: "software", thumb: "software",
    title: "Cara Mengatasi Windows yang Lemot",
    summary: "Langkah praktis mempercepat Windows tanpa install ulang.",
    author: "Tim Ryota QC", date: "2026-02-02", readMinutes: 6,
    tags: ["Performance", "Windows"],
    blocks: [
      { heading: "Gejala", body: "Boot lama, aplikasi delay, mouse lag, RAM/CPU usage tinggi padahal tidak buka aplikasi berat." },
      { heading: "Penyebab Umum", body: "Startup program berlebih, malware, storage hampir penuh, driver bermasalah, HDD lambat, RAM kurang." },
      { heading: "Solusi Cepat", body: "1) Disable startup programs (Task Manager → Startup). 2) Disk Cleanup + hapus file Temp. 3) Update driver chipset & SSD. 4) Scan malware (Windows Defender / Malwarebytes). 5) Cek storage health." },
      { heading: "Solusi Lanjutan", body: "Upgrade HDD → SSD memberi peningkatan paling signifikan. Tambah RAM jika di bawah 8GB. Pertimbangkan Reset This PC jika tetap lemot." },
      { heading: "Risiko", body: "Hati-hati saat hapus file system. Backup data penting sebelum reset." },
    ],
  }),
  A({
    slug: "driver-tidak-terbaca",
    section: "maintenance", kind: "software", thumb: "software",
    title: "Driver Tidak Terbaca di Device Manager",
    summary: "Cara mendeteksi & memperbaiki driver yang ditandai tanda seru kuning.",
    author: "Tim Ryota QC", date: "2026-02-04", readMinutes: 4,
    tags: ["Driver", "Troubleshooting"],
    blocks: [
      { heading: "Gejala", body: "Device Manager menunjukkan tanda seru kuning atau perangkat 'Unknown Device'." },
      { heading: "Pengecekan", body: "Klik kanan perangkat → Properties → tab Details → pilih Hardware Ids. Copy VEN_xxxx & DEV_xxxx untuk cari driver tepat." },
      { heading: "Solusi", body: "1) Update via Windows Update. 2) Download driver dari situs resmi pabrikan dengan service tag/serial. 3) Gunakan Snappy Driver Installer offline jika tidak ada koneksi." },
      { heading: "Risiko", body: "Hindari Driver Booster bajakan — sering membawa adware. Selalu pilih sumber resmi." },
      { heading: "Kesimpulan", body: "Catat driver yang berhasil diinstal pada checklist QC. Restart wajib setelah instalasi." },
    ],
  }),
  A({
    slug: "wifi-hilang",
    section: "maintenance", kind: "software", thumb: "network",
    title: "WiFi Hilang dari Laptop",
    summary: "Diagnosa cepat saat icon WiFi menghilang atau tidak bisa connect.",
    author: "Tim Ryota QC", date: "2026-02-06", readMinutes: 5,
    tags: ["WiFi", "Network"],
    blocks: [
      { heading: "Gejala", body: "Icon WiFi hilang, hanya muncul Airplane mode, atau Device Manager kehilangan adapter wireless." },
      { heading: "Penyebab", body: "Driver hilang/corrupt, WiFi card lepas/rusak, BIOS men-disable WiFi, switch fisik OFF, atau service WLAN AutoConfig tidak jalan." },
      { heading: "Cara Cek", body: "1) Cek tombol/switch fisik WiFi. 2) Cek BIOS → Wireless = Enabled. 3) Device Manager → reinstall driver WLAN. 4) services.msc → WLAN AutoConfig = Running." },
      { heading: "Solusi Hardware", body: "Jika driver sudah benar tapi tetap hilang → buka casing, reseat kabel antena & modul M.2 WiFi card. Jika tetap mati, ganti modul." },
      { heading: "Kapan ke Teknisi", body: "Jika setelah ganti modul tetap tidak terdeteksi → kemungkinan socket M.2/CNVi pada motherboard rusak." },
    ],
  }),
  A({
    slug: "sound-tidak-keluar",
    section: "maintenance", kind: "software", thumb: "software",
    title: "Sound Tidak Keluar dari Speaker Laptop",
    summary: "Cek sistematis ketika speaker laptop senyap padahal volume sudah maksimal.",
    author: "Tim Ryota QC", date: "2026-02-08", readMinutes: 4,
    tags: ["Audio", "Driver"],
    blocks: [
      { heading: "Gejala", body: "Suara tidak terdengar dari speaker internal, tapi terdengar dari headphone — atau sebaliknya." },
      { heading: "Pengecekan Awal", body: "Klik kanan icon speaker → Sound Settings → pastikan output device = Speakers (bukan HDMI/headphone). Cek tidak ada Mute." },
      { heading: "Driver Audio", body: "Device Manager → Sound, video and game controllers → uninstall driver Realtek/Conexant/IDT → restart untuk reinstall otomatis. Atau download terbaru dari pabrikan." },
      { heading: "Hardware", body: "Test colok headphone — jika keluar berarti speaker/jack rusak. Cek koneksi kabel speaker ke motherboard." },
      { heading: "Risiko", body: "Hati-hati overdriver (suara pecah). Atur volume bertahap, jangan langsung max." },
    ],
  }),
  A({
    slug: "blue-screen-windows",
    section: "maintenance", kind: "software", thumb: "software",
    title: "Cara Mengatasi Blue Screen (BSOD)",
    summary: "Identifikasi error code BSOD dan solusi awal yang aman dilakukan.",
    author: "Tim Ryota QC", date: "2026-02-10", readMinutes: 6,
    tags: ["BSOD", "Troubleshooting"],
    blocks: [
      { heading: "Gejala", body: "Layar biru/hitam dengan pesan stop code, laptop restart otomatis, tidak bisa masuk Windows." },
      { heading: "Penyebab Umum", body: "Driver tidak kompatibel, RAM rusak, storage bad sector, overheating, Windows corrupt, malware." },
      { heading: "Pengecekan", body: "Catat stop code (contoh: MEMORY_MANAGEMENT, IRQL_NOT_LESS_OR_EQUAL). Gunakan BlueScreenView untuk membaca dump file." },
      { heading: "Solusi Awal", body: "1) Boot ke Safe Mode → uninstall driver/update terakhir. 2) sfc /scannow & DISM /Online /Cleanup-Image /RestoreHealth. 3) Cek RAM dengan MemTest86. 4) Cek SSD/HDD dengan CrystalDiskInfo." },
      { heading: "Kesimpulan", body: "Jika BSOD acak terus muncul → curiga RAM/SSD failure. Eskalasi ke teknisi untuk ganti komponen." },
    ],
  }),
  // ============ MAINTENANCE — HARDWARE (5) ============
  A({
    slug: "laptop-mati-total",
    section: "maintenance", kind: "hardware", thumb: "hardware",
    title: "Diagnosa Laptop Mati Total",
    summary: "Langkah sistematis menentukan penyebab laptop tidak menyala sama sekali.",
    author: "Tim Ryota QC", date: "2026-02-12", readMinutes: 6,
    tags: ["Hardware", "Diagnosa"],
    blocks: [
      { heading: "Gejala", body: "Tombol power ditekan, tidak ada indikator LED, kipas tidak berputar, layar gelap total." },
      { heading: "Pengecekan Daya", body: "1) Test charger di stop kontak lain. 2) Cek LED charger. 3) Coba charger setara watt dari unit lain. 4) Lepas baterai (jika removable), colok hanya adaptor." },
      { heading: "Pengecekan Hardware", body: "Coba power drain: lepas charger, tahan tombol power 30 detik. Lalu colok charger & nyalakan. Jika tetap mati, kemungkinan IC charging / motherboard." },
      { heading: "Kapan Bawa ke Teknisi", body: "Jika hingga step power drain tetap tidak nyala, dan charger sudah dipastikan normal → eskalasi ke teknisi board level." },
      { heading: "Risiko", body: "Jangan bongkar paksa motherboard tanpa skill. Komponen rentan ESD dan sangat kecil." },
    ],
  }),
  A({
    slug: "laptop-overheat",
    section: "maintenance", kind: "hardware", thumb: "cpu",
    title: "Penyebab Laptop Overheat & Solusinya",
    summary: "Panas berlebih merusak komponen. Pelajari penyebab dan langkah pencegahan.",
    author: "Tim Ryota QC", date: "2026-02-14", readMinutes: 5,
    tags: ["Overheat", "Thermal"],
    blocks: [
      { heading: "Gejala", body: "Casing panas, kipas berisik, laptop tiba-tiba mati saat dipakai berat, performa drop (thermal throttling)." },
      { heading: "Penyebab", body: "Thermal paste kering, debu menumpuk di heatsink, kipas lemah, ventilasi tertutup, beban aplikasi terlalu berat, suhu ruangan tinggi." },
      { heading: "Pengecekan", body: "Pakai HWMonitor atau Core Temp. Suhu idle normal 35-50°C, load berat 70-85°C. Di atas 90°C = bermasalah." },
      { heading: "Solusi", body: "1) Bersihkan heatsink & kipas dari debu. 2) Ganti thermal paste setiap 1-2 tahun. 3) Gunakan cooling pad. 4) Pakai laptop di permukaan keras, bukan kasur." },
      { heading: "Risiko", body: "Bongkar laptop hati-hati. Salah pasang heatsink bisa membuat suhu makin tinggi. Pakai thermal paste berkualitas (MX-4, Thermal Grizzly)." },
    ],
  }),
  A({
    slug: "cek-baterai-drop",
    section: "maintenance", kind: "hardware", thumb: "battery",
    title: "Cara Cek Baterai Drop & Replacement",
    summary: "Validasi battery health & kapan harus ganti baterai.",
    author: "Tim Ryota QC", date: "2026-02-16", readMinutes: 5,
    tags: ["Battery", "Maintenance"],
    blocks: [
      { heading: "Gejala", body: "Persentase loncat (90% → 40%), laptop mati mendadak, charging cepat tapi habis cepat, casing menggelembung." },
      { heading: "Tools", body: "Windows: powercfg /batteryreport. MacBook: System Information → Power → Battery Information. Aplikasi: BatteryInfoView, AIDA64." },
      { heading: "Indikator Drop", body: "Full Charge Capacity < 75% dari Design Capacity = aus. Cycle Count mendekati maksimum (500-1000) = ganti." },
      { heading: "Solusi", body: "Kalibrasi baterai: charge 100%, biarkan diam 2 jam, pakai sampai mati, charge full lagi. Jika tidak membaik → ganti baterai original." },
      { heading: "Risiko", body: "JANGAN pakai baterai menggelembung. Bahaya kebakaran. Beli baterai original atau OEM bersertifikat." },
    ],
  }),
  A({
    slug: "ssd-bermasalah",
    section: "maintenance", kind: "hardware", thumb: "storage",
    title: "Cara Cek SSD Bermasalah & Bad Sector",
    summary: "Deteksi dini storage rusak sebelum data hilang.",
    author: "Tim Ryota QC", date: "2026-02-18", readMinutes: 5,
    tags: ["SSD", "Storage"],
    blocks: [
      { heading: "Gejala", body: "Booting lama, file corrupt, Windows freeze, error 'disk read error', SMART warning, suara klik (HDD)." },
      { heading: "Tools Wajib", body: "CrystalDiskInfo (cek SMART & health %), CrystalDiskMark (benchmark speed), HD Tune (surface scan bad sector)." },
      { heading: "Interpretasi", body: "Health: Good (>90%), Caution (50-90% — backup segera), Bad (<50% — ganti). Reallocated Sectors Count > 0 = ada bad sector." },
      { heading: "Tindakan", body: "1) Backup data segera jika Caution/Bad. 2) Jalankan chkdsk /f /r untuk repair logical error. 3) Untuk SSD: cek firmware update dari vendor. 4) Ganti jika sudah Bad." },
      { heading: "Risiko", body: "Pakai storage Caution masih bisa, tapi data wajib di-mirror. Hindari menyimpan data penting di storage bermasalah." },
    ],
  }),
  A({
    slug: "lcd-bergaris",
    section: "maintenance", kind: "hardware", thumb: "lcd",
    title: "Penyebab LCD Bergaris & Solusi",
    summary: "Diagnosa garis vertikal/horizontal pada layar laptop.",
    author: "Tim Ryota QC", date: "2026-02-20", readMinutes: 5,
    tags: ["LCD", "Display"],
    blocks: [
      { heading: "Gejala", body: "Garis vertikal/horizontal pada layar, warna pudar, sebagian layar putih/hitam, flicker." },
      { heading: "Pengecekan Awal", body: "Colok ke monitor eksternal via HDMI. Jika monitor eksternal normal = masalah di LCD/kabel flexible, bukan VGA." },
      { heading: "Penyebab", body: "Kabel flexible LCD longgar/rusak, panel LCD pecah internal, IC graphic motherboard bermasalah, konektor LVDS oksidasi." },
      { heading: "Solusi", body: "1) Tekan-tekan area bezel — jika garis hilang/berubah = kabel flexible. 2) Buka bezel, reseat kabel LCD. 3) Jika garis tetap → ganti LCD panel atau kabel flexible." },
      { heading: "Kapan ke Teknisi", body: "Jika setelah ganti LCD baru tetap bergaris → kemungkinan IC GPU bermasalah. Butuh teknisi board level." },
    ],
  }),
];

export const informasi = ARTICLES.filter((a) => a.section === "informasi");
export const maintenance = ARTICLES.filter((a) => a.section === "maintenance");

export function findArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function relatedArticles(article: Article, count = 3): Article[] {
  return ARTICLES.filter(
    (a) => a.slug !== article.slug && (a.section === article.section || a.kind === article.kind),
  ).slice(0, count);
}
