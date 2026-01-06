import { Metadata } from "next";
import { WeddingCocktailFinder } from "@/components/wedding/WeddingCocktailFinder";
import { generatePageMetadata } from "@/lib/seo";
import { WebPageSchema } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Wedding Cocktail Finder - Personalized Drink Recommendations for Your Big Day",
  description: "Find the perfect wedding cocktails with our free quiz. Get personalized drink recommendations based on your wedding style, preferred spirits, and flavor preferences. Discover elegant, classic, or modern cocktails for your wedding bar.",
  path: "/wedding-menu",
  keywords: [
    "wedding cocktails",
    "wedding drink menu",
    "wedding bar ideas",
    "cocktail recommendations",
    "wedding planning",
    "wedding drinks",
    "signature cocktails",
    "wedding bar menu",
    "cocktail quiz",
    "personalized cocktails",
    "wedding beverage planning",
    "bride and groom cocktails",
    "wedding reception drinks",
  ],
});

export default function WeddingMenuPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I find the perfect wedding cocktails?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Answer our quick quiz about your wedding style, preferred spirits, and flavor preferences. We'll provide personalized cocktail recommendations tailored to your wedding.",
        },
      },
      {
        "@type": "Question",
        name: "What information do I need to provide for cocktail recommendations?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our quiz asks about your preferred flavors (sweet, tart, bitter, strong, or light), favorite spirits (vodka, gin, whiskey, rum, tequila, etc.), wedding style (classic, modern, tropical, elegant, or casual), and desired complexity level.",
        },
      },
      {
        "@type": "Question",
        name: "Are the cocktail recommendations free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Our wedding cocktail finder is completely free. Answer a few questions and get personalized recommendations instantly.",
        },
      },
      {
        "@type": "Question",
        name: "Can I save my cocktail selections?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, create a free MixWise account to save your wedding cocktail selections and access them anytime. You'll also get personalized recommendations for your home bar.",
        },
      },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Find Perfect Wedding Cocktails",
    description: "Step-by-step guide to finding personalized cocktail recommendations for your wedding",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Start the Quiz",
        text: "Click 'Start Quiz' to begin answering questions about your wedding preferences.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Answer Questions",
        text: "Answer questions about your preferred flavors, spirits, wedding style, and cocktail complexity.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "View Recommendations",
        text: "Review personalized cocktail recommendations based on your answers.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Select Your Cocktails",
        text: "Choose 'His Choice' and 'Her Choice' cocktails from the recommendations.",
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Save Your Selections",
        text: "Create a free account to save your selections and access them anytime.",
      },
    ],
  };

  return (
    <>
      <WebPageSchema
        title="Wedding Cocktail Finder - Personalized Drink Recommendations"
        description="Find the perfect wedding cocktails with our free quiz. Get personalized drink recommendations based on your wedding style, preferred spirits, and flavor preferences."
        url={`${SITE_CONFIG.url}/wedding-menu`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <WeddingCocktailFinder />
    </>
  );
}

