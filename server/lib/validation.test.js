import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_NOTES_LENGTH,
  validateNotesRequest,
  validateQuestionCount,
  validateSummaryOptions,
} from "./validation.js";

test("notes validation rejects blank and oversized input", () => {
  assert.match(validateNotesRequest({ text: "  " }).error, /provide notes/i);
  assert.match(validateNotesRequest({ text: "x".repeat(MAX_NOTES_LENGTH + 1) }).error, /characters/i);
  assert.equal(validateNotesRequest({ text: "  Biology notes  " }).text, "Biology notes");
});

test("summary options accept supported values and reject unsupported values", () => {
  assert.deepEqual(validateSummaryOptions({ length: "short", language: "Hindi" }), {
    length: "short",
    language: "Hindi",
  });
  assert.match(validateSummaryOptions({ length: "huge" }).error, /length/i);
  assert.match(validateSummaryOptions({ language: "French" }).error, /language/i);
});

test("question count is limited to one through ten whole questions", () => {
  assert.equal(validateQuestionCount().questionCount, 5);
  assert.equal(validateQuestionCount(10).questionCount, 10);
  assert.match(validateQuestionCount(0).error, /whole number/i);
  assert.match(validateQuestionCount(2.5).error, /whole number/i);
});
