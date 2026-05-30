# HomeCalendar – pokyny pro Claude

## Pracovní postup
- Před jakoukoli změnou architektury, tech stacku nebo nasazení se vždy zeptej na alternativy a počkej na schválení.
- Pokud existuje více možností (backend, hosting, databáze apod.), nejdříve je přehledně vypiš a nechej uživatele vybrat.

## Přístup přes mobil
- Uživatel může pracovat pouze přes mobilní zařízení – preferuj proto jednodušší, přehledná řešení.
- Vyhýbej se krokům, které vyžadují složité příkazy v terminálu nebo IDE.
- Pokud je potřeba ruční krok (např. nastavení Secrets, vytvoření projektu), uveď ho stručně jako seznam bodů.

---

## Architektura nasazení

| Vrstva    | Služba             | Tier  |
|-----------|--------------------|-------|
| Frontend  | Cloudflare Pages   | Free  |
| Backend   | Render.com         | Free  |
| Databáze  | Supabase (PostgreSQL) | Free |

---

## Jednorázové nastavení (vše přes mobil / prohlížeč)

### 1. Supabase – databáze
1. Jít na [supabase.com](https://supabase.com) → **Start your project**
2. Vytvořit projekt (libovolný název, zvolit region EU)
3. **Settings → Database → Connection string → URI** → zkopírovat

### 2. Render.com – backend
1. Jít na [render.com](https://render.com) → přihlásit přes GitHub
2. **New → Web Service** → vybrat repo `dahor212/homecalendar`
3. Render automaticky najde `render.yaml` a nabídne nastavení
4. Přidat Environment Variable:
   - `DATABASE_URL` = connection string z Supabase
5. Kliknout **Deploy** → po dokončení zkopírovat URL (např. `https://homecalendar-backend.onrender.com`)

### 3. GitHub Secrets – pro automatický deploy
Jít na GitHub → repo → **Settings → Secrets → Actions** → přidat:
- `VITE_API_URL` = URL Render backendu (z kroku 2)
- `CLOUDFLARE_API_TOKEN` = token z Cloudflare Dashboard → My Profile → API Tokens
- `CLOUDFLARE_ACCOUNT_ID` = z Cloudflare Dashboard → pravý sloupec

### 4. Cloudflare Pages – frontend
1. Jít na [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create**
2. **Connect to Git** → vybrat repo `dahor212/homecalendar`
3. Nastavení buildu:
   - Build command: `cd frontend && npm ci && npm run build`
   - Build output: `frontend/dist`
4. Environment variable: `VITE_API_URL` = URL Render backendu
5. **Save and Deploy**

Po těchto krocích každý push na `main` automaticky nasadí frontend i backend.
