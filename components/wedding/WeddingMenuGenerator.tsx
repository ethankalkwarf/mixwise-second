"use client";

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { WeddingMenuPreview } from "./WeddingMenuPreview";
import { WeddingMenuControls } from "./WeddingMenuControls";
import { MainContainer } from "@/components/layout/MainContainer";
import type { Cocktail } from "@/lib/cocktailTypes";
import type { Cocktail as CocktailListItem } from "@/lib/cocktailTypes";

export type MenuTheme = "classic" | "chalkboard";

export interface WeddingMenuData {
  coupleNames: string;
  weddingDate: string;
  hisCocktail: Cocktail | null;
  herCocktail: Cocktail | null;
  theme: MenuTheme;
}

export function WeddingMenuGenerator() {
  const [menuData, setMenuData] = useState<WeddingMenuData>({
    coupleNames: "",
    weddingDate: "",
    hisCocktail: null,
    herCocktail: null,
    theme: "classic",
  });

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Wedding Menu - ${menuData.coupleNames || "Wedding"}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .no-print {
          display: none !important;
        }
        .wedding-menu-preview {
          width: 210mm !important;
          min-height: 297mm !important;
          padding: 20mm !important;
          margin: 0 !important;
          box-shadow: none !important;
          position: relative !important;
          left: auto !important;
          top: auto !important;
        }
      }
    `,
  });

  const updateMenuData = (updates: Partial<WeddingMenuData>) => {
    setMenuData((prev) => ({ ...prev, ...updates }));
  };

  const canPrint = menuData.coupleNames && menuData.weddingDate && menuData.hisCocktail && menuData.herCocktail;

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .wedding-menu-preview,
          .wedding-menu-preview * {
            visibility: visible;
          }
          .wedding-menu-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <MainContainer>
        <div className="min-h-screen py-8 bg-cream">
          {/* Header */}
          <div className="text-center mb-8 no-print">
            <h1 className="text-4xl font-display font-bold text-forest mb-4">
              Wedding Bar Menu Generator
            </h1>
            <p className="text-lg text-sage max-w-2xl mx-auto">
              Create a beautiful, printable menu for your wedding bar. Customize with your names, date, and favorite cocktails.
            </p>
          </div>

          {/* Split Layout */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Left Panel - Controls */}
            <div className="space-y-6 no-print">
              <WeddingMenuControls
                menuData={menuData}
                onUpdate={updateMenuData}
              />
              
              <div className="sticky top-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (canPrint && printRef.current) {
                      handlePrint();
                    }
                  }}
                  disabled={!canPrint}
                  className="w-full px-6 py-4 bg-terracotta hover:bg-terracotta-dark text-cream font-bold text-lg rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {canPrint ? "Download / Print Menu" : "Complete all fields to print"}
                </button>
                {!canPrint && (
                  <p className="text-sm text-sage mt-2 text-center">
                    Please fill in all fields and select both cocktails
                  </p>
                )}
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:sticky lg:top-4 h-fit no-print">
              <div className="bg-white border-2 border-mist rounded-2xl p-8 shadow-lg">
                <div ref={printRef}>
                  <WeddingMenuPreview menuData={menuData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </>
  );
}

