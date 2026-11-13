import { useEffect, useState, type JSX } from "react";
import type { GroceryList } from "./types";
import { uid } from "./types";
import { recent, todo, PARTNER, catalog, type ParsedItem } from "./data";
import ListScreen from "./components/ListScreen";
import AddItemSheet from "./components/AddItemSheet";
import WhatsAppImport from "./components/WhatsAppImport";

const STORAGE_KEY = "actilist.lists";
const INBOX_ID = "inbox";
const INBOX_TITLE = "Quick items";

const icons: Record<string, JSX.Element> = {
  Completed: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  "To do": <><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></>,
  Profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
};

function Plus({ onSelect }: { onSelect: (opt: string) => void }) {
  const [open, setOpen] = useState(false);
  const opts = ["Shared list", "Solo list", "Add standalone item"];
  return (
    <div className="relative">
      <button aria-label="Create" onClick={() => setOpen(!open)}
        className="grid size-11 place-items-center rounded-full bg-[#E8743B] text-white shadow-lg shadow-orange-300/50">
        <svg width="20" height="20" viewBox="0 0 20 20" className={`transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <ul className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-orange-100">
          {opts.map((o) => (
            <li key={o}><button onClick={() => { setOpen(false); onSelect(o); }} className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-orange-50">{o}</button></li>
          ))}
        </ul>
      )}
    </div>
  );
}

function loadLists(): GroceryList[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GroceryList[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [tab, setTab] = useState("To do");
  const [lists, setLists] = useState<GroceryList[]>(loadLists);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [lists]);

  const createList = (kind: "solo" | "shared") => {
    // Shared lists open pre-seeded with a couple of requests from the partner,
    // so the "shared" nature is immediately visible.
    const seed =
      kind === "shared"
        ? [catalog[0], catalog[1]].map((p) => ({
            id: uid(),
            name: p.name,
            cat: p.cat,
            image: p.image,
            done: false,
            by: PARTNER,
          }))
        : [];
    const list: GroceryList = {
      id: uid(),
      title: kind === "shared" ? "Weekly groceries" : "",
      kind,
      items: seed,
      createdAt: Date.now(),
    };
    setLists((prev) => [list, ...prev]);
    setActiveId(list.id);
  };

  // Quick, one-off item that lands in a standing "Quick items" list.
  const addStandalone = (name: string, cat?: string, image?: string): boolean => {
    const clean = name.trim();
    if (!clean) return false;
    const inbox = lists.find((l) => l.id === INBOX_ID);
    if (inbox?.items.some((i) => i.name.toLowerCase() === clean.toLowerCase())) return false;

    const item = { id: uid(), name: clean, cat, image, done: false };
    setLists((prev) => {
      const existing = prev.find((l) => l.id === INBOX_ID);
      if (existing) {
        if (existing.items.some((i) => i.name.toLowerCase() === clean.toLowerCase())) return prev;
        return prev.map((l) => (l.id === INBOX_ID ? { ...l, items: [...l.items, item] } : l));
      }
      const inboxList: GroceryList = {
        id: INBOX_ID,
        title: INBOX_TITLE,
        kind: "solo",
        items: [item],
        createdAt: Date.now(),
      };
      return [inboxList, ...prev];
    });
    return true;
  };

  const handleCreate = (opt: string) => {
    if (opt === "Solo list") createList("solo");
    else if (opt === "Shared list") createList("shared");
    else if (opt === "Add standalone item") setShowAdd(true);
  };

  // Import parsed WhatsApp items into a fresh shared list from the partner.
  const importFromWhatsApp = (items: ParsedItem[]) => {
    if (items.length === 0) return;
    const list: GroceryList = {
      id: uid(),
      title: `From ${PARTNER}`,
      kind: "shared",
      items: items.map((p) => ({
        id: uid(),
        name: p.name,
        cat: p.cat,
        image: p.image,
        done: false,
        by: PARTNER,
      })),
      createdAt: Date.now(),
    };
    setLists((prev) => [list, ...prev]);
    setShowWhatsApp(false);
    setActiveId(list.id);
  };

  const updateList = (next: GroceryList) =>
    setLists((prev) => prev.map((l) => (l.id === next.id ? next : l)));

  const closeList = (id: string) => {
    // Drop lists the user created but left completely empty.
    setLists((prev) => prev.filter((l) => l.id !== id || l.items.length > 0 || l.title.trim()));
    setActiveId(null);
  };

  const active = lists.find((l) => l.id === activeId);
  if (active) {
    return <ListScreen list={active} onChange={updateList} onBack={() => closeList(active.id)} />;
  }

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-3xl pb-28">
      <header className="flex items-center justify-between px-5 pt-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Acti<span className="text-[#E8743B]">List</span></h1>
          <p className="text-sm font-medium text-[#A0674A]">Good morning, GG</p>
        </div>
        <Plus onSelect={handleCreate} />
      </header>

      <section className="mx-5 mt-6 rounded-3xl bg-gradient-to-br from-[#E8743B] to-[#F2A65A] p-5 text-[#FFF]">
        <p className="text-sm font-semibold opacity-90">Weekly dashboard</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[["$142.80", "Spent last week"], ["37", "Items purchased"], ["Produce", "Top category"]].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-white/15 p-3">
              <p className="text-lg font-bold sm:text-xl">{v}</p>
              <p className="text-[11px] font-medium opacity-90">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {lists.length > 0 && (
        <section className="mt-7 px-5">
          <h2 className="text-lg font-bold">My lists</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {lists.map((l) => {
              const done = l.items.filter((i) => i.done).length;
              const total = l.items.length;
              const shared = l.kind === "shared";
              return (
                <button
                  key={l.id}
                  onClick={() => setActiveId(l.id)}
                  className="rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-orange-100 hover:ring-2 hover:ring-[#E8743B]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold">{l.title.trim() || "Untitled list"}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${shared ? "bg-[#2F6B4F]/10 text-[#2F6B4F]" : "bg-orange-100 text-[#C25A26]"}`}>
                      {shared ? `Shared · ${PARTNER}` : "Solo"}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-orange-100">
                    <div className="h-2 rounded-full bg-[#E8743B]" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-[#A0674A]">{total === 0 ? "No items yet" : `${done}/${total} items picked`}</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-7">
        <div className="flex items-baseline justify-between px-5">
          <h2 className="text-lg font-bold">Recently purchased</h2>
          <span className="text-xs font-semibold text-[#E8743B]">Tap to re-add</span>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
          {recent.map((r) => (
            <button key={r.name} className="w-32 shrink-0 rounded-2xl bg-[#FFF] p-3 text-left shadow-sm ring-1 ring-orange-100">
              <img
                src={r.image}
                alt={r.name}
                className="h-20 w-[104px] rounded-xl object-cover"
              />
              <p className="mt-2 text-sm font-bold">{r.name}</p>
              <p className="text-[11px] text-[#A0674A]">{r.cat} · asked by {r.by}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-7 px-5">
        <h2 className="text-lg font-bold">Waiting for you</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {todo.map((t) => (
            <div key={t.title} className="rounded-2xl bg-[#FFF] p-4 shadow-sm ring-1 ring-orange-100">
              <div className="flex justify-between"><p className="font-bold">{t.title}</p>
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[#C25A26]">via {t.from}</span></div>
              <div className="mt-3 h-2 rounded-full bg-orange-100"><div className="h-2 rounded-full bg-[#E8743B]" style={{ width: `${(t.done / t.items) * 100}%` }} /></div>
              <p className="mt-2 text-xs text-[#A0674A]">{t.done}/{t.items} items picked</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7 px-5">
        <button
          onClick={() => setShowWhatsApp(true)}
          className="flex w-full items-center gap-4 rounded-2xl bg-[#2F6B4F] p-4 text-left text-[#FFF] transition-transform hover:scale-[1.01]"
        >
          <div className="relative grid size-11 shrink-0 place-items-center rounded-full bg-white/20 font-bold">
            WA
            <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-[#25D366] text-[10px] font-bold text-white ring-2 ring-[#2F6B4F]">1</span>
          </div>
          <div className="flex-1"><p className="font-bold">Forward from WhatsApp</p>
            <p className="text-xs opacity-90">{PARTNER} sent you a list · tap to import</p></div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80"><path d="m9 18 6-6-6-6" /></svg>
        </button>
        <div className="mt-3 rounded-2xl border-2 border-dashed border-orange-200 p-4">
          <p className="font-bold">Running low soon?</p>
          <p className="text-xs text-[#A0674A]">You usually buy milk & eggs every 6 days. Add them now?</p>
          <button className="mt-3 rounded-full bg-[#3B2418] px-4 py-2 text-xs font-bold text-[#FFF]">Add both</button>
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 border-t border-orange-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl justify-around py-3">
          {["Completed", "To do", "Profile"].map((n) => (
            <button key={n} onClick={() => setTab(n)} className={`flex flex-col items-center gap-1 text-xs font-semibold ${tab === n ? "text-[#E8743B]" : "text-[#A0674A]"}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[n]}</svg>{n}
            </button>
          ))}
        </div>
      </nav>

      {showAdd && (
        <AddItemSheet onAdd={addStandalone} onClose={() => setShowAdd(false)} listName={INBOX_TITLE} />
      )}

      {showWhatsApp && (
        <WhatsAppImport onImport={importFromWhatsApp} onClose={() => setShowWhatsApp(false)} />
      )}
    </div>
  );
}
