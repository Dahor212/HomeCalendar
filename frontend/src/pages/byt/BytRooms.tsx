import { useState } from "react";
import { useNavigate } from "react-router-dom";

const rooms = [
  {
    id: "obyvak",
    name: "Obývací pokoj",
    icon: "🛋️",
    tasks: 5,
    progress: 80,
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #0f2440 100%)",
    glow: "#3B82F6",
  },
  {
    id: "kuchyne",
    name: "Kuchyně",
    icon: "🍳",
    tasks: 8,
    progress: 45,
    gradient: "linear-gradient(135deg, #3d1f0e 0%, #1f0f07 100%)",
    glow: "#F59E0B",
  },
  {
    id: "loznice",
    name: "Ložnice",
    icon: "🛏️",
    tasks: 3,
    progress: 60,
    gradient: "linear-gradient(135deg, #1f1535 0%, #100b1e 100%)",
    glow: "#7C3AED",
  },
  {
    id: "koupelna",
    name: "Koupelna",
    icon: "🚿",
    tasks: 6,
    progress: 30,
    gradient: "linear-gradient(135deg, #0f2e2e 0%, #071a1a 100%)",
    glow: "#34D399",
  },
  {
    id: "chodba",
    name: "Chodba",
    icon: "🚪",
    tasks: 2,
    progress: 90,
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)",
    glow: "#A855F7",
  },
  {
    id: "balkon",
    name: "Balkon",
    icon: "🌿",
    tasks: 4,
    progress: 20,
    gradient: "linear-gradient(135deg, #1a2e1a 0%, #0d1a0d 100%)",
    glow: "#34D399",
  },
];

const filters = ["Vše", "Obývák", "Kuchyně", "Ložnice", "Koupelna", "Chodba", "Balkon"];

export default function BytRooms() {
  const [activeFilter, setActiveFilter] = useState("Vše");
  const navigate = useNavigate();

  const filtered = activeFilter === "Vše"
    ? rooms
    : rooms.filter((r) => r.name.toLowerCase().includes(activeFilter.toLowerCase().slice(0, 4)));

  return (
    <div className="pb-28 min-h-screen bg-[#070A0F]">
      {/* Header */}
      <div className="px-4 pt-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-xl">Místnosti</h2>
          <button
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: "#7C3AED", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}
          >
            + Přidat
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95"
              style={{
                background: activeFilter === f ? "#7C3AED" : "#111821",
                color: activeFilter === f ? "#fff" : "#9CA3AF",
                border: activeFilter === f ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: activeFilter === f ? "0 4px 12px rgba(124,58,237,0.3)" : "none",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filtered.map((room) => (
          <button
            key={room.id}
            onClick={() => navigate(`/byt/rooms/${room.id}`)}
            className="text-left rounded-3xl overflow-hidden transition-all active:scale-95"
            style={{
              background: "#111821",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: `0 4px 20px ${room.glow}18`,
            }}
          >
            {/* Room visual */}
            <div
              className="h-28 flex items-center justify-center relative"
              style={{ background: room.gradient }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{ background: `radial-gradient(circle at 50% 120%, ${room.glow} 0%, transparent 70%)` }}
              />
              <span className="text-4xl relative z-10">{room.icon}</span>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-white font-semibold text-sm">{room.name}</p>
              <p className="text-[#9CA3AF] text-xs mt-0.5">{room.tasks} úkolů</p>

              {/* Progress */}
              <div className="mt-2.5">
                <div className="flex justify-between mb-1">
                  <span className="text-[#9CA3AF] text-xs">Postup</span>
                  <span className="text-xs font-semibold" style={{ color: room.glow }}>{room.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full w-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${room.progress}%`,
                      background: `linear-gradient(90deg, ${room.glow}, ${room.glow}aa)`,
                    }}
                  />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
