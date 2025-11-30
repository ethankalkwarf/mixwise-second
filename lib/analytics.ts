/**
 * Analytics and Email Platform Integration
 * 
 * This module provides stub functions for integrating with email platforms
 * and analytics services. These hooks are called at key moments in the
 * user journey.
 * 
 * TODO: Integrate with your email platform (e.g., ConvertKit, Mailchimp, Resend)
 * and analytics service (e.g., Mixpanel, Amplitude, PostHog).
 */

/**
 * Track when a new user signs up.
 * Called when a user creates their account for the first time.
 * 
 * @param userId - The Supabase user ID
 * @param email - The user's email address (optional)
 */
export async function trackUserSignup(userId: string, email?: string | null): Promise<void> {
  // TODO: Send to email platform to add to welcome sequence
  // Example with ConvertKit:
  // await fetch('https://api.convertkit.com/v3/forms/{form_id}/subscribe', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     api_key: process.env.CONVERTKIT_API_KEY,
  //     email: email,
  //     tags: ['mixwise-signup'],
  //   }),
  // });

  // TODO: Send to analytics
  // Example with Mixpanel:
  // mixpanel.track('User Signed Up', { userId, email });

  console.log("[Analytics] User signed up:", { userId, email: email || "N/A" });
}

/**
 * Track when a user signs in.
 * 
 * @param userId - The Supabase user ID
 */
export async function trackUserSignIn(userId: string): Promise<void> {
  // TODO: Track sign-in event
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
  // TODO: Track ingredient added event
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
  // TODO: Track favorite event
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
  // TODO: Track view event
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
  // TODO: Track mix tool usage
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
  // TODO: Send to email platform
  // Example with ConvertKit:
  // await fetch('https://api.convertkit.com/v3/forms/{form_id}/subscribe', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     api_key: process.env.CONVERTKIT_API_KEY,
  //     email: email,
  //     tags: [source],
  //   }),
  // });

  console.log("[Analytics] Email signup:", { email, source });
}

// Make trackEmailSignup available globally for the modal
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).trackEmailSignup = trackEmailSignup;
}

