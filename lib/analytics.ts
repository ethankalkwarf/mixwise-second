/**
 * Analytics Stub Functions
 * 
 * These functions serve as placeholders for future analytics integration.
 * Currently they are no-ops that log to console for debugging.
 * 
 * When implementing analytics, integrate with services like:
 * - Email: ConvertKit, Mailchimp, Resend
 * - Analytics: Mixpanel, Amplitude, PostHog
 */

/**
 * Track when a new user signs up.
 * Called when a user creates their account for the first time.
 * 
 * @param userId - The Supabase user ID
 * @param email - The user's email address (optional)
 */
export async function trackUserSignup(userId: string, email?: string | null): Promise<void> {
  // Placeholder for future analytics implementation
  // This would send signup events to analytics service and email platform
  console.log("[Analytics] User signed up:", { userId, email: email || "N/A" });
}

/**
 * Track when a user signs in.
 * 
 * @param userId - The Supabase user ID
 */
export async function trackUserSignIn(userId: string): Promise<void> {
  // Placeholder for future analytics implementation
  console.log("[Analytics] User signed in:", userId);
}

/**
 * Track when a user adds an ingredient to their bar.
 * 
 * @param userId - The Supabase user ID (null for anonymous)
 * @param ingredientId - The ingredient ID
 * @param ingredientName - The ingredient name
 */
export async function trackIngredientAdded(
  userId: string | null,
  ingredientId: string,
  ingredientName: string
): Promise<void> {
  // Placeholder for future analytics implementation
  console.log("[Analytics] Ingredient added:", { userId, ingredientId, ingredientName });
}

/**
 * Track when a user favorites a cocktail.
 * 
 * @param userId - The Supabase user ID
 * @param cocktailId - The cocktail ID
 * @param cocktailName - The cocktail name
 */
export async function trackCocktailFavorited(
  userId: string,
  cocktailId: string,
  cocktailName: string
): Promise<void> {
  // Placeholder for future analytics implementation
  console.log("[Analytics] Cocktail favorited:", { userId, cocktailId, cocktailName });
}

/**
 * Track when a user views a cocktail.
 * 
 * @param userId - The Supabase user ID (null for anonymous)
 * @param cocktailId - The cocktail ID
 * @param cocktailName - The cocktail name
 */
export async function trackCocktailView(
  userId: string | null,
  cocktailId: string,
  cocktailName: string
): Promise<void> {
  // Placeholder for future analytics implementation
  console.log("[Analytics] Cocktail viewed:", { userId, cocktailId, cocktailName });
}

/**
 * Track when a user uses the Mix tool.
 * 
 * @param userId - The Supabase user ID (null for anonymous)
 * @param ingredientCount - Number of ingredients selected
 * @param matchCount - Number of cocktails matched
 */
export async function trackMixToolUsed(
  userId: string | null,
  ingredientCount: number,
  matchCount: number
): Promise<void> {
  // Placeholder for future analytics implementation
  console.log("[Analytics] Mix tool used:", { userId, ingredientCount, matchCount });
}

/**
 * Track when a user signs up for the email newsletter/lead magnet.
 * 
 * @param email - The email address
 * @param source - Where the signup came from ('footer', 'cocktail_guide', etc.)
 */
export async function trackEmailSignup(
  email: string,
  source: string
): Promise<void> {
  // Placeholder for future analytics implementation
  // This would send email signups to email platform service
  console.log("[Analytics] Email signup:", { email, source });
}

// Make trackEmailSignup available globally for the modal
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).trackEmailSignup = trackEmailSignup;
}

