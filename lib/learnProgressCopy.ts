import { learnLevelFromXp } from "@/lib/learnProgress";

type Level = ReturnType<typeof learnLevelFromXp>;

/** Plain-language progress line for Learn — avoids unexplained “XP”. */
export function formatLearnProgressLine(
  level: Level,
  lessonsDone: number,
  lessonsTotal: number
): string {
  return `${level.name} · ${lessonsDone}/${lessonsTotal} lessons`;
}

export function formatLearnLevelDetail(level: Level): string {
  if (level.nextAt == null) {
    return `${level.name} — all levels unlocked`;
  }
  const remaining = level.nextAt - level.xp;
  return `${remaining} more point${remaining === 1 ? "" : "s"} to ${nextLevelName(level)}`;
}

function nextLevelName(level: Level): string {
  const names = ["Home bartender", "Shaker", "Palate", "Sour hand", "Scholar"];
  const idx = level.level;
  return names[idx] ?? "next level";
}
