import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import { Category } from "../types";

const ICONS = ["📁", "🏠", "🏢", "🎯", "💼", "🎓", "❤️", "🏃", "🍎", "🎮", "🎵", "✈️", "💰", "🔧", "📚"];
const COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await api.get<Category[]>("/categories");
    setCategories(data);
  }

  function openAdd() {
    setEditing(null);
    setName(""); setColor(COLORS[0]); setIcon(ICONS[0]);
    setShowAdd(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name); setColor(cat.color); setIcon(cat.icon);
    setShowAdd(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, { name: name.trim(), color, icon });
        toast.success("Kategorie upravena");
      } else {
        await api.post("/categories", { name: name.trim(), color, icon });
        toast.success("Kategorie přidána");
      }
      setShowAdd(false);
      load();
    } catch {
      toast.error("Nepodařilo se uložit kategorii");
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Kategorie smazána");
      load();
    } catch {
      toast.error("Nepodařilo se smazat kategorii");
    }
  }

  return (
    <div className="space-y-3">
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white text-lg">Kategorie</h2>
          <button onClick={openAdd} className="btn-primary text-sm px-3 py-2">
            + Přidat
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="glass rounded-2xl p-4 space-y-4">
          <h3 className="font-semibold text-white text-sm">{editing ? "Upravit kategorii" : "Nová kategorie"}</h3>

          <input
            className="input-dark"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Název kategorie"
            autoFocus
          />

          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium">Ikona</p>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all active:scale-90 ${
                    icon === ic ? "bg-indigo-600" : "bg-slate-700/50"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium">Barva</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all active:scale-90 ${
                    color === c ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary flex-1">
              {editing ? "Uložit" : "Přidat"}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-700/50 text-slate-300 font-semibold text-sm active:scale-95"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="glass rounded-2xl py-10 text-center text-slate-500">
          <div className="text-3xl mb-2">🏷️</div>
          <p className="text-sm">Žádné kategorie</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <ul className="divide-y divide-white/5">
            {categories.map(cat => (
              <li key={cat.id} className="flex items-center gap-3 px-4 py-3.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: cat.color + "22" }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{cat.name}</p>
                </div>
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <button
                  onClick={() => openEdit(cat)}
                  className="shrink-0 w-8 h-8 rounded-lg bg-slate-700/50 text-slate-300 flex items-center justify-center text-xs active:scale-90 transition-all"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="shrink-0 w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-sm active:scale-90 transition-all"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
