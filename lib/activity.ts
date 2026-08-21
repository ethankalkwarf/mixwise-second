export type ActivityItem = {
  id: string;
  type: "favorite" | "badge" | "bar_ingredient";
  createdAt: string;
  actor: {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    barPath: string | null;
    tierName: string;
  };
  favorite?: {
    cocktail_id: string;
    cocktail_name: string | null;
    cocktail_slug: string | null;
    cocktail_image_url: string | null;
  };
  badge?: {
    badge_id: string;
    name: string;
    icon: string;
  };
  ingredient?: {
    ingredient_id: string;
    ingredient_name: string | null;
  };
};
