export type Attempt = {
  id?: string;
  topicId: string;
  score: number; // 0-100
  total: number;
  correct: number;
  at: number;
};

// Temporary UI cache only. Supabase is the source of truth for authenticated users.
const KEY = "funabacer.attempts.v2";

export function getAttempts(): Attempt[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as Attempt[];
  } catch {
    return [];
  }
}

export function replaceAttempts(attempts: Attempt[]) {
  if (typeof window === "undefined") return;
  const unique = attempts.filter(
    (attempt, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.id && attempt.id
            ? candidate.id === attempt.id
            : candidate.topicId === attempt.topicId && candidate.at === attempt.at,
      ) === index,
  );
  window.localStorage.setItem(KEY, JSON.stringify(unique.slice(-200)));
}

export function saveAttempt(a: Attempt) {
  replaceAttempts([...getAttempts(), a]);
}

export type Mastery = "strong" | "practice" | "weak" | "new";

/** Mastery = average of last 3 scores for the topic. */
export function topicMastery(topicId: string): { mastery: Mastery; score: number } {
  const scores = getAttempts()
    .filter((a) => a.topicId === topicId)
    .slice(-3)
    .map((a) => a.score);
  if (scores.length === 0) return { mastery: "new", score: 0 };
  const avg = Math.round(scores.reduce((s, x) => s + x, 0) / scores.length);
  return {
    mastery: avg >= 80 ? "strong" : avg >= 50 ? "practice" : "weak",
    score: avg,
  };
}

export function totalAnswered(): number {
  return getAttempts().reduce((s, a) => s + a.total, 0);
}

export function averageScore(): number | null {
  const all = getAttempts();
  if (all.length === 0) return null;
  return Math.round(all.reduce((s, a) => s + a.score, 0) / all.length);
}
