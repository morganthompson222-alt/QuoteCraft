// UK Market Data — structured pricing dataset for common tradesperson services
// Prices in GBP, updated 2026

export type MarketEntry = {
  service: string;
  aliases: string[];
  unit: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  region: string;
  category: string;
};

export const MARKET_DATA: MarketEntry[] = [
  // Patio & Driveway
  { service: "patio_cleaning", aliases: ["patio wash", "jet wash patio", "pressure wash patio", "power wash patio", "cleaning patio"], unit: "sqm", minPrice: 2.50, maxPrice: 8, avgPrice: 4.50, region: "UK", category: "exterior_cleaning" },
  { service: "driveway_cleaning", aliases: ["drive wash", "jet wash drive", "block paving clean"], unit: "sqm", minPrice: 2, maxPrice: 7, avgPrice: 4, region: "UK", category: "exterior_cleaning" },
  { service: "resanding", aliases: ["re-sand", "sand joints", "repoint paving", "resand patio"], unit: "sqm", minPrice: 2, maxPrice: 5, avgPrice: 3.50, region: "UK", category: "paving" },

  // Moss & Weed
  { service: "moss_removal", aliases: ["moss treatment", "remove moss", "kill moss", "moss control"], unit: "sqm", minPrice: 2, maxPrice: 5, avgPrice: 3, region: "UK", category: "exterior_cleaning" },
  { service: "weed_removal", aliases: ["weed killing", "weed treatment", "weed control", "remove weeds"], unit: "sqm", minPrice: 1.50, maxPrice: 4, avgPrice: 2, region: "UK", category: "gardening" },

  // Cleaning & Washing
  { service: "power_washing", aliases: ["pressure washing", "jet wash", "power wash", "pressure clean"], unit: "sqm", minPrice: 2, maxPrice: 6, avgPrice: 3.50, region: "UK", category: "exterior_cleaning" },
  { service: "gutter_cleaning", aliases: ["clean gutters", "gutter clear", "clear gutters"], unit: "metre", minPrice: 2, maxPrice: 5, avgPrice: 3, region: "UK", category: "exterior_cleaning" },
  { service: "window_cleaning", aliases: ["clean windows", "window wash"], unit: "window", minPrice: 2, maxPrice: 10, avgPrice: 5, region: "UK", category: "cleaning" },
  { service: "roof_cleaning", aliases: ["roof wash", "clean roof", "roof moss"], unit: "sqm", minPrice: 4, maxPrice: 12, avgPrice: 7, region: "UK", category: "exterior_cleaning" },

  // Gardening
  { service: "lawn_mowing", aliases: ["cut grass", "mow lawn", "lawn cut", "grass cutting"], unit: "sqm", minPrice: 0.15, maxPrice: 0.50, avgPrice: 0.25, region: "UK", category: "gardening" },
  { service: "hedge_trimming", aliases: ["trim hedge", "cut hedge", "hedge cut", "trimming hedges"], unit: "metre", minPrice: 3, maxPrice: 10, avgPrice: 5, region: "UK", category: "gardening" },
  { service: "tree_surgery", aliases: ["tree cutting", "cut tree", "remove tree", "trim tree", "tree work"], unit: "hour", minPrice: 50, maxPrice: 150, avgPrice: 80, region: "UK", category: "arboriculture" },

  // Painting & Decorating
  { service: "interior_painting", aliases: ["paint room", "wall painting", "decorate room", "paint walls"], unit: "sqm", minPrice: 8, maxPrice: 20, avgPrice: 12, region: "UK", category: "decorating" },
  { service: "exterior_painting", aliases: ["paint exterior", "outside painting", "house painting"], unit: "sqm", minPrice: 10, maxPrice: 25, avgPrice: 15, region: "UK", category: "decorating" },
  { service: "fence_painting", aliases: ["paint fence", "stain fence", "treat fence"], unit: "panel", minPrice: 10, maxPrice: 25, avgPrice: 15, region: "UK", category: "decorating" },

  // Fencing
  { service: "fence_installation", aliases: ["build fence", "new fence", "install fencing", "fence panels"], unit: "metre", minPrice: 40, maxPrice: 100, avgPrice: 60, region: "UK", category: "construction" },
  { service: "fence_repair", aliases: ["fix fence", "repair fence", "mend fence", "replace panel"], unit: "panel", minPrice: 20, maxPrice: 80, avgPrice: 40, region: "UK", category: "construction" },

  // Building & Construction
  { service: "bricklaying", aliases: ["brick work", "build wall", "lay bricks", "brick wall"], unit: "sqm", minPrice: 50, maxPrice: 120, avgPrice: 80, region: "UK", category: "construction" },
  { service: "plastering", aliases: ["plaster", "skim coat", "replaster", "plaster walls"], unit: "sqm", minPrice: 10, maxPrice: 25, avgPrice: 15, region: "UK", category: "construction" },
  { service: "decking_installation", aliases: ["build deck", "new decking", "deck build", "install decking"], unit: "sqm", minPrice: 60, maxPrice: 150, avgPrice: 100, region: "UK", category: "construction" },

  // Electrical
  { service: "socket_installation", aliases: ["install socket", "new plug", "add socket"], unit: "per socket", minPrice: 40, maxPrice: 80, avgPrice: 55, region: "UK", category: "electrical" },
  { service: "light_fitting", aliases: ["install light", "fit light", "light installation"], unit: "per fitting", minPrice: 30, maxPrice: 80, avgPrice: 45, region: "UK", category: "electrical" },

  // Plumbing
  { service: "tap_replacement", aliases: ["replace tap", "new tap", "fit tap"], unit: "per tap", minPrice: 40, maxPrice: 100, avgPrice: 60, region: "UK", category: "plumbing" },
  { service: "radiator_installation", aliases: ["install radiator", "new radiator", "fit radiator"], unit: "per radiator", minPrice: 80, maxPrice: 200, avgPrice: 120, region: "UK", category: "plumbing" },

  // Flooring
  { service: "carpet_fitting", aliases: ["fit carpet", "carpet installation", "lay carpet"], unit: "sqm", minPrice: 5, maxPrice: 15, avgPrice: 8, region: "UK", category: "flooring" },
  { service: "laminate_flooring", aliases: ["lay laminate", "laminate floor", "wood floor"], unit: "sqm", minPrice: 15, maxPrice: 40, avgPrice: 25, region: "UK", category: "flooring" },
  { service: "tiling", aliases: ["lay tiles", "tile floor", "tile wall", "install tiles"], unit: "sqm", minPrice: 25, maxPrice: 60, avgPrice: 35, region: "UK", category: "flooring" },

  // Waste Removal
  { service: "waste_removal", aliases: ["remove waste", "rubbish removal", "clear rubbish", "skip", "rubbish clearance"], unit: "load", minPrice: 30, maxPrice: 150, avgPrice: 60, region: "UK", category: "waste" },
  { service: "skip_hire", aliases: ["hire skip", "skip bin", "rent skip"], unit: "per skip", minPrice: 100, maxPrice: 300, avgPrice: 180, region: "UK", category: "waste" },
];

