import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export const MAX_PDF_SIZE = 10 * 1024 * 1024;

export async function extractPdfText(file) {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Choose a PDF file to upload.");
  }
  if (file.size > MAX_PDF_SIZE) {
    throw new Error("This PDF is larger than 10 MB. Choose a smaller file.");
  }
  if (file.size === 0) {
    throw new Error("This PDF file is empty.");
  }

  try {
    const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages = await Promise.all(
      Array.from({ length: document.numPages }, async (_item, index) => {
        const page = await document.getPage(index + 1);
        const content = await page.getTextContent();
        return content.items
          .filter((item) => "str" in item)
          .map((item) => item.str)
          .join(" ");
      }),
    );
    const text = pages.join("\n\n").replace(/[ \t]+/g, " ").trim();
    if (!text) {
      throw new Error("No selectable text was found. This may be a scanned PDF; OCR is not supported.");
    }
    return text;
  } catch (error) {
    if (error.message?.includes("No selectable text")) throw error;
    throw new Error("This PDF could not be read. It may be corrupted, encrypted, or invalid.");
  }
}
