import { BookOpen, Brain, Layers, Sparkles } from "lucide-react";

const links = [
  { id: "summarizer", label: "Summarizer", icon: Sparkles },
  { id: "quiz", label: "Quiz", icon: Brain },
  { id: "flashcards", label: "Flashcards", icon: Layers },
];

export default function Header({ activeFeature, onNavigate }) {
  return (
    <header className="topbar">
      <a className="brand" href="#home" onClick={() => onNavigate("summarizer")} aria-label="StudyAI home">
        <span className="brand-mark"><BookOpen size={20} /></span>
        <span>Study<span className="brand-accent">AI</span></span>
      </a>
      <nav className="nav-links" aria-label="Main navigation">
        {links.map(({ id, label, icon: Icon }) => (
          <button
            className={`nav-link ${activeFeature === id ? "active" : ""}`}
            key={id}
            onClick={() => onNavigate(id)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
        <a className="nav-link" href="#about"><span className="about-dot">i</span> About</a>
      </nav>
      <span className="topbar-note"><span className="status-dot" /> Your AI study space</span>
    </header>
  );
}
