
-- 1) procedure_steps table
CREATE TABLE public.procedure_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number int NOT NULL UNIQUE,
  phase int NOT NULL DEFAULT 1,
  phase_label text NOT NULL DEFAULT 'Tahap 1',
  phase_title text NOT NULL DEFAULT '',
  title text NOT NULL,
  icon text,
  tint text,
  bullets jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_key text,
  featured_image text,
  status public.content_status NOT NULL DEFAULT 'published',
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.procedure_steps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.procedure_steps TO authenticated;
GRANT ALL ON public.procedure_steps TO service_role;

ALTER TABLE public.procedure_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "procedure_steps public read"
  ON public.procedure_steps FOR SELECT
  USING (status = 'published' OR public.is_staff(auth.uid()));

CREATE POLICY "procedure_steps staff insert"
  ON public.procedure_steps FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "procedure_steps staff update"
  ON public.procedure_steps FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "procedure_steps staff delete"
  ON public.procedure_steps FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE TRIGGER trg_procedure_steps_updated
  BEFORE UPDATE ON public.procedure_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Seed 20 procedure steps
INSERT INTO public.procedure_steps (step_number, phase, phase_label, phase_title, title, icon, tint, image_key, bullets) VALUES
(1, 1, 'Tahap 1', 'Penerimaan & Pemeriksaan Fisik', 'Terima Unit & Identifikasi Awal', 'ClipboardCheck', 'from-sky-100 to-blue-200 text-sky-700', 'p01', '["Catat brand/tipe dan serial number","Catat spesifikasi dasar unit","Validasi layar & VGA","Cek kelengkapan unit & charger","Cek status garansi tidak aktif"]'::jsonb),
(2, 1, 'Tahap 1', 'Penerimaan & Pemeriksaan Fisik', 'Pengecekan Fisik Awal', 'Laptop', 'from-indigo-100 to-violet-200 text-indigo-700', 'p02', '["Cek body: retak, pecah, penyok","Periksa engsel kuat & senyap","Cek charger original/kompatibel","Cek sticker, garskin & segel"]'::jsonb),
(3, 1, 'Tahap 1', 'Penerimaan & Pemeriksaan Fisik', 'Pengecekan Fisik Lanjutan', 'ScanSearch', 'from-rose-100 to-pink-200 text-rose-700', 'p03', '["Cek LCD: dead pixel, garis, flicker, backlight bleeding","Cek keyboard: tombol & kondisi","Cek port: karat, pin patah, longgar","Cek lampu indikator: caps, num, charging, power"]'::jsonb),
(4, 1, 'Tahap 1', 'Penerimaan & Pemeriksaan Fisik', 'Buka Ryota QC & Validasi System Information', 'MonitorCog', 'from-cyan-100 to-sky-200 text-cyan-700', 'p04', '["Cocokkan OS, model & serial","Validasi processor, RAM & storage","Cek resolusi LCD & VGA","Catat selisih spesifikasi jika ada"]'::jsonb),
(5, 1, 'Tahap 1', 'Penerimaan & Pemeriksaan Fisik', 'Cek Computrace / Absolute Persistence', 'ShieldAlert', 'from-amber-100 to-orange-200 text-amber-700', 'p05', '["Aman jika disabled / permanently disabled / not activated","Waspada jika available / belum aktif / status belum jelas","Retur jika activated / enabled / locked / BIOS terkunci","Wajib untuk seri bisnis/corporate"]'::jsonb),
(6, 2, 'Tahap 2', 'Pengecekan Fungsi & Sistem', 'Menu Quality Control — Checklist Fungsi', 'ListChecks', 'from-emerald-100 to-teal-200 text-emerald-700', 'p06', '["Jalankan checklist fungsi utama","LCD test, battery, storage, keyboard, audio, camera, port","WiFi, benchmark & running test","Dokumentasikan setiap hasil"]'::jsonb),
(7, 2, 'Tahap 2', 'Pengecekan Fungsi & Sistem', 'LCD Test', 'Monitor', 'from-fuchsia-100 to-pink-200 text-fuchsia-700', 'p07', '["Uji warna merah, hijau, biru, putih, hitam","Pastikan tidak ada dead pixel, garis, flicker, shadow","Cek backlight bleeding & retak halus"]'::jsonb),
(8, 2, 'Tahap 2', 'Pengecekan Fungsi & Sistem', 'Storage Health', 'HardDrive', 'from-blue-100 to-indigo-200 text-blue-700', 'p08', '["Gunakan Hard Disk Sentinel / CrystalDiskInfo","Cek health, TBW SSD sesuai kapasitas","HDD: pastikan reallocated & pending sector aman"]'::jsonb),
(9, 2, 'Tahap 2', 'Pengecekan Fungsi & Sistem', 'Battery Health & Battery Report', 'BatteryCharging', 'from-lime-100 to-emerald-200 text-emerald-700', 'p09', '["Hitung Full Charge Capacity / Design Capacity","Cek cycle count, drop, dan baterai menggembung","Uji stabilitas saat charger dicabut"]'::jsonb),
(10, 2, 'Tahap 2', 'Pengecekan Fungsi & Sistem', 'Keyboard Test', 'Keyboard', 'from-slate-100 to-zinc-200 text-slate-700', 'p10', '["Tes semua tombol satu per satu","Pastikan tidak ada tombol mati, double input, menekan sendiri","Pastikan function/shortcut normal"]'::jsonb),
(11, 2, 'Tahap 2', 'Pengecekan Fungsi & Sistem', 'Audio, Mic, dan Camera Test', 'Mic', 'from-orange-100 to-red-200 text-orange-700', 'p11', '["Cek speaker kiri-kanan & audio jack","Tes mic internal & kualitas suara","Cek webcam & rekam video"]'::jsonb),
(12, 2, 'Tahap 2', 'Pengecekan Fungsi & Sistem', 'WiFi & Bluetooth', 'Wifi', 'from-cyan-100 to-blue-200 text-cyan-700', 'p12', '["Cek koneksi jaringan & browsing","Pastikan stabilitas sinyal baik","Cek transfer Bluetooth ke perangkat lain"]'::jsonb),
(13, 2, 'Tahap 2', 'Pengecekan Fungsi & Sistem', 'Port Test', 'Usb', 'from-violet-100 to-purple-200 text-violet-700', 'p13', '["Tes USB-A, USB-C (data/charge/display)","HDMI, VGA, LAN","Audio jack, SD card, charging port"]'::jsonb),
(14, 2, 'Tahap 2', 'Pengecekan Fungsi & Sistem', 'Touchpad & Touchscreen', 'MousePointer2', 'from-teal-100 to-cyan-200 text-teal-700', 'p14', '["Cek klik kiri/kanan, drag, scroll, multi-touch/gesture","Touchscreen via Device Manager","Kalibrasi dengan tabcal jika perlu"]'::jsonb),
(15, 2, 'Tahap 2', 'Pengecekan Fungsi & Sistem', 'Backlight Keyboard & LCD', 'Sun', 'from-yellow-100 to-amber-200 text-yellow-700', 'p15', '["Cek brightness naik-turun","Pastikan tidak ada area gelap atau kebocoran cahaya","Backlight keyboard menyala merata"]'::jsonb),
(16, 3, 'Tahap 3', 'Performa, Catatan & Finalisasi', 'Benchmark', 'BarChart3', 'from-blue-100 to-sky-200 text-blue-700', 'p16', '["Jalankan HW Information","CPU heavy load, FurMark GPU test","SSD test speed sesuai kebutuhan unit"]'::jsonb),
(17, 3, 'Tahap 3', 'Performa, Catatan & Finalisasi', 'Stress Test CPU & GPU', 'Flame', 'from-red-100 to-orange-200 text-red-700', 'p17', '["Gunakan Cinebench & FurMark beberapa menit","Pantau suhu, throttling, stabilitas, restart, artifact & fan"]'::jsonb),
(18, 3, 'Tahap 3', 'Performa, Catatan & Finalisasi', 'Running Test', 'PlayCircle', 'from-indigo-100 to-blue-200 text-indigo-700', 'p18', '["Jalankan video / beban ringan dalam durasi tertentu","Pantau suhu, fan & baterai","Pastikan tidak freeze atau drop performa"]'::jsonb),
(19, 3, 'Tahap 3', 'Performa, Catatan & Finalisasi', 'Catatan Otomatis & Catatan Tambahan', 'FileText', 'from-emerald-100 to-green-200 text-emerald-700', 'p19', '["Catat hasil checklist otomatis","Catat kode unit, tanggal test, minus, tindakan & catatan teknisi"]'::jsonb),
(20, 3, 'Tahap 3', 'Performa, Catatan & Finalisasi', 'Penentuan Status Akhir QC', 'BadgeCheck', 'from-primary/10 to-blue-200 text-primary', 'p20', '["Simpulkan unit ke kategori: Lolos QC, Minus Ringan, Perlu Perbaikan, atau Retur/Ditolak","Pastikan dokumentasi lengkap"]'::jsonb);

