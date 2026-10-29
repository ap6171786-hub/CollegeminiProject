import { useRef, useState } from "react";
import { FileText, LoaderCircle, UploadCloud, X } from "lucide-react";

const MAX_NOTES_LENGTH = 50000;
const MAX_PDF_SIZE = 10 * 1024 * 1024;

export default function NotesInput({
  text,
  setText,
  busy,
  onError,
  onClear,
}) {
  const fileInput = useRef(null);
  const [fileName, setFileName] = useState("");
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function loadFile(file) {
    if (!file) return;
    setReading(true);
    onError("");
    try {
      const { extractPdfText } = await import("../utils/pdf.js");
      const extracted = await extractPdfText(file);
      setText(extracted.slice(0, MAX_NOTES_LENGTH));
      setFileName(file.name);
      if (extracted.length > MAX_NOTES_LENGTH) {
        onError("The PDF text was truncated to 50,000 characters.");
      }
    } catch (error) {
      onError(error.message);
    } finally {
      setReading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <section className="panel input-panel" aria-labelledby="notes-heading">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">YOUR STUDY MATERIAL</span>
          <h2 id="notes-heading">Add your notes</h2>
        </div>
        <span className="step-pill">01 <span>INPUT</span></span>
      </div>
      <label className="sr-only" htmlFor="notes">Paste your study notes</label>
      <textarea
        id="notes"
        className="notes-area"
        maxLength={MAX_NOTES_LENGTH}
        placeholder="Paste your lecture notes, textbook excerpts, or study material here..."
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setFileName("");
          onError("");
        }}
        disabled={busy || reading}
      />
      <div className="editor-meta">
        <span>{text.length.toLocaleString()} / {MAX_NOTES_LENGTH.toLocaleString()} characters</span>
        {text && (
          <button className="text-button" onClick={onClear} disabled={busy || reading}>Clear notes</button>
        )}
      </div>
      <input
        ref={fileInput}
        className="sr-only"
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => loadFile(event.target.files?.[0])}
        aria-label="Choose a PDF file"
      />
      <button
        className={`upload-zone ${dragging ? "dragging" : ""}`}
        type="button"
        disabled={busy || reading}
        onClick={() => fileInput.current?.click()}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          loadFile(event.dataTransfer.files?.[0]);
        }}
      >
        <span className="upload-icon">{reading ? <LoaderCircle className="spin" size={19} /> : <UploadCloud size={19} />}</span>
        <span className="upload-copy">
          <strong>{reading ? "Reading PDF..." : fileName || "Upload a PDF"}</strong>
          <small>{fileName ? "Text extracted — review it above before continuing" : `Drop it here or browse · text PDFs · up to ${MAX_PDF_SIZE / 1024 / 1024} MB`}</small>
        </span>
        {fileName && <FileText size={18} className="file-indicator" />}
      </button>
      <div className="input-footnote">
        <span><FileText size={14} /> Your notes stay in this session</span>
        {fileName && <button className="icon-button" aria-label="Remove PDF name" onClick={() => setFileName("")}><X size={15} /></button>}
      </div>
    </section>
  );
}
