import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Premium Offline Fallback Quiz Database
const FALLBACK_QUIZZES: Record<string, Record<string, any>> = {
  "Pilihan Ganda": {
    "Next.js App Router": [
      {
        id: 1,
        question: "Apa nama folder utama yang digunakan sebagai fondasi sistem routing berbasis file-system pada Next.js App Router?",
        options: ["A. pages", "B. app", "C. routes", "D. src"],
        correctAnswer: "B",
        explanation: "Next.js App Router menggunakan folder 'app' sebagai root directory untuk mendefinisikan rute dan layout, menggantikan folder 'pages' pada Pages Router.",
        concept: "Routing"
      },
      {
        id: 2,
        question: "File apa yang digunakan untuk mendefinisikan antarmuka/UI utama dari sebuah rute di Next.js App Router?",
        options: ["A. layout.tsx", "B. page.tsx", "C. route.ts", "D. template.tsx"],
        correctAnswer: "B",
        explanation: "File 'page.tsx' (atau page.jsx) adalah file wajib yang merepresentasikan halaman unik yang dapat diakses oleh pengguna pada rute tertentu.",
        concept: "Page"
      },
      {
        id: 3,
        question: "Secara default, seluruh komponen yang dibuat di dalam folder 'app' di Next.js bertindak sebagai...",
        options: ["A. Client Component", "B. Server Component", "C. Static Component", "D. Hybrid Component"],
        correctAnswer: "B",
        explanation: "Di Next.js App Router, semua komponen secara default adalah React Server Components (RSC) untuk meminimalkan ukuran berkas JavaScript yang dikirim ke browser.",
        concept: "RSC"
      },
      {
        id: 4,
        question: "Direktif apa yang wajib dituliskan di baris paling atas sebuah file jika komponen tersebut memerlukan React State (useState) atau Effects (useEffect)?",
        options: ['A. "use client"', 'B. "use server"', 'C. "use react"', 'D. "use browser"'],
        correctAnswer: "A",
        explanation: "Direktif 'use client' menandakan batas modul yang memisahkan React Server Component dengan Client Component, memungkinkan penggunaan state dan browser API.",
        concept: "Client Component"
      },
      {
        id: 5,
        question: "Bagaimana cara mendefinisikan dynamic route (parameter rute dinamis) di Next.js App Router?",
        options: [
          "A. Menggunakan nama folder diawali tanda kurung biasa: (id)",
          "B. Menggunakan nama folder diawali tanda kurung siku: [id]",
          "C. Menggunakan nama file diawali tanda dolar: $id.tsx",
          "D. Menggunakan folder bernama [slug] di dalam pages"
        ],
        correctAnswer: "B",
        explanation: "Rute dinamis didefinisikan dengan membungkus nama folder menggunakan kurung siku, misalnya '[id]' atau '[slug]'.",
        concept: "Dynamic Route"
      }
    ],
    "Fotosintesis & Klorofil": [
      {
        id: 1,
        question: "Bagian kloroplas yang menjadi lokasi utama terjadinya Reaksi Terang fotosintesis adalah...",
        options: ["A. Stroma", "B. Tilakoid (Grana)", "C. Membran Luar", "D. Sitoplasma"],
        correctAnswer: "B",
        explanation: "Reaksi terang membutuhkan pigmen penyerap cahaya yang terintegrasi pada membran tilakoid/grana di dalam kloroplas.",
        concept: "Reaksi Terang"
      },
      {
        id: 2,
        question: "Pigmen fotosintetik utama pada tumbuhan yang berfungsi menyerap energi foton matahari adalah...",
        options: ["A. Karotenoid", "B. Klorofil", "C. Fikobilin", "D. Antosianin"],
        correctAnswer: "B",
        explanation: "Klorofil (zat hijau daun) adalah pigmen utama tumbuhan yang secara aktif menyerap spektrum cahaya merah dan biru untuk fotosintesis.",
        concept: "Klorofil"
      },
      {
        id: 3,
        question: "Zat apa yang dihasilkan sebagai produk sampingan (by-product) dari fotolisis air dalam reaksi terang?",
        options: ["A. Glukosa (C6H12O6)", "B. Oksigen (O2)", "C. Karbon Dioksida (CO2)", "D. Air (H2O)"],
        correctAnswer: "B",
        explanation: "Fotolisis air (pemecahan molekul air oleh cahaya) menghasilkan elektron, ion hidrogen, dan gas oksigen yang dilepas ke atmosfer.",
        concept: "Fotolisis"
      },
      {
        id: 4,
        question: "Dimanakah lokasi terjadinya Siklus Calvin (reaksi gelap) di dalam kloroplas?",
        options: ["A. Grana", "B. Stroma", "C. Lumen Tilakoid", "D. Membran Dalam"],
        correctAnswer: "B",
        explanation: "Siklus Calvin yang bertugas mengubah karbon dioksida menjadi gula terjadi di stroma, matriks cair kloroplas.",
        concept: "Siklus Calvin"
      },
      {
        id: 5,
        question: "Apakah peran utama dari molekul NADPH dan ATP yang dihasilkan pada reaksi terang?",
        options: [
          "A. Menyerap cahaya matahari tambahan",
          "B. Menyediakan energi dan elektron untuk mereduksi CO2 dalam Siklus Calvin",
          "C. Memecah molekul air menjadi hidrogen",
          "D. Mengeluarkan gas oksigen melalui stomata"
        ],
        correctAnswer: "B",
        explanation: "ATP dan NADPH adalah pembawa energi kimia dan agen pereduksi yang esensial untuk memfiksasi CO2 menjadi glukosa dalam reaksi gelap.",
        concept: "Siklus Calvin"
      }
    ],
    "Integral Substitusi": [
      {
        id: 1,
        question: "Teknik integral substitusi pada dasarnya merupakan kebalikan dari aturan kalkulus turunan yang bernama...",
        options: ["A. Aturan Hasil Kali", "B. Aturan Rantai (Chain Rule)", "C. Aturan Pembagian", "D. Aturan Penjumlahan"],
        correctAnswer: "B",
        explanation: "Integral substitusi digunakan untuk mengintegralkan fungsi komposisi, yang merupakan kebalikan langsung dari aturan rantai turunan.",
        concept: "Aturan Rantai"
      },
      {
        id: 2,
        question: "Untuk menghitung ∫ 2x (x^2 + 5)^4 dx menggunakan substitusi u = x^2 + 5, maka nilai du adalah...",
        options: ["A. dx", "B. 2x dx", "C. x^2 dx", "D. 5 dx"],
        correctAnswer: "B",
        explanation: "Jika u = x^2 + 5, maka turunan u terhadap x adalah du/dx = 2x, yang berarti du = 2x dx.",
        concept: "Substitusi Aljabar"
      },
      {
        id: 3,
        question: "Berapakah hasil dari ∫ (3x^2 + 2x) dx?",
        options: ["A. x^3 + x^2 + C", "B. 6x + 2 + C", "C. 3x^3 + 2x^2 + C", "D. x^3 + 2x + C"],
        correctAnswer: "A",
        explanation: "Menggunakan aturan dasar integral: ∫ x^n dx = (1/(n+1)) * x^(n+1). Maka ∫ 3x^2 dx = x^3 dan ∫ 2x dx = x^2. Hasil akhirnya x^3 + x^2 + C.",
        concept: "Integral Dasar"
      },
      {
        id: 4,
        question: "Kapan kita sebaiknya memilih metode substitusi dibanding metode parsial dalam penyelesaian integral?",
        options: [
          "A. Ketika salah satu fungsi merupakan turunan (atau kelipatan turunan) dari bagian fungsi lainnya",
          "B. Ketika integral terdiri dari perkalian fungsi trigonometri eksponensial murni",
          "C. Ketika derajat pembilang lebih besar dari penyebut",
          "D. Ketika variabelnya bernilai konstan"
        ],
        correctAnswer: "A",
        explanation: "Substitusi sangat efektif jika integran mengandung bentuk fungsi f(g(x)) yang dikalikan dengan g'(x) atau kelipatannya.",
        concept: "Strategi Integral"
      },
      {
        id: 5,
        question: "Tentukan integral dari ∫ cos(3x) dx.",
        options: ["A. 3 sin(3x) + C", "B. (1/3) sin(3x) + C", "C. -3 sin(3x) + C", "D. -(1/3) sin(3x) + C"],
        correctAnswer: "B",
        explanation: "Misalkan u = 3x, maka du = 3 dx atau dx = (1/3) du. ∫ cos(3x) dx menjadi ∫ (1/3) cos(u) du = (1/3) sin(u) + C = (1/3) sin(3x) + C.",
        concept: "Integral Trigonometri"
      }
    ]
  },
  "Essay": {
    "Next.js App Router": [
      {
        id: 1,
        question: "Jelaskan perbedaan mendasar antara React Server Components (RSC) dan Client Components di Next.js App Router, serta berikan contoh kapan kita harus menggunakan masing-masing komponen tersebut.",
        correctAnswer: "React Server Components (RSC) dirender di server secara default, sehingga kode JavaScript-nya tidak dikirim ke klien, meningkatkan kecepatan loading. RSC digunakan untuk fetching data langsung dari database, membaca file, atau komponen statis. Client Components diaktifkan dengan direktif 'use client' dan digunakan saat membutuhkan interaktivitas browser seperti React state (useState), efek (useEffect), browser API, atau event listeners.",
        explanation: "RSC meningkatkan performa dengan meminimalkan bundle size klien, sementara Client Components melengkapi fungsionalitas interaktif.",
        concept: "RSC vs Client Component"
      },
      {
        id: 2,
        question: "Bagaimana cara kerja file system-based routing di dalam Next.js App Router? Jelaskan peran dari folder, page.tsx, dan layout.tsx dalam menyusun rute aplikasi.",
        correctAnswer: "Sistem routing di App Router menggunakan struktur folder di dalam direktori 'app' sebagai path url. Folder menentukan segmen URL (misal app/blog menghasilkan rute /blog). File 'page.tsx' adalah halaman utama rute tersebut. File 'layout.tsx' membungkus halaman tersebut dan mendefinisikan UI bersama (seperti navbar/sidebar) yang tidak merender ulang saat navigasi.",
        explanation: "Next.js memisahkan segmen rute berdasarkan folder dan komponen UI spesifik berdasarkan konvensi penamaan file.",
        concept: "Sistem Routing"
      }
    ],
    "Fotosintesis & Klorofil": [
      {
        id: 1,
        question: "Jelaskan mekanisme terjadinya reaksi terang pada proses fotosintesis, termasuk lokasi terjadinya dan senyawa apa saja yang dihasilkan pada tahap ini.",
        correctAnswer: "Reaksi terang terjadi di membran tilakoid kloroplas. Mekanismenya dimulai saat pigmen klorofil menyerap cahaya matahari, merangsang fotolisis air (pemecahan H2O) menjadi oksigen (O2), hidrogen (H+), dan elektron. Aliran elektron melalui fotosistem I dan II menghasilkan energi kimia berupa ATP dan NADPH yang siap digunakan dalam Siklus Calvin.",
        explanation: "Reaksi terang mengubah energi cahaya menjadi energi kimia (ATP dan NADPH) serta melepas gas oksigen ke lingkungan.",
        concept: "Reaksi Terang"
      },
      {
        id: 2,
        question: "Siklus Calvin (reaksi gelap) tidak memerlukan cahaya matahari secara langsung. Mengapa reaksi ini tidak dapat berlangsung jika reaksi terang terhenti? Jelaskan hubungannya.",
        correctAnswer: "Meskipun Siklus Calvin tidak memerlukan cahaya matahari secara langsung untuk fiksasi karbon, siklus ini sangat bergantung pada produk-produk reaksi terang yaitu ATP dan NADPH. ATP digunakan sebagai sumber energi dan NADPH digunakan sebagai pembawa elektron untuk mereduksi CO2 menjadi glukosa. Jika reaksi terang terhenti, suplai ATP dan NADPH akan habis, sehingga reaksi gelap juga akan terhenti.",
        explanation: "Fotosintesis adalah rantai reaksi berkelanjutan di mana produk energi dari reaksi terang merupakan reaktan utama untuk sintesis gula pada reaksi gelap.",
        concept: "Siklus Calvin"
      }
    ]
  }
};

