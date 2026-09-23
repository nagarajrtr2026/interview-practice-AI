export const FILLER_WORDS = [
  "um",
  "uh",
  "like",
  "actually",
  "basically",
  "you know",
  "literally",
  "honestly",
  "sort of",
  "kind of",
];

export type FillerStats = {
  totalWords: number;
  characters: number;
  fillerCount: number;
  fillerRate: number;
  breakdown: Record<string, number>;
};

export function analyzeFillers(text: string): FillerStats {
  const clean = text.trim();
  const words = clean.length ? clean.split(/\s+/) : [];
  const lower = ` ${clean.toLowerCase().replace(/[^a-z\s']/g, " ").replace(/\s+/g, " ")} `;
  const breakdown: Record<string, number> = {};
  let fillerCount = 0;

  for (const filler of FILLER_WORDS) {
    const matches = lower.match(new RegExp(`(?<=\\s)${filler}(?=\\s)`, "g"));
    if (matches?.length) {
      breakdown[filler] = matches.length;
      fillerCount += matches.length;
    }
  }

  return {
    totalWords: words.length,
    characters: text.length,
    fillerCount,
    fillerRate: words.length ? Number(((fillerCount / words.length) * 100).toFixed(1)) : 0,
    breakdown,
  };
}

export const SAMPLE_QUESTIONS = [
  "Tell me about yourself.",
  "Describe a challenging bug you fixed.",
  "Why do you want to work here?",
  "How do you handle tight deadlines?",
  "Tell me about a time you disagreed with a teammate.",
  "What is your greatest professional strength?",
];

export const MODELS = [
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B (recommended)" },
  { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B" },
  { id: "qwen/qwen3-32b", label: "Qwen3 32B" },
];

export function getSessionId(): string {
  if (typeof window === "undefined") return "demo";
  let id = window.localStorage.getItem("interviewai-session");
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem("interviewai-session", id);
  }
  return id;
}

export function getModel(): string {
  if (typeof window === "undefined") return MODELS[0]!.id;
  const stored = window.localStorage.getItem("interviewai-model");
  const model = MODELS.some((candidate) => candidate.id === stored) ? stored : null;
  if (!model) window.localStorage.setItem("interviewai-model", MODELS[0]!.id);
  return model ?? MODELS[0]!.id;
}

export function scoreTone(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
