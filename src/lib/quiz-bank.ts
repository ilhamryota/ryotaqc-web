export type QuizQ = {
  q: string;
  options: string[];
  answer: number; // index
  explanation: string;
  level: "dasar" | "menengah" | "tinggi" | "lanjutan";
};

export const QUESTIONS: QuizQ[] = [
  // Dasar (10)
  { level: "dasar", q: "Apa fungsi RAM pada laptop?", options: ["Menyimpan data permanen", "Menjalankan proses sementara saat aplikasi digunakan", "Mengatur warna layar", "Mengisi daya baterai"], answer: 1, explanation: "RAM menyimpan data sementara yang sedang diproses CPU." },
  { level: "dasar", q: "Komponen yang menjadi 'otak' laptop adalah?", options: ["RAM", "Processor", "Storage", "Baterai"], answer: 1, explanation: "Processor (CPU) memproses seluruh instruksi." },
  { level: "dasar", q: "Driver berfungsi untuk?", options: ["Mengisi storage", "Menjembatani hardware dengan sistem operasi", "Membuat baterai awet", "Mempercepat WiFi"], answer: 1, explanation: "Driver memungkinkan OS berkomunikasi dengan hardware." },
  { level: "dasar", q: "Resolusi FHD adalah?", options: ["1280x720", "1920x1080", "2560x1440", "3840x2160"], answer: 1, explanation: "FHD = 1920x1080." },
  { level: "dasar", q: "Storage yang lebih cepat dibanding HDD adalah?", options: ["SSD", "DVD", "RAM", "VGA"], answer: 0, explanation: "SSD jauh lebih cepat dari HDD." },
  { level: "dasar", q: "Apa itu BIOS?", options: ["Sistem operasi", "Firmware dasar untuk inisialisasi hardware", "Aplikasi office", "Driver kamera"], answer: 1, explanation: "BIOS/UEFI menginisialisasi hardware saat boot." },
  { level: "dasar", q: "Layar IPS dikenal karena?", options: ["Sudut pandang sempit", "Warna akurat & sudut pandang luas", "Refresh rate rendah", "Tahan air"], answer: 1, explanation: "IPS unggul di warna & viewing angle." },
  { level: "dasar", q: "VGA terintegrasi (iGPU) berarti?", options: ["VGA terpisah", "VGA menyatu dengan processor", "VGA eksternal USB", "Layar tambahan"], answer: 1, explanation: "iGPU menyatu dengan CPU." },
  { level: "dasar", q: "Windows adalah?", options: ["Browser", "Sistem operasi", "Antivirus", "Driver"], answer: 1, explanation: "Windows adalah OS keluaran Microsoft." },
  { level: "dasar", q: "Untuk pekerjaan kantor ringan minimal RAM idealnya?", options: ["2 GB", "4 GB", "8 GB", "32 GB"], answer: 2, explanation: "8 GB nyaman untuk multitasking ringan." },

  // Menengah (12)
  { level: "menengah", q: "Perbedaan utama SSD SATA dan NVMe?", options: ["NVMe umumnya lebih cepat via PCIe", "SATA selalu lebih cepat", "NVMe hanya laptop lama", "SATA tidak bisa untuk Windows"], answer: 0, explanation: "NVMe menggunakan PCIe sehingga jauh lebih cepat dari SATA." },
  { level: "menengah", q: "Dual channel RAM bermanfaat untuk?", options: ["Meningkatkan kapasitas storage", "Meningkatkan bandwidth memori", "Mempercepat WiFi", "Mengurangi suhu CPU"], answer: 1, explanation: "Dual channel menggandakan bandwidth RAM." },
  { level: "menengah", q: "TDP processor adalah?", options: ["Tegangan baterai", "Konsumsi daya rata-rata di bawah beban dasar", "Resolusi layar", "Kecepatan WiFi"], answer: 1, explanation: "TDP menggambarkan disipasi panas/daya CPU." },
  { level: "menengah", q: "Thermal throttling terjadi karena?", options: ["RAM penuh", "Suhu CPU/GPU terlalu tinggi sehingga clock diturunkan", "WiFi mati", "Storage penuh"], answer: 1, explanation: "Sistem menurunkan performa untuk mendinginkan komponen." },
  { level: "menengah", q: "Intel Core generasi ke-13 dapat dikenali dari?", options: ["Awalan 12xxx", "Awalan 13xxx pada model number", "Akhiran K saja", "Logo merah"], answer: 1, explanation: "Misal i5-13500." },
  { level: "menengah", q: "Cara membuka Battery Report via CMD?", options: ["powercfg /batteryreport", "msconfig", "dxdiag", "chkdsk"], answer: 0, explanation: "Perintah resmi Windows untuk laporan baterai." },
  { level: "menengah", q: "Health storage idealnya minimal?", options: ["20%", "50%", "80%", "100% selalu"], answer: 2, explanation: "Standar QC umumnya minimal 80%." },
  { level: "menengah", q: "Reallocated Sector pada HDD wajib?", options: ["Banyak", "0", "Di atas 100", "Tidak penting"], answer: 1, explanation: "Reallocated/Pending sector ideal 0." },
  { level: "menengah", q: "Cycle count baterai menunjukkan?", options: ["Suhu baterai", "Jumlah siklus pengisian penuh", "Tegangan", "Kapasitas storage"], answer: 1, explanation: "Cycle count = jumlah siklus pengisian." },
  { level: "menengah", q: "RAM SODIMM lazim digunakan di?", options: ["Laptop", "Server rack", "Smartphone", "Kulkas"], answer: 0, explanation: "SODIMM adalah form factor RAM laptop." },
  { level: "menengah", q: "Device Manager untuk?", options: ["Cek perangkat & driver", "Cek harga laptop", "Cek warna LCD", "Cek baterai"], answer: 0, explanation: "Daftar perangkat & status driver." },
  { level: "menengah", q: "Cinebench digunakan untuk?", options: ["Render benchmark CPU", "Cek WiFi", "Update BIOS", "Cek baterai"], answer: 0, explanation: "Benchmark render CPU multi/single core." },

  // Tinggi (10)
  { level: "tinggi", q: "Laptop mati saat benchmark, suhu CPU >95°C. Kemungkinan masalah?", options: ["Speaker rusak", "Sistem pendingin bermasalah", "Keyboard error", "Bluetooth"], answer: 1, explanation: "Overheat menandakan masalah pendinginan (thermal paste/fan)." },
  { level: "tinggi", q: "Computrace aktif & terkunci di BIOS termasuk?", options: ["Lolos QC", "Minus ringan", "Retur / ditolak", "Tidak perlu dicek"], answer: 2, explanation: "Berisiko keamanan & kepemilikan." },
  { level: "tinggi", q: "Artifact saat GPU dibebani menunjukkan?", options: ["Driver audio rusak", "VRAM/GPU bermasalah", "RAM penuh", "WiFi lemah"], answer: 1, explanation: "Artifact = indikasi kuat GPU/VRAM bermasalah." },
  { level: "tinggi", q: "FurMark digunakan untuk?", options: ["Stress test GPU", "Cek baterai", "Cek WiFi", "Cek mic"], answer: 0, explanation: "FurMark adalah stress test GPU." },
  { level: "tinggi", q: "TBW untuk SSD 512GB patokan maksimal sekitar?", options: ["80 TB", "150 TB", "300 TB", "600 TB"], answer: 2, explanation: "Patokan 512GB ~300TB." },
  { level: "tinggi", q: "Tanda jalur charging bermasalah?", options: ["Layar mati", "Baterai tidak mengisi meski charger normal", "Speaker pecah", "WiFi lambat"], answer: 1, explanation: "Indikasi jalur charging / port DC bermasalah." },
  { level: "tinggi", q: "BSOD berulang dengan kode WHEA_UNCORRECTABLE sering disebabkan oleh?", options: ["Update aplikasi", "Hardware/CPU error", "Wallpaper rusak", "Mic mati"], answer: 1, explanation: "WHEA = hardware error yang serius." },
  { level: "tinggi", q: "Driver tanda seru kuning di Device Manager artinya?", options: ["Driver up to date", "Perangkat bermasalah / driver belum ter-install benar", "Perangkat baru", "Perangkat tidur"], answer: 1, explanation: "Indikasi konflik / driver belum benar." },
  { level: "tinggi", q: "Suhu CPU 88°C saat Cinebench masuk kategori?", options: ["Normal sempurna", "Cukup panas, masih bisa diterima", "Aman sangat dingin", "Wajib retur"], answer: 1, explanation: "85–95°C cukup panas namun masih dapat diterima." },
  { level: "tinggi", q: "Tabcal pada Windows digunakan untuk?", options: ["Kalibrasi touchscreen", "Update BIOS", "Cek WiFi", "Format storage"], answer: 0, explanation: "Tool kalibrasi pen/touch." },

  // Lanjutan (10)
  { level: "lanjutan", q: "Undervolting CPU bertujuan?", options: ["Menaikkan suhu", "Menurunkan tegangan untuk efisiensi & suhu lebih rendah", "Menambah clock maksimum", "Memutus garansi otomatis"], answer: 1, explanation: "Undervolt menurunkan voltase untuk efisiensi & termal." },
  { level: "lanjutan", q: "Bottleneck CPU pada gaming ditandai?", options: ["GPU 100%, CPU rendah", "CPU 100%, GPU rendah", "Storage penuh", "RAM tidak terbaca"], answer: 1, explanation: "CPU jadi penghambat sehingga GPU tidak terpakai penuh." },
  { level: "lanjutan", q: "VRM laptop berfungsi?", options: ["Mengatur audio", "Mengatur suplai daya CPU/GPU", "Mengatur backlight", "Mengatur WiFi"], answer: 1, explanation: "VRM mengatur power delivery ke CPU/GPU." },
  { level: "lanjutan", q: "Apple Silicon dibanding Intel Mac unggul di?", options: ["Power efficiency & performance per watt", "Bisa dual-boot Windows lebih mudah", "Selalu lebih murah", "Selalu lebih lambat"], answer: 0, explanation: "Apple Silicon efisien sekali per watt." },
  { level: "lanjutan", q: "Power limit (PL1/PL2) Intel mengatur?", options: ["Resolusi layar", "Konsumsi daya jangka panjang/pendek CPU", "Kecepatan WiFi", "Cycle baterai"], answer: 1, explanation: "PL1/PL2 = batas daya jangka panjang & burst." },
  { level: "lanjutan", q: "Repasta thermal disarankan jika?", options: ["Suhu terus tinggi padahal fan bersih & beban normal", "WiFi lambat", "Layar redup", "Baterai bocor"], answer: 0, explanation: "Pasta kering = transfer panas turun." },
  { level: "lanjutan", q: "Secure Boot berfungsi?", options: ["Mempercepat boot", "Memastikan hanya bootloader bertandatangan yang dijalankan", "Membuat layar lebih terang", "Menambah RAM"], answer: 1, explanation: "Validasi rantai boot via signature." },
  { level: "lanjutan", q: "TPM 2.0 dibutuhkan untuk?", options: ["Windows 11", "Mac OS", "Linux dasar", "DOS"], answer: 0, explanation: "Windows 11 mensyaratkan TPM 2.0." },
  { level: "lanjutan", q: "Diagnosa motherboard mati total sebaiknya dimulai dari?", options: ["Cek charger & jalur power input", "Ganti RAM langsung", "Format SSD", "Reinstall Windows"], answer: 0, explanation: "Mulai dari sumber daya terlebih dahulu." },
  { level: "lanjutan", q: "Risiko utama modifikasi hardware?", options: ["Tidak ada", "Hilangnya garansi & potensi kerusakan permanen", "Layar menjadi 4K", "Baterai jadi awet otomatis"], answer: 1, explanation: "Garansi hangus & risiko rusak." },
];

export function pickQuestions(level: "dasar" | "menengah" | "tinggi" | "lanjutan", count: number) {
  const map: Record<typeof level, readonly QuizQ["level"][]> = {
    dasar: ["dasar"],
    menengah: ["dasar", "menengah"],
    tinggi: ["dasar", "menengah", "tinggi"],
    lanjutan: ["dasar", "menengah", "tinggi", "lanjutan"],
  };
  const allowed = map[level];
  const pool = QUESTIONS.filter((q) => allowed.includes(q.level));

  // Shuffle
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  // Repeat to reach count if needed
  const out: QuizQ[] = [];
  let i = 0;
  while (out.length < count && shuffled.length > 0) {
    out.push(shuffled[i % shuffled.length]);
    i++;
  }
  return out;
}
