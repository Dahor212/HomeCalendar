import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070A0F] flex flex-col items-center justify-center px-5 py-10">
      {/* Logo / title */}
      <div className="mb-10 text-center">
        <div className="text-5xl mb-3">🏡</div>
        <h1 className="text-3xl font-bold text-white tracking-tight">HomeCalendar</h1>
        <p className="text-[#9CA3AF] mt-1 text-sm">Váš chytrý domácí asistent</p>
      </div>

      {/* Cards */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* Tasks card */}
        <button
          onClick={() => navigate("/app")}
          className="w-full text-left rounded-3xl p-6 transition-all active:scale-95 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1e2a4a 0%, #111827 60%, #0f172a 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
            boxShadow: "0 8px 32px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Glow */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 pointer-events-none"
            style={{
              background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
              transform: "translate(40%, -40%)",
            }}
          />
          <div className="relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
              style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}
            >
              ✅
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Úkoly & Domácnost</h2>
            <p className="text-[#9CA3AF] text-sm">Kalendář, úkoly, nákupní seznam</p>
            <div
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
              }}
            >
              Otevřít <span>→</span>
            </div>
          </div>
        </button>

        {/* Byt card */}
        <button
          onClick={() => navigate("/byt")}
          className="w-full text-left rounded-3xl p-6 transition-all active:scale-95 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1e1535 0%, #111827 60%, #0f172a 100%)",
            border: "1px solid rgba(124,58,237,0.25)",
            boxShadow: "0 8px 32px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Glow */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 pointer-events-none"
            style={{
              background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)",
              transform: "translate(40%, -40%)",
            }}
          />
          <div className="relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
              style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
            >
              🏠
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Zařizování bytu</h2>
            <p className="text-[#9CA3AF] text-sm">Místnosti, rozpočet, inspirace</p>
            <div
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #6d28d9)",
                boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
              }}
            >
              Otevřít <span>→</span>
            </div>
          </div>
        </button>
      </div>

      <p className="mt-10 text-[#9CA3AF] text-xs">verze 1.0</p>
    </div>
  );
}
