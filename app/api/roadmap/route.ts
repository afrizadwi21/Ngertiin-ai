import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { goal, level, duration } = await req.json();

    if (!goal?.trim() || !level || !duration) {
      return NextResponse.json({ error: "Goal, level, and duration are required" }, { status: 400 });
    }

    // Determine roadmap size and detail dynamically based on target duration
    // Optimized step counts to keep generation extremely fast (10-15s max) while retaining high-fidelity details
    let minSteps = 4;
    let maxSteps = 5;
    let detailInstructions = "Penyusunan langkah-langkah yang padat dan langsung fokus pada materi esensial.";

    if (duration.includes("3 Bulan")) {
      minSteps = 6;
      maxSteps = 7;
      detailInstructions = "Sajikan langkah pembelajaran (modul) yang sangat komprehensif dan mendalam. Setiap modul mewakili ~2 minggu belajar. Pada setiap langkah, jabarkan minimal 3 konsep penting yang harus dipelajari/dikerjakan dan hal krusial yang wajib dihafalkan di luar kepala.";
    } else if (duration.includes("6 Bulan")) {
      minSteps = 8;
      maxSteps = 9;
      detailInstructions = "Pecah materi menjadi modul utama yang sangat spesifik dan mendalam. Setiap modul mewakili ~3 minggu belajar. Setiap langkah HARUS sangat detail, mencantumkan advanced concepts, best practices di industri, optimasi, daftar istilah/konsep penting yang WAJIB dihafalkan, dan latihan praktik nyata yang harus dikerjakan.";
    } else if (duration.includes("1 Tahun")) {
      minSteps = 10;
      maxSteps = 12;
      detailInstructions = "Buat kurikulum terlengkap (Masterclass) dari dasar hingga tingkat pakar. Setiap modul mewakili ~1 bulan belajar. Setiap langkah WAJIB menyertakan penjelasan detail yang mencakup: teori mendalam, daftar sintaks/formula/konsep yang HARUS dihafalkan secara kuat, daftar proyek mini/tugas yang HARUS dikerjakan secara langsung, arsitektur sistem skala besar, DevOps, CI/CD pipelines, optimalisasi database, design patterns, serta proyek akhir tingkat tinggi.";
    }

    const systemPrompt = `You are Afriza AI, a highly professional Indonesian AI learning planner.
Generate a structured learning roadmap for Indonesian students.

Rules:
- Match user's goal: "${goal}".
- Match skill level STRICTLY: "${level}". If the user's level is "Menengah" or "Mahir", SKIP all basic/fundamental steps (like "Dasar-dasar", "Pengenalan"). Start directly with intermediate or advanced concepts matching their level!
- Match duration STRICTLY: "${duration}". 
- DURATION SCALING RULE: Karena durasi belajar adalah "${duration}", batasi jumlah modul utama menjadi ${minSteps} sampai ${maxSteps} langkah saja agar fokus belajar terarah. Namun, isi penjelasan dari setiap modul tersebut HARUS sangat detail, padat, mendalam, mencakup subtopik spesifik, hal-hal krusial yang harus dihafalkan/dipahami di luar kepala, serta tugas praktik yang harus dikerjakan!
- Gunakan bahasa Indonesia yang interaktif, komunikatif, premium, dan memotivasi.`;

    const jsonPrompt = `
Generate the roadmap as a JSON array of learning steps.
Return ONLY a valid JSON array, with no other text, and no markdown formatting (do not wrap in \`\`\`json).

Each step object in the array must have the following structure:
{
  "title": "Nama langkah pembelajaran",
  "explanation": "Penjelasan mendalam dan terstruktur mengenai materi spesifik yang dipelajari di langkah ini. Gunakan format poin-poin padat agar mudah dibaca: 1) Subtopik/Materi kunci, 2) Apa saja yang harus dikerjakan (Tugas Praktik/Proyek), dan 3) Konsep/Formula/Sintaks yang HARUS dihafalkan secara matang.",
  "duration": "Estimasi durasi belajar untuk modul ini, misal: '1 Minggu', '2 Minggu', '1 Bulan'",
  "difficulty": "Tingkat kesulitan untuk langkah ini ('Pemula' | 'Menengah' | 'Mahir')"
}

Instruction Details:
- ${detailInstructions}
- Provide between ${minSteps} to ${maxSteps} logical, highly detailed steps that span across the target duration of ${duration}. Make each step highly descriptive and clear for the student.`;

    let steps = [];

    // Attempt to fetch from Gemini API
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent([systemPrompt, jsonPrompt]);
        const responseText = result.response.text().trim();

        // Strip out code block ticks if present
        let cleanText = responseText;
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }

        steps = JSON.parse(cleanText);
      } catch (geminiError) {
        console.warn("Gemini API error, falling back to local roadmap generator:", geminiError);
        steps = generateLocalRoadmap(goal, level, duration);
      }
    } else {
      steps = generateLocalRoadmap(goal, level, duration);
    }

    // Verify steps structure
    if (!Array.isArray(steps) || steps.length === 0) {
      steps = generateLocalRoadmap(goal, level, duration);
    }

    return NextResponse.json({
      goal,
      level,
      duration,
      steps,
    });
  } catch (error: any) {
    console.error("Roadmap API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate roadmap" }, { status: 500 });
  }
}

