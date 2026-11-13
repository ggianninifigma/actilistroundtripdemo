import { useEffect, useMemo, useState } from "react";
import { PARTNER, whatsappThread, parseGroceryText, type ParsedItem } from "../data";

type Props = {
  onImport: (items: ParsedItem[]) => void;
  onClose: () => void;
};

export default function WhatsAppImport({ onImport, onClose }: Props) {
  const detected = useMemo(() => parseGroceryText(whatsappThread.text), []);
  const [selected, setSelected] = useState<Set<number>>(() => new Set(detected.map((_, i) => i)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const count = selected.size;

  const doImport = () => {
    if (count === 0) return;
    onImport(detected.filter((_, i) => selected.has(i)));
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[#ECE5DD] shadow-2xl animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* WhatsApp-style header */}
        <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
          <button aria-label="Close" onClick={onClose} className="grid size-8 place-items-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="grid size-9 place-items-center rounded-full bg-[#2F6B4F] text-sm font-bold">{PARTNER[0]}</span>
          <div className="leading-tight">
            <p className="font-bold">{PARTNER}</p>
            <p className="text-[11px] opacity-80">online</p>
          </div>
          <span className="ml-auto grid size-9 place-items-center rounded-full bg-[#25D366] text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.11 17.23c-.29-.14-1.7-.84-1.96-.94-.26-.1-.45-.14-.64.15-.19.29-.74.93-.9 1.12-.17.19-.33.21-.62.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2-.17-.29-.02-.45.13-.59.13-.13.29-.33.43-.5.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.56-.89-2.13-.23-.55-.47-.48-.64-.49l-.55-.01c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.38 0 1.4 1.02 2.76 1.17 2.95.14.19 2.01 3.08 4.88 4.32.68.29 1.21.47 1.63.6.68.22 1.3.19 1.79.12.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.33M12.05 21.78h-.01a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.07.8.82-3-.19-.31a8.13 8.13 0 0 1-1.25-4.34c0-4.49 3.66-8.15 8.16-8.15a8.1 8.1 0 0 1 5.76 2.39 8.1 8.1 0 0 1 2.38 5.77c0 4.49-3.66 8.15-8.15 8.15M20.52 3.45A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.33.16 11.89c0 2.09.55 4.14 1.59 5.94L.06 24l6.33-1.66a11.86 11.86 0 0 0 5.66 1.44h.01c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.17-3.49-8.42"/></svg>
          </span>
        </div>

        {/* Chat */}
        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
          <div className="mx-auto w-fit rounded-lg bg-white/70 px-3 py-1 text-[11px] font-medium text-[#555]">Today</div>
          <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#111]">{whatsappThread.text}</p>
            <p className="mt-1 text-right text-[10px] text-[#8a8a8a]">{whatsappThread.time}</p>
          </div>

          {/* ActiList detection bubble */}
          <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[#DCF8C6] px-3 py-2.5 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs font-bold text-[#2F6B4F]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4" /><path d="M13 3 9 15l-3 1 1-3L19 3h-6Z" /></svg>
              ActiList found {detected.length} items
            </p>
            <p className="mt-0.5 text-[11px] text-[#4a6b55]">Pick what to add — we matched photos for you.</p>
          </div>
        </div>

        {/* Import panel */}
        <div className="border-t border-black/5 bg-white p-4">
          <ul className="max-h-48 space-y-1.5 overflow-y-auto">
            {detected.map((item, i) => {
              const on = selected.has(i);
              return (
                <li key={`${item.name}-${i}`}>
                  <button
                    onClick={() => toggle(i)}
                    className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left ring-1 transition-colors ${
                      on ? "bg-orange-50 ring-[#E8743B]" : "bg-white ring-orange-100"
                    }`}
                  >
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${on ? "border-[#E8743B] bg-[#E8743B] text-white" : "border-orange-200 text-transparent"}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>
                    </span>
                    {item.image ? (
                      <img src={item.image} alt="" className="size-9 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-orange-50 text-[#E8743B]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.name}</p>
                      <p className="text-[11px] text-[#A0674A]">{item.matched ? item.cat : "New item"}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            onClick={doImport}
            disabled={count === 0}
            className="mt-3 w-full rounded-full bg-[#E8743B] py-3 text-sm font-bold text-white shadow-lg shadow-orange-300/50 transition-opacity disabled:opacity-40"
          >
            {count === 0 ? "Select items to add" : `Add ${count} to a list shared with ${PARTNER}`}
          </button>
        </div>
      </div>
    </div>
  );
}
