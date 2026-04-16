# 🏐 Green Volley 3×3 — Tangher Fest 2026

Sito di iscrizione al torneo di Green Volley 3×3 della Tangher Fest, Segonzano (TN).

## Stack
- **React 18** + **Vite**
- **CSS Modules**
- **Supabase** (DB + Storage)

## Struttura

```
src/
├── components/
│   ├── Hero.jsx / .module.css
│   ├── Navbar.jsx / .module.css
│   ├── SlotBar.jsx / .module.css
│   ├── PlayerCard.jsx / .module.css
│   ├── FormPage.jsx / .module.css
│   ├── InfoPage.jsx / .module.css
│   ├── SquadrePage.jsx / .module.css
│   └── Footer.jsx / .module.css
├── lib/
│   ├── constants.js   ← categorie, limiti posti
│   ├── db.js          ← chiamate Supabase (con fallback localStorage)
│   ├── helpers.js     ← genId, initForm, formatDate
│   ├── supabase.js    ← client Supabase
│   └── validators.js  ← validazione form e file
├── styles/
│   └── global.css
├── App.jsx
└── main.jsx
```

## Avvio locale

```bash
npm install
cp .env.example .env   # poi inserisci le chiavi Supabase
npm run dev
```

## Configurare Supabase

1. Crea un progetto su [supabase.com](https://supabase.com)
2. Nel SQL Editor esegui:

```sql
create table squadre (
  id           text primary key,
  nome_squadra text not null,
  referente    text not null,
  email        text not null,
  telefono     text not null,
  tipo         text not null check (tipo in ('tesserata','libera')),
  giocatori    jsonb not null,
  creato_il    timestamptz default now()
);

-- Tutti possono inserire (iscrizione pubblica)
alter table squadre enable row level security;
create policy "insert pubblico" on squadre for insert with check (true);
create policy "lettura pubblica" on squadre for select using (true);

-- Storage per documenti
insert into storage.buckets (id, name, public)
values ('volley-docs', 'volley-docs', false);

create policy "upload pubblico" on storage.objects
  for insert with check (bucket_id = 'volley-docs');
```

3. Copia `Project URL` e `anon key` da **Settings → API**
4. Incollali nel file `.env`
5. In `src/lib/db.js` decommenta le chiamate Supabase e rimuovi il blocco localStorage

## Deploy

**Netlify:** `npm run build` → trascina la cartella `dist/` su netlify.com/drop

**Vercel:** `npx vercel --prod` (poi aggiungi le env vars nel pannello)
