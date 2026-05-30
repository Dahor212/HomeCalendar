import { useState } from "react";
import { format } from "date-fns";
import { Task, TaskCreate, User } from "../types";

interface Props {
  task?: Task | null;
  users: User[];
  currentUserId: number;
  onSave: (data: TaskCreate) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const REMINDER_OPTIONS = [
  { value: 0, label: "Bez připomínky" },
  { value: 30, label: "30 minut předem" },
  { value: 60, label: "1 hodinu předem" },
  { value: 120, label: "2 hodiny předem" },
  { value: 1440, label: "1 den předem" },
];

export default function TaskModal({ task, users, currentUserId, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(
    task?.due_date ? format(new Date(task.due_date), "yyyy-MM-dd'T'HH:mm") : ""
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task?.priority as any ?? "medium");
  const [assignedTo, setAssignedTo] = useState<number | "">(task?.assigned_to ?? "");
  const [shared, setShared] = useState(task?.shared ?? true);
  const [reminderMinutes, setReminderMinutes] = useState(task?.reminder_minutes ?? 60);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      priority,
      assigned_to: assignedTo !== "" ? Number(assignedTo) : undefined,
      shared,
      reminder_minutes: reminderMinutes,
    });
  }

  const priorityColors = {
    low: "bg-green-100 text-green-700 border-green-300",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
    high: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">{task ? "Upravit úkol" : "Nový úkol"}</h2>
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
              placeholder="Název úkolu"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Termín</label>
            <input
              type="datetime-local"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priorita</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    priority === p ? priorityColors[p] + " ring-2 ring-offset-1 ring-gray-400" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {p === "low" ? "Nízká" : p === "medium" ? "Střední" : "Vysoká"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Přiřadit uživateli</label>
            <select
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Nikomu (sdílený)</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} {u.id === currentUserId ? "(já)" : ""}
                </option>
              ))}
            </select>
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
              id="sharedTask"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="sharedTask" className="text-sm font-medium text-gray-700">
              Viditelný pro všechny uživatele
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              {task ? "Uložit změny" : "Vytvořit"}
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
