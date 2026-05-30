import { useCallback, useEffect, useState } from "react";
import { format, isPast, isToday } from "date-fns";
import { cs } from "date-fns/locale";
import toast from "react-hot-toast";
import api from "../api/client";
import { Task, TaskCreate, User } from "../types";
import { useAuthStore } from "../store/auth";
import TaskModal from "../components/TaskModal";

const PRIORITY_LABELS = { low: "Nízká", medium: "Střední", high: "Vysoká" };
const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

type Filter = "all" | "active" | "completed";

export default function TasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<Filter>("active");
  const [modal, setModal] = useState<{ task?: Task } | null>(null);

  const fetchData = useCallback(async () => {
    const [tasksRes, usersRes] = await Promise.all([
      api.get<Task[]>("/tasks", {
        params: filter !== "all" ? { completed: filter === "completed" } : {},
      }),
      api.get<User[]>("/auth/users"),
    ]);
    setTasks(tasksRes.data);
    setUsers(usersRes.data);
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  function getDueDateClass(task: Task) {
    if (!task.due_date || task.completed) return "text-gray-400";
    const d = new Date(task.due_date);
    if (isPast(d) && !isToday(d)) return "text-red-600 font-medium";
    if (isToday(d)) return "text-orange-500 font-medium";
    return "text-gray-500";
  }

  const getUserName = (id: number | null) =>
    id ? users.find((u) => u.id === id)?.username ?? "?" : null;

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">Úkoly</h1>
            {pendingCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-gray-100 p-0.5">
              {(["active", "all", "completed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                    filter === f ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f === "active" ? "Aktivní" : f === "all" ? "Vše" : "Hotové"}
                </button>
              ))}
            </div>
            <button
              onClick={() => setModal({})}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
            >
              + Nový úkol
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">✅</div>
            <p>{filter === "active" ? "Žádné aktivní úkoly" : "Žádné úkoly"}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-gray-50 ${
                  task.completed ? "opacity-60" : ""
                }`}
              >
                <button
                  onClick={() => handleToggle(task)}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 hover:border-blue-500"
                  }`}
                >
                  {task.completed && <span className="text-xs">✓</span>}
                </button>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setModal({ task })}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-medium ${task.completed ? "line-through text-gray-400" : "text-gray-900"}`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}`}
                    >
                      {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
                    </span>
                    {task.shared && (
                      <span className="text-xs text-gray-400">👥 Sdílený</span>
                    )}
                    {task.assigned_to && (
                      <span className="text-xs text-blue-500">
                        → {getUserName(task.assigned_to)}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{task.description}</p>
                  )}
                  {task.due_date && (
                    <p className={`text-xs mt-1 ${getDueDateClass(task)}`}>
                      ⏰ {format(new Date(task.due_date), "d. M. yyyy HH:mm", { locale: cs })}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modal !== null && (
        <TaskModal
          task={modal.task}
          users={users}
          currentUserId={user!.id}
          onSave={handleSave}
          onDelete={modal.task ? handleDelete : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
