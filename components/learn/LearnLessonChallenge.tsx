"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CheckIcon,
  SparklesIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { useLearnProgress } from "@/hooks/useLearnProgress";
import type { LearnCheck } from "@/lib/learnChecks";
import type { LearnLessonKind } from "@/lib/learnProgress";

type Phase = "reading" | "quiz" | "celebration" | "complete";

type ProviderProps = {
  kind: Exclude<LearnLessonKind, "path">;
  slug: string;
  checks: LearnCheck[];
  lessonTitle: string;
  children: ReactNode;
};

type ChallengeContextValue = {
  hasQuiz: boolean;
  quizOpen: boolean;
  isComplete: boolean;
  passedPendingAuth: boolean;
  /** True once the reader has scrolled through the lesson body. */
  hasScrolledThrough: boolean;
  markScrolledThrough: () => void;
  startQuiz: () => void;
  closeQuiz: () => void;
  completeWithoutQuiz: () => Promise<void>;
};

const ChallengeContext = createContext<ChallengeContextValue | null>(null);

function useChallenge() {
  const ctx = useContext(ChallengeContext);
  if (!ctx) {
    throw new Error("LearnLessonChallenge components must be used within LearnLessonChallengeProvider");
  }
  return ctx;
}

/** Whether the sticky / primary lesson CTA should be on screen. */
export function useLearnLessonChallengeVisibility() {
  const ctx = useContext(ChallengeContext);
  if (!ctx) return false;
  return ctx.isComplete || ctx.passedPendingAuth || ctx.hasScrolledThrough;
}

export function LearnLessonChallengeProvider({
  kind,
  slug,
  checks,
  lessonTitle,
  children,
}: ProviderProps) {
  const { isAuthenticated, isComplete, markStarted, completeLesson, isLoading } = useLearnProgress();
  const [phase, setPhase] = useState<Phase>("reading");
  const [passedPendingAuth, setPassedPendingAuth] = useState(false);
  const [passScore, setPassScore] = useState<{ firstTry: number; total: number } | null>(null);
  const [hasScrolledThrough, setHasScrolledThrough] = useState(false);
  const started = useRef(false);

  const done = isComplete(kind, slug);
  const hasQuiz = checks.length > 0;

  useEffect(() => {
    if (done) setPhase("complete");
  }, [done]);

  useEffect(() => {
    if (phase === "quiz" || phase === "celebration") {
      document.documentElement.classList.add("learn-quiz-active");
      return () => document.documentElement.classList.remove("learn-quiz-active");
    }
  }, [phase]);

  useEffect(() => {
    if (!isAuthenticated || started.current || isLoading) return;
    started.current = true;
    void markStarted(kind, slug);
  }, [isAuthenticated, isLoading, kind, slug, markStarted]);

  const markScrolledThrough = useCallback(() => {
    setHasScrolledThrough(true);
  }, []);

  const finishPassed = useCallback(
    async (firstTryCorrect: number) => {
      setPassScore({ firstTry: firstTryCorrect, total: checks.length });
      if (isAuthenticated) {
        await completeLesson(kind, slug, { correct: firstTryCorrect, total: checks.length });
        setPassedPendingAuth(false);
      } else {
        setPassedPendingAuth(true);
      }
      setPhase("celebration");
    },
    [checks.length, completeLesson, isAuthenticated, kind, slug]
  );

  const startQuiz = useCallback(() => {
    if (done) return;
    if (!hasQuiz) return;
    setPhase("quiz");
  }, [done, hasQuiz]);

  const closeQuiz = useCallback(() => {
    setPhase("reading");
  }, []);

  const completeWithoutQuiz = useCallback(async () => {
    if (done || hasQuiz) return;
    if (isAuthenticated) {
      await completeLesson(kind, slug);
      setPhase("complete");
    } else {
      setPassedPendingAuth(true);
      setPhase("celebration");
    }
  }, [completeLesson, done, hasQuiz, isAuthenticated, kind, slug]);

  const value = useMemo<ChallengeContextValue>(
    () => ({
      hasQuiz,
      quizOpen: phase === "quiz",
      isComplete: done || phase === "complete",
      passedPendingAuth,
      hasScrolledThrough: hasScrolledThrough || done,
      markScrolledThrough,
      startQuiz,
      closeQuiz,
      completeWithoutQuiz,
    }),
    [
      done,
      hasQuiz,
      hasScrolledThrough,
      passedPendingAuth,
      phase,
      markScrolledThrough,
      startQuiz,
      closeQuiz,
      completeWithoutQuiz,
    ]
  );

  return (
    <ChallengeContext.Provider value={value}>
      {children}
      {phase === "quiz" ? (
        <LearnLessonQuizOverlay
          checks={checks}
          lessonTitle={lessonTitle}
          onClose={closeQuiz}
          onPassed={finishPassed}
        />
      ) : null}
      {phase === "celebration" ? (
        <LearnLessonPassCelebration
          lessonTitle={lessonTitle}
          needsAuth={passedPendingAuth}
          passScore={passScore}
          onContinue={() => setPhase(passedPendingAuth ? "reading" : "complete")}
        />
      ) : null}
    </ChallengeContext.Provider>
  );
}

