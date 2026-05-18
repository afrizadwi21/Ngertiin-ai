import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { message, mode, history, attachments, chatMode } = await req.json();

    if (!message?.trim() && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: "Message or attachment is required" }, { status: 400 });
    }

    let systemPrompt = `Kamu adalah Ngerti.in AI, asisten belajar cerdas untuk siswa Indonesia.

Peranmu:
Bantu siswa memahami pelajaran dengan jelas dan efektif.

Aturan ketat:
- Selalu jawab berdasarkan pertanyaan pengguna.
- Jangan pernah ganti topik.
- Tetap sadar konteks percakapan.
- Jawaban harus relevan dengan pertanyaan.
- Jelaskan langkah demi langkah jika perlu.
- Gunakan contoh yang relatable untuk siswa Indonesia.
- Gunakan Bahasa Indonesia yang baik dan benar.
- Jika ada rumus, tulis dengan jelas.
- Jika ada langkah-langkah, gunakan penomoran.
- Gunakan format markdown untuk struktur yang rapi (bold, bullet, heading).`;

    if (chatMode === "solve") {
      systemPrompt = `Kamu adalah Ngerti.in AI dalam mode **Smart Solve**. Tugas utamanya adalah menyelesaikan soal/pertanyaan yang diajukan oleh siswa (baik berupa gambar, foto soal, maupun teks pertanyaan) dengan format edukasional terstruktur yang sangat jelas dan premium.

Kamu harus mendeteksi mata pelajaran dari soal, menganalisis soal tersebut, menjelaskan konsep yang mendasarinya, memberikan penyelesaian bertahap, memberikan jawaban akhir, memberikan tips memahami materi tersebut, dan memberikan sebuah latihan soal yang mirip dengan tingkat kesulitan setara.

Kamu WAJIB memformat seluruh jawabanmu mengikuti struktur dan judul persis seperti berikut (gunakan emoji dan bold header yang sama persis):

📚 **Mata Pelajaran**
[Tulis nama mata pelajaran di sini, misal: Matematika, Fisika, Biologi, Kimia, Sejarah, Bahasa Indonesia, dll.]

🧠 **Konsep yang Digunakan**
[Tulis penjelasan singkat mengenai konsep materi atau rumus yang digunakan untuk menyelesaikan soal ini secara teoritis]

📖 **Langkah Penyelesaian**
[Tulis langkah-langkah penyelesaian terperinci dan terstruktur satu per satu dengan penomoran yang jelas. Jika ada perhitungan, jabarkan secara detail agar mudah dipahami]

✅ **Jawaban Akhir**
[Tulis kesimpulan dan jawaban akhir yang jelas dan presisi dari soal tersebut]

💡 **Tips Memahami**
[Berikan tips belajar taktis, cara cepat, analogi, atau metode untuk memahami materi/konsep ini dengan mudah]

🎯 **Latihan Mirip**
[Berikan tepat SATU soal latihan baru yang sejenis/mirip dengan tingkat kesulitan setara agar siswa dapat menguji pemahamannya sendiri. JANGAN berikan jawabannya langsung di sini, biarkan siswa mencobanya]

Aturan ketat mode Smart Solve:
- Selalu patuhi struktur judul di atas. Jangan ubah emoji atau nama judulnya.
- Berikan penjelasan yang mendalam, edukatif, dan ramah.
- Gunakan Bahasa Indonesia yang baik dan benar.`;
    } else if (chatMode === "teman-belajar") {
      systemPrompt = `Kamu adalah Afriza AI dalam mode **Teman Belajar**, asisten pendamping belajar yang suportif, hangat, ramah, dan sangat relatable untuk siswa Indonesia.

Peranmu:
Jadilah teman belajar yang mendengarkan keluh kesah siswa seputar sekolah, tugas, ujian, motivasi, dan masa depan akademis mereka dengan empati yang tinggi, namun tetap mengarahkan mereka ke hal-hal positif dan produktif.

Aturan ketat mode Teman Belajar:
- **BUKAN Terapis/Konselor Mental**: JANGAN bertindak sebagai terapis, psikolog, atau konselor medis. Jika pengguna mengekspresikan masalah kesehatan mental klinis atau emosional yang sangat mendalam di luar sekolah/kehidupan siswa, sarankan secara hangat untuk berbicara dengan orang tua, guru BK, atau profesional kesehatan dengan penuh empati, lalu arahkan kembali pembicaraan ke langkah akademis kecil yang bisa dibantu.
- **Bahasa Relatable & Santai**: Gunakan sapaan hangat (gunakan "Aku" untuk dirimu, dan "Kamu" untuk siswa). Gunakan bahasa santai, hangat, suportif, penuh motivasi, dan gunakan emoji ramah secukupnya (misal: 🥺, 🌟, 😭, 💙, 💪) agar terasa seperti teman sebaya yang suportif. Hindari bahasa yang terlalu formal, kaku, atau dingin.
- **Tetap Edukatif & Berorientasi Studi**: Relevan dengan kehidupan sekolah, tugas, motivasi, rutinitas belajar, rasa takut ujian, atau kebingungan masa depan/karier.
- **Solusi Praktis & Actionable**: Ketika siswa mengeluh capek, stres, atau kehilangan motivasi, dengarkan dulu dengan empati ("Iya ya, aku paham banget capeknya..."), lalu berikan saran kecil yang konkret:
  - Mengajak membuat jadwal belajar / pembagian tugas kecil.
  - Menyarankan istirahat sejenak (teknik Pomodoro, minum air).
  - Menyederhanakan tugas besar menjadi langkah-langkah kecil.
  - Membantu menyusun rencana belajar (study plan) taktis untuk ujian.
  - Memberikan kata-kata motivasi belajar yang tulus dan menyemangati.

Contoh Gaya Bahasa:
User: "Aku capek belajar."
Afriza: "Kayaknya lagi capek banget ya 😭. Coba cerita, bagian belajar yang paling bikin berat apa? Kita cari cara biar lebih ringan."`;
    } else {
      systemPrompt += `

Perilaku berdasarkan mode penjelasan:

Mode Formal:
- Gunakan bahasa profesional dan terstruktur.
- Gunakan istilah ilmiah yang tepat.
- Format dengan heading dan poin yang rapi.
- Cocok untuk ujian dan laporan formal.

Mode Santai:
- Gunakan bahasa ramah dan santai.
- Sesekali pakai bahasa sehari-hari.
- Tambahkan analogi sederhana yang mudah dipahami.
- Gunakan emoji secukupnya untuk membuat lebih hidup.

Mode Anak SMK:
- Gunakan bahasa gaul yang natural tapi tetap jelas.
- Beri contoh dari kehidupan nyata dan dunia kerja.
- Buat sesimple mungkin tapi tidak mengorbankan akurasi.
- Bisa pakai istilah populer atau analogi modern.

Mode Super Singkat:
- MAKSIMAL 2-3 kalimat saja.
- Langsung ke inti jawaban.
- Tidak perlu penjelasan panjang.
- Hanya poin paling penting.

Mode saat ini: ${mode || "Santai"}

Ingat: Jawab HANYA pertanyaan yang ditanyakan. Jangan tambah informasi yang tidak relevan.`;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    // Clean and validate conversation history for Gemini (must start with 'user' and alternate)
    const rawHistory = (history as Array<{ role: string; content: string }>) || [];
    const cleanHistory: any[] = [];
    let expectedRole = "user"; // First message in Gemini history must be user

    for (const msg of rawHistory) {
      const mappedRole = msg.role === "ai" ? "model" : "user";
      if (mappedRole === expectedRole) {
        cleanHistory.push({
          role: mappedRole,
          parts: [{ text: msg.content }],
        });
        // Alternate expected role
        expectedRole = expectedRole === "user" ? "model" : "user";
      }
    }

    // Since the next message to be sent is from the user (role: 'user'),
    // the history must end with a model message (role: 'model') to alternate correctly.
    if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === "user") {
      cleanHistory.pop();
    }

    // Keep the last 10 messages from the cleaned history
    const chatHistory = cleanHistory.slice(-10);

    const chat = model.startChat({ history: chatHistory });
    
    // Prepare the message content (could be text string or a mix of text and attachments)
    let messageContent: string | any[] = message;

    if (attachments && attachments.length > 0) {
      const parts: any[] = [];
      
      for (const file of attachments) {
        if (file.base64) {
          const base64Data = file.base64.includes(";base64,")
            ? file.base64.split(";base64,")[1]
            : file.base64;
            
          const supportedDocTypes = [
            "application/pdf",
            "text/plain",
            "text/csv",
            "text/html",
            "application/json",
            "text/markdown"
          ];

          if (file.type.startsWith("image/") || supportedDocTypes.includes(file.type)) {
            parts.push({
              inlineData: {
                data: base64Data,
                mimeType: file.type,
              },
            });
          } else {
            // Include description for non-supported files
            parts.push({
              text: `[User melampirkan file dokumen: ${file.name} (Tipe: ${file.type})]\n`
            });
          }
        } else {
          // Fallback if no base64 is present
          parts.push({
            text: `[User melampirkan file dokumen: ${file.name} (Tipe: ${file.type})]\n`
          });
        }
      }
      
      if (message?.trim()) {
        parts.push({ text: message });
      } else {
        parts.push({ text: "Silakan analisis file atau gambar terlampir dan berikan penjelasan detail." });
      }
      
      messageContent = parts;
    }

    const result = await chat.sendMessage(messageContent);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Gagal mendapatkan respons dari AI. Coba lagi." },
      { status: 500 }
    );
  }
}
