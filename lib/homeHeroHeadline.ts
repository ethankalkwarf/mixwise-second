import { seededRandom } from "@/lib/randomization";

export type HomeHeroHeadlineInput = {
  /** First name when the user is signed in */
  firstName?: string | null;
  /** Local hour 0–23 */
  hour?: number;
  /** Local date — used to rotate copy daily */
  date?: Date;
};

/** Prefer a first name over an email handle like "ethankalkwarf". */
export function greetingFirstName({
  firstName,
  displayName,
  email,
}: {
  firstName?: string | null;
  displayName?: string | null;
  email?: string | null;
}): string | null {
  const fromFirst = firstName?.trim();
  if (fromFirst && looksLikeGivenName(fromFirst)) return capitalizeName(fromFirst.split(/\s+/)[0]!);

  const fromDisplay = displayName?.trim().split(/\s+/)[0];
  if (fromDisplay && looksLikeGivenName(fromDisplay)) return capitalizeName(fromDisplay);

  const local = email?.split("@")[0]?.trim();
  if (local && looksLikeGivenName(local)) return capitalizeName(local);

  return null;
}

function looksLikeGivenName(value: string): boolean {
  const word = value.trim();
  if (!word || word.length > 18) return false;
  if (/[0-9._]/.test(word)) return false;
  if (!/^[A-Za-z][A-Za-z'-]*$/.test(word)) return false;
  // All-lowercase concatenated handles (ethankalkwarf) aren't first names
  if (word === word.toLowerCase() && word.length > 10) return false;
  return true;
}

function capitalizeName(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type TimeBucket = "morning" | "afternoon" | "evening";

const EYEBROW_GENERIC: Record<TimeBucket, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
};

export function profileNeedsGivenName(input: {
  firstName?: string | null;
  displayName?: string | null;
  email?: string | null;
}): boolean {
  return !greetingFirstName(input);
}

/** Time-of-day eyebrow only — name belongs on the pour prompt, not here. */
export function getHomeGreetingEyebrow({
  hour = new Date().getHours(),
}: Pick<HomeHeroHeadlineInput, "hour"> = {}): string {
  return EYEBROW_GENERIC[timeBucket(hour)];
}

const POUR_PROMPT_NAMED = [
  "What are you pouring, {name}?",
  "Ready to shake something up, {name}?",
  "What's calling your name, {name}?",
  "Feel like mixing, {name}?",
  "What sounds good tonight, {name}?",
  "Pick your pour, {name}.",
  "Craving a classic, {name}?",
  "Shall we make a drink, {name}?",
];

const POUR_PROMPT_GENERIC = [
  "What are you pouring?",
  "Ready to shake something up?",
  "What's calling your name?",
  "Feel like mixing?",
  "What sounds good tonight?",
  "Pick your pour.",
  "Craving a classic?",
  "Shall we make a drink?",
];

const POUR_PROMPT_SESSION_KEY = "mw-home-pour-prompt-v1";

/**
 * Rotating idle hero line for the home screen.
 * Picks once per browser/app session so it changes on each open, not on every re-render.
 */
export function getHomePourPrompt({
  firstName,
  sessionKey,
}: {
  firstName?: string | null;
  /** Stable per-session seed; pass from sessionStorage when available. */
  sessionKey?: string | null;
} = {}): string {
  const name = firstName?.trim() || null;
  const variants = name ? POUR_PROMPT_NAMED : POUR_PROMPT_GENERIC;
  const seed = sessionKey?.trim() || localDateKey(new Date());
  const template = pickVariant(variants, `pour-prompt:${seed}:${name ?? "guest"}`);
  return name ? template.replaceAll("{name}", name) : template;
}

/** Create or reuse a session seed so the pour prompt rotates on each app open. */
export function readOrCreatePourPromptSessionKey(): string {
  if (typeof window === "undefined") return localDateKey(new Date());
  try {
    const existing = window.sessionStorage.getItem(POUR_PROMPT_SESSION_KEY);
    if (existing) return existing;
    const next = `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
    window.sessionStorage.setItem(POUR_PROMPT_SESSION_KEY, next);
    return next;
  } catch {
    return `${Date.now()}`;
  }
}

const PERSONALIZED: Record<TimeBucket, string[]> = {
  morning: [
    "Good morning, {name}. Ready to shake things up?",
    "Morning, {name}. The bar is open, metaphorically.",
    "Rise and shine, {name}. Time to mix something great.",
  ],
  afternoon: [
    "Good afternoon, {name}. Feeling inspired?",
    "Hey {name}, it's cocktail o'clock somewhere.",
    "Afternoon, {name}. Your bar awaits.",
  ],
  evening: [
    "Good evening, {name}. Let's make something smooth.",
    "Evening, {name}. Perfect time for a drink.",
    "Welcome back, {name}. What's on the menu tonight?",
  ],
};

const GENERIC: Record<TimeBucket, string[]> = {
  morning: [
    "Good morning. Ready to mix something great?",
    "Morning. The bar is open, metaphorically.",
    "Rise and shine. Time for a pour.",
  ],
  afternoon: [
    "Good afternoon. Feeling inspired?",
    "It's cocktail o'clock somewhere.",
    "Afternoon. Your bar awaits.",
  ],
  evening: [
    "Good evening. Let's make something smooth.",
    "Perfect time for a drink.",
    "What's on the menu tonight?",
  ],
};

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeBucket(hour: number): TimeBucket {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function pickVariant(variants: string[], seed: string): string {
  if (variants.length === 0) return "";
  const index = Math.floor(seededRandom(seed, "hero-headline") * variants.length);
  return variants[Math.min(index, variants.length - 1)]!;
}

/**
 * Rotating home/dashboard hero headline — varies by time of day and calendar day.
 * Signed-in users get their name; guests get generic copy.
 */
export function getHomeHeroHeadline({
  firstName,
  hour = new Date().getHours(),
  date = new Date(),
}: HomeHeroHeadlineInput): string {
  const bucket = timeBucket(hour);
  const dateKey = localDateKey(date);
  const name = firstName?.trim() || null;

  if (name) {
    const template = pickVariant(PERSONALIZED[bucket], `${dateKey}:${name}:${bucket}`);
    return template.replaceAll("{name}", name);
  }

  return pickVariant(GENERIC[bucket], `${dateKey}:${bucket}`);
}

export type HomeContextSubtitleInput = {
  barLoading?: boolean;
  barCount: number;
  readyCount: number;
};

/** One-line status under the greeting — cabinet-aware, like dashboard subtitle. */
export function getHomeContextSubtitle({
  barLoading = false,
  barCount,
  readyCount,
}: HomeContextSubtitleInput): string {
  if (barLoading) return "Checking your cabinet…";
  if (barCount === 0) return "Add what's in your bar to see what you can pour.";
  if (readyCount > 0) {
    const drinks = readyCount === 1 ? "drink" : "drinks";
    const bottles = barCount === 1 ? "bottle" : "bottles";
    return `${readyCount} ${drinks} ready · ${barCount} ${bottles} in your cabinet`;
  }
  const bottles = barCount === 1 ? "bottle" : "bottles";
  return `${barCount} ${bottles} stocked — one more unlocks new pours.`;
}