// Normalize a service description to find the best market match
export function findMarketEntry(task: string): MarketEntry | null {
  const lower = task.toLowerCase().trim();
  let best: MarketEntry | null = null;
  let bestScore = 0;

  for (const entry of MARKET_DATA) {
    // Check exact service match
    if (lower === entry.service) return entry;

    // Check aliases
    for (const alias of entry.aliases) {
      if (lower === alias || lower.startsWith(alias) || alias.startsWith(lower)) {
        return entry;
      }
      // Partial match scoring
      const aliasWords = alias.split(/[\s_]+/);
      const taskWords = lower.split(/[\s_]+/);
      const overlap = aliasWords.filter(w => taskWords.includes(w)).length;
      const score = overlap / Math.max(aliasWords.length, 1);
      if (score > bestScore && score > 0.3) {
        bestScore = score;
        best = entry;
      }
    }
  }

  return best;
}

// For AI-use: get the market data as a formatted string for inclusion in prompts
export function getMarketDataPrompt(): string {
  const categories = new Set(MARKET_DATA.map(e => e.category));
  let out = "MARKET PRICING DATA (UK averages, use ONLY these values):\n";
  for (const cat of categories) {
    out += `\n## ${cat.replace(/_/g, " ").toUpperCase()}\n`;
    const entries = MARKET_DATA.filter(e => e.category === cat);
    for (const e of entries) {
      out += `- ${e.service.replace(/_/g, " ")}: avg £${e.avgPrice}/${e.unit} (range £${e.minPrice}-£${e.maxPrice})\n`;
    }
  }
  return out;
}
