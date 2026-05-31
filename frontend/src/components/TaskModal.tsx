import { useState } from "react";
import { format } from "date-fns";
import { Task, TaskCreate, Category } from "../types";

interface Props {
  task?: Task | null;
  categories: Category[];
  onSave: (data: TaskCreate) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const REMINDER_OPTIONS = [
  { value: 0, label: "Bez připomínky" },
  { value: 30, label: "30 min předem" },
  { value: 60, label: "1 hodinu předem" },
  { value: 1440, label: "1 den předem" },
];

const PRIORITY_COLORS = {
  low: { bg: "bg-emerald-500/20", text: "text-emerald-400", active: "bg-emerald-600" },
  medium: { bg: "bg-amber-500/20", text: "text-amber-400", active: "bg-amber-600" },
  high: { bg: "bg-red-500/20", text: "text-red-400", active: "bg-red-600" },
};

export default function TaskModal({ task, categories, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(
    task?.due_date ? format(new Date(task.due_date), "yyyy-MM-dd'T'HH:mm") : ""
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task?.priority ?? "medium");
  const [categoryId, setCategoryId] = useState<number | undefined>(task?.category_id ?? undefined);
  const [reminderMinutes, setReminderMinutes] = useState(task?.reminder_minutes ?? 60);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      priority,
      category_id: categoryId,
      reminder_minutes: reminderMinutes,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="glass-strong w-full max-w-lg rounded-t-3xl p-5 pb-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{task ? "Upravit úkol" : "Nový úkol"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-700/50 text-slate-400 flex items-center justify-center text-xl active:scale-90">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input-dark"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Název úkolu"
            required
            autoFocus
          />

          <textarea
            className="input-dark resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Popis (volitelné)"
          />

          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Termín</label>
            <input
              type="datetime-local"
              className="input-dark text-sm"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium mb-2 block">Priorita</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                    priority === p
                      ? `${PRIORITY_COLORS[p].active} text-white`
                      : `${PRIORITY_COLORS[p].bg} ${PRIORITY_COLORS[p].text}`
                  }`}
                >
                  {p === "low" ? "Nízká" : p === "medium" ? "Střední" : "Vysoká"}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <label className="text-xs text-slate-400 font-medium mb-2 block">Kategorie</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCategoryId(undefined)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    !categoryId ? "bg-indigo-600 border-indigo-500 text-white" : "border-white/10 text-slate-400"
                  }`}
                >
                  Žádná
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${
                      categoryId === cat.id ? "text-white" : "border-white/10 text-slate-400"
                    }`}
                    style={categoryId === cat.id ? { backgroundColor: cat.color + "33", borderColor: cat.color } : {}}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Připomínka</label>
            <select
              className="input-dark"
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(Number(e.target.value))}
            >
              {REMINDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary flex-1">
              {task ? "Uložit změny" : "Vytvořit"}
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 font-semibold text-sm active:scale-95 transition-all"
              >
                Smazat
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
