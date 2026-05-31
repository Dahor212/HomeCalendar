import { useState } from "react";

const allTasks = [
  { id: 1, title: "Objednat kuchyňskou linku", room: "Kuchyně", date: "dnes", priority: "urgent", done: false, section: "today" },
  { id: 2, title: "Zaplatit zálohu – podlahy", room: "Celý byt", date: "dnes", priority: "high", done: false, section: "today" },
  { id: 3, title: "Vybrat barvu stěn", room: "Obývací pokoj", date: "20. 6.", priority: "medium", done: false, section: "week" },
  { id: 4, title: "Zajistit elektrikáře", room: "Kuchyně", date: "18. 6.", priority: "high", done: false, section: "week" },
  { id: 5, title: "Změřit okna pro závěsy", room: "Ložnice", date: "22. 6.", priority: "low", done: true, section: "week" },
  { id: 6, title: "Objednat postel", room: "Ložnice", date: "1. 7.", priority: "medium", done: false, section: "later" },
  { id: 7, title: "Vybrat dlaždice do koupelny", room: "Koupelna", date: "5. 7.", priority: "medium", done: false, section: "later" },
];

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "#EF4444", high: "#F59E0B", medium: "#3B82F6", low: "#9CA3AF",
};
const PRIORITY_LABEL: Record<string, string> = {
  urgent: "Urgentní", high: "Vysoká", medium: "Střední", low: "Nízká",
};

const filters = ["Dnes", "Tento týden", "Čeká", "Hotovo", "Důležité"];

export default function BytTasks() {
  const [activeFilter, setActiveFilter] = useState("Dnes");
  const [tasks, setTasks] = useState(allTasks);

  function toggleTask(id: number) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  const filtered = (() => {
    if (activeFilter === "Dnes") return tasks.filter(t => t.section === "today");
    if (activeFilter === "Tento týden") return tasks.filter(t => t.section === "week" || t.section === "today");
    if (activeFilter === "Hotovo") return tasks.filter(t => t.done);
    if (activeFilter === "Důležité") return tasks.filter(t => t.priority === "urgent" || t.priority === "high");
    return tasks.filter(t => !t.done);
  })();

  const sections = [
    { key: "today", label: "Dnes" },
    { key: "week", label: "Tento týden" },
    { key: "later", label: "Později" },
  ];

  const showSections = activeFilter === "Čeká" || activeFilter === "Tento týden";

  return (
    <div className="pb-28 min-h-screen bg-[#070A0F]">
      {/* Header */}
      <div className="px-4 pt-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-xl">Úkoly</h2>
          <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95" style={{ background: "#7C3AED", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}>
            + Přidat
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
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

      <div className="px-4 space-y-4">
        {showSections ? (
          sections.map(sec => {
            const items = tasks.filter(t => t.section === sec.key && !t.done);
            if (items.length === 0) return null;
            return (
              <div key={sec.key}>
                <p className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-widest mb-2 px-1">{sec.label}</p>
                <div className="space-y-2">
                  {items.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} />)}
                </div>
              </div>
            );
          })
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-semibold">Žádné úkoly</p>
            <p className="text-[#9CA3AF] text-sm mt-1">
              {activeFilter === "Hotovo" ? "Zatím jsi nic nedokončila." : "Dnes můžeš v klidu vybírat inspiraci."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle }: { task: any; onToggle: (id: number) => void }) {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-2xl transition-all"
      style={{
        background: "#111821",
        border: "1px solid rgba(255,255,255,0.06)",
        opacity: task.done ? 0.5 : 1,
      }}
    >
      <button
        onClick={() => onToggle(task.id)}
        className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all active:scale-90"
        style={task.done ? { background: "#34D399", borderColor: "#34D399" } : { borderColor: PRIORITY_COLOR[task.priority] }}
      >
        {task.done && <span className="text-xs font-bold text-white">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.done ? "line-through text-[#9CA3AF]" : "text-white"}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[#9CA3AF] text-xs">{task.room}</span>
          <span className="w-1 h-1 rounded-full bg-[#9CA3AF]/40" />
          <span className="text-[#9CA3AF] text-xs">⏰ {task.date}</span>
        </div>
      </div>

      <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
        style={{ background: PRIORITY_COLOR[task.priority] + "22", color: PRIORITY_COLOR[task.priority] }}>
        {PRIORITY_LABEL[task.priority]}
      </span>
    </div>
  );
}
