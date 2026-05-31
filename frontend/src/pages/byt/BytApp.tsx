import { useState } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import BytOverview from "./BytOverview";
import BytRooms from "./BytRooms";
import BytRoomDetail from "./BytRoomDetail";
import BytTasks from "./BytTasks";
import BytShopping from "./BytShopping";
import BytBudget from "./BytBudget";
import BytInspiration from "./BytInspiration";
import BytSuppliers from "./BytSuppliers";
import BytAddModal from "./BytAddModal";

function BytBottomNav({ onAdd }: { onAdd: () => void }) {
  const base = "flex flex-col items-center gap-0.5 flex-1 py-2 text-xs font-medium transition-all active:scale-95";
  const active = "text-[#A855F7]";
  const inactive = "text-[#9CA3AF]";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center safe-bottom"
      style={{ background: "rgba(7,10,15,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", height: "64px" }}>
      <NavLink to="/byt" end className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <span className="text-xl leading-none">🏡</span>
        <span>Přehled</span>
      </NavLink>
      <NavLink to="/byt/tasks" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <span className="text-xl leading-none">✅</span>
        <span>Úkoly</span>
      </NavLink>
      {/* Floating add button */}
      <div className="flex-1 flex justify-center pb-1">
        <button
          onClick={onAdd}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl transition-all active:scale-90 -mt-5"
          style={{
            background: "linear-gradient(135deg, #7C3AED, #6d28d9)",
            boxShadow: "0 4px 20px rgba(124,58,237,0.6), 0 0 0 4px rgba(7,10,15,1)",
          }}>
          +
        </button>
      </div>
      <NavLink to="/byt/shopping" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <span className="text-xl leading-none">🛒</span>
        <span>Nákupy</span>
      </NavLink>
      <NavLink to="/byt/more" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <span className="text-xl leading-none">⋯</span>
        <span>Více</span>
      </NavLink>
    </nav>
  );
}

function BytMore() {
  const navigate = useNavigate();
  const items = [
    { icon: "🚪", label: "Místnosti", path: "/byt/rooms" },
    { icon: "💰", label: "Rozpočet", path: "/byt/budget" },
    { icon: "🖼️", label: "Inspirace", path: "/byt/inspiration" },
    { icon: "🔧", label: "Dodavatelé", path: "/byt/suppliers" },
    { icon: "🏠", label: "Úvodní stránka", path: "/" },
  ];
  return (
    <div className="pb-28 min-h-screen bg-[#070A0F] px-4 pt-4">
      <h2 className="text-white font-bold text-xl mb-4">Více</h2>
      <div className="rounded-2xl overflow-hidden" style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}>
        {items.map((item, i) => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-all active:bg-white/5 ${i < items.length - 1 ? "border-b" : ""}`}
            style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-white font-medium text-sm">{item.label}</span>
            <span className="ml-auto text-[#9CA3AF]">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BytApp() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="min-h-screen max-w-lg mx-auto" style={{ background: "#070A0F" }}>
      <main className="min-h-screen overflow-y-auto">
        <Routes>
          <Route path="/" element={<BytOverview />} />
          <Route path="/rooms" element={<BytRooms />} />
          <Route path="/rooms/:id" element={<BytRoomDetail />} />
          <Route path="/tasks" element={<BytTasks />} />
          <Route path="/shopping" element={<BytShopping />} />
          <Route path="/budget" element={<BytBudget />} />
          <Route path="/inspiration" element={<BytInspiration />} />
          <Route path="/suppliers" element={<BytSuppliers />} />
          <Route path="/more" element={<BytMore />} />
          <Route path="*" element={<Navigate to="/byt" replace />} />
        </Routes>
      </main>
      <BytBottomNav onAdd={() => setShowAdd(true)} />
      <BytAddModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
