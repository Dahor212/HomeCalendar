import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Event, EventCreate, Category } from "../types";
import api from "../api/client";

interface Props {
  event?: Event | null;
  initialStart?: Date;
  onSave: (data: EventCreate) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const COLORS = ["#3b82f6", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

const REMINDER_OPTIONS = [
  { value: 0, label: "Bez připomínky" },
  { value: 15, label: "15 min předem" },
  { value: 30, label: "30 min předem" },
  { value: 60, label: "1 hodinu předem" },
  { value: 1440, label: "1 den předem" },
];

function toLocalInput(iso: string) { return iso.slice(0, 16); }
function toIsoLocal(local: string) { return new Date(local).toISOString(); }

export default function EventModal({ event, initialStart, onSave, onDelete, onClose }: Props) {
  const defaultStart = initialStart
    ? format(initialStart, "yyyy-MM-dd'T'HH:mm")
    : format(new Date(), "yyyy-MM-dd'T'HH:mm");

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [start, setStart] = useState(event ? toLocalInput(event.start) : defaultStart);
  const [end, setEnd] = useState(event?.end ? toLocalInput(event.end) : "");
  const [allDay, setAllDay] = useState(event?.all_day ?? false);
  const [color, setColor] = useState(event?.color ?? "#3b82f6");
  const [categoryId, setCategoryId] = useState<number | undefined>(event?.category_id ?? undefined);
  const [reminderMinutes, setReminderMinutes] = useState(event?.reminder_minutes ?? 30);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get<Category[]>("/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description,
      start: toIsoLocal(start),
      end: end ? toIsoLocal(end) : undefined,
      all_day: allDay,
      color,
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
          <h2 className="text-lg font-bold text-white">
            {event ? "Upravit událost" : "Nová událost"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-700/50 text-slate-400 flex items-center justify-center text-xl active:scale-90">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input-dark"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Název události"
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAllDay(!allDay)}
              className={`w-11 h-6 rounded-full transition-colors relative ${allDay ? "bg-indigo-600" : "bg-slate-700"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${allDay ? "left-[22px]" : "left-0.5"}`} />
            </button>
            <span className="text-sm text-slate-300">Celý den</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Začátek</label>
              <input
                type={allDay ? "date" : "datetime-local"}
                className="input-dark text-sm"
                value={allDay ? start.slice(0, 10) : start}
                onChange={(e) => setStart(allDay ? e.target.value + "T00:00" : e.target.value)}
                required
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Konec</label>
              <input
                type={allDay ? "date" : "datetime-local"}
                className="input-dark text-sm"
                value={allDay ? end.slice(0, 10) : end}
                onChange={(e) => setEnd(allDay ? e.target.value + "T23:59" : e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-2 block">Barva</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all active:scale-90 ${
                    color === c ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
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
              {event ? "Uložit změny" : "Vytvořit"}
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
