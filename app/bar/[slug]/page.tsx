import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import { getUserBarIngredients, getMixCocktails, getStapleIngredientIds } from "@/lib/cocktails.server";
import { MainContainer } from "@/components/layout/MainContainer";
import { BarProfile } from "@/components/bar/BarProfile";
import { PublicBarJoinCta } from "@/components/bar/PublicBarJoinCta";
import { generatePageMetadata } from "@/lib/seo";
import type { Database } from "@/lib/supabase/database.types";
import { UserCircleIcon, LockClosedIcon, ArrowLeftIcon, Cog6ToothIcon, BeakerIcon, UserGroupIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { ShareBarButton } from "@/components/bar/ShareBarButton";
import { PublicBarShare } from "@/components/bar/PublicBarShare";
import { PublicBarCompare } from "@/components/bar/PublicBarCompare";
import { BarStoriesShareActions } from "@/components/bar/BarStoriesShareActions";
import { getBarSharePath } from "@/lib/barShare";
import { debugLog } from "@/lib/debugLog";
import { getMixMatchGroups } from "@/lib/mixMatching";
import { FollowButton } from "@/components/bar/FollowButton";
import { ListeningTrackPlayer } from "@/components/bar/ListeningTrackPlayer";
import { getPublicMixologistTier } from "@/lib/mixologistTier.server";
import { optimizeAvatarUrl } from "@/lib/avatarUrl";

// Force dynamic rendering to ensure fresh data on every request
// This ensures ingredients and favorites are always up-to-date
export const dynamic = 'force-dynamic';

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
  bio: string | null;
  listening_spotify_id: string | null;
  listening_deezer_id: string | null;
  listening_track_name: string | null;
  listening_track_artist: string | null;
}

interface BarIngredient {
  ingredient_id: string; // UUID string from ingredients table
  ingredient_name: string | null;
  ingredient_category?: string | null;
}

interface UserPreferences {
  public_bar_enabled: boolean;
}

