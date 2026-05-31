import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import { ShoppingItem, ShoppingItemCreate } from "../types";

const DEFAULT_CATS = ["Potraviny", "Drogerie", "Domácnost", "Ostatní"];

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newCat, setNewCat] = useState("Potraviny");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await api.get<ShoppingItem[]>("/shopping");
    setItems(data);
  }

  async function toggle(item: ShoppingItem) {
    await api.put(`/shopping/${item.id}`, { checked: !item.checked });
    load();
  }

  async function addItem() {
    if (!newName.trim()) return;
    await api.post("/shopping", { name: newName.trim(), quantity: newQty.trim(), category_name: newCat });
    setNewName(""); setNewQty("");
    setShowAdd(false);
    load();
  }

  async function deleteItem(id: number) {
    await api.delete(`/shopping/${id}`);
    load();
  }

  async function clearChecked() {
    await api.delete("/shopping");
    toast.success("Odstraněny hotové položky");
    load();
  }

  const categories = [...new Set(items.map(i => i.category_name))];
  const allCats = [...new Set([...DEFAULT_CATS, ...categories])];
  const filtered = catFilter ? items.filter(i => i.category_name === catFilter) : items;
  const grouped: Record<string, ShoppingItem[]> = {};
  for (const item of filtered) {
    (grouped[item.category_name] ??= []).push(item);
  }

  const total = items.length;
  const done = items.filter(i => i.checked).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-bold text-white text-lg">Nákupní seznam</h1>
          <div className="flex gap-2">
            {done > 0 && (
              <button onClick={clearChecked} className="text-xs text-slate-400 px-3 py-1.5 rounded-xl bg-slate-700/50 font-medium active:scale-95 transition-all">
                Vymazat hotové
              </button>
            )}
            <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm px-3 py-2">
              + Přidat
            </button>
          </div>
        </div>

        {total > 0 && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-slate-400 shrink-0">{done}/{total} · {pct}%</span>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCatFilter(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${!catFilter ? "bg-indigo-600 border-indigo-500 text-white" : "border-white/10 text-slate-400"}`}
          >
            Vše
          </button>
          {[...new Set(items.map(i => i.category_name))].map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(catFilter === cat ? null : cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${catFilter === cat ? "bg-indigo-600 border-indigo-500 text-white" : "border-white/10 text-slate-400"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-white text-sm">Nová položka</h3>
          <input
            className="input-dark"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Název položky"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input-dark"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              placeholder="Množství (např. 2 l)"
            />
            <select className="input-dark" value={newCat} onChange={(e) => setNewCat(e.target.value)}>
              {allCats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="btn-primary flex-1">Přidat</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700/50 text-slate-300 font-semibold text-sm active:scale-95">Zrušit</button>
          </div>
        </div>
      )}

      {/* Items grouped */}
      {Object.keys(grouped).length === 0 ? (
        <div className="glass rounded-2xl py-12 text-center text-slate-500">
          <div className="text-4xl mb-2">🛒</div>
          <p className="text-sm">Nákupní seznam je prázdný</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="glass rounded-2xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/5">
              <h3 className="font-semibold text-slate-300 text-xs uppercase tracking-wider">{cat}</h3>
            </div>
            <ul className="divide-y divide-white/5">
              {catItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3.5">
                  <button
                    onClick={() => toggle(item)}
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                      item.checked ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-600"
                    }`}
                  >
                    {item.checked && <span className="text-xs font-bold">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${item.checked ? "line-through text-slate-500" : "text-white"}`}>
                      {item.name}
                    </p>
                    {item.quantity && (
                      <p className="text-xs text-slate-500">{item.quantity}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="shrink-0 w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-sm active:scale-90 transition-all"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
