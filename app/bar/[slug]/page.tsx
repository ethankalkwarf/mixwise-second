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
import { UserCircleIcon, LockClosedIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

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

async function getProfileData(slug: string): Promise<{
  profile: PublicProfile | null;
  preferences: UserPreferences | null;
  ingredients: BarIngredient[];
  isOwnerView: boolean;
}> {
  // Determine view type first
  const isOwnerView = isUUID(slug);

  // Use authenticated server client for owner views, anon client for public views
  const supabase = isOwnerView ? createServerClient() : createPublicClient();

  let profileQuery = supabase
    .from("profiles")
    .select("id, display_name, username, public_slug, avatar_url");

  if (isOwnerView) {
    // Owner view: slug is a userId (UUID)
    profileQuery = profileQuery.eq("id", slug);
  } else {
    // Public view: slug is username or public_slug
    profileQuery = profileQuery.or(`username.eq.${slug},public_slug.eq.${slug}`);
  }

  const { data: profile, error: profileError } = await profileQuery.single();

  if (profileError || !profile) {
    return { profile: null, preferences: null, ingredients: [], isOwnerView };
  }

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
}



interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { profile, isOwnerView } = await getProfileData(params.slug);

  if (!profile) {
    return {
      title: "Bar Not Found | MixWise",
      description: "This bar profile could not be found.",
    };
  }

  const displayName = profile.display_name || profile.username || "Anonymous Bartender";

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
}

export default async function BarPage({ params }: Props) {
  try {
    console.log('[BAR PAGE] Loading bar for slug:', params.slug);
    const { profile, preferences, ingredients, isOwnerView } = await getProfileData(params.slug);
    console.log('[BAR PAGE] Profile data loaded:', { profile: !!profile, preferences: !!preferences, ingredientsCount: ingredients.length, isOwnerView });

  // Profile not found
  if (!profile) {
    notFound();
  }

  const displayName = profile.display_name || profile.username || "Anonymous Bartender";
  const isPublic = preferences?.public_bar_enabled === true;
  const ingredientIds = ingredients.map(ing => ing.ingredient_id);

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
              ingredientIds={ingredientIds}
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
                {!isPublic && (
                  <div className="flex items-center gap-2 text-sage">
                    <LockClosedIcon className="w-5 h-5" />
                    <span>This bar is private</span>
                  </div>
                )}
              </div>
            </div>
          </div>

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
            ingredientIds={ingredientIds}
            ingredients={ingredients}
            isOwner={false}
          />
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
                Something went wrong
              </h1>
              <p className="text-sage text-lg mb-8 max-w-2xl mx-auto">
                We encountered an error while loading this bar profile. Please try again later.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-cream rounded-xl transition-colors font-medium"
                >
                  ← Back to Home
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-mist hover:bg-stone text-forest rounded-xl transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </MainContainer>
      </div>
    );
  }
}
