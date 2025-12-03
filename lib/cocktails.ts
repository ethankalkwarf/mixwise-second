"use server";

import "server-only";

import { createServerClient } from "@/lib/supabase/server";
import type { CocktailRow } from "@/lib/supabase/database.types";
import { normalizeCocktail, type Cocktail } from "./cocktailTypes";

function mapRows(rows: CocktailRow[] | null, { includeHidden = false }: { includeHidden?: boolean } = {}) {
  return (rows || [])
    .map((row) => normalizeCocktail(row))
    .filter((cocktail) => includeHidden || !cocktail.isHidden);
}

export async function getAllCocktails(options: { includeHidden?: boolean } = {}): Promise<Cocktail[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("cocktails")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch cocktails from Supabase", error);
    throw error;
  }

  return mapRows(data, options);
}

export async function getFeaturedCocktails(limit = 8): Promise<Cocktail[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("cocktails")
    .select("*")
    .eq("is_popular", true)
    .order("name", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch featured cocktails", error);
    throw error;
  }

  return mapRows(data);
}

export async function getCocktailBySlug(slug: string): Promise<Cocktail | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("cocktails")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch cocktail for slug ${slug}`, error);
    throw error;
  }

  if (!data) return null;

  const cocktail = normalizeCocktail(data);
  return cocktail.isHidden ? null : cocktail;
}

export async function getCocktailSlugs(): Promise<string[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("cocktails")
    .select("slug, is_hidden")
    .order("slug", { ascending: true });

  if (error) {
    console.error("Failed to fetch cocktail slugs", error);
    throw error;
  }

  return (data || [])
    .filter((row) => !row.is_hidden)
    .map((row) => row.slug);
}
