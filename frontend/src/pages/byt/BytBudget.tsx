const categories = [
  { name: "Nábytek", icon: "🛋️", spent: 54000, budget: 80000 },
  { name: "Elektro", icon: "⚡", spent: 28000, budget: 35000 },
  { name: "Dekorace", icon: "🎨", spent: 8500, budget: 20000 },
  { name: "Služby", icon: "🔧", spent: 45000, budget: 60000 },
  { name: "Ostatní", icon: "📦", spent: 12000, budget: 15000 },
];

const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
const totalLeft = totalBudget - totalSpent;
const totalPct = Math.round((totalSpent / totalBudget) * 100);

function barColor(spent: number, budget: number) {
  const pct = spent / budget;
  if (pct >= 1) return "#EF4444";
  if (pct >= 0.8) return "#F59E0B";
  return "#34D399";
}

export default function BytBudget() {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - totalPct / 100);
  const accentColor = totalPct >= 80 ? "#F59E0B" : "#7C3AED";

  return (
    <div className="pb-28 min-h-screen bg-[#070A0F]">
      <div className="px-4 pt-4">
        <h2 className="text-white font-bold text-xl mb-4">Rozpočet</h2>
        <div className="rounded-3xl p-6 mb-4 flex items-center gap-6"
          style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="relative flex items-center justify-center w-32 h-32 shrink-0">
            <svg width="128" height="128" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle cx="64" cy="64" r={radius} fill="none" stroke={accentColor} strokeWidth="10"
                strokeDasharray={circumference} strokeDashoffset={dashoffset}
                strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${accentColor})` }} />
            </svg>
            <div className="absolute text-center">
              <p className="text-white font-bold text-xl leading-none">{totalPct}%</p>
              <p className="text-[#9CA3AF] text-xs mt-0.5">čerpáno</p>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-[#9CA3AF] text-xs">Celkový rozpočet</p>
              <p className="text-white font-bold text-lg">{totalBudget.toLocaleString("cs-CZ")} Kč</p>
            </div>
            <div>
              <p className="text-[#9CA3AF] text-xs">Utraceno</p>
              <p className="font-bold text-[#F59E0B]">{totalSpent.toLocaleString("cs-CZ")} Kč</p>
            </div>
            <div>
              <p className="text-[#9CA3AF] text-xs">Zbývá</p>
              <p className="font-bold text-[#34D399]">{totalLeft.toLocaleString("cs-CZ")} Kč</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {categories.map(cat => {
            const pct = Math.round((cat.spent / cat.budget) * 100);
            const color = barColor(cat.spent, cat.budget);
            return (
              <div key={cat.name} className="rounded-2xl p-4"
                style={{ background: "#111821", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: "#171F2B" }}>{cat.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-white font-semibold text-sm">{cat.name}</p>
                      <p className="font-bold text-sm" style={{ color }}>{pct}%</p>
                    </div>
                    <p className="text-[#9CA3AF] text-xs mt-0.5">
                      {cat.spent.toLocaleString("cs-CZ")} / {cat.budget.toLocaleString("cs-CZ")} Kč
                    </p>
                  </div>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-2 rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
