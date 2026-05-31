import { useState } from "react";
import { format } from "date-fns";
import { useEffect } from "react";
import { Event, EventCreate, Category } from "../types";
import api from "../api/client";

interface Props {
  event?: Event | null;
  initialStart?: Date;
  onSave: (data: EventCreate) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6"];
const REMINDER_OPTIONS = [
  { value: 0, label: "Bez připomínky" },
  { value: 15, label: "15 min předem" },
  { value: 30, label: "30 min předem" },
  { value: 60, label: "1 hodinu předem" },
  { value: 120, label: "2 hodiny předem" },
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
  const [color, setColor] = useState(event?.color ?? "#6366f1");
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">
            {event ? "Upravit událost" : "Nová událost"}
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

          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-12 h-6 rounded-full transition-colors ${allDay ? "bg-indigo-500" : "bg-slate-700"} relative`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${allDay ? "translate-x-7" : "translate-x-1"}`} />
            </div>
            <span className="text-sm text-slate-300">Celý den</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Začátek *</label>
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
              <label className="text-xs text-slate-400 mb-1 block">Konec</label>
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
            <label className="text-xs text-slate-400 mb-2 block">Barva</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all active:scale-90 ${color === c ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110" : ""}`}
                  style={{ backgroundColor: c }}
                />
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

          {/* Reminder */}
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
              {event ? "Uložit" : "Vytvořit"}
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
