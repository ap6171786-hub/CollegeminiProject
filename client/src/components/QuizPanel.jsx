import { useEffect, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";

export default function QuizPanel({ quiz, loading, onGenerate }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
  }, [quiz]);

  function retry() {
    setAnswers({});
    setSubmitted(false);
  }

  if (!quiz) {
    return (
      <section className="panel activity-panel">
        <div className="activity-icon quiz-icon"><CheckCircle2 size={22} /></div>
        <span className="eyebrow">ACTIVE RECALL</span>
        <h2>Make your notes a quiz</h2>
        <p>Practice what you know with multiple-choice questions written from your study material.</p>
        <button className="button button-primary" onClick={onGenerate} disabled={loading}>
          {loading ? <span className="spin-ring" /> : <CheckCircle2 size={17} />}
          {loading ? "Creating your quiz..." : "Generate quiz"}
        </button>
      </section>
    );
  }

  const score = quiz.questions.reduce(
    (total, question, index) => total + (answers[index] === question.correctAnswerIndex ? 1 : 0),
    0,
  );

  return (
    <section className="panel quiz-panel">
      <div className="panel-heading quiz-heading">
        <div><span className="eyebrow">ACTIVE RECALL</span><h2>Your practice quiz</h2></div>
        <span className="step-pill">{quiz.questions.length} <span>QUESTIONS</span></span>
      </div>
      {submitted && <div className="score-banner">You scored <strong>{score} / {quiz.questions.length}</strong><span>{score === quiz.questions.length ? "Perfect recall!" : "Review the explanations below."}</span></div>}
      <div className="questions">
        {quiz.questions.map((question, index) => (
          <article className="question-card" key={`${question.question}-${index}`}>
            <h3><span>{String(index + 1).padStart(2, "0")}</span>{question.question}</h3>
            <div className="options-list">
              {question.options.map((option, optionIndex) => {
                const isCorrect = optionIndex === question.correctAnswerIndex;
                const isSelected = answers[index] === optionIndex;
                const resultClass = submitted ? (isCorrect ? "correct" : isSelected ? "incorrect" : "") : "";
                return (
                  <label className={`quiz-option ${isSelected ? "selected" : ""} ${resultClass}`} key={`${option}-${optionIndex}`}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optionIndex}
                      checked={isSelected}
                      disabled={submitted}
                      onChange={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))}
                    />
                    <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
            {submitted && <p className="explanation"><strong>Why:</strong> {question.explanation}</p>}
          </article>
        ))}
      </div>
      {submitted ? (
        <button className="button button-light" onClick={retry}><RotateCcw size={16} /> Retry quiz</button>
      ) : (
        <button className="button button-primary" onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length !== quiz.questions.length}>
          Submit answers
        </button>
      )}
    </section>
  );
}
