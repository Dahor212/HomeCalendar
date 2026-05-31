import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const roomData: Record<string, {
  name: string;
  icon: string;
  gradient: string;
  glow: string;
  progress: number;
  tasks: { id: number; done: boolean; title: string; priority: "high" | "medium" | "low"; date: string }[];
  shopping: { id: number; name: string; price: number; status: string }[];
  inspiration: { id: number; title: string; style: string; gradient: string }[];
  notes: { id: number; text: string; date: string }[];
}> = {
  obyvak: {
    name: "Obývací pokoj",
    icon: "🛋️",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #0f2440 100%)",
    glow: "#3B82F6",
    progress: 80,
    tasks: [
      { id: 1, done: true, title: "Vyměřit prostor pro pohovku", priority: "high", date: "1. 5." },
      { id: 2, done: false, title: "Objednat pohovku", priority: "high", date: "10. 6." },
      { id: 3, done: false, title: "Koupit koberec", priority: "medium", date: "15. 6." },
      { id: 4, done: true, title: "Nainstalovat osvětlení", priority: "low", date: "28. 4." },
      { id: 5, done: false, title: "Zavěsit obraz nad pohovku", priority: "low", date: "20. 6." },
    ],
    shopping: [
      { id: 1, name: "Pohovka 3-místná", price: 35000, status: "Plánováno" },
      { id: 2, name: "Koberec 200x300", price: 8500, status: "Objednáno" },
      { id: 3, name: "Polštáře (4 ks)", price: 1200, status: "Koupeno" },
    ],
    inspiration: [
      { id: 1, title: "Skandinávský styl", style: "Scandi", gradient: "linear-gradient(135deg, #e8e0d5, #c8bfb0)" },
      { id: 2, title: "Tmavé dřevo + šedá", style: "Japandi", gradient: "linear-gradient(135deg, #2d2926, #4a4540)" },
    ],
    notes: [
      { id: 1, text: "Stěna za TV bude tmavě šedá - RAL 7016. Zbytek bílá.", date: "12. 5." },
      { id: 2, text: "Parketová podlaha zůstane - jen přebrousit a olakovat.", date: "20. 5." },
    ],
  },
  kuchyne: {
    name: "Kuchyně",
    icon: "🍳",
    gradient: "linear-gradient(135deg, #3d1f0e 0%, #1f0f07 100%)",
    glow: "#F59E0B",
    progress: 45,
    tasks: [
      { id: 1, done: true, title: "Vybrat kuchyňskou linku", priority: "high", date: "10. 4." },
      { id: 2, done: false, title: "Objednat montáž", priority: "high", date: "5. 6." },
      { id: 3, done: false, title: "Koupit trouba + varná deska", priority: "high", date: "8. 6." },
      { id: 4, done: false, title: "Objednat lednici", priority: "medium", date: "20. 6." },
      { id: 5, done: false, title: "Obklady za linkou", priority: "medium", date: "25. 6." },
      { id: 6, done: false, title: "Dřez a baterie", priority: "low", date: "30. 6." },
      { id: 7, done: false, title: "Odpadkový koš zabudovaný", priority: "low", date: "30. 6." },
      { id: 8, done: true, title: "Změřit a navrhnout layout", priority: "high", date: "5. 4." },
    ],
    shopping: [
      { id: 1, name: "Kuchyňská linka IKEA", price: 45000, status: "Objednáno" },
      { id: 2, name: "Trouba Bosch", price: 18000, status: "Plánováno" },
      { id: 3, name: "Lednice Samsung", price: 15000, status: "Plánováno" },
    ],
    inspiration: [
      { id: 1, title: "Bílá + dřevo", style: "Minimal", gradient: "linear-gradient(135deg, #f5f0e8, #e0d5c0)" },
    ],
    notes: [
      { id: 1, text: "Kuchyňská linka bude bílá, pracovní deska - světlý mramor.", date: "8. 5." },
    ],
  },
  loznice: {
    name: "Ložnice",
    icon: "🛏️",
    gradient: "linear-gradient(135deg, #1f1535 0%, #100b1e 100%)",
    glow: "#7C3AED",
    progress: 60,
    tasks: [
      { id: 1, done: true, title: "Koupit postel", priority: "high", date: "5. 5." },
      { id: 2, done: false, title: "Vybrat matrace", priority: "high", date: "12. 6." },
      { id: 3, done: false, title: "Závěsy na okna", priority: "medium", date: "20. 6." },
    ],
    shopping: [
      { id: 1, name: "Postel 160x200", price: 22000, status: "Doručeno" },
      { id: 2, name: "Matrace Tempur", price: 28000, status: "Plánováno" },
    ],
    inspiration: [
      { id: 1, title: "Útulná ložnice", style: "Cozy", gradient: "linear-gradient(135deg, #3d2b1f, #1f150e)" },
    ],
    notes: [
      { id: 1, text: "Rolety nebo záclony - ještě rozhodujeme. Preferuju blackout závěsy.", date: "22. 5." },
    ],
  },
  koupelna: {
    name: "Koupelna",
    icon: "🚿",
    gradient: "linear-gradient(135deg, #0f2e2e 0%, #071a1a 100%)",
    glow: "#34D399",
    progress: 30,
    tasks: [
      { id: 1, done: true, title: "Vybrat dlažbu a obklady", priority: "high", date: "20. 4." },
      { id: 2, done: false, title: "Domluvit instalatéra", priority: "high", date: "1. 6." },
      { id: 3, done: false, title: "Koupit sprchový kout", priority: "high", date: "10. 6." },
      { id: 4, done: false, title: "Umyvadlo + baterie", priority: "medium", date: "15. 6." },
      { id: 5, done: false, title: "WC mísa", priority: "medium", date: "15. 6." },
      { id: 6, done: false, title: "Osvětlení + zrcadlo", priority: "low", date: "25. 6." },
    ],
    shopping: [
      { id: 1, name: "Sprchový kout 90x90", price: 12000, status: "Plánováno" },
      { id: 2, name: "Umyvadlo + baterie", price: 5500, status: "Plánováno" },
    ],
    inspiration: [
      { id: 1, title: "Moderní koupelna", style: "Modern", gradient: "linear-gradient(135deg, #1a3a3a, #0d1f1f)" },
    ],
    notes: [
      { id: 1, text: "Světlá dlažba 60x60, tmavé obklady za sprchou.", date: "3. 5." },
    ],
  },
  chodba: {
    name: "Chodba",
    icon: "🚪",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)",
    glow: "#A855F7",
    progress: 90,
    tasks: [
      { id: 1, done: true, title: "Skříň do předsíně", priority: "high", date: "2. 5." },
      { id: 2, done: false, title: "Zavěsit zrcadlo", priority: "low", date: "28. 5." },
    ],
    shopping: [
      { id: 1, name: "Předsíňová skříň PAX", price: 8500, status: "Doručeno" },
      { id: 2, name: "Zrcadlo 60x140", price: 2500, status: "Koupeno" },
    ],
    inspiration: [
      { id: 1, title: "Světlá předsíň", style: "Minimal", gradient: "linear-gradient(135deg, #d4c5e2, #b8a5d0)" },
    ],
    notes: [
      { id: 1, text: "Háčky na klíče + botník u dveří.", date: "15. 5." },
    ],
  },
  balkon: {
    name: "Balkon",
    icon: "🌿",
    gradient: "linear-gradient(135deg, #1a2e1a 0%, #0d1a0d 100%)",
    glow: "#34D399",
    progress: 20,
    tasks: [
      { id: 1, done: false, title: "Balkonový nábytek", priority: "high", date: "20. 6." },
      { id: 2, done: false, title: "Rostliny a truhlíky", priority: "medium", date: "25. 6." },
      { id: 3, done: false, title: "Venkovní osvětlení", priority: "low", date: "30. 6." },
      { id: 4, done: true, title: "Vyčistit podlahu", priority: "low", date: "1. 5." },
    ],
    shopping: [
      { id: 1, name: "Balkonový set 2+1", price: 9500, status: "Plánováno" },
      { id: 2, name: "Truhlíky (4 ks)", price: 1200, status: "Plánováno" },
    ],
    inspiration: [
      { id: 1, title: "Zelený balkon", style: "Urban Jungle", gradient: "linear-gradient(135deg, #1a3d1a, #0d2010)" },
    ],
    notes: [
      { id: 1, text: "Přidat sítě na zábradlí pro soukromí.", date: "18. 5." },
    ],
  },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: "rgba(239,68,68,0.15)", text: "#EF4444", label: "Důležité" },
  medium: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B", label: "Střední" },
  low: { bg: "rgba(156,163,175,0.12)", text: "#9CA3AF", label: "Nízká" },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Plánováno: { bg: "rgba(59,130,246,0.15)", text: "#3B82F6" },
  Objednáno: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B" },
  Doručeno: { bg: "rgba(168,85,247,0.15)", text: "#A855F7" },
  Koupeno: { bg: "rgba(52,211,153,0.15)", text: "#34D399" },
};

