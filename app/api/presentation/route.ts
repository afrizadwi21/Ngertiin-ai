import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { topic, slide_count, style, education_level } = await req.json();

    if (!topic?.trim() || !slide_count || !style || !education_level) {
      return NextResponse.json(
        { error: "Topic, slide count, style, and education level are required" },
        { status: 400 }
      );
    }

    const count = parseInt(slide_count) || 5;

    const systemPrompt = `You are Afriza AI, a highly professional Indonesian AI Study Buddy.
Generate structured educational presentation materials for Indonesian students.

Rules:
- Match the requested topic STRICTLY: "${topic}".
- Match the education level STRICTLY: "${education_level}". (Ensure language complexity matches: SMP is simple/analogous, SMA/SMK is intermediate and practical, Kuliah is professional, academic, and comprehensive).
- Match the selected style: "${style}". (Formal, Modern, or Student Friendly).
- Keep slides educational, rich in content, and highly structured.
- Use Indonesian language.

Topic:
${topic}

Slide count:
${count}

Style:
${style}

Education level:
${education_level}`;

    const jsonPrompt = `
Generate the presentation as a JSON array of slide objects.
Return ONLY a valid JSON array, with no other text, and no markdown formatting (do not wrap in \`\`\`json).

Each slide object in the array must have the following structure:
{
  "slide_number": 1,
  "title": "Judul Slide yang menarik dan edukatif",
  "points": [
    "Poin utama 1 yang ringkas dan padat",
    "Poin utama 2 yang ringkas dan padat",
    "Poin utama 3 yang ringkas dan padat"
  ],
  "explanation": "Penjelasan singkat (2-3 kalimat) yang menjelaskan seluruh poin di atas secara interaktif, informatif, dan mudah dipahami siswa.",
  "takeaway": "Key takeaway / kesimpulan singkat slide ini sebagai pesan kunci yang mudah dihafal."
}

Instruction Details:
- Generate EXACTLY ${count} slides.
- Make each slide informative. Ensure the flow goes:
  Slide 1: Pengenalan/Judul Presentasi & Pendahuluan
  Slide 2 ke atas: Pembahasan detail materi, konsep, contoh, rumus/aplikasi
  Slide Terakhir: Kesimpulan / Rangkuman Utama & Penutup
- Ensure clean JSON syntax and no trailing commas.`;

    let slides = [];

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

        slides = JSON.parse(cleanText);
      } catch (geminiError) {
        console.warn("Gemini API error, falling back to local presentation generator:", geminiError);
        slides = generateLocalPresentation(topic, count, style, education_level);
      }
    } else {
      slides = generateLocalPresentation(topic, count, style, education_level);
    }

    // Verify structure
    if (!Array.isArray(slides) || slides.length === 0) {
      slides = generateLocalPresentation(topic, count, style, education_level);
    }

    // Ensure correct slide numbers
    slides = slides.slice(0, count).map((slide, index) => ({
      ...slide,
      slide_number: index + 1,
    }));

    return NextResponse.json({
      topic,
      slide_count: count,
      style,
      level: education_level,
      slides,
    });
  } catch (error: any) {
    console.error("Presentation API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate presentation" },
      { status: 500 }
    );
  }
}

