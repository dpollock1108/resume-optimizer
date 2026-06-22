import type { AnalysisResult, InterviewPrep, Layout, UserProfile } from "./types";

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export function getProfiles(): Promise<UserProfile[]> {
  return apiRequest<UserProfile[]>("/profiles");
}

export function createProfile(profile: Omit<UserProfile, "id">): Promise<UserProfile> {
  return apiRequest<UserProfile>("/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
}

export async function analyzeResume(params: {
  resume: string;
  job_posting: string;
  notes?: string;
  output_format: Layout;
  template_hints?: string;
}): Promise<AnalysisResult> {
  return apiRequest<AnalysisResult>("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function exportDocx(params: {
  tailored_resume: string;
  layout: string;
  name: string;
}): Promise<void> {
  const res = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resume_${params.layout}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function generatePrep(params: {
  resume: string;
  job_posting: string;
  company: string;
  role: string;
}): Promise<InterviewPrep> {
  return apiRequest<InterviewPrep>("/prep", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}
