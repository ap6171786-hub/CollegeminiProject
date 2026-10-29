import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Layers, Shuffle } from "lucide-react";

export default function FlashcardsPanel({ cards, loading, onGenerate }) {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [deck, setDeck] = useState(cards);

  useEffect(() => {
    setDeck(cards);
    setIndex(0);
    setShowAnswer(false);
  }, [cards]);

  if (!cards) {
    return (
      <section className="panel activity-panel">
        <div className="activity-icon flash-icon"><Layers size={22} /></div>
        <span className="eyebrow">QUICK REVISION</span>
        <h2>Study one idea at a time</h2>
        <p>Turn key concepts into a set of question-and-answer cards you can move through at your own pace.</p>
        <button className="button button-primary" onClick={onGenerate} disabled={loading}>
          {loading ? <span className="spin-ring" /> : <Layers size={17} />}
          {loading ? "Creating flashcards..." : "Create flashcards"}
        </button>
      </section>
    );
  }

  const card = deck[index];
  function changeCard(nextIndex) {
    setIndex((nextIndex + deck.length) % deck.length);
    setShowAnswer(false);
  }
  function shuffle() {
    const shuffled = [...deck];
    for (let position = shuffled.length - 1; position > 0; position -= 1) {
      const randomIndex = Math.floor(Math.random() * (position + 1));
      [shuffled[position], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[position]];
    }
    setDeck(shuffled);
    setIndex(0);
    setShowAnswer(false);
  }

  return (
    <section className="panel flashcards-panel">
      <div className="panel-heading">
        <div><span className="eyebrow">QUICK REVISION</span><h2>Your flashcards</h2></div>
        <button className="button button-light shuffle-button" onClick={shuffle}><Shuffle size={15} /> Shuffle</button>
      </div>
      <div className={`flashcard ${showAnswer ? "revealed" : ""}`} onClick={() => setShowAnswer((visible) => !visible)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setShowAnswer((visible) => !visible); }}>
        <span className="flashcard-label">{showAnswer ? "ANSWER" : "QUESTION"}</span>
        <p>{showAnswer ? card.answer : card.question}</p>
        <small>{showAnswer ? "Click to see question" : "Click to reveal answer"}</small>
      </div>
      <div className="card-navigation">
        <button className="icon-button outlined" aria-label="Previous flashcard" onClick={() => changeCard(index - 1)}><ArrowLeft size={18} /></button>
        <span>{String(index + 1).padStart(2, "0")} <i>/</i> {String(deck.length).padStart(2, "0")}</span>
        <button className="icon-button outlined" aria-label="Next flashcard" onClick={() => changeCard(index + 1)}><ArrowRight size={18} /></button>
      </div>
      <button className="button button-primary reveal-button" onClick={() => setShowAnswer((visible) => !visible)}>
        {showAnswer ? "Show question" : "Show answer"}
      </button>
    </section>
  );
}
