export type GroceryItem = {
  id: string;
  name: string;
  cat?: string;
  image?: string;
  done: boolean;
  by?: string; // who asked for / added the item (shared lists)
};

export type ListKind = "solo" | "shared";

export type GroceryList = {
  id: string;
  title: string;
  kind: ListKind;
  items: GroceryItem[];
  createdAt: number;
};

export const uid = (): string =>
  (globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);
