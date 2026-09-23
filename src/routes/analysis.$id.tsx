import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Lightbulb, PenLine, TriangleAlert } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { ScoreRing } from "@/components/ScoreRing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, scoreTone } from "@/lib/interview";
import { getInterview } from "@/lib/interviews";

export const Route = createFileRoute("/analysis/$id")({
  head: () => ({
    meta: [
      { title: "Analysis Result — InterviewAI" },
      {
        name: "description",
        content: "Detailed AI scoring, strengths, improvements and filler word analysis.",
      },
      { property: "og:title", content: "Analysis Result — InterviewAI" },
      {
        property: "og:description",
        content: "Detailed AI scoring, strengths, improvements and filler word analysis.",
      },
    ],
  }),
  component: AnalysisPage,
});

function List({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: typeof CheckCircle2;
  tone: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`h-4.5 w-4.5 ${tone}`} /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5">
          {items.length === 0 && <li className="text-sm text-muted-foreground">Nothing noted.</li>}
          {items.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current ${tone}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function AnalysisPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["interview", id],
    queryFn: () => getInterview(id),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="grid min-h-[50vh] place-items-center text-center">
          <div>
            <h1 className="text-xl font-semibold">Analysis not found</h1>
            <Button asChild className="mt-4">
              <Link to="/history">Back to history</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const fillerRate = data.total_words
    ? Number(((data.filler_words / data.total_words) * 100).toFixed(1))
    : 0;

  const scores = [
    { label: "Relevance", value: data.relevance },
    { label: "Technical Accuracy", value: data.technical },
    { label: "Communication", value: data.communication },
    { label: "Confidence", value: data.confidence },
    { label: "Clarity", value: data.clarity },
  ];

  return (
    <AppLayout>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/history">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to history
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <Card className="surface-grid lg:col-span-1">
          <CardHeader>
            <CardTitle>Overall Score</CardTitle>
            <CardDescription>{formatDate(data.created_at)}</CardDescription>
          </CardHeader>
          <CardContent className="grid place-items-center pb-8">
            <ScoreRing score={data.overall_score} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{data.question}</CardTitle>
            <CardDescription className="line-clamp-3">{data.answer}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {scores.map((s) => (
              <div key={s.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className={`font-semibold ${scoreTone(s.value)}`}>{s.value}</span>
                </div>
                <Progress value={s.value} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <List title="Strengths" items={data.strengths} icon={CheckCircle2} tone="text-success" />
        <List
          title="Areas for Improvement"
          items={data.improvements}
          icon={TriangleAlert}
          tone="text-warning"
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PenLine className="h-4.5 w-4.5 text-primary" /> Suggested Improved Answer
          </CardTitle>
          <CardDescription>
            A stronger rewrite based only on the experience you described.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-xl bg-muted/60 p-4 text-sm leading-relaxed">
            {data.improved_answer}
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <List title="Interview Tips" items={data.tips} icon={Lightbulb} tone="text-chart-3" />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filler Word Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Words", value: data.total_words },
                { label: "Filler Words", value: data.filler_words },
                { label: "Filler Rate", value: `${fillerRate}%` },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border p-3 text-center">
                  <p className="font-display text-xl font-semibold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.filler_breakdown).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No filler words detected — great delivery.
                </p>
              ) : (
                Object.entries(data.filler_breakdown).map(([word, count]) => (
                  <span
                    key={word}
                    className="rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning"
                  >
                    {word} · {count}
                  </span>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
