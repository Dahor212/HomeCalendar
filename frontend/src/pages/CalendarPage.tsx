import { useCallback, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import csLocale from "@fullcalendar/core/locales/cs";
import type { EventClickArg, DateSelectArg, EventDropArg } from "@fullcalendar/core";
import toast from "react-hot-toast";
import api from "../api/client";
import { Event, EventCreate } from "../types";
import EventModal from "../components/EventModal";

const VIEWS = [
  { key: "dayGridMonth", label: "Měsíc" },
  { key: "timeGridWeek", label: "Týden" },
  { key: "timeGridDay", label: "Den" },
  { key: "listWeek", label: "Seznam" },
] as const;

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [modal, setModal] = useState<{ event?: Event; initialStart?: Date } | null>(null);
  const [view, setView] = useState<string>("dayGridMonth");
  const calendarRef = useRef<FullCalendar>(null);

  const fetchEvents = useCallback(async (start: Date, end: Date) => {
    try {
      const { data } = await api.get<Event[]>("/events", {
        params: { start: start.toISOString(), end: end.toISOString() },
      });
      setEvents(data);
    } catch { /* silent */ }
  }, []);

  function changeView(v: string) {
    setView(v);
    calendarRef.current?.getApi().changeView(v);
  }

  async function handleSave(data: EventCreate) {
    try {
      if (modal?.event) {
        await api.put(`/events/${modal.event.id}`, data);
        toast.success("Událost upravena");
      } else {
        await api.post("/events", data);
        toast.success("Událost přidána");
      }
      setModal(null);
      const cal = calendarRef.current?.getApi();
      if (cal) await fetchEvents(cal.view.activeStart, cal.view.activeEnd);
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
      const cal = calendarRef.current?.getApi();
      if (cal) await fetchEvents(cal.view.activeStart, cal.view.activeEnd);
    } catch {
      toast.error("Nepodařilo se smazat událost");
    }
  }

  async function handleDrop(info: EventDropArg) {
    try {
      await api.put(`/events/${info.event.id}`, {
        start: info.event.start?.toISOString(),
        end: info.event.end?.toISOString() ?? undefined,
      });
    } catch {
      info.revert();
      toast.error("Nepodařilo se přesunout událost");
    }
  }

  const calendarEvents = events.map((e) => ({
    id: String(e.id),
    title: e.title,
    start: e.start,
    end: e.end ?? undefined,
    allDay: e.all_day,
    backgroundColor: e.color,
    borderColor: "transparent",
    extendedProps: { event: e },
  }));

  return (
    <div className="space-y-3">
      {/* View switcher */}
      <div className="glass rounded-2xl p-1 flex gap-1">
        {VIEWS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => changeView(key)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              view === key
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Calendar card */}
      <div className="glass rounded-2xl p-3">
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setModal({})}
            className="btn-primary text-sm px-4 py-2"
          >
            + Nová událost
          </button>
        </div>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          locale={csLocale}
          headerToolbar={{ left: "prev,next", center: "title", right: "today" }}
          initialView="dayGridMonth"
          events={calendarEvents}
          selectable
          editable
          selectMirror
          dayMaxEvents={3}
          height="auto"
          datesSet={(info) => fetchEvents(info.start, info.end)}
          select={(info: DateSelectArg) => {
            setModal({ initialStart: info.start });
            calendarRef.current?.getApi().unselect();
          }}
          eventClick={(info: EventClickArg) =>
            setModal({ event: info.event.extendedProps.event as Event })
          }
          eventDrop={handleDrop}
          nowIndicator
        />
      </div>

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
