import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Local keywords check to grade essays offline
function gradeEssayLocally(questionText: string, correctAnswerText: string, studentAnswer: string) {
  if (!studentAnswer || studentAnswer.trim() === "") {
    return {
      score: 0,
      isCorrect: false,
      feedback: "Kamu tidak memberikan jawaban untuk soal ini. Silakan coba menjawab di kuis berikutnya."
    };
  }

  const cleanStudent = studentAnswer.toLowerCase();
  const cleanCorrect = correctAnswerText.toLowerCase();

  // Extract relevant keywords from the correct answer (longer words > 4 chars)
  const stopwords = ["adalah", "dengan", "yang", "untuk", "sebagai", "dalam", "bahwa", "secara", "sehingga", "karena", "tetapi", "serta", "yaitu"];
  const keywords = cleanCorrect
    .split(/[\s,.\-()]+/ )
    .filter((word) => word.length > 4 && !stopwords.includes(word));

  // Count matches
  let matches = 0;
  const matchedWords: string[] = [];
  
  keywords.forEach((keyword) => {
    if (cleanStudent.includes(keyword)) {
      matches++;
      matchedWords.push(keyword);
    }
  });

  // Calculate score out of 100 based on match ratio and length
  const matchRatio = keywords.length > 0 ? matches / keywords.length : 0.5;
  const lengthBonus = Math.min(20, Math.floor(cleanStudent.length / 10)); // up to 20 points bonus for detail
  
  let score = Math.min(100, Math.round(matchRatio * 80 + lengthBonus));

  // Enforce some realistic variation
  if (score < 40 && cleanStudent.length > 20) {
    score = 45; // pity points for trying
  }

  const isCorrect = score >= 70;
  
  let feedback = "";
  if (isCorrect) {
    feedback = `Luar biasa! Jawabanmu menunjukkan pemahaman konsep yang sangat baik. Kamu berhasil menyertakan kata kunci penting seperti "${matchedWords.slice(0, 3).join(", ")}".`;
  } else {
    feedback = `Jawabanmu sudah cukup baik namun kurang spesifik. Cobalah untuk menyertakan lebih banyak istilah teknis atau detail konsep kunci. Pelajari lebih lanjut mengenai penjelasan yang diberikan.`;
  }

  return { score, isCorrect, feedback };
}

export async function POST(req: NextRequest) {
  try {
    const { questions, answers, topic, difficulty } = await req.json();

    if (!questions || !answers || !topic) {
      return NextResponse.json(
        { error: "Parameter (questions, answers, topic) tidak lengkap" },
        { status: 400 }
      );
    }

    try {
      // 1. Attempt Gemini Grading
      const systemPrompt = `You are Ngerti.in AI.
Your task is to grade a student's essay answers for a quiz.

Topic: ${topic}
Difficulty: ${difficulty}

Below are the questions, their sample answers, and what the student answered.
Grade each student answer out of 100 points based on conceptual understanding, keyword matching, and correctness.
A student answer is considered "correct" (isCorrect = true) if it scores 70 points or higher.

Provide constructive feedback for each answer in Indonesian.
At the end, calculate the average finalScore (0-100) and provide a learning recommendation under "recommendation".

Questions and Student Answers:
${questions
  .map(
    (q: any, index: number) => `
Question ${q.id}: ${q.question}
Concept: ${q.concept}
Sample Answer: ${q.correctAnswer}
Student's Answer: ${answers[index] || "[Tidak ada jawaban]"}
---`
  )
  .join("\n")}

Your output MUST be a valid JSON object matching the following structure. Return ONLY raw JSON without markdown wrapping.

JSON Schema:
{
  "finalScore": 85,
  "results": [
    {
      "questionId": 1,
      "score": 85,
      "isCorrect": true,
      "feedback": "Feedback..."
    }
  ],
  "recommendation": "Rekomendasi belajar..."
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
      const gradeData = JSON.parse(responseText);
      return NextResponse.json(gradeData);

    } catch (apiError: any) {
      console.warn("Gemini Grading failed/quota exceeded, utilizing Local Intelligent Essay Grader:", apiError.message);
      
      // 2. Fallback to Local Intelligent Keyword Grading
      const results = questions.map((q: any, index: number) => {
        const userAnswer = answers[index] || "";
        const graded = gradeEssayLocally(q.question, q.correctAnswer, userAnswer);
        return {
          questionId: q.id,
          score: graded.score,
          isCorrect: graded.isCorrect,
          feedback: graded.feedback + " (Penilaian Offline)"
        };
      });

      const totalScore = results.reduce((acc: number, curr: any) => acc + curr.score, 0);
      const finalScore = Math.round(totalScore / questions.length);

      // Generate recommendation based on score and missed concepts
      let recommendation = "";
      const missedConcepts: string[] = [];
      results.forEach((res: any, index: number) => {
        if (!res.isCorrect && questions[index].concept) {
          missedConcepts.push(questions[index].concept);
        }
      });

      if (finalScore >= 80) {
        recommendation = `Pemahamanmu tentang ${topic} luar biasa! Lanjutkan eksplorasi materi tingkat lanjut.`;
      } else if (missedConcepts.length > 0) {
        recommendation = `Pelajari kembali konsep utama mengenai: ${missedConcepts.slice(0, 3).join(", ")}.`;
      } else {
        recommendation = `Lakukan review mendalam pada topik ${topic} dengan AI Study Buddy dan coba latihan soal serupa.`;
      }

      return NextResponse.json({
        finalScore,
        results,
        recommendation: recommendation + " (Offline Mode)"
      });
    }
  } catch (error) {
    console.error("Critical Grade API error:", error);
    return NextResponse.json(
      { error: "Gagal memproses penilaian kuis." },
      { status: 500 }
    );
  }
}
