import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/interview";
import { listInterviews } from "@/lib/interviews";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — InterviewAI" },
      {
        name: "description",
        content: "Visualize interview score trends across communication, technical and confidence.",
      },
      { property: "og:title", content: "Analytics — InterviewAI" },
      {
        property: "og:description",
        content: "Visualize interview score trends across communication, technical and confidence.",
      },
      { property: "og:url", content: "/analytics" },
    ],
    links: [{ rel: "canonical", href: "/analytics" }],
  }),
  component: Analytics,
});

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactElement;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function Analytics() {
  const { data, isLoading } = useQuery({ queryKey: ["interviews"], queryFn: listInterviews });
  const rows = (data ?? []).slice().reverse();
  const chartData = rows.map((r, i) => ({
    name: formatDate(r.created_at),
    index: i + 1,
    overall: r.overall_score,
    communication: r.communication,
    technical: r.technical,
    confidence: r.confidence,
    clarity: r.clarity,
  }));

  const tooltip = (
    <Tooltip
      contentStyle={{
        background: "var(--popover)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        color: "var(--popover-foreground)",
        fontSize: 12,
      }}
    />
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      </AppLayout>
    );
  }

  if (chartData.length === 0) {
    return (
      <AppLayout>
        <div className="grid min-h-[50vh] place-items-center text-center text-muted-foreground">
          Analyze an answer to unlock your performance charts.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold sm:text-3xl">Analytics</h1>
      <p className="mt-2 text-muted-foreground">How your interview performance is trending.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <ChartCard title="Average Interview Score" description="Overall score over time">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillOverall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" {...axis} />
            <YAxis domain={[0, 100]} {...axis} />
            {tooltip}
            <Area
              type="monotone"
              dataKey="overall"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              fill="url(#fillOverall)"
            />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Communication Score" description="Delivery and structure">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" {...axis} />
            <YAxis domain={[0, 100]} {...axis} />
            {tooltip}
            <Bar dataKey="communication" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Technical Score" description="Accuracy and depth">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" {...axis} />
            <YAxis domain={[0, 100]} {...axis} />
            {tooltip}
            <Line
              type="monotone"
              dataKey="technical"
              stroke="var(--chart-3)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartCard>

        <ChartCard title="Confidence Score" description="How assured your answers sound">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" {...axis} />
            <YAxis domain={[0, 100]} {...axis} />
            {tooltip}
            <Line
              type="monotone"
              dataKey="confidence"
              stroke="var(--chart-4)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartCard>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Interview Performance Trend</CardTitle>
          <CardDescription>All score dimensions side by side</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" {...axis} />
              <YAxis domain={[0, 100]} {...axis} />
              {tooltip}
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                formatter={(value: string) => value.charAt(0).toUpperCase() + value.slice(1)}
              />
              <Line type="monotone" dataKey="overall" stroke="var(--chart-1)" strokeWidth={2.5} />
              <Line type="monotone" dataKey="communication" stroke="var(--chart-2)" strokeWidth={2} />
              <Line type="monotone" dataKey="technical" stroke="var(--chart-3)" strokeWidth={2} />
              <Line type="monotone" dataKey="confidence" stroke="var(--chart-4)" strokeWidth={2} />
              <Line type="monotone" dataKey="clarity" stroke="var(--chart-5)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
