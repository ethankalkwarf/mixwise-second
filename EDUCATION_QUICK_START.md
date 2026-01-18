# Education Features - Quick Start Guide

This guide provides ready-to-use code examples for implementing the most impactful educational features.

---

## 🚀 Quick Start: Top 5 Features to Implement First

### 1. Add "Learn the Technique" to Cocktail Pages

**Impact**: High - Users see education contextually where they need it

**Implementation**:

```typescript
// components/cocktails/TechniquePreview.tsx
'use client';

import Link from 'next/link';
import { BeakerIcon } from '@heroicons/react/24/outline';

interface TechniquePreviewProps {
  technique: string;
  techniqueSlug?: string;
}

export function TechniquePreview({ technique, techniqueSlug }: TechniquePreviewProps) {
  if (!technique) return null;
  
  const slug = techniqueSlug || technique.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="bg-olive/10 border border-olive/20 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <BeakerIcon className="w-6 h-6 text-olive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-display font-semibold text-forest mb-1">
            Learn the {technique} Technique
          </h3>
          <p className="text-sm text-sage mb-3">
            This cocktail uses the <strong>{technique}</strong> technique. 
            Master it to make better drinks at home.
          </p>
          <Link
            href={`/learn/techniques/${slug}`}
            className="inline-flex items-center text-sm font-medium text-olive hover:text-forest transition-colors"
          >
            Learn How →
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**Add to RecipeContent.tsx**:
```typescript
// In RecipeContent component, add after ingredients section:
{cocktail.technique && (
  <TechniquePreview 
    technique={cocktail.technique}
    techniqueSlug={cocktail.techniqueSlug}
  />
)}
```

---

### 2. Simple Ratio Calculator Tool

**Impact**: High - Interactive, immediately useful

**Implementation**:

```typescript
// components/education/RatioCalculator.tsx
'use client';

import { useState } from 'react';
import { CalculatorIcon } from '@heroicons/react/24/outline';

interface Ratio {
  spirit: number;
  citrus: number;
  sweet: number;
}

const COMMON_RATIOS = {
  'Classic Sour': { spirit: 2, citrus: 1, sweet: 0.75 },
  'Daiquiri': { spirit: 2, citrus: 1, sweet: 0.75 },
  'Sidecar': { spirit: 2, citrus: 1, sweet: 0.75 },
  'Margarita': { spirit: 2, citrus: 1, sweet: 0.75 },
  'Whiskey Sour': { spirit: 2, citrus: 1, sweet: 0.75 },
  'Gimlet': { spirit: 2, citrus: 0.75, sweet: 0.5 },
};