// Helper to shuffle options and correctly re-map the correctAnswer letter
function shuffleQuizOptions(options: string[], correctAnswerLetter: string): { options: string[], correctAnswer: string } {
  const letters = ["A", "B", "C", "D"];
  const correctIndex = letters.indexOf(correctAnswerLetter.toUpperCase());
  
  if (correctIndex === -1 || options.length !== 4) return { options, correctAnswer: correctAnswerLetter };

  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const shuffledOptions = indices.map((idx, i) => {
    const cleanText = options[idx].replace(/^[A-D][\.\)]\s*/i, "");
    return `${letters[i]}. ${cleanText}`;
  });

  const newCorrectIndex = indices.indexOf(correctIndex);
  const newCorrectAnswer = letters[newCorrectIndex];

  return {
    options: shuffledOptions,
    correctAnswer: newCorrectAnswer
  };
}

// Generic Quiz Generator for unsupported topics
function generateGenericQuiz(topic: string, quizType: "Pilihan Ganda" | "Essay", count: number, difficulty: string) {
  const isEssay = quizType === "Essay";
  const questions = [];

  for (let i = 1; i <= count; i++) {
    const index = (i - 1) % 5;
    if (isEssay) {
      if (index === 0) {
        questions.push({
          id: i,
          question: `Jelaskan secara mendalam definisi, prinsip dasar, dan latar belakang diciptakannya konsep "${topic}". Apa tujuan utama penggunaan konsep ini?`,
          correctAnswer: `Definisi utama dari ${topic} berpusat pada optimalisasi efisiensi dan pembentukan struktur dasar yang andal. Tujuan utamanya adalah untuk mempermudah pengerjaan alur kerja, meningkatkan standarisasi, dan menyelesaikan hambatan pemrosesan konseptual secara terarah.`,
          explanation: `Pertanyaan ini menguji pemahaman definisi dasar dan visi strategis di balik penggunaan konsep ${topic}.`,
          concept: `Definisi ${topic}`
        });
      } else if (index === 1) {
        questions.push({
          id: i,
          question: `Berikan satu contoh skenario nyata atau studi kasus di mana penerapan "${topic}" dinilai sangat krusial. Bagaimana langkah awal Anda dalam mengimplementasikannya?`,
          correctAnswer: `Dalam skenario industri nyata, ${topic} diaktifkan untuk mengatasi tantangan performa skala besar dan struktur yang tidak konsisten. Langkah awal untuk mengimplementasikannya adalah dengan mempersiapkan infrastruktur dasar, mendefinisikan modul atau variabel inti, serta melakukan uji validasi fungsional awal secara menyeluruh.`,
          explanation: `Pertanyaan ini menguji kemampuan analitis siswa dalam memetakan kegunaan praktis dan metode peluncuran ${topic} dalam ekosistem kerja asli.`,
          concept: `Aplikasi ${topic}`
        });
      } else if (index === 2) {
        questions.push({
          id: i,
          question: `Bandingkan kelebihan dan kekurangan dari penerapan "${topic}" terhadap metode alternatif tradisional lainnya. Mengapa ${topic} lebih disukai saat ini?`,
          correctAnswer: `Kelebihan utama dari ${topic} meliputi skalabilitas tinggi, pemeliharaan kode yang efisien, dan eksekusi otomatis. Kekurangannya adalah kurva pembelajaran awal yang curam dan perlunya penyesuaian dependensi. Dibandingkan metode tradisional, ia jauh lebih disukai karena menghasilkan efisiensi waktu jangka panjang dan meminimalisir kesalahan manual.`,
          explanation: `Pertanyaan ini bertujuan melatih berpikir kritis siswa dalam membandingkan keandalan ${topic} terhadap teknologi konvensional.`,
          concept: `Komparasi ${topic}`
        });
      } else if (index === 3) {
        questions.push({
          id: i,
          question: `Sebutkan dan jabarkan minimal dua kesalahan umum atau hambatan teknis yang kerap terjadi saat pemula berupaya mengintegrasikan "${topic}". Bagaimana cara menyelesaikannya?`,
          correctAnswer: `Kesalahan pertama adalah melompati pemahaman fondasi mendasar demi langsung menulis konfigurasi kompleks, diselesaikan dengan mengikuti tutorial runut. Kesalahan kedua adalah mengabaikan manajemen dependensi pendukung, diselesaikan dengan menggunakan package manager versi terbaru dan merujuk pada dokumentasi resmi.`,
          explanation: `Pertanyaan ini mengevaluasi pemahaman taktis siswa mengenai tantangan integrasi ${topic} serta solusi penyelesaiannya.`,
          concept: `Pemecahan Masalah`
        });
      } else {
        questions.push({
          id: i,
          question: `Bagaimana analisis Anda mengenai proyeksi perkembangan konsep "${topic}" ini dalam 5 hingga 10 tahun mendatang? Apa tantangan utama adaptasinya?`,
          correctAnswer: `Dalam beberapa tahun ke depan, ${topic} diproyeksikan akan semakin terintegrasi dengan teknologi AI dan cloud-native. Tantangan utamanya adalah standarisasi lintas platform dan adaptasi skill pengembang agar tetap relevan. Namun, adopsi masif akan terus berlangsung seiring kebutuhan efisiensi digital yang meningkat.`,
          explanation: `Pertanyaan HOTS ini mengukur pandangan futuristik dan pemahaman holistik siswa mengenai tren industri seputar ${topic}.`,
          concept: `Tren Masa Depan`
        });
      }
    } else {
      // Pilihan Ganda (Multiple Choice)
      if (index === 0) {
        const shuffled = shuffleQuizOptions([
          `A. Kerangka kerja terstruktur untuk mengoptimalkan efisiensi dan hasil akhir secara konsisten.`,
          `B. Sebuah metode usang yang hanya dijalankan secara manual tanpa standarisasi.`,
          `C. Alat pelengkap sementara yang tidak mempengaruhi performa ekosistem secara umum.`,
          `D. Skema acak yang berjalan tanpa memerlukan validasi parameter.`
        ], "A");
        questions.push({
          id: i,
          question: `Manakah dari pernyataan berikut yang mendefinisikan konsep dasar dari "${topic}" secara paling tepat?`,
          options: shuffled.options,
          correctAnswer: shuffled.correctAnswer,
          explanation: `Konsep dasar dari ${topic} berfokus pada efisiensi tinggi, otomatisasi terarah, dan hasil keluaran yang konsisten.`,
          concept: `Definisi ${topic}`
        });
      } else if (index === 1) {
        const shuffled = shuffleQuizOptions([
          `A. Saat sistem mengalami hambatan performa, membutuhkan standarisasi kode, dan perlu diskalakan.`,
          `B. Hanya ketika kita ingin memperlambat waktu eksekusi program demi tujuan tertentu.`,
          `C. Ketika tidak ada library modern lain yang mendukung pengerjaan proyek tersebut.`,
          `D. Saat ingin membuang ruang penyimpanan memori secara tidak terstruktur.`
        ], "A");
        questions.push({
          id: i,
          question: `Dalam kondisi manakah kita paling direkomendasikan untuk menerapkan prinsip "${topic}"?`,
          options: shuffled.options,
          correctAnswer: shuffled.correctAnswer,
          explanation: `Penerapan ${topic} sangat krusial ketika pengembang dihadapkan pada masalah performa, ketidakkonsistenan data, serta kebutuhan untuk scaling.`,
          concept: `Aplikasi ${topic}`
        });
      } else if (index === 2) {
        const shuffled = shuffleQuizOptions([
          `A. Waktu pemeliharaan kode menjadi lebih singkat, performa meningkat, dan alur kerja lebih rapi.`,
          `B. Biaya server melambung tinggi tanpa peningkatan fungsionalitas yang berarti.`,
          `C. Terbebas dari keharusan merancang struktur aplikasi yang disiplin.`,
          `D. Kode program menjadi sangat panjang dan sulit untuk didebug oleh tim lain.`
        ], "A");
        questions.push({
          id: i,
          question: `Apa keuntungan utama yang dirasakan oleh pengembang setelah beralih menggunakan "${topic}"?`,
          options: shuffled.options,
          correctAnswer: shuffled.correctAnswer,
          explanation: `Penggunaan ${topic} menyederhanakan pemeliharaan kode (maintenance) sekaligus meningkatkan skalabilitas dan kerapian alur kerja developer.`,
          concept: `Manfaat ${topic}`
        });
      } else if (index === 3) {
        const shuffled = shuffleQuizOptions([
          `A. Langsung menerapkan kasus tingkat lanjut tanpa menguasai fondasi dasar secara kokoh.`,
          `B. Mengikuti dokumentasi standar resmi yang disediakan oleh para kontributor utama.`,
          `C. Menuliskan komentar deskriptif untuk memperjelas fungsi-fungsi yang rumit.`,
          `D. Melakukan pembagian modul secara teratur berdasarkan kategori fungsinya.`
        ], "A");
        questions.push({
          id: i,
          question: `Kesalahan fatal manakah yang paling sering ditemui saat pertama kali mengonfigurasi "${topic}"?`,
          options: shuffled.options,
          correctAnswer: shuffled.correctAnswer,
          explanation: `Pemula sering mengalami kegagalan konfigurasi ${topic} karena melompati konsep esensial dan terburu-buru meluncurkan fitur kompleks.`,
          concept: `Analisis Hambatan`
        });
      } else {
        const shuffled = shuffleQuizOptions([
          `A. Modul inti pusat yang mengontrol logika operasional dan mengatur aliran data penting.`,
          `B. Kumpulan berkas sementara yang dapat dihapus kapan saja tanpa merusak sistem.`,
          `C. Modul pihak ketiga yang sudah usang dan tidak didukung lagi pengembangannya.`,
          `D. Baris komentar kosong yang tidak mengeksekusi perintah apa pun dalam aplikasi.`
        ], "A");
        questions.push({
          id: i,
          question: `Komponen manakah yang bertindak sebagai motor penggerak atau pilar utama dalam arsitektur "${topic}"?`,
          options: shuffled.options,
          correctAnswer: shuffled.correctAnswer,
          explanation: `Komponen utama pada ${topic} bertugas sebagai jembatan logika operasional dan pengarah aliran data utama agar berjalan mulus.`,
          concept: `Arsitektur ${topic}`
        });
      }
    }
  }

  return {
    topic,
    quizType,
    difficulty,
    questions,
    isFallback: true
  };
}

