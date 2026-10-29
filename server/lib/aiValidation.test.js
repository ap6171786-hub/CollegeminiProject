import test from "node:test";
import assert from "node:assert/strict";
import { isFlashcards, isQuiz, isSummary } from "./aiValidation.js";

test("summary response validation checks all rendered fields", () => {
  const summary = {
    title: "Cells",
    overview: "An overview",
    sections: [{ heading: "Structure", points: ["Membrane"] }],
    keyTakeaways: ["Cells are basic units"],
    importantTerms: [{ term: "Cell", definition: "Basic unit of life" }],
  };
  assert.equal(isSummary(summary), true);
  assert.equal(isSummary({ ...summary, sections: [{ heading: "Structure", points: [1] }] }), false);
});

test("quiz response validation requires the requested number of four-option questions", () => {
  const quiz = {
    questions: [{
      question: "What is a cell?",
      options: ["Unit", "Tissue", "Organ", "System"],
      correctAnswerIndex: 0,
      explanation: "Cells are the basic units of life.",
    }],
  };
  assert.equal(isQuiz(quiz, 1), true);
  assert.equal(isQuiz(quiz, 2), false);
  assert.equal(isQuiz({
    questions: [{ ...quiz.questions[0], options: ["Only one"] }],
  }, 1), false);
});

test("flashcard response validation requires usable question and answer pairs", () => {
  assert.equal(isFlashcards({ flashcards: [{ question: "Q?", answer: "A." }] }), true);
  assert.equal(isFlashcards({ flashcards: [] }), false);
  assert.equal(isFlashcards({ flashcards: [{ question: "Q?" }] }), false);
});