UPDATE public.procedure_steps SET sort_order = step_number;

-- 3) Seed 11 SOP items, linked to existing SOP categories by slug
INSERT INTO public.sop_items (title, slug, category_id, content, checklist_items, pass_criteria, minus_criteria, return_criteria, status)
SELECT v.title, v.slug, c.id, v.content, v.checklist::jsonb, v.pass, v.minus, v.ret, 'published'::public.content_status
FROM (VALUES
  ('SOP Fisik','fisik','sop-fisik',
   'SOP Fisik mengatur pengecekan kondisi luar unit sebelum dilanjutkan ke pengujian software.',
   '["Body: cover atas, palmrest, cover bawah, sudut, samping — periksa retak, pecah, penyok","Engsel: buka-tutup, tidak oblak, tidak terlalu keras, layar stabil","Sekrup bawah lengkap (sekrup hilang = indikasi bongkar)","Sticker / garskin / segel utuh","Charger original / kompatibel, kabel tidak terkelupas"]',
   E'Body presisi, hanya lecet pemakaian normal\nEngsel rapat & stabil\nSekrup & segel lengkap\nCharger sehat',
   E'Lecet/baret tipis\nCharger replacement masih aman\nSekrup 1–2 hilang dengan riwayat servis jelas',
   E'Body pecah/retak besar\nEngsel patah/oblak parah\nSegel rusak tanpa riwayat servis\nCharger replacement berisiko'),
  ('SOP LCD','lcd','sop-lcd',
   'Standar pengecekan kualitas layar dalam kondisi mati dan menyala.',
   '["Uji warna merah, hijau, biru, putih, hitam","Periksa dead pixel, stuck pixel, garis, flicker","Shadow, ghosting, backlight bleeding berlebihan","Retak halus, frame LCD renggang, layar menguning"]',
   E'Warna merata\nTidak flicker, tidak bergaris\nTidak ada kerusakan visual mengganggu',
   E'White spot kecil\nBaret tipis\nWarna sedikit tidak merata namun nyaman',
   E'LCD bergaris\nFlicker parah\nDead pixel banyak\nBacklight mati\nLayar retak'),
  ('SOP Keyboard','keyboard','sop-keyboard',
   'Standar pengecekan kondisi & fungsi keyboard.',
   '["Tes semua tombol satu per satu","Periksa double input, tombol mencet sendiri","Function/brightness/volume/shortcut berfungsi","Backlight keyboard (jika tersedia)"]',
   E'Semua tombol responsif, tidak ghost',
   E'Huruf aus / tombol agak keras tapi normal',
   E'Tombol mati\nTombol mencet sendiri\nBeberapa tombol tidak terbaca'),
  ('SOP Battery','battery','sop-battery',
   'Standar pengecekan kesehatan baterai menggunakan Battery Report.',
   '["Hitung Full Charge Capacity ÷ Design Capacity × 100%","powercfg /batteryreport untuk laporan resmi Windows","Cek cycle count & riwayat pemakaian","Periksa fisik baterai (gembung), drop test, mati saat charger dicabut"]',
   E'Health baik, tidak drop cepat, tidak gembung',
   E'Health rendah, backup time pendek, cycle tinggi tapi masih normal',
   E'Gembung\nTidak terdeteksi\nDrop ekstrem\nMati saat charger dicabut\nReport invalid'),
  ('SOP Storage','storage','sop-storage',
   'Standar pengecekan SSD/HDD menggunakan CrystalDiskInfo / Hard Disk Sentinel.',
   '["Health status, Reallocated/Pending Sector (HDD wajib 0)","Power On Hours","TBW SSD: 128GB ~80TB, 256GB ~150TB, 512GB ~300TB, 1TB ~600TB","Speed read/write, suhu, respon membuka file"]',
   E'Health tinggi, tidak ada bad sector, speed normal, suhu aman',
   E'Health mulai turun tapi masih aman\nPower On Hours tinggi\nSpeed sedikit di bawah normal',
   E'Health <50%\nBad/Pending sector\nSuara klik (HDD)\nSering freeze\nSSD tidak stabil'),
  ('SOP Port','port','sop-port',
   'Tes semua port menggunakan perangkat nyata (flashdisk, monitor, headset).',
   '["USB-A: tes flashdisk","USB-C: tes data / charge / display (jika support)","HDMI ke monitor","VGA (jika tersedia), LAN, audio jack","SD Card / MicroSD","Charging port stabil"]',
   E'Semua port berfungsi & stabil',
   E'Port longgar ringan / non-prioritas bermasalah',
   E'Port utama mati\nCharging port bermasalah\nHDMI mati pada unit wajib display output'),
  ('SOP Audio, Mic, Camera','audio','sop-audio-mic-camera',
   'Standar pengecekan speaker, mic, dan kamera.',
   '["Speaker kiri & kanan, volume tidak pecah","Audio jack stabil","Mic internal merekam jelas","Kamera depan & tambahan tampil normal"]',
   E'Kamera normal, mic jelas, speaker bersih',
   E'Speaker sedikit pecah\nKamera buram\nMic kecil tapi terdengar',
   E'Kamera mati\nMic tidak terdeteksi\nSpeaker mati / audio tidak keluar'),
  ('SOP WiFi & Bluetooth','wifi','sop-wifi-bluetooth',
   'Cek koneksi WiFi & Bluetooth dengan perangkat nyata.',
   '["WiFi mendeteksi jaringan & connect","Sinyal stabil pada jarak normal","Bluetooth pairing ke HP / speaker / headset","Transfer data Bluetooth berjalan"]',
   E'WiFi & BT terdeteksi, koneksi stabil',
   E'Sinyal agak lemah tapi bisa digunakan',
   E'WiFi tidak terdeteksi\nSering disconnect\nBT mati\nDevice Manager error hardware'),
  ('SOP Touchpad & Touchscreen','touchpad','sop-touchpad',
   'Cek touchpad & touchscreen.',
   '["Klik kiri/kanan, double click, drag","Scroll & zoom dua jari, gesture Windows","Touchscreen via Device Manager → HID-compliant touch screen","Kalibrasi touchscreen dengan tabcal"]',
   E'Responsif & akurat, tidak ghost',
   E'Aus / gesture perlu driver tapi fungsi dasar normal',
   E'Touchpad mati\nTouchscreen tidak merespon\nGhost touch\nKlik tidak bisa'),
  ('SOP Benchmark & Running Test','benchmark','sop-benchmark',
   'Stress test CPU & GPU + running test.',
   '["Cinebench Multi Core + HWMonitor/HWiNFO untuk CPU","FurMark 5–10 menit untuk GPU dedicated","Patokan suhu CPU: 70–85°C normal, 85–95°C panas, >95°C bermasalah","Running test (VLC / RT.mp4) untuk validasi stabilitas"]',
   E'Stabil, suhu aman, tidak crash, tidak artifact',
   E'Suhu agak tinggi, perlu maintenance / repasta',
   E'Overheat parah\nMati mendadak\nBSOD\nArtifact\nThrottling berat'),
  ('SOP Computrace & BIOS Security','security','sop-computrace',
   'Pengecekan keamanan BIOS — wajib untuk unit bisnis (ThinkPad, Latitude, EliteBook, ProBook).',
   '["Restart → BIOS → Security","Cari menu Computrace / Absolute Persistence / Absolute Software","Cek juga supervisor password, secure boot, TPM"]',
   E'Disabled / Permanently Disabled / Not Activated / menu tidak tersedia',
   E'Available belum aktif\nOpsi masih bisa di-disable\nStatus belum jelas, perlu verifikasi ulang',
   E'Activated / Enabled / Locked\nBIOS terkunci sehingga status tidak bisa dicek\nDevice masih terhubung ke perusahaan/pemilik lama')
) AS v(title, slug, cat_slug, content, checklist, pass, minus, ret)
JOIN public.categories c ON c.slug = v.cat_slug
WHERE NOT EXISTS (SELECT 1 FROM public.sop_items s WHERE s.slug = v.slug);
