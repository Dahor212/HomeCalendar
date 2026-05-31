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

export default function TaskModal({ task, categories, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(
    task?.due_date ? format(new Date(task.due_date), "yyyy-MM-dd'T'HH:mm") : ""
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">((task?.priority as any) ?? "medium");
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

  const priorityConfig = {
    low: { label: "Nízká", active: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" },
    medium: { label: "Střední", active: "bg-amber-500/20 border-amber-500/50 text-amber-400" },
    high: { label: "Vysoká", active: "bg-red-500/20 border-red-500/50 text-red-400" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">
            {task ? "Upravit úkol" : "Nový úkol"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-700/50 text-slate-400 text-lg">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input
            className="input-dark text-lg font-medium"
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
            <label className="text-xs text-slate-400 mb-1 block">Termín</label>
            <input
              type="datetime-local"
              className="input-dark text-sm"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Priorita</label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                    priority === p ? priorityConfig[p].active : "border-white/10 text-slate-500"
                  }`}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Kategorie</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCategoryId(undefined)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${!categoryId ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300" : "border-white/10 text-slate-400"}`}
                >
                  Žádná
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className="px-3 py-1 rounded-full text-xs border transition-all"
                    style={categoryId === cat.id
                      ? { backgroundColor: cat.color + "33", borderColor: cat.color + "66", color: cat.color }
                      : { borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }
                    }
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Připomínka</label>
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

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary flex-1">
              {task ? "Uložit" : "Vytvořit"}
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 font-semibold text-sm active:scale-95 transition-all border border-red-500/20"
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
