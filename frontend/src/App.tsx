import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CalendarPage from "./pages/CalendarPage";
import TasksPage from "./pages/TasksPage";
import CategoriesPage from "./pages/CategoriesPage";
import api, { registerPushSubscription } from "./api/client";

function Header() {
  const [notif, setNotif] = useState(false);

  useEffect(() => {
    (async () => {
      if (!("Notification" in window)) return;
      const sw = await navigator.serviceWorker.getRegistration("/sw.js");
      if (sw) {
        const sub = await sw.pushManager?.getSubscription();
        setNotif(!!sub && Notification.permission === "granted");
      }
    })();
  }, []);

  async function toggleNotif() {
    if (notif) {
      const sw = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await sw?.pushManager?.getSubscription();
      if (sub) {
        await api.delete("/push/unsubscribe", { data: { endpoint: sub.endpoint, p256dh_key: (sub.toJSON().keys as any)?.p256dh, auth_key: (sub.toJSON().keys as any)?.auth } });
        await sub.unsubscribe();
      }
      setNotif(false);
      toast.success("Notifikace vypnuty");
    } else {
      const { data } = await api.get("/push/vapid-public-key");
      const ok = await registerPushSubscription(data.public_key);
      if (ok) { setNotif(true); toast.success("Notifikace zapnuty!"); }
      else toast.error("Nepodařilo se povolit notifikace");
    }
  }

  return (
    <header className="glass sticky top-0 z-40 px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl">📅</span>
        <span className="font-bold text-white tracking-tight">HomeCalendar</span>
      </div>
      <button
        onClick={toggleNotif}
        title={notif ? "Vypnout notifikace" : "Zapnout notifikace"}
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all active:scale-90 ${
          notif ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-700/50 text-slate-400"
        }`}
      >
        {notif ? "🔔" : "🔕"}
      </button>
    </header>
  );
}

function BottomNav() {
  const base = "flex flex-col items-center gap-0.5 flex-1 py-2 text-xs font-medium transition-all";
  const active = "text-indigo-400";
  const inactive = "text-slate-500";

  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-40 flex safe-bottom">
      <NavLink to="/" end className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <span className="text-xl">📅</span>
        Kalendář
      </NavLink>
      <NavLink to="/tasks" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <span className="text-xl">✅</span>
        Úkoly
      </NavLink>
      <NavLink to="/categories" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <span className="text-xl">🏷️</span>
        Kategorie
      </NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col max-w-lg mx-auto">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20 px-3 pt-3">
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
