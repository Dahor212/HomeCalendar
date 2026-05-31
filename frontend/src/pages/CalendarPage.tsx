import { useCallback, useEffect, useState } from "react";
import { format, startOfWeek, addDays, isToday, isSameDay, addWeeks } from "date-fns";
import { cs } from "date-fns/locale";
import toast from "react-hot-toast";
import api from "../api/client";
import { Event, EventCreate } from "../types";
import EventModal from "../components/EventModal";

const DAY_LABELS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [modal, setModal] = useState<{ event?: Event; initialStart?: Date } | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchEvents = useCallback(async () => {
    try {
      const start = addDays(weekStart, -7);
      const end = addDays(weekStart, 14);
      const { data } = await api.get<Event[]>("/events", {
        params: { start: start.toISOString(), end: end.toISOString() },
      });
      setEvents(data);
    } catch { /* silent */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  async function handleSave(payload: EventCreate) {
    try {
      if (modal?.event) {
        await api.put(`/events/${modal.event.id}`, payload);
        toast.success("Událost upravena");
      } else {
        await api.post("/events", payload);
        toast.success("Událost přidána");
      }
      setModal(null);
      fetchEvents();
    } catch {
      toast.error("Nepodařilo se uložit událost");
    }
  }

  async function handleDelete() {
    if (!modal?.event) return;
    try {
      await api.delete(`/events/${modal.event.id}`);
      toast.success("Událost smazána");
      setModal(null);
      fetchEvents();
    } catch {
      toast.error("Nepodařilo se smazat událost");
    }
  }

  const dayEvents = events.filter(e => isSameDay(new Date(e.start), selectedDate));
  const sortedDayEvents = [...dayEvents].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const monthLabel = format(selectedDate, "LLLL yyyy", { locale: cs });
  const monthLabelCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  function hasEvent(day: Date) {
    return events.some(e => isSameDay(new Date(e.start), day));
  }

  return (
    <div className="space-y-3">
      {/* Week strip */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="w-8 h-8 rounded-xl bg-slate-700/50 text-slate-300 flex items-center justify-center text-lg active:scale-90 transition-all"
          >
            ‹
          </button>
          <span className="text-white font-semibold text-sm">{monthLabelCap}</span>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="w-8 h-8 rounded-xl bg-slate-700/50 text-slate-300 flex items-center justify-center text-lg active:scale-90 transition-all"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-xs text-slate-500 font-medium py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const selected = isSameDay(day, selectedDate);
            const today = isToday(day);
            const dot = hasEvent(day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center py-1.5 rounded-xl transition-all active:scale-90 ${
                  selected ? "bg-indigo-600" : today ? "bg-indigo-500/20" : ""
                }`}
              >
                <span className={`text-sm font-bold ${selected ? "text-white" : today ? "text-indigo-400" : "text-slate-300"}`}>
                  {format(day, "d")}
                </span>
                <div className={`w-1 h-1 rounded-full mt-0.5 ${dot ? (selected ? "bg-white" : "bg-indigo-400") : "invisible"}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Day header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-white font-semibold text-sm">
          {isToday(selectedDate) ? "Dnes" : format(selectedDate, "EEEE d. MMMM", { locale: cs })}
        </h2>
        <button
          onClick={() => setModal({ initialStart: selectedDate })}
          className="btn-primary text-xs px-3 py-1.5"
        >
          + Nová událost
        </button>
      </div>

      {/* Events list */}
      {sortedDayEvents.length === 0 ? (
        <div className="glass rounded-2xl py-10 text-center text-slate-500">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-sm">Žádné události</p>
          <button
            onClick={() => setModal({ initialStart: selectedDate })}
            className="mt-3 text-indigo-400 text-xs font-medium"
          >
            Přidat událost
          </button>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <ul className="divide-y divide-white/5">
            {sortedDayEvents.map((e) => (
              <li
                key={e.id}
                className="flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition-all cursor-pointer"
                onClick={() => setModal({ event: e })}
              >
                <div className="shrink-0 text-center w-12">
                  {e.all_day ? (
                    <span className="text-xs text-slate-400 font-medium">Celý den</span>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-white">{format(new Date(e.start), "HH:mm")}</p>
                      {e.end && <p className="text-xs text-slate-500">{format(new Date(e.end), "HH:mm")}</p>}
                    </>
                  )}
                </div>
                <div
                  className="w-1 self-stretch rounded-full shrink-0"
                  style={{ backgroundColor: e.color || "#6366f1" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{e.title}</p>
                  {e.description && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">{e.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {modal !== null && (
        <EventModal
          event={modal.event}
          initialStart={modal.initialStart}
          onSave={handleSave}
          onDelete={modal.event ? handleDelete : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
