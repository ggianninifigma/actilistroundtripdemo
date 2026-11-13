import { useEffect, useRef, useState } from "react";
import { catalog, type Product } from "../data";

type Props = {
  // Returns true if the item was added, false if blank or a duplicate.
  onAdd: (name: string, cat?: string, image?: string) => boolean;
  onClose: () => void;
  listName: string;
};

export default function AddItemSheet({ onAdd, onClose, listName }: Props) {
  const [draft, setDraft] = useState("");
  const [added, setAdded] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const add = (name: string, cat?: string, image?: string) => {
    if (onAdd(name, cat, image)) {
      setAdded((prev) => [name.trim(), ...prev]);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    add(draft);
    setDraft("");
    inputRef.current?.focus();
  };

  const isAdded = (p: Product) => added.some((n) => n.toLowerCase() === p.name.toLowerCase());

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-t-3xl bg-[#FFF7EE] p-5 pb-8 shadow-2xl animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-orange-200" />

        <div className="mt-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Add an item</h2>
            <p className="mt-0.5 text-sm font-medium text-[#A0674A]">Drops into “{listName}”</p>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full bg-white text-[#3B2418] shadow-sm ring-1 ring-orange-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Olive oil"
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

        <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#A0674A]">Quick add</p>
        <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
          {catalog.map((p) => {
            const done = isAdded(p);
            return (
              <button
                key={p.name}
                onClick={() => add(p.name, p.cat, p.image)}
                disabled={done}
                className={`w-24 shrink-0 rounded-2xl bg-white p-2.5 text-left shadow-sm ring-1 ring-orange-100 transition-opacity ${
                  done ? "opacity-40" : "hover:ring-2 hover:ring-[#E8743B]"
                }`}
              >
                <img src={p.image} alt={p.name} className="h-14 w-full rounded-xl object-cover" />
                <p className="mt-1.5 text-[11px] font-bold leading-tight">{p.name}</p>
                <p className="text-[10px] text-[#A0674A]">{done ? "Added" : p.cat}</p>
              </button>
            );
          })}
        </div>

        {added.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#A0674A]">
              Added ({added.length})
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {added.map((name, i) => (
                <li
                  key={`${name}-${i}`}
                  className="animate-pop-in flex items-center gap-1.5 rounded-full bg-[#2F6B4F]/10 px-3 py-1.5 text-xs font-bold text-[#2F6B4F]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[#3B2418] py-3 text-sm font-bold text-white"
        >
          {added.length > 0 ? `Done · ${added.length} added` : "Done"}
        </button>
      </div>
    </div>
  );
}
