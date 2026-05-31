import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, isToday } from "date-fns";
import { cs } from "date-fns/locale";
import api from "../api/client";
import { Event, Task, ShoppingItem } from "../types";

const PRIORITY_DOT = { low: "#10b981", medium: "#f59e0b", high: "#ef4444" };

export default function HomePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [quickTask, setQuickTask] = useState("");

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 7 * 86400000);
    api.get<Event[]>("/events", { params: { start: start.toISOString(), end: end.toISOString() } })
      .then(({ data }) => setEvents(data)).catch(() => {});
    api.get<Task[]>("/tasks", { params: { completed: false } })
      .then(({ data }) => setTasks(data)).catch(() => {});
    api.get<ShoppingItem[]>("/shopping")
      .then(({ data }) => setShopping(data)).catch(() => {});
  }, []);

  const todayEvents = events
    .filter((e) => isToday(new Date(e.start)))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const uncheckedShopping = shopping.filter((s) => !s.checked).length;

  async function addQuickTask() {
    if (!quickTask.trim()) return;
    await api.post("/tasks", { title: quickTask.trim() });
    setQuickTask("");
    const { data } = await api.get<Task[]>("/tasks", { params: { completed: false } });
    setTasks(data);
  }

  const dateStr = format(new Date(), "EEEE d. MMMM", { locale: cs });
  const dateStrCap = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const STAT_CARDS = [
    { label: "Kalendář", value: events.length, sub: `${events.length} událostí`, icon: "📅", color: "#6366f1", path: "/calendar" },
    { label: "Úkoly", value: pendingTasks, sub: `${pendingTasks} úkolů`, icon: "✅", color: "#3b82f6", path: "/tasks" },
    { label: "Nákupy", value: uncheckedShopping, sub: `${uncheckedShopping} položek`, icon: "🛒", color: "#f59e0b", path: "/shopping" },
    { label: "Kategorie", value: null, sub: "Správa", icon: "🏷️", color: "#10b981", path: "/categories" },
  ];

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-white">Ahoj! 👋</h1>
        <p className="text-slate-400 text-sm mt-0.5">{dateStrCap}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {STAT_CARDS.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className="glass rounded-2xl p-4 text-left active:scale-95 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: card.color + "22" }}
              >
                {card.icon}
              </div>
              {card.value !== null && (
                <span className="text-2xl font-bold text-white">{card.value}</span>
              )}
            </div>
            <p className="font-semibold text-white text-sm">{card.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
          </button>
        ))}
      </div>

      {/* Today's events */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h2 className="font-bold text-white text-sm">Dnes</h2>
          <button onClick={() => navigate("/calendar")} className="text-xs text-indigo-400 font-medium">
            Zobrazit vše
          </button>
        </div>
        {todayEvents.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">Dnes nic naplánováno</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {todayEvents.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xs text-slate-400 w-11 shrink-0 font-mono">
                  {e.all_day ? "Celý" : format(new Date(e.start), "HH:mm")}
                </span>
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: e.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{e.title}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Shopping preview */}
      {shopping.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h2 className="font-bold text-white text-sm">Nákupní seznam</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{uncheckedShopping} položek</span>
              <button onClick={() => navigate("/shopping")} className="text-xs text-indigo-400 font-medium">
                Otevřít
              </button>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${shopping.length > 0 ? (shopping.filter(s => s.checked).length / shopping.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">
                {shopping.filter(s => s.checked).length}/{shopping.length}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {shopping.filter(s => !s.checked).slice(0, 6).map(s => (
                <span key={s.id} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-lg">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick add task */}
      <div className="glass rounded-2xl p-4">
        <p className="text-xs text-slate-400 mb-2 font-medium">Rychlé přidání úkolu</p>
        <div className="flex gap-2">
          <input
            className="input-dark flex-1 py-2"
            value={quickTask}
            onChange={(e) => setQuickTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addQuickTask()}
            placeholder="Co je třeba udělat?"
          />
          <button
            onClick={addQuickTask}
            className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xl active:scale-90 transition-all shrink-0"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
