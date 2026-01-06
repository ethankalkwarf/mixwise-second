"use client";

import { QRCodeSVG } from "qrcode.react";
import { getSiteUrl } from "@/lib/site";
import type { WeddingMenuData } from "./weddingTypes";

interface WeddingMenuPreviewProps {
  menuData: WeddingMenuData;
}

// Helper to normalize ingredients from various formats
function normalizeIngredients(raw: any): string[] {
  if (!raw) return [];
  
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.text) return item.text;
        if (item?.ingredient?.name) {
          const amount = item.amount ? `${item.amount}${item.unit || " oz"} ` : "";
          return `${amount}${item.ingredient.name}`;
        }
        return String(item || "").trim();
      })
      .filter((text) => text && text.length > 0);
  }
  
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return normalizeIngredients(parsed);
    } catch {
      return raw.split("|").map((s: string) => s.trim()).filter(Boolean);
    }
  }
  
  return [];
}

// Format date for display
function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function WeddingMenuPreview({ menuData }: WeddingMenuPreviewProps) {
  const { coupleNames, weddingDate, hisCocktail, herCocktail, theme } = menuData;
  
  const isClassic = theme === "classic";
  const siteUrl = getSiteUrl();
  
  // Generate QR code URL - link to first selected cocktail or homepage
  const qrUrl = hisCocktail
    ? `${siteUrl}/cocktails/${hisCocktail.slug}`
    : herCocktail
    ? `${siteUrl}/cocktails/${herCocktail.slug}`
    : `${siteUrl}`;

  const hisIngredients = hisCocktail ? normalizeIngredients(hisCocktail.ingredients) : [];
  const herIngredients = herCocktail ? normalizeIngredients(herCocktail.ingredients) : [];

  return (
    <div
      className={`wedding-menu-preview ${
        isClassic ? "bg-white text-forest" : "bg-slate-900 text-cream"
      }`}
      style={{
        width: "210mm", // A4 width
        minHeight: "297mm", // A4 height
        padding: "20mm",
        fontFamily: isClassic ? "serif" : "sans-serif",
        boxSizing: "border-box",
      }}
    >

      {/* Header */}
      <div className="text-center mb-12">
        <h1
          className={`text-5xl font-serif font-bold mb-4 ${
            isClassic ? "text-forest" : "text-cream"
          }`}
        >
          {coupleNames || "Couple's Names"}
        </h1>
        {weddingDate && (
          <p
            className={`text-2xl ${
              isClassic ? "text-sage" : "text-slate-300"
            }`}
          >
            {formatDate(weddingDate)}
          </p>
        )}
        <div
          className={`mt-6 mx-auto w-24 h-0.5 ${
            isClassic ? "bg-terracotta" : "bg-cream"
          }`}
        />
      </div>

      {/* Cocktails Section */}
      <div className="grid md:grid-cols-2 gap-12 mb-12">
        {/* His Choice */}
        <div>
          <h2
            className={`text-3xl font-serif font-bold mb-6 ${
              isClassic ? "text-forest" : "text-cream"
            }`}
          >
            His Choice
          </h2>
          {hisCocktail ? (
            <>
              <h3
                className={`text-2xl font-serif font-semibold mb-4 ${
                  isClassic ? "text-terracotta" : "text-lime-400"
                }`}
              >
                {hisCocktail.name}
              </h3>
              {hisIngredients.length > 0 && (
                <ul
                  className={`space-y-2 text-lg ${
                    isClassic ? "text-sage" : "text-slate-300"
                  }`}
                >
                  {hisIngredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span
                        className={`mr-2 ${
                          isClassic ? "text-terracotta" : "text-lime-400"
                        }`}
                      >
                        •
                      </span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className={`text-lg ${isClassic ? "text-sage" : "text-slate-400"}`}>
              Select a cocktail...
            </p>
          )}
        </div>

        {/* Her Choice */}
        <div>
          <h2
            className={`text-3xl font-serif font-bold mb-6 ${
              isClassic ? "text-forest" : "text-cream"
            }`}
          >
            Her Choice
          </h2>
          {herCocktail ? (
            <>
              <h3
                className={`text-2xl font-serif font-semibold mb-4 ${
                  isClassic ? "text-terracotta" : "text-lime-400"
                }`}
              >
                {herCocktail.name}
              </h3>
              {herIngredients.length > 0 && (
                <ul
                  className={`space-y-2 text-lg ${
                    isClassic ? "text-sage" : "text-slate-300"
                  }`}
                >
                  {herIngredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span
                        className={`mr-2 ${
                          isClassic ? "text-terracotta" : "text-lime-400"
                        }`}
                      >
                        •
                      </span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className={`text-lg ${isClassic ? "text-sage" : "text-slate-400"}`}>
              Select a cocktail...
            </p>
          )}
        </div>
      </div>

      {/* Footer with QR Code */}
      <div
        className={`mt-auto pt-8 border-t ${
          isClassic ? "border-mist" : "border-slate-700"
        } flex items-center justify-between`}
      >
        <div className="flex-1">
          <p
            className={`text-sm mb-2 ${
              isClassic ? "text-sage" : "text-slate-400"
            }`}
          >
            Scan to rate these drinks on MixWise
          </p>
          <p
            className={`text-xs ${
              isClassic ? "text-sage" : "text-slate-500"
            }`}
          >
            getmixwise.com
          </p>
        </div>
        <div className="ml-4 print:block">
          <div className="print:block" style={{ display: "block" }}>
            <QRCodeSVG
              value={qrUrl}
              size={80}
              level="M"
              bgColor={isClassic ? "#FFFFFF" : "#1e293b"}
              fgColor={isClassic ? "#000000" : "#F9F7F2"}
              includeMargin={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

