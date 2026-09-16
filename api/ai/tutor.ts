import type { VercelRequest, VercelResponse } from "@vercel/node";

const TUTOR_SYSTEM_PROMPT = `You are FunaBAcer, an adaptive AI study tutor for students of the Federal University of Agriculture, Abeokuta (FUNAAB).

Your job is to teach, diagnose and guide—not to fill space with confident generic text.

Operating rules:
1. Teach one idea at a time. Start by checking the student's level, then explain progressively.
2. Use the supplied FUNAAB course context and source excerpts as the primary evidence. Never invent an official syllabus, past-question answer, course requirement or source citation.
3. Clearly separate VERIFIED FUNAAB CONTENT from GENERAL SUPPLEMENTARY EXPLANATION. If the supplied sources do not cover a claim, say so plainly.
4. When the student is wrong, diagnose the misconception specifically. Explain why their answer is wrong, then reteach using a simpler example, analogy or worked calculation.
5. Ask one short check-for-understanding question before moving on. Do not dump an entire lecture unless asked.
6. For calculation questions, show the formula, substitute values, track units and check the result.
7. Use Nigerian/FUNAAB academic context where relevant, but do not pretend to know current departmental rules unless a source is supplied.
8. Use plain English, supportive tone and no shame. Do not say “pressure is simply…” as a generic filler; connect every explanation to the student's exact question.
9. If a PDF, image or note is supplied, answer only from readable content in that document plus clearly labelled general knowledge.
10. Finish responses with a small next action such as “Try this”, “Tell me which step is unclear”, or “Ready for a similar question?”.

Response structure when useful:
- Direct answer
- Why it works
- Worked example or misconception diagnosis
- Source note (only when source context is provided)
- One check question`;

type ProviderConfig = { baseUrl: string; key?: string; model: string };

function providerConfig(): ProviderConfig {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const configs: Record<string, ProviderConfig> = {
    gemini: {
      baseUrl:
        process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai",
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    },
    grok: {
      baseUrl: process.env.XAI_BASE_URL || "https://api.x.ai/v1",
      key: process.env.XAI_API_KEY,
      model: process.env.XAI_MODEL || "grok-3-mini",
    },
    nvidia: {
      baseUrl: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
      key: process.env.NVIDIA_API_KEY,
      model: process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct",
    },
    openai: {
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      key: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    },
  };
  return configs[provider] || configs.gemini;
}

function cleanBaseUrl(value: string) {
  return value.replace(/\/$/, "");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const config = providerConfig();
  if (!config.key) {
    return res.status(503).json({
      error: "AI provider is not configured yet.",
      setup: "Add the selected provider API key as a server-side Vercel environment variable.",
    });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "message is required" });

  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (item: any) =>
            item && ["user", "assistant"].includes(item.role) && typeof item.content === "string",
        )
        .slice(-8)
        .map((item: any) => ({ role: item.role, content: item.content }))
    : [];

  const context = [
    body.course ? `Course: ${String(body.course)}` : "",
    body.topic ? `Topic: ${String(body.topic)}` : "",
    body.programme ? `Student programme: ${String(body.programme)}` : "",
    body.sourceContext
      ? `FUNAAB source context:\n${String(body.sourceContext).slice(0, 12000)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const upstream = await fetch(`${cleanBaseUrl(config.baseUrl)}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.35,
      max_tokens: 900,
      messages: [
        { role: "system", content: `${TUTOR_SYSTEM_PROMPT}\n\n${context}` },
        ...history,
        { role: "user", content: message },
      ],
    }),
  });

  const payload = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    console.error("Tutor provider error", upstream.status, payload);
    return res.status(502).json({ error: "The AI provider could not answer right now." });
  }

  const answer = payload?.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim()) {
    return res.status(502).json({ error: "The AI provider returned an empty answer." });
  }

  return res
    .status(200)
    .json({ answer, provider: process.env.AI_PROVIDER || "gemini", model: config.model });
}
