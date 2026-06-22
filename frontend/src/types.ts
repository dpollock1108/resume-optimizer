export interface UserProfile {
  id: string;
  name: string;
  resume: string;
}

export interface BulletEdit {
  original: string;
  revised: string;
  reason: string;
}

export interface AnalysisResult {
  before_match_score: number;
  before_ats_score: number;
  match_score: number;
  ats_score: number;
  effort_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  tailored_summary: string;
  bullet_edits: BulletEdit[];
  cover_opener: string;
  tailored_resume: string;
  strategic_note: string;
}

export type Layout = "classic" | "modern" | "compact" | "custom";

export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interviewing"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface KnowledgeGap101 {
  topic: string;
  why_it_matters: string;
  key_concepts: string[];
  quick_study: string;
}

export interface InterviewPrep {
  company_overview: string;
  role_breakdown: string;
  likely_questions: string[];
  talking_points: string[];
  knowledge_gaps: KnowledgeGap101[];
  culture_notes: string;
}

export interface Application {
  id: string;
  profile_id: string;
  profile_name: string;
  company: string;
  role: string;
  job_posting: string;
  status: ApplicationStatus;
  date_applied: string;
  match_score: number;
  ats_score: number;
  tailored_resume: string;
  layout: Layout;
  notes: string;
  prep?: InterviewPrep;
}