// Check if a string is a valid UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Helper function to process profile result and get ingredients
async function processProfileResult(profile: any, isOwnerView: boolean, supabase: any) {
  // Defensive null check - profile should never be null at this point, but handle gracefully if it is
  if (!profile) {
    console.warn('[BAR PAGE] processProfileResult called with null profile');
    return { profile: null, preferences: null, ingredients: [], isOwnerView };
  }
  
  debugLog('[BAR PAGE] Processing profile result for:', profile.id);

  try {
    // For owner view, we don't check public_bar_enabled
    // For public view, the profiles RLS policy already ensures we only get public profiles
    // So we don't need to separately check public_bar_enabled - if we got a profile, it's public
    // Normalize ingredient IDs to canonical numeric IDs (strings).
    // This prevents Public Bar from undercounting due to legacy/non-canonical IDs in `bar_ingredients`.
    const normalized = await getUserBarIngredients(profile.id);
    const ingredients: BarIngredient[] = normalized.map((item) => ({
      ingredient_id: String(item.ingredient_id),
      ingredient_name: item.ingredient_name,
      ingredient_category: item.ingredient_category ?? null,
    }));

    if (!isOwnerView) {
      // For public view, we assume it's enabled since profiles RLS filtered it
      const preferences = { public_bar_enabled: true };

      return {
        profile,
        preferences,
        ingredients,
        isOwnerView
      };
    }

    return {
      profile,
      preferences: null, // Not needed for owner view
      ingredients,
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
    debugLog('[BAR PAGE] getProfileData called with slug:', slug);

    // Determine view type first
    const isOwnerView = isUUID(slug);
    debugLog('[BAR PAGE] isOwnerView determined:', isOwnerView);

    // Use authenticated server client for owner views, anon client for public views
    const supabase = isOwnerView ? await createServerClient() : createPublicClient();
    debugLog('[BAR PAGE] Supabase client created, type:', isOwnerView ? 'authenticated' : 'anonymous');

    // Build query dynamically to handle missing columns gracefully
    const selectFields =
      "id, display_name, avatar_url, username, public_slug, bio, listening_spotify_id, listening_deezer_id, listening_track_name, listening_track_artist" as const;

    let profileQuery = supabase
      .from("profiles")
      .select(selectFields);

    debugLog('[BAR PAGE] Querying for slug:', slug, 'isOwnerView:', isOwnerView, 'fields:', selectFields);

    if (isOwnerView) {
      // Owner view: slug is a userId (UUID)
      debugLog('[BAR PAGE] Owner view - querying by ID');
      profileQuery = profileQuery.eq("id", slug);
    } else {
      // Public view: try username first, fallback to public_slug if column exists
      debugLog('[BAR PAGE] Public view - attempting flexible query');
      try {
        // First try with username
        const usernameQuery = supabase
          .from("profiles")
          .select(selectFields)
          .eq("username", slug);

        const { data: usernameResult, error: usernameError } = await usernameQuery.single();

        if (usernameResult && !usernameError) {
          debugLog('[BAR PAGE] Found profile by username');
          return await processProfileResult(usernameResult, isOwnerView, supabase);
        }

        // If username didn't work, try public_slug
        debugLog('[BAR PAGE] Username query failed, trying public_slug');
        const slugQuery = supabase
          .from("profiles")
          .select(selectFields)
          .eq("public_slug", slug);

        const { data: slugResult, error: slugError } = await slugQuery.single();

        if (slugResult && !slugError) {
          debugLog('[BAR PAGE] Found profile by public_slug');
          return await processProfileResult(slugResult, isOwnerView, supabase);
        }

        // If both fail, the profile doesn't exist
        debugLog('[BAR PAGE] No profile found by username or public_slug');
        return { profile: null, preferences: null, ingredients: [], isOwnerView };

      } catch (queryError) {
        console.error('[BAR PAGE] Query error:', queryError);
        return { profile: null, preferences: null, ingredients: [], isOwnerView };
      }
    }

    debugLog('[BAR PAGE] Executing profile query...');
    const { data: profile, error: profileError } = await profileQuery.single();

    debugLog('[BAR PAGE] Profile query result:', {
      profile: profile ? 'found' : 'null',
      profileError: profileError ? profileError.message : 'none',
      profileId: profile?.id
    });

    if (profileError || !profile) {
      debugLog('[BAR PAGE] No profile found or query error, returning notFound');
      if (profileError) {
        console.error('[BAR PAGE] Profile query error details:', profileError);
      }
      return { profile: null, preferences: null, ingredients: [], isOwnerView };
    }

    return await processProfileResult(profile, isOwnerView, supabase);
  } catch (error) {
    console.error('[BAR PAGE] Error in getProfileData:', error);
    return { profile: null, preferences: null, ingredients: [], isOwnerView: false };
  }
}



interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { profile, isOwnerView } = await getProfileData(slug);

    if (!profile) {
      debugLog('[BAR PAGE] No profile found for metadata');
      return generatePageMetadata({
        title: "Bar Not Found",
        description: "This bar profile could not be found.",
        path: `/bar/${slug}`,
        noIndex: true,
      });
    }

    const displayName = profile.display_name || profile.username || "Anonymous Bartender";
    debugLog('[BAR PAGE] Generated metadata for:', displayName, 'isOwnerView:', isOwnerView);

    if (isOwnerView) {
      return generatePageMetadata({
        title: displayName,
        description: "Manage your bar with ingredients and discover new cocktails.",
        path: `/bar/${slug}`,
        noIndex: true,
        // Let opengraph-image.tsx own the preview (don't force legacy /og-image.jpg).
        ogImage: false,
      });
    }

    return generatePageMetadata({
      title: `${displayName}'s Bar`,
      description:
        profile.bio?.trim() ||
        `Check out ${displayName}'s bar and see what cocktails they can make at home on MixWise.`,
      path: `/bar/${slug}`,
      ogImage: false,
    });
  } catch (error) {
    console.error('[BAR PAGE] Error in generateMetadata:', error);
    return generatePageMetadata({
      title: "Bar Not Found",
      description: "This bar profile could not be found.",
      noIndex: true,
    });
  }
}