export async function POST(req: NextRequest) {
  try {
    const { topic, difficulty, count, quizType } = await req.json();

    if (!topic || !difficulty || !count || !quizType) {
      return NextResponse.json(
        { error: "Semua parameter (topic, difficulty, count, quizType) harus diisi" },
        { status: 400 }
      );
    }

    try {
      // 1. Attempt Gemini Generation
      const systemPrompt = `You are Ngerti.in AI.
Generate educational quizzes for Indonesian students.

Rules:
- Stay relevant to topic.
- Match selected difficulty.
- Match selected question count.
- Questions must be educational.
- Include answer key.
- Use Indonesian language.

Quiz type:
${quizType}

Topic:
${topic}

Difficulty:
${difficulty}

Question count:
${count}

Your output MUST be a valid JSON object matching the following structure. Return ONLY raw JSON without markdown wrapping.

JSON Schema:
{
  "topic": "${topic}",
  "quizType": "${quizType}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "Pertanyaan...",
      "options": ["A. Pilihan...", "B. Pilihan...", "C. Pilihan...", "D. Pilihan..."], // Omit or leave empty for Essay
      "correctAnswer": "A", // For Multiple Choice: one letter A, B, C, D. For Essay: model answer
      "explanation": "Penjelasan...",
      "concept": "Tag subtopik (misal: 'RSC', 'Siklus Calvin')"
    }
  ]
}`;

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      });

      const responseText = result.response.text();
      const quizData = JSON.parse(responseText);
      return NextResponse.json({ ...quizData, isFallback: false });

    } catch (apiError: any) {
      console.warn("Gemini API Rate Limit/Error, falling back to Local Database:", apiError.message);
      
      // 2. Fallback to Local Quiz
      // Search database for key topics (case-insensitive fuzzy match)
      let matchedQuiz = null;
      const db = FALLBACK_QUIZZES[quizType] || {};
      const searchTopic = Object.keys(db).find(
        (key) => topic.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(topic.toLowerCase())
      );

      if (searchTopic) {
        const baseQuestions = db[searchTopic];
        const questions = baseQuestions.slice(0, count).map((q: any, index: number) => {
          if (quizType === "Pilihan Ganda" && q.options) {
            const shuffled = shuffleQuizOptions(q.options, q.correctAnswer);
            return {
              ...q,
              id: index + 1,
              options: shuffled.options,
              correctAnswer: shuffled.correctAnswer
            };
          }
          return {
            ...q,
            id: index + 1
          };
        });

        matchedQuiz = {
          topic: searchTopic,
          quizType,
          difficulty,
          questions,
          isFallback: true
        };
      } else {
        // Generate a fully dynamic mock quiz matching the parameters
        matchedQuiz = generateGenericQuiz(topic, quizType, count, difficulty);
      }

      return NextResponse.json(matchedQuiz);
    }
  } catch (error) {
    console.error("Critical Quiz API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server kuis." },
      { status: 500 }
    );
  }
}
