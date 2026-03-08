"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { JOB_ROLES } from "@/data/roles";
import { AUDIENCE_OPTIONS } from "@/lib/audience";
import { DASHBOARD_STORAGE_KEY } from "@/lib/storage";
import type {
  AnalysisResult,
  AudienceType,
  DashboardPayload,
  InterviewResult,
  JobRoleKey,
  RoadmapResult,
} from "@/types";

interface ApiErrorPayload {
  error?: string;
}

async function parseError(response: Response) {
  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

  return payload?.error ?? "Something went wrong. Please try again.";
}

export function AnalysisForm() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState<JobRoleKey>(
    JOB_ROLES[0]?.key ?? "cloud-engineer",
  );
  const [audience, setAudience] = useState<AudienceType>("recent-graduate");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeholder = useMemo(
    () =>
      [
        "Example:",
        "Software engineer with experience in Python, Docker, Linux, and Git.",
        "Built APIs with FastAPI, deployed containerized services, and collaborated on cloud migration tasks.",
        "",
        "Or paste a public GitHub profile URL:",
        "https://github.com/octocat",
      ].join("\n"),
    [],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!resumeText.trim()) {
      setError("Paste your resume or profile text to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, targetRole, audience }),
      });

      if (!analyzeResponse.ok) {
        throw new Error(await parseError(analyzeResponse));
      }

      const analysis = (await analyzeResponse.json()) as AnalysisResult;

      const roadmapResponse = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          audience,
          presentSkills: analysis.matchingSkills,
          missingSkills: analysis.missingSkills,
        }),
      });

      if (!roadmapResponse.ok) {
        throw new Error(await parseError(roadmapResponse));
      }

      const roadmap = (await roadmapResponse.json()) as RoadmapResult;

      const interviewResponse = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          audience,
          missingSkills: analysis.missingSkills,
        }),
      });

      if (!interviewResponse.ok) {
        throw new Error(await parseError(interviewResponse));
      }

      const interview = (await interviewResponse.json()) as InterviewResult;
      const payload: DashboardPayload = { analysis, roadmap, interview };

      window.sessionStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(payload));
      router.push("/dashboard");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to analyze your resume right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            Resume Analysis
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Compare your current skills to a target role
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Paste resume text, project summaries, or a public GitHub profile URL.
            SkillBridge extracts technical skills, identifies gaps, and prepares a
            roadmap plus interview practice for the role you want next.
          </p>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          SkillBridge redacts common personal resume details such as email, phone,
          street address, and location markers before analysis when you paste raw
          resume text. AI output can still be incomplete, so treat the results as
          guidance rather than a final career decision.
        </div>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-900">Target role</span>
            <select
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-500"
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value as JobRoleKey)}
            >
              {JOB_ROLES.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-900">Audience mode</span>
            <select
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-500"
              value={audience}
              onChange={(event) => setAudience(event.target.value as AudienceType)}
            >
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs leading-5 text-slate-500">
              {
                AUDIENCE_OPTIONS.find((option) => option.id === audience)?.summary
              }
            </p>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-900">
              Resume text or GitHub profile URL
            </span>
            <textarea
              className="min-h-72 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
              placeholder={placeholder}
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Analyzing..." : "Analyze Resume"}
            </button>
            <Link
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              href="/"
            >
              Back to overview
            </Link>
          </div>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          "Detected skills and matching skills",
          "Missing skills with readiness score",
          "Learning roadmap and interview questions",
        ].map((item) => (
          <div
            key={item}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
