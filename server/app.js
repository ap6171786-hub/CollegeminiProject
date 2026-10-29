import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createFlashcards, createQuiz, createSummary } from "./gemini.js";
import { isFlashcards, isQuiz, isSummary } from "./lib/aiValidation.js";
import {
  validateNotesRequest,
  validateQuestionCount,
  validateSummaryOptions,
} from "./lib/validation.js";

const asyncRoute = (handler) => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

function sendError(response, message) {
  return response.status(400).json({ success: false, error: message });
}

export function createApp() {
  const app = express();
  const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: "1mb" }));

  const aiLimiter = rateLimit({
    windowMs: 60_000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, error: "Too many AI requests. Please wait a minute and try again." },
  });

  app.get("/api/health", (_request, response) => {
    response.json({ success: true, status: "ok", aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
  });

  app.post("/api/summarize", aiLimiter, asyncRoute(async (request, response) => {
    const notes = validateNotesRequest(request.body);
    if (notes.error) return sendError(response, notes.error);
    const options = validateSummaryOptions(request.body);
    if (options.error) return sendError(response, options.error);

    const summary = await createSummary(notes.text, options.length, options.language);
    if (!isSummary(summary)) {
      const error = new Error("The AI returned an incomplete summary. Please try again.");
      error.status = 502;
      throw error;
    }
    return response.json({ success: true, data: { summary } });
  }));

  app.post("/api/quiz", aiLimiter, asyncRoute(async (request, response) => {
    const notes = validateNotesRequest(request.body);
    if (notes.error) return sendError(response, notes.error);
    const count = validateQuestionCount(request.body?.questionCount);
    if (count.error) return sendError(response, count.error);

    const quiz = await createQuiz(notes.text, count.questionCount);
    if (!isQuiz(quiz, count.questionCount)) {
      const error = new Error("The AI returned invalid quiz questions. Please try again.");
      error.status = 502;
      throw error;
    }
    return response.json({ success: true, data: quiz });
  }));

  app.post("/api/flashcards", aiLimiter, asyncRoute(async (request, response) => {
    const notes = validateNotesRequest(request.body);
    if (notes.error) return sendError(response, notes.error);

    const result = await createFlashcards(notes.text);
    if (!isFlashcards(result)) {
      const error = new Error("The AI returned invalid flashcards. Please try again.");
      error.status = 502;
      throw error;
    }
    return response.json({ success: true, data: result });
  }));

  app.use((error, _request, response, _next) => {
    const status = error.status === 413 ? 413 : (error.status >= 400 && error.status < 600 ? error.status : 500);
    const message = status === 413
      ? "The request is too large. Shorten your notes and try again."
      : (status === 500 ? "An unexpected server error occurred." : error.message);
    if (status === 500) console.error("Request failed:", error.message);
    response.status(status).json({ success: false, error: message });
  });

  return app;
}
