export const RESUME_KEY = "interviewai-resume";
export const ROLE_KEY = "interviewai-role";

export function loadResume(): { resume: string; role: string } {
  if (typeof window === "undefined") return { resume: "", role: "" };
  return {
    resume: window.localStorage.getItem(RESUME_KEY) ?? "",
    role: window.localStorage.getItem(ROLE_KEY) ?? "",
  };
}

export function saveResume(resume: string, role: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESUME_KEY, resume);
  window.localStorage.setItem(ROLE_KEY, role);
}

/** Extracts plain text from an uploaded resume file (PDF or plain text). */
export async function extractResumeText(file: File): Promise<string> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return (await file.text()).trim();

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = (
    await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
  ).default;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim(),
    );
  }
  return pages.join("\n\n").trim();
}
