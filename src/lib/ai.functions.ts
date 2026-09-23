import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";

const AnalysisSchema = z.object({
  overall_score: z.number(),
  relevance: z.number(),
  technical: z.number(),
  communication: z.number(),
  confidence: z.number(),
  clarity: z.number(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  tips: z.array(z.string()),
  improved_answer: z.string(),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

export const ALLOWED_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3-32b",
];

const DEFAULT_MODEL = "openai/gpt-oss-120b";

function pickModel(requested?: string) {
  return ALLOWED_MODELS.includes(requested ?? "") ? (requested as string) : DEFAULT_MODEL;
}

function groqKey() {
  const key = process.env["GROQ_API_KEY"];
  if (!key) {
    throw new Error(
      "Groq is not configured yet. Add your free Groq API key in the project secrets to enable AI features.",
    );
  }
  return key;
}

function groqProvider(key: string) {
  return createOpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: key,
    name: "groq",
  });
}

function extractJson(raw: string): unknown {
  const cleaned = raw
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/```json/gi, "```")
    .trim();
  const fenced = cleaned.match(/```([\s\S]*?)```/);
  const body = fenced?.[1] ?? cleaned;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The AI returned an unexpected response.");
  return JSON.parse(body.slice(start, end + 1));
}

async function runGroqJson(model: string, system: string, prompt: string) {
  const { text } = await generateText({
    model: groqProvider(groqKey()).chat(model),
    system: `${system}\n\nRespond with raw JSON only. No markdown, no commentary.`,
    prompt,
    temperature: 0.4,
  });
  return extractJson(text);
}

/* ------------------------------ analyze answer ----------------------------- */

const AnalyzeInput = z.object({
  question: z.string().min(3).max(2000),
  answer: z.string().min(10).max(12000),
  model: z.string().optional(),
  role: z.string().max(200).optional(),
  resume: z.string().max(20000).optional(),
});

const ANALYZE_SYSTEM = `You are an expert technical interview coach.
Score the candidate answer from 0-100 on relevance, technical accuracy, communication, confidence and clarity, plus an overall score.
Give 3-5 concrete strengths, 3-5 areas for improvement, and 3-5 actionable interview tips.
Write a stronger professional rewrite of the answer that preserves the candidate's actual experience and never invents qualifications, employers, metrics or technologies they did not mention.
JSON shape: {"overall_score":number,"relevance":number,"technical":number,"communication":number,"confidence":number,"clarity":number,"strengths":string[],"improvements":string[],"tips":string[],"improved_answer":string}`;

export const analyzeAnswer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data }): Promise<Analysis> => {
    const context = [
      data.role ? `Target role: ${data.role}` : "",
      data.resume ? `Candidate resume (context only, do not invent beyond it):\n${data.resume.slice(0, 8000)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const prompt = `${context ? `${context}\n\n` : ""}Interview question:\n${data.question}\n\nCandidate answer:\n${data.answer}`;
    const json = await runGroqJson(pickModel(data.model), ANALYZE_SYSTEM, prompt);
    return AnalysisSchema.parse(json);
  });

/* ---------------------------- generate questions --------------------------- */

const QuestionsSchema = z.object({ questions: z.array(z.string().min(5)).min(1) });

const QuestionsInput = z.object({
  resume: z.string().min(30).max(20000),
  role: z.string().min(2).max(200),
  count: z.number().int().min(3).max(15).optional(),
  model: z.string().optional(),
});

export const generateQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => QuestionsInput.parse(input))
  .handler(async ({ data }): Promise<string[]> => {
    const count = data.count ?? 10;
    const system = `You are a senior hiring manager preparing an interview.
Using the candidate's resume and their target role, write ${count} interview questions tailored to their real experience and the role's expectations.
Mix behavioural, project-specific and role-specific technical questions. Reference concrete things from the resume where useful.
Each question must be a single self-contained sentence. Never invent experience the resume does not contain.
JSON shape: {"questions": string[]}`;

    const prompt = `Target role: ${data.role}\n\nResume:\n${data.resume.slice(0, 12000)}`;
    const json = await runGroqJson(pickModel(data.model), system, prompt);
    return QuestionsSchema.parse(json).questions.slice(0, count);
  });
