
CREATE TABLE public.qc_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'tools',
  subcategory TEXT,
  icon TEXT,
  image_url TEXT,
  download_url TEXT NOT NULL,
  version TEXT,
  platform TEXT,
  size_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.qc_tools TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qc_tools TO authenticated;
GRANT ALL ON public.qc_tools TO service_role;

ALTER TABLE public.qc_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published tools are public"
  ON public.qc_tools FOR SELECT
  USING (is_published = true OR public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert tools"
  ON public.qc_tools FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update tools"
  ON public.qc_tools FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete tools"
  ON public.qc_tools FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE TRIGGER update_qc_tools_updated_at
  BEFORE UPDATE ON public.qc_tools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX qc_tools_category_idx ON public.qc_tools (category, sort_order);

-- Seed initial tools
INSERT INTO public.qc_tools (name, description, category, subcategory, icon, download_url, version, platform, sort_order) VALUES
('Windows 11', 'ISO Windows 11 official Microsoft', 'os', 'windows', 'Monitor', 'https://www.microsoft.com/software-download/windows11', 'Latest', 'Windows', 1),
('Windows 10', 'ISO Windows 10 official Microsoft', 'os', 'windows', 'Monitor', 'https://www.microsoft.com/software-download/windows10', '22H2', 'Windows', 2),
('Ubuntu 24.04 LTS', 'Linux Ubuntu Desktop 24.04 LTS', 'os', 'linux', 'Terminal', 'https://ubuntu.com/download/desktop', '24.04', 'Linux', 3),
('Ubuntu 22.04 LTS', 'Linux Ubuntu Desktop 22.04 LTS', 'os', 'linux', 'Terminal', 'https://releases.ubuntu.com/22.04/', '22.04', 'Linux', 4),
('WinPE', 'Windows Preinstallation Environment', 'os', 'winpe', 'HardDrive', 'https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/winpe-intro', 'Latest', 'WinPE', 5),
('macOS Tahoe', 'macOS Tahoe installer', 'os', 'macos', 'Apple', '#', 'Latest', 'macOS', 6),
('macOS Sequoia', 'macOS Sequoia installer', 'os', 'macos', 'Apple', 'https://apps.apple.com/us/app/macos-sequoia/id6596773750', '15', 'macOS', 7),
('macOS Sonoma', 'macOS Sonoma installer', 'os', 'macos', 'Apple', 'https://apps.apple.com/us/app/macos-sonoma/id6450717509', '14', 'macOS', 8),
('macOS Monterey', 'macOS Monterey installer', 'os', 'macos', 'Apple', 'https://apps.apple.com/us/app/macos-monterey/id1576738294', '12', 'macOS', 9),
('macOS Big Sur', 'macOS Big Sur installer', 'os', 'macos', 'Apple', 'https://apps.apple.com/us/app/macos-big-sur/id1526878132', '11', 'macOS', 10),
('Hard Disk Sentinel', 'Cek health HDD/SSD secara mendetail', 'tools', 'storage', 'HardDrive', 'https://www.hdsentinel.com/download.php', 'Pro', 'Windows', 1),
('CrystalDiskInfo', 'Monitoring SMART drive status', 'tools', 'storage', 'HardDrive', 'https://crystalmark.info/en/download/', 'Latest', 'Windows', 2),
('CrystalDiskMark', 'Benchmark kecepatan storage', 'tools', 'storage', 'Activity', 'https://crystalmark.info/en/download/', 'Latest', 'Windows', 3),
('LCD Test (EIZO Monitor Test)', 'Test pixel dan kualitas layar online', 'tools', 'display', 'Monitor', 'https://www.eizo.be/monitor-test/', 'Web', 'Web', 4),
('Dead Pixel Test', 'Cek dead pixel & stuck pixel layar', 'tools', 'display', 'Monitor', 'https://www.deadpixeltest.org/', 'Web', 'Web', 5),
('Keyboard Tester', 'Cek seluruh tombol keyboard', 'tools', 'input', 'Keyboard', 'https://en.key-test.ru/', 'Web', 'Web', 6),
('BatteryInfoView', 'Cek detail battery health laptop', 'tools', 'battery', 'Battery', 'https://www.nirsoft.net/utils/battery_information_view.html', 'Latest', 'Windows', 7),
('coconutBattery', 'Cek battery health MacBook', 'tools', 'battery', 'Battery', 'https://www.coconut-flavour.com/coconutbattery/', '3', 'macOS', 8),
('HWiNFO', 'Info hardware lengkap & monitoring sensor', 'tools', 'system', 'Cpu', 'https://www.hwinfo.com/download/', 'Latest', 'Windows', 9),
('CPU-Z', 'Info detail CPU, motherboard, RAM', 'tools', 'system', 'Cpu', 'https://www.cpuid.com/softwares/cpu-z.html', 'Latest', 'Windows', 10),
('GPU-Z', 'Info detail kartu grafis', 'tools', 'system', 'Cpu', 'https://www.techpowerup.com/gpuz/', 'Latest', 'Windows', 11),
('Rufus', 'Buat bootable USB installer OS', 'tools', 'utility', 'Wrench', 'https://rufus.ie/', 'Latest', 'Windows', 12);
