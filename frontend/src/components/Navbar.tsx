import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api, { registerPushSubscription } from "../api/client";

export default function Navbar() {
  const location = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  async function checkNotificationStatus() {
    if (!("Notification" in window)) return;
    const sw = await navigator.serviceWorker.getRegistration("/sw.js");
    if (sw) {
      const sub = await sw.pushManager?.getSubscription();
      setNotificationsEnabled(!!sub && Notification.permission === "granted");
    }
  }

  async function toggleNotifications() {
    if (notificationsEnabled) {
      const sw = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await sw?.pushManager?.getSubscription();
      if (sub) {
        await api.delete("/push/unsubscribe", {
          data: {
            endpoint: sub.endpoint,
            p256dh_key: (sub.toJSON().keys as Record<string, string>)?.p256dh,
            auth_key: (sub.toJSON().keys as Record<string, string>)?.auth,
          },
        });
        await sub.unsubscribe();
      }
      setNotificationsEnabled(false);
      toast.success("Notifikace vypnuty");
    } else {
      const { data } = await api.get("/push/vapid-public-key");
      const ok = await registerPushSubscription(data.public_key);
      if (ok) {
        setNotificationsEnabled(true);
        toast.success("Notifikace zapnuty!");
      } else {
        toast.error("Nepodařilo se povolit notifikace");
      }
    }
  }

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        location.pathname === to
          ? "bg-blue-700 text-white"
          : "text-blue-100 hover:bg-blue-500 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <span className="text-white font-bold text-lg">HomeCalendar</span>
          </div>

          <div className="flex items-center gap-2">
            {navLink("/", "Kalendář")}
            {navLink("/tasks", "Úkoly")}
          </div>

          <button
            onClick={toggleNotifications}
            title={notificationsEnabled ? "Vypnout notifikace" : "Zapnout notifikace"}
            className={`p-2 rounded-full transition-colors ${
              notificationsEnabled
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-blue-500 text-blue-200 hover:bg-blue-400"
            }`}
          >
            {notificationsEnabled ? "🔔" : "🔕"}
          </button>
        </div>
      </div>
    </nav>
  );
}