/** Sticky / inline lesson action — replaces direct mark-complete when a quiz exists. */
export function LearnLessonChallengeButton() {
  const {
    hasQuiz,
    isComplete,
    passedPendingAuth,
    hasScrolledThrough,
    startQuiz,
    completeWithoutQuiz,
  } = useChallenge();
  const { openSignupDialog, openLoginDialog } = useAuthDialog();

  if (isComplete) {
    return (
      <div className="rounded-2xl border border-olive/30 bg-olive/10 px-5 py-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-olive text-forest">
          <CheckIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-forest">Lesson passed</p>
          <p className="text-sm text-sage">Saved to your progress.</p>
        </div>
      </div>
    );
  }

  if (passedPendingAuth) {
    return (
      <div className="rounded-2xl border border-terracotta/25 bg-white px-5 py-4 space-y-3">
        <p className="text-sm text-forest font-medium">You passed the quiz — sign in to save it.</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            onClick={() =>
              openSignupDialog({
                title: "Save your progress",
                subtitle: "Keep lesson completions, paths, and badges.",
              })
            }
            className="inline-flex flex-1 min-w-[8rem] items-center justify-center rounded-full bg-terracotta px-5 py-2.5 font-semibold text-cream"
          >
            Create free account
          </button>
          <button
            type="button"
            onClick={() =>
              openLoginDialog({
                title: "Sign in to save",
                subtitle: "Your quiz result will count once you’re in.",
              })
            }
            className="font-semibold text-terracotta"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  // Hide until the reader has actually scrolled through the lesson.
  if (!hasScrolledThrough) {
    return null;
  }

  if (hasQuiz) {
    return (
      <button
        type="button"
        onClick={startQuiz}
        className="learn-lesson-cta-enter w-full inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3.5 text-sm font-semibold text-cream shadow-lg shadow-terracotta/20 hover:bg-terracotta/90 transition-colors"
      >
        I&apos;m done reading · Start quiz
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void completeWithoutQuiz()}
      className="learn-lesson-cta-enter w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-cream hover:bg-terracotta/90 transition-colors"
    >
      Mark complete
    </button>
  );
}

/** Fires when the reader reaches the end of the lesson body. */
export function LearnLessonReadSentinel() {
  const ctx = useContext(ChallengeContext);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctx || ctx.hasScrolledThrough || ctx.isComplete) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          ctx.markScrolledThrough();
          observer.disconnect();
        }
      },
      {
        // Require the sentinel near the viewport — not just peeking at the top.
        root: null,
        rootMargin: "0px 0px -18% 0px",
        threshold: 0.01,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ctx]);

  if (!ctx) return null;
  return <div ref={ref} className="learn-lesson-read-sentinel h-px w-full" aria-hidden />;
}

