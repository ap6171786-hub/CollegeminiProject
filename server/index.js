import "dotenv/config";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 5000);

createApp().listen(port, () => {
  console.log(`StudyAI API is running at http://localhost:${port}`);
});
