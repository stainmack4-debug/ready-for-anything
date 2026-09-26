import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

type Provider = { name: string; url: string; key?: string; model: string; timeoutMs: number };

// Gemini first (with Google's rolling aliases), then NVIDIA as the backup when Gemini is overloaded.
function providers(): Provider[] {
  const geminiUrl = (
    process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai"
  ).replace(/\/$/, "");
  const geminiKey = process.env.GEMINI_API_KEY;
  const geminiModels = [
    ...new Set([
      process.env.GEMINI_MODEL || "gemini-3.6-flash",
      "gemini-flash-latest",
      "gemini-flash-lite-latest",
    ]),
  ];
  const list: Provider[] = geminiModels.map((model) => ({
    name: "gemini",
    url: geminiUrl,
    key: geminiKey,
    model,
    timeoutMs: 25000,
  }));
  list.push({
    name: "nvidia",
    url: (process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/$/, ""),
    key: process.env.NVIDIA_API_KEY,
    model: process.env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct",
    timeoutMs: 40000,
  });
  return list.filter((p) => p.key);
}

// 503 (overloaded) and 429 (rate limited) are temporary, so they are worth retrying.
const RETRYABLE = new Set([429, 500, 503]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SUPERSCRIPTS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "-": "⁻",
  "+": "⁺",
  n: "ⁿ",
  x: "ˣ",
};
const SYMBOLS: Record<string, string> = {
  times: "×",
  cdot: "·",
  div: "÷",
  pm: "±",
  mp: "∓",
  le: "≤",
  leq: "≤",
  ge: "≥",
  geq: "≥",
  neq: "≠",
  ne: "≠",
  approx: "≈",
  infty: "∞",
  pi: "π",
  theta: "θ",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  Delta: "Δ",
  lambda: "λ",
  mu: "μ",
  sigma: "σ",
  omega: "ω",
  Omega: "Ω",
  rho: "ρ",
  phi: "φ",
  epsilon: "ε",
  degree: "°",
  circ: "°",
  rightarrow: "→",
  to: "→",
  Rightarrow: "⇒",
  therefore: "∴",
  sum: "Σ",
  int: "∫",
  partial: "∂",
};
const toSuper = (s: string) =>
  [...s].every((c) => SUPERSCRIPTS[c]) ? [...s].map((c) => SUPERSCRIPTS[c]).join("") : `^(${s})`;
// Wrap multi-character pieces in brackets so √(3x+1) and (a+b)/(c) stay unambiguous.
const group = (s: string) => (/^[\w.√]+$/.test(s) ? s : `(${s})`);

// The Practice screen shows plain text, so convert LaTeX the AI may still emit into readable Unicode math.
function cleanMath(input: string): string {
  let s = input.replace(/\$\$?/g, "").replace(/\\\(|\\\)|\\\[|\\\]/g, "");
  s = s.replace(/\\(?:left|right|displaystyle|,|;|!|quad|qquad)/g, " ");
  s = s.replace(/\\text\{([^{}]*)\}|\\mathrm\{([^{}]*)\}/g, (_m, a, b) => a ?? b);
  // Resolve innermost commands first so nested fractions and roots work.
  for (let i = 0; i < 10; i++) {
    const before = s;
    s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, a, b) => `${group(a)}/${group(b)}`);
    s = s.replace(/\\sqrt\[([^\]]*)\]\{([^{}]*)\}/g, (_m, n, x) => `${toSuper(n)}√${group(x)}`);
    s = s.replace(/\\sqrt\{([^{}]*)\}/g, (_m, x) => `√${group(x)}`);
    s = s.replace(/\^\{([^{}]*)\}/g, (_m, x) => toSuper(x));
    s = s.replace(/_\{([^{}]*)\}/g, (_m, x) => `_${x}`);
    if (s === before) break;
  }
  s = s.replace(/\\sqrt\s*(\w)/g, "√$1");
  s = s.replace(/\^(\w)/g, (_m, x) => toSuper(x));
  s = s.replace(/\\([A-Za-z]+)/g, (m, name) => SYMBOLS[name] ?? m.slice(1));
  return s
    .replace(/[{}]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

type RawQuestion = {
  topic?: unknown;
  question?: unknown;
  options?: unknown;
  answer?: unknown;
  explanation?: unknown;
};

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    /* fall through */
  }
  const arr = cleaned.match(/\[[\s\S]*\]/);
  if (arr) {
    try {
      return JSON.parse(arr[0]);
    } catch {
      /* fall through */
    }
  }
  const obj = cleaned.match(/\{[\s\S]*\}/);
  if (obj) {
    try {
      return JSON.parse(obj[0]);
    } catch {
      /* fall through */
    }
  }
  return null;
}

