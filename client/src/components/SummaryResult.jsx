import { useState } from "react";
import { Check, Clipboard, Download, RefreshCw, Sparkles } from "lucide-react";

function summaryText(summary) {
  return [
    summary.title,
    summary.overview,
    ...summary.sections.flatMap((section) => [section.heading, ...section.points.map((point) => `• ${point}`)]),
    "Key takeaways",
    ...summary.keyTakeaways.map((item) => `• ${item}`),
    "Important terms",
    ...summary.importantTerms.map(({ term, definition }) => `• ${term}: ${definition}`),
  ].join("\n\n");
}

export default function SummaryResult({ summary, onRegenerate, busy, onError }) {
  const [copied, setCopied] = useState(false);

  async function copySummary() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard access is unavailable in this browser.");
      await navigator.clipboard.writeText(summaryText(summary));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      onError(error.message || "Could not copy the summary.");
    }
  }

  function downloadSummary() {
    const url = URL.createObjectURL(new Blob([summaryText(summary)], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "studyai-summary.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="panel result-panel" aria-live="polite">
      <div className="result-topline">
        <span className="eyebrow"><Sparkles size={13} /> YOUR AI SUMMARY</span>
        <span className="result-badge">READY TO REVIEW</span>
      </div>
      <h2 className="result-title">{summary.title}</h2>
      <p className="result-overview">{summary.overview}</p>
      {summary.sections.map((section, index) => (
        <div className="summary-section" key={`${section.heading}-${index}`}>
          <h3>{section.heading}</h3>
          <ul>{section.points.map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}</ul>
        </div>
      ))}
      <div className="takeaway-box">
        <h3>Key takeaways</h3>
        <ul>{summary.keyTakeaways.map((item, index) => <li key={index}>{item}</li>)}</ul>
      </div>
      {summary.importantTerms.length > 0 && (
        <div className="terms-block">
          <h3>Important terms</h3>
          <div className="term-list">
            {summary.importantTerms.map(({ term, definition }, index) => (
              <p key={`${term}-${index}`}><strong>{term}</strong><span>{definition}</span></p>
            ))}
          </div>
        </div>
      )}
      <div className="result-actions">
        <button className="button button-light" onClick={copySummary}><>{copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? "Copied" : "Copy"}</></button>
        <button className="button button-light" onClick={downloadSummary}><Download size={16} /> Download .txt</button>
        <button className="button button-quiet" onClick={onRegenerate} disabled={busy}><RefreshCw size={15} className={busy ? "spin" : ""} /> Regenerate</button>
      </div>
    </section>
  );
}
