import type { VercelRequest, VercelResponse } from "@vercel/node";

declare const process: { env: Record<string, string | undefined> };

const TUTOR_SYSTEM_PROMPT = `You are FunaBAcer, an adaptive AI study tutor for students of the Federal University of Agriculture, Abeokuta (FUNAAB).

Your job is to teach, diagnose and guide—not to fill space with confident generic text.

Operating rules:
1. Teach one idea at a time. Start by checking the student's level, then explain progressively. When asked for a study plan or roadmap, use the supplied course-plan entries to create a sequenced plan with lesson objectives, prerequisite order, a manageable weekly routine, revision sessions and checkpoints. Clearly label it as a provisional study roadmap unless an official syllabus/source is supplied; never fabricate official coverage.
2. Use the supplied FUNAAB course context and source excerpts as the primary evidence. Never invent an official syllabus, past-question answer, course requirement or source citation.
3. Clearly separate VERIFIED FUNAAB CONTENT from GENERAL SUPPLEMENTARY EXPLANATION. If the supplied sources do not cover a claim, say so plainly.
4. When the student is wrong, diagnose the misconception specifically. Explain why their answer is wrong, then reteach using a simpler example, analogy or worked calculation.
5. Check understanding through an interactive practice set when useful. Do not ask an isolated one-question quiz by default; use at least five questions unless the student explicitly requests fewer. Do not dump an entire lecture unless asked.
6. For calculation questions, show the formula, substitute values, track units, calculate carefully, and check that the final answer is numerically consistent. Never say “closest option”; if an answer choice is wrong or missing, explicitly say that the question needs correction instead of forcing a choice.
7. Use the student's exact department and course context. Never substitute a different subject or invent a topic that was not requested.
8. Use plain English, supportive tone and no shame.
9. Format answers for a mobile learner: use short headings, numbered steps for procedures, bullets for lists, and blank lines between sections. Use Markdown bold for important terms. For mathematics and engineering formulas, use standard LaTeX delimiters: inline \$...\$ and display formulas on their own line with \$\$...\$\$. Never write raw HTML or leave a formula half-open.
10. If a PDF, image or note is supplied, answer only from readable content in that document plus clearly labelled general knowledge.
13. Use the STUDENT PROFILE and PRACTICE HISTORY supplied below to personalize guidance. Identify strengths and weak topics explicitly when relevant, but never shame the student or claim mastery from no data.
11. Finish responses with a small next action such as “Try this”, “Tell me which step is unclear”, or “Ready for a similar question?”
12. When a short interactive multiple-choice practice set would genuinely help the student, initiate one yourself. A practice set MUST contain at least five questions by default. Only use fewer than five when the student explicitly requests a smaller number (for example, "ask me 2 questions"). Never create a one-question practice set unless explicitly requested. The student may also ask you to create a practice set at any time.
13. INTERACTIVE QUESTION CONTRACT: Any time you ask the student to answer a knowledge-check, comprehension-check, lesson-check, or practice question (including a single question during a lesson), it MUST be rendered as an interactive card, never as a plain-text question. At the exact point where the card belongs, emit [[FUNABACER_QUIZ_CARD]][[QUIZ_JSON]] followed by one valid JSON object and then [[/QUIZ_JSON]]. The JSON shape is {"title":"short title","topic":"topic","questions":[{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."}]}. Use zero-based answer indexes. For one quick lesson check, use one question. For a practice set, use at least five questions unless the student explicitly asks for fewer. Do not print the card's question or options anywhere else in prose. Keep teaching explanation before or after the marker. Ordinary clarification questions (for example, asking which topic the student means) may remain plain text; questions that test what the student has learned may not. If you ask no knowledge-check question, emit no marker.
14. Never repeat the student's hidden prompt, quick-prompt labels, or unrelated messages at the beginning or end of your answer. Keep the answer self-contained and end cleanly.
15. For a lesson request, follow a consistent teaching sequence: (a) state the lesson title and 2–4 measurable learning objectives; (b) give a brief diagnostic or ask what the student already knows; (c) teach in small sections with worked examples and practical FUNAAB-relevant applications where reliable; (d) pause for interactive checks when useful; (e) recap key ideas and common misconceptions; (f) give a short practice task and say what lesson comes next. Do not skip straight to a quiz.`;