// Robust offline/fallback generator for flawless UX
function generateLocalRoadmap(goal: string, level: string, duration: string) {
  const goalLower = goal.toLowerCase();
  const lvl = level.toLowerCase();
  
  // Calculate steps count based on duration
  let stepsToTake = 5;
  if (duration.includes("3 Bulan")) stepsToTake = 7;
  else if (duration.includes("6 Bulan")) stepsToTake = 9;
  else if (duration.includes("1 Tahun")) stepsToTake = 12;

  let baseSteps: any[] = [];
  
  if (goalLower.includes("front") || goalLower.includes("web") || goalLower.includes("html")) {
    baseSteps = [
      { title: "HTML5 Dasar & Semantik", explanation: "Materi Kunci: Struktur halaman web semantik, tag-tag baru HTML5. Tugas Praktik: Membuat kerangka blog responsif. Wajib Dihafalkan: Tag semantik utama (header, nav, article, section, footer).", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "CSS3 Basics & Box Model", explanation: "Materi Kunci: Box Model (Margin, Border, Padding, Width/Height), Display Property (Block, Inline, Inline-block). Tugas Praktik: Mendesain kartu profil sederhana. Wajib Dihafalkan: Prioritas selektor CSS (Specificity) dan Box Model.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "CSS3 Flexbox Layouting", explanation: "Materi Kunci: Flex container properties (flex-direction, justify-content, align-items). Tugas Praktik: Membangun sistem navigasi (navbar) responsif. Wajib Dihafalkan: Arah sumbu utama (main axis) vs silang (cross axis) di Flexbox.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "CSS3 Grid System", explanation: "Materi Kunci: Grid template columns & rows, grid gap, grid areas. Tugas Praktik: Membuat galeri foto bergaya grid majalah. Wajib Dihafalkan: Perbedaan mendasar Flexbox (1-dimensi) vs Grid (2-dimensi).", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "Responsive Web Design & Media Queries", explanation: "Materi Kunci: Viewport meta tag, Mobile-first approach, media queries. Tugas Praktik: Membuat landing page portofolio yang nyaman dibuka di smartphone & desktop. Wajib Dihafalkan: Breakpoint standar CSS responsif.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "JavaScript Dasar: Variabel & Tipe Data", explanation: "Materi Kunci: Variabel (var, let, const), tipe data (string, number, boolean, array, object). Tugas Praktik: Membuat kalkulator pertambahan sederhana di console. Wajib Dihafalkan: Perbedaan mutlak antara let dan const.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "JavaScript Logika: Percabangan & Perulangan", explanation: "Materi Kunci: if-else, switch-case, for-loop, while-loop. Tugas Praktik: Membuat program tebak angka dengan loop interaktif. Wajib Dihafalkan: Kondisi logika (&&, ||, !).", duration: "1-2 Minggu", difficulty: "Pemula" },
      { title: "JavaScript Fungsi & Lingkup Variabel", explanation: "Materi Kunci: Deklarasi fungsi, arrow functions, lexical scope, closures. Tugas Praktik: Membuat program konversi suhu dengan fungsi reusable. Wajib Dihafalkan: Sintaks arrow functions modern.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "JavaScript DOM Selection & Manipulation", explanation: "Materi Kunci: querySelector, querySelectorAll, getElementById, innerHTML, textContent. Tugas Praktik: Membuat aplikasi to-do list interaktif yang bisa menambah item. Wajib Dihafalkan: Metode pemilihan elemen DOM.", duration: "1-2 Minggu", difficulty: "Menengah" },
      { title: "JavaScript Event Handling", explanation: "Materi Kunci: addEventListener, event object, preventDefault, bubbling & capturing. Tugas Praktik: Membuat modal pop-up interaktif yang menutup saat diklik di luar modal. Wajib Dihafalkan: Jenis-jenis event utama (click, submit, keydown).", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "Git & GitHub Version Control", explanation: "Materi Kunci: git init, git add, git commit, git push, branching, dan merging. Tugas Praktik: Mengunggah kode to-do list ke repositori GitHub pribadi. Wajib Dihafalkan: Alur kerja Git (Workspace -> Staging Area -> Local Repo -> Remote Repo).", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "Tailwind CSS Framework", explanation: "Materi Kunci: Utility-first classes, layouting responsif dengan awalan md:, lg:, konfigurasi tailwind.config.js. Tugas Praktik: Mendesain ulang halaman login estetik menggunakan Tailwind. Wajib Dihafalkan: Konsep kelas dasar flex, grid, spacing, dan color.", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "JavaScript ES6+ Modern Features", explanation: "Materi Kunci: Destructuring, template literals, spread/rest operator, map, filter, reduce. Tugas Praktik: Memanipulasi array objek mahasiswa untuk memfilter nilai di atas KKM. Wajib Dihafalkan: Cara kerja map & filter array.", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "Asynchronous JS & Fetch API", explanation: "Materi Kunci: Callbacks, Promises, Async/Await, dan fetch. Tugas Praktik: Mengambil data cuaca dari API publik dan menampilkannya di halaman web. Wajib Dihafalkan: Sintaks dasar async/await dan penanganan error try-catch.", duration: "1-2 Minggu", difficulty: "Menengah" },
      { title: "React.js: Pengenalan & Komponen", explanation: "Materi Kunci: JSX, Functional Components, JSX vs HTML biasa. Tugas Praktik: Membuat halaman portofolio statis dengan memecahnya menjadi komponen-komponen kecil. Wajib Dihafalkan: Aturan penulisan JSX.", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "React.js: State & Props Management", explanation: "Materi Kunci: State (useState Hook), melewatkan data via Props, searah data flow. Tugas Praktik: Membuat kalkulator interaktif yang menyimpan input pengguna di state. Wajib Dihafalkan: Aturan imutabilitas state di React.", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "React.js: Lifecycle & Hooks (useEffect)", explanation: "Materi Kunci: useEffect, dependency array, fetching data di dalam React. Tugas Praktik: Mengambil data pengguna dari API ketika halaman dimuat dan menampilkan daftar profil. Wajib Dihafalkan: Arti dependency array kosong [] di useEffect.", duration: "1-2 Minggu", difficulty: "Menengah" },
      { title: "State Management: Zustand / Redux", explanation: "Materi Kunci: Global State, store creation, actions, selectors. Tugas Praktik: Membuat keranjang belanja dengan global state yang sinkron di beberapa halaman. Wajib Dihafalkan: Kapan harus menggunakan local state vs global state.", duration: "1-2 Minggu", difficulty: "Mahir" },
      { title: "Next.js: App Router & Rendering", explanation: "Materi Kunci: Server Components vs Client Components, routing statis & dinamis, SEO metadata. Tugas Praktik: Membuat blog pribadi dengan Next.js App Router dan data statis. Wajib Dihafalkan: Perbedaan SSR (Server-Side Rendering) vs CSR (Client-Side Rendering).", duration: "2 Minggu", difficulty: "Mahir" },
      { title: "Next.js: Server Actions & API", explanation: "Materi Kunci: Server Actions, data fetching langsung dari database, route handlers. Tugas Praktik: Membuat form kontak yang menyimpan pesan langsung ke server. Wajib Dihafalkan: Keunggulan Server Actions untuk form submission.", duration: "1-2 Minggu", difficulty: "Mahir" },
      { title: "Autentikasi & Authorization (Supabase Auth)", explanation: "Materi Kunci: OAuth login, email/password login, Session management, route protection. Tugas Praktik: Membuat halaman dashboard admin yang hanya bisa diakses setelah login. Wajib Dihafalkan: Konsep JWT token dan cara kerja RLS.", duration: "2 Minggu", difficulty: "Mahir" },
      { title: "Optimasi Performa Web", explanation: "Materi Kunci: Lazy loading, dynamic import, optimasi gambar (next/image), Lighthouse audits. Tugas Praktik: Mengoptimasi website Next.js lambat hingga mencapai skor Lighthouse di atas 90. Wajib Dihafalkan: Metrik Core Web Vitals (LCP, FID, CLS).", duration: "1 Minggu", difficulty: "Mahir" },
      { title: "Deployment & CI/CD Pipelines", explanation: "Materi Kunci: Deploy ke Vercel, setup environment variables aman, GitHub Actions CI/CD. Tugas Praktik: Menghubungkan repositori GitHub dengan Vercel untuk deployment otomatis setiap kali ada push. Wajib Dihafalkan: Alur otomatisasi CI/CD.", duration: "1 Minggu", difficulty: "Mahir" },
      { title: "Proyek Akhir Masterclass", explanation: "Materi Kunci: Integrasi semua modul, arsitektur kokoh, database relasional, antarmuka premium, transisi animasi halus. Tugas Praktik: Membangun platform pembelajaran online lengkap dengan autentikasi, database, progres belajar, dan pembayaran simulasi. Wajib Dihafalkan: Struktur folder arsitektur bersih skala besar.", duration: "3-4 Minggu", difficulty: "Mahir" }
    ];
  } else if (goalLower.includes("ui") || goalLower.includes("ux") || goalLower.includes("design")) {
    baseSteps = [
      { title: "Pengenalan UI/UX & Design Thinking", explanation: "Materi Kunci: Pengenalan industri kreatif, perbedaan UI vs UX, 5 tahap Design Thinking (Empathize, Define, Ideate, Prototype, Test). Tugas Praktik: Menganalisis masalah aplikasi yang sering crash/sulit digunakan. Wajib Dihafalkan: 5 tahap Design Thinking.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "User Research & Empathy Map", explanation: "Materi Kunci: Kuantitatif vs Kualitatif riset, wawancara pengguna, survei. Tugas Praktik: Membuat Empathy Map berdasarkan wawancara pengguna. Wajib Dihafalkan: Perbedaan riset primer vs sekunder.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "User Persona & Journey Map", explanation: "Materi Kunci: Perancangan profil target pengguna (Persona), memetakan pengalaman pengguna dari awal hingga akhir (Journey Map). Tugas Praktik: Membuat dokumen User Persona lengkap. Wajib Dihafalkan: Poin-poin penting dalam User Persona (Pain points, Goals).", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "Information Architecture (IA) & Sitemap", explanation: "Materi Kunci: Struktur navigasi aplikasi, penyusunan menu, taksonomi informasi. Tugas Praktik: Mendesain sitemap untuk aplikasi e-commerce. Wajib Dihafalkan: Konsep kedalaman navigasi (Rule of 3 Clicks).", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "Wireframing Dasar (Low-Fidelity)", explanation: "Materi Kunci: Sketsa kertas, wireframe digital kasar, tata letak konten. Tugas Praktik: Menggambar sketsa tata letak aplikasi pesan makanan di kertas. Wajib Dihafalkan: Tujuan utama wireframing (fokus pada fungsi, bukan visual).", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "Dasar Figma: Workspace & Tools", explanation: "Materi Kunci: Pemilihan frame, shape tools, pen tool, masking, pengaturan layer di Figma. Tugas Praktik: Membuat ikons kustom sederhana di Figma. Wajib Dihafalkan: Shortcuts navigasi dasar Figma.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "Figma Auto Layout & Responsive", explanation: "Materi Kunci: Auto Layout (arah horizontal/vertical, spacing, padding), resizing properties (Hug, Fill, Fixed). Tugas Praktik: Mendesain tombol dan kartu informasi yang responsif saat ukurannya diubah. Wajib Dihafalkan: Aturan resizing Auto Layout.", duration: "1-2 Minggu", difficulty: "Menengah" },
      { title: "Figma Components & Variants", explanation: "Materi Kunci: Pembuatan komponen utama, override instansi, pembuatan varian komponen (state default, hover, active). Tugas Praktik: Membuat satu set pustaka input form & tombol lengkap. Wajib Dihafalkan: Cara kerja nested components di Figma.", duration: "1-2 Minggu", difficulty: "Menengah" },
      { title: "Prinsip Desain Visual: Kontras & Hirarki", explanation: "Materi Kunci: Skala prioritas visual, penyelarasan (alignment), kedekatan (proximity), whitespace. Tugas Praktik: Menata ulang desain poster buruk menjadi rapi & terstruktur. Wajib Dihafalkan: 4 prinsip Gestalt dalam UI design.", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "Pemilihan Warna & Psikologi Desain", explanation: "Materi Kunci: Roda warna, skema warna (monokromatik, komplementer), kontras rasio aksesibilitas (WCAG). Tugas Praktik: Membuat palet warna premium untuk aplikasi fintech. Wajib Dihafalkan: Aturan distribusi warna 60-30-10.", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "Tipografi & Grid System", explanation: "Materi Kunci: Pemilihan font family (serif vs sans-serif), line height, letter spacing, sistem grid 8pt/4pt. Tugas Praktik: Membuat sistem grid 4 kolom untuk mobile. Wajib Dihafalkan: Mengapa kelipatan 8px sangat penting dalam UI design.", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "High-Fidelity UI Design", explanation: "Materi Kunci: Penerapan warna, tipografi, grid, gambar, dan aset grafis berkualitas tinggi pada wireframe digital. Tugas Praktik: Mendesain 3 halaman utama aplikasi ojek online dengan detail pixel-perfect. Wajib Dihafalkan: Perbedaan visual wireframe vs Hi-Fi.", duration: "2 Minggu", difficulty: "Menengah" },
      { title: "Prototyping Dasar: Transisi Halaman", explanation: "Materi Kunci: Interaksi antar halaman, pemilihan trigger (On click, On drag), jenis transisi (Dissolve, Slide in). Tugas Praktik: Menghubungkan halaman login hingga ke beranda. Wajib Dihafalkan: Alur dasar navigasi prototipe.", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "Advanced Prototyping & Smart Animate", explanation: "Materi Kunci: Smart Animate Figma, micro-interactions, interaksi state tombol, navigasi samping meluncur. Tugas Praktik: Mendesain animasi loading spinner dan scroll efek dinamis. Wajib Dihafalkan: Aturan penamaan layer yang sama agar Smart Animate bekerja.", duration: "1-2 Minggu", difficulty: "Menengah" },
      { title: "Usability Testing & Feedback", explanation: "Materi Kunci: Skenario pengujian pengguna, metrik kesuksesan tugas, System Usability Scale (SUS). Tugas Praktik: Menguji prototipe buatan Anda pada 3 orang target pengguna. Wajib Dihafalkan: Etika dasar memandu sesi Usability Testing.", duration: "2 Minggu", difficulty: "Mahir" },
      { title: "Design System: Membuat Library", explanation: "Materi Kunci: Dokumentasi token desain (warna, font, spacing), komponen terstandar untuk tim. Tugas Praktik: Menyusun mini design system di file Figma terpisah. Wajib Dihafalkan: Manfaat utama design system untuk konsistensi.", duration: "2 Minggu", difficulty: "Mahir" },
      { title: "Kolaborasi Tim: Developer Handoff", explanation: "Materi Kunci: Ekspor aset (SVG, PNG), inspeksi kode CSS di Figma Dev Mode, dokumentasi interaksi. Tugas Praktik: Menyiapkan file handoff lengkap dengan spesifikasi ukuran bagi developer. Wajib Dihafalkan: Format ekspor aset optimal untuk web vs mobile.", duration: "1 Minggu", difficulty: "Mahir" },
      { title: "UI/UX Mobile Guidelines (iOS & Android)", explanation: "Materi Kunci: Perbandingan Apple Human Interface Guidelines (HIG) vs Google Material Design. Tugas Praktik: Menyesuaikan satu desain aplikasi agar sesuai dengan standar iOS. Wajib Dihafalkan: Perbedaan tombol navigasi bawah iOS vs Android.", duration: "2 Minggu", difficulty: "Mahir" },
      { title: "Studi Kasus Portofolio Tertulis", explanation: "Materi Kunci: Kerangka penulisan studi kasus UX (Latar belakang, Masalah, Proses Solusi, Hasil Riset, Kesimpulan). Tugas Praktik: Menulis satu studi kasus lengkap di Notion/Medium. Wajib Dihafalkan: Pentingnya menjelaskan proses di balik keputusan desain daripada sekadar memamerkan visual akhir.", duration: "2 Minggu", difficulty: "Mahir" },
      { title: "Proyek Akhir Masterclass UI/UX", explanation: "Materi Kunci: Menjalankan seluruh proses dari riset, kuesioner, persona, wireframe, Hi-Fi, prototipe canggih, hingga usability testing. Tugas Praktik: Membuat solusi desain inovatif untuk masalah lingkungan atau kesehatan dengan 10+ halaman teruji. Wajib Dihafalkan: Struktur presentasi portofolio di depan pewawancara.", duration: "3-4 Minggu", difficulty: "Mahir" }
    ];
  } else if (goalLower.includes("laravel") || goalLower.includes("php") || goalLower.includes("back")) {
    baseSteps = [
      { title: "Dasar Sintaks PHP & Variabel", explanation: "Materi Kunci: Tag PHP, variabel, konstanta, tipe data (String, Integer, Float, Boolean). Tugas Praktik: Membuat skrip PHP untuk menghitung keliling lingkaran. Wajib Dihafalkan: Aturan penulisan sintaks PHP dan echo.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "PHP Logika & Percabangan", explanation: "Materi Kunci: Operator perbandingan, if-else, switch-case, operator logika. Tugas Praktik: Membuat sistem penentu kelulusan nilai sekolah. Wajib Dihafalkan: Perbedaan operator == vs ===.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "PHP Array & Loops", explanation: "Materi Kunci: Indexed array, associative array, multidimensional array, foreach loop, for loop. Tugas Praktik: Menampilkan daftar produk beserta harga dari array multidimensi menggunakan loop. Wajib Dihafalkan: Cara mengakses key dan value pada associative array.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "PHP Functions & Scope", explanation: "Materi Kunci: Deklarasi function, parameter, return value, default parameter, global vs local scope. Tugas Praktik: Membuat kalkulator mini dinamis berbasis fungsi. Wajib Dihafalkan: Konsep pengembalian data menggunakan keyword return.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "PHP Object-Oriented Programming (OOP) Dasar", explanation: "Materi Kunci: Class, Object, Properties, Methods, Constructor, Destructor. Tugas Praktik: Membuat class 'Kendaraan' dengan properties kecepatan dan method melaju. Wajib Dihafalkan: Cara instansiasi objek dari sebuah class menggunakan keyword new.", duration: "1-2 Minggu", difficulty: "Pemula" },
      { title: "OOP Lanjutan: Inheritance & Access Modifiers", explanation: "Materi Kunci: Pewarisan class (extends), access modifiers (public, protected, private), encapsulation. Tugas Praktik: Membuat class anak 'Mobil' yang mewarisi class 'Kendaraan' dengan akses protected. Wajib Dihafalkan: Perbedaan mutlak public, protected, dan private.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "OOP Lanjutan: Interfaces, Abstract Classes & Traits", explanation: "Materi Kunci: Penggunaan interface, keyword implements, abstract class, abstract method, traits untuk code reuse. Tugas Praktik: Membuat sistem pembayaran dengan interface 'PaymentMethod' untuk BankTransfer dan EWallet. Wajib Dihafalkan: Perbedaan mendasar interface vs abstract class.", duration: "1-2 Minggu", difficulty: "Pemula" },
      { title: "Basis Data Relasional & SQL Dasar", explanation: "Materi Kunci: Konsep RDBMS, relasi tabel (One to One, One to Many, Many to Many), SQL Syntax (SELECT, INSERT, UPDATE, DELETE). Tugas Praktik: Merancang database database perpustakaan di phpMyAdmin. Wajib Dihafalkan: Sintaks dasar DDL (Data Definition Language) dan DML (Data Manipulation Language).", duration: "1-2 Minggu", difficulty: "Pemula" },
      { title: "SQL Advanced: JOIN & Aggregations", explanation: "Materi Kunci: INNER JOIN, LEFT JOIN, RIGHT JOIN, GROUP BY, aggregates (COUNT, SUM, AVG). Tugas Praktik: Membuat kueri SQL untuk menghitung total penjualan per kategori produk. Wajib Dihafalkan: Perbedaan INNER JOIN vs LEFT JOIN.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "PHP Database Connection (PDO)", explanation: "Materi Kunci: Koneksi database dengan PDO, prepared statements untuk mencegah SQL Injection, try-catch exception handling. Tugas Praktik: Membuat sistem registrasi user menggunakan PHP murni dengan PDO aman. Wajib Dihafalkan: Bahaya SQL Injection dan fungsi binding parameters.", duration: "1 Minggu", difficulty: "Pemula" },
      { title: "Pengenalan Laravel & Setup Environment", explanation: "Materi Kunci: Composer package manager, struktur folder Laravel, konfigurasi file .env, server lokal artisan. Tugas Praktik: Melakukan instalasi proyek baru Laravel 11. Wajib Dihafalkan: Peran file .env untuk kredensial sensitif.", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "Laravel Routing & Controller", explanation: "Materi Kunci: Route parameters, named routes, route groups, resource controller. Tugas Praktik: Membuat alur navigasi halaman web profil sekolah dengan resource controller. Wajib Dihafalkan: Struktur return view() dari controller.", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "Laravel Blade Templating Engine", explanation: "Materi Kunci: Blade directives (@extends, @section, @yield, @include, @foreach, @if), layout inheritance. Tugas Praktik: Memotong template HTML statis menjadi tata letak modular Blade di Laravel. Wajib Dihafalkan: Keamanan escape data {{ $data }} vs unescaped {!! $data !!}.", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "Laravel Migrations & Schema Builder", explanation: "Materi Kunci: Migrasi database, rollback, seeding data dengan Faker library, database factories. Tugas Praktik: Membuat migrasi tabel produk dengan seeder 100 data contoh acak. Wajib Dihafalkan: Perintah php artisan migrate, migrate:rollback, dan db:seed.", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "Eloquent ORM: Basic Operations", explanation: "Materi Kunci: Konsep Active Record, query builder vs Eloquent, operasi CRUD standar (all, find, create, update, delete). Tugas Praktik: Membuat CRUD manajemen produk di controller menggunakan Eloquent ORM. Wajib Dihafalkan: Pengaturan fillable/guarded pada Model.", duration: "1-2 Minggu", difficulty: "Menengah" },
      { title: "Eloquent Relationships", explanation: "Materi Kunci: hasOne, belongsTo, hasMany, belongsToMany. Tugas Praktik: Membuat relasi antara tabel User, Post, dan Category di aplikasi blog. Wajib Dihafalkan: Konsep foreign key dan local key di Eloquent.", duration: "2 Minggu", difficulty: "Menengah" },
      { title: "Form Validation & Security", explanation: "Materi Kunci: Request validation rules, custom error messages, CSRF protection, Form Request class. Tugas Praktik: Membuat validasi form pendaftaran dengan aturan email unik, password minimal 8 karakter. Wajib Dihafalkan: Mengapa proteksi CSRF token @csrf wajib ada di setiap form POST Laravel.", duration: "1 Minggu", difficulty: "Menengah" },
      { title: "Laravel Authentication & Authorization", explanation: "Materi Kunci: Setup autentikasi instan (Laravel Breeze), session, middleware auth, laravel gates & policies. Tugas Praktik: Membatasi hak akses halaman edit artikel hanya untuk pemilik artikel (Author). Wajib Dihafalkan: Perbedaan Authentication (siapa Anda) vs Authorization (apa hak Anda).", duration: "2 Minggu", difficulty: "Menengah" },
      { title: "RESTful API Development dengan Laravel", explanation: "Materi Kunci: API Resources, JSON response formatting, API Routing (api.php), CORS. Tugas Praktik: Membangun endpoint API untuk menampilkan, menambah, dan menghapus produk. Wajib Dihafalkan: Status code HTTP standar (200 OK, 201 Created, 401 Unauthorized, 404 Not Found, 500 Server Error).", duration: "2 Minggu", difficulty: "Mahir" },
      { title: "API Authentication dengan Laravel Sanctum", explanation: "Materi Kunci: Token-based authentication, mobile authentication, token abilities, pencabutan token. Tugas Praktik: Mengamankan endpoint API produk agar hanya bisa diakses menggunakan token valid. Wajib Dihafalkan: Cara kerja Header Authorization Bearer Token.", duration: "1-2 Minggu", difficulty: "Mahir" },
      { title: "Middleware Custom & Request Lifecycle", explanation: "Materi Kunci: Pembuatan middleware kustom, global vs route middleware, pemahaman Request Lifecycle di Laravel. Tugas Praktik: Membuat middleware untuk mencatat log aktivitas IP address pengunjung. Wajib Dihafalkan: Urutan jalannya request dari index.php sampai response dikirim.", duration: "1 Minggu", difficulty: "Mahir" },
      { title: "Queue, Background Jobs & Redis Integration", explanation: "Materi Kunci: Asynchronous processing, job classes, queue workers, instalasi Redis untuk caching & queue driver. Tugas Praktik: Mengirim email selamat datang secara background menggunakan queue agar loading halaman registrasi tidak macet. Wajib Dihafalkan: Perintah php artisan queue:work.", duration: "2 Minggu", difficulty: "Mahir" },
      { title: "Automated Testing (Pest / PHPUnit)", explanation: "Materi Kunci: Unit testing vs Feature testing, database transactions dalam testing, assertion methods. Tugas Praktik: Menulis pengujian otomatis untuk memastikan fitur login mengembalikan status 200. Wajib Dihafalkan: Pentingnya TDD (Test-Driven Development) untuk keandalan kode.", duration: "2 Minggu", difficulty: "Mahir" },
      { title: "Dockerize Laravel Application", explanation: "Materi Kunci: Dockerfile, docker-compose.yml, containerization PHP-FPM, Nginx, dan MySQL. Tugas Praktik: Membungkus proyek Laravel ke dalam container Docker dan menjalankannya secara lokal. Wajib Dihafalkan: Konsep dasar image, container, dan volume di Docker.", duration: "2 Minggu", difficulty: "Mahir" },
      { title: "Server VPS Deployment & CI/CD", explanation: "Materi Kunci: Konfigurasi server Ubuntu VPS, install Nginx, PHP, MySQL, setup SSL gratis Let's Encrypt, GitHub Actions untuk automated deploy. Tugas Praktik: Meluncurkan aplikasi Laravel secara otomatis ke server VPS setiap kali melakukan push ke branch main. Wajib Dihafalkan: Perintah SSH dasar dan alur kerja pipeline GitHub Actions.", duration: "3 Minggu", difficulty: "Mahir" },
      { title: "Proyek Akhir Masterclass Backend", explanation: "Materi Kunci: Integrasi arsitektur bersih, clean code, database relasional terindeks, Redis caching, log system, RESTful API terproteksi, dokumentasi Swagger. Tugas Praktik: Membangun sistem Point of Sale (POS) ritel skala besar dengan kasir multi-cabang, laporan penjualan real-time, ekspor PDF/Excel, dan antrian cetak struk background. Wajib Dihafalkan: Desain pattern dan arsitektur database berskala tinggi.", duration: "4 Minggu", difficulty: "Mahir" }
    ];
  } else {
    // Generic / Custom
    baseSteps = [];
    // Generate dynamically to match the exact count requested
    for (let i = 1; i <= stepsToTake; i++) {
      let stepDifficulty = "Pemula";
      if (i > stepsToTake * 0.7) stepDifficulty = "Mahir";
      else if (i > stepsToTake * 0.3) stepDifficulty = "Menengah";

      baseSteps.push({
        title: `Modul ${i}: Pendalaman ${goal} Bagian ${i}`,
        explanation: `Materi Kunci: Pengenalan materi kunci, konsep mendalam, dan teori fundamental yang terkait dengan subtopik ${i} pada pembelajaran ${goal}. Tugas Praktik: Mengerjakan latihan studi kasus ${i} secara mandiri untuk menguji pemahaman praktis Anda. Wajib Dihafalkan: Konsep inti, sintaks penting, dan pola pengerjaan di luar kepala agar siap diimplementasikan secara lancar.`,
        duration: "1-2 Minggu",
        difficulty: stepDifficulty
      });
    }
  }

  // Filter based on level and scale steps based on duration
  let filteredSteps = [];

  if (lvl === "mahir") {
    // Start directly from Mahir or late Menengah steps
    filteredSteps = baseSteps.filter(s => s.difficulty === "Mahir" || s.difficulty === "Menengah");
    filteredSteps = filteredSteps.slice(-stepsToTake).map(s => ({ ...s, difficulty: "Mahir" }));
  } else if (lvl === "menengah") {
    // Skip Pemula steps
    filteredSteps = baseSteps.filter(s => s.difficulty !== "Pemula");
    filteredSteps = filteredSteps.slice(0, stepsToTake);
  } else {
    // Pemula gets the first steps up to the limit
    filteredSteps = baseSteps.slice(0, stepsToTake);
  }

  // Ensure we always return at least something
  if (filteredSteps.length === 0) {
    filteredSteps = baseSteps.slice(-Math.min(stepsToTake, baseSteps.length));
  }

  // If we still need more steps to satisfy stepsToTake, slice whatever we have up to stepsToTake
  if (filteredSteps.length < stepsToTake && baseSteps.length > filteredSteps.length) {
    filteredSteps = baseSteps.slice(0, stepsToTake);
  }

  return filteredSteps;
}
