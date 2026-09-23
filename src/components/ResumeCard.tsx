import { FileText, Loader2, Upload, Wand2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { extractResumeText, saveResume } from "@/lib/resume";

type Props = {
  resume: string;
  role: string;
  onResumeChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onGenerate: () => void;
  generating: boolean;
};

export function ResumeCard({
  resume,
  role,
  onResumeChange,
  onRoleChange,
  onGenerate,
  generating,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [fileName, setFileName] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setReading(true);
    try {
      const text = await extractResumeText(file);
      if (text.length < 30) {
        toast.error("Couldn't read enough text from that file. Try pasting your resume instead.");
        return;
      }
      onResumeChange(text);
      saveResume(text, role);
      setFileName(file.name);
      toast.success(`Loaded ${file.name}`);
    } catch {
      toast.error("That file couldn't be read. Try a text-based PDF or paste the text.");
    } finally {
      setReading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-primary" /> Your resume &amp; target role
        </CardTitle>
        <CardDescription>
          Upload a PDF or paste your resume, then generate questions made for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role you're interviewing for</Label>
          <Input
            id="role"
            value={role}
            onChange={(e) => {
              onRoleChange(e.target.value);
              saveResume(resume, e.target.value);
            }}
            placeholder="e.g. Frontend Engineer at a fintech startup"
            className="h-11"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.md,application/pdf,text/plain"
            className="sr-only"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          <Button variant="outline" disabled={reading} onClick={() => fileRef.current?.click()}>
            {reading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {reading ? "Reading..." : "Upload resume"}
          </Button>
          {fileName && <span className="text-xs text-muted-foreground">{fileName}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="resume">Resume text</Label>
          <Textarea
            id="resume"
            value={resume}
            onChange={(e) => {
              onResumeChange(e.target.value);
              saveResume(e.target.value, role);
            }}
            placeholder="Paste your resume here..."
            className="min-h-40 resize-y"
          />
        </div>

        <Button className="w-full" onClick={onGenerate} disabled={generating}>
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {generating ? "Creating questions..." : "Generate 10 questions"}
        </Button>
      </CardContent>
    </Card>
  );
}