const TABS = ["Úkoly", "Nákupy", "Inspirace", "Poznámky"];

export default function BytRoomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Úkoly");

  const room = id ? roomData[id] : null;

  if (!room) {
    return (
      <div className="min-h-screen bg-[#070A0F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg font-bold mb-2">Místnost nenalezena</p>
          <button
            onClick={() => navigate("/byt/rooms")}
            className="text-[#A855F7] text-sm underline"
          >
            Zpět na místnosti
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 min-h-screen bg-[#070A0F]">
      {/* Header */}
      <div className="px-4 pt-4 flex items-center justify-between mb-0">
        <button
          onClick={() => navigate("/byt/rooms")}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all active:scale-95"
          style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          ←
        </button>
        <h2 className="text-white font-bold text-lg">{room.name}</h2>
        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all active:scale-95"
          style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          ⋯
        </button>
      </div>

      {/* Hero */}
      <div
        className="mx-4 mt-4 rounded-3xl overflow-hidden relative"
        style={{ border: `1px solid ${room.glow}44`, boxShadow: `0 8px 32px ${room.glow}22` }}
      >
        <div className="h-36 flex items-center justify-center relative" style={{ background: room.gradient }}>
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: `radial-gradient(circle at 50% 120%, ${room.glow} 0%, transparent 65%)` }}
          />
          <span className="text-5xl relative z-10">{room.icon}</span>
        </div>
        <div className="px-5 py-4" style={{ background: "#111821" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-white font-bold text-base">{room.name}</p>
            <span className="font-bold text-sm" style={{ color: room.glow }}>{room.progress}%</span>
          </div>
          <div className="h-2 rounded-full w-full" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${room.progress}%`,
                background: `linear-gradient(90deg, ${room.glow}, ${room.glow}aa)`,
                boxShadow: `0 0 8px ${room.glow}66`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-4 mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
            style={{
              background: activeTab === tab ? "#7C3AED" : "#111821",
              color: activeTab === tab ? "#fff" : "#9CA3AF",
              border: activeTab === tab ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: activeTab === tab ? "0 4px 12px rgba(124,58,237,0.3)" : "none",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 mt-4">
        {activeTab === "Úkoly" && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {room.tasks.map((task, i) => {
              const p = PRIORITY_COLORS[task.priority];
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i < room.tasks.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{
                      border: task.done ? "none" : "2px solid rgba(255,255,255,0.2)",
                      background: task.done ? "#7C3AED" : "transparent",
                    }}
                  >
                    {task.done && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.done ? "line-through text-[#9CA3AF]" : "text-white"}`}>
                      {task.title}
                    </p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full mt-0.5 inline-block"
                      style={{ background: p.bg, color: p.text }}
                    >
                      {p.label}
                    </span>
                  </div>
                  <p className="text-[#9CA3AF] text-xs flex-shrink-0">{task.date}</p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "Nákupy" && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {room.shopping.map((item, i) => {
              const s = STATUS_COLORS[item.status] ?? { bg: "rgba(156,163,175,0.12)", text: "#9CA3AF" };
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i < room.shopping.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{item.name}</p>
                    <p className="text-[#9CA3AF] text-xs mt-0.5">{item.price.toLocaleString("cs-CZ")} Kč</p>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full flex-shrink-0 font-medium"
                    style={{ background: s.bg, color: s.text }}
                  >
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "Inspirace" && (
          <div className="grid grid-cols-1 gap-3">
            {room.inspiration.map((insp) => (
              <div
                key={insp.id}
                className="rounded-2xl overflow-hidden transition-all active:scale-95"
                style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="h-32 rounded-xl m-2" style={{ background: insp.gradient }} />
                <div className="px-4 pb-4">
                  <p className="text-white font-semibold text-sm">{insp.title}</p>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full mt-1.5 inline-block"
                    style={{ background: "rgba(168,85,247,0.15)", color: "#A855F7" }}
                  >
                    {insp.style}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Poznámky" && (
          <div className="flex flex-col gap-3">
            {room.notes.map((note) => (
              <div
                key={note.id}
                className="rounded-2xl p-4"
                style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-white text-sm leading-relaxed">{note.text}</p>
                <p className="text-[#9CA3AF] text-xs mt-2">{note.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
