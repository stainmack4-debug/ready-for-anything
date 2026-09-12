import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  CircleHelp,
  FileText,
  Flame,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Moon,
  Play,
  RotateCcw,
  Settings,
  Sparkles,
  Target,
  Timer,
  UserRound,
  X,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FunaBAcer — Learn. Practise. Master." },
      { name: "description", content: "The adaptive study system for FUNAAB students." },
    ],
  }),
  component: App,
});
type View =
  | "dashboard"
  | "courses"
  | "topic"
  | "learn"
  | "practice"
  | "review"
  | "results"
  | "notes"
  | "profile"
  | "settings";
type Props = { setView: (v: View) => void };
const topics = [
  { name: "Mole Concept", course: "CHM 101", score: 92, tone: "strong" },
  { name: "Stoichiometry", course: "CHM 101", score: 61, tone: "practice" },
  { name: "Gas Laws", course: "CHM 101", score: 34, tone: "weak" },
  { name: "Indices & Logarithms", course: "MTH 101", score: 88, tone: "strong" },
  { name: "Quadratic Equations", course: "MTH 101", score: 57, tone: "practice" },
  { name: "Comprehension", course: "GNS 101", score: 66, tone: "practice" },
];
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/funabacer-logo.jpg"
        alt="FunaBAcer F+A progress logo"
        className="size-10 rounded-xl object-cover shadow-[0_8px_20px_-8px_#16a34a]"
      />
      <div>
        <div className="text-base font-extrabold tracking-tight text-[#10231c]">
          Funa<span className="text-emerald-600">BAcer</span>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#71877d]">
          AI study system
        </div>
      </div>
    </div>
  );
}
function Btn({
  children,
  onClick,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
}) {
  const styles = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600",
    ghost: "bg-[#eff7f2] text-[#10231c] hover:bg-white/12",
    outline: "border border-[#c9ddd2] text-[#244138] hover:border-emerald-400/50",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-[.98] ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
function Sidebar({
  view,
  setView,
  logout,
}: {
  view: View;
  setView: (v: View) => void;
  logout: () => void;
}) {
  const links: [View, string, ReactNode][] = [
    ["dashboard", "Overview", <LayoutDashboard size={18} />],
    ["courses", "My courses", <Library size={18} />],
    ["practice", "CBT practice", <Target size={18} />],
    ["notes", "Note Cruncher", <FileText size={18} />],
    ["results", "Progress & mastery", <BarChart3 size={18} />],
  ];
  return (
    <aside className="hidden w-[250px] shrink-0 border-r border-[#dcebe3] bg-white px-5 py-7 lg:flex lg:flex-col">
      <Logo />
      <nav className="mt-12 space-y-1">
        {links.map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${view === id ? "bg-emerald-400/10 text-emerald-700" : "text-[#587166] hover:bg-[#eff7f2] hover:text-[#10231c]"}`}
          >
            <span
              className={`flex size-9 items-center justify-center rounded-xl ${view === id ? "text-emerald-700" : "text-[#587166]"}`}
            >
              {icon}
            </span>
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto space-y-1 border-t border-[#dcebe3] pt-5">
        <button
          onClick={() => setView("profile")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#587166] hover:text-[#10231c]"
        >
          <UserRound size={18} />
          Profile
        </button>
        <button
          onClick={() => setView("settings")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#587166] hover:text-[#10231c]"
        >
          <Settings size={18} />
          Settings
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#587166] hover:text-[#10231c]"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
function Topbar({ setView, openMobile }: { setView: (v: View) => void; openMobile: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-[#dcebe3] px-5 py-4 sm:px-8">
      <button onClick={openMobile} className="text-[#587166] lg:hidden">
        <Menu />
      </button>
      <div className="hidden text-sm text-[#71877d] sm:block">
        Thursday, 12 September 2026 <span className="mx-2 text-[#a8b9b1]">/</span>{" "}
        <span className="text-[#365348]">Your study command centre</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <button
          onClick={() => setView("settings")}
          className="hidden text-[#587166] hover:text-[#10231c] sm:block"
        >
          <Moon size={18} />
        </button>
        <button
          onClick={() => setView("profile")}
          className="flex items-center gap-2 rounded-full border border-[#dcebe3] bg-[#eff7f2] py-1.5 pl-1.5 pr-3 text-sm font-semibold"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-emerald-400 text-xs font-black text-white">
            P
          </span>
          <span className="hidden sm:block">Praise</span>
        </button>
      </div>
    </header>
  );
}
function Page({
  title,
  eyebrow,
  subtitle,
  children,
}: {
  title: string;
  eyebrow: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="p-5 sm:p-8">
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-[.22em] text-emerald-400">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#10231c]">{title}</h1>
        <p className="mt-2 text-sm text-[#71877d]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
function Dashboard({ setView }: Props) {
  return (
    <div className="space-y-8 p-5 sm:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-400">Good morning, Praise.</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#10231c] sm:text-4xl">
            Let's make today count.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#587166]">
            Continue the loop: learn the concept, test yourself, then close the gap.
          </p>
        </div>
        <Btn onClick={() => setView("learn")}>
          <Play size={16} fill="currentColor" /> Continue learning
        </Btn>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 to-transparent p-5">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Up next · CHM 101
          </span>
          <h2 className="mt-5 text-2xl font-extrabold">Gas Laws</h2>
          <p className="mt-1 text-sm text-[#587166]">4 minute lesson · 34% mastery</p>
          <button
            onClick={() => setView("topic")}
            className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-700"
          >
            Open topic <ArrowRight size={16} />
          </button>
        </div>
        {[
          ["6 days", "Study streak", <Flame size={17} />],
          ["342", "Questions answered", <Target size={17} />],
        ].map(([value, label, icon]) => (
          <div key={label as string} className="rounded-2xl border border-[#dcebe3] bg-white p-5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#eff7f2] text-emerald-700">
              {icon}
            </div>
            <p className="mt-7 text-2xl font-extrabold">{value}</p>
            <p className="mt-1 text-xs text-[#71877d]">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section className="rounded-2xl border border-[#dcebe3] bg-white p-6">
          <h2 className="font-extrabold">Your learning loop</h2>
          <p className="mt-1 text-sm text-[#71877d]">Every session moves you closer to mastery.</p>
          <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-4">
            {[
              ["Learn", <BookOpen size={19} />, "learn"],
              ["Question", <CircleHelp size={19} />, "practice"],
              ["Diagnose", <Brain size={19} />, "review"],
              ["Master", <Zap size={19} />, "results"],
            ].map(([label, icon, target], i) => (
              <button
                key={label as string}
                onClick={() => setView(target as View)}
                className="text-center"
              >
                <div
                  className={`mx-auto flex size-12 items-center justify-center rounded-2xl ${i < 3 ? "bg-emerald-500 text-white" : "border border-dashed border-emerald-400/50 text-emerald-700"}`}
                >
                  {i < 3 ? <Check size={20} /> : icon}
                </div>
                <p className="mt-3 text-xs font-bold text-[#365348]">{label}</p>
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-[#dcebe3] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold">Weak topics</h2>
            <button
              onClick={() => setView("results")}
              className="text-xs font-bold text-emerald-700"
            >
              View all
            </button>
          </div>
          <div className="mt-6 space-y-5">
            {topics
              .filter((t) => t.tone !== "strong")
              .slice(0, 3)
              .map((t) => (
                <button key={t.name} onClick={() => setView("topic")} className="w-full text-left">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-[#244138]">{t.name}</span>
                    <span className="text-xs text-[#71877d]">{t.score}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[#eff7f2]">
                    <div
                      className={`h-full rounded-full ${t.tone === "weak" ? "bg-rose-400" : "bg-amber-300"}`}
                      style={{ width: `${t.score}%` }}
                    />
                  </div>
                </button>
              ))}
          </div>
        </section>
      </div>
      <section>
        <h2 className="font-extrabold">Jump back in</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            ["My courses", "Follow your full course outline", "courses", <Library />],
            ["Note Cruncher", "Turn class notes into a study set", "notes", <FileText />],
            ["Progress & mastery", "See what you actually understand", "results", <BarChart3 />],
          ].map(([title, detail, target, icon]) => (
            <button
              key={title as string}
              onClick={() => setView(target as View)}
              className="flex items-start gap-4 rounded-2xl border border-[#dcebe3] bg-white p-5 text-left hover:border-emerald-400/40"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-700">
                {icon}
              </span>
              <span>
                <span className="block font-bold">{title}</span>
                <span className="mt-1 block text-sm text-[#71877d]">{detail}</span>
              </span>
              <ChevronRight className="ml-auto text-[#8ca198]" size={18} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
function Courses({ setView }: Props) {
  const courses = [
    ["CHM 101", "General Chemistry I", 68, "12 topics"],
    ["MTH 101", "Elementary Mathematics I", 72, "10 topics"],
    ["GNS 101", "Use of English I", 44, "8 topics"],
    ["PHY 101", "Introductory Physics", 18, "14 topics"],
  ];
  return (
    <Page
      title="My courses"
      eyebrow="COURSE LIBRARY"
      subtitle="Pick a course and keep moving through your mastery map."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map(([code, name, progress, count]) => (
          <button
            key={code as string}
            onClick={() => setView("topic")}
            className="group rounded-2xl border border-[#dcebe3] bg-gradient-to-br from-emerald-400/15 to-white p-6 text-left hover:-translate-y-1 hover:border-emerald-400/40"
          >
            <div className="flex justify-between">
              <span className="rounded-lg bg-[#eff7f2] px-2.5 py-1 text-xs font-bold text-[#365348]">
                {code}
              </span>
              <ChevronRight size={18} className="text-[#71877d]" />
            </div>
            <h2 className="mt-8 text-xl font-extrabold">{name}</h2>
            <p className="mt-2 text-sm text-[#71877d]">{count}</p>
            <div className="mt-7 flex justify-between text-xs">
              <span className="font-bold text-emerald-700">{progress}% complete</span>
              <span className="text-[#71877d]">View topics</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </Page>
  );
}
function Topic({ setView }: Props) {
  return (
    <Page
      title="CHM 101 · Gas Laws"
      eyebrow="TOPIC PATH"
      subtitle="Master the idea before the app asks you to prove it."
    >
      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 to-white p-7">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Your next best lesson
          </span>
          <h2 className="mt-4 text-3xl font-extrabold">Gas Laws</h2>
          <p className="mt-3 max-w-xl leading-7 text-[#587166]">
            You scored 34% here last time. We’ll rebuild the concept from zero, then retest the
            exact gap we found.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Btn onClick={() => setView("learn")}>
              <BookOpen size={17} /> Start learning
            </Btn>
            <Btn variant="outline" onClick={() => setView("practice")}>
              <Target size={17} /> Practise now
            </Btn>
          </div>
        </section>
        <section className="rounded-2xl border border-[#dcebe3] bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#71877d]">
            Topic mastery
          </p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-5xl font-extrabold">34%</span>
            <span className="mb-2 rounded-full bg-rose-400/10 px-2 py-1 text-xs font-bold text-rose-300">
              Needs attention
            </span>
          </div>
          <div className="mt-6 h-2 rounded-full bg-[#eff7f2]">
            <div className="h-full w-[34%] rounded-full bg-rose-400" />
          </div>
          <p className="mt-4 text-sm text-[#71877d]">3 of 9 checkpoints completed</p>
        </section>
      </div>
      <section className="mt-6 rounded-2xl border border-[#dcebe3] bg-white p-6">
        <h2 className="font-extrabold">Topic checkpoints</h2>
        <div className="mt-5 space-y-3">
          {[
            "What pressure really measures",
            "Boyle's law and inverse relationships",
            "Charles' law and temperature",
            "Combined gas law",
            "Mixed exam questions",
          ].map((item, i) => (
            <button
              key={item}
              onClick={() => setView(i < 2 ? "learn" : "practice")}
              className="flex w-full items-center gap-4 rounded-xl border border-white/6 bg-[#fbfdfc] p-4 text-left hover:border-emerald-400/30"
            >
              <span
                className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${i < 2 ? "bg-emerald-500 text-white" : "border border-[#c9ddd2] text-[#71877d]"}`}
              >
                {i < 2 ? <Check size={15} /> : i + 1}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-[#244138]">{item}</span>
                <span className="mt-1 block text-xs text-[#71877d]">
                  {i < 2
                    ? "Completed · strong foundation"
                    : i === 2
                      ? "Next up · 4 min"
                      : "Locked until you continue"}
                </span>
              </span>
              <ChevronRight size={17} className="text-[#8ca198]" />
            </button>
          ))}
        </div>
      </section>
    </Page>
  );
}
function Learn({ setView }: Props) {
  const [step, setStep] = useState(0);
  const lessons = [
    [
      "Let's start with the idea",
      "I’m your AI tutor for Gas Laws. I’ll check what you already know, teach one idea at a time, and adapt the next explanation to your answer. Pressure is the force gas particles exert when they collide with a surface.",
      "Start with this: more particle collisions per second means more pressure. We will use a visual example and then I’ll ask you to explain it back in your own words.",
    ],
    [
      "Boyle's law",
      "Now let’s connect the idea to Boyle’s law. I’ll show the relationship, ask you to predict what happens when volume changes, and only then introduce the equation.",
      "P₁V₁ = P₂V₂ — the product stays constant.",
    ],
    [
      "Ready to test the idea?",
      "You now have the foundation. Let’s use one exam-style question to see what stuck.",
      "One question. No pressure. This is how we learn what to teach next.",
    ],
  ];
  const l = lessons[step];
  return (
    <Page
      title="Learn · Gas Laws"
      eyebrow={`LESSON ${step + 1} OF 3`}
      subtitle="Progressive teaching that meets you where you are."
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex gap-2">
          {lessons.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-emerald-400" : "bg-white/10"}`}
            />
          ))}
        </div>
        <article className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 to-white p-7 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <Brain size={24} />
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              AI tutor · adapting to you
            </span>
          </div>
          <h2 className="mt-8 text-3xl font-extrabold">{l[0]}</h2>
          <p className="mt-5 text-lg leading-8 text-[#365348]">{l[1]}</p>
          <div className="mt-8 rounded-xl border border-[#dcebe3] bg-[#f4faf6] p-5 text-sm leading-6 text-emerald-800">
            <span className="font-bold text-emerald-700">A simple way to remember it: </span>
            {l[2]}
          </div>
          <div className="mt-10 flex justify-between gap-3">
            {step > 0 ? (
              <Btn variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={16} /> Back
              </Btn>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <Btn onClick={() => setStep(step + 1)}>
                I understand <ArrowRight size={16} />
              </Btn>
            ) : (
              <Btn onClick={() => setView("practice")}>
                Test me <Target size={16} />
              </Btn>
            )}
          </div>
        </article>
        <button
          onClick={() => setView("practice")}
          className="mx-auto mt-6 block text-sm font-semibold text-[#71877d] hover:text-emerald-700"
        >
          I already know this · go to practice
        </button>
      </div>
    </Page>
  );
}
function Practice({ setView }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const options = ["0.5 atm", "1.0 atm", "2.0 atm", "4.0 atm"];
  return (
    <Page title="Practice · Gas Laws" eyebrow="CBT PRACTICE" subtitle="Question 3 of 10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex justify-between rounded-xl border border-[#dcebe3] bg-white px-4 py-3 text-sm">
          <span className="font-bold text-[#365348]">CHM 101 · Gas Laws</span>
          <span className="flex items-center gap-2 font-bold text-emerald-700">
            <Timer size={16} /> 08:42
          </span>
        </div>
        <div className="rounded-2xl border border-[#dcebe3] bg-white p-7 sm:p-10">
          <div className="flex justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Past question
            </span>
            <span className="text-xs text-[#71877d]">Single answer</span>
          </div>
          <h2 className="mt-7 text-xl font-bold leading-8">
            A gas occupies 2 dm³ at a pressure of 1 atm. If the volume is reduced to 1 dm³ at
            constant temperature, what is the new pressure?
          </h2>
          <div className="mt-8 space-y-3">
            {options.map((option, i) => (
              <button
                key={option}
                onClick={() => setSelected(i)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left text-sm font-semibold ${selected === i ? "border-emerald-400 bg-emerald-400/10 text-emerald-700" : "border-[#dcebe3] text-[#365348] hover:border-white/20"}`}
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-full text-xs ${selected === i ? "bg-emerald-500 text-white" : "bg-[#eff7f2] text-[#71877d]"}`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-between">
            <Btn variant="ghost">
              <ArrowLeft size={16} /> Previous
            </Btn>
            <Btn onClick={() => setView(selected === 2 ? "results" : "review")}>
              <span>Submit answer</span>
              <ArrowRight size={16} />
            </Btn>
          </div>
        </div>
      </div>
    </Page>
  );
}
function Review({ setView }: Props) {
  return (
    <Page
      title="Let's close the gap"
      eyebrow="QUESTION REVIEW"
      subtitle="A wrong answer is a diagnosis, not a dead end."
    >
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/8 p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-rose-400/15 text-rose-300">
              <X size={18} />
            </span>
            <div>
              <p className="font-bold text-rose-200">Not quite — you chose 0.5 atm</p>
              <p className="mt-1 text-xs text-[#71877d]">Question 3 · Gas Laws</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-[#365348]">
            You treated the volume change as if pressure moves in the same direction. Boyle’s law is
            an inverse relationship.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 to-white p-7">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
            <Sparkles size={16} /> AI diagnosis
          </div>
          <h2 className="mt-5 text-2xl font-extrabold">When space shrinks, collisions increase.</h2>
          <p className="mt-4 leading-7 text-[#365348]">
            Imagine the same number of people inside a smaller room. They hit the walls more often,
            so the pressure goes up. Halving the volume doubles the pressure.
          </p>
          <div className="mt-6 rounded-xl bg-[#eff7f2] p-4 font-mono text-sm text-emerald-800">
            P₁V₁ = P₂V₂ → 1 × 2 = P₂ × 1 → P₂ = 2 atm
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Btn onClick={() => setView("practice")}>
              <RotateCcw size={16} /> Re-test this concept
            </Btn>
            <Btn variant="outline" onClick={() => setView("learn")}>
              Explain from the beginning
            </Btn>
          </div>
        </div>
      </div>
    </Page>
  );
}
function Results({ setView }: Props) {
  return (
    <Page
      title="Progress & mastery"
      eyebrow="YOUR PERFORMANCE"
      subtitle="Scores tell you what happened. Mastery tells you what to do next."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["74%", "Overall mastery", "+8% this month"],
          ["342", "Questions answered", "Across 4 courses"],
          ["4h 20m", "Study time", "This week"],
        ].map(([v, l, d]) => (
          <div key={l} className="rounded-2xl border border-[#dcebe3] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#71877d]">{l}</p>
            <p className="mt-4 text-3xl font-extrabold">{v}</p>
            <p className="mt-2 text-xs font-semibold text-emerald-700">{d}</p>
          </div>
        ))}
      </div>
      <section className="mt-6 rounded-2xl border border-[#dcebe3] bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold">Mastery map</h2>
            <p className="mt-1 text-sm text-[#71877d]">Your next lesson is chosen from this map.</p>
          </div>
          <Btn variant="outline" onClick={() => setView("courses")}>
            Browse courses
          </Btn>
        </div>
        <div className="mt-7 space-y-5">
          {topics.map((t) => (
            <div key={t.name}>
              <div className="flex justify-between gap-4">
                <div>
                  <span className="text-sm font-bold text-[#244138]">{t.name}</span>
                  <span className="ml-2 text-xs text-[#8ca198]">{t.course}</span>
                </div>
                <span
                  className={`text-xs font-bold ${t.tone === "strong" ? "text-emerald-700" : t.tone === "weak" ? "text-rose-300" : "text-amber-300"}`}
                >
                  {t.tone === "strong" ? "Strong" : t.tone === "weak" ? "Weak" : "Needs practice"}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[#eff7f2]">
                <div
                  className={`h-full rounded-full ${t.tone === "strong" ? "bg-emerald-400" : t.tone === "weak" ? "bg-rose-400" : "bg-amber-300"}`}
                  style={{ width: `${t.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}
function Notes() {
  return (
    <Page
      title="Note Cruncher"
      eyebrow="STUDY MATERIALS"
      subtitle="Turn your class notes into something you can actually revise."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <div className="rounded-2xl border border-dashed border-emerald-400/35 bg-emerald-400/5 p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <FileText size={25} />
          </div>
          <h2 className="mt-6 text-xl font-extrabold">Drop your notes here</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#71877d]">
            Upload a PDF, lecture slide or image. FunaBAcer will make a summary, flashcards and
            questions.
          </p>
          <Btn className="mt-7">
            <FileText size={16} /> Choose a file
          </Btn>
          <p className="mt-3 text-xs text-[#8ca198]">PDF, PNG or JPG · up to 20 MB</p>
        </div>
        <div className="rounded-2xl border border-[#dcebe3] bg-white p-6">
          <h2 className="font-extrabold">Recent study sets</h2>
          <div className="mt-5 space-y-3">
            {[
              "CHM 101 — Atomic structure",
              "MTH 101 — Functions",
              "GNS 101 — Communication skills",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-[#fbfdfc] p-3">
                <BookOpen size={16} className="text-emerald-700" />
                <span className="flex-1 text-sm font-semibold text-[#365348]">{item}</span>
                <ChevronRight size={16} className="text-[#8ca198]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}
function Profile({ setView }: Props) {
  return (
    <Page
      title="Your profile"
      eyebrow="STUDENT PROFILE"
      subtitle="A quick picture of how you are progressing toward exam day."
    >
      <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        <section className="rounded-2xl border border-[#dcebe3] bg-white p-7 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-400 text-3xl font-black text-white">
            P
          </div>
          <h2 className="mt-5 text-xl font-extrabold">Praise Adebayo</h2>
          <p className="mt-1 text-sm text-[#71877d]">100 level · Computer Science</p>
          <div className="mt-7 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-[#fbfdfc] p-4">
              <p className="text-xl font-extrabold">74%</p>
              <p className="mt-1 text-xs text-[#71877d]">Overall progress</p>
            </div>
            <div className="rounded-xl bg-[#fbfdfc] p-4">
              <p className="text-xl font-extrabold text-emerald-700">On track</p>
              <p className="mt-1 text-xs text-[#71877d]">Exam status</p>
            </div>
          </div>
          <Btn variant="outline" className="mt-6 w-full" onClick={() => setView("settings")}>
            Edit profile <Settings size={16} />
          </Btn>
        </section>
        <section className="rounded-2xl border border-[#dcebe3] bg-white p-7">
          <h2 className="font-extrabold">Your study identity</h2>
          <div className="mt-6 space-y-4">
            {[
              ["Department", "College of Engineering"],
              ["Exam window", "November 2026"],
              ["Current streak", "6 days"],
              ["Preferred study mode", "Learn then practise"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between border-b border-white/6 pb-4 text-sm"
              >
                <span className="text-[#71877d]">{label}</span>
                <span className="font-semibold text-[#244138]">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}
function SettingsPage() {
  return (
    <Page title="Settings" eyebrow="PREFERENCES" subtitle="Make FunaBAcer fit the way you study.">
      <div className="max-w-2xl rounded-2xl border border-[#dcebe3] bg-white p-6">
        {[
          ["Account details", "Name, email and academic profile"],
          ["Notifications", "Daily reminders and weekly progress"],
          ["AI tutor preferences", "Explanation depth and learning pace"],
          ["Payment & exam pass", "Manage your FunaBAcer plan"],
        ].map(([title, detail]) => (
          <button
            key={title}
            className="flex w-full items-center gap-4 border-b border-white/6 py-5 text-left last:border-0"
          >
            <Settings size={17} className="text-emerald-700" />
            <span className="flex-1">
              <span className="block font-bold">{title}</span>
              <span className="mt-1 block text-xs text-[#71877d]">{detail}</span>
            </span>
            <ChevronRight size={18} className="text-[#8ca198]" />
          </button>
        ))}
      </div>
    </Page>
  );
}
const funaabDepartments = [
  {
    group: "Agriculture",
    description: "Agriculture, crops, animals and natural resources",
    courses: [
      "Agriculture",
      "Agricultural Administration",
      "Agricultural Economics and Farm Management",
      "Agricultural Extension and Rural Development",
      "Animal Breeding and Genetics",
      "Animal Nutrition",
      "Animal Physiology",
      "Animal Production and Health",
      "Aquaculture and Fisheries Management",
      "Climate Science and Agricultural Meteorology",
      "Crop Protection",
      "Environmental Management and Toxicology",
      "Forest Resource Management",
      "Geology",
      "Horticulture",
      "Hydrology and Water Resources Management",
      "Pasture and Range Management",
      "Plant Breeding and Seed Technology",
      "Plant Physiology and Crop Production",
      "Soil Science and Land Management",
      "Water Resources Management and Agro-meteorology",
      "Wildlife and Eco-tourism Management",
      "Water Sanitation and Hygiene",
    ],
  },
  {
    group: "Biological Science",
    description: "Life sciences, laboratory work and public health",
    courses: [
      "Biochemistry",
      "Biotechnology",
      "Microbiology",
      "Public Health",
      "Pure and Applied Botany",
      "Pure and Applied Zoology",
      "Science Laboratory Technology",
    ],
  },
  {
    group: "Computing Science",
    description: "Computing, software, data and information systems",
    courses: [
      "Computer Science",
      "Cyber Security",
      "Data Science",
      "Information Communication Technology",
      "Information Systems",
      "Information Technology",
      "Software Engineering",
    ],
  },
  {
    group: "Food Science and Human Ecology",
    description: "Food, nutrition, clothing and hospitality",
    courses: [
      "Clothing & Textile Design",
      "Food Science and Technology",
      "Home Science and Management",
      "Hospitality and Tourism",
      "Nutrition and Dietetics",
    ],
  },
  {
    group: "Physical Science",
    description: "Chemistry, mathematics, physics and statistics",
    courses: [
      "Chemistry",
      "Geophysics",
      "Industrial Chemistry",
      "Mathematics",
      "Physics",
      "Statistics",
    ],
  },
  {
    group: "Engineering",
    description: "Engineering design, systems and technology",
    courses: [
      "Agricultural Engineering",
      "Civil Engineering",
      "Electrical and Electronics Engineering",
      "Mechanical Engineering",
      "Mechatronic Engineering",
    ],
  },
  {
    group: "Veterinary Medicine",
    description: "Animal health and veterinary medicine",
    courses: ["Veterinary Medicine"],
  },
  {
    group: "Entrepreneurial and Development Studies",
    description: "Business, economics, accounting and development",
    courses: [
      "Accounting",
      "Banking and Finance",
      "Business Administration",
      "Cooperative Studies",
      "Development Studies",
      "Economics",
      "Entrepreneurial Studies",
      "Library and Information Science",
    ],
  },
];

function Onboarding({ done }: { done: (profile: { department: string; course: string }) => void }) {
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const selected = funaabDepartments.find((item) => item.group === department);
  const finish = async () => {
    if (!department || !course) return;
    const profile = { department, course };
    await supabase.auth.updateUser({ data: profile });
    localStorage.setItem("funabacer-profile", JSON.stringify(profile));
    done(profile);
  };
  return (
    <div className="min-h-screen bg-[#f7faf8] px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Logo />
        <div className="mt-14 grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-700">
              PERSONALISE YOUR STUDY PLAN
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#10231c] sm:text-5xl">
              Tell us what you’re studying.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-[#587166]">
              FunaBAcer will use your department and course to choose relevant topics, past
              questions and AI explanations for you.
            </p>
            <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-emerald-700">
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                1
              </span>
              Department first
              <span className="h-px w-8 bg-[#c9ddd2]" />
              <span className="flex size-8 items-center justify-center rounded-full border border-[#c9ddd2] text-[#71877d]">
                2
              </span>
              Course next
            </div>
          </div>
          <div className="rounded-3xl border border-[#dcebe3] bg-white p-6 shadow-[0_24px_70px_-36px_#31634c] sm:p-8">
            <label className="block text-sm font-bold text-[#244138]">
              What college or department are you in?
              <select
                value={department}
                onChange={(event) => {
                  setDepartment(event.target.value);
                  setCourse("");
                }}
                className="mt-3 w-full rounded-xl border border-[#c9ddd2] bg-[#f7faf8] px-4 py-3.5 text-[#10231c] outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Select your department</option>
                {funaabDepartments.map((item) => (
                  <option key={item.group} value={item.group}>
                    {item.group}
                  </option>
                ))}
              </select>
            </label>
            {selected && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-[#71877d]">{selected.description}</p>
                <label className="mt-4 block text-sm font-bold text-[#244138]">
                  What course are you studying?
                  <select
                    value={course}
                    onChange={(event) => setCourse(event.target.value)}
                    className="mt-3 w-full rounded-xl border border-[#c9ddd2] bg-[#f7faf8] px-4 py-3.5 text-[#10231c] outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Select your course</option>
                    {selected.courses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            <button
              onClick={finish}
              disabled={!department || !course}
              className="mt-8 w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-[#dcebe3] disabled:text-[#8ca198]"
            >
              Build my study plan <ArrowRight className="ml-2 inline-block" size={16} />
            </button>
            <p className="mt-4 text-center text-xs text-[#8ca198]">
              You can change this later in Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Auth({ done }: { done: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const r =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    setBusy(false);
    if (r.error) setMessage(r.error.message);
    else if (mode === "signup")
      setMessage("Account created. Check your email to confirm, then log in.");
    else done();
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7faf8] px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-10 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-3xl border border-[#dcebe3] bg-white p-7 shadow-2xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            FUNAAB STUDY SYSTEM
          </p>
          <h1 className="mt-3 text-3xl font-extrabold">
            {mode === "login" ? "Welcome back." : "Create your account."}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#71877d]">
            {mode === "login"
              ? "Pick up exactly where your learning loop left off."
              : "Start building mastery across every course."}
          </p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <label className="block text-sm font-semibold text-[#365348]">
                Full name
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#dcebe3] bg-[#f4faf6] px-4 py-3 text-[#10231c] outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Praise Adebayo"
                />
              </label>
            )}
            <label className="block text-sm font-semibold text-[#365348]">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#dcebe3] bg-[#f4faf6] px-4 py-3 text-[#10231c] outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-sm font-semibold text-[#365348]">
              Password
              <input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#dcebe3] bg-[#f4faf6] px-4 py-3 text-[#10231c] outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="At least 6 characters"
              />
            </label>
            {message && (
              <p className="rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-700">{message}</p>
            )}
            <button
              disabled={busy}
              className="w-full rounded-xl bg-emerald-400 py-3.5 text-sm font-extrabold text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "login" ? "Log in to FunaBAcer" : "Create account"}
            </button>
          </form>
          <div className="mt-7 text-center text-sm text-[#71877d]">
            {mode === "login" ? "New to FunaBAcer?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setMessage("");
              }}
              className="font-bold text-emerald-700"
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-[#8ca198]">
          Your progress is securely saved to your account.
        </p>
      </div>
    </div>
  );
}
function App() {
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const metadata = data.session?.user.user_metadata as
        { department?: string; course?: string } | undefined;
      if (metadata?.department && metadata.course) {
        localStorage.setItem(
          "funabacer-profile",
          JSON.stringify({ department: metadata.department, course: metadata.course }),
        );
      }
      setSession(data.session);
      setNeedsOnboarding(Boolean(data.session && !localStorage.getItem("funabacer-profile")));
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) setNeedsOnboarding(!localStorage.getItem("funabacer-profile"));
    });
    return () => data.subscription.unsubscribe();
  }, []);
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7faf8] text-emerald-700">
        Loading your study space…
      </div>
    );
  if (!session) return <Auth done={() => setSession({ loggedIn: true })} />;
  if (needsOnboarding) return <Onboarding done={() => setNeedsOnboarding(false)} />;
  let content: ReactNode;
  const props = { setView };
  if (view === "dashboard") content = <Dashboard {...props} />;
  else if (view === "courses") content = <Courses {...props} />;
  else if (view === "topic") content = <Topic {...props} />;
  else if (view === "learn") content = <Learn {...props} />;
  else if (view === "practice") content = <Practice {...props} />;
  else if (view === "review") content = <Review {...props} />;
  else if (view === "results") content = <Results {...props} />;
  else if (view === "notes") content = <Notes />;
  else if (view === "profile") content = <Profile {...props} />;
  else content = <SettingsPage />;
  return (
    <div className="flex min-h-screen bg-[#f7faf8] text-[#10231c]">
      <Sidebar
        view={view}
        setView={setView}
        logout={async () => {
          await supabase.auth.signOut();
          setSession(null);
        }}
      />
      {mobile && (
        <div
          className="fixed inset-0 z-50 bg-[#10231c]/30 lg:hidden"
          onClick={() => setMobile(false)}
        >
          <div className="h-full w-[270px] bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setMobile(false)}>
                <X />
              </button>
            </div>
            <div className="mt-10 space-y-2">
              {[
                ["dashboard", "Overview"],
                ["courses", "My courses"],
                ["practice", "CBT practice"],
                ["notes", "Note Cruncher"],
                ["results", "Progress & mastery"],
                ["profile", "Profile"],
                ["settings", "Settings"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    setView(id as View);
                    setMobile(false);
                  }}
                  className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#365348] hover:bg-[#eff7f2]"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <main className="min-w-0 flex-1">
        <Topbar setView={setView} openMobile={() => setMobile(true)} />
        <div className="mx-auto max-w-[1220px]">{content}</div>
      </main>
    </div>
  );
}
