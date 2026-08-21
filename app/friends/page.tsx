"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { MainContainer } from "@/components/layout/MainContainer";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { usePreferredAuthMode } from "@/lib/auth/returning-user";
import { useNativeShell } from "@/hooks/useIsNativeApp";
import { useLayoutTier } from "@/hooks/useLayoutTier";
import { FriendsActivityFeed } from "@/components/friends/FriendsActivityFeed";
import { InviteFriendsSheet } from "@/components/friends/InviteFriendsSheet";
import { FriendsInviteCard } from "@/components/friends/FriendsInviteCard";
import { FriendsFindPanel } from "@/components/friends/FriendsFindPanel";
import { FriendsFollowingList } from "@/components/friends/FriendsFollowingList";
import { FriendsTabBar } from "@/components/friends/FriendsTabBar";
import { PullToRefreshContainer } from "@/components/mobile/PullToRefreshContainer";
import { useFriendsPageState, type FriendsPageState } from "@/hooks/useFriendsPageState";

function SignInPrompt({ className }: { className?: string }) {
  const { openAuthDialog } = useAuthDialog();
  const preferredAuthMode = usePreferredAuthMode();
  return (
    <div className={className}>
      <p className="text-sm text-sage">
        Sign in to follow bartenders, get an invite link, and see activity from people you know.
      </p>
      <button
        type="button"
        onClick={() => openAuthDialog({ mode: preferredAuthMode })}
        className="btn-primary mt-4"
      >
        Sign in
      </button>
    </div>
  );
}

