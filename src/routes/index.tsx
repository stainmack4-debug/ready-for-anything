import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Flame,
  GraduationCap,
  PlayCircle,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FunaBAcer — Your FUNAAB Study Companion" },
      {
        name: "description",
        content:
          "FunaBAcer is the AI study app for FUNAAB students: learn topics, practise CBT past questions, get diagnosed explanations, and track topic mastery.",
      },
      { property: "og:title", content: "FunaBAcer — Your FUNAAB Study Companion" },
      {
        property: "og:description",
        content:
          "Learn, practise, get diagnosed, and master every FUNAAB course topic with FunaBAcer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Mastery = "strong" | "practice" | "weak";

const masteryStyles: Record<Mastery, { chip: string; bar: string; label: string }> = {
  strong: {
    chip: "bg-accent/15 text-emerald-700 dark:text-highlight",
    bar: "bg-accent",
    label: "Strong",
  },
  practice: {
    chip: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500",
    label: "Needs practice",
  },
  weak: {
    chip: "bg-destructive/15 text-destructive",
    bar: "bg-destructive",
    label: "Weak",
  },
};

const courses = [
  {
    code: "CHM 101",
    title: "General Chemistry I",
    topics: [
      { name: "Mole Concept", mastery: "strong" as Mastery, score: 92 },
      { name: "Stoichiometry", mastery: "practice" as Mastery, score: 61 },
      { name: "Gas Laws", mastery: "weak" as Mastery, score: 34 },
    ],
  },
  {
    code: "MTH 101",
    title: "Elementary Mathematics I",
    topics: [
      { name: "Indices & Logarithms", mastery: "strong" as Mastery, score: 88 },
      { name: "Quadratic Equations", mastery: "practice" as Mastery, score: 57 },
    ],
  },
  {
    code: "GNS 101",
    title: "Use of English I",
    topics: [
      { name: "Comprehension", mastery: "practice" as Mastery, score: 66 },
      { name: "Lexis & Structure", mastery: "weak" as Mastery, score: 41 },
    ],
  },
];

const stats = [
  { icon: Flame, label: "Study streak", value: "6 days" },
  { icon: Target, label: "Questions answered", value: "342" },
  { icon: TrendingUp, label: "Avg. score", value: "74%" },
  { icon: Timer, label: "Time this week", value: "4h 20m" },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex size-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_24px_-4px_var(--color-accent)]">
        <GraduationCap className="size-5 text-primary-foreground" />
      </div>
      <span className="text-lg font-bold tracking-tight text-foreground">
        FunaB<span className="text-accent">Acer</span>
      </span>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-10 pb-8 sm:px-10">
        <Logo />
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground sm:flex">
            <Flame className="size-4 text-accent" />
            6-day streak
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            P
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-6 pb-24 sm:px-10">
        {/* Hero / continue learning */}
        <section className="space-y-10">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-widest text-accent uppercase">
              Welcome back, Praise
            </p>
            <h1 className="max-w-2xl text-4xl leading-tight font-extrabold tracking-tight text-foreground sm:text-5xl">
              What does Praise need to{" "}
              <span className="text-accent">understand next?</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Your AI tutor has a plan ready. Gas Laws is holding you back in
              CHM 101 — let's fix that today.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            {/* Continue card */}
            <div className="group relative overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground shadow-[0_24px_60px_-20px_color-mix(in_oklab,var(--color-primary)_60%,transparent)]">
              <div
                className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full opacity-30 blur-3xl"
                style={{ background: "var(--color-emerald-glow)" }}
              />
              <div className="relative space-y-8">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
                    Up next · CHM 101
                  </span>
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight">Gas Laws</h2>
                  <p className="max-w-md text-sm leading-relaxed text-primary-foreground/80">
                    You scored 34% here last session. We'll relearn it from the
                    ground up, then re-test you until it sticks.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button className="flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-accent-foreground transition-transform hover:scale-[1.03] active:scale-95">
                    <PlayCircle className="size-5" />
                    Continue learning
                  </button>
                  <button className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-white/10">
                    Practise CBT instead
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-5">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6"
                >
                  <s.icon className="size-5 text-accent" />
                  <div className="pt-6">
                    <p className="text-2xl font-extrabold tracking-tight text-card-foreground">
                      {s.value}
                    </p>
                    <p className="pt-1 text-xs font-medium text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="space-y-7">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Jump back in
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Note Cruncher",
                desc: "Upload a PDF or snap a page — get summaries and flashcards.",
              },
              {
                icon: Brain,
                title: "CBT Practice",
                desc: "Realistic timed practice with past questions per topic.",
              },
              {
                icon: Sparkles,
                title: "AI Tutor",
                desc: "Ask “why is this wrong?” and get taught from zero.",
              },
            ].map((a) => (
              <button
                key={a.title}
                className="group flex flex-col gap-5 rounded-3xl border border-border bg-card p-7 text-left transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_20px_40px_-20px_color-mix(in_oklab,var(--color-accent)_35%,transparent)]"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary transition-colors group-hover:bg-accent/15">
                  <a.icon className="size-6 text-accent" />
                </div>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 font-bold text-card-foreground">
                    {a.title}
                    <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {a.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Mastery */}
        <section className="space-y-7">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Topic mastery
              </h2>
              <p className="text-sm text-muted-foreground">
                Not just scores — what you've actually mastered.
              </p>
            </div>
            <button className="shrink-0 text-sm font-semibold text-accent hover:underline">
              View all courses
            </button>
          </div>

          <div className="space-y-6">
            {courses.map((course) => (
              <div
                key={course.code}
                className="rounded-3xl border border-border bg-card p-8 sm:p-9"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 pb-7">
                  <div>
                    <p className="text-xs font-bold tracking-widest text-accent uppercase">
                      {course.code}
                    </p>
                    <h3 className="pt-1 text-lg font-bold text-card-foreground">
                      {course.title}
                    </h3>
                  </div>
                </div>
                <div className="space-y-6">
                  {course.topics.map((topic) => {
                    const m = masteryStyles[topic.mastery];
                    return (
                      <div key={topic.name} className="space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-card-foreground">
                            {topic.name}
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${m.chip}`}
                          >
                            {m.label}
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full bar-shimmer ${m.bar}`}
                            style={{ width: `${topic.score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
