import { useState } from "react";
import { ArrowRight, BookOpen, Brain, Check, ChevronDown, CircleHelp, FileText, Layers, Sparkles, WandSparkles } from "lucide-react";
import Header from "./components/Header.jsx";
import NotesInput from "./components/NotesInput.jsx";
import SummaryResult from "./components/SummaryResult.jsx";
import QuizPanel from "./components/QuizPanel.jsx";
import FlashcardsPanel from "./components/FlashcardsPanel.jsx";
import { postToApi } from "./services/api.js";

const features = [
  { icon: Sparkles, title: "Smart summaries", description: "Make dense notes easier to understand and revise." },
  { icon: Brain, title: "Practice quizzes", description: "Test your recall with questions based on your notes." },
  { icon: Layers, title: "Quick flashcards", description: "Review key concepts one card at a time." },
];

export default function App() {
  const [activeFeature, setActiveFeature] = useState("summarizer");
  const [notes, setNotes] = useState("");
  const [summaryLength, setSummaryLength] = useState("medium");
  const [language, setLanguage] = useState("English");
  const [summary, setSummary] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [flashcards, setFlashcards] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function navigate(feature) {
    setActiveFeature(feature);
    setError("");
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function runAction(action) {
    if (!notes.trim()) {
      setError("Add or paste your notes before generating study material.");
      document.getElementById("notes")?.focus();
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (action === "summarize") {
        const data = await postToApi("summarize", { text: notes, length: summaryLength, language });
        setSummary(data.summary);
      } else if (action === "quiz") {
        setQuiz(await postToApi("quiz", { text: notes, questionCount: 5 }));
      } else {
        const data = await postToApi("flashcards", { text: notes });
        setFlashcards(data.flashcards);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function clearNotes() {
    setNotes("");
    setSummary(null);
    setQuiz(null);
    setFlashcards(null);
    setError("");
  }

  return (
    <div className="app-shell" id="home">
      <Header activeFeature={activeFeature} onNavigate={navigate} />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="kicker-spark"><Sparkles size={13} /></span> STUDY SMARTER, NOT LONGER</div>
            <h1>Turn Your Notes<br />Into <span>Knowledge.</span></h1>
            <p>Your personal AI study companion. Summarize, practice, and remember the things that matter.</p>
            <a className="hero-link" href="#workspace" onClick={() => setActiveFeature("summarizer")}>Start studying <ArrowRight size={16} /></a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orb orb-one" /><div className="orb orb-two" />
            <div className="hero-paper">
              <div className="paper-top"><span><BookOpen size={14} /> STUDY NOTES</span><span className="paper-status">● ORGANIZED</span></div>
              <div className="paper-line title-line" /><div className="paper-line" /><div className="paper-line short-line" />
              <div className="paper-highlight"><Sparkles size={14} /><span>Key ideas, made clear.</span></div>
              <div className="paper-line" /><div className="paper-line medium-line" />
              <div className="paper-footer"><span>StudyAI summary</span><span>01 — 04</span></div>
            </div>
            <div className="floating-chip"><span><Check size={13} /></span> Ready to revise</div>
          </div>
          <div className="hero-bottom-note"><span className="status-dot" /> YOUR NOTES, ORGANIZED</div>
        </section>

        <section className="workspace-wrap" id="workspace">
          <div className="section-intro">
            <div><span className="eyebrow">YOUR STUDY DESK</span><h2>What are we learning today?</h2></div>
            <span className="private-note"><span className="status-dot" /> Private by design</span>
          </div>
          <div className="workspace-grid">
            <div className="workspace-left">
              <NotesInput text={notes} setText={setNotes} busy={busy} onError={setError} onClear={clearNotes} />
              {error && <div className="error-message" role="alert"><CircleHelp size={17} /><span>{error}</span></div>}
              {activeFeature === "summarizer" && (
                <section className="panel options-panel">
                  <div className="panel-heading options-heading">
                    <div><span className="eyebrow">MAKE IT YOURS</span><h2>Summary settings</h2></div>
                    <span className="step-pill">02 <span>OPTIONS</span></span>
                  </div>
                  <div className="option-row">
                    <fieldset className="choice-group">
                      <legend>Summary length</legend>
                      <div className="segmented-control">
                        {["short", "medium", "detailed"].map((item) => (
                          <button key={item} className={summaryLength === item ? "selected" : ""} onClick={() => setSummaryLength(item)}>{item[0].toUpperCase() + item.slice(1)}</button>
                        ))}
                      </div>
                    </fieldset>
                    <label className="language-select">Language
                      <span className="select-wrap"><select value={language} onChange={(event) => setLanguage(event.target.value)}><option>English</option><option>Hindi</option></select><ChevronDown size={15} /></span>
                    </label>
                  </div>
                  <button className="button button-primary generate-button" onClick={() => runAction("summarize")} disabled={busy}>
                    {busy ? <span className="spin-ring" /> : <WandSparkles size={17} />}
                    {busy ? "Creating your summary..." : "Generate summary"}
                    {!busy && <ArrowRight size={17} className="button-arrow" />}
                  </button>
                </section>
              )}
              {activeFeature === "quiz" && <QuizPanel quiz={quiz} loading={busy} onGenerate={() => runAction("quiz")} />}
              {activeFeature === "flashcards" && <FlashcardsPanel cards={flashcards} loading={busy} onGenerate={() => runAction("flashcards")} />}
            </div>
            <div className="workspace-right">
              {activeFeature === "summarizer" ? (
                summary
                  ? <SummaryResult summary={summary} onRegenerate={() => runAction("summarize")} busy={busy} onError={setError} />
                  : <div className="panel empty-result">
                    <div className="empty-illustration"><div className="empty-doc"><span /><span /><span /><b><Sparkles size={15} /></b></div></div>
                    <span className="eyebrow">YOUR RESULTS</span>
                    <h3>Your clarity starts here.</h3>
                    <p>Add your notes and generate a summary. Your study guide will appear right here.</p>
                    <div className="empty-steps"><span><i>1</i> Add notes</span><span><i>2</i> Choose a style</span><span><i>3</i> Start revising</span></div>
                    <span className="empty-scribble">made for curious minds <Sparkles size={12} /></span>
                  </div>
              ) : (
                <div className="panel context-panel">
                  <div className="context-icon">{activeFeature === "quiz" ? <Brain size={20} /> : <Layers size={20} />}</div>
                  <span className="eyebrow">BUILT FROM YOUR NOTES</span>
                  <h3>{activeFeature === "quiz" ? "Learn by doing." : "Small cards. Big ideas."}</h3>
                  <p>{activeFeature === "quiz" ? "Every question is generated from the notes you provide, with explanations to help concepts stick." : "Your cards focus on the important concepts in your material. Shuffle the deck to mix up your revision."}</p>
                  <div className="context-tip"><FileText size={15} /><span>Tip: add clear, detailed notes for the most useful study set.</span></div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="features-section" id="about">
          <div className="features-heading"><span className="eyebrow">A BETTER WAY TO STUDY</span><h2>Make every study session count.</h2><p>Less time organizing. More time understanding.</p></div>
          <div className="feature-cards">
            {features.map(({ icon: Icon, title, description }, index) => (
              <article className="feature-card" key={title}>
                <span className={`feature-icon feature-${index}`}><Icon size={19} /></span>
                <span className="feature-number">0{index + 1}</span>
                <h3>{title}</h3><p>{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="footer"><a className="brand footer-brand" href="#home"><span className="brand-mark"><BookOpen size={17} /></span><span>Study<span className="brand-accent">AI</span></span></a><span>Learn with clarity. Built for students.</span><span>© 2026 StudyAI</span></footer>
    </div>
  );
}
