import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";
import { ResumeCard } from "@/components/ResumeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { analyzeAnswer, generateQuestions } from "@/lib/ai.functions";
import { analyzeFillers, getModel, SAMPLE_QUESTIONS } from "@/lib/interview";
import { saveInterview } from "@/lib/interviews";
import { loadResume } from "@/lib/resume";

export const Route = createFileRoute("/practice")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" ? { q: search["q"] as string } : {},
  head: () => ({
    meta: [
      { title: "Practice Interview — InterviewAI" },
      {
        name: "description",
        content: "Answer an interview question and get instant AI scoring and feedback.",
      },
      { property: "og:title", content: "Practice Interview — InterviewAI" },
      {
        property: "og:description",
        content: "Answer an interview question and get instant AI scoring and feedback.",
      },
      { property: "og:url", content: "/practice" },
    ],
    links: [{ rel: "canonical", href: "/practice" }],
  }),
  component: Practice,
});

function Practice() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const analyze = useServerFn(analyzeAnswer);
  const makeQuestions = useServerFn(generateQuestions);

  const [question, setQuestion] = useState(q ?? "");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState("");
  const [role, setRole] = useState("");
  const [generated, setGenerated] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const stored = loadResume();
    setResume(stored.resume);
    setRole(stored.role);
  }, []);

  const stats = useMemo(() => analyzeFillers(answer), [answer]);

  async function onGenerate() {
    if (role.trim().length < 2) {
      toast.error("Add the role you're interviewing for.");
      return;
    }
    if (resume.trim().length < 30) {
      toast.error("Upload or paste your resume first.");
      return;
    }
    setGenerating(true);
    try {
      const questions = await makeQuestions({
        data: { resume: resume.trim(), role: role.trim(), count: 10, model: getModel() },
      });
      setGenerated(questions);
      toast.success("Questions ready — pick one to answer.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't create questions.");
    } finally {
      setGenerating(false);
    }
  }


  async function onAnalyze() {
    if (question.trim().length < 3) {
      toast.error("Add an interview question first.");
      return;
    }
    if (answer.trim().split(/\s+/).length < 10) {
      toast.error("Write at least 10 words in your answer.");
      return;
    }

    setLoading(true);
    try {
      const result = await analyze({
        data: {
          question: question.trim(),
          answer: answer.trim(),
          model: getModel(),
          ...(role.trim() ? { role: role.trim() } : {}),
          ...(resume.trim() ? { resume: resume.trim().slice(0, 8000) } : {}),
        },
      });
      const saved = await saveInterview({
        question: question.trim(),
        answer: answer.trim(),
        overall_score: Math.round(result.overall_score),
        relevance: Math.round(result.relevance),
        technical: Math.round(result.technical),
        communication: Math.round(result.communication),
        confidence: Math.round(result.confidence),
        clarity: Math.round(result.clarity),
        strengths: result.strengths,
        improvements: result.improvements,
        tips: result.tips,
        improved_answer: result.improved_answer,
        total_words: stats.totalWords,
        filler_words: stats.fillerCount,
        filler_breakdown: stats.breakdown,
      });
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
      navigate({ to: "/analysis/$id", params: { id: saved.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="grid min-h-[60vh] place-items-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h2 className="mt-6 text-xl font-semibold">Analyzing your answer...</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Scoring relevance, communication, confidence and clarity.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              A detailed review can take up to a minute.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold sm:text-3xl">Practice Interview</h1>
      <p className="mt-2 text-muted-foreground">
        Answer as you would out loud, then let the AI score and rewrite it.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="space-y-6 lg:col-span-2">
          <ResumeCard
            resume={resume}
            role={role}
            onResumeChange={setResume}
            onRoleChange={setRole}
            onGenerate={onGenerate}
            generating={generating}
          />

          {generated.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Questions for {role}</CardTitle>
                <CardDescription>Built from your resume — tap one to answer it</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {generated.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setQuestion(item);
                      setAnswer("");
                    }}
                    className="flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors hover:border-primary hover:bg-accent"
                  >
                    <span className="font-display text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Interview Question</CardTitle>
              <CardDescription>Type your own or pick a sample below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Tell me about yourself."
                className="h-12"
              />
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((sample) => (
                  <Button
                    key={sample}
                    size="sm"
                    variant="secondary"
                    onClick={() => setQuestion(sample)}
                  >
                    {sample}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-72 resize-y text-base"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>Live counters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Word count", value: stats.totalWords },
                { label: "Character count", value: stats.characters },
                { label: "Filler words", value: stats.fillerCount },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border px-4 py-3"
                >
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-display text-lg font-semibold">{item.value}</span>
                </div>
              ))}
              {Object.keys(stats.breakdown).length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Detected: {Object.entries(stats.breakdown).map(([k, v]) => `${k} (${v})`).join(", ")}
                </p>
              )}
              <Button className="w-full" size="lg" onClick={onAnalyze}>
                <Sparkles className="mr-2 h-4 w-4" /> Analyze Answer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
