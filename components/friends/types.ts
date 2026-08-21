export type FriendPerson = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  barPath: string | null;
  tier?: { id: string; name: string };
};

export type FriendsTab = "activity" | "find" | "following";
