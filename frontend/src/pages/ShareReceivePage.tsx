import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";

const CATEGORIES = ["Domácnost", "Nábytek", "Elektro", "Koupelna", "Potraviny", "Drogerie", "Ostatní"];

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function ShareReceivePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const sharedUrl = params.get("url") || params.get("text") || "";
  const sharedTitle = params.get("title") || "";

  const [name, setName] = useState(sharedTitle);
  const [category, setCategory] = useState("Domácnost");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // If text contains a URL but no url param, extract it
    const text = params.get("text") || "";
    if (!params.get("url") && text.startsWith("http")) {
      // text itself is the url
    }
  }, [params]);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Zadej název položky");
      return;
    }
    setSaving(true);
    try {
      await api.post("/shopping", {
        name: name.trim(),
        quantity: quantity.trim(),
        category_name: category,
        url: sharedUrl,
      });
      toast.success("Přidáno do nákupního seznamu!");
      setTimeout(() => navigate("/app/shopping"), 800);
    } catch {
      toast.error("Nepodařilo se uložit");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col max-w-lg mx-auto px-4 pt-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center text-lg active:scale-90 transition-all"
        >
          ‹
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Přidat do seznamu</h1>
          <p className="text-slate-400 text-xs mt-0.5">Sdílená položka z prohlížeče</p>
        </div>
      </div>

      {/* Shared URL card */}
      {sharedUrl && (
        <div className="glass rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-lg shrink-0">
            🔗
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-0.5">Odkaz na produkt</p>
            <p className="text-white text-sm font-medium truncate">{extractDomain(sharedUrl)}</p>
            <p className="text-slate-500 text-xs truncate">{sharedUrl}</p>
          </div>
          <a
            href={sharedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-slate-700/50 text-slate-400 flex items-center justify-center text-sm shrink-0 active:scale-90 transition-all"
          >
            ↗
          </a>
        </div>
      )}

      <div className="space-y-3">
        {/* Name */}
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Název položky</label>
          <input
            className="input-dark"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Např. Pohovka, Lednice..."
            autoFocus
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-slate-400 font-medium mb-2 block">Kategorie</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  category === cat
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "border-white/10 text-slate-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Množství / poznámka (volitelné)</label>
          <input
            className="input-dark"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Např. 2 ks, velikost L..."
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full mt-2"
        >
          {saving ? "Ukládám..." : "Přidat do nákupního seznamu"}
        </button>

        <button
          onClick={() => navigate("/app/shopping")}
          className="w-full py-2.5 rounded-xl bg-slate-700/50 text-slate-300 font-semibold text-sm active:scale-95 transition-all"
        >
          Zrušit
        </button>
      </div>
    </div>
  );
}
