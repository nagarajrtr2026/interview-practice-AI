import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "./interview";

export type InterviewRecord = {
  id: string;
  session_id: string;
  question: string;
  answer: string;
  overall_score: number;
  relevance: number;
  technical: number;
  communication: number;
  confidence: number;
  clarity: number;
  strengths: string[];
  improvements: string[];
  tips: string[];
  improved_answer: string;
  total_words: number;
  filler_words: number;
  filler_breakdown: Record<string, number>;
  is_demo: boolean;
  created_at: string;
};

function normalize(row: Record<string, unknown>): InterviewRecord {
  return {
    ...(row as unknown as InterviewRecord),
    strengths: (row["strengths"] as string[]) ?? [],
    improvements: (row["improvements"] as string[]) ?? [],
    tips: (row["tips"] as string[]) ?? [],
    filler_breakdown: (row["filler_breakdown"] as Record<string, number>) ?? {},
  };
}

export async function listInterviews(): Promise<InterviewRecord[]> {
  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .in("session_id", ["demo", getSessionId()])
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => normalize(r as Record<string, unknown>));
}

export async function getInterview(id: string): Promise<InterviewRecord | null> {
  const { data, error } = await supabase.from("interviews").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? normalize(data as Record<string, unknown>) : null;
}

export async function deleteInterview(id: string) {
  const { error } = await supabase.from("interviews").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteMyInterviews() {
  const { error } = await supabase.from("interviews").delete().eq("session_id", getSessionId());
  if (error) throw error;
}

export async function saveInterview(
  row: Omit<InterviewRecord, "id" | "created_at" | "session_id" | "is_demo">,
): Promise<InterviewRecord> {
  const { data, error } = await supabase
    .from("interviews")
    .insert({ ...row, session_id: getSessionId(), is_demo: false })
    .select("*")
    .single();
  if (error) throw error;
  return normalize(data as Record<string, unknown>);
}
