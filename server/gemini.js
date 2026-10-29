import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.6-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("AI is not configured yet. Add GEMINI_API_KEY to server/.env.");
    error.status = 503;
    throw error;
  }

  return new GoogleGenAI({ apiKey });
}

function extractJson(response) {
  const text = response.text?.trim();
  if (!text) {
    throw new Error("The AI returned an empty response. Please try again.");
  }

  const json = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(json);
  } catch {
    throw new Error("The AI returned an unreadable response. Please try again.");
  }
}

async function generateJson(prompt) {
  const client = getClient();
  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    return extractJson(response);
  } catch (error) {
    if (error.status === 503 || error.message?.startsWith("The AI returned")) {
      throw error;
    }

    const status = Number(error.status ?? error.code);
    if (status === 429) {
      const rateLimitError = new Error("Gemini is rate-limiting requests. Please wait a moment and try again.");
      rateLimitError.status = 429;
      throw rateLimitError;
    }

    console.error("Gemini request failed:", error.message);
    const apiError = new Error("The AI service could not complete this request. Please try again shortly.");
    apiError.status = 502;
    throw apiError;
  }
}

export async function createSummary(text, length, language) {
  const detail = {
    short: "Give a compact summary with 3-5 concise points.",
    medium: "Give a balanced summary with enough detail to revise the main ideas.",
    detailed: "Give a thorough, well-organized summary that preserves important nuance.",
  }[length];

  return generateJson(`You are a careful study assistant. Summarize only the supplied notes in ${language}.
Preserve their meaning, facts, definitions, formulas, dates, and technical terminology. Do not invent facts.
${detail} Return only valid JSON with this shape:
{"title":"string","overview":"string","sections":[{"heading":"string","points":["string"]}],"keyTakeaways":["string"],"importantTerms":[{"term":"string","definition":"string"}]}
Notes:
${text}`);
}

export async function createQuiz(text, questionCount) {
  return generateJson(`Create exactly ${questionCount} distinct multiple-choice study questions using only these notes.
Each question must have exactly four plausible options, one unambiguous correct answer, and a concise explanation.
Return only valid JSON with this shape:
{"questions":[{"question":"string","options":["string","string","string","string"],"correctAnswerIndex":0,"explanation":"string"}]}
Notes:
${text}`);
}

export async function createFlashcards(text) {
  return generateJson(`Create 8 useful study flashcards based only on these notes. Keep each question clear and each answer concise.
Return only valid JSON with this shape:
{"flashcards":[{"question":"string","answer":"string"}]}
Notes:
${text}`);
}
