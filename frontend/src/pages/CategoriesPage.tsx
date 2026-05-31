import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import { Category } from "../types";

const PRESET_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#64748b"];
const PRESET_ICONS = ["📁", "🏠", "💼", "🛒", "🏃", "📚", "🎮", "🍕", "💊", "🎁", "✈️", "🔧", "💰", "🌱", "🐾"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", color: "#6366f1", icon: "📁" });

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await api.get<Category[]>("/categories");
    setCategories(data);
  }

  function startCreate() {
    setForm({ name: "", color: "#6366f1", icon: "📁" });
    setCreating(true);
    setEditing(null);
  }

  function startEdit(cat: Category) {
    setForm({ name: cat.name, color: cat.color, icon: cat.icon });
    setEditing(cat);
    setCreating(false);
  }

  function cancel() { setCreating(false); setEditing(null); }

  async function handleSave() {
    if (!form.name.trim()) return toast.error("Zadejte název");
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, form);
        toast.success("Kategorie upravena");
      } else {
        await api.post("/categories", form);
        toast.success("Kategorie přidána");
      }
      cancel();
      load();
    } catch {
      toast.error("Nepodařilo se uložit");
    }
  }

  async function handleDelete(cat: Category) {
    try {
      await api.delete(`/categories/${cat.id}`);
      toast.success("Kategorie smazána");
      load();
    } catch {
      toast.error("Nepodařilo se smazat");
    }
  }

  const FormPanel = () => (
    <div className="glass rounded-2xl p-4 space-y-4">
      <h2 className="font-bold text-white">{editing ? "Upravit kategorii" : "Nová kategorie"}</h2>

      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">Název</label>
        <input
          className="input-dark"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Název kategorie"
          autoFocus
        />
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">Ikona</label>
        <div className="grid grid-cols-8 gap-2">
          {PRESET_ICONS.map((icon) => (
            <button
              key={icon}
              onClick={() => setForm((f) => ({ ...f, icon }))}
              className={`text-xl p-1.5 rounded-xl transition-all ${
                form.icon === icon ? "bg-indigo-500/30 ring-2 ring-indigo-500/50" : "bg-slate-700/40 hover:bg-slate-700"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">Barva</label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setForm((f) => ({ ...f, color }))}
              className={`w-8 h-8 rounded-full transition-all ${
                form.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110" : ""
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Náhled:</span>
        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: form.color + "33", color: form.color }}>
          {form.icon} {form.name || "Kategorie"}
        </span>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} className="btn-primary flex-1">Uložit</button>
        <button onClick={cancel} className="flex-1 py-2.5 rounded-xl bg-slate-700/50 text-slate-300 font-semibold text-sm active:scale-95 transition-all">
          Zrušit
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-white text-lg px-1">Kategorie</h1>
        {!creating && !editing && (
          <button onClick={startCreate} className="btn-primary text-sm px-4 py-2">
            + Nová
          </button>
        )}
      </div>

      {(creating || editing) && <FormPanel />}

      {categories.length === 0 && !creating ? (
        <div className="glass rounded-2xl py-12 text-center text-slate-500">
          <div className="text-4xl mb-2">🏷️</div>
          <p className="text-sm">Zatím žádné kategorie</p>
          <button onClick={startCreate} className="mt-4 text-indigo-400 text-sm font-medium">
            Vytvořit první kategorii
          </button>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <ul className="divide-y divide-white/5">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center gap-3 p-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-lg"
                  style={{ backgroundColor: cat.color + "22", border: `1px solid ${cat.color}44` }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{cat.name}</p>
                  <div className="w-16 h-1 rounded-full mt-1" style={{ backgroundColor: cat.color }} />
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => startEdit(cat)}
                    className="w-8 h-8 rounded-xl bg-slate-700/50 text-slate-300 text-sm flex items-center justify-center active:scale-90 transition-all"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 text-sm flex items-center justify-center active:scale-90 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
