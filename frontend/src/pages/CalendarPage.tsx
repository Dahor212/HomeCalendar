import { useCallback, useEffect, useRef, useState } from "react";
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

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [modal, setModal] = useState<{ event?: Event; initialStart?: Date } | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  const fetchEvents = useCallback(async (start: Date, end: Date) => {
    const { data } = await api.get<Event[]>("/events", {
      params: { start: start.toISOString(), end: end.toISOString() },
    });
    setEvents(data);
  }, []);

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
      if (cal) {
        const view = cal.view;
        await fetchEvents(view.activeStart, view.activeEnd);
      }
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
      if (cal) {
        const view = cal.view;
        await fetchEvents(view.activeStart, view.activeEnd);
      }
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
    borderColor: e.color,
    extendedProps: { event: e },
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Kalendář</h1>
        <button
          onClick={() => setModal({})}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
        >
          + Nová událost
        </button>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        locale={csLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
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
        eventClick={(info: EventClickArg) => {
          setModal({ event: info.event.extendedProps.event as Event });
        }}
        eventDrop={handleDrop}
        nowIndicator
      />

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
