import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Event, EventCreate } from "../types";

interface Props {
  event?: Event | null;
  initialStart?: Date;
  onSave: (data: EventCreate) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const COLORS = [
  { value: "#3B82F6", label: "Modrá" },
  { value: "#10B981", label: "Zelená" },
  { value: "#F59E0B", label: "Žlutá" },
  { value: "#EF4444", label: "Červená" },
  { value: "#8B5CF6", label: "Fialová" },
  { value: "#EC4899", label: "Růžová" },
  { value: "#6B7280", label: "Šedá" },
];

const REMINDER_OPTIONS = [
  { value: 0, label: "Bez připomínky" },
  { value: 5, label: "5 minut předem" },
  { value: 15, label: "15 minut předem" },
  { value: 30, label: "30 minut předem" },
  { value: 60, label: "1 hodinu předem" },
  { value: 120, label: "2 hodiny předem" },
  { value: 1440, label: "1 den předem" },
];

function toLocalInput(iso: string) {
  return iso.slice(0, 16);
}

function toIsoLocal(local: string) {
  return new Date(local).toISOString();
}

export default function EventModal({ event, initialStart, onSave, onDelete, onClose }: Props) {
  const defaultStart = initialStart
    ? format(initialStart, "yyyy-MM-dd'T'HH:mm")
    : format(new Date(), "yyyy-MM-dd'T'HH:mm");

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [start, setStart] = useState(event ? toLocalInput(event.start) : defaultStart);
  const [end, setEnd] = useState(event?.end ? toLocalInput(event.end) : "");
  const [allDay, setAllDay] = useState(event?.all_day ?? false);
  const [color, setColor] = useState(event?.color ?? "#3B82F6");
  const [shared, setShared] = useState(event?.shared ?? true);
  const [reminderMinutes, setReminderMinutes] = useState(event?.reminder_minutes ?? 30);

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
      shared,
      reminder_minutes: reminderMinutes,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">
            {event ? "Upravit událost" : "Nová událost"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Název *</label>
            <input
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Název události"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Volitelný popis"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
              Celý den
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Začátek *</label>
              <input
                type={allDay ? "date" : "datetime-local"}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={allDay ? start.slice(0, 10) : start}
                onChange={(e) => setStart(allDay ? e.target.value + "T00:00" : e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konec</label>
              <input
                type={allDay ? "date" : "datetime-local"}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={allDay ? end.slice(0, 10) : end}
                onChange={(e) => setEnd(allDay ? e.target.value + "T23:59" : e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Barva</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === c.value ? "border-gray-800 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Připomínka</label>
            <select
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(Number(e.target.value))}
            >
              {REMINDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="shared"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="shared" className="text-sm font-medium text-gray-700">
              Sdílet s ostatními uživateli
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              {event ? "Uložit změny" : "Vytvořit"}
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
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
