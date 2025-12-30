import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import { MainContainer } from "@/components/layout/MainContainer";
import { BarProfile } from "@/components/bar/BarProfile";
import { SITE_CONFIG } from "@/lib/seo";
import type { Database } from "@/lib/supabase/database.types";
import { UserCircleIcon, LockClosedIcon, ArrowLeftIcon, ShareIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

// Create a Supabase client with anon key for public reads
function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

interface PublicProfile {
  id: string;
  display_name: string | null;
  username: string | null;
  public_slug: string;
  avatar_url: string | null;
}

interface BarIngredient {
  ingredient_id: string;
  ingredient_name: string | null;
}

interface UserPreferences {
  public_bar_enabled: boolean;
}

// Check if a string is a valid UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Helper function to get user's owned ingredients (from bar_ingredients table)
async function getUserOwnedIngredients(userId: string, supabase: any): Promise<string[]> {
  console.log('[BAR PAGE] Getting user owned ingredients for:', userId);

  const { data, error } = await supabase
    .from("bar_ingredients")
    .select("ingredient_id")
    .eq("user_id", userId);

  if (error) {
    console.error('[BAR PAGE] Error getting user owned ingredients:', error);
    return [];
  }

  return (data || []).map(item => item.ingredient_id);
}

// Helper function to process profile result and get ingredients
async function processProfileResult(profile: any, isOwnerView: boolean, supabase: any) {
  console.log('[BAR PAGE] Processing profile result for:', profile.id);

  try {
    // For owner view, we don't check public_bar_enabled
    // For public view, the profiles RLS policy already ensures we only get public profiles
    // So we don't need to separately check public_bar_enabled - if we got a profile, it's public
    if (!isOwnerView) {
      // Get bar ingredients for public profiles
      console.log('[BAR PAGE] Fetching ingredients for public profile');
      const { data: ingredients, error: ingError } = await supabase
        .from("bar_ingredients")
        .select("ingredient_id, ingredient_name")
        .eq("user_id", profile.id);

      if (ingError) {
        console.error('[BAR PAGE] Error fetching ingredients:', ingError);
      }

      // For public view, we assume it's enabled since profiles RLS filtered it
      const preferences = { public_bar_enabled: true };

      return {
        profile,
        preferences,
        ingredients: ingredients || [],
        isOwnerView
      };
    }

    // For owner view, we still need to get ingredients (but no public check needed)
    console.log('[BAR PAGE] Fetching ingredients for owner view');
    const { data: ingredients, error: ingError } = await supabase
      .from("bar_ingredients")
      .select("ingredient_id, ingredient_name")
      .eq("user_id", profile.id);

    if (ingError) {
      console.error('[BAR PAGE] Error fetching ingredients:', ingError);
    }

    return {
      profile,
      preferences: null, // Not needed for owner view
      ingredients: ingredients || [],
      isOwnerView
    };
  } catch (error) {
    console.error('[BAR PAGE] Error in processProfileResult:', error);
    return { profile: null, preferences: null, ingredients: [], isOwnerView };
  }
}

async function getProfileData(slug: string): Promise<{
  profile: PublicProfile | null;
  preferences: UserPreferences | null;
  ingredients: BarIngredient[];
  isOwnerView: boolean;
}> {
  try {
    console.log('[BAR PAGE] getProfileData called with slug:', slug);

    // Determine view type first
    const isOwnerView = isUUID(slug);
    console.log('[BAR PAGE] isOwnerView determined:', isOwnerView);

    // Use authenticated server client for owner views, anon client for public views
    const supabase = isOwnerView ? createServerClient() : createPublicClient();
    console.log('[BAR PAGE] Supabase client created, type:', isOwnerView ? 'authenticated' : 'anonymous');

    // Build query dynamically to handle missing columns gracefully
    let selectFields = "id, display_name, avatar_url";
    if (!isOwnerView) {
      // For public views, try to include username/public_slug if they exist
      selectFields += ", username, public_slug";
    }

    let profileQuery = supabase
      .from("profiles")
      .select(selectFields);

    console.log('[BAR PAGE] Querying for slug:', slug, 'isOwnerView:', isOwnerView, 'fields:', selectFields);

    if (isOwnerView) {
      // Owner view: slug is a userId (UUID)
      console.log('[BAR PAGE] Owner view - querying by ID');
      profileQuery = profileQuery.eq("id", slug);
    } else {
      // Public view: try username first, fallback to public_slug if column exists
      console.log('[BAR PAGE] Public view - attempting flexible query');
      try {
        // First try with username
        const usernameQuery = supabase
          .from("profiles")
          .select(selectFields)
          .eq("username", slug);

        const { data: usernameResult, error: usernameError } = await usernameQuery.single();

        if (usernameResult && !usernameError) {
          console.log('[BAR PAGE] Found profile by username');
          return await processProfileResult(usernameResult, isOwnerView, supabase);
        }

        // If username didn't work, try public_slug
        console.log('[BAR PAGE] Username query failed, trying public_slug');
        const slugQuery = supabase
          .from("profiles")
          .select(selectFields)
          .eq("public_slug", slug);

        const { data: slugResult, error: slugError } = await slugQuery.single();

        if (slugResult && !slugError) {
          console.log('[BAR PAGE] Found profile by public_slug');
          return await processProfileResult(slugResult, isOwnerView, supabase);
        }

        // If both fail, the profile doesn't exist
        console.log('[BAR PAGE] No profile found by username or public_slug');
        return { profile: null, preferences: null, ingredients: [], isOwnerView };

      } catch (queryError) {
        console.error('[BAR PAGE] Query error:', queryError);
        return { profile: null, preferences: null, ingredients: [], isOwnerView };
      }
    }

    console.log('[BAR PAGE] Executing profile query...');
    const { data: profile, error: profileError } = await profileQuery.single();

    console.log('[BAR PAGE] Profile query result:', {
      profile: profile ? 'found' : 'null',
      profileError: profileError ? profileError.message : 'none',
      profileId: profile?.id
    });

    if (profileError || !profile) {
      console.log('[BAR PAGE] No profile found or query error, returning notFound');
      if (profileError) {
        console.error('[BAR PAGE] Profile query error details:', profileError);
      }
      return { profile: null, preferences: null, ingredients: [], isOwnerView };
    }

    return await processProfileResult(profile, isOwnerView, supabase);

    // For owner view, we don't check public_bar_enabled
    // For public view, the profiles RLS policy already ensures we only get public profiles
    // So we don't need to separately check public_bar_enabled - if we got a profile, it's public
    if (!isOwnerView) {
      // Get bar ingredients for public profiles
      const { data: ingredients, error: ingError } = await supabase
        .from("bar_ingredients")
        .select("ingredient_id, ingredient_name")
        .eq("user_id", profile.id);

      // For public view, we assume it's enabled since profiles RLS filtered it
      const preferences = { public_bar_enabled: true };

      return {
        profile,
        preferences,
        ingredients: ingredients || [],
        isOwnerView
      };
    }

    // For owner view, we still need to get ingredients (but no public check needed)
    const { data: ingredients, error: ingError } = await supabase
      .from("bar_ingredients")
      .select("ingredient_id, ingredient_name")
      .eq("user_id", profile.id);

    return {
      profile,
      preferences: null, // Not needed for owner view
      ingredients: ingredients || [],
      isOwnerView
    };
  } catch (error) {
    console.error('[BAR PAGE] Error in getProfileData:', error);
    return { profile: null, preferences: null, ingredients: [], isOwnerView: false };
  }
}



interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    console.log('[BAR PAGE] generateMetadata called with slug:', params.slug);
    const { profile, isOwnerView } = await getProfileData(params.slug);

    if (!profile) {
      console.log('[BAR PAGE] No profile found for metadata');
      return {
        title: "Bar Not Found | MixWise",
        description: "This bar profile could not be found.",
      };
    }

    const displayName = profile.display_name || profile.username || "Anonymous Bartender";
    console.log('[BAR PAGE] Generated metadata for:', displayName, 'isOwnerView:', isOwnerView);

    if (isOwnerView) {
      return {
        title: `${displayName} | MixWise`,
        description: `Manage your bar with ingredients and discover new cocktails!`,
      };
    }

    return {
      title: `${displayName}'s Bar | MixWise`,
      description: `Check out ${displayName}'s bar and see what cocktails they can make!`,
      openGraph: {
        title: `${displayName}'s Bar | MixWise`,
        description: `Check out ${displayName}'s bar and see what cocktails they can make!`,
        type: "profile",
      },
    };
  } catch (error) {
    console.error('[BAR PAGE] Error in generateMetadata:', error);
    return {
      title: "Bar Not Found | MixWise",
      description: "This bar profile could not be found.",
    };
  }
}