export function RatioCalculator() {
  const [baseAmount, setBaseAmount] = useState(2);
  const [ratio, setRatio] = useState<Ratio>(COMMON_RATIOS['Classic Sour']);
  const [selectedRatio, setSelectedRatio] = useState('Classic Sour');
  
  const calculate = (part: keyof Ratio) => {
    return ((baseAmount / ratio.spirit) * ratio[part]).toFixed(2);
  };
  
  return (
    <div className="bg-white border border-mist rounded-2xl p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-6">
        <CalculatorIcon className="w-6 h-6 text-olive" />
        <h3 className="text-xl font-display font-bold text-forest">
          Cocktail Ratio Calculator
        </h3>
      </div>
      
      <div className="space-y-4">
        {/* Preset Ratios */}
        <div>
          <label className="block text-sm font-medium text-sage mb-2">
            Common Ratios
          </label>
          <select
            value={selectedRatio}
            onChange={(e) => {
              setSelectedRatio(e.target.value);
              setRatio(COMMON_RATIOS[e.target.value as keyof typeof COMMON_RATIOS]);
            }}
            className="w-full px-4 py-2 border border-mist rounded-lg focus:ring-2 focus:ring-olive focus:border-olive"
          >
            {Object.keys(COMMON_RATIOS).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        
        {/* Base Amount */}
        <div>
          <label className="block text-sm font-medium text-sage mb-2">
            Base Spirit Amount (oz)
          </label>
          <input
            type="number"
            min="0.5"
            max="4"
            step="0.25"
            value={baseAmount}
            onChange={(e) => setBaseAmount(parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-mist rounded-lg focus:ring-2 focus:ring-olive focus:border-olive"
          />
        </div>
        
        {/* Results */}
        <div className="bg-olive/5 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sage">Spirit:</span>
            <span className="font-semibold text-forest">{baseAmount} oz</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sage">Citrus:</span>
            <span className="font-semibold text-forest">{calculate('citrus')} oz</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sage">Sweet:</span>
            <span className="font-semibold text-forest">{calculate('sweet')} oz</span>
          </div>
        </div>
        
        {/* Custom Ratio */}
        <div className="pt-4 border-t border-mist">
          <p className="text-sm text-sage mb-3">Or set custom ratio:</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-sage mb-1">Spirit</label>
              <input
                type="number"
                min="1"
                max="4"
                value={ratio.spirit}
                onChange={(e) => setRatio({...ratio, spirit: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-mist rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-sage mb-1">Citrus</label>
              <input
                type="number"
                min="0.25"
                max="2"
                step="0.25"
                value={ratio.citrus}
                onChange={(e) => setRatio({...ratio, citrus: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-mist rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-sage mb-1">Sweet</label>
              <input
                type="number"
                min="0.25"
                max="2"
                step="0.25"
                value={ratio.sweet}
                onChange={(e) => setRatio({...ratio, sweet: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-mist rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Add to `/learn/fundamentals/ratios` page**:
```typescript
import { RatioCalculator } from '@/components/education/RatioCalculator';

export default function RatiosPage() {
  return (
    <MainContainer>
      <h1>Cocktail Ratios Explained</h1>
      <RatioCalculator />
      {/* Add explanation content */}
    </MainContainer>
  );
}
```

---

### 3. Learning Dashboard Page

**Impact**: High - Central hub for all education

**Implementation**:

```typescript
// app/learn/page.tsx
import { MainContainer } from '@/components/layout/MainContainer';
import { getCurrentUser } from '@/lib/auth.server';
import { getBarIngredients } from '@/lib/barIngredients.server';
import Link from 'next/link';
import { 
  BeakerIcon, 
  SparklesIcon, 
  AcademicCapIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const TECHNIQUES = [
  { slug: 'shaking', name: 'Shaking', description: 'Master the art of shaking cocktails' },
  { slug: 'stirring', name: 'Stirring', description: 'Learn when and how to stir' },
  { slug: 'muddling', name: 'Muddling', description: 'Extract flavors with muddling' },
  { slug: 'building', name: 'Building', description: 'Simple building technique' },
];

const SPIRITS = [
  { slug: 'gin', name: 'Gin', description: 'Complete guide to gin' },
  { slug: 'vodka', name: 'Vodka', description: 'Everything about vodka' },
  { slug: 'rum', name: 'Rum', description: 'Rum deep-dive' },
  { slug: 'whiskey', name: 'Whiskey', description: 'Whiskey guide' },
];

export default async function LearnPage() {
  const user = await getCurrentUser();
  const userBar = user ? await getBarIngredients(user.id) : [];
  
  return (
    <MainContainer>
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-forest mb-4">
          Learn Mixology
        </h1>
        <p className="text-lg text-sage max-w-2xl mx-auto">
          Master the art of making cocktails at home. Learn techniques, understand spirits, 
          and build your skills step by step.
        </p>
      </div>
      
      {/* Quick Stats */}
      {user && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white border border-mist rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-forest">{userBar.length}</div>
            <div className="text-sm text-sage">Ingredients</div>
          </div>
          <div className="bg-white border border-mist rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-forest">0</div>
            <div className="text-sm text-sage">Techniques Learned</div>
          </div>
          <div className="bg-white border border-mist rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-forest">0</div>
            <div className="text-sm text-sage">Paths Completed</div>
          </div>
          <div className="bg-white border border-mist rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-forest">0</div>
            <div className="text-sm text-sage">Quizzes Passed</div>
          </div>
        </div>
      )}
      
      {/* Techniques Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <BeakerIcon className="w-6 h-6 text-olive" />
          <h2 className="text-2xl font-display font-bold text-forest">
            Techniques
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TECHNIQUES.map(technique => (
            <Link
              key={technique.slug}
              href={`/learn/techniques/${technique.slug}`}
              className="bg-white border border-mist rounded-xl p-6 hover:shadow-card transition-all"
            >
              <h3 className="font-display font-semibold text-forest mb-2">
                {technique.name}
              </h3>
              <p className="text-sm text-sage">{technique.description}</p>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/learn/techniques"
            className="text-olive hover:text-forest font-medium"
          >
            View All Techniques →
          </Link>
        </div>
      </section>
      
      {/* Spirits Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <SparklesIcon className="w-6 h-6 text-terracotta" />
          <h2 className="text-2xl font-display font-bold text-forest">
            Spirit Guides
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SPIRITS.map(spirit => (
            <Link
              key={spirit.slug}
              href={`/learn/spirits/${spirit.slug}`}
              className="bg-white border border-mist rounded-xl p-6 hover:shadow-card transition-all"
            >
              <h3 className="font-display font-semibold text-forest mb-2">
                {spirit.name}
              </h3>
              <p className="text-sm text-sage">{spirit.description}</p>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/learn/spirits"
            className="text-terracotta hover:text-forest font-medium"
          >
            View All Spirits →
          </Link>
        </div>
      </section>
      
      {/* Fundamentals Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <AcademicCapIcon className="w-6 h-6 text-forest" />
          <h2 className="text-2xl font-display font-bold text-forest">
            Fundamentals
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/learn/fundamentals/ratios"
            className="bg-white border border-mist rounded-xl p-6 hover:shadow-card transition-all"
          >
            <ChartBarIcon className="w-8 h-8 text-olive mb-3" />
            <h3 className="font-display font-semibold text-forest mb-2">
              Cocktail Ratios
            </h3>
            <p className="text-sm text-sage">
              Understand the science behind cocktail ratios
            </p>
          </Link>
          <Link
            href="/learn/fundamentals/balance"
            className="bg-white border border-mist rounded-xl p-6 hover:shadow-card transition-all"
          >
            <ChartBarIcon className="w-8 h-8 text-terracotta mb-3" />
            <h3 className="font-display font-semibold text-forest mb-2">
              Flavor Balance
            </h3>
            <p className="text-sm text-sage">
              Learn how to balance flavors in cocktails
            </p>
          </Link>
          <Link
            href="/learn/fundamentals/equipment"
            className="bg-white border border-mist rounded-xl p-6 hover:shadow-card transition-all"
          >
            <ChartBarIcon className="w-8 h-8 text-forest mb-3" />
            <h3 className="font-display font-semibold text-forest mb-2">
              Home Bar Equipment
            </h3>
            <p className="text-sm text-sage">
              Essential tools for your home bar
            </p>
          </Link>
        </div>
      </section>
    </MainContainer>
  );
}
```

---

### 4. Simple Technique Page Template

**Impact**: Medium-High - Core educational content

**Implementation**:

```typescript
// app/learn/techniques/[slug]/page.tsx
import { MainContainer } from '@/components/layout/MainContainer';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCocktailsByTechnique } from '@/lib/cocktails.server';

// For now, use static data. Later, fetch from database/CMS
const TECHNIQUES: Record<string, any> = {
  'shaking': {
    title: 'Shaking',
    description: 'Shaking is the most common technique for cocktails that include citrus, fruit juices, or cream. It aerates, chills, and dilutes the drink.',
    whenToUse: [
      'Cocktails with citrus juice (lemon, lime)',
      'Drinks with fruit juices',
      'Cocktails with cream or egg whites',
      'Any drink that needs aeration'
    ],
    steps: [
      {
        step: 1,
        title: 'Fill shaker with ice',
        description: 'Fill your shaker 2/3 full with fresh ice cubes'
      },
      {
        step: 2,
        title: 'Add ingredients',
        description: 'Pour all ingredients into the shaker'
      },
      {
        step: 3,
        title: 'Seal and shake',
        description: 'Seal the shaker tightly and shake vigorously for 10-15 seconds'
      },
      {
        step: 4,
        title: 'Strain',
        description: 'Strain into the appropriate glass'
      }
    ],
    commonMistakes: [
      'Shaking too gently (needs vigorous motion)',
      'Shaking too long (over-dilutes)',
      'Using warm ice (always use fresh, cold ice)',
      'Not sealing properly (leaks everywhere)'
    ],
    tips: [
      'Shake until the shaker is too cold to hold',
      'Use large ice cubes for less dilution',
      'Shake hard for drinks with egg whites',
      'Double-strain for drinks with fruit pulp'
    ]
  },
  // Add more techniques...
};

export default async function TechniquePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const technique = TECHNIQUES[slug];
  
  if (!technique) {
    notFound();
  }
  
  // Get cocktails that use this technique
  const practiceCocktails = await getCocktailsByTechnique(technique.title);
  
  return (
    <MainContainer>
      {/* Hero */}
      <div className="mb-8">
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-sage hover:text-forest mb-4"
        >
          ← Back to Learn
        </Link>
        <h1 className="text-4xl font-display font-bold text-forest mb-4">
          {technique.title} Technique
        </h1>
        <p className="text-lg text-sage max-w-3xl">
          {technique.description}
        </p>
      </div>
      
      {/* When to Use */}
      <section className="mb-8">
        <h2 className="text-2xl font-display font-bold text-forest mb-4">
          When to Use This Technique
        </h2>
        <div className="bg-white border border-mist rounded-xl p-6">
          <ul className="space-y-2">
            {technique.whenToUse.map((use: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-olive mt-1">✓</span>
                <span className="text-sage">{use}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      
      {/* Step-by-Step */}
      <section className="mb-8">
        <h2 className="text-2xl font-display font-bold text-forest mb-4">
          Step-by-Step Guide
        </h2>
        <div className="space-y-4">
          {technique.steps.map((step: any) => (
            <div
              key={step.step}
              className="bg-white border border-mist rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-olive/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-olive">{step.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-forest mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sage">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Common Mistakes */}
      <section className="mb-8">
        <h2 className="text-2xl font-display font-bold text-forest mb-4">
          Common Mistakes to Avoid
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <ul className="space-y-2">
            {technique.commonMistakes.map((mistake: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-600 mt-1">⚠</span>
                <span className="text-sage">{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      
      {/* Tips */}
      <section className="mb-8">
        <h2 className="text-2xl font-display font-bold text-forest mb-4">
          Pro Tips
        </h2>
        <div className="bg-olive/5 border border-olive/20 rounded-xl p-6">
          <ul className="space-y-2">
            {technique.tips.map((tip: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-olive mt-1">💡</span>
                <span className="text-sage">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      
      {/* Practice Cocktails */}
      {practiceCocktails.length > 0 && (
        <section>
          <h2 className="text-2xl font-display font-bold text-forest mb-4">
            Practice with These Cocktails
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {practiceCocktails.slice(0, 6).map(cocktail => (
              <Link
                key={cocktail.id}
                href={`/cocktails/${cocktail.slug}`}
                className="bg-white border border-mist rounded-xl p-4 hover:shadow-card transition-all"
              >
                <h3 className="font-display font-semibold text-forest mb-1">
                  {cocktail.name}
                </h3>
                {cocktail.short_description && (
                  <p className="text-sm text-sage line-clamp-2">
                    {cocktail.short_description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </MainContainer>
  );
}
```

---

### 5. Educational Tooltips Throughout App

**Impact**: Medium - Low effort, high value

**Implementation**:

```typescript
// components/education/EducationalTooltip.tsx
'use client';

import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface EducationalTooltipProps {
  term: string;
  explanation: string;
  link?: string;
}

export function EducationalTooltip({ term, explanation, link }: EducationalTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <span className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-olive hover:text-forest transition-colors"
      >
        <span className="underline decoration-dotted">{term}</span>
        <InformationCircleIcon className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 bg-forest text-white rounded-lg p-3 text-sm shadow-lg">
          <p className="mb-2">{explanation}</p>
          {link && (
            <a
              href={link}
              className="text-olive hover:text-white underline"
            >
              Learn more →
            </a>
          )}
          <div className="absolute bottom-0 left-4 transform translate-y-full">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-forest" />
          </div>
        </div>
      )}
    </span>
  );
}
```

**Usage in cocktail pages**:
```typescript
// In RecipeContent.tsx
<p>
  This cocktail uses the <EducationalTooltip
    term="shaking"
    explanation="Shaking aerates and chills cocktails with citrus or fruit juices. Shake for 10-15 seconds until the shaker is too cold to hold."
    link="/learn/techniques/shaking"
  /> technique.
</p>
```

---

## 🎯 Next Steps

1. **Start with #1** - Add technique previews to cocktail pages (30 min)
2. **Then #2** - Build ratio calculator (1 hour)
3. **Then #3** - Create learning dashboard (2 hours)
4. **Then #4** - Build first technique page (1 hour)
5. **Finally #5** - Add tooltips throughout (1 hour)

Total: ~6 hours for a solid foundation of educational features!

---

## 📝 Notes

- Start with static content, add database/CMS later
- Focus on user value first, polish later
- Test with real users early and often
- Iterate based on what gets used most
