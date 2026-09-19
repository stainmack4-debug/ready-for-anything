import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { funaabCurriculum } from "@/lib/funaab-curriculum";
import { avatarUrl, avatars, getAvatarId, setAvatarId } from "@/lib/avatars";
import { averageScore, getAttempts, saveAttempt, totalAnswered } from "@/lib/progress";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  CircleHelp,
  FileText,
  Flame,
  GraduationCap,
  House,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Moon,
  Paperclip,
  Play,
  RotateCcw,
  Send,
  Settings,
  Sparkles,
  Sun,
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
  | "overview"
  | "courses"
  | "topic"
  | "learn"
  | "practice"
  | "review"
  | "results"
  | "notes"
  | "profile"
  | "settings"
  | "admin";
type Theme = "day" | "night";
type StudentProfile = { department: string; course: string };
type Props = { setView: (v: View) => void; profile?: StudentProfile | null; userId?: string };
function realStats() {
  const attempts = getAttempts();
  const answered = totalAnswered();
  const score = averageScore();
  const studyDays = new Set(attempts.map((attempt) => new Date(attempt.at).toDateString())).size;
  return { answered, score, studyDays };
}
function attemptedTopics() {
  return getAttempts().map((attempt) => ({
    name: attempt.topicId.split(":").slice(1).join(":") || attempt.topicId,
    course: attempt.topicId.split(":")[0] || "Your course",
    score: attempt.score,
    tone: attempt.score >= 80 ? "strong" : attempt.score >= 50 ? "practice" : "weak",
  }));
}
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
    ["notes", "Note Cruncher", <FileText size={18} />],
    ["profile", "Profile & academic info", <UserRound size={18} />],
    ["settings", "Settings & preferences", <Settings size={18} />],
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
/** Cartoon avatar chooser — pick the face that represents you. */
function AvatarPicker() {
  const avatar = useAvatar();
  return (
    <div>
      <img
        src={avatar.url}
        alt="Your avatar"
        className="mx-auto size-20 rounded-full border-2 border-emerald-400 bg-emerald-50 object-cover"
      />
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[.2em] text-emerald-700">
        Choose your avatar
      </p>
      <div className="mt-3 grid grid-cols-6 gap-2">
        {avatars.map((a) => (
          <button
            key={a.id}
            onClick={() => setAvatarId(a.id)}
            aria-label={`Use avatar ${a.id}`}
            className={`rounded-full border-2 bg-emerald-50 p-0.5 transition-transform hover:scale-105 ${a.id === avatar.id ? "border-emerald-500" : "border-transparent"}`}
          >
            <img src={a.url} alt="" className="size-full rounded-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
function BottomNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  const links: [View, string, ReactNode][] = [
    ["dashboard", "Home", <House size={21} />],
    ["courses", "Learn", <GraduationCap size={21} />],
    ["practice", "AI Coach", <Bot size={21} />],
    ["results", "Progress", <BarChart3 size={21} />],
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dcebe3] bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-14px_35px_-28px_#154c35] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {links.map(([id, label, icon]) => {
          const active =
            view === id ||
            (id === "courses" && ["topic", "learn"].includes(view)) ||
            (id === "practice" && view === "review");
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-extrabold ${active ? "bg-emerald-500 text-white" : "text-[#71877d] hover:bg-[#eff7f2]"}`}
            >
              <span>{icon}</span>
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
function Topbar({
  theme,
  setTheme,
  openMobile,
  setView,
}: {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  openMobile: () => void;
  setView: (v: View) => void;
}) {
  const avatar = useAvatar();
  return (
    <header className="flex min-h-[76px] items-center justify-between border-b border-[#dcebe3] bg-white px-5 py-3 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={openMobile}
          className="flex size-10 items-center justify-center rounded-xl border border-[#c9ddd2] text-[#587166] hover:bg-[#eff7f2] lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-3 lg:hidden">
          <img
            src="/funabacer-logo.jpg"
            alt="FunaBAcer"
            className="size-10 rounded-xl object-cover"
          />
          <span className="text-base font-extrabold tracking-tight text-[#10231c]">
            Funa<span className="text-emerald-600">BAcer</span>
          </span>
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <img
            src="/funabacer-logo.jpg"
            alt="FunaBAcer"
            className="size-9 rounded-xl object-cover"
          />
          <span className="text-sm font-extrabold text-[#10231c]">
            Funa<span className="text-emerald-600">BAcer</span>
          </span>
          <span className="mx-1 h-6 w-px bg-[#dcebe3]" />
          <span className="text-sm font-semibold text-[#587166]">Home</span>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === "day" ? "night" : "day")}
          className="flex size-10 items-center justify-center rounded-xl border border-[#c9ddd2] text-[#587166] hover:bg-[#eff7f2]"
        >
          {theme === "day" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button
          onClick={() => setView("profile")}
          className="flex items-center gap-2 rounded-xl border border-[#c9ddd2] bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold hover:bg-[#eff7f2]"
        >
          <img
            src={avatar.url}
            alt="Your avatar"
            className="size-7 rounded-full border border-emerald-300 bg-white object-cover"
          />
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
  className = "",
}: {
  title: string;
  eyebrow: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-5 sm:p-8 ${className}`}>
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-[.22em] text-emerald-400">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#10231c]">{title}</h1>
        <p className="mt-2 text-sm text-[#71877d]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
function useAvatar() {
  const [id, setId] = useState(avatars[0]!.id);
  useEffect(() => {
    const sync = () => setId(getAvatarId());
    sync();
    window.addEventListener("funabacer-avatar", sync);
    return () => window.removeEventListener("funabacer-avatar", sync);
  }, []);
  return { id, url: avatarUrl(id) };
}

/** Time-of-day + recent-performance aware greeting for the hero header. */
function useGreeting() {
  return useMemo(() => {
    const h = new Date().getHours();
    if (h < 12)
      return {
        slot: "Good morning",
        line: "Mornings are your sharpest hours — one focused sprint now beats an hour tonight.",
        tint: "from-amber-50 via-white to-emerald-50",
        chip: "Morning momentum",
      };
    if (h < 17)
      return {
        slot: "Good afternoon",
        line: "Fifteen honest minutes between lectures is how mastery actually gets built.",
        tint: "from-emerald-50 via-white to-emerald-50",
        chip: "Afternoon focus",
      };
    if (h < 21)
      return {
        slot: "Good evening",
        line: "Let's clear one weak topic before the day closes. I'll keep it light.",
        tint: "from-sky-50 via-white to-emerald-50",
        chip: "Evening review",
      };
    return {
      slot: "Still up",
      line: "Late night? Then we go small — one concept, five questions, and you rest.",
      tint: "from-indigo-50 via-white to-emerald-50",
      chip: "Night mode",
    };
  }, []);
}

function Home({ setView }: Props) {
  const g = useGreeting();
  const avatar = useAvatar();
  const [message, setMessage] = useState("");
  const stats = realStats();
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const prompts = [
    "Explain my first topic simply",
    "Help me understand this course",
    "Give me practice questions for my course",
  ];
  const ask = () => {
    if (message.trim()) localStorage.setItem("funabacer.pending-question", message.trim());
    setView("learn");
  };
  return (
    <div className="space-y-6 p-5 sm:p-8">
      {/* Personalized hero header */}
      <section
        className={`rounded-[2rem] border border-emerald-200 bg-gradient-to-br ${g.tint} p-6 shadow-[0_24px_70px_-42px_#2f6b4f] sm:p-9`}
      >
        <div className="flex items-center gap-4">
          <img
            src={avatar.url}
            alt="Your avatar"
            className="size-14 rounded-full border-2 border-emerald-400 bg-white object-cover"
          />
          <div>
            <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-emerald-700">
              {g.chip}
            </span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#10231c] sm:text-3xl">
              {g.slot}, Praise
            </h1>
          </div>
        </div>
        <p className="mt-5 max-w-xl text-sm leading-6 text-[#587166] sm:text-base">{g.line}</p>

        {/* AI message box — the heart of the dashboard */}
        <div className="mt-7 rounded-2xl border border-emerald-200 bg-white p-3 shadow-[0_18px_44px_-34px_#23704d]">
          <div className="flex items-end gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask();
                }
              }}
              rows={2}
              placeholder="Ask FunaBAcer anything… “Teach me stoichiometry from scratch”"
              className="min-h-[54px] w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-[#10231c] outline-none placeholder:text-[#8ca198]"
            />
            <button
              onClick={ask}
              aria-label="Send message to AI tutor"
              className="mb-1 flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white transition-transform active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 px-1 pb-1">
            {prompts.map((p) => (
              <button
                key={p}
                onClick={() => setMessage(p)}
                className="rounded-full border border-[#dcebe3] px-3 py-1.5 text-xs font-semibold text-[#587166] hover:border-emerald-300 hover:text-emerald-700"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* One-click action zone */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Btn onClick={() => setView("learn")} className="flex-1 py-4 text-base">
            <Play size={18} fill="currentColor" /> Resume my lesson plan
          </Btn>
          <Btn variant="outline" onClick={() => setView("practice")} className="flex-1 py-4">
            <Timer size={18} /> Start 10-minute sprint
          </Btn>
        </div>
      </section>

      {/* Smart progress tracking */}
      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-[#dcebe3] bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-amber-500" />
              <h2 className="font-extrabold text-[#10231c]">{stats.studyDays}-day streak</h2>
            </div>
            <span className="text-xs font-semibold text-[#71877d]">This week</span>
          </div>
          <div className="mt-6 flex items-center gap-2">
            {days.map((d, i) => (
              <div key={`${d}${i}`} className="flex-1 text-center">
                <div
                  className={`flex h-10 items-center justify-center rounded-xl text-xs font-bold ${
                    i < stats.studyDays ? "bg-emerald-500 text-white" : "bg-[#eff7f2] text-[#8ca198]"
                  }`}
                >
                  {i < stats.studyDays ? <Check size={16} /> : d}
                </div>
                <p className="mt-2 text-[10px] font-semibold text-[#8ca198]">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-[#71877d]">
            {stats.answered ? "Your study activity is recorded from submitted work." : "You have not studied any topics yet. Start your first lesson to begin tracking progress."}
          </p>
        </div>

        <button
          onClick={() => setView("topic")}
          className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-left text-white"
        >
          <div className="flex items-center gap-2">
            <Target size={18} />
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-emerald-50">
              Focus area
            </p>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold">{stats.answered ? "Continue your study" : "Your first study session"}</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-50">
            {stats.answered ? `Your current average is ${stats.score ?? 0}%. Keep going from your last submitted work.` : "No topic mastery has been recorded yet. Choose your course to begin."}
          </p>
          <div className="mt-6 h-2 rounded-full bg-white/25"><div className="h-full rounded-full bg-white" style={{ width: `${stats.score ?? 0}%` }} /></div>
          <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold">{stats.answered ? "Continue learning" : "Choose a course"} <ArrowRight size={15} /></span>
        </button>
      </section>

      {/* Quick jumps */}
      <section className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ["Note Cruncher", "Turn notes into flashcards", <FileText size={18} />, "notes"],
            ["CBT practice", "Timed past questions", <Target size={18} />, "practice"],
            ["My mastery", "See every topic's health", <BarChart3 size={18} />, "results"],
          ] as [string, string, ReactNode, View][]
        ).map(([title, detail, icon, target]) => (
          <button
            key={title}
            onClick={() => setView(target)}
            className="rounded-2xl border border-[#dcebe3] bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-300"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              {icon}
            </span>
            <p className="mt-4 text-sm font-extrabold text-[#10231c]">{title}</p>
            <p className="mt-1 text-xs leading-5 text-[#71877d]">{detail}</p>
          </button>
        ))}
      </section>
    </div>
  );
}

function Dashboard({ setView, profile }: Props) {
  const userTopics = attemptedTopics();
  const actions: [string, string, string, ReactNode, View][] = [
    [
      "Start learning",
      "Let FunaBAcer teach you a topic step by step.",
      "Best next step",
      <BookOpen size={20} />,
      "learn",
    ],
    [
      "Practise with CBT",
      "Answer realistic past questions with a timer.",
      "Test what you know",
      <Target size={20} />,
      "practice",
    ],
    [
      "Ask the AI tutor",
      "Get an explanation for any confusing idea.",
      "Learn differently",
      <Brain size={20} />,
      "learn",
    ],
    [
      "Crunch my notes",
      "Turn a PDF or image into summaries and flashcards.",
      "Study materials",
      <FileText size={20} />,
      "notes",
    ],
    [
      "See my mastery",
      "Find weak topics and your recommended next lesson.",
      "Know what to do next",
      <BarChart3 size={20} />,
      "results",
    ],
  ];
  return (
    <div className="space-y-8 p-5 sm:p-8">
      <section className="rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-white via-white to-emerald-50 p-7 shadow-[0_24px_70px_-38px_#2f6b4f] sm:p-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-700">
              START HERE
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#10231c] sm:text-5xl">
              Your personal AI study space.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#587166]">
              FunaBAcer helps you learn your FUNAAB courses, practise past questions, understand
              mistakes and build real mastery — one next step at a time.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Btn onClick={() => setView("learn")}>
                <Play size={16} fill="currentColor" /> Start my next lesson
              </Btn>
              <Btn variant="outline" onClick={() => setView("courses")}>
                <Library size={16} /> Explore courses
              </Btn>
            </div>
          </div>
          <div className="w-full max-w-xs rounded-2xl border border-emerald-100 bg-white p-5">
            <div className="flex items-center gap-3">
              <img
                src="/funabacer-logo.jpg"
                alt="FunaBAcer progress mark"
                className="size-12 rounded-xl object-cover"
              />
              <div>
                <p className="text-sm font-extrabold text-[#10231c]">Your FUNAAB study plan</p>
                <p className="mt-1 text-xs text-[#71877d]">
                  Choose a programme to personalise this space
                </p>
              </div>
            </div>
            <div className="mt-5 h-2 rounded-full bg-emerald-50">
              <div className="h-full w-0 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-3 text-xs font-semibold text-emerald-700">
              Source-backed recommendations will appear here after your first study session.
            </p>
          </div>
        </div>
      </section>
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
              WHAT CAN I DO?
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#10231c]">
              Everything you need to move forward.
            </h2>
            <p className="mt-2 text-sm text-[#71877d]">
              Choose a starting point. FunaBAcer will guide you from there.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {actions.map(([title, detail, label, icon, target], i) => (
            <button
              key={title}
              onClick={() => setView(target)}
              className={`group rounded-2xl border p-5 text-left transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_20px_40px_-28px_#23704d] ${i === 0 ? "border-emerald-300 bg-emerald-500 text-white" : "border-[#dcebe3] bg-white"}`}
            >
              <div
                className={`flex size-11 items-center justify-center rounded-xl ${i === 0 ? "bg-white/20" : "bg-emerald-50 text-emerald-700"}`}
              >
                {icon}
              </div>
              <p
                className={`mt-5 text-xs font-bold uppercase tracking-wider ${i === 0 ? "text-emerald-50" : "text-emerald-700"}`}
              >
                {label}
              </p>
              <h3
                className={`mt-2 text-lg font-extrabold ${i === 0 ? "text-white" : "text-[#10231c]"}`}
              >
                {title}
              </h3>
              <p
                className={`mt-2 text-sm leading-6 ${i === 0 ? "text-emerald-50" : "text-[#71877d]"}`}
              >
                {detail}
              </p>
              <span
                className={`mt-5 inline-flex items-center gap-1 text-sm font-bold ${i === 0 ? "text-white" : "text-emerald-700"}`}
              >
                Open <ArrowRight size={15} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-2xl border border-[#dcebe3] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
                YOUR JOURNEY
              </p>
              <h2 className="mt-2 font-extrabold text-[#10231c]">How FunaBAcer helps you learn</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Always connected
            </span>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Learn", "AI teaches the idea", <BookOpen size={18} />],
              ["Practise", "Answer a question", <CircleHelp size={18} />],
              ["Understand", "AI finds the gap", <Brain size={18} />],
              ["Master", "Re-test and improve", <Zap size={18} />],
            ].map(([title, detail, icon]) => (
              <button
                key={title as string}
                onClick={() =>
                  setView(
                    title === "Learn"
                      ? "learn"
                      : title === "Practise"
                        ? "practice"
                        : title === "Understand"
                          ? "review"
                          : "results",
                  )
                }
                className="rounded-xl bg-[#f7faf8] p-4 text-left hover:bg-emerald-50"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
                  {icon}
                </span>
                <p className="mt-4 text-sm font-extrabold text-[#244138]">{title}</p>
                <p className="mt-1 text-xs leading-5 text-[#71877d]">{detail}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#dcebe3] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-[#10231c]">Weak topics</h2>
            <button
              onClick={() => setView("results")}
              className="text-xs font-bold text-emerald-700"
            >
              View all
            </button>
          </div>
          <div className="mt-6 space-y-5">
            {userTopics.length === 0 ? <p className="text-sm leading-6 text-[#71877d]">No weak topics yet. Start a lesson and submit practice answers before mastery is calculated.</p> : userTopics
              .filter((t) => t.tone !== "strong")
              .slice(0, 3)
              .map((t) => (
                <button key={t.name} onClick={() => setView("topic")} className="w-full text-left">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-[#244138]">{t.name}</span>
                    <span className="text-xs text-[#71877d]">{t.score}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-emerald-50">
                    <div
                      className={`h-full rounded-full ${t.tone === "weak" ? "bg-rose-400" : "bg-amber-300"}`}
                      style={{ width: `${t.score}%` }}
                    />
                  </div>
                </button>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
function Courses({ setView, profile }: Props) {
  const selected = profile?.course ? funaabCurriculum.flatMap((item) => item.courses.map((course) => ({ domain: item, course }))).find((item) => item.course.name.toLowerCase() === profile.course.toLowerCase()) : undefined;
  return <Page title="Learn" eyebrow="YOUR PROGRAMME" subtitle={profile?.course ? `Showing only ${profile.course}` : "Choose your programme during onboarding."}>
    {!selected ? <div className="rounded-2xl border border-[#dcebe3] bg-white p-7"><h2 className="text-xl font-extrabold">Your programme is not selected</h2><p className="mt-2 text-sm leading-6 text-[#71877d]">Complete your academic profile before learning. FunaBAcer will then show only your programme, not every FUNAAB programme.</p></div> : <>
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">{selected.domain.domain}</p><h2 className="mt-2 text-2xl font-extrabold">{selected.course.name}</h2><p className="mt-2 text-sm leading-6 text-[#587166]">{selected.course.synopsis}</p><span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-[#587166]">{selected.course.confidence} confidence · {selected.course.official_sources.length} official sources</span></div>
      <div className="mt-5 rounded-2xl border border-[#dcebe3] bg-white p-7"><h3 className="text-lg font-extrabold">Start your personalised study path</h3><p className="mt-2 text-sm leading-6 text-[#71877d]">No topic is marked strong until you actually study and submit answers. Ask the Tutor to teach a topic from your {selected.course.name} programme, then practise it.</p><div className="mt-5 flex flex-wrap gap-3"><Btn onClick={() => setView("learn")}><BookOpen size={16}/> Open AI Tutor</Btn><Btn variant="outline" onClick={() => setView("practice")}><Target size={16}/> Practise a topic</Btn></div></div>
    </>}
  </Page>;
}
function Topic({ setView, profile }: Props) {
  const userTopics = attemptedTopics();
  return <Page title={profile?.course || "Your topic"} eyebrow="TOPIC PATH" subtitle="Mastery is calculated only from your submitted practice answers.">
    <div className="rounded-2xl border border-[#dcebe3] bg-white p-7"><h2 className="text-2xl font-extrabold">No topic selected yet</h2><p className="mt-3 leading-7 text-[#71877d]">{userTopics.length ? "Choose one of your studied topics from Progress, or ask the AI Tutor to teach a new topic." : "You have not studied or submitted practice for any topic yet, so every topic is currently 0% and unclassified."}</p><div className="mt-6 flex flex-wrap gap-3"><Btn onClick={() => setView("learn")}><BookOpen size={16}/> Ask the AI Tutor to teach</Btn><Btn variant="outline" onClick={() => setView("practice")}><Target size={16}/> Start topic practice</Btn></div></div>
  </Page>;
}

function AdminPanel() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [freeDays, setFreeDays] = useState(() => localStorage.getItem("funabacer-admin-free-days") || "30");
  const [announcement, setAnnouncement] = useState(() => localStorage.getItem("funabacer-admin-announcement") || "");
  const save = () => { localStorage.setItem("funabacer-admin-free-days", freeDays); localStorage.setItem("funabacer-admin-announcement", announcement); alert("Admin settings saved on this device."); };
  if (!unlocked) return <Page title="Admin Panel" eyebrow="ADMIN ACCESS" subtitle="Restricted settings"><div className="mx-auto max-w-md rounded-2xl border border-[#dcebe3] bg-white p-7"><h2 className="text-xl font-extrabold">Enter admin password</h2><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" className="mt-5 w-full rounded-xl border border-[#dcebe3] px-4 py-3"/><Btn className="mt-4 w-full" onClick={() => password === "808254" ? setUnlocked(true) : alert("Incorrect password")}>Open Admin Panel</Btn><p className="mt-4 text-xs leading-5 text-[#71877d]">This panel currently controls this browser only. Server-side multi-user announcements and unlock codes still need a protected Supabase admin table.</p></div></Page>;
  return <Page title="Admin Panel" eyebrow="ADMIN CONTROLS" subtitle="Manage the current announcement and free access period."><div className="max-w-2xl space-y-5"><div className="rounded-2xl border border-[#dcebe3] bg-white p-6"><label className="block text-sm font-bold">Free access period (days)<input value={freeDays} onChange={(e) => setFreeDays(e.target.value)} type="number" min="0" className="mt-2 w-full rounded-xl border border-[#dcebe3] px-4 py-3"/></label></div><div className="rounded-2xl border border-[#dcebe3] bg-white p-6"><label className="block text-sm font-bold">Announcement shown to users<textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} rows={4} placeholder="You have free access for 30 days." className="mt-2 w-full rounded-xl border border-[#dcebe3] px-4 py-3"/></label></div><Btn onClick={save}>Save admin settings</Btn></div></Page>;
}
function TutorMessage({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const inline = (value: string) => value.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part);
  return <div>{lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-2" />;
    if (/^[-*] /.test(trimmed)) return <div key={i} className="ml-4 list-item">{inline(trimmed.slice(2))}</div>;
    if (/^#{1,3} /.test(trimmed)) return <p key={i} className="mt-2 font-extrabold text-white">{inline(trimmed.replace(/^#{1,3} /, ""))}</p>;
    if (/^\d+\. /.test(trimmed)) return <div key={i} className="ml-4 list-item">{inline(trimmed.replace(/^\d+\. /, ""))}</div>;
    return <p key={i}>{inline(trimmed)}</p>;
  })}</div>;
}

function Learn({ setView, profile, userId }: Props) {
  type ChatMessage = { role: "user" | "assistant"; content: string };
  const memoryKey = `funabacer.tutor.memory.v1.${userId || profile?.course || "unknown-user"}`;
  const initialMessage: ChatMessage = { role: "assistant", content: `Hi! I’m your FunaBAcer tutor for ${profile?.course || "your course"} in ${profile?.department || "your department"}. I’ll keep track of where we stop and continue from there.` };
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [tutorError, setTutorError] = useState("");
  const [sourceContext, setSourceContext] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [expression, setExpression] = useState("");
  const [calculation, setCalculation] = useState("");
  const [tutorFileBusy, setTutorFileBusy] = useState(false);
  const [tutorFileError, setTutorFileError] = useState("");
  const [tutorFileName, setTutorFileName] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(memoryKey) || "null");
      return Array.isArray(saved) && saved.length ? saved.slice(-40) : [initialMessage];
    } catch { return [initialMessage]; }
  });
  useEffect(() => {
    localStorage.setItem(memoryKey, JSON.stringify(messages.slice(-40)));
  }, [memoryKey, messages]);
  useEffect(() => {
    const pending = localStorage.getItem("funabacer.pending-question");
    if (pending) {
      localStorage.removeItem("funabacer.pending-question");
      setQuestion(pending);
      void (async () => { await new Promise((resolve) => setTimeout(resolve, 0)); })();
    }
  }, []);

  const askTutor = async (preset?: string) => {
    const message = (preset || question).trim();
    if (!message || isAsking) return;
    if (!profile?.department || !profile?.course) {
      setTutorError("Your department and programme are missing. Open Profile and complete your academic information before asking the Tutor.");
      return;
    }
    const asksForPractice = /\b(10|ten)\b.*\b(question|questions)\b|\b(question|questions)\b.*\b(10|ten)\b|set.*practice/i.test(message);
    if (asksForPractice) {
      localStorage.setItem("funabacer.pending-practice", JSON.stringify({ topic: profile.course, count: 10 }));
      setView("practice");
      return;
    }
    setIsAsking(true);
    setTutorError("");
    const nextMessages = [...messages, { role: "user" as const, content: message }];
    setMessages(nextMessages);
    setQuestion("");
    try {
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: messages.slice(-12),
          department: profile.department,
          course: profile.course,
          topic: "",
          sourceContext,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The tutor could not answer right now.");
      setMessages([...nextMessages, { role: "assistant", content: data.answer }]);
    } catch (error) {
      setTutorError(
        error instanceof Error ? error.message : "The tutor could not answer right now.",
      );
      setMessages(messages);
    } finally {
      setIsAsking(false);
    }
  };

  const calculate = () => {
    const safe = expression
      .replace(/[×x]/gi, "*")
      .replace(/÷/g, "/")
      .replace(/[^0-9+*/().%\s-]/g, "");
    if (!safe.trim()) return;
    try {
      const value = Function(`"use strict"; return (${safe})`)();
      setCalculation(
        Number.isFinite(value) ? String(Number(value.toFixed(8))) : "Not a valid result",
      );
    } catch {
      setCalculation("Check the expression");
    }
  };

  const attachTutorFile = async (file: File) => {
    if (!/^application\/pdf$|^image\/(png|jpeg|jpg)$/.test(file.type)) { setTutorFileError("Use a PDF, PNG, or JPG file."); return; }
    if (file.size > 4 * 1024 * 1024) { setTutorFileError("Please use a file under 4 MB."); return; }
    setTutorFileBusy(true); setTutorFileError("");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Could not read the file.")); reader.readAsDataURL(file); });
      const response = await fetch("/api/ai/document", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: file.name, type: file.type, dataUrl }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "The file could not be read.");
      setSourceContext(data.text || ""); setSourceName(data.name || file.name);
    } catch (error) { setTutorFileError(error instanceof Error ? error.message : "The file could not be read."); }
    finally { setTutorFileBusy(false); }
  };

  const quickPrompts = [
    `Explain ${profile?.course || "this course"} from the beginning`,
    `Give me 5 exam-style questions for ${profile?.course || "this course"}`,
    "Quiz me one question at a time",
  ];
  return (
    <Page
      title="AI Coach"
      eyebrow="YOUR PERSONAL TUTOR"
      subtitle={`${profile?.course || "Your course"} · Ask, practise, calculate and understand`}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><strong>Teaching context:</strong> {profile?.department || "Department missing"} · {profile?.course || "Programme missing"}. The Tutor uses this context and the saved conversation below; it will not guess a different programme.</div>
        <div className="overflow-hidden rounded-[28px] border border-[#c9ddd2] bg-[#071612] shadow-[0_28px_80px_-40px_#0b3d2d]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500">
                <Bot size={20} />
              </div>
              <div>
                <p className="text-sm font-extrabold">FunaBAcer Tutor</p>
                <p className="text-xs text-emerald-100/65">
                  {profile?.course || "Personalised study session"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCalculator((open) => !open)}
              className={`flex size-10 items-center justify-center rounded-full border transition ${showCalculator ? "border-emerald-300 bg-emerald-400 text-[#071612]" : "border-white/15 bg-white/10 text-white hover:bg-white/15"}`}
              aria-label="Open calculator"
            >
              ∑
            </button>
          </div>
          <div className="max-h-[58vh] space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === "user" ? "rounded-br-md bg-[#1d5fba] text-white" : "rounded-bl-md bg-white/10 text-emerald-50"}`}
                >
                  <TutorMessage content={message.content} />
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-sm text-emerald-100/70">
                  Thinking through that…
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-white/10 px-4 pb-4 pt-3 sm:px-6">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => askTutor(prompt)}
                  disabled={isAsking}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-emerald-100/75 hover:border-emerald-300 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
            {showCalculator && (
              <div className="mb-3 rounded-2xl border border-emerald-300/25 bg-white/10 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    Study calculator
                  </p>
                  <button
                    onClick={() => {
                      setExpression("");
                      setCalculation("");
                    }}
                    className="text-xs text-emerald-100/60"
                  >
                    Clear
                  </button>
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={expression}
                    onChange={(event) => setExpression(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && calculate()}
                    placeholder="e.g. (1 × 2) / 0.5"
                    className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#04100c] px-3 py-2 text-sm text-white outline-none focus:border-emerald-300"
                  />
                  <button
                    onClick={calculate}
                    className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-extrabold text-[#071612]"
                  >
                    =
                  </button>
                </div>
                {calculation && (
                  <p className="mt-2 text-right text-lg font-extrabold text-emerald-200">
                    {calculation}
                  </p>
                )}
                <p className="mt-2 text-[11px] text-emerald-100/50">
                  Use +, −, ×, ÷, brackets and percentages. Use the result to explain your working
                  to the tutor.
                </p>
              </div>
            )}
            {tutorFileName && <p className="mb-2 rounded-xl bg-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-100">Attached: {tutorFileName}. Gemini will use Grok’s extracted context.</p>}
            {tutorFileError && <p className="mb-2 rounded-xl bg-rose-400/15 px-3 py-2 text-xs font-semibold text-rose-100">{tutorFileError}</p>}
            {tutorError && (
              <p className="mb-3 rounded-xl bg-rose-400/15 p-3 text-xs font-semibold text-rose-100">
                {tutorError}
              </p>
            )}
            <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/10 p-2">
              <button
                onClick={() => document.getElementById("tutor-upload")?.click()}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl text-emerald-100/80 hover:bg-white/10"
                aria-label="Attach a PDF or image"
                title={tutorFileBusy ? "Reading file…" : "Attach a PDF or image"}
              >
                <Paperclip size={19} />
              </button>
              <input id="tutor-upload" className="sr-only" type="file" accept="application/pdf,image/png,image/jpeg" disabled={tutorFileBusy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void attachTutorFile(file); event.currentTarget.value = ""; }} />
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    askTutor();
                  }
                }}
                placeholder="Ask FunaBAcer anything…"
                rows={1}
                className="min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-emerald-100/45"
              />
              <button
                onClick={() => askTutor()}
                disabled={!question.trim() || isAsking}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[#071612] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-emerald-100/45">
              Enter to send · Shift + Enter for a new line · AI checks your course context
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#71877d]">
            Need a timed exam? Start CBT practice after your tutoring session.
          </p>
          <Btn onClick={() => setView("practice")}>
            <Target size={16} /> Test me
          </Btn>
        </div>
      </div>
    </Page>
  );
}
function Practice({ setView, profile }: Props) {
  type Question = { question: string; options: string[]; answer: number; explanation: string };
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [autoStart, setAutoStart] = useState(false);
  useEffect(() => { if (secondsLeft === null || secondsLeft <= 0) return; const timer = window.setInterval(() => setSecondsLeft((value) => value === null ? null : Math.max(value - 1, 0)), 1000); return () => window.clearInterval(timer); }, [secondsLeft]);
  useEffect(() => {
    const pending = localStorage.getItem("funabacer.pending-practice");
    if (!pending) return;
    localStorage.removeItem("funabacer.pending-practice");
    try { const request = JSON.parse(pending); if (request.topic) { setTopic(request.topic); setAutoStart(true); } } catch {}
  }, []);
  const generate = async () => {
    if (!profile?.course || !topic.trim()) return;
    setBusy(true); setFeedback(""); setQuestions([]); setAnswers({}); setSubmitted(false);
    try {
      const response = await fetch("/api/ai/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ course: profile.course, topic, count: 10 }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not generate questions");
      setQuestions(data.questions || []);
      setSecondsLeft(600);
    } catch (error) { setFeedback(error instanceof Error ? error.message : "Could not generate questions"); }
    finally { setBusy(false); }
  };
  useEffect(() => {
    if (!autoStart || !topic.trim()) return;
    setAutoStart(false);
    void generate();
  }, [autoStart, topic]);
  const submit = async () => {
    const correct = questions.reduce((sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0), 0);
    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    saveAttempt({ topicId: `${profile?.course}:${topic.trim()}`, score, total: questions.length, correct, at: Date.now() });
    setSubmitted(true);
    setBusy(true);
    try {
      const marking = questions.map((q, i) => `Question ${i + 1}: ${q.question}\nStudent answer: ${q.options[answers[i]]}\nCorrect answer: ${q.options[q.answer]}\nBuilt-in explanation: ${q.explanation}`).join("\n\n");
      const response = await fetch("/api/ai/tutor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `Mark my submitted ${topic} practice carefully. I scored ${correct}/${questions.length}. Explain every mistake, why it is wrong, the correct method, and what I should study next.\n\n${marking}`, history: [], department: profile?.department, course: profile?.course, topic }) });
      const data = await response.json();
      setFeedback(response.ok ? data.answer : `You scored ${correct}/${questions.length} (${score}%). Tutor feedback is temporarily unavailable.`);
    } catch { setFeedback(`You scored ${correct}/${questions.length} (${score}%). Tutor feedback is temporarily unavailable.`); }
    finally { setBusy(false); }
  };
  return <Page title="Practice" eyebrow="AI-GENERATED PRACTICE" subtitle={profile?.course ? `Questions for ${profile.course}` : "Choose your course first."}>
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-2xl border border-[#dcebe3] bg-white p-6"><label className="block text-sm font-bold text-[#365348]">Topic to practise<input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter a topic from your course scheme" className="mt-2 w-full rounded-xl border border-[#dcebe3] bg-[#f7faf8] px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400" /></label><Btn className="mt-4" onClick={generate} disabled={busy || !topic.trim() || !profile?.course}>{busy ? "Generating questions…" : "Select topic and start 10-minute sprint"}</Btn></div>
      {questions.length > 0 && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">10-minute sprint · {secondsLeft === null ? "Not started" : `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`} · Questions are generated for {topic}</div>}
      {questions.map((q, i) => <div key={i} className={`rounded-2xl border p-6 ${submitted ? answers[i] === q.answer ? "border-emerald-300 bg-emerald-50/50" : "border-rose-300 bg-rose-50/50" : "border-[#dcebe3] bg-white"}`}><div className="flex items-start justify-between gap-3"><p className="font-bold leading-7">{i + 1}. {q.question}</p>{submitted && <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-extrabold ${answers[i] === q.answer ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800"}`}>{answers[i] === q.answer ? "Correct" : "Incorrect"}</span>}</div><div className="mt-4 space-y-2">{q.options.map((option, j) => <button key={option} disabled={submitted} onClick={() => setAnswers({ ...answers, [i]: j })} className={`w-full rounded-xl border p-3 text-left text-sm ${submitted && j === q.answer ? "border-emerald-500 bg-emerald-100 font-bold" : submitted && answers[i] === j ? "border-rose-500 bg-rose-100" : answers[i] === j ? "border-emerald-500 bg-emerald-50" : "border-[#dcebe3]"}`}>{String.fromCharCode(65 + j)}. {option}{submitted && j === q.answer ? " · Correct answer" : ""}</button>)}</div>{submitted && <p className="mt-4 rounded-xl bg-white/70 p-3 text-sm leading-6 text-[#365348]"><strong>Explanation:</strong> {q.explanation}</p>}</div>)}
      {questions.length > 0 && <Btn onClick={submit} disabled={Object.keys(answers).length !== questions.length}>Submit all answers to the tutor <ArrowRight size={16} /></Btn>}
      {feedback && <div className="rounded-2xl bg-emerald-50 p-5 text-sm font-semibold text-emerald-800"><span className="mb-2 block text-xs uppercase tracking-wider text-emerald-700">Saved to today’s progress</span>{feedback} <button className="ml-2 underline" onClick={() => setView("learn")}>Open AI Tutor</button></div>}
    </div>
  </Page>;
}
function Review({ setView }: Props) {
  return <Page title="Question review" eyebrow="YOUR REVIEW" subtitle="Review is created from your submitted answers, not from demo content.">
    <div className="mx-auto max-w-2xl rounded-2xl border border-[#dcebe3] bg-white p-7 text-center"><h2 className="text-2xl font-extrabold">No submitted answers to review</h2><p className="mt-3 leading-7 text-[#71877d]">Complete a real practice session and submit it. The Tutor will then explain each mistake from your own answers.</p><Btn className="mt-6" onClick={() => setView("practice")}><Target size={16}/> Start practice</Btn></div>
  </Page>;
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
          [`${realStats().score ?? 0}%`, "Overall mastery", realStats().answered ? "From submitted work" : "No submitted work yet"],
          [String(realStats().answered), "Questions answered", realStats().answered ? "Your account" : "Start your first lesson"],
          [`${realStats().studyDays} days`, "Study streak", realStats().studyDays ? "Based on study activity" : "No study activity yet"],
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
          {attemptedTopics().length === 0 ? <p className="mt-6 rounded-xl bg-[#fbfdfc] p-5 text-sm leading-6 text-[#71877d]">No mastery data yet. Scores will appear here only after you submit real practice answers.</p> : attemptedTopics().map((t) => (
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

function DocumentAttachment({ onProcessed, name }: { onProcessed: (text: string, name: string) => void; name?: string }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const process = async (file: File) => {
    if (!/^application\/pdf$|^image\/(png|jpeg|jpg)$/.test(file.type)) { setError("Use a PDF, PNG, or JPG file."); return; }
    if (file.size > 4 * 1024 * 1024) { setError("Please use a file under 4 MB."); return; }
    setBusy(true); setError(""); setStatus("Reading your document with Grok…");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Could not read the file.")); reader.readAsDataURL(file); });
      const response = await fetch("/api/ai/document", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: file.name, type: file.type, dataUrl }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Grok could not read the file.");
      onProcessed(data.text, data.name || file.name); setStatus("Document read. Gemini will use it as tutor context.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The document could not be processed."); setStatus(""); }
    finally { setBusy(false); }
  };
  return <div className="rounded-2xl border border-dashed border-emerald-400/35 bg-emerald-400/5 p-5">
    <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-[#244138]"><span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500 text-white"><Paperclip size={18} /></span><span>{busy ? "Grok is reading…" : name ? `Attached: ${name}` : "Attach a PDF or image"}<span className="mt-1 block text-xs font-normal text-[#71877d]">Grok reads it, then Gemini teaches from it · max 4 MB</span></span><input className="sr-only" type="file" accept="application/pdf,image/png,image/jpeg" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void process(file); event.currentTarget.value = ""; }} /></label>
    {status && <p className="mt-3 text-xs font-semibold text-emerald-700">{status}</p>}
    {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
  </div>;
}

function Notes() {
  const [source, setSource] = useState<{ text: string; name: string } | null>(null);
  return (
    <Page
      title="Note Cruncher"
      eyebrow="STUDY MATERIALS"
      subtitle="Turn your class notes into something you can actually revise."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <div>
          <DocumentAttachment onProcessed={(text, name) => setSource({ text, name })} />
          {source && <div className="mt-4 rounded-xl bg-white p-4 text-left"><p className="text-sm font-bold">{source.name} is ready for Gemini</p><p className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[#71877d]">{source.text}</p></div>}
        </div>
        <div className="rounded-2xl border border-[#dcebe3] bg-white p-6">
          <h2 className="font-extrabold">Recent study sets</h2>
          <div className="mt-5 space-y-3">
            {[].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-[#fbfdfc] p-3">
                <BookOpen size={16} className="text-emerald-700" />
                <span className="flex-1 text-sm font-semibold text-[#365348]">{item}</span>
                <ChevronRight size={16} className="text-[#8ca198]" />
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-[#71877d]">No study sets yet. Upload your first material to create one.</p>
        </div>
      </div>
    </Page>
  );
}
function Profile({ setView, profile, onEdit }: Props & { onEdit?: () => void }) {
  return (
    <Page
      title="Your profile"
      eyebrow="STUDENT PROFILE"
      subtitle="A quick picture of how you are progressing toward exam day."
    >
      <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        <section className="rounded-2xl border border-[#dcebe3] bg-white p-7 text-center">
          <AvatarPicker />
          <h2 className="mt-5 text-xl font-extrabold">Your profile</h2>
          <p className="mt-1 text-sm text-[#71877d]">{profile?.department || "Department not selected"} · {profile?.course || "Course not selected"}</p>
          <div className="mt-7 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-[#fbfdfc] p-4">
              <p className="text-xl font-extrabold">{realStats().score ?? 0}%</p>
              <p className="mt-1 text-xs text-[#71877d]">Overall progress</p>
            </div>
            <div className="rounded-xl bg-[#fbfdfc] p-4">
              <p className="text-xl font-extrabold text-emerald-700">{realStats().answered ? "Active" : "Not started"}</p>
              <p className="mt-1 text-xs text-[#71877d]">Exam status</p>
            </div>
          </div>
          <Btn variant="outline" className="mt-6 w-full" onClick={onEdit}>
            Change programme <Settings size={16} />
          </Btn>
        </section>
        <section className="rounded-2xl border border-[#dcebe3] bg-white p-7">
          <h2 className="font-extrabold">Your study identity</h2>
          <div className="mt-6 space-y-4">
            {[
              ["Department", profile?.department || "Not selected"],
              ["Course", profile?.course || "Not selected"],
              ["Current streak", `${realStats().studyDays} days`],
              ["Submitted answers", String(realStats().answered)],
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
function SettingsPage({ theme, setTheme }: { theme: Theme; setTheme: (theme: Theme) => void }) {
  return (
    <Page title="Settings" eyebrow="PREFERENCES" subtitle="Make FunaBAcer fit the way you study.">
      <div className="max-w-2xl rounded-2xl border border-[#dcebe3] bg-white p-6">
        <div className="flex items-center gap-4 border-b border-[#dcebe3] py-5">
          <Sun size={17} className="text-emerald-700" />
          <div className="flex-1">
            <p className="font-bold">Appearance</p>
            <p className="mt-1 text-xs text-[#71877d]">
              Choose the calm daytime or focused night workspace.
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === "day" ? "night" : "day")}
            className="rounded-full bg-[#eff7f2] px-3 py-2 text-xs font-bold text-emerald-700"
          >
            {theme === "day" ? "Day theme" : "Night theme"}
          </button>
        </div>
        <label className="flex items-center gap-4 border-b border-[#dcebe3] py-5">
          <span className="flex-1">
            <span className="block font-bold">Daily study reminders</span>
            <span className="mt-1 block text-xs text-[#71877d]">
              Get a nudge when it is time to continue your plan.
            </span>
          </span>
          <input type="checkbox" defaultChecked className="size-5 accent-emerald-500" />
        </label>
        <label className="flex items-center gap-4 border-b border-[#dcebe3] py-5">
          <span className="flex-1">
            <span className="block font-bold">AI tutor voice</span>
            <span className="mt-1 block text-xs text-[#71877d]">
              Allow spoken explanations when audio is available.
            </span>
          </span>
          <input type="checkbox" defaultChecked className="size-5 accent-emerald-500" />
        </label>
        <label className="flex items-center gap-4 border-b border-[#dcebe3] py-5">
          <span className="flex-1">
            <span className="block font-bold">Explanation depth</span>
            <span className="mt-1 block text-xs text-[#71877d]">
              How much context the tutor gives before checking understanding.
            </span>
          </span>
          <select className="rounded-lg border border-[#c9ddd2] bg-[#f7faf8] px-3 py-2 text-xs font-bold text-[#244138]">
            <option>Balanced</option>
            <option>Simple first</option>
            <option>Detailed</option>
          </select>
        </label>
        <div className="border-t border-[#dcebe3] py-5">
          <div className="flex items-center gap-4"><Settings size={17} className="text-emerald-700" /><div><p className="font-bold">Account and Exam Pass</p><p className="mt-1 text-xs text-[#71877d]">Manual payment activation is available below.</p></div></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[#eff7f2] p-4"><p className="font-bold">Monthly · ₦500</p><p className="mt-1 text-xs text-[#71877d]">Limited capacity</p></div><div className="rounded-xl bg-[#eff7f2] p-4"><p className="font-bold">Semester · ₦1,500</p><p className="mt-1 text-xs text-[#71877d]">Full capacity</p></div></div>
          <p className="mt-4 text-sm leading-6 text-[#365348]">Pay to PalmPay <strong>8130760557</strong> · <strong>Praise Onoja</strong>, then send your receipt on WhatsApp to <strong>9112834887</strong>. An unlock code will be issued after verification.</p>
          <a href="https://wa.me/2349112834887" target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-white">Send receipt on WhatsApp</a>
        </div>
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
  const [course, setCourse] = useState("");
  const programmes = funaabDepartments.flatMap((item) => item.courses.map((name) => ({ name, department: item.group })));
  const selected = programmes.find((item) => item.name === course);
  const finish = async () => {
    if (!selected) return;
    const profile = { department: selected.department, course: selected.name };
    await supabase.auth.updateUser({ data: profile });
    localStorage.setItem("funabacer-profile", JSON.stringify(profile));
    done(profile);
  };
  return <div className="min-h-screen bg-[#f7faf8] px-5 py-8 sm:px-8 sm:py-12"><div className="mx-auto max-w-5xl"><Logo /><div className="mt-14 grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-700">PERSONALISE YOUR STUDY PLAN</p><h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#10231c] sm:text-5xl">Choose your exact programme.</h1><p className="mt-5 max-w-md text-base leading-7 text-[#587166]">Select the programme you actually study. FunaBAcer will automatically attach it to the correct department and will not show unrelated programmes.</p><div className="mt-8 text-sm font-semibold text-emerald-700"><span className="mr-3 inline-flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white">1</span>Programme first</div></div><div className="rounded-3xl border border-[#dcebe3] bg-white p-6 shadow-[0_24px_70px_-36px_#31634c] sm:p-8"><label className="block text-sm font-bold text-[#244138]">What programme are you studying?<select value={course} onChange={(event) => setCourse(event.target.value)} className="mt-3 w-full rounded-xl border border-[#c9ddd2] bg-[#f7faf8] px-4 py-3.5 text-[#10231c] outline-none focus:ring-2 focus:ring-emerald-400"><option value="">Select your programme</option>{programmes.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>{selected && <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900"><strong>Department:</strong> {selected.department}<br/><strong>Programme:</strong> {selected.name}</div>}<button onClick={finish} disabled={!selected} className="mt-8 w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-[#dcebe3] disabled:text-[#8ca198]">Build my study plan <ArrowRight className="ml-2 inline-block" size={16}/></button><p className="mt-4 text-center text-xs text-[#8ca198]">You can change your programme later from Profile.</p></div></div></div></div>;
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#10231c]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-3">
          <button
            onClick={onStart}
            className="hidden text-sm font-bold text-[#587166] hover:text-emerald-700 sm:block"
          >
            Log in
          </button>
          <Btn onClick={onStart} className="px-5">
            Start learning
          </Btn>
        </div>
      </header>
      <main>
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-24">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-emerald-700 shadow-sm">
              THE AI STUDY SYSTEM FOR FUNAAB
            </p>
            <h1 className="mt-7 text-5xl font-extrabold leading-[.98] tracking-[-.05em] text-[#10231c] sm:text-7xl">
              Don’t just practise questions.
              <br />
              <span className="text-emerald-600">Understand what you’re learning.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#587166] sm:text-xl">
              FunaBAcer teaches your course topics, gives you realistic CBT practice, diagnoses your
              mistakes and keeps reteaching until the idea finally makes sense.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Btn onClick={onStart} className="px-6 py-4">
                <Play size={17} fill="currentColor" /> Start my study journey
              </Btn>
              <button
                onClick={() =>
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center gap-2 rounded-xl border border-[#c9ddd2] bg-white px-5 py-4 text-sm font-bold text-[#244138] hover:border-emerald-400"
              >
                See how it works <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
        <section className="bg-[#063b2a] px-5 py-16 text-white sm:px-8 sm:py-24" id="how-it-works">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">
                THE FUNABACER LOOP
              </p>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                A tutor that follows the gap, not just the syllabus.
              </h2>
              <p className="mt-5 text-base leading-7 text-emerald-50/75">
                Most study apps stop at right or wrong. FunaBAcer uses your answers to decide what
                to teach you next.
              </p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-4">
              {[
                ["01", "Learn", "AI explains the topic from the level you need."],
                ["02", "Practise", "Answer real and generated CBT questions."],
                ["03", "Diagnose", "Your mistake becomes a teaching signal."],
                ["04", "Master", "The AI simplifies, reteaches and re-tests you."],
              ].map(([number, title, detail]) => (
                <div key={number} className="rounded-2xl border border-white/15 bg-white/10 p-5">
                  <span className="text-sm font-black text-emerald-300">{number}</span>
                  <h3 className="mt-10 text-xl font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/70">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">
                ONE PLACE TO STUDY
              </p>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Everything you need for your next exam.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#587166]">
                Choose your FUNAAB department and course, then get a study space built around what
                you actually need to understand.
              </p>
              <Btn onClick={onStart} className="mt-7">
                Choose my course <ArrowRight size={16} />
              </Btn>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [
                  <BookOpen size={20} />,
                  "AI Learning",
                  "Step-by-step teaching that adapts to your answers.",
                ],
                [
                  <Target size={20} />,
                  "CBT Practice",
                  "Timed past questions for your course and topic.",
                ],
                [
                  <FileText size={20} />,
                  "Note Cruncher",
                  "Summaries, flashcards and questions from your notes.",
                ],
                [
                  <BarChart3 size={20} />,
                  "Mastery map",
                  "See weak topics and your recommended next lesson.",
                ],
              ].map(([icon, title, detail]) => (
                <div
                  key={title as string}
                  className="rounded-2xl border border-[#dcebe3] bg-white p-5 shadow-[0_18px_50px_-40px_#31634c]"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    {icon}
                  </span>
                  <h3 className="mt-5 font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#71877d]">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="border-t border-[#dcebe3] bg-white px-5 py-14 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-extrabold">Start with the thing you need help with.</h2>
              <p className="mt-2 text-sm text-[#71877d]">
                Your next useful study session is one click away.
              </p>
            </div>
            <Btn onClick={onStart}>
              Create my free account <ArrowRight size={16} />
            </Btn>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-6xl items-center justify-between px-5 py-7 text-xs text-[#8ca198] sm:px-8">
        <span>© 2026 FunaBAcer</span>
        <span>Built for FUNAAB students</span>
      </footer>
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
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("funabacer-theme") as Theme) || "day"
      : "day",
  );
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const metadata = data.session?.user.user_metadata as
        { department?: string; course?: string } | undefined;
      if (metadata?.department && metadata.course) {
        const savedProfile = { department: metadata.department, course: metadata.course };
        localStorage.setItem("funabacer-profile", JSON.stringify(savedProfile));
        setProfile(savedProfile);
      } else {
        try {
          const savedProfile = JSON.parse(localStorage.getItem("funabacer-profile") || "null");
          if (savedProfile?.department && savedProfile?.course) setProfile(savedProfile);
        } catch {
          localStorage.removeItem("funabacer-profile");
        }
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
  if (typeof window !== "undefined" && window.location.pathname === "/admin") return <AdminPanel />;
  if (!session)
    return authOpen ? (
      <Auth done={() => setSession({ loggedIn: true })} />
    ) : (
      <Landing onStart={() => setAuthOpen(true)} />
    );
  if (needsOnboarding)
    return (
      <Onboarding
        done={(nextProfile) => {
          setProfile(nextProfile);
          setNeedsOnboarding(false);
        }}
      />
    );
  let content: ReactNode;
  const userId = typeof session === "object" && session && "user" in session ? String((session as { user?: { id?: string } }).user?.id || "") : "";
  const props = { setView, profile, userId };
  if (view === "dashboard") content = <Home {...props} />;
  else if (view === "overview") content = <Dashboard {...props} />;
  else if (view === "courses") content = <Courses {...props} />;
  else if (view === "topic") content = <Topic {...props} />;
  else if (view === "learn") content = <Learn {...props} profile={profile} />;
  else if (view === "practice") content = <Practice {...props} profile={profile} />;
  else if (view === "review") content = <Review {...props} />;
  else if (view === "results") content = <Results {...props} />;
  else if (view === "notes") content = <Notes />;
  else if (view === "profile") content = <Profile {...props} profile={profile} onEdit={async () => { await supabase.auth.updateUser({ data: { department: null, course: null } }); localStorage.removeItem("funabacer-profile"); setProfile(null); setNeedsOnboarding(true); }} />;
  else if (view === "admin") content = <AdminPanel />;
  else
    content = (
      <SettingsPage
        theme={theme}
        setTheme={(next) => {
          setTheme(next);
          localStorage.setItem("funabacer-theme", next);
        }}
      />
    );
  return (
    <div className={`app-shell theme-${theme} flex min-h-screen bg-[#f7faf8] text-[#10231c]`}>
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
                ["notes", "Note Cruncher"],
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
        <Topbar
          theme={theme}
          setTheme={(next) => {
            setTheme(next);
            localStorage.setItem("funabacer-theme", next);
          }}
          openMobile={() => setMobile(true)}
          setView={setView}
        />
        <div className="mx-auto max-w-[1220px] pb-24 lg:pb-0">{content}</div>
      </main>
      <BottomNav view={view} setView={setView} />
    </div>
  );
}
