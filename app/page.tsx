import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 lg:px-8">
      <section className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            SkillBridge Career Navigator
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            Find the gap between your current skills and your next role
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-600">
            SkillBridge analyzes resume text, compares it against local job-role
            requirements, and generates a learning roadmap plus mock interview questions.
            It is designed as a fast MVP with no accounts and no stored resume data.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              href="/analyze"
            >
              Start analysis
            </Link>
            <Link
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              href="/dashboard"
            >
              View dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          {[
            {
              title: "1. Extract skills",
              body: "Identify technical skills from resume or profile text, with AI plus fallback keyword matching.",
            },
            {
              title: "2. Compare to role",
              body: "Measure the overlap with local role requirements and calculate readiness as a percentage.",
            },
            {
              title: "3. Plan next steps",
              body: "Generate a roadmap, interview practice questions, and adjacent career paths to explore.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
            >
              <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
