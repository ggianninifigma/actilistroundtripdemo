// The person you share lists with.
export const PARTNER = "Sabina";

// Visual identity for list members (initials + accent color).
export const AVATARS: Record<string, { label: string; className: string }> = {
  You: { label: "GG", className: "bg-[#E8743B] text-white" },
  [PARTNER]: { label: PARTNER[0], className: "bg-[#2F6B4F] text-white" },
};

// Product catalog — shared by the home screen and the list suggestions.
export type Product = { name: string; cat: string; image: string };

export const catalog: Product[] = [
  { name: "Avocados", cat: "Produce", image: "/assets/b0bf8.png" },
  { name: "Whole Milk", cat: "Dairy", image: "/assets/ba737.png" },
  { name: "Sourdough", cat: "Bakery", image: "/assets/22090.png" },
  { name: "Dish Soap", cat: "Household", image: "/assets/6e724.png" },
  { name: "Eggs (12)", cat: "Dairy", image: "/assets/e728f.png" },
];

// Recently purchased items shown on the home screen.
export const recent = [
  { ...catalog[0], by: PARTNER },
  { ...catalog[1], by: PARTNER },
  { ...catalog[2], by: "You" },
  { ...catalog[3], by: PARTNER },
  { ...catalog[4], by: "You" },
];

export const todo = [
  { title: "Weekend BBQ", items: 9, done: 3, shared: true, from: "WhatsApp" },
  { title: "Baby essentials", items: 5, done: 0, shared: true, from: "Photo" },
];

// A simulated incoming WhatsApp message from the partner.
export const whatsappThread = {
  time: "9:41 AM",
  text: "Morning love! 🛒 Can you grab these on your way home?\n• Avocados\n• Whole milk\n• Sourdough\n• Dish soap\n• Eggs",
};

export type ParsedItem = { name: string; cat?: string; image?: string; matched: boolean };

// Turn a free-text message into grocery items, matching the catalog for
// photos + categories where possible (the "I don't know what it looks like" fix).
export function parseGroceryText(text: string): ParsedItem[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^[•\-*]/.test(l))
    .map((l) => l.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean)
    .map((name) => {
      const n = name.toLowerCase();
      const match = catalog.find(
        (c) =>
          c.name.toLowerCase().startsWith(n) ||
          n.startsWith(c.name.toLowerCase().split(" (")[0]),
      );
      return match
        ? { name: match.name, cat: match.cat, image: match.image, matched: true }
        : { name, matched: false };
    });
}
