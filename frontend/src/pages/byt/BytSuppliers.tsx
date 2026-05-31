const suppliers = [
  { id: 1, name: "Truhlář Novák", type: "Truhlářské práce", phone: "+420 777 111 222", email: "novak@truhlarna.cz", status: "Potvrzeno", note: "Kuchyňská linka, skříně do ložnice" },
  { id: 2, name: "Podlahy Praha s.r.o.", type: "Podlahářské práce", phone: "+420 603 456 789", email: "info@podlahypraha.cz", status: "Čeká na odpověď", note: "Parkety do obýváku a ložnice" },
  { id: 3, name: "Kuchyňské studio ABC", type: "Kuchyně na míru", phone: "+420 800 123 456", email: "studio@abc-kuchyne.cz", status: "Poptáno", note: "Nabídka očekávána do 15. 6." },
  { id: 4, name: "Elektrikář Beneš", type: "Elektroinstalace", phone: "+420 724 987 654", email: "benes@elektro.cz", status: "Hotovo", note: "Rozvody elektřiny dokončeny" },
  { id: 5, name: "Malíř Dvořák", type: "Malířské práce", phone: "+420 605 321 098", email: "dvorak@malir.cz", status: "Poptáno", note: "Cenová nabídka na celý byt" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Poptáno": { bg: "rgba(59,130,246,0.15)", text: "#3B82F6" },
  "Čeká na odpověď": { bg: "rgba(245,158,11,0.15)", text: "#F59E0B" },
  "Potvrzeno": { bg: "rgba(52,211,153,0.15)", text: "#34D399" },
  "Hotovo": { bg: "rgba(156,163,175,0.12)", text: "#9CA3AF" },
};

export default function BytSuppliers() {
  return (
    <div className="pb-28 min-h-screen bg-[#070A0F]">
      <div className="px-4 pt-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-xl">Dodavatelé</h2>
          <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: "#7C3AED", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}>
            + Přidat
          </button>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {suppliers.map(s => {
          const sc = STATUS_COLORS[s.status] ?? { bg: "rgba(156,163,175,0.12)", text: "#9CA3AF" };
          return (
            <div key={s.id} className="rounded-2xl p-4"
              style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-white font-semibold">{s.name}</p>
                  <p className="text-[#9CA3AF] text-sm mt-0.5">{s.type}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium ml-2 shrink-0"
                  style={{ background: sc.bg, color: sc.text }}>{s.status}</span>
              </div>

              {s.note && (
                <p className="text-[#9CA3AF] text-xs mb-3 leading-relaxed">{s.note}</p>
              )}

              <div className="flex gap-2">
                <a href={`tel:${s.phone}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
                  style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.2)" }}>
                  📞 Zavolat
                </a>
                <a href={`mailto:${s.email}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
                  style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.2)" }}>
                  ✉️ Napsat
                </a>
                <div className="flex-1 flex items-center justify-end">
                  <p className="text-[#9CA3AF] text-xs">{s.phone}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
