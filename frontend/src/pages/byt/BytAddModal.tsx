import { useEffect } from "react";

interface BytAddModalProps {
  open: boolean;
  onClose: () => void;
}

const options = [
  { icon: "✅", label: "Přidat úkol", color: "#7C3AED" },
  { icon: "🛒", label: "Přidat nákup", color: "#3B82F6" },
  { icon: "🚪", label: "Přidat místnost", color: "#34D399" },
  { icon: "🖼️", label: "Přidat inspiraci", color: "#F59E0B" },
  { icon: "📝", label: "Přidat poznámku", color: "#A855F7" },
  { icon: "🔧", label: "Přidat dodavatele", color: "#EF4444" },
];

export default function BytAddModal({ open, onClose }: BytAddModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Bottom sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl pb-8 pt-5 px-4"
        style={{
          background: "#111821",
          border: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-[rgba(255,255,255,0.2)] rounded-full mx-auto mb-6" />

        <h3 className="text-white font-bold text-lg mb-5 px-1">Přidat</h3>

        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl transition-all active:scale-95"
              style={{
                background: "#171F2B",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${opt.color}22`, border: `1px solid ${opt.color}44` }}
              >
                {opt.icon}
              </div>
              <span className="text-white text-sm font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
