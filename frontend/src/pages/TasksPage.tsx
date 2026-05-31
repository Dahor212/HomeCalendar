import { useCallback, useEffect, useState } from "react";
import { format, isPast, isToday } from "date-fns";
import { cs } from "date-fns/locale";
import toast from "react-hot-toast";
import api from "../api/client";
import { Task, TaskCreate, Category } from "../types";
import TaskModal from "../components/TaskModal";

const PRIORITY_COLORS = {
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
};
const PRIORITY_LABELS = { low: "Nízká", medium: "Střední", high: "Vysoká" };

type Filter = "all" | "active" | "completed";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<Filter>("active");
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [modal, setModal] = useState<{ task?: Task } | null>(null);

  const fetchData = useCallback(async () => {
    const [tasksRes, catsRes] = await Promise.all([
      api.get<Task[]>("/tasks", {
        params: filter !== "all" ? { completed: filter === "completed" } : {},
      }),
      api.get<Category[]>("/categories"),
    ]);
    setTasks(tasksRes.data);
    setCategories(catsRes.data);
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave(data: TaskCreate) {
    try {
      if (modal?.task) {
        await api.put(`/tasks/${modal.task.id}`, data);
        toast.success("Úkol upraven");
      } else {
        await api.post("/tasks", data);
        toast.success("Úkol přidán");
      }
      setModal(null);
      fetchData();
    } catch {
      toast.error("Nepodařilo se uložit úkol");
    }
  }

  async function handleDelete() {
    if (!modal?.task) return;
    try {
      await api.delete(`/tasks/${modal.task.id}`);
      toast.success("Úkol smazán");
      setModal(null);
      fetchData();
    } catch {
      toast.error("Nepodařilo se smazat úkol");
    }
  }

  async function handleToggle(task: Task) {
    try {
      await api.put(`/tasks/${task.id}/toggle`);
      fetchData();
    } catch {
      toast.error("Chyba");
    }
  }

  function getDueDateStyle(task: Task) {
    if (!task.due_date || task.completed) return "text-slate-500";
    const d = new Date(task.due_date);
    if (isPast(d) && !isToday(d)) return "text-red-400 font-medium";
    if (isToday(d)) return "text-amber-400 font-medium";
    return "text-slate-400";
  }

  const getCat = (id: number | null) => categories.find((c) => c.id === id);

  const filtered = tasks.filter((t) => catFilter === null || t.category_id === catFilter);
  const pending = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-white text-lg">Úkoly</h1>
            {pending > 0 && (
              <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                {pending}
              </span>
            )}
          </div>
          <button onClick={() => setModal({})} className="btn-primary text-sm px-3 py-2">
            + Nový
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex bg-slate-800/60 rounded-xl p-0.5 gap-0.5 mb-3">
          {(["active", "all", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === f ? "bg-indigo-600 text-white shadow" : "text-slate-400"
              }`}
            >
              {f === "active" ? "Aktivní" : f === "all" ? "Vše" : "Hotové"}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setCatFilter(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                catFilter === null
                  ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                  : "border-white/10 text-slate-400"
              }`}
            >
              Vše
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCatFilter(catFilter === cat.id ? null : cat.id)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  catFilter === cat.id
                    ? "text-white"
                    : "border-white/10 text-slate-400"
                }`}
                style={catFilter === cat.id ? { backgroundColor: cat.color + "33", borderColor: cat.color + "66", color: cat.color } : {}}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Task list */}
      <div className="glass rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-sm">{filter === "active" ? "Žádné aktivní úkoly" : "Žádné úkoly"}</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((task) => {
              const cat = getCat(task.category_id);
              return (
                <li
                  key={task.id}
                  className={`flex items-start gap-3 p-4 transition-colors active:bg-white/5 ${
                    task.completed ? "opacity-50" : ""
                  }`}
                >
                  <button
                    onClick={() => handleToggle(task)}
                    className={`mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                      task.completed
                        ? "bg-indigo-500 border-indigo-500 text-white"
                        : "border-slate-600 hover:border-indigo-400"
                    }`}
                  >
                    {task.completed && <span className="text-xs font-bold">✓</span>}
                  </button>

                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setModal({ task })}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium text-sm ${task.completed ? "line-through text-slate-500" : "text-white"}`}>
                        {task.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[task.priority]}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      {cat && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: cat.color + "22", color: cat.color }}>
                          {cat.icon} {cat.name}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>
                    )}
                    {task.due_date && (
                      <p className={`text-xs mt-1 ${getDueDateStyle(task)}`}>
                        ⏰ {format(new Date(task.due_date), "d. M. yyyy HH:mm", { locale: cs })}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {modal !== null && (
        <TaskModal
          task={modal.task}
          categories={categories}
          onSave={handleSave}
          onDelete={modal.task ? handleDelete : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
