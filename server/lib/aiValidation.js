export function isSummary(value) {
  return value
    && typeof value.title === "string"
    && typeof value.overview === "string"
    && Array.isArray(value.sections)
    && value.sections.every((section) => (
      typeof section.heading === "string"
      && Array.isArray(section.points)
      && section.points.every((point) => typeof point === "string")
    ))
    && Array.isArray(value.keyTakeaways)
    && value.keyTakeaways.every((item) => typeof item === "string")
    && Array.isArray(value.importantTerms)
    && value.importantTerms.every((term) => (
      typeof term.term === "string" && typeof term.definition === "string"
    ));
}

export function isQuiz(value, expectedCount) {
  return value
    && Array.isArray(value.questions)
    && value.questions.length === expectedCount
    && value.questions.every((item) => (
      typeof item.question === "string"
      && Array.isArray(item.options)
      && item.options.length === 4
      && item.options.every((option) => typeof option === "string")
      && Number.isInteger(item.correctAnswerIndex)
      && item.correctAnswerIndex >= 0
      && item.correctAnswerIndex < 4
      && typeof item.explanation === "string"
    ));
}

export function isFlashcards(value) {
  return value
    && Array.isArray(value.flashcards)
    && value.flashcards.length > 0
    && value.flashcards.every((card) => (
      typeof card.question === "string" && typeof card.answer === "string"
    ));
}
