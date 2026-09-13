/** Cartoon avatar system — playful faces students can pick, like a game profile. */

const STYLE = "big-smile";

const SEEDS = [
  "praise",
  "tola",
  "chidi",
  "amaka",
  "seun",
  "bola",
  "nnamdi",
  "zainab",
  "kunle",
  "ify",
  "musa",
  "dami",
  "ada",
  "femi",
  "halima",
  "obi",
  "temi",
  "yemi",
  "grace",
  "kelechi",
  "sade",
  "ibrahim",
  "chioma",
  "tunde",
];

export type Avatar = { id: string; url: string };

export const avatars: Avatar[] = SEEDS.map((seed) => ({
  id: seed,
  url: `https://api.dicebear.com/9.x/${STYLE}/svg?seed=${seed}&backgroundColor=b6e3c9,c0edd6,d1f0dd&radius=50`,
}));

const KEY = "funabacer.avatar.v1";

export function getAvatarId(): string {
  if (typeof window === "undefined") return avatars[0]!.id;
  return window.localStorage.getItem(KEY) ?? avatars[0]!.id;
}

export function setAvatarId(id: string) {
  window.localStorage.setItem(KEY, id);
  window.dispatchEvent(new Event("funabacer-avatar"));
}

export function avatarUrl(id: string): string {
  return (avatars.find((a) => a.id === id) ?? avatars[0]!).url;
}
