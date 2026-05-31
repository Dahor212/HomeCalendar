import { useCallback, useEffect, useState } from "react";
import { format, isPast, isToday } from "date-fns";
import { cs } from "date-fns/locale";
import toast from "react-hot-toast";
import api from "../api/client";
import { Task, TaskCreate, Category } from "../types";
import TaskModal from "../components/TaskModal";

const PRIORITY_DOT: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
};
const PRIORITY_LABELS = { low: "Nízká", medium: "Střední", high: "Vysoká" };

const PRIORITY_LABEL: Record<string, string> = {
  low: "Nízká",
  medium: "Střední",
  high: "Vysoká",
};

type Filter = "active" | "all" | "completed";

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

  const filtered = catFilter ? tasks.filter(t => t.category_id === catFilter) : tasks;
  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-white text-lg">Úkoly</h1>
            {pendingCount > 0 && (
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </div>
          <button onClick={() => setModal({})} className="btn-primary text-sm px-3 py-2">
            + Přidat
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-3">
          {(["active", "all", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === f ? "bg-indigo-600 border-indigo-500 text-white" : "border-white/10 text-slate-400"
              }`}
            >
              {f === "active" ? "Aktivní" : f === "all" ? "Vše" : "Hotové"}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCatFilter(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                !catFilter ? "bg-indigo-600 border-indigo-500 text-white" : "border-white/10 text-slate-400"
              }`}
            >
              Vše
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCatFilter(catFilter === cat.id ? null : cat.id)}
                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  catFilter === cat.id ? "border-indigo-500 text-white" : "border-white/10 text-slate-400"
                }`}
                style={catFilter === cat.id ? { backgroundColor: cat.color + "33", borderColor: cat.color } : {}}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tasks list */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-12 text-center text-slate-500">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm">{filter === "active" ? "Žádné aktivní úkoly" : "Žádné úkoly"}</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <ul className="divide-y divide-white/5">
            {filtered.map((task) => {
              const cat = categories.find(c => c.id === task.category_id);
              const overdue = task.due_date && !task.completed && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
              const dueToday = task.due_date && isToday(new Date(task.due_date));

              return (
                <li key={task.id} className="flex items-center gap-3 px-4 py-3.5">
                  <button
                    onClick={() => handleToggle(task)}
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                      task.completed ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-600"
                    }`}
                  >
                    {task.completed && <span className="text-xs font-bold">✓</span>}
                  </button>

                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setModal({ task })}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${task.completed ? "line-through text-slate-500" : "text-white"}`}>
                        {task.title}
                      </p>
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: PRIORITY_DOT[task.priority] }}
                        title={PRIORITY_LABEL[task.priority]}
                      />
                      {cat && (
                        <span className="text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: cat.color + "22", color: cat.color }}>
                          {cat.icon} {cat.name}
                        </span>
                      )}
                    </div>
                    {task.due_date && (
                      <p className={`text-xs mt-0.5 ${overdue ? "text-red-400" : dueToday ? "text-amber-400" : "text-slate-500"}`}>
                        ⏰ {format(new Date(task.due_date), "d. M. yyyy HH:mm", { locale: cs })}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

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
