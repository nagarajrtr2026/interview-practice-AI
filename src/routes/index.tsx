import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, BarChart3, CheckCircle2, MessageSquareText, Sparkles, TrendingUp } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, SAMPLE_QUESTIONS, scoreTone } from "@/lib/interview";
import { listInterviews } from "@/lib/interviews";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — InterviewAI" },
      {
        name: "description",
        content:
          "Track interview practice scores, filler words and AI feedback in one dashboard.",
      },
      { property: "og:title", content: "Dashboard — InterviewAI" },
      {
        property: "og:description",
        content: "Track interview practice scores, filler words and AI feedback in one dashboard.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["interviews"], queryFn: listInterviews });
  const rows = data ?? [];
  const scores = rows.map((r) => r.overall_score);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const best = scores.length ? Math.max(...scores) : 0;

  const stats = [
    { label: "Interviews Completed", value: rows.length, icon: CheckCircle2, tone: "text-primary" },
    { label: "Average Score", value: avg, icon: TrendingUp, tone: "text-chart-2" },
    { label: "Best Score", value: best, icon: Award, tone: "text-chart-3" },
    {
      label: "Questions Answered",
      value: new Set(rows.map((r) => r.question.trim().toLowerCase())).size,
      icon: MessageSquareText,
      tone: "text-chart-4",
    },
  ];

  return (
    <AppLayout>
      <section className="surface-grid mb-8 overflow-hidden rounded-3xl border bg-card p-6 sm:p-10">
        <Badge variant="secondary" className="mb-4 gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> AI-powered coaching
        </Badge>
        <h1 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
          AI Interview Performance Analyzer
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Analyze your interview answers and get personalized AI feedback.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/practice">Start Interview</Link>
        </Button>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="transition-shadow hover:shadow-lg">
            <CardContent className="flex items-center gap-4 p-5">
              <span className={`grid h-11 w-11 place-items-center rounded-xl bg-muted ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-7 w-12" />
                ) : (
                  <p className="font-display text-2xl font-semibold">{value}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Your latest analyzed answers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading &&
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            {!isLoading && rows.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No interviews yet. Start your first practice session.
              </p>
            )}
            {rows.slice(0, 5).map((row) => (
              <Link
                key={row.id}
                to="/analysis/$id"
                params={{ id: row.id }}
                className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{row.question}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(row.created_at)}
                    {row.is_demo ? " · demo data" : ""}
                  </p>
                </div>
                <span className={`font-display text-xl font-semibold ${scoreTone(row.overall_score)}`}>
                  {row.overall_score}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick start</CardTitle>
            <CardDescription>Jump into a common question</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {SAMPLE_QUESTIONS.slice(0, 4).map((q) => (
              <Button
                key={q}
                asChild
                variant="outline"
                className="h-auto w-full justify-start whitespace-normal py-3 text-left"
              >
                <Link to="/practice" search={{ q }}>
                  {q}
                </Link>
              </Button>
            ))}
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link to="/analytics">
                <BarChart3 className="mr-2 h-4 w-4" /> View analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
