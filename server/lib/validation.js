export const MAX_NOTES_LENGTH = 50000;

export function validateNotesRequest(body) {
  const { text } = body ?? {};

  if (typeof text !== "string" || text.trim().length === 0) {
    return { error: "Please provide notes before continuing." };
  }

  if (text.length > MAX_NOTES_LENGTH) {
    return { error: `Notes must be ${MAX_NOTES_LENGTH.toLocaleString()} characters or fewer.` };
  }

  return { text: text.trim() };
}

export function validateSummaryOptions(body) {
  const { length = "medium", language = "English" } = body ?? {};
  const lengths = ["short", "medium", "detailed"];
  const languages = ["English", "Hindi"];

  if (!lengths.includes(length)) {
    return { error: "Summary length must be short, medium, or detailed." };
  }

  if (!languages.includes(language)) {
    return { error: "Summary language must be English or Hindi." };
  }

  return { length, language };
}

export function validateQuestionCount(value) {
  const questionCount = value ?? 5;

  if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > 10) {
    return { error: "Question count must be a whole number from 1 to 10." };
  }

  return { questionCount };
}
