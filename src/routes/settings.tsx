import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, KeyRound, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getModel, MODELS } from "@/lib/interview";
import { deleteMyInterviews, listInterviews } from "@/lib/interviews";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — InterviewAI" },
      {
        name: "description",
        content: "Choose your AI model, manage keys securely and export or reset your data.",
      },
      { property: "og:title", content: "Settings — InterviewAI" },
      {
        property: "og:description",
        content: "Choose your AI model, manage keys securely and export or reset your data.",
      },
      { property: "og:url", content: "/settings" },
    ],
    links: [{ rel: "canonical", href: "/settings" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["interviews"], queryFn: listInterviews });
  const [model, setModel] = useState(MODELS[0]!.id);

  useEffect(() => {
    setModel(getModel());
  }, []);

  function saveModel(value: string) {
    setModel(value);
    window.localStorage.setItem("interviewai-model", value);
    toast.success("Model preference saved");
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data ?? [], null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interviewai-history.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function resetData() {
    await deleteMyInterviews();
    await queryClient.invalidateQueries({ queryKey: ["interviews"] });
    toast.success("Your interview records were deleted");
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold sm:text-3xl">Settings</h1>
      <p className="mt-2 text-muted-foreground">Model preferences, keys and your data.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4.5 w-4.5 text-primary" /> AI model
            </CardTitle>
            <CardDescription>Used to score and rewrite your answers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={saveModel}>
              <SelectTrigger id="model" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4.5 w-4.5 text-primary" /> API key
            </CardTitle>
            <CardDescription>Keys are never stored in the app code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Questions and feedback are generated with Groq. Create a free key at console.groq.com
              under API Keys.
            </p>
            <p>
              The key is saved as a private project secret named GROQ_API_KEY and only ever read on
              the server. Never paste a key into a page or share it in the browser.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Your data</CardTitle>
            <CardDescription>
              Demo records stay available so the charts always have context.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={exportData}>
              <Download className="mr-2 h-4 w-4" /> Export history (JSON)
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Reset my records
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset your interview records?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Every answer you practised and its feedback will be deleted. Demo records stay.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetData}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
