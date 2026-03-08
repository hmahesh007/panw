"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { DASHBOARD_STORAGE_KEY } from "@/lib/storage";
import type { DashboardPayload } from "@/types";

function readStoredDashboardPayload() {
  const rawValue = window.sessionStorage.getItem(DASHBOARD_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as DashboardPayload;
  } catch {
    window.sessionStorage.removeItem(DASHBOARD_STORAGE_KEY);
    return null;
  }
}

function EmptyState() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
        No analysis found yet
      </h1>
      <p className="max-w-xl text-sm leading-6 text-slate-600">
        Start with the resume analysis page to generate your skill gap report, roadmap,
        and interview practice.
      </p>
      <Link
        className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
        href="/analyze"
      >
        Go to analysis
      </Link>
    </section>
  );
}

function SkillList({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: string[];
  emptyMessage: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span
              key={item}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
            >
              {item}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}

function confidenceClasses(level: "low" | "medium" | "high") {
  if (level === "high") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (level === "medium") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-rose-100 text-rose-800";
}

function demandTierClasses(tier: "core" | "common" | "emerging") {
  if (tier === "core") {
    return "bg-slate-950 text-white";
  }

  if (tier === "common") {
    return "bg-sky-100 text-sky-800";
  }

  return "bg-slate-100 text-slate-700";
}

type DashboardSectionFilter = "all" | "skills" | "roadmap" | "interview";

export function ResultsDashboard() {
  const [payload, setPayload] = useState<DashboardPayload | null | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState<DashboardSectionFilter>("all");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setPayload(readStoredDashboardPayload());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const warnings = useMemo(() => {
    if (!payload) {
      return [];
    }

    return [
      ...payload.analysis.warnings,
      ...payload.roadmap.warnings,
      ...payload.interview.warnings,
    ];
  }, [payload]);

  if (payload === undefined) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-6">
        <p className="text-sm text-slate-500">Loading your analysis...</p>
      </section>
    );
  }

  if (!payload) {
    return <EmptyState />;
  }

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const matchesSearch = (...values: string[]) =>
    normalizedSearchQuery.length === 0 ||
    values.some((value) => value.toLowerCase().includes(normalizedSearchQuery));
  const filteredDetectedSkills = payload.analysis.detectedSkills.filter((item) =>
    matchesSearch(item),
  );
  const filteredMatchingSkills = payload.analysis.matchingSkills.filter((item) =>
    matchesSearch(item),
  );
  const filteredMissingSkills = payload.analysis.missingSkills.filter((item) =>
    matchesSearch(item),
  );
  const filteredRoadmap = payload.roadmap.roadmap.filter((step) =>
    matchesSearch(
      step.focus,
      step.task,
      step.resourceTitle,
      step.resourceType,
      step.cost,
      step.audienceNote,
    ),
  );
  const filteredInterviewQuestions = payload.interview.questions.filter((entry) =>
    matchesSearch(entry.skill, entry.question),
  );
  const showSkillsSection = sectionFilter === "all" || sectionFilter === "skills";
  const showRoadmapSection = sectionFilter === "all" || sectionFilter === "roadmap";
  const showInterviewSection = sectionFilter === "all" || sectionFilter === "interview";
  const hasVisibleSearchResults =
    (showSkillsSection &&
      (filteredDetectedSkills.length > 0 ||
        filteredMatchingSkills.length > 0 ||
        filteredMissingSkills.length > 0)) ||
    (showRoadmapSection && filteredRoadmap.length > 0) ||
    (showInterviewSection && filteredInterviewQuestions.length > 0);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-8">
      <div className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">
              {payload.analysis.role}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
              Input:{" "}
              {payload.analysis.inputSource === "github-profile"
                ? "GitHub profile"
                : payload.analysis.inputSource === "resume-and-github"
                  ? "Resume + GitHub"
                  : "Resume text"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
              Skill extraction: {payload.analysis.extractionSource}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Your readiness snapshot
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            {payload.analysis.audienceSummary}
          </p>
          <div className="flex gap-3">
            <Link
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              href="/analyze"
            >
              Run another analysis
            </Link>
            <Link
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              href="/"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Readiness Score</p>
          <p className="mt-4 text-6xl font-semibold">{payload.analysis.readinessScore}%</p>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            {payload.analysis.matchingSkills.length} of{" "}
            {payload.analysis.matchingSkills.length + payload.analysis.missingSkills.length}{" "}
            target skills already show up in your background.
          </p>
        </div>
      </div>

      {warnings.length > 0 ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {warnings.join(" ")}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-900">Search results</span>
            <input
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search skills, roadmap steps, or interview questions"
              type="search"
              value={searchQuery}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-900">Section filter</span>
            <select
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
              onChange={(event) =>
                setSectionFilter(event.target.value as DashboardSectionFilter)
              }
              value={sectionFilter}
            >
              <option value="all">All sections</option>
              <option value="skills">Skills only</option>
              <option value="roadmap">Roadmap only</option>
              <option value="interview">Interview only</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Search across the main output and narrow the dashboard to one section when
          you want a faster review pass.
        </p>
      </div>

      {normalizedSearchQuery && !hasVisibleSearchResults ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          No results matched &quot;{searchQuery}&quot;. Try a different keyword or
          switch the section filter.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Source Confidence</h2>
              <p className="mt-1 text-sm text-slate-600">
                A quick estimate of how trustworthy this analysis is as career guidance.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${confidenceClasses(payload.analysis.confidence.level)}`}
            >
              {payload.analysis.confidence.level} confidence
            </span>
          </div>
          <p className="mt-5 text-4xl font-semibold text-slate-950">
            {payload.analysis.confidence.score}%
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {payload.analysis.confidence.rationale}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Responsible AI Notes</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Recommendations here are guidance, not guarantees. Review AI-generated
            outputs critically before making career decisions.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {payload.analysis.privacyProtection.redactionApplied
              ? `Privacy protection was applied before analysis: ${payload.analysis.privacyProtection.redactedCategories.join(", ")} were redacted from pasted resume text.`
              : "No personal-detail redaction was applied for this input source."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Market Demand Snapshot</h2>
              <p className="mt-1 text-sm text-slate-600">
                Based on {payload.analysis.roleMarket.postingsAnalyzed} synthetic job postings for this role.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {payload.analysis.roleMarket.prioritizedMissingSkills.map((skill) => (
              <div
                key={skill.skill}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{skill.skill}</p>
                  <p className="text-xs text-slate-500">
                    Mentioned in {skill.jobCount} postings ({skill.frequencyPercent}%).
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${demandTierClasses(skill.demandTier)}`}
                >
                  {skill.demandTier}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Best Bridge Role</h2>
          <p className="mt-1 text-sm text-slate-600">
            A practical adjacent path if the target role still feels like a stretch.
          </p>
          {payload.analysis.bestNextRole ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base font-semibold text-slate-900">
                  {payload.analysis.bestNextRole.role}
                </h3>
                <span className="text-sm font-semibold text-sky-700">
                  {payload.analysis.bestNextRole.matchScore}%
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {payload.analysis.bestNextRole.reason}
              </p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              A bridge role recommendation will appear once transferable skills are detected.
            </p>
          )}
        </div>
      </div>

      {showSkillsSection ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <SkillList
            title="Detected Skills"
            items={filteredDetectedSkills}
            emptyMessage={
              normalizedSearchQuery
                ? "No detected skills matched the current search."
                : "No relevant technical skills were detected."
            }
          />
          <SkillList
            title="Matching Skills"
            items={filteredMatchingSkills}
            emptyMessage={
              normalizedSearchQuery
                ? "No matching skills matched the current search."
                : "None of the target role skills matched yet."
            }
          />
          <SkillList
            title="Missing Skills"
            items={filteredMissingSkills}
            emptyMessage={
              normalizedSearchQuery
                ? "No missing skills matched the current search."
                : "No major gaps detected for this role."
            }
          />
        </div>
      ) : null}

      {showRoadmapSection ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Learning Roadmap</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    A focused plan for closing the biggest skill gaps first.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
                  Source: {payload.roadmap.source}
                </span>
              </div>
              <div className="mt-6 grid gap-4">
                {filteredRoadmap.length > 0 ? (
                  filteredRoadmap.map((step) => (
                    <div
                      key={`${step.week}-${step.focus}`}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">
                        {step.label}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-slate-900">
                        {step.focus}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{step.task}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-200 px-2.5 py-1 font-medium text-slate-700">
                          {step.resourceType}
                        </span>
                        <span className="rounded-full bg-slate-200 px-2.5 py-1 font-medium text-slate-700">
                          {step.cost}
                        </span>
                        <span className="rounded-full bg-slate-200 px-2.5 py-1 font-medium text-slate-700">
                          {step.estimatedHours} hours
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-medium text-slate-800">
                        Resource: {step.resourceTitle}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {step.audienceNote}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No roadmap steps matched the current search.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Transferable Roles</h2>
              <p className="mt-1 text-sm text-slate-600">
                Adjacent paths where your current skills already help.
              </p>
              <div className="mt-6 grid gap-4">
                {payload.analysis.transferableRoles.length > 0 ? (
                  payload.analysis.transferableRoles.map((role) => (
                    <div
                      key={role.role}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-base font-semibold text-slate-900">
                          {role.role}
                        </h3>
                        <span className="text-sm font-semibold text-sky-700">
                          {role.matchScore}%
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {role.reason}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Transferable roles will appear once technical skills are detected.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Projected Readiness Delta
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              How your score changes if you learn the highest-value missing skills first.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {payload.analysis.projectedReadiness.map((projection) => (
                <div
                  key={projection.skillsToAdd.join("-")}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">
                    Add {projection.skillsToAdd.join(" + ")}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">
                    {projection.projectedReadinessScore}%
                  </p>
                  <p className="mt-2 text-sm font-medium text-emerald-700">
                    +{projection.scoreIncrease}% readiness
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {projection.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {showInterviewSection ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Interview Questions</h2>
              <p className="mt-1 text-sm text-slate-600">
                Practice questions focused on the skills that still need work.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
              Source: {payload.interview.source}
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredInterviewQuestions.length > 0 ? (
              filteredInterviewQuestions.map((entry, index) => (
                <div
                  key={`${entry.skill}-${index}`}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">
                    {entry.skill}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {entry.question}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 md:col-span-2">
                No interview questions matched the current search.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
