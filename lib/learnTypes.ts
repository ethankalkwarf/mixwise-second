/**
 * Shared layered-lesson types for MixWise Learn.
 * Structure: big idea → core → go deeper → sources.
 */

export type LearnSection = {
  heading: string;
  body: string[];
  kind?: "default" | "rule" | "mistakes" | "tip";
};

export type LearnSource = {
  /** Short citation line shown in the Sources list */
  label: string;
  /** Optional context — why this source matters here */
  note?: string;
  href?: string;
};

export type LearnLessonLayers = {
  /** One-sentence (or two) thesis the reader should remember */
  bigIdea: string;
  /** 3–5 scannable takeaways */
  keyTakeaways: string[];
  /** Core lesson body */
  sections: LearnSection[];
  /** Optional deeper study — science, history, nuance */
  deepDive?: LearnSection[];
  /** Citations / further reading */
  sources?: LearnSource[];
};