export default async function BarPage({ params }: Props) {
  try {
    console.log('[BAR PAGE] Loading bar page for slug:', params.slug);
    const { profile, preferences, ingredients, isOwnerView } = await getProfileData(params.slug);
    console.log('[BAR PAGE] getProfileData returned:', { hasProfile: !!profile, isOwnerView });
    console.log('[BAR PAGE] Profile data loaded:', { profile: !!profile, preferences: !!preferences, ingredientsCount: ingredients.length, isOwnerView });

  // Profile not found
  if (!profile) {
    notFound();
  }

  const displayName = profile.display_name || profile.username || "Anonymous Bartender";
  const firstName = displayName.split(' ')[0] || displayName; // Get first name for personalized heading
  const isPublic = preferences?.public_bar_enabled === true;

  // For owner view, get user's owned ingredients (what they can actually make cocktails with)
  // For public view, use bar ingredients (what they display in their bar)
  let cocktailIngredientIds: string[];
  if (isOwnerView) {
    // For owner view, get user's owned ingredients from bar_ingredients table
    const supabase = createServerClient();
    cocktailIngredientIds = await getUserOwnedIngredients(params.slug, supabase);
    console.log('[BAR PAGE] Owner view - using owned ingredients:', cocktailIngredientIds.length);
  } else {
    cocktailIngredientIds = ingredients.map(ing => ing.ingredient_id);
  }

  // For owner view, show owner interface
  if (isOwnerView) {
    return (
      <div className="min-h-screen bg-botanical-gradient py-8 sm:py-16">
        <MainContainer>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sage hover:text-forest transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to MixWise
              </Link>

              <div className="flex items-center gap-4">
                <Link
                  href="/mix"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl transition-colors font-medium"
                >
                  <ShareIcon className="w-4 h-4" />
                  Mix Cocktails
                </Link>
                <Link
                  href="/account"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-mist hover:bg-stone text-forest rounded-xl transition-colors font-medium"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  Settings
                </Link>
              </div>
            </div>

            {/* Owner Bar Header */}
            <div className="card p-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-olive/20 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-8 h-8 text-olive" />
                </div>
                <div>
                  <h1 className="text-3xl font-serif font-bold text-forest">
                    {displayName}
                  </h1>
                  <p className="text-sage mt-1">
                    Your personal bar • {ingredients.length} ingredients
                  </p>
                </div>
              </div>
            </div>

            {/* Bar Content */}
            <BarProfile
              ingredientIds={cocktailIngredientIds}
              ingredients={ingredients}
              isOwner={true}
              showAllRecipesLink={true}
            />
          </div>
        </MainContainer>
      </div>
    );
  }

  // For public view, check if bar is public
  if (!isPublic) {
    return (
      <div className="min-h-screen bg-botanical-gradient py-8 sm:py-16">
        <MainContainer>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Back Navigation */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sage hover:text-forest transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to MixWise
            </Link>

            {/* Private Bar Message */}
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-stone/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <LockClosedIcon className="w-8 h-8 text-sage" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-forest mb-4">
                This Bar is Private
              </h1>
              <p className="text-sage text-lg mb-8 max-w-2xl mx-auto">
                {displayName} has chosen to keep their bar private.
                Only they can see their ingredients and cocktail possibilities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl transition-colors font-medium"
                >
                  ← Back to Home
                </Link>
                <Link
                  href="/mix"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-mist hover:bg-stone text-forest rounded-xl transition-colors font-medium"
                >
                  Try Mix Tool
                </Link>
              </div>
            </div>
          </div>
        </MainContainer>
      </div>
    );
  }

  // Public bar view

  return (
    <div className="min-h-screen bg-botanical-gradient py-8 sm:py-16">
      <MainContainer>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Back Navigation */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sage hover:text-forest transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to MixWise
          </Link>

          {/* Profile Header */}
          <div className="card p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-olive/20 flex items-center justify-center">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={displayName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-10 h-10 text-olive" />
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <h1 className="text-3xl font-serif font-bold text-forest mb-2">
                  {displayName}'s Bar
                </h1>
                {profile.username && (
                  <p className="text-sage mb-4">@{profile.username}</p>
                )}
                <p className="text-sage">
                  Public bar • {ingredients.length} ingredients
                </p>
              </div>
            </div>
          </div>

          {/* Bar Content */}
          <BarProfile
            ingredientIds={cocktailIngredientIds}
            ingredients={ingredients}
            isOwner={false}
            showAlmostThere={false}
            isPublicView={true}
            userFirstName={firstName}
          />

          {/* CTA to Join MixWise */}
          <div className="card p-8 text-center bg-gradient-to-r from-terracotta/10 to-olive/10 border-terracotta/20">
            <h3 className="text-xl font-serif font-bold text-forest mb-2">
              Ready to Mix Your Own Cocktails?
            </h3>
            <p className="text-sage mb-6 max-w-md mx-auto">
              Join MixWise to create your own bar, discover new recipes, and share your cocktail creations with friends.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl transition-colors font-medium"
              >
                Join MixWise
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-mist hover:bg-stone text-forest rounded-xl transition-colors font-medium"
              >
                Browse Cocktails
              </Link>
            </div>
          </div>
        </div>
      </MainContainer>
    </div>
  );
  } catch (error) {
    console.error('[BAR PAGE] Error loading bar page:', error);

    // Return error page for anonymous users
    return (
      <div className="min-h-screen bg-botanical-gradient py-8 sm:py-16">
        <MainContainer>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Back Navigation */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sage hover:text-forest transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to MixWise
            </Link>

            {/* Error Message */}
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-forest mb-4">
                Bar Profile Unavailable
              </h1>
              <p className="text-sage text-lg mb-8 max-w-2xl mx-auto">
                We're having trouble loading this bar profile. This might be because the feature is still being set up or there was a temporary error.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                <p className="text-amber-800 text-sm">
                  <strong>If you're the bar owner:</strong> Make sure you've enabled public bar sharing in your account settings and set a username.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl transition-colors font-medium"
                >
                  ← Back to Home
                </Link>
                <Link
                  href="/account"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-mist hover:bg-stone text-forest rounded-xl transition-colors font-medium"
                >
                  Account Settings
                </Link>
              </div>
            </div>
          </div>
        </MainContainer>
      </div>
    );
  }
}
