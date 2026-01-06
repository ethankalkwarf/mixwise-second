"use client";

import { useState } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import type { QuestionnaireAnswers } from "./WeddingCocktailFinder";

interface WeddingQuestionnaireProps {
  answers: QuestionnaireAnswers;
  onUpdate: (updates: Partial<QuestionnaireAnswers>) => void;
  onSubmit: () => void;
}

const FLAVORS = [
  { id: "sweet", label: "Sweet" },
  { id: "tart", label: "Tart/Citrusy" },
  { id: "bitter", label: "Bitter" },
  { id: "strong", label: "Strong/Bold" },
  { id: "light", label: "Light/Refreshing" },
];

const SPIRITS = [
  { id: "vodka", label: "Vodka" },
  { id: "gin", label: "Gin" },
  { id: "whiskey", label: "Whiskey" },
  { id: "rum", label: "Rum" },
  { id: "tequila", label: "Tequila" },
  { id: "bourbon", label: "Bourbon" },
  { id: "scotch", label: "Scotch" },
  { id: "brandy", label: "Brandy" },
];

const WEDDING_STYLES = [
  { id: "classic", label: "Classic & Timeless" },
  { id: "modern", label: "Modern & Trendy" },
  { id: "tropical", label: "Tropical/Beach" },
  { id: "elegant", label: "Elegant & Sophisticated" },
  { id: "casual", label: "Casual & Fun" },
];

const COMPLEXITY_OPTIONS = [
  { id: "simple", label: "Simple (Easy to make)" },
  { id: "moderate", label: "Moderate" },
  { id: "complex", label: "Complex (Worth the effort)" },
  { id: "any", label: "Any complexity" },
];

type QuestionType = 
  | {
      id: string;
      title: string;
      subtitle?: string;
      type: "multi-select";
      options: Array<{ id: string; label: string }>;
      value: string[];
      onChange: (value: string[]) => void;
    }
  | {
      id: string;
      title: string;
      subtitle?: string;
      type: "single-select";
      options: Array<{ id: string; label: string }>;
      value: string;
      onChange: (value: string) => void;
    }
  | {
      id: string;
      title: string;
      subtitle?: string;
      type: "boolean";
      value: boolean;
      onChange: (value: boolean) => void;
    };

export function WeddingQuestionnaire({ answers, onUpdate, onSubmit }: WeddingQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions: QuestionType[] = [
    {
      id: "flavors",
      title: "What flavors do you love?",
      subtitle: "Select all that apply",
      type: "multi-select",
      options: FLAVORS,
      value: answers.preferredFlavors,
      onChange: (value: string[]) => onUpdate({ preferredFlavors: value }),
    },
    {
      id: "spirits",
      title: "Which spirits do you prefer?",
      subtitle: "Select all that apply",
      type: "multi-select",
      options: SPIRITS,
      value: answers.preferredSpirits,
      onChange: (value: string[]) => onUpdate({ preferredSpirits: value }),
    },
    {
      id: "style",
      title: "What's your wedding style?",
      subtitle: "Choose the vibe that matches your wedding",
      type: "single-select",
      options: WEDDING_STYLES,
      value: answers.weddingStyle,
      onChange: (value: string) => onUpdate({ weddingStyle: value as any }),
    },
    {
      id: "complexity",
      title: "How complex should the cocktails be?",
      subtitle: "Consider your bartender's skill level",
      type: "single-select",
      options: COMPLEXITY_OPTIONS,
      value: answers.complexity,
      onChange: (value: string) => onUpdate({ complexity: value as any }),
    },
  ];

  const question = questions[currentQuestion];
  if (!question) return null;

  const canProceed = question.type === "multi-select" 
    ? Array.isArray(question.value) && question.value.length > 0
    : question.type === "boolean"
    ? typeof question.value === "boolean"
    : typeof question.value === "string" && question.value !== "";

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleMultiSelect = (optionId: string) => {
    if (question.type !== "multi-select" || !Array.isArray(question.value)) return;
    const current = question.value;
    const newValue = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    question.onChange(newValue);
  };

  const handleSingleSelect = (optionId: string) => {
    if (question.type !== "single-select") return;
    question.onChange(optionId);
  };

  const handleBoolean = (value: boolean) => {
    if (question.type !== "boolean") return;
    question.onChange(value);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-sage mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-mist rounded-full h-2">
          <div
            className="bg-terracotta h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-mist rounded-3xl p-8 sm:p-12 shadow-soft mb-6">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest mb-2">
          {question.title}
        </h2>
        {question.subtitle && (
          <p className="text-sage mb-6 text-base sm:text-lg">{question.subtitle}</p>
        )}

        {/* Multi-select */}
        {question.type === "multi-select" && (
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = question.value.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleMultiSelect(option.id)}
                  className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-terracotta bg-terracotta/10 text-forest font-medium"
                      : "border-mist bg-white text-sage hover:border-terracotta/50 hover:bg-mist/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {isSelected && (
                      <CheckIcon className="w-5 h-5 text-terracotta" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Single-select */}
        {question.type === "single-select" && (
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = question.value === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSingleSelect(option.id)}
                  className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-terracotta bg-terracotta/10 text-forest font-medium"
                      : "border-mist bg-white text-sage hover:border-terracotta/50 hover:bg-mist/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {isSelected && (
                      <CheckIcon className="w-5 h-5 text-terracotta" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Boolean */}
        {question.type === "boolean" && (
          <div className="flex gap-4">
            <button
              onClick={() => handleBoolean(true)}
              className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${
                question.value === true
                  ? "border-terracotta bg-terracotta/10 text-forest font-medium"
                  : "border-mist bg-white text-sage hover:border-terracotta/50 hover:bg-mist/30"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleBoolean(false)}
              className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${
                question.value === false
                  ? "border-terracotta bg-terracotta/10 text-forest font-medium"
                  : "border-mist bg-white text-sage hover:border-terracotta/50 hover:bg-mist/30"
              }`}
            >
              No
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentQuestion === 0}
          className="px-6 py-3 bg-white border border-mist text-forest font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-mist"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream font-bold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-terracotta"
        >
          {currentQuestion === questions.length - 1 ? "See Recommendations" : "Next →"}
        </button>
      </div>
    </div>
  );
}