function LearnLessonQuizOverlay({
  checks,
  lessonTitle,
  onClose,
  onPassed,
}: {
  checks: LearnCheck[];
  lessonTitle: string;
  onClose: () => void;
  onPassed: (firstTryCorrect: number) => Promise<void>;
}) {
  const nativeShell = useNativeShell();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [attemptsOnQuestion, setAttemptsOnQuestion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [correctBurst, setCorrectBurst] = useState(false);
  const firstTryCorrectRef = useRef(0);
  const advanceTimer = useRef<number | null>(null);

  const check = checks[index];
  const isLast = index >= checks.length - 1;
  const answeredCorrectly = revealed && selected === check.correctIndex;
  const progress = ((index + (answeredCorrectly ? 1 : 0)) / checks.length) * 100;

  useEffect(() => {
    firstTryCorrectRef.current = firstTryCorrect;
  }, [firstTryCorrect]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current != null) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (nativeShell) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nativeShell, onClose]);

  const pickOption = (optionIndex: number) => {
    if (revealed || submitting || correctBurst) return;
    setSelected(optionIndex);
    setRevealed(true);
    if (optionIndex === check.correctIndex) {
      if (attemptsOnQuestion === 0) {
        const nextFirstTry = firstTryCorrectRef.current + 1;
        setFirstTryCorrect(nextFirstTry);
        firstTryCorrectRef.current = nextFirstTry;
      }
      // Full-page correct celebration — then next question or lesson pass.
      setCorrectBurst(true);
      if (advanceTimer.current != null) window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => {
        if (isLast) {
          setSubmitting(true);
          void onPassed(firstTryCorrectRef.current).finally(() => setSubmitting(false));
        } else {
          setCorrectBurst(false);
          setIndex((current) => current + 1);
          setSelected(null);
          setRevealed(false);
          setAttemptsOnQuestion(0);
        }
      }, isLast ? 1100 : 900);
    }
  };

  const retryQuestion = () => {
    setSelected(null);
    setRevealed(false);
    setAttemptsOnQuestion((count) => count + 1);
  };

  if (correctBurst) {
    return (
      <div
        className={`learn-quiz-correct-burst ${nativeShell ? "learn-quiz-correct-burst--native" : "learn-quiz-correct-burst--modal"}`}
        role="status"
        aria-live="polite"
      >
        <div className="learn-quiz-correct-burst__panel">
          <div className="learn-quiz-correct-burst__glow" aria-hidden />
          <div className="learn-quiz-correct-burst__content">
            <span className="learn-quiz-correct-burst__check">
              <CheckIcon className="h-10 w-10" aria-hidden />
            </span>
            <p className="learn-quiz-correct-burst__title">Correct!</p>
            <p className="learn-quiz-correct-burst__sub">
              {isLast ? "Lesson complete" : `Question ${index + 1} of ${checks.length}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`learn-quiz-overlay ${nativeShell ? "learn-quiz-overlay--native" : "learn-quiz-overlay--modal"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="learn-quiz-title"
    >
      {!nativeShell ? (
        <button
          type="button"
          className="learn-quiz-overlay__backdrop"
          aria-label="Close quiz"
          onClick={onClose}
        />
      ) : null}
      <div className="learn-quiz-overlay__dialog">
        <div className="learn-quiz-overlay__header">
          <button type="button" onClick={onClose} className="learn-quiz-overlay__close">
            <XMarkIcon aria-hidden className="h-5 w-5" />
            <span>Keep reading</span>
          </button>
          <div className="learn-quiz-overlay__meta">
            <p className="learn-quiz-overlay__eyebrow">Quiz</p>
            <h2 id="learn-quiz-title" className="learn-quiz-overlay__title">
              {lessonTitle}
            </h2>
          </div>
          <div className="learn-quiz-overlay__progress-track" aria-hidden>
            <div className="learn-quiz-overlay__progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="learn-quiz-overlay__step">
            Question {index + 1} of {checks.length}
          </p>
        </div>

        <div className="learn-quiz-overlay__body">
          <p className="learn-quiz-overlay__prompt">{check.prompt}</p>
          <ul className="learn-quiz-overlay__options">
            {check.options.map((option, optionIndex) => {
              const isSelected = selected === optionIndex;
              const isCorrectOption = optionIndex === check.correctIndex;
              let styles = "learn-quiz-option";
              if (revealed) {
                if (isCorrectOption) styles += " learn-quiz-option--correct";
                else if (isSelected) styles += " learn-quiz-option--wrong";
                else styles += " learn-quiz-option--muted";
              } else if (isSelected) {
                styles += " learn-quiz-option--picked";
              }

              return (
                <li key={option}>
                  <button
                    type="button"
                    disabled={revealed || submitting}
                    onClick={() => pickOption(optionIndex)}
                    className={styles}
                  >
                    <span className="learn-quiz-option__label">{String.fromCharCode(65 + optionIndex)}</span>
                    <span className="learn-quiz-option__text">{option}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {revealed && !answeredCorrectly ? (
            <div className="learn-quiz-overlay__feedback learn-quiz-overlay__feedback--bad">
              <XCircleIcon className="h-5 w-5 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">Not quite</p>
                <p className="text-sm opacity-90 mt-0.5">{check.explanation}</p>
              </div>
            </div>
          ) : null}
        </div>

        {revealed && !answeredCorrectly ? (
          <div className="learn-quiz-overlay__footer">
            <button type="button" onClick={retryQuestion} className="learn-quiz-overlay__cta learn-quiz-overlay__cta--secondary">
              Try again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LearnLessonPassCelebration({
  lessonTitle,
  needsAuth,
  passScore,
  onContinue,
}: {
  lessonTitle: string;
  needsAuth: boolean;
  passScore: { firstTry: number; total: number } | null;
  onContinue: () => void;
}) {
  const nativeShell = useNativeShell();
  const { openSignupDialog, openLoginDialog } = useAuthDialog();
  const perfect = passScore != null && passScore.firstTry === passScore.total;

  return (
    <div
      className={`learn-quiz-celebration ${nativeShell ? "learn-quiz-celebration--native" : "learn-quiz-celebration--modal"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="learn-pass-title"
    >
      {!nativeShell ? (
        <button
          type="button"
          className="learn-quiz-celebration__backdrop"
          aria-label="Close"
          onClick={onContinue}
        />
      ) : null}
      <div className="learn-quiz-celebration__panel">
        <div className="learn-quiz-celebration__aurora" aria-hidden />
        <div className="learn-quiz-celebration__bursts" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className={`learn-quiz-celebration__burst learn-quiz-celebration__burst--${i + 1}`} />
          ))}
        </div>

        <div className="learn-quiz-celebration__stage">
          <div className="learn-quiz-celebration__icon">
            <SparklesIcon aria-hidden className="h-9 w-9" />
          </div>
          <p className="learn-quiz-celebration__eyebrow">{perfect ? "Perfect run" : "Lesson passed"}</p>
          <h2 id="learn-pass-title" className="learn-quiz-celebration__title">
            {lessonTitle}
          </h2>
          <p className="learn-quiz-celebration__copy">
            {needsAuth
              ? "You nailed the quiz. Sign in to save this win and keep your path progress."
              : perfect
                ? "Every answer correct on the first try — saved to your progress."
                : passScore
                  ? `${passScore.firstTry}/${passScore.total} correct on the first try — saved to your progress.`
                  : "Nice work — this lesson is saved to your progress."}
          </p>

          {needsAuth ? (
            <div className="learn-quiz-celebration__actions">
              <button
                type="button"
                onClick={() =>
                  openSignupDialog({
                    title: "Save your progress",
                    subtitle: "Keep lesson completions, paths, and badges.",
                  })
                }
                className="learn-quiz-celebration__cta"
              >
                Create free account
              </button>
              <button type="button" onClick={onContinue} className="learn-quiz-celebration__ghost">
                Continue without saving
              </button>
              <button
                type="button"
                onClick={() =>
                  openLoginDialog({
                    title: "Sign in to save",
                    subtitle: "Your quiz result will count once you’re in.",
                  })
                }
                className="learn-quiz-celebration__link"
              >
                Sign in
              </button>
            </div>
          ) : (
            <button type="button" onClick={onContinue} className="learn-quiz-celebration__cta">
              Keep going →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