function ActivityPanel({
  state,
  onFindPeople,
}: {
  state: FriendsPageState;
  onFindPeople?: () => void;
}) {
  return (
    <div>
      <FriendsActivityFeed />
      {!state.followingLoading && state.following.length === 0 && (
        <p className="mt-4 text-sm text-sage">
          Follow a few people (or invite friends) and their saves and badges show up here.
          {onFindPeople && (
            <>
              {" "}
              <button
                type="button"
                onClick={onFindPeople}
                className="font-medium text-olive hover:text-olive-dark"
              >
                Find people
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}

function TabbedPanels({ state }: { state: FriendsPageState }) {
  return (
    <>
      {state.tab === "activity" && (
        <ActivityPanel state={state} onFindPeople={() => state.setTab("find")} />
      )}
      {state.tab === "find" && (
        <FriendsFindPanel
          inputId="friend-search"
          query={state.query}
          onQueryChange={state.setQuery}
          searching={state.searching}
          searchMessage={state.searchMessage}
          results={state.results}
          onResultFollowChange={() => void state.loadFollowing()}
          onSuggestedFollowed={state.bumpFollowing}
        />
      )}
      {state.tab === "following" && (
        <FriendsFollowingList
          following={state.following}
          loading={state.followingLoading}
          onUnfollow={(id) => state.setFollowing((list) => list.filter((p) => p.id !== id))}
          onFindPeople={() => state.setTab("find")}
        />
      )}
    </>
  );
}

function NativeFriendsPage() {
  const router = useRouter();
  const state = useFriendsPageState();

  return (
    <>
      <PullToRefreshContainer
        className="min-h-screen bg-cream pb-10"
        onRefresh={async () => {
          await state.loadFollowing();
        }}
      >
        <div
          className="sticky top-0 z-10 border-b border-mist/50 bg-cream/95 backdrop-blur-md"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest shadow-sm"
              aria-label="Back"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-bold text-forest">Friends</h1>
              <p className="text-sm text-sage">Invite, follow, and see what they&apos;re pouring</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-4 pt-5">
          {!state.isLoading && !state.isAuthenticated ? (
            <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
              <SignInPrompt />
            </div>
          ) : (
            <>
              {state.isAuthenticated ? (
                <FriendsInviteCard
                  variant="native"
                  onInvite={() => state.setInviteOpen(true)}
                />
              ) : null}

              <FriendsTabBar
                variant="native"
                tab={state.tab}
                onChange={state.setTab}
                followingCount={state.following.length}
                followingLoading={state.followingLoading}
              />

              {state.tab === "activity" ? (
                <div className="rounded-[1.75rem] bg-white px-4 py-2 shadow-sm">
                  <ActivityPanel state={state} onFindPeople={() => state.setTab("find")} />
                </div>
              ) : null}

              {state.tab === "find" ? (
                <div className="space-y-4">
                  <div className="rounded-[1.75rem] bg-white p-4 shadow-sm">
                    <FriendsFindPanel
                      inputId="friend-search-native"
                      query={state.query}
                      onQueryChange={state.setQuery}
                      searching={state.searching}
                      searchMessage={state.searchMessage}
                      results={state.results}
                      onResultFollowChange={() => void state.loadFollowing()}
                      onSuggestedFollowed={state.bumpFollowing}
                    />
                  </div>
                  <div className="rounded-[1.75rem] bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-baseline justify-between gap-2">
                      <h2 className="font-display text-lg font-bold text-forest">Following</h2>
                      {!state.followingLoading && state.following.length > 0 ? (
                        <p className="text-sm tabular-nums text-sage">{state.following.length}</p>
                      ) : null}
                    </div>
                    <FriendsFollowingList
                      following={state.following}
                      loading={state.followingLoading}
                      onUnfollow={(id) =>
                        state.setFollowing((list) => list.filter((p) => p.id !== id))
                      }
                      emptyHint="Follow someone from Find, or invite a friend with your link."
                    />
                  </div>
                </div>
              ) : null}

              {state.tab === "following" ? (
                <div className="rounded-[1.75rem] bg-white p-4 shadow-sm">
                  <FriendsFollowingList
                    following={state.following}
                    loading={state.followingLoading}
                    onUnfollow={(id) =>
                      state.setFollowing((list) => list.filter((p) => p.id !== id))
                    }
                    onFindPeople={() => state.setTab("find")}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </PullToRefreshContainer>

      <InviteFriendsSheet
        open={state.inviteOpen}
        onClose={() => state.setInviteOpen(false)}
      />
    </>
  );
}

function PhoneFriendsLayout({ state }: { state: FriendsPageState }) {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <Link
          href="/account"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-sage hover:text-forest"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Account
        </Link>
        <h1 className="font-serif text-3xl font-bold text-forest">Friends</h1>
        <p className="mt-1 text-sage">
          See what people you follow are mixing — and invite friends to{"\u00A0"}join you.
        </p>
      </header>

      {!state.isLoading && !state.isAuthenticated ? (
        <section className="rounded-3xl border border-mist bg-white p-6">
          <SignInPrompt />
        </section>
      ) : (
        <>
          {state.isAuthenticated && (
            <FriendsInviteCard onInvite={() => state.setInviteOpen(true)} />
          )}
          <FriendsTabBar
            tab={state.tab}
            onChange={state.setTab}
            followingCount={state.following.length}
            followingLoading={state.followingLoading}
          />
          <section className="rounded-3xl border border-mist bg-white p-6">
            <TabbedPanels state={state} />
          </section>
        </>
      )}
    </div>
  );
}

function TabletFriendsLayout({ state }: { state: FriendsPageState }) {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <Link
          href="/account"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-sage hover:text-forest"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Account
        </Link>
        <h1 className="font-serif text-3xl font-bold text-forest">Friends</h1>
        <p className="mt-1 max-w-lg text-sage">
          See what people you follow are mixing — invite and find on the side.
        </p>
      </header>

      {!state.isLoading && !state.isAuthenticated ? (
        <section className="rounded-3xl border border-mist bg-white p-6">
          <SignInPrompt />
        </section>
      ) : (
        <div className="grid grid-cols-2 gap-5 items-start">
          <section className="rounded-3xl border border-mist bg-white p-6">
            <h2 className="font-serif text-lg font-bold text-forest">Activity</h2>
            <p className="mt-1 mb-4 text-sm text-sage">
              Recent saves, badges, and bar updates.
            </p>
            <ActivityPanel state={state} />
          </section>

          <div className="space-y-5">
            {state.isAuthenticated && (
              <FriendsInviteCard
                variant="compact"
                onInvite={() => state.setInviteOpen(true)}
              />
            )}
            <section className="rounded-3xl border border-mist bg-white p-5">
              <h2 className="mb-3 font-serif text-lg font-bold text-forest">Find</h2>
              <FriendsFindPanel
                inputId="friend-search"
                query={state.query}
                onQueryChange={state.setQuery}
                searching={state.searching}
                searchMessage={state.searchMessage}
                results={state.results}
                onResultFollowChange={() => void state.loadFollowing()}
                onSuggestedFollowed={state.bumpFollowing}
              />
            </section>
            <section className="rounded-3xl border border-mist bg-white p-5">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className="font-serif text-lg font-bold text-forest">Following</h2>
                {!state.followingLoading && state.following.length > 0 && (
                  <p className="text-sm text-sage tabular-nums">{state.following.length}</p>
                )}
              </div>
              <FriendsFollowingList
                following={state.following}
                loading={state.followingLoading}
                onUnfollow={(id) =>
                  state.setFollowing((list) => list.filter((p) => p.id !== id))
                }
              />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopFriendsLayout({ state }: { state: FriendsPageState }) {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/account"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-sage hover:text-forest"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Account
          </Link>
          <h1 className="font-serif text-4xl font-bold text-forest">Friends</h1>
          <p className="mt-1 whitespace-nowrap text-sage">
            See what people you follow are mixing — and invite friends to join.
          </p>
        </div>
        {state.isAuthenticated && (
          <button
            type="button"
            onClick={() => state.setInviteOpen(true)}
            className="btn-primary"
          >
            Invite friends
          </button>
        )}
      </header>

      {!state.isLoading && !state.isAuthenticated ? (
        <section className="max-w-md rounded-3xl border border-mist bg-white p-8">
          <SignInPrompt />
        </section>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-8 items-start xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-3xl border border-mist bg-white p-7 xl:p-8">
            <h2 className="font-serif text-xl font-bold text-forest">Activity</h2>
            <p className="mt-1 mb-5 text-sm text-sage">
              Saves, badges, and bar updates from people you follow.
            </p>
            <ActivityPanel state={state} />
          </section>

          <aside className="sticky top-24 space-y-5">
            <section className="rounded-3xl border border-mist bg-white p-5">
              <h2 className="mb-3 font-serif text-lg font-bold text-forest">Find people</h2>
              <FriendsFindPanel
                inputId="friend-search"
                query={state.query}
                onQueryChange={state.setQuery}
                searching={state.searching}
                searchMessage={state.searchMessage}
                results={state.results}
                onResultFollowChange={() => void state.loadFollowing()}
                onSuggestedFollowed={state.bumpFollowing}
              />
            </section>
            <section className="rounded-3xl border border-mist bg-white p-5">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className="font-serif text-lg font-bold text-forest">Following</h2>
                {!state.followingLoading && state.following.length > 0 && (
                  <p className="text-sm text-sage tabular-nums">{state.following.length}</p>
                )}
              </div>
              <div className="max-h-[min(420px,50vh)] overflow-y-auto pr-1">
                <FriendsFollowingList
                  following={state.following}
                  loading={state.followingLoading}
                  onUnfollow={(id) =>
                    state.setFollowing((list) => list.filter((p) => p.id !== id))
                  }
                />
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

function WebFriendsPage() {
  const state = useFriendsPageState();
  const tier = useLayoutTier();

  return (
    <>
      <div className="py-8 sm:py-10 lg:py-12">
        <MainContainer>
          {tier === "phone" && <PhoneFriendsLayout state={state} />}
          {tier === "tablet" && <TabletFriendsLayout state={state} />}
          {tier === "desktop" && <DesktopFriendsLayout state={state} />}
        </MainContainer>
      </div>

      <InviteFriendsSheet
        open={state.inviteOpen}
        onClose={() => state.setInviteOpen(false)}
      />
    </>
  );
}

export default function FriendsPage() {
  const native = useNativeShell();
  return native ? <NativeFriendsPage /> : <WebFriendsPage />;
}
