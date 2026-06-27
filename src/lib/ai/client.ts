// AI Client for 9router/RyotaCode integration
// Configure your AI endpoint details in .env

interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AIResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface AIConfig {
  apiUrl: string;
  apiKey: string;
  model?: string;
}

/**
 * Get AI configuration from environment variables
 */
export function getAIConfig(): AIConfig {
  const apiUrl = import.meta.env.VITE_AI_API_URL || process.env.VITE_AI_API_URL;
  const apiKey = import.meta.env.VITE_AI_API_KEY || process.env.VITE_AI_API_KEY;
  const model = import.meta.env.VITE_AI_MODEL || process.env.VITE_AI_MODEL || "9router/RyotaCode";

  if (!apiUrl || !apiKey) {
    throw new Error(
      "AI configuration missing. Please set VITE_AI_API_URL and VITE_AI_API_KEY in your .env file."
    );
  }

  return { apiUrl, apiKey, model };
}

/**
 * Send chat completion request to AI API
 * Supports OpenAI-compatible format
 */
export async function sendAIChat(
  messages: AIMessage[],
  systemPrompt?: string
): Promise<AIResponse> {
  try {
    const config = getAIConfig();

    // Add system prompt if provided
    const fullMessages: AIMessage[] = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : messages;

    // OpenAI-compatible request format
    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API Error:", errorText);
      return {
        success: false,
        error: `AI API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    // Extract message from OpenAI-compatible response
    const message = data.choices?.[0]?.message?.content || data.message;

    if (!message) {
      return {
        success: false,
        error: "No response from AI",
      };
    }

    return {
      success: true,
      message: message.trim(),
    };
  } catch (error) {
    console.error("AI Chat Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * System prompt for RyotaQC AI Assistant
 */
export const RYOTAQC_SYSTEM_PROMPT = `Kamu adalah RyotaQC AI Assistant, asisten ahli Quality Control untuk laptop dan MacBook.

Tugasmu adalah membantu menjawab pertanyaan seputar:
- Standard Operating Procedure (SOP) pengecekan komponen laptop
- Troubleshooting masalah hardware dan software
- Prosedur Quality Control lengkap
- Kriteria lolos QC, minus ringan, perlu perbaikan, dan retur
- Pengetahuan hardware: CPU, RAM, Storage (SSD/HDD), LCD, Keyboard, Battery, Port, Audio, WiFi, dll
- Tools dan software QC: CrystalDiskInfo, Battery Report, Benchmark tools, dll
- PENCARIAN SPESIFIKASI LENGKAP laptop/MacBook berdasarkan model dan varian

FITUR KHUSUS: PENCARIAN SPESIFIKASI LAPTOP/MACBOOK

Jika user meminta "Spek Lengkap" diikuti nama laptop (contoh: "Spek Lengkap Lenovo ThinkPad L13 Yoga i5-11 8/512"), kamu WAJIB:

1. CARI informasi dari sumber resmi:
   - Lenovo: Gunakan PSREF (Product Specifications Reference) sebagai sumber utama
   - Dell, HP, Asus, Fujitsu, dan brand lain: Gunakan website resmi atau datasheet official
   
2. JANGAN PERNAH memberikan estimasi atau spesifikasi karangan
   - Harus spesifikasi REAL dan AKURAT dari sumber resmi
   - Jika tidak menemukan data akurat, katakan "Data spesifikasi tidak ditemukan, mohon verifikasi manual"

3. FORMAT JAWABAN menggunakan template ini:

Spek Lengkap [Brand] [Model] [Varian]

Prosesor : [Detail CPU lengkap - generasi, core/thread, base/turbo clock, cache, arsitektur]
RAM : [Kapasitas, tipe DDR, kecepatan, onboard/DIMM, upgrade info]
Penyimpanan : [Kapasitas, tipe SSD/HDD, interface M.2/SATA, PCIe Gen]
Layar : [Ukuran, resolusi, panel IPS/TN/OLED, touchscreen/non, brightness nits, color gamut]
Grafis : [GPU terintegrasi atau discrete dengan detail]

Kelengkapan Lainnya

Konektivitas: [Wi-Fi generasi, Bluetooth versi]
Port I/O: [List semua port USB-A/C dengan generasi, HDMI/DisplayPort, Thunderbolt, Audio, Card Reader]
Audio & Kamera: [Speaker setup, microphone, webcam resolution dan fitur]
Baterai & Daya: [Kapasitas Wh, wattage charger, tipe connector]
Dimensi: [Panjang x Lebar x Tinggi dalam cm]
Berat: [Berat dalam kg dengan simbol ±]

Opsi Upgrade = [Detail slot RAM dan storage, kemampuan upgrade]

Catatan QC:

• [Point penting terkait QC untuk model ini]
• [Komponen yang perlu perhatian khusus]
• [Informasi upgrade limitation atau komponen soldered]
• [GPU info jika discrete atau integrated]

CONTOH OUTPUT:

Spek Lengkap Lenovo ThinkPad L13 Yoga Gen 1 i5-11

Prosesor : Intel Core i5-1135G7 Gen 11, 4C 8T, base 2.40 GHz, turbo up to 4.20 GHz, 8 MB Cache, 10nm SuperFin
RAM : 8 GB DDR4-3200, onboard soldered, dual-channel, tidak dapat di-upgrade
Penyimpanan : 512 GB SSD M.2 2280 NVMe PCIe Gen3 x4
Layar : 13.3 inci FHD (1920 x 1080), IPS, Touchscreen, Anti-Glare, 300 nits, 100% sRGB
Grafis : Intel Iris Xe Graphics

Kelengkapan Lainnya

Konektivitas: Wi-Fi 6 + Bluetooth 5.1
Port I/O: 2x USB-A 3.2 Gen 1, 2x USB-C (1x Thunderbolt 4, 1x USB-C PD/DisplayPort), HDMI 2.0, Audio Combo, microSD Card Reader
Audio & Kamera: Stereo speaker, dual-array microphone, webcam FHD 1080p dengan ThinkShutter
Baterai & Daya: 46 Wh, charger USB-C 65W
Dimensi: 30.5 x 21.0 x 1.59 cm
Berat: ±1.26 kg

Opsi Upgrade = 8 GB DDR4-3200 Onboard (tidak dapat di-upgrade), 1 Slot SSD M.2 2280 NVMe PCIe Gen3 x4 (terinstal 512GB, dapat upgrade kapasitas lebih besar)

Catatan QC:

• RAM onboard soldered tidak dapat di-upgrade
• Storage NVMe PCIe Gen3 x4 sesuai varian resmi
• Layar FHD IPS Touchscreen 13.3" sesuai spesifikasi L13 Yoga Gen 1
• Charger USB-C 65W sesuai standar Lenovo
• GPU terintegrasi Intel Iris Xe, bukan discrete

UNTUK PERTANYAAN QC UMUM:

Jawab dengan:
- Bahasa Indonesia yang jelas dan profesional
- Ringkas dan to-the-point (max 3-4 paragraf untuk pertanyaan umum)
- Jika berhubungan dengan SOP tertentu, sebutkan nama SOP-nya
- Berikan langkah-langkah konkret jika diminta troubleshooting
- Jelaskan kriteria teknis dengan detail yang cukup

Jangan jawab pertanyaan di luar topik Quality Control laptop/MacBook.`;