// Fallback Local Presentation Generator
function generateLocalPresentation(topic: string, count: number, style: string, level: string) {
  const topicLower = topic.toLowerCase();
  let baseSlides: any[] = [];

  if (topicLower.includes("transformator") || topicLower.includes("trafo")) {
    baseSlides = [
      {
        title: "Pengenalan Transformator (Trafo)",
        points: ["Definisi transformator", "Alat pengubah tegangan listrik", "Penting dalam jaringan listrik"],
        explanation: "Transformator (trafo) adalah alat kelistrikan yang berfungsi untuk menaikkan atau menurunkan tegangan listrik bolak-balik (AC) berdasarkan prinsip induksi elektromagnetik.",
        takeaway: "Trafo adalah kunci penyaluran listrik dari pembangkit ke rumah kita!"
      },
      {
        title: "Prinsip Kerja: Induksi Elektromagnetik",
        points: ["Hukum Induksi Faraday", "Interaksi kumparan primer & sekunder", "Perubahan medan magnetik"],
        explanation: "Arus bolak-balik pada kumparan primer menghasilkan medan magnet yang berubah-ubah. Medan magnet ini menginduksi kumparan sekunder sehingga menghasilkan tegangan induksi.",
        takeaway: "Tanpa adanya magnet yang bergerak atau berubah, trafo tidak akan bekerja."
      },
      {
        title: "Dua Jenis Utama Trafo",
        points: ["Transformator Step-Up", "Transformator Step-Down", "Perbedaan jumlah lilitan kumparan"],
        explanation: "Trafo Step-Up berfungsi menaikkan tegangan (lilitan sekunder lebih banyak). Sebaliknya, trafo Step-Down menurunkan tegangan (lilitan sekunder lebih sedikit).",
        takeaway: "Step-Up = Menaikkan Tegangan, Step-Down = Menurunkan Tegangan."
      },
      {
        title: "Rumus Dasar Transformator",
        points: ["Hubungan Tegangan dan Lilitan (Vp/Vs = Np/Ns)", "Hubungan Arus dengan Tegangan", "Efisiensi trafo ideal vs nyata"],
        explanation: "Secara ideal, perbandingan tegangan primer dan sekunder sebanding dengan jumlah lilitannya. Namun pada kenyataannya, selalu ada energi yang hilang menjadi panas (efisiensi < 100%).",
        takeaway: "Vp/Vs = Np/Ns = Is/Ip (untuk trafo ideal)."
      },
      {
        title: "Komponen Utama Transformator",
        points: ["Inti Besi (Iron Core)", "Kumparan Primer", "Kumparan Sekunder & Isolator"],
        explanation: "Inti besi berlapis digunakan untuk memperkuat medan magnet dan mengurangi arus pusar (eddy currents). Kumparan terbuat dari tembaga berkualitas tinggi.",
        takeaway: "Desain inti besi berlapis bertujuan mencegah hilangnya energi akibat panas."
      },
      {
        title: "Mengapa Menggunakan Arus AC?",
        points: ["Mengapa arus DC tidak bisa digunakan", "Pentingnya fluks magnetik dinamis", "Keuntungan transmisi jarak jauh"],
        explanation: "Trafo membutuhkan arus bolak-balik (AC) karena hanya arus AC yang dapat menghasilkan fluks magnetik yang terus berubah untuk menginduksi tegangan pada kumparan lain.",
        takeaway: "Arus searah (DC) tidak menghasilkan perubahan medan magnet, sehingga trafo akan diam."
      },
      {
        title: "Kehilangan Energi pada Trafo",
        points: ["Efek Joule (panas kabel)", "Arus Eddy (arus pusar inti)", "Histeresis (hambatan magnetik inti)"],
        explanation: "Tidak ada trafo yang 100% efisien. Energi hilang dalam bentuk panas akibat hambatan kabel, arus pusar pada besi, dan gesekan magnetik di dalam besi.",
        takeaway: "Efisiensi trafo biasanya berkisar antara 90% hingga 98%."
      },
      {
        title: "Penerapan dalam Kehidupan Sehari-hari",
        points: ["Charger Smartphone (Step-Down)", "Gardu Listrik PLN (Step-Up & Step-Down)", "Peralatan Elektronik Rumah Tangga"],
        explanation: "Charger HP menurunkan listrik 220V dari stopkontak menjadi sekitar 5V. Sementara PLN menaikkan tegangan hingga ratusan kilovolt agar listrik tidak hilang saat dikirim jarak jauh.",
        takeaway: "Trafo ada di hampir setiap adaptor elektronik yang kita miliki!"
      },
      {
        title: "Pemeliharaan & Keamanan Trafo",
        points: ["Pendingin minyak trafo", "Bahaya beban berlebih (Overload)", "Sistem proteksi sekering"],
        explanation: "Trafo daya besar menggunakan minyak khusus sebagai pendingin dan isolator. Kelebihan beban dapat memicu panas berlebih yang merusak kumparan dan menyebabkan ledakan.",
        takeaway: "Pendinginan yang baik adalah kunci keawetan trafo daya tinggi."
      },
      {
        title: "Kesimpulan & Rangkuman",
        points: ["Alat vital kelistrikan global", "Prinsip induksi elektromagnetik Faraday", "Step-Up dan Step-Down sebagai pilar transmisi"],
        explanation: "Transformator merupakan pondasi distribusi energi modern. Dengan memahami trafo, kita memahami bagaimana listrik dapat disalurkan dengan aman dan efisien ke seluruh penjuru dunia.",
        takeaway: "Memahami trafo berarti menghargai sistem distribusi energi yang menerangi dunia!"
      }
    ];
  } else if (topicLower.includes("fotosintesis")) {
    baseSlides = [
      {
        title: "Pengenalan Fotosintesis",
        points: ["Definisi pembuatan makanan tumbuhan", "Proses pengubahan energi cahaya", "Terjadi pada organisme autotrof"],
        explanation: "Fotosintesis adalah proses biokimia di mana tumbuhan, alga, dan beberapa bakteri mengubah air dan karbon dioksida menjadi glukosa dan oksigen dengan bantuan energi cahaya matahari.",
        takeaway: "Fotosintesis adalah sumber utama energi bagi hampir seluruh kehidupan di bumi!"
      },
      {
        title: "Kloroplas: Dapur Tumbuhan",
        points: ["Organel sel fotosintetik", "Mengandung pigmen klorofil", "Struktur membran ganda, tilakoid & stroma"],
        explanation: "Proses fotosintesis terjadi di dalam kloroplas. Pigmen hijau bernama klorofil menangkap energi cahaya matahari untuk memicu reaksi kimia pembentukan glukosa.",
        takeaway: "Klorofil adalah penangkap cahaya matahari yang memberikan warna hijau pada daun."
      },
      {
        title: "Bahan Baku & Produk Fotosintesis",
        points: ["Karbon Dioksida (CO2) & Air (H2O)", "Cahaya Matahari sebagai energi", "Menghasilkan Glukosa (C6H12O6) & Oksigen (O2)"],
        explanation: "Tumbuhan menyerap air dari tanah melalui akar dan CO2 dari udara melalui stomata. Energi cahaya memecah molekul ini dan menyusunnya kembali menjadi gula dan melepas oksigen ke udara.",
        takeaway: "Persamaan Kimia: 6CO2 + 6H2O + Cahaya -> C6H12O6 + 6O2."
      },
      {
        title: "Reaksi Terang (Light-Dependent Reaction)",
        points: ["Terjadi di membran tilakoid", "Membutuhkan cahaya matahari secara langsung", "Fotolisis air menghasilkan ATP, NADPH, dan O2"],
        explanation: "Cahaya matahari diserap oleh klorofil untuk memecah air (fotolisis) menjadi hidrogen dan oksigen. Reaksi ini menghasilkan energi kimia berupa ATP dan NADPH untuk tahap berikutnya.",
        takeaway: "Oksigen yang kita hirup sehari-hari dihasilkan pada tahap Reaksi Terang ini."
      },
      {
        title: "Reaksi Gelap / Siklus Calvin",
        points: ["Terjadi di stroma", "Tidak memerlukan cahaya langsung", "Fiksasi karbon menjadi glukosa"],
        explanation: "Menggunakan energi ATP dan NADPH dari reaksi terang untuk memproses karbon dioksida menjadi molekul gula (glukosa). Proses ini disebut juga Siklus Calvin.",
        takeaway: "Reaksi gelap adalah tahap pembuatan makanan sebenarnya (glukosa) bagi tumbuhan."
      },
      {
        title: "Faktor yang Memengaruhi Fotosintesis",
        points: ["Intensitas Cahaya", "Konsentrasi Karbon Dioksida", "Suhu dan Ketersediaan Air"],
        explanation: "Laju fotosintesis akan meningkat seiring bertambahnya cahaya dan CO2 hingga titik jenuh. Suhu yang terlalu panas atau dingin juga dapat merusak enzim yang membantu proses ini.",
        takeaway: "Air, cahaya, dan suhu hangat adalah resep terbaik pertumbuhan tumbuhan."
      },
      {
        title: "Peran Fotosintesis bagi Atmosfer",
        points: ["Penyerap karbon dioksida global", "Produsen oksigen terbesar di darat", "Menjaga keseimbangan gas rumah kaca"],
        explanation: "Fotosintesis bertindak sebagai pembersih udara alami bumi dengan menyerap CO2 hasil pembakaran dan menggantinya dengan Oksigen segar yang dibutuhkan mahluk hidup.",
        takeaway: "Menanam pohon adalah cara paling efektif untuk melawan pemanasan global."
      },
      {
        title: "Fotosintesis pada Tumbuhan Air",
        points: ["Menggunakan CO2 terlarut dalam air", "Gelembung oksigen sebagai bukti reaksi", "Hydrilla sebagai tanaman contoh populer"],
        explanation: "Tumbuhan air menyerap gas CO2 terlarut untuk fotosintesis. Oksigen yang dihasilkan keluar dalam bentuk gelembung gas kecil yang melayang ke permukaan air.",
        takeaway: "Gelembung air pada tumbuhan air membuktikan pembentukan gas oksigen secara visual."
      },
      {
        title: "Fotosintesis vs Respirasi Sel",
        points: ["Reaksi anabolisme vs katabolisme", "Penyimpanan energi vs pelepasan energi", "Siklus karbon yang seimbang"],
        explanation: "Fotosintesis menyimpan energi cahaya menjadi energi kimia (gula), sedangkan respirasi seluler (pada hewan dan tumbuhan di malam hari) membakar gula untuk melepas energi.",
        takeaway: "Fotosintesis membuat makanan; Respirasi memakan makanan untuk menghasilkan energi kerja."
      },
      {
        title: "Kesimpulan & Rangkuman",
        points: ["Proses vital penopang biosfer", "Reaksi terang dan Siklus Calvin", "Tumbuhan sebagai paru-paru dunia"],
        explanation: "Fotosintesis adalah jembatan emas antara energi kosmik matahari dan energi biologis mahluk hidup. Tanpa fotosintesis, rantai makanan akan runtuh dan kehidupan di bumi akan musnah.",
        takeaway: "Hargai tumbuhan, karena setiap napas kita bergantung pada kerja keras mereka!"
      }
    ];
  } else if (topicLower.includes("next.js") || topicLower.includes("nextjs")) {
    baseSlides = [
      {
        title: "Mengenal Next.js",
        points: ["Framework React untuk produksi", "Dikembangkan oleh Vercel", "Mendukung rendering modern (SSR & SSG)"],
        explanation: "Next.js adalah framework React open-source populer yang memberikan solusi lengkap untuk membangun aplikasi web cepat, ramah SEO, dan siap produksi dengan fitur bawaan yang lengkap.",
        takeaway: "Next.js membuat pengembangan React menjadi lebih terstruktur dan berkinerja tinggi."
      },
      {
        title: "Perbedaan React vs Next.js",
        points: ["React adalah library UI; Next.js adalah framework", "React menggunakan Client-Side Rendering (CSR)", "Next.js mendukung Server-Side Rendering (SSR) bawaan"],
        explanation: "React biasa mengirimkan halaman kosong ke browser lalu me-render konten via JS. Next.js melakukan rendering di server terlebih dahulu, menghasilkan halaman HTML instan yang lebih cepat dibuka dan mudah diindeks Google.",
        takeaway: "Next.js = React + Performa Server-Side + SEO Optimal."
      },
      {
        title: "Fitur Unggulan: App Router",
        points: ["Routing berbasis folder & file", "Mendukung React Server Components (RSC)", "Folder 'app' sebagai root routing"],
        explanation: "Next.js menggunakan sistem routing berbasis direktori. Setiap folder di dalam folder 'app/' yang berisi file 'page.tsx' secara otomatis menjadi rute URL aktif di website.",
        takeaway: "Routing Next.js sangat intuitif: folder = URL, file = isi halaman."
      },
      {
        title: "React Server Components (RSC)",
        points: ["Komponen di-render di server secara default", "Ukuran bundle JavaScript client berkurang", "Akses langsung ke database/API aman"],
        explanation: "Dengan RSC, komponen memuat data di server sehingga browser tidak perlu mengunduh file JavaScript yang besar. Ini membuat loading web menjadi sangat cepat dan aman.",
        takeaway: "Gunakan Server Components untuk data fetching dan Client Components ('use client') untuk interaktivitas."
      },
      {
        title: "Metode Data Rendering di Next.js",
        points: ["Static Site Generation (SSG)", "Server-Side Rendering (SSR)", "Incremental Static Regeneration (ISR)"],
        explanation: "SSG membuat halaman statis saat build-time. SSR membuat halaman dinamis setiap kali ada request. ISR memungkinkan pembaruan halaman statis di latar belakang secara berkala tanpa rebuild ulang.",
        takeaway: "Gunakan SSG untuk performa maksimal, SSR untuk data yang selalu berubah, dan ISR untuk blog/e-commerce."
      },
      {
        title: "Optimalisasi Aset Gambar & Font",
        points: ["Komponen next/image bawaan", "next/font dengan Google Fonts lokal", "Optimalisasi ukuran dan format gambar otomatis"],
        explanation: "Next.js mengoptimalkan gambar secara otomatis (mengubah format ke WebP/AVIF, lazy loading). Modul font bawaan mengunduh Google Fonts ke server lokal sehingga tidak ada hambatan loading font dari luar.",
        takeaway: "Lighthouse score web Anda akan meningkat drastis dengan optimasi gambar & font bawaan ini."
      },
      {
        title: "API Routes & Server Actions",
        points: ["Membangun REST API di dalam framework", "Server Actions untuk form submission langsung", "Menghilangkan kebutuhan server backend terpisah"],
        explanation: "Next.js memungkinkan Anda membuat API endpoint di folder 'api/'. Lebih hebat lagi, Server Actions membolehkan fungsi React memanggil kode server langsung (seperti query database) tanpa fetch API manual.",
        takeaway: "Server Actions membuat komunikasi frontend-backend menjadi satu baris fungsi React biasa!"
      },
      {
        title: "Keamanan & Middleware",
        points: ["File middleware.ts di root", "Proteksi rute sebelum rendering halaman", "Manajemen session & token autentikasi"],
        explanation: "Middleware Next.js dieksekusi sebelum request selesai. Sangat berguna untuk memeriksa apakah user sudah login, mengarahkan redirect halaman, atau menerapkan proteksi keamanan tingkat lanjut.",
        takeaway: "Middleware adalah satpam andal yang menyaring akses halaman web Anda."
      },
      {
        title: "Deployment Mudah dengan Vercel",
        points: ["Integrasi git push-to-deploy otomatis", "Serverless & Edge Functions global", "Optimalisasi CDN bawaan gratis"],
        explanation: "Vercel dirancang khusus untuk menampung aplikasi Next.js. Setiap kali Anda melakukan git commit dan push ke GitHub, Vercel akan mem-build dan merilis web Anda secara otomatis ke internet.",
        takeaway: "Vercel + Next.js adalah kombinasi deployment terbaik dan termudah di dunia modern."
      },
      {
        title: "Kesimpulan & Rangkuman Next.js",
        points: ["Framework React standar industri modern", "Kecepatan luar biasa berkat SSR & SSG", "Ekosistem kaya didukung Vercel"],
        explanation: "Next.js bukan sekadar tren, melainkan standar industri modern untuk frontend developer. Menguasai Next.js memberikan keunggulan kompetitif besar dalam membangun aplikasi web skala produksi yang cepat dan profesional.",
        takeaway: "Next.js adalah masa depan pengembangan web dengan ekosistem React!"
      }
    ];
  } else if (topicLower.includes("majapahit") || topicLower.includes("kerajaan")) {
    baseSlides = [
      {
        title: "Mengenal Kerajaan Majapahit",
        points: ["Kerajaan Hindu-Buddha terbesar di Indonesia", "Berpusat di Jawa Timur (Trowulan)", "Berdiri sekitar tahun 1293 hingga 1527 M"],
        explanation: "Kerajaan Majapahit adalah salah satu kemaharajaan terbesar dalam sejarah Nusantara yang berhasil menyatukan sebagian besar kepulauan di Asia Tenggara di bawah pengaruh kekuasaannya.",
        takeaway: "Majapahit adalah simbol kejayaan persatuan maritim Nusantara di masa lampau."
      },
      {
        title: "Pendiri Majapahit: Raden Wijaya",
        points: ["Menantu Raja Kertanegara (Singasari)", "Memanfaatkan serangan tentara Mongol (Tartar)", "Mendirikan kerajaan di hutan tarik (1293 M)"],
        explanation: "Raden Wijaya mendirikan Majapahit setelah berhasil menyingkirkan Jayakatwang (pemberontak Singasari) dengan memanfaatkan kedatangan tentara Mongol, lalu mengusir tentara Mongol kembali ke laut.",
        takeaway: "Kecerdasan taktik Raden Wijaya adalah kunci berdirinya fondasi kemaharajaan Majapahit."
      },
      {
        title: "Masa Kejayaan: Hayam Wuruk & Gajah Mada",
        points: ["Mencapai puncak kejayaan abad ke-14", "Pemerintahan Raja Hayam Wuruk", "Didukung oleh Mahapatih Gajah Mada"],
        explanation: "Majapahit mencapai puncak keemasannya di bawah kepemimpinan Raja Hayam Wuruk dan Patih Gajah Mada. Wilayah kekuasaannya membentang dari Sumatera, Semenanjung Malaya, Kalimantan, hingga Papua.",
        takeaway: "Kolaborasi raja yang bijaksana dan patih yang tangguh menghasilkan masa keemasan."
      },
      {
        title: "Sumpah Palapa yang Legendaris",
        points: ["Ikrar suci Mahapatih Gajah Mada", "Janji tidak memakan buah palapa (tidak bersenang-senang)", "Komitmen menyatukan Nusantara"],
        explanation: "Gajah Mada bersumpah tidak akan menikmati kemewahan dunia (amukti palapa) sebelum berhasil mempersatukan wilayah Nusantara di bawah naungan panji-panji Majapahit.",
        takeaway: "Sumpah Palapa adalah inspirasi dasar dari konsep persatuan Indonesia modern (NKRI)."
      },
      {
        title: "Pilar Kejayaan: Kekuatan Maritim & Agraris",
        points: ["Armada laut tangguh dipimpin laksamana kuat", "Pertanian padi subur di sepanjang Sungai Brantas", "Pusat perdagangan internasional Asia Tenggara"],
        explanation: "Majapahit menggabungkan dua kekuatan ekonomi utama: agraris (pertanian dalam pedalaman Jawa) dan maritim (perdagangan laut global). Selat Madura dan Sungai Brantas menjadi nadi transportasinya.",
        takeaway: "Negara yang makmur menggabungkan kedaulatan pangan dan kekuatan maritim."
      },
      {
        title: "Kehidupan Sosial & Toleransi Agama",
        points: ["Semboyan Bhinneka Tunggal Ika", "Toleransi Hindu Siwa dan Buddha", "Ditulis oleh Mpu Tantular di Kakawin Sutasoma"],
        explanation: "Majapahit membuktikan harmoni sosial yang tinggi. Meskipun rakyat menganut agama Hindu dan Buddha yang berbeda, mereka hidup rukun di bawah naungan semboyan Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa.",
        takeaway: "Bhinneka Tunggal Ika lahir dari rahim toleransi beragama zaman Majapahit."
      },
      {
        title: "Karya Sastra & Arsitektur Megah",
        points: ["Kitab Negarakertagama karya Mpu Prapanca", "Candi Penataran, Tikus, dan Bajang Ratu", "Seni terakota tanah liat khas Trowulan"],
        explanation: "Peninggalan Majapahit sangat kaya, mulai dari candi bata merah estetik di Trowulan hingga karya sastra tinggi yang mendokumentasikan tata negara, perjalanan raja, dan adat istiadat istana.",
        takeaway: "Karya seni dan sastra menunjukkan tingginya tingkat peradaban suatu bangsa."
      },
      {
        title: "Penyebab Keruntuhan Majapahit",
        points: ["Perang Saudara (Perang Paregreg)", "Kurangnya kaderisasi pemimpin setelah Gajah Mada wafat", "Masuknya pengaruh Islam dan berkembangnya Demak"],
        explanation: "Perebutan takhta (Perang Paregreg) memperlemah kekuatan militer dan ekonomi Majapahit. Di saat yang sama, kota-kota pelabuhan utara Jawa memisahkan diri dan memicu berdirinya Kesultanan Demak.",
        takeaway: "Perpecahan internal adalah musuh terbesar yang menghancurkan kerajaan dari dalam."
      },
      {
        title: "Peninggalan Majapahit di Masa Kini",
        points: ["Situs arkeologi Trowulan Jawa Timur", "Bendera merah putih terinspirasi dari panji Majapahit", "Inspirasi integrasi nasional Indonesia"],
        explanation: "Lambang negara kita, Bhinneka Tunggal Ika, dan warna bendera Merah Putih (dari panji getih-getah samudra Majapahit) adalah warisan sejarah yang terus hidup dalam identitas bangsa Indonesia.",
        takeaway: "Warisan Majapahit membentuk jati diri dan jiwa nasionalisme bangsa Indonesia."
      },
      {
        title: "Kesimpulan & Rangkuman",
        points: ["Kemaharajaan maritim terbesar Nusantara", "Inspirasi nilai persatuan dan toleransi", "Bukti kejayaan peradaban masa lampau"],
        explanation: "Majapahit bukan sekadar cerita masa lalu, melainkan bukti nyata bahwa Nusantara pernah memiliki peradaban maritim yang mandiri, dihormati dunia internasional, dan kaya akan kebudayaan adiluhung.",
        takeaway: "Belajar dari Majapahit mengajarkan kita pentingnya menjaga persatuan di tengah keberagaman."
      }
    ];
  } else {
    // Dynamic Generic Generator
    baseSlides = [];
    for (let i = 1; i <= 15; i++) {
      let slideTitle = "";
      let slidePoints: string[] = [];
      let slideExplanation = "";
      let slideTakeaway = "";

      if (i === 1) {
        slideTitle = `Pengenalan Tentang ${topic}`;
        slidePoints = [
          `Definisi dasar ${topic}`,
          `Mengapa topik ini sangat penting`,
          `Latar belakang pemahaman esensial`
        ];
        slideExplanation = `Pada bagian pendahuluan ini, kita akan membahas dasar-dasar mengenai ${topic}. Memahami konsep awal ini sangat penting untuk membangun fondasi ilmu yang kokoh pada modul-modul berikutnya.`;
        slideTakeaway = `Memahami dasar adalah kunci pertama untuk menguasai ${topic}!`;
      } else if (i === 2) {
        slideTitle = `Konsep Utama & Struktur ${topic}`;
        slidePoints = [
          `Elemen-elemen pembentuk penting`,
          `Bagaimana bagian-bagian tersebut saling terhubung`,
          `Karakteristik unik yang perlu diperhatikan`
        ];
        slideExplanation = `Modul kedua ini mengupas tuntas struktur pembentuk dan pilar-pilar penting dari ${topic}. Setiap bagian memiliki peranan khusus yang saling mendukung satu sama lain secara dinamis.`;
        slideTakeaway = `Semua bagian besar terbentuk dari susunan komponen kecil yang harmonis.`;
      } else if (i === 3) {
        slideTitle = `Prinsip Kerja & Mekanisme`;
        slidePoints = [
          `Bagaimana proses ini berlangsung`,
          `Tahapan reaksi atau alur kerja logis`,
          `Keterlibatan energi atau faktor eksternal`
        ];
        slideExplanation = `Dalam langkah ini, kita mendalami alur kerja dan mekanisme operasional dari ${topic}. Pahami bagaimana input diolah secara sistematis hingga menghasilkan output yang diinginkan.`;
        slideTakeaway = `Proses yang sistematis selalu menghasilkan hasil akhir yang terprediksi dan optimal.`;
      } else if (i === 4) {
        slideTitle = `Penerapan & Aplikasi Praktis`;
        slidePoints = [
          `Penggunaan dalam industri atau kehidupan nyata`,
          `Studi kasus pemecahan masalah nyata`,
          `Manfaat langsung bagi kenyamanan manusia`
        ];
        slideExplanation = `Topik ${topic} memiliki banyak aplikasi dalam dunia praktis. Kita akan melihat bagaimana teori yang telah kita pelajari diimplementasikan langsung untuk mempermudah pekerjaan sehari-hari.`;
        slideTakeaway = `Ilmu pengetahuan menjadi hidup saat dipraktikkan untuk menolong sesama.`;
      } else if (i === 5) {
        slideTitle = `Kelebihan & Keunggulan Utama`;
        slidePoints = [
          `Mengapa metode ini lebih unggul`,
          `Efisiensi energi, waktu, atau biaya`,
          `Dampak positif jangka panjang`
        ];
        slideExplanation = `Kita akan menganalisis keunggulan mutlak yang ditawarkan oleh penerapan konsep ${topic}. Kelebihan-kelebihan ini menjadikannya solusi standar yang banyak dipilih di era modern.`;
        slideTakeaway = `Efisiensi dan efektivitas adalah pilar utama keunggulan teknologi modern.`;
      } else if (i === 6) {
        slideTitle = `Tantangan & Hambatan yang Dihadapi`;
        slidePoints = [
          `Faktor pembatas atau kendala teknis`,
          `Risiko kegagalan dan cara mengatasinya`,
          `Tantangan adaptasi lingkungan atau sosial`
        ];
        slideExplanation = `Meskipun memiliki banyak keunggulan, penerapan ${topic} juga menghadapi beberapa tantangan nyata seperti keterbatasan bahan, biaya tinggi, atau kendala geografis.`;
        slideTakeaway = `Setiap solusi canggih selalu membawa tantangan baru yang harus dipecahkan.`;
      } else if (i === 7) {
        slideTitle = `Metodologi & Alat Bantu Pendukung`;
        slidePoints = [
          `Peralatan pendukung yang digunakan`,
          `Langkah-langkah eksperimen atau instalasi`,
          `Standar keselamatan atau kualitas industri`
        ];
        slideExplanation = `Untuk mempraktikkan ${topic} dengan sukses, diperlukan peralatan penunjang yang memadai serta standard operating procedure (SOP) yang ketat guna memastikan hasil yang presisi.`;
        slideTakeaway = `Alat yang tepat di tangan orang yang tepat menghasilkan karya yang luar biasa.`;
      } else if (i === 8) {
        slideTitle = `Analisis Komparatif Alternatif`;
        slidePoints = [
          `Perbandingan dengan konsep sejenis`,
          `Kelemahan dan kekuatan komparatif`,
          `Analisis biaya-manfaat (cost-benefit analysis)`
        ];
        slideExplanation = `Di modul ini, kita membandingkan ${topic} dengan alternatif lain yang ada di pasar atau alam semesta. Ini penting agar kita bisa memilih solusi terbaik untuk masalah spesifik kita.`;
        slideTakeaway = `Pilihlah solusi berdasarkan kesesuaian kebutuhan, bukan sekadar popularitas.`;
      } else if (i === 9) {
        slideTitle = `Etika & Dampak Lingkungan`;
        slidePoints = [
          `Dampak ekologis jangka pendek & panjang`,
          `Aspek etis dan regulasi hukum pemerintah`,
          `Solusi keberlanjutan (sustainability)`
        ];
        slideExplanation = `Kita harus meninjau bagaimana ${topic} memengaruhi lingkungan hidup dan masyarakat sekitar. Pembangunan yang baik adalah pembangunan berkelanjutan yang menjaga bumi tetap lestari.`;
        slideTakeaway = `Teknologi terbaik adalah teknologi yang bersahabat dengan alam sekitar.`;
      } else if (i === 10) {
        slideTitle = `Tren Masa Depan & Inovasi`;
        slidePoints = [
          `Arah perkembangan riset terbaru`,
          `Integrasi dengan kecerdasan buatan (AI) / IoT`,
          `Prediksi pemanfaatan di dekade mendatang`
        ];
        slideExplanation = `Bagaimana nasib ${topic} di masa depan? Para ilmuwan terus melakukan riset inovatif untuk menembus batas kemampuan demi menciptakan solusi yang lebih ramah dan bertenaga.`;
        slideTakeaway = `Masa depan dibentuk oleh rasa ingin tahu dan inovasi tanpa henti hari ini!`;
      } else if (i === 11) {
        slideTitle = `Studi Kasus Keberhasilan Riil`;
        slidePoints = [
          `Contoh nyata proyek sukses di lapangan`,
          `Analisis kesuksesan dan metrik pencapaian`,
          `Pelajaran berharga yang bisa dipetik`
        ];
        slideExplanation = `Mari kita lihat studi kasus sukses dari salah satu institusi ternama yang berhasil memanfaatkan ${topic} untuk melipatgandakan hasil kerja mereka dengan aman dan efisien.`;
        slideTakeaway = `Belajar dari keberhasilan orang lain memperpendek jalan menuju sukses kita sendiri.`;
      } else if (i === 12) {
        slideTitle = `Kesimpulan, Rangkuman & Penutup`;
        slidePoints = [
          `Ringkasan pilar-pilar penting yang dipelajari`,
          `Pesan kunci untuk diingat selamanya`,
          `Langkah selanjutnya untuk pendalaman mandiri`
        ];
        slideExplanation = `Sebagai penutup, kita merangkum seluruh pemahaman kita tentang ${topic}. Anda kini telah memiliki gambaran komprehensif mengenai subtopik, cara kerja, hingga tantangan di masa depan.`;
        slideTakeaway = `Akhir dari presentasi ini adalah awal bagi Anda untuk mempraktikkan ilmu secara nyata!`;
      } else {
        slideTitle = `Modul Tambahan Ke-${i}: Pendalaman Khusus`;
        slidePoints = [
          `Submateri pengayaan tentang ${topic}`,
          `Tanya jawab konsep yang sering disalahpahami`,
          `Referensi materi pembelajaran lanjutan`
        ];
        slideExplanation = `Slide tambahan ini disiapkan oleh Afriza AI untuk memperluas wawasan Anda terkait aspek khusus dari ${topic} yang jarang dibahas di buku teks biasa.`;
        slideTakeaway = `Belajar tidak pernah berhenti, selalu ada hal baru untuk dieksplorasi!`;
      }

      baseSlides.push({
        title: slideTitle,
        points: slidePoints,
        explanation: slideExplanation,
        takeaway: slideTakeaway
      });
    }
  }

  // Slice baseSlides to the requested slide count
  let filteredSlides = baseSlides.slice(0, count);

  // If we need more slides than available, dynamically pad the array
  while (filteredSlides.length < count) {
    const nextNum = filteredSlides.length + 1;
    filteredSlides.push({
      title: `Modul Lanjutan ${nextNum}: Eksplorasi ${topic}`,
      points: [
        `Konsep kunci pengayaan bagian ${nextNum}`,
        `Aplikasi tingkat tinggi di industri`,
        `Kuis pemahaman dan latihan soal`
      ],
      explanation: `Di slide ke-${nextNum} ini, kita mendalami detail teknis tingkat lanjut mengenai ${topic} untuk memastikan penguasaan kurikulum yang optimal dan menyeluruh.`,
      takeaway: `Ketekunan belajar di setiap slide membawa Anda selangkah lebih dekat menuju pakar!`
    });
  }

  return filteredSlides;
}
