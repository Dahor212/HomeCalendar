const upcomingTasks = [
  { id: 1, done: false, title: "Objednat pohovku", room: "Obývák", date: "dnes" },
  { id: 2, done: false, title: "Zaplatit zálohu malíři", room: "Celý byt", date: "zítra" },
  { id: 3, done: true, title: "Změřit okna na záclony", room: "Ložnice", date: "3. 6." },
];

const quickStats = [
  { icon: "✅", label: "Úkoly", value: "18", color: "#7C3AED" },
  { icon: "🛒", label: "Nákupy", value: "23", color: "#3B82F6" },
  { icon: "🚪", label: "Místnosti", value: "6", color: "#34D399" },
  { icon: "💰", label: "Rozpočet", value: "65%", color: "#F59E0B" },
  { icon: "🖼️", label: "Inspirace", value: "12", color: "#A855F7" },
  { icon: "🔧", label: "Dodavatelé", value: "5", color: "#EF4444" },
];

export default function BytOverview() {
  return (
    <div className="pb-28 px-4 pt-4 min-h-screen bg-[#070A0F]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}>
          ☰
        </button>
        <h2 className="text-white font-bold text-lg">Ahoj, Kláro! 👋</h2>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-xl relative" style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}>
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
        </button>
      </div>

      {/* Hero card */}
      <div
        className="rounded-3xl p-6 mb-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #3b1f6e 0%, #1e1535 50%, #0f0c1a 100%)",
          border: "1px solid rgba(124,58,237,0.3)",
          boxShadow: "0 8px 32px rgba(124,58,237,0.2)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)", transform: "translate(40%,-40%)" }}
        />
        <div className="relative z-10">
          <div className="text-3xl mb-2">🏡</div>
          <h3 className="text-white text-2xl font-bold">Náš nový domov</h3>
          <p className="text-[#A855F7] text-sm mt-1">3. patro, byt 12</p>
          <div className="mt-4 text-white/50 text-lg">↓</div>
        </div>
      </div>

      {/* Progress card */}
      <div
        className="rounded-3xl p-5 mb-5"
        style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[#9CA3AF] text-xs uppercase tracking-wider font-semibold">Celkový postup</p>
            <p className="text-white text-2xl font-bold mt-0.5">65%</p>
          </div>
          <div className="text-right">
            <p className="text-[#9CA3AF] text-xs">Zbývá</p>
            <p className="text-white font-bold">18 úkolů</p>
            <p className="text-[#9CA3AF] text-xs mt-0.5">Dokončení: 15. 7.</p>
          </div>
        </div>
        <div className="h-2.5 rounded-full w-full" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-2.5 rounded-full transition-all"
            style={{
              width: "65%",
              background: "linear-gradient(90deg, #7C3AED, #A855F7)",
              boxShadow: "0 0 12px rgba(124,58,237,0.6)",
            }}
          />
        </div>
      </div>

      {/* Quick stats grid */}
      <p className="text-[#9CA3AF] text-xs uppercase tracking-wider font-semibold mb-3">Přehled</p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {quickStats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-3 flex flex-col items-center gap-1 transition-all active:scale-95"
            style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${s.color}22`, border: `1px solid ${s.color}44` }}
            >
              {s.icon}
            </div>
            <p className="text-white font-bold text-lg leading-none">{s.value}</p>
            <p className="text-[#9CA3AF] text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming tasks */}
      <p className="text-[#9CA3AF] text-xs uppercase tracking-wider font-semibold mb-3">Nejbližší úkoly</p>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {upcomingTasks.map((task, i) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 px-4 py-3.5 ${i < upcomingTasks.length - 1 ? "border-b" : ""}`}
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
              <p className="text-[#9CA3AF] text-xs">{task.room}</p>
            </div>
            <p className="text-[#9CA3AF] text-xs flex-shrink-0">{task.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
