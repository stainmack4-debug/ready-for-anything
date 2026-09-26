import type { VercelRequest, VercelResponse } from "@vercel/node";

type Body = { dataUrl?: string };

declare const process: { env: Record<string, string | undefined> };

async function pdfToText(base64: string) {
  const mod = await import("pdf-parse/lib/pdf-parse.js");
  const parse = (mod.default || mod) as (data: Buffer) => Promise<{ text?: string }>;
  const result = await parse(Buffer.from(base64, "base64"));
  return String(result.text || "").slice(0, 50000);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}) as Body;
    const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
    const match = dataUrl.match(/^data:application\/pdf;base64,(.+)$/i);
    if (!match) return res.status(400).json({ error: "Please upload a PDF registration slip." });
    if (dataUrl.length > 4_300_000)
      return res.status(413).json({ error: "Please use a PDF under 3 MB." });
    const text = await pdfToText(match[1]);
    // FUNAAB codes generally begin with 2–5 letters followed by a 3-digit number.
    const codes = [
      ...new Set(
        (text.match(/\b[A-Z]{2,5}\s?-?\d{3}\b/gi) || []).map((value) =>
          value.toUpperCase().replace(/-/g, " ").replace(/\s+/g, " ").trim(),
        ),
      ),
    ].filter((code) => !/^(PAGE|TOTAL|YEAR|SEMESTER)\s?\d{3}$/.test(code));
    return res.status(200).json({ codes, text: text.slice(0, 12000) });
  } catch (error) {
    console.error("Course form extraction error", error);
    return res.status(502).json({
      error:
        "This PDF could not be read. Try a text-based registration slip or add the courses manually.",
    });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "4.5mb" } }, maxDuration: 30 };