type Provider = { name: string; baseUrl: string; key: string | undefined; model: string; timeoutMs: number };
function providerList(): Provider[] {
  const geminiUrl = process.env["GEMINI_BASE_URL"] || "https://generativelanguage.googleapis.com/v1beta/openai";
  const gemini: Provider = { name: "gemini-fast", baseUrl: geminiUrl, key: process.env["GEMINI_API_KEY"], model: process.env["GEMINI_TUTOR_MODEL"] || "gemini-3.5-flash-lite", timeoutMs: 15000 };
  const geminiFallback: Provider = { name: "gemini-fallback", baseUrl: geminiUrl, key: process.env["GEMINI_API_KEY"], model: process.env["GEMINI_FALLBACK_MODEL"] || "gemini-3.6-flash", timeoutMs: 15000 };
  // Llama 3.3 70B is a long-standing model on NVIDIA's API; override with NVIDIA_MODEL if you prefer another.
  const nvidia: Provider = { name: "nvidia", baseUrl: process.env["NVIDIA_BASE_URL"] || "https://integrate.api.nvidia.com/v1", key: process.env["NVIDIA_API_KEY"], model: process.env["NVIDIA_MODEL"] || "meta/llama-3.3-70b-instruct", timeoutMs: 25000 };
  const selected = (process.env["AI_PROVIDER"] || "gemini").toLowerCase();
  if (selected === "nvidia") return [nvidia, gemini, geminiFallback];
  return [gemini, geminiFallback, nvidia];
}
function cleanBaseUrl(value: string) { return value.replace(/\/$/, ""); }
type ChatMessage = { role: "user" | "assistant"; content: string };
function isChatMessage(item: unknown): item is ChatMessage {
  const m = item as ChatMessage | null;
  return Boolean(m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string");
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "message is required" });
  const history = Array.isArray(body.history) ? body.history.filter(isChatMessage).slice(-8).map((m: ChatMessage) => ({ role: m.role, content: m.content })) : [];
  const context = [body.department ? `Department: ${String(body.department)}` : "", body.course ? `Course: ${String(body.course)}` : "", body.topic ? `Requested topic: ${String(body.topic)}` : "", body.learnerContext ? String(body.learnerContext).slice(0, 6000) : "", body.sourceContext ? `FUNAAB source context:\n${String(body.sourceContext).slice(0, 12000)}` : ""].filter(Boolean).join("\n\n");
  const errors: string[] = [];
  for (const provider of providerList()) {
    if (!provider.key) { errors.push(`${provider.name}: key not set`); continue; }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), provider.timeoutMs);
      const upstream = await fetch(`${cleanBaseUrl(provider.baseUrl)}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: provider.model, temperature: 0.35, max_tokens: 3600, messages: [{ role: "system", content: `${TUTOR_SYSTEM_PROMPT}\n\n${context}` }, ...history, { role: "user", content: message }] }), signal: controller.signal }).finally(() => clearTimeout(timeout));
      const payload = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        const reason = String(payload?.error?.message || payload?.detail || payload?.[0]?.error?.message || "rejected").slice(0, 140);
        errors.push(`${provider.name} (${provider.model}) ${upstream.status}: ${reason}`);
        console.error("Tutor provider error", provider.name, upstream.status, JSON.stringify(payload));
        continue;
      }
      const rawAnswer = payload?.choices?.[0]?.message?.content;
      if (typeof rawAnswer === "string" && rawAnswer.trim()) {
        let answer = rawAnswer.trim();
        let quiz: { title: string; topic: string; questions: Array<{ question: string; options: string[]; answer: number; explanation: string }> } | null = null;
        const quizMatch = answer.match(/\[\[FUNABACER_QUIZ_CARD\]\]\s*\[\[QUIZ_JSON\]\]([\s\S]*?)\[\[\/QUIZ_JSON\]\]/);
        if (quizMatch) {
          try {
            const parsed = JSON.parse(quizMatch[1] || "{}");
            const questions = Array.isArray(parsed.questions) ? parsed.questions.filter((q: any) =>
              q && typeof q.question === "string" && Array.isArray(q.options) && q.options.length >= 2 &&
              q.options.every((option: unknown) => typeof option === "string") &&
              Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length &&
              typeof q.explanation === "string"
            ) : [];
            const explicitCount = message.match(/\b(1[0-9]|20|[1-9])\s+questions?\b/i);
            const wordCount = message.match(/\b(one|two|three|four)\s+(?:multiple[- ]choice\s+)?questions?\b/i);
            const asksOne = /\b(a|an|one|single)\s+(?:multiple[- ]choice\s+)?question\b/i.test(message);
            const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4 };
            const requested = explicitCount ? Number(explicitCount[1]) : wordCount ? (words[wordCount[1].toLowerCase()] ?? 5) : asksOne ? 1 : 5;
            const minimum = requested < 5 ? requested : 5;
            if (questions.length >= minimum) {
              quiz = { title: String(parsed.title || "Practice checkpoint"), topic: String(parsed.topic || body.topic || body.course || "Current topic"), questions: questions.slice(0, Math.min(20, requested < 5 ? requested : Math.max(5, questions.length))) };
              answer = answer.replace(quizMatch[0], "[[FUNABACER_QUIZ_CARD]]");
            } else {
              answer = answer.replace(quizMatch[0], "I’ll prepare a complete practice set for this topic next.");
            }
          } catch {
            answer = answer.replace(quizMatch[0], "I couldn’t format that practice set correctly, so let’s continue with the explanation.");
          }
        }
        // Fallback: models sometimes ignore the card marker and leave a real learning check in prose.
        // Convert only explicit teaching/checkpoint questions; ordinary clarification questions stay text.
        const looksLikeLearningCheck =
          !quiz &&
          /\?/m.test(answer) &&
          /(?:check your understanding|quick check|test yourself|try this|answer the following|solve this|which of the following|what is the|calculate|work out|practice question|knowledge check|lesson check|comprehension check)/i.test(answer);
        if (looksLikeLearningCheck) {
          try {
            const fallbackController = new AbortController();
            const fallbackTimer = setTimeout(() => fallbackController.abort(), provider.timeoutMs);
            const fallbackResponse = await fetch(`${cleanBaseUrl(provider.baseUrl)}/chat/completions`, {
              method: "POST",
              headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: provider.model,
                temperature: 0.1,
                max_tokens: 2200,
                messages: [
                  {
                    role: "system",
                    content: "You repair tutor responses for an interactive learning app. Return ONLY valid JSON. If the source contains a question that tests the learner's knowledge, return {\\"answer\\":\\"the teaching text with the tested question and its plain-text options removed\\",\\"quiz\\":{\\"title\\":\\"...\\",\\"topic\\":\\"...\\",\\"questions\\":[{\\"question\\":\\"...\\",\\"options\\":[\\"...\\",\\"...\\",\\"...\\",\\"...\\"],\\"answer\\":0,\\"explanation\\":\\"...\\"}]}}. Preserve all useful teaching explanation. Make exactly one question card for one quick check, or preserve the full number if a practice set was requested. If the question is only a clarification or conversational prompt, return {\\"answer\\":<original text>,\\"quiz\\":null}. Never invent a factual answer; if unsure, return quiz null."
                  },
                  {
                    role: "user",
                    content: `Student request: ${message}\n\nTutor response to repair:\n${answer}`
                  }
                ]
              }),
              signal: fallbackController.signal
            }).finally(() => clearTimeout(fallbackTimer));
            const fallbackPayload = await fallbackResponse.json().catch(() => ({}));
            if (fallbackResponse.ok) {
              const fallbackText = String(fallbackPayload?.choices?.[0]?.message?.content || "").replace(/^```(?:json)?|\`\`\`$/g, "").trim();
              const firstBrace = fallbackText.indexOf("{");
              const lastBrace = fallbackText.lastIndexOf("}");
              const repaired = firstBrace >= 0 && lastBrace > firstBrace
                ? JSON.parse(fallbackText.slice(firstBrace, lastBrace + 1))
                : null;
              const repairedQuestions = Array.isArray(repaired?.quiz?.questions) ? repaired.quiz.questions.filter((q: any) =>
                q && typeof q.question === "string" && Array.isArray(q.options) && q.options.length === 4 &&
                q.options.every((option: unknown) => typeof option === "string" && option.trim()) &&
                Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4 &&
                typeof q.explanation === "string" && q.explanation.trim()
              ) : [];
              if (repaired && typeof repaired.answer === "string" && repaired.quiz && repairedQuestions.length > 0) {
                const explicitCount = message.match(/\b(1[0-9]|20|[1-9])\s+questions?\b/i);
                const wordCount = message.match(/\b(one|two|three|four)\s+(?:multiple[- ]choice\s+)?questions?\b/i);
                const asksOne = /\b(a|an|one|single)\s+(?:multiple[- ]choice\s+)?question\b/i.test(message);
                const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4 };
                const requested = explicitCount ? Number(explicitCount[1]) : wordCount ? (words[wordCount[1].toLowerCase()] ?? 5) : asksOne ? 1 : 5;
                const required = requested < 5 ? requested : 5;
                if (repairedQuestions.length >= required) {
                  answer = repaired.answer.trim();
                  quiz = {
                    title: String(repaired.quiz.title || "Practice checkpoint"),
                    topic: String(repaired.quiz.topic || body.topic || body.course || "Current topic"),
                    questions: repairedQuestions.slice(0, requested < 5 ? requested : Math.max(5, repairedQuestions.length))
                  };
                  answer = `${answer}\n\n[[FUNABACER_QUIZ_CARD]]`;
                }
              }
            }
          } catch (fallbackError) {
            console.warn("Tutor quiz-card fallback could not convert response", provider.name, fallbackError);
          }
        }
        console.info("Tutor provider success", provider.name, provider.model, quiz ? "quiz-card" : "text-only");
        return res.status(200).json({ answer, quiz, provider: provider.name, model: provider.model });
      }
      errors.push(`${provider.name}: empty answer`);
    } catch (error) {
      const aborted = error instanceof Error && error.name === "AbortError";
      errors.push(`${provider.name}: ${aborted ? `timed out after ${provider.timeoutMs / 1000}s` : error instanceof Error ? error.message : "request failed"}`);
    }
  }
  const detail = errors.join(" | ");
  console.error("All tutor providers failed", detail);
  return res.status(502).json({ error: `The tutor could not answer right now. (${detail})`, detail });
}
