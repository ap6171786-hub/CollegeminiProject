export async function postToApi(path, body) {
  let response;
  try {
    response = await fetch(`/api/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach StudyAI. Make sure the backend is running on port 5000.");
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The server returned an unreadable response. Please try again.");
  }

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "The request could not be completed.");
  }

  return payload.data;
}
