import { useState } from "react";

const items = [
  { id: 1, name: "Pohovka", category: "Nábytek", room: "Obývací pokoj", price: 35000, shop: "IKEA", status: "Plánováno", emoji: "🛋️" },
  { id: 2, name: "Jídelní stůl", category: "Nábytek", room: "Kuchyně", price: 12000, shop: "Sconto", status: "Objednáno", emoji: "🪑" },
  { id: 3, name: "Postel 160x200", category: "Nábytek", room: "Ložnice", price: 22000, shop: "Sconto", status: "Doručeno", emoji: "🛏️" },
  { id: 4, name: "Lednice", category: "Elektro", room: "Kuchyně", price: 15000, shop: "Electroworld", status: "Doručeno", emoji: "🧊" },
  { id: 5, name: "Trouba", category: "Elektro", room: "Kuchyně", price: 18000, shop: "Datart", status: "Objednáno", emoji: "📦" },
  { id: 6, name: "Obraz do obýváku", category: "Dekorace", room: "Obývací pokoj", price: 2500, shop: "IKEA", status: "Koupeno", emoji: "🖼️" },
  { id: 7, name: "Svíčky a doplňky", category: "Dekorace", room: "Celý byt", price: 1200, shop: "TK Maxx", status: "Koupeno", emoji: "🕯️" },
  { id: 8, name: "Sprchový kout", category: "Koupelna", room: "Koupelna", price: 12000, shop: "Hornbach", status: "Plánováno", emoji: "🚿" },
  { id: 9, name: "Umyvadlo + baterie", category: "Koupelna", room: "Koupelna", price: 5500, shop: "Siko", status: "Plánováno", emoji: "🚰" },
  { id: 10, name: "Koberec 200x300", category: "Dekorace", room: "Obývací pokoj", price: 8500, shop: "Möbelix", status: "Objednáno", emoji: "🟫" },
];

const filters = ["Vše", "Nábytek", "Elektro", "Dekorace", "Koupelna"];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Plánováno": { bg: "rgba(59,130,246,0.15)", text: "#3B82F6" },
  "Objednáno": { bg: "rgba(245,158,11,0.15)", text: "#F59E0B" },
  "Doručeno": { bg: "rgba(168,85,247,0.15)", text: "#A855F7" },
  "Koupeno": { bg: "rgba(52,211,153,0.15)", text: "#34D399" },
};

export default function BytShopping() {
  const [activeFilter, setActiveFilter] = useState("Vše");

  const filtered = activeFilter === "Vše" ? items : items.filter(i => i.category === activeFilter);
  const total = items.reduce((s, i) => s + i.price, 0);
  const bought = items.filter(i => i.status === "Koupeno" || i.status === "Doručeno").length;
  const pct = Math.round((bought / items.length) * 100);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - pct / 100);

  return (
    <div className="pb-28 min-h-screen bg-[#070A0F]">
      {/* Header */}
      <div className="px-4 pt-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-xl">Nákupní seznam</h2>
          <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: "#7C3AED", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}>
            + Přidat
          </button>
        </div>

        {/* Summary card */}
        <div className="rounded-3xl p-5 mb-4 flex items-center gap-4"
          style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
          <div className="flex-1">
            <p className="text-[#9CA3AF] text-xs font-medium mb-1">Celkem</p>
            <p className="text-white text-2xl font-bold">{total.toLocaleString("cs-CZ")} Kč</p>
            <div className="flex gap-4 mt-2">
              <div>
                <p className="text-white text-sm font-semibold">{items.length}</p>
                <p className="text-[#9CA3AF] text-xs">položek</p>
              </div>
              <div>
                <p className="text-[#34D399] text-sm font-semibold">{bought}</p>
                <p className="text-[#9CA3AF] text-xs">nakoupeno</p>
              </div>
            </div>
          </div>
          {/* Circular progress */}
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
              <circle cx="40" cy="40" r={radius} fill="none" stroke="#7C3AED" strokeWidth="6"
                strokeDasharray={circumference} strokeDashoffset={dashoffset}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
            </svg>
            <span className="absolute text-white font-bold text-sm">{pct}%</span>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95"
              style={{
                background: activeFilter === f ? "#7C3AED" : "#111821",
                color: activeFilter === f ? "#fff" : "#9CA3AF",
                border: activeFilter === f ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: activeFilter === f ? "0 4px 12px rgba(124,58,237,0.3)" : "none",
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="px-4">
        <div className="rounded-2xl overflow-hidden" style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}>
          {filtered.map((item, i) => {
            const s = STATUS_COLORS[item.status];
            return (
              <div key={item.id}
                className={`flex items-center gap-3 px-4 py-3.5 transition-all active:bg-white/5 ${i < filtered.length - 1 ? "border-b" : ""}`}
                style={{ borderColor: "rgba(255,255,255,0.06)", opacity: item.status === "Koupeno" ? 0.6 : 1 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: "#171F2B", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${item.status === "Koupeno" ? "line-through text-[#9CA3AF]" : "text-white"}`}>
                    {item.name}
                  </p>
                  <p className="text-[#9CA3AF] text-xs mt-0.5">{item.shop} · {item.room}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white text-sm font-semibold">{item.price.toLocaleString("cs-CZ")} Kč</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.text }}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
