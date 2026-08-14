export type OriginCover = {
  src: string;
  alt: string;
};

const COVERS = {
  juniper: {
    src: "/ingredients/origins/juniper.jpg",
    alt: "Juniper shrubs and berries on a hillside",
  },
  corn: {
    src: "/ingredients/origins/corn.jpg",
    alt: "A corn field at harvest light",
  },
  grain: {
    src: "/ingredients/origins/grain.jpg",
    alt: "A grain field of rye and barley",
  },
  sugarcane: {
    src: "/ingredients/origins/sugarcane.jpg",
    alt: "Sugarcane growing in tropical light",
  },
  vineyard: {
    src: "/ingredients/origins/vineyard.jpg",
    alt: "Grapevines with fruit on the vine",
  },
  oranges: {
    src: "/ingredients/origins/oranges.jpg",
    alt: "Bitter oranges growing in a Mediterranean grove",
  },
  citrus: {
    src: "/ingredients/origins/citrus.jpg",
    alt: "Limes and lemons on the tree",
  },
  coffee: {
    src: "/ingredients/origins/coffee.jpg",
    alt: "Coffee cherries ripening on the shrub",
  },
  agave: {
    src: "/ingredients/origins/agave.webp",
    alt: "Blue agave in a Mexican highland field",
  },
} as const satisfies Record<string, OriginCover>;

const SLUG_TO_COVER: Record<string, keyof typeof COVERS> = {
  gin: "juniper",
  vodka: "grain",
  bourbon: "corn",
  whiskey: "corn",
  whisky: "corn",
  rye: "grain",
  "rye-whiskey": "grain",
  scotch: "grain",
  "blended-scotch": "grain",
  "irish-whiskey": "grain",
  rum: "sugarcane",
  "white-rum": "sugarcane",
  "light-rum": "sugarcane",
  "dark-rum": "sugarcane",
  tequila: "agave",
  mezcal: "agave",
  "agave-syrup": "agave",
  cognac: "vineyard",
  brandy: "vineyard",
  pisco: "vineyard",
  "apple-brandy": "vineyard",
  vermouth: "vineyard",
  "sweet-vermouth": "vineyard",
  "dry-vermouth": "vineyard",
  prosecco: "vineyard",
  champagne: "vineyard",
  sherry: "vineyard",
  campari: "oranges",
  aperol: "oranges",
  cointreau: "oranges",
  "triple-sec": "oranges",
  "grand-marnier": "oranges",
  "orange-juice": "oranges",
  "orange-bitters": "oranges",
  "orange-peel": "oranges",
  "lime-juice": "citrus",
  "lemon-juice": "citrus",
  "fresh-lemon-juice": "citrus",
  "grapefruit-juice": "citrus",
  "coffee-liqueur": "coffee",
  kahlua: "coffee",
  espresso: "coffee",
};

export function getIngredientOriginCover(slug: string): OriginCover | null {
  const key = SLUG_TO_COVER[slug];
  return key ? COVERS[key] : null;
}
