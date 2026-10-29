# StudyAI — AI-Based Notes Summarizer

StudyAI is a student study desk that turns notes into an AI-generated summary, multiple-choice quiz, or flashcard deck. The React app talks to a small Express API; Gemini credentials are read only by the server.

## Features

- Short, medium, and detailed summaries in English or Hindi, with an overview, organized sections, key takeaways, and important terms.
- Quiz generation from your notes, with four options per question, answer explanations, scoring, and retry.
- AI-generated flashcards with answer reveal, previous/next navigation, and shuffle.
- PDF text extraction for selectable-text PDFs (up to 10 MB). Extracted content is shown in the notes editor for review before it is sent to the API.
- Responsive interface, copy/download summary actions, request loading states, and clear API/PDF error messages.

Scanned/image-only PDFs are not OCR-processed. PDF extraction happens in the browser; only the resulting text is sent to the backend.

## Technologies

React 18, Vite, Tailwind CSS 4, Lucide React, pdfjs-dist, Node.js, Express 5, and the official Google Gen AI JavaScript SDK (`@google/genai`).

## Project structure

```text
client/
  src/
    components/       Reusable notes, summary, quiz, flashcard, and navigation UI
    services/api.js    Frontend API requests
    utils/pdf.js       Browser PDF text extraction
    App.jsx            Application state and workspace
    index.css          Responsive styling and Tailwind entry point
  vite.config.js       Development API proxy
server/
  app.js               Express routes, validation, and error handling
  gemini.js            Gemini prompts and response parsing
  index.js             Environment loading and server startup
  lib/                  Request and AI response validation
  .env.example         Server environment template
package.json           Root development/build/test commands
```

## Prerequisites

- Node.js 20 or later and npm.
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) for live AI generation.

## Install and configure (Windows PowerShell)

From the repository root:

```powershell
npm install
npm install --prefix client
npm install --prefix server
Copy-Item server\.env.example server\.env
```

Open `server\.env` and set your key:

```dotenv
GEMINI_API_KEY=your_actual_gemini_api_key
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

Keep the key in `server\.env` only. It is ignored by Git; do not put it in a `VITE_` variable, frontend file, or commit. The app uses Google's stable `gemini-3.6-flash` model. Gemini availability, quota, and billing depend on your Google AI Studio account.

## Run locally

From the repository root, start the Vite frontend and Express API together:

```powershell
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API listens at [http://localhost:5000](http://localhost:5000); Vite proxies `/api` requests to it. To run processes separately, use `npm run dev --prefix server` and `npm run dev --prefix client` in two terminals.

## API

All endpoints return JSON. AI endpoints accept `text` up to 50,000 characters.

| Method and path | Request | Success response |
|---|---|---|
| `GET /api/health` | — | `{"success":true,"status":"ok","aiConfigured":true}` |
| `POST /api/summarize` | `{"text":"...","length":"medium","language":"English"}` | `{"success":true,"data":{"summary":{"title":"...","overview":"...","sections":[],"keyTakeaways":[],"importantTerms":[]}}}` |
| `POST /api/quiz` | `{"text":"...","questionCount":5}` | `{"success":true,"data":{"questions":[{"question":"...","options":["A","B","C","D"],"correctAnswerIndex":0,"explanation":"..."}]}}` |
| `POST /api/flashcards` | `{"text":"..."}` | `{"success":true,"data":{"flashcards":[{"question":"...","answer":"..."}]}}` |

Validation errors return HTTP 400; missing Gemini credentials return 503; rate limiting returns 429; upstream or invalid AI responses return a meaningful error response. AI output is checked before it is sent to the client. The API allows the configured `CLIENT_ORIGIN` and limits AI calls to 20 requests per minute per client.

## Tests and build

```powershell
npm test
npm run build
```

The server tests exercise request validation, generated-response validation, health, API input errors, and missing-credential handling. Configure a real Gemini key and run the app to test live generation; these automated tests do not call Gemini.

## Common issues and limitations

- **AI is not configured:** create `server\.env` from the example and add a valid `GEMINI_API_KEY`, then restart the server.
- **Backend unavailable:** run `npm run dev` from the root and confirm port 5000 is free.
- **PDF has no selectable text:** scanned PDFs need OCR, which is not included. Open the PDF with a text-selectable source or paste notes manually.
- **Unsupported/corrupted PDF:** use a valid PDF no larger than 10 MB.
- **Quota or network errors:** check Google AI Studio access/quota and retry later.

No database, account system, or server-side PDF storage is used. Notes remain in browser memory during the session; clearing or reloading the page removes them.
