import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./app.js";

async function withServer(run) {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("health endpoint reports readiness without exposing credentials", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      success: true,
      status: "ok",
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });
});

test("AI endpoints reject empty notes and invalid options", async () => {
  await withServer(async (baseUrl) => {
    const empty = await fetch(`${baseUrl}/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "  " }),
    });
    assert.equal(empty.status, 400);
    assert.match((await empty.json()).error, /provide notes/i);

    const badOptions = await fetch(`${baseUrl}/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Cell notes", length: "extreme" }),
    });
    assert.equal(badOptions.status, 400);
    assert.match((await badOptions.json()).error, /length/i);

    const badCount = await fetch(`${baseUrl}/api/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Cell notes", questionCount: 20 }),
    });
    assert.equal(badCount.status, 400);
    assert.match((await badCount.json()).error, /question count/i);
  });
});

test("valid AI requests fail clearly when Gemini credentials are missing", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/flashcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Cell notes" }),
      });
      assert.equal(response.status, 503);
      assert.match((await response.json()).error, /GEMINI_API_KEY/);
    });
  } finally {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});
