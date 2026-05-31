import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CalendarPage from "./pages/CalendarPage";
import TasksPage from "./pages/TasksPage";
import CategoriesPage from "./pages/CategoriesPage";
import HomePage from "./pages/HomePage";
import ShoppingPage from "./pages/ShoppingPage";
import api, { registerPushSubscription } from "./api/client";

function BottomNav() {
  const base = "flex flex-col items-center gap-0.5 flex-1 py-2 text-xs font-medium transition-all active:scale-95";
  const active = "text-indigo-400";
  const inactive = "text-slate-500";

  const tabs = [
    { to: "/", icon: "🏠", label: "Domů", end: true },
    { to: "/calendar", icon: "📅", label: "Kalendář", end: false },
    { to: "/tasks", icon: "✅", label: "Úkoly", end: false },
    { to: "/shopping", icon: "🛒", label: "Nákupy", end: false },
    { to: "/more", icon: "⋯", label: "Více", end: false },
  ];

  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-40 flex safe-bottom border-t border-white/5">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          <span className="text-xl leading-none">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function MorePage() {
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
    <div className="space-y-3">
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-white">Více</h1>
        <p className="text-slate-400 text-sm mt-0.5">Nastavení a správa</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/5">
          <h3 className="font-semibold text-slate-300 text-xs uppercase tracking-wider">Upozornění</h3>
        </div>
        <button
          onClick={toggleNotif}
          className="w-full flex items-center gap-3 px-4 py-4 active:bg-white/5 transition-all"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${notif ? "bg-indigo-500/20" : "bg-slate-700/50"}`}>
            {notif ? "🔔" : "🔕"}
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-medium text-sm">Push notifikace</p>
            <p className="text-xs text-slate-400">{notif ? "Zapnuto" : "Vypnuto"}</p>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors relative ${notif ? "bg-indigo-600" : "bg-slate-700"}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notif ? "left-[22px]" : "left-0.5"}`} />
          </div>
        </button>
      </div>

      <CategoriesPage />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col max-w-lg mx-auto">
      <main className="flex-1 overflow-y-auto pb-20 px-3 pt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="/categories" element={<Navigate to="/more" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