export default async function BarPage({ params }: Props) {
  try {
    const { slug } = await params;
    const { profile, preferences, ingredients, isOwnerView } = await getProfileData(slug);
    debugLog('[BAR PAGE] getProfileData returned:', { hasProfile: !!profile, isOwnerView });
    debugLog('[BAR PAGE] Profile data loaded:', { profile: !!profile, preferences: !!preferences, ingredientsCount: ingredients.length, isOwnerView });

  // Profile not found
  if (!profile) {
    notFound();
  }

  const displayName = profile.display_name || profile.username || "Anonymous Bartender";
  const firstName = displayName.split(' ')[0] || displayName; // Get first name for personalized heading
  const isPublic = preferences?.public_bar_enabled === true;
  const { tier } = await getPublicMixologistTier(profile.id, { asOwner: isOwnerView });
  const avatarUrl = optimizeAvatarUrl(profile.avatar_url, 400);

  // Use ingredient IDs directly (they're already UUID strings from getUserBarIngredients)
  const cocktailIngredientIds = ingredients.map(ing => ing.ingredient_id);

  // For owner view, show owner interface
  if (isOwnerView) {
    return (
      <div className="min-h-screen bg-botanical-gradient py-8 sm:py-16">
        <MainContainer>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header with Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sage hover:text-forest transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to MixWise
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/friends"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-mist hover:bg-stone text-forest rounded-xl transition-colors font-medium"
                >
                  <UserGroupIcon className="w-4 h-4" />
                  Friends
                </Link>
                <Link
                  href="/mix"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-olive hover:bg-olive-dark text-cream rounded-xl transition-colors font-medium"
                >
                  <BeakerIcon className="w-4 h-4" />
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
            <div className="card p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-5 min-w-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-full overflow-hidden bg-olive/20 ring-2 ring-mist flex items-center justify-center">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName}
                        width={112}
                        height={112}
                        quality={90}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-12 h-12 text-olive" />
                    )}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h1 className="text-3xl font-serif font-bold text-forest">
                      {displayName}
                    </h1>
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-sage">
                      <Link
                        href="/badges"
                        className="inline-flex items-center gap-1.5 rounded-full bg-olive/10 px-2.5 py-0.5 font-medium text-olive hover:bg-olive/15"
                      >
                        <span aria-hidden>{tier.emoji}</span>
                        {tier.name}
                      </Link>
                      <span className="text-mist hidden sm:inline" aria-hidden>
                        ·
                      </span>
                      <span>
                        {ingredients.length} ingredient{ingredients.length === 1 ? "" : "s"}
                      </span>
                    </p>
                    {profile.bio && (
                      <p className="mt-2 text-forest/80 max-w-md">{profile.bio}</p>
                    )}
                    {profile.listening_deezer_id &&
                      profile.listening_track_name &&
                      profile.listening_track_artist && (
                      <ListeningTrackPlayer
                        className="mt-4"
                        deezerId={profile.listening_deezer_id}
                        trackName={profile.listening_track_name}
                        trackArtist={profile.listening_track_artist}
                      />
                    )}
                    <FollowButton userId={profile.id} className="mt-3" />
                  </div>
                </div>
                <div className="flex flex-col items-stretch sm:items-end gap-2">
                  <ShareBarButton
                    stats={{ ingredientCount: ingredients.length }}
                  />
                  {getBarSharePath(profile) ? (
                    <BarStoriesShareActions
                      displayName={displayName}
                      sharePath={getBarSharePath(profile)!}
                      username={profile.username}
                      avatarUrl={avatarUrl}
                      stats={{ ingredientCount: ingredients.length }}
                      mode="owner"
                    />
                  ) : null}
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
  let makeableCount = 0;
  try {
    const [cocktails, stapleIds] = await Promise.all([
      getMixCocktails(),
      getStapleIngredientIds(),
    ]);
    const valid = cocktails.filter(
      (c) => c?.ingredients && Array.isArray(c.ingredients) && c.ingredients.length > 0
    );
    const { ready } = getMixMatchGroups({
      cocktails: valid,
      ownedIngredientIds: cocktailIngredientIds,
      stapleIngredientIds: stapleIds,
    });
    makeableCount = ready.length;
  } catch (err) {
    console.error("[BAR PAGE] Failed to compute makeable count:", err);
  }
  const shareStats = {
    ingredientCount: ingredients.length,
    makeableCount,
  };
  const sharePath = getBarSharePath(profile) || `/bar/${slug}`;

  // Owner viewing their own public bar URL — offer Edit
  let isLoggedInOwner = false;
  try {
    const authClient = await createServerClient();
    const {
      data: { user: viewer },
    } = await authClient.auth.getUser();
    isLoggedInOwner = Boolean(viewer?.id && viewer.id === profile.id);
  } catch {
    isLoggedInOwner = false;
  }

  return (
    <div className="min-h-screen bg-botanical-gradient py-8 sm:py-16">
      <MainContainer>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sage hover:text-forest transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to MixWise
            </Link>
            {isLoggedInOwner && (
              <Link
                href="/account"
                className="inline-flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2 text-sm font-medium text-forest ring-1 ring-mist transition hover:bg-white hover:ring-olive/30"
              >
                <PencilSquareIcon className="h-4 w-4 text-olive" />
                Edit profile
              </Link>
            )}
          </div>

          {/* Profile Header */}
          <div className="card p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex items-start gap-5 min-w-0 flex-1">
                <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-full overflow-hidden bg-olive/20 ring-2 ring-mist flex items-center justify-center">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={112}
                      height={112}
                      quality={90}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-12 h-12 text-olive" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest">
                        {displayName}&apos;s Bar
                      </h1>
                      {profile.username && (
                        <p className="text-sage mt-0.5">@{profile.username}</p>
                      )}
                    </div>
                    {isLoggedInOwner && (
                      <Link
                        href="/account"
                        className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-mist bg-cream/50 px-3 py-1.5 text-sm font-medium text-forest transition hover:border-olive/40 hover:bg-white"
                      >
                        <PencilSquareIcon className="h-4 w-4 text-olive" />
                        Edit
                      </Link>
                    )}
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-sage">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-olive/10 px-2.5 py-0.5 font-medium text-olive">
                      <span aria-hidden>{tier.emoji}</span>
                      {tier.name}
                    </span>
                    <span className="text-mist" aria-hidden>
                      ·
                    </span>
                    <span>
                      {ingredients.length} ingredient{ingredients.length === 1 ? "" : "s"}
                    </span>
                    {makeableCount > 0 && (
                      <>
                        <span className="text-mist" aria-hidden>
                          ·
                        </span>
                        <span>
                          {makeableCount} drink{makeableCount === 1 ? "" : "s"} ready
                        </span>
                      </>
                    )}
                  </div>
                  {profile.bio && (
                    <p className="mt-3 max-w-xl text-forest/80 leading-relaxed">{profile.bio}</p>
                  )}
                  {profile.listening_deezer_id &&
                    profile.listening_track_name &&
                    profile.listening_track_artist && (
                    <ListeningTrackPlayer
                      className="mt-4"
                      deezerId={profile.listening_deezer_id}
                      trackName={profile.listening_track_name}
                      trackArtist={profile.listening_track_artist}
                    />
                  )}
                  {isLoggedInOwner ? (
                    <p className="mt-4 text-sm text-sage">
                      This is how your bar looks to friends.{" "}
                      <Link href="/account" className="font-medium text-olive hover:text-olive-dark">
                        Edit photo, bio & username
                      </Link>
                    </p>
                  ) : (
                    <FollowButton userId={profile.id} className="mt-4" />
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-mist/80 pt-5">
              <PublicBarShare
                displayName={displayName}
                sharePath={sharePath}
                username={profile.username}
                stats={shareStats}
              />
              <BarStoriesShareActions
                displayName={displayName}
                sharePath={sharePath}
                username={profile.username}
                avatarUrl={avatarUrl}
                stats={shareStats}
                mode={isLoggedInOwner ? "owner" : "recipient"}
              />
            </div>
          </div>

          {!isLoggedInOwner && (
            <PublicBarCompare
              displayName={firstName}
              theirIngredients={ingredients}
            />
          )}

          <BarProfile
            ingredientIds={cocktailIngredientIds}
            ingredients={ingredients}
            isOwner={isLoggedInOwner}
            showAlmostThere={false}
            isPublicView={true}
            userFirstName={firstName}
            userId={profile.id}
          />

          {!isLoggedInOwner && (
            <PublicBarJoinCta
              displayName={firstName}
              makeableCount={makeableCount}
              ingredientCount={ingredients.length}
              inviteUsername={profile.username}
            />
          )}
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
