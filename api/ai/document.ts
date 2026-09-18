import type { VercelRequest, VercelResponse } from "@vercel/node";

type DocumentBody = { name?: string; type?: string; dataUrl?: string };

function outputText(payload: any): string {
  const direct = payload?.output_text;
  if (typeof direct === "string") return direct;
  const output = Array.isArray(payload?.output) ? payload.output : [];
  const text = output.flatMap((item: any) => Array.isArray(item?.content) ? item.content : [])
    .filter((part: any) => part?.type === "output_text" && typeof part.text === "string")
    .map((part: any) => part.text)
    .join("\n");
  if (text) return text;
  return payload?.choices?.[0]?.message?.content || "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.Grok_api_key || process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  if (!key) return res.status(503).json({ error: "Document reading is not configured yet." });

  let body: DocumentBody;
  try { body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}; }
  catch { return res.status(400).json({ error: "Invalid upload request." }); }
  const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
  const name = typeof body.name === "string" ? body.name : "study-document";
  const type = typeof body.type === "string" ? body.type : "";
  if (!dataUrl || !/^data:(application\/pdf|image\/(png|jpeg|jpg));base64,/i.test(dataUrl))
    return res.status(400).json({ error: "Please upload a PDF, PNG, or JPG file." });
  if (dataUrl.length > 6_000_000) return res.status(413).json({ error: "That file is too large. Please use a file under 4 MB." });

  const model = process.env.XAI_DOCUMENT_MODEL || "grok-4.6";
  const prompt = `Read this study document carefully. Extract the useful educational content for a university tutor. Preserve formulas, definitions, worked examples, headings, and question/answer pairs. Ignore decorative text. Return clean plain text with a short first line naming the document. Do not invent missing content.`;
  try {
    let input: any[];
    if (type === "application/pdf" || dataUrl.startsWith("data:application/pdf")) {
      const comma = dataUrl.indexOf(",");
      const bytes = Buffer.from(dataUrl.slice(comma + 1), "base64");
      const form = new FormData();
      form.append("file", new Blob([bytes], { type: "application/pdf" }), name.endsWith(".pdf") ? name : `${name}.pdf`);
      form.append("purpose", "assistants");
      const upload = await fetch("https://api.x.ai/v1/files", { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: form });
      const uploaded = await upload.json().catch(() => ({}));
      if (!upload.ok || !uploaded?.id) {
        console.error("xAI file upload error", upload.status, uploaded);
        return res.status(502).json({ error: "Grok could not receive that PDF." });
      }
      const upstream = await fetch("https://api.x.ai/v1/responses", {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, input: [{ role: "user", content: [{ type: "input_text", text: prompt }, { type: "input_file", file_id: uploaded.id }] }] }),
      });
      const payload = await upstream.json().catch(() => ({}));
      await fetch(`https://api.x.ai/v1/files/${uploaded.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${key}` } }).catch(() => undefined);
      if (!upstream.ok) { console.error("xAI PDF reading error", upstream.status, payload); return res.status(502).json({ error: "Grok could not read that PDF." }); }
      const text = outputText(payload).trim();
      if (!text) return res.status(502).json({ error: "Grok returned no readable text from that PDF." });
      return res.status(200).json({ text: text.slice(0, 30000), name });
    }

    input = [{ role: "user", content: [{ type: "input_image", image_url: dataUrl, detail: "high" }, { type: "input_text", text: prompt }] }];
    const upstream = await fetch("https://api.x.ai/v1/responses", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, input }),
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) { console.error("xAI image reading error", upstream.status, payload); return res.status(502).json({ error: "Grok could not read that image." }); }
    const text = outputText(payload).trim();
    if (!text) return res.status(502).json({ error: "Grok returned no readable text from that image." });
    return res.status(200).json({ text: text.slice(0, 30000), name });
  } catch (error) {
    console.error("Document processing error", error);
    return res.status(502).json({ error: "The document could not be processed right now." });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "6mb" } } };

// Vercel's Node types are not available in this project tsconfig, but runtime env is provided.
declare const process: { env: Record<string, string | undefined> };