// Accept either a bare array or {"questions":[...]}, drop malformed items, and clean up math notation.
function normalise(parsed: unknown, fallbackTopic: string) {
  const items: unknown[] = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as { questions?: unknown }).questions)
      ? (parsed as { questions: unknown[] }).questions
      : [];
  return items
    .map((item) => item as RawQuestion)
    .filter(
      (q) => typeof q.question === "string" && Array.isArray(q.options) && q.options.length === 4,
    )
    .map((q) => ({
      topic: cleanMath(typeof q.topic === "string" ? q.topic : fallbackTopic),
      question: cleanMath(String(q.question)),
      options: (q.options as unknown[]).map((o) => cleanMath(String(o))),
      answer: Math.min(Math.max(Number(q.answer) || 0, 0), 3),
      explanation: typeof q.explanation === "string" ? cleanMath(q.explanation) : "",
    }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  let body: Record<string, unknown>;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid request." });
  }
  const course = String(body.course || "").trim();
  const topic = String(body.topic || "").trim();
  const count = Math.min(Math.max(Number(body.count) || 10, 1), 100);
  const level = String(body.level || "").trim() || "all levels";
  if (!course || !topic) return res.status(400).json({ error: "Choose a course and topic first." });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const cacheHeaders = supabaseKey
    ? {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      }
    : null;
  const cacheUrl = supabaseUrl
    ? `${supabaseUrl.replace(/\/$/, "")}/rest/v1/sprint_question_banks`
    : "";
  if (cacheHeaders && cacheUrl) {
    try {
      const cachedResponse = await fetch(
        `${cacheUrl}?programme=eq.${encodeURIComponent(course)}&level=eq.${encodeURIComponent(level)}&topic=eq.${encodeURIComponent(topic)}&select=questions,question_count&limit=1`,
        { headers: cacheHeaders },
      );
      const cached = await cachedResponse.json().catch(() => []);
      const row = Array.isArray(cached) ? cached[0] : null;
      if (row && Array.isArray(row.questions) && row.questions.length >= Math.min(count, 10)) {
        return res.status(200).json({
          questions: row.questions.slice(0, count),
          provider: "shared-course-bank",
          cached: true,
        });
      }
    } catch (error) {
      console.warn("Shared question-bank lookup failed", error);
    }
  }

  const list = providers();
  if (list.length === 0)
    return res
      .status(503)
      .json({ error: "No AI key (GEMINI_API_KEY or NVIDIA_API_KEY) is set on Vercel." });

  const system =
    "You write university exam practice questions. You reply with a raw JSON array only. No markdown, no commentary.";
  const prompt = `Create ${count} original FUNAAB (Federal University of Agriculture, Abeokuta) style exam practice questions for the course "${course}" at ${level} on the topic "${topic}".
Reply with ONLY a JSON array like:
[{"topic":"specific concept","question":"...","options":["A","B","C","D"],"answer":0,"explanation":"why the correct option is right"}]
Exactly ${count} items, exactly 4 options each, "answer" is the index 0-3 of the correct option. Stay strictly on "${topic}".
IMPORTANT formatting: write all maths in plain text with Unicode symbols, NOT LaTeX. Use √ for roots (√75, √(3x+1)), ² ³ for powers, / for fractions ((3√5 + 2√3)/11), ×, ÷, ±, π, θ, ≤, ≥. Never use $, backslashes or commands like \\sqrt or \\frac. Do not put letter labels like "A." inside the options.`;

  const errors: string[] = [];
  for (const provider of list) {
    // Up to 2 tries per model when the provider reports it is busy.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), provider.timeoutMs);
        const upstream = await fetch(`${provider.url}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: provider.model,
            temperature: 0.3,
            max_tokens: count > 20 ? 18000 : 6000,
            messages: [
              { role: "system", content: system },
              { role: "user", content: prompt },
            ],
          }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timer));
        const payload = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
          const reason = String(
            payload?.error?.message ||
              payload?.detail ||
              payload?.[0]?.error?.message ||
              "rejected",
          ).slice(0, 120);
          console.error(
            "Question provider error",
            provider.name,
            provider.model,
            attempt,
            upstream.status,
            JSON.stringify(payload),
          );
          if (RETRYABLE.has(upstream.status) && attempt < 2) {
            await sleep(1500);
            continue;
          }
          errors.push(`${provider.model} ${upstream.status}: ${reason}`);
          break;
        }
        const text = String(payload?.choices?.[0]?.message?.content || "");
        const questions = normalise(extractJson(text), topic);
        if (questions.length === 0) {
          console.error("No usable questions", provider.model, text.slice(0, 1500));
          errors.push(`${provider.model}: no usable questions`);
          break;
        }
        const result = questions.slice(0, count);
        if (cacheHeaders && cacheUrl && result.length >= Math.min(count, 10)) {
          try {
            await fetch(cacheUrl, {
              method: "POST",
              headers: { ...cacheHeaders, Prefer: "resolution=merge-duplicates,return=minimal" },
              body: JSON.stringify({
                programme: course,
                level,
                topic,
                questions: result,
                question_count: result.length,
              }),
            });
          } catch (error) {
            console.warn("Shared question-bank write failed", error);
          }
        }
        return res.status(200).json({ questions: result, provider: provider.model, cached: false });
      } catch (error) {
        const aborted = error instanceof Error && error.name === "AbortError";
        errors.push(
          `${provider.model}: ${aborted ? "timed out" : error instanceof Error ? error.message : "request failed"}`,
        );
        break;
      }
    }
  }
  const detail = errors.join(" | ");
  console.error("Question generation failed", detail);
  const busy = errors.some((e) => / (429|503):/.test(e));
  const message = busy
    ? "The AI is very busy right now. Please try again in a minute."
    : "Questions could not be generated right now.";
  return res.status(502).json({ error: `${message} (${detail})`, detail });
}
