import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, LockKeyhole, Save } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminRoute });

function AdminRoute() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [freeDays, setFreeDays] = useState(() => typeof window !== "undefined" ? localStorage.getItem("funabacer-admin-free-days") || "30" : "30");
  const [announcement, setAnnouncement] = useState(() => typeof window !== "undefined" ? localStorage.getItem("funabacer-admin-announcement") || "" : "");
  const [saved, setSaved] = useState(false);
  const save = () => {
    localStorage.setItem("funabacer-admin-free-days", freeDays);
    localStorage.setItem("funabacer-admin-announcement", announcement);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };
  if (!unlocked) return <main className="flex min-h-screen items-center justify-center bg-[#f7faf8] px-5"><section className="w-full max-w-md rounded-3xl border border-[#dcebe3] bg-white p-8 shadow-xl"><div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><LockKeyhole size={22}/></div><p className="mt-6 text-xs font-bold uppercase tracking-[.22em] text-emerald-700">FUNABACER ADMIN</p><h1 className="mt-3 text-3xl font-extrabold text-[#10231c]">Admin Panel</h1><p className="mt-2 text-sm leading-6 text-[#71877d]">This page is not part of the student navigation.</p><input autoFocus type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && password === "808254" && setUnlocked(true)} placeholder="Admin password" className="mt-7 w-full rounded-xl border border-[#c9ddd2] bg-[#f7faf8] px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"/><button onClick={() => password === "808254" && setUnlocked(true)} className="mt-4 w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-extrabold text-white hover:bg-emerald-600">Open Admin Panel</button><a href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#587166]"><ArrowLeft size={15}/> Back to FunaBAcer</a></section></main>;
  return <main className="min-h-screen bg-[#f7faf8] px-5 py-10"><div className="mx-auto max-w-3xl"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-700">ADMIN CONTROLS</p><h1 className="mt-2 text-3xl font-extrabold text-[#10231c]">FunaBAcer Admin Panel</h1></div><a href="/" className="text-sm font-bold text-[#587166]">Student site</a></div><div className="mt-8 space-y-5"><section className="rounded-2xl border border-[#dcebe3] bg-white p-6"><label className="block text-sm font-bold text-[#244138]">Free access period (days)<input value={freeDays} onChange={(event) => setFreeDays(event.target.value)} type="number" min="0" className="mt-2 w-full rounded-xl border border-[#c9ddd2] px-4 py-3"/></label></section><section className="rounded-2xl border border-[#dcebe3] bg-white p-6"><label className="block text-sm font-bold text-[#244138]">Announcement<textarea value={announcement} onChange={(event) => setAnnouncement(event.target.value)} rows={5} placeholder="You have one month of free access." className="mt-2 w-full rounded-xl border border-[#c9ddd2] px-4 py-3"/></label></section><button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-600"><Save size={16}/> {saved ? "Saved" : "Save settings"}</button><p className="text-xs leading-5 text-[#71877d]">This first version stores settings on this browser. A server-side broadcast and unlock-code table still needs a protected Supabase admin table.</p></div></div></main>;
}
