/**
 * Shared layered-lesson types for MixWise Learn.
 * Structure: big idea → core → go deeper → sources.
 */

export type LearnSection = {
  heading: string;
  body: string[];
  kind?: "default" | "rule" | "mistakes" | "tip";
  /** Inline teaching diagram rendered under the heading */
  figure?: string;
  /** Optional structured steps for flip-through card decks */
  steps?: { title: string; body: string }[];
  /** Deck header override when using `steps` */
  deckKicker?: string;
  deckTitle?: string;
};

/** A catalog drink used as a drill, with the sensory cue to practice. */
export type LearnPracticeDrink = {
  slug: string;
  notice: string;
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
