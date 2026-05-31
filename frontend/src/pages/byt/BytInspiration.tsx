import { useState } from "react";

const inspirations = [
  { id: 1, title: "Japandi obývák", room: "Obývací pokoj", style: "Japandi", tags: ["Minimální", "Dřevo", "Béžová"], gradient: "linear-gradient(135deg, #2d2926 0%, #4a4540 100%)", height: "h-44", fav: true },
  { id: 2, title: "Bílá kuchyně", room: "Kuchyně", style: "Skandinávský", tags: ["Bílá", "Čistota", "Světlé"], gradient: "linear-gradient(135deg, #e8e0d5 0%, #c8bfb0 100%)", height: "h-36", fav: false },
  { id: 3, title: "Tmavá ložnice", room: "Ložnice", style: "Luxus", tags: ["Tmavé tóny", "Sametový", "Akcentní světlo"], gradient: "linear-gradient(135deg, #1a0e2e 0%, #0d0718 100%)", height: "h-52", fav: true },
  { id: 4, title: "Zelená koupelna", room: "Koupelna", style: "Tropical", tags: ["Zelená", "Kámen", "Příroda"], gradient: "linear-gradient(135deg, #0f2e1a 0%, #071a0d 100%)", height: "h-40", fav: false },
  { id: 5, title: "Moderní předsíň", room: "Chodba", style: "Moderní", tags: ["Tmavé dřevo", "Úložný prostor"], gradient: "linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)", height: "h-36", fav: false },
  { id: 6, title: "Útulný balkon", room: "Balkon", style: "Urban Jungle", tags: ["Rostliny", "Ratan", "Zelená"], gradient: "linear-gradient(135deg, #1a3d1a 0%, #0d2010 100%)", height: "h-48", fav: true },
  { id: 7, title: "Teplé osvětlení", room: "Obývací pokoj", style: "Cozy", tags: ["Teplé světlo", "Svíčky"], gradient: "linear-gradient(135deg, #3d2b0e 0%, #1f1507 100%)", height: "h-40", fav: false },
  { id: 8, title: "Mramor v koupelně", room: "Koupelna", style: "Luxus", tags: ["Mramor", "Zlaté prvky"], gradient: "linear-gradient(135deg, #2e2e2e 0%, #1a1a1a 100%)", height: "h-44", fav: true },
];

const filters = ["Vše", "Obývák", "Kuchyně", "Ložnice", "Koupelna", "Balkon"];

export default function BytInspiration() {
  const [activeFilter, setActiveFilter] = useState("Vše");
  const [favs, setFavs] = useState<Set<number>>(new Set([1, 3, 6, 8]));

  const toggleFav = (id: number) => setFavs(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filtered = activeFilter === "Vše" ? inspirations : inspirations.filter(i => i.room.includes(activeFilter.slice(0, 5)));

  const col1 = filtered.filter((_, i) => i % 2 === 0);
  const col2 = filtered.filter((_, i) => i % 2 === 1);

  return (
    <div className="pb-28 min-h-screen bg-[#070A0F]">
      <div className="px-4 pt-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-xl">Inspirace</h2>
          <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: "#7C3AED", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}>
            + Přidat
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95"
              style={{
                background: activeFilter === f ? "#7C3AED" : "#111821",
                color: activeFilter === f ? "#fff" : "#9CA3AF",
                border: activeFilter === f ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.08)",
              }}>{f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center px-4">
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-white font-semibold">Začni sbírat nápady</p>
          <p className="text-[#9CA3AF] text-sm mt-1">Ulož si fotky, odkazy a barevné kombinace.</p>
        </div>
      ) : (
        <div className="px-4 flex gap-3">
          {[col1, col2].map((col, ci) => (
            <div key={ci} className="flex-1 flex flex-col gap-3">
              {col.map(insp => (
                <div key={insp.id} className="rounded-2xl overflow-hidden transition-all active:scale-95"
                  style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className={`${insp.height} relative`} style={{ background: insp.gradient }}>
                    <button
                      onClick={() => toggleFav(insp.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-base transition-all active:scale-90"
                      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
                      {favs.has(insp.id) ? "❤️" : "🤍"}
                    </button>
                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                      {insp.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                          style={{ background: "rgba(0,0,0,0.5)", color: "#fff", backdropFilter: "blur(4px)" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-white font-semibold text-xs">{insp.title}</p>
                    <p className="text-[#9CA3AF] text-xs mt-0.5">{insp.room}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
