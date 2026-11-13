import { useMemo, useRef, useState } from "react";
import type { GroceryItem, GroceryList } from "../types";
import { uid } from "../types";
import { catalog, AVATARS, PARTNER } from "../data";

type Props = {
  list: GroceryList;
  onChange: (list: GroceryList) => void;
  onBack: () => void;
};

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const a = AVATARS[name] ?? { label: name[0] ?? "?", className: "bg-orange-200 text-[#3B2418]" };
  const dim = size === "md" ? "size-7 text-xs" : "size-5 text-[10px]";
  return (
    <span className={`grid ${dim} place-items-center rounded-full font-bold ${a.className}`} title={name}>
      {a.label}
    </span>
  );
}

function Check({ done }: { done: boolean }) {
  return (
    <span
      className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
        done ? "border-[#E8743B] bg-[#E8743B] text-white" : "border-orange-200 text-transparent"
      }`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5 9-10" />
      </svg>
    </span>
  );
}

export default function ListScreen({ list, onChange, onBack }: Props) {
  const [draft, setDraft] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const isShared = list.kind === "shared";

  const done = list.items.filter((i) => i.done).length;
  const total = list.items.length;
  const pct = total ? (done / total) * 100 : 0;

  const addedNames = useMemo(
    () => new Set(list.items.map((i) => i.name.toLowerCase())),
    [list.items],
  );

  const update = (items: GroceryItem[]) => onChange({ ...list, items });

  const addItem = (name: string, cat?: string, image?: string) => {
    const clean = name.trim();
    if (!clean || addedNames.has(clean.toLowerCase())) return;
    update([...list.items, { id: uid(), name: clean, cat, image, done: false, by: isShared ? "You" : undefined }]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem(draft);
    setDraft("");
  };

  const toggle = (id: string) =>
    update(list.items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  const remove = (id: string) => update(list.items.filter((i) => i.id !== id));

  const sorted = [...list.items].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-3xl pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FFF7EE]/95 px-5 pt-6 pb-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              aria-label="Back"
              onClick={onBack}
              className="grid size-9 place-items-center rounded-full bg-white text-[#3B2418] shadow-sm ring-1 ring-orange-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isShared ? "bg-[#2F6B4F]/10 text-[#2F6B4F]" : "bg-orange-100 text-[#C25A26]"}`}>
              {isShared ? "Shared list" : "Solo list"}
            </span>
          </div>
          {isShared && (
            <div className="flex -space-x-1.5">
              <Avatar name="You" size="md" />
              <Avatar name={PARTNER} size="md" />
            </div>
          )}
        </div>

        <input
          ref={titleRef}
          value={list.title}
          onChange={(e) => onChange({ ...list, title: e.target.value })}
          placeholder="Name your list"
          className="mt-3 w-full bg-transparent text-2xl font-extrabold tracking-tight outline-none placeholder:text-[#C9A88F]"
        />
        <p className="mt-1 text-sm font-medium text-[#A0674A]">
          {isShared ? `Shared with ${PARTNER}` : "Just you"} · {total} {total === 1 ? "item" : "items"}
        </p>

        {total > 0 && (
          <div className="mt-3">
            <div className="h-2 rounded-full bg-orange-100">
              <div className="h-2 rounded-full bg-[#E8743B] transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-[#A0674A]">{done}/{total} picked</p>
          </div>
        )}
      </header>

      {/* Add item */}
      <form onSubmit={submit} className="mx-5 mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add an item…"
          className="flex-1 rounded-full bg-white px-4 py-3 text-sm font-semibold outline-none ring-1 ring-orange-100 placeholder:text-[#C9A88F] focus:ring-2 focus:ring-[#E8743B]"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-full bg-[#E8743B] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-300/50 transition-opacity disabled:opacity-40"
        >
          Add
        </button>
      </form>

      {/* Quick-add suggestions */}
      <section className="mt-5">
        <p className="px-5 text-xs font-bold uppercase tracking-wide text-[#A0674A]">Quick add</p>
        <div className="mt-2 flex gap-3 overflow-x-auto px-5 pb-2">
          {catalog.map((p) => {
            const added = addedNames.has(p.name.toLowerCase());
            return (
              <button
                key={p.name}
                onClick={() => addItem(p.name, p.cat, p.image)}
                disabled={added}
                className={`w-28 shrink-0 rounded-2xl bg-white p-2.5 text-left shadow-sm ring-1 ring-orange-100 transition-opacity ${
                  added ? "opacity-40" : "hover:ring-2 hover:ring-[#E8743B]"
                }`}
              >
                <img src={p.image} alt={p.name} className="h-16 w-full rounded-xl object-cover" />
                <p className="mt-1.5 text-xs font-bold leading-tight">{p.name}</p>
                <p className="text-[10px] text-[#A0674A]">{added ? "Added" : p.cat}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Items */}
      <section className="mt-5 px-5">
        {total === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-orange-200 p-8 text-center">
            <p className="font-bold">Your list is empty</p>
            <p className="mt-1 text-xs text-[#A0674A]">
              {isShared ? `Add items or wait for ${PARTNER} to chip in.` : "Type above or tap a quick-add to get started."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sorted.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-orange-100"
              >
                <button aria-label={item.done ? "Mark not picked" : "Mark picked"} onClick={() => toggle(item.id)}>
                  <Check done={item.done} />
                </button>
                {item.image ? (
                  <img src={item.image} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-orange-50 text-[#E8743B]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-bold ${item.done ? "text-[#C9A88F] line-through" : ""}`}>{item.name}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#A0674A]">
                    {item.cat && <span>{item.cat}</span>}
                    {isShared && item.by && (
                      <>
                        {item.cat && <span>·</span>}
                        <Avatar name={item.by} />
                        <span>{item.by === "You" ? "you" : `asked by ${item.by}`}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  aria-label="Remove"
                  onClick={() => remove(item.id)}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-[#C9A88F] hover:bg-orange-50 hover:text-[#E8743B]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
