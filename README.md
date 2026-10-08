# Tellimuste jälgija

Väike Next.js rakendus, kuhu saab lisada oma kuutellimused (Spotify, Netflix, jõusaal jne), näha neid ühes nimekirjas, kustutada lõpetatud tellimusi ja näha kogusummat kuus ja aastas.

## Käivitamine

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Ava http://localhost:3000

Enne PR-i avamist peavad läbima:

```bash
npm run lint
npm run build
```

## Tehnoloogiad

- Next.js (App Router), JavaScript
- React (`useState`, `fetch`) frontendis
- Next.js Route Handlers backendis (`app/api/...`)
- Supabase (PostgreSQL) andmebaasina
- Tavaline CSS (`app/globals.css`)

## Rollid ja failid

Igaüks töötab peamiselt oma failides, siis tekib vähem merge-konflikte.

| Roll | Nimi | Failid |
|---|---|---|
| Frontend | | `app/components/*`, `app/page.js`, `app/globals.css` |
| Backend | | `app/api/subscriptions/route.js`, `app/api/subscriptions/[id]/route.js` |
| Andmebaas ja integratsioon | | `supabase/schema.sql`, `lib/supabase.js` (tuleb luua), `.env.example` |
| Testimine (kui on 4. liige) | | `tests/*` (tuleb luua) |

## API leping

Kõik osad lähtuvad sellest. Kui leping muutub, uuenda seda README-d samas PR-is.

Tellimuse kuju:

```json
{
  "id": 1,
  "name": "Spotify",
  "monthly_price": 9.99,
  "billing_day": 15,
  "created_at": "2026-10-08T10:00:00Z"
}
```

| Meetod | URL | Keha | Edu | Viga |
|---|---|---|---|---|
| GET | `/api/subscriptions` | – | `200` tellimuste massiiv | `500 { "error": "..." }` |
| POST | `/api/subscriptions` | `{ "name", "monthly_price", "billing_day" }` | `201` loodud tellimus | `400` vigane keha, `500` andmebaasi viga |
| DELETE | `/api/subscriptions/:id` | – | `204` ilma kehata | `400` vigane id, `404` ei leitud, `500` andmebaasi viga |

Kõik vead on kujul `{ "error": "..." }`.

Valideerimine serveris:

- `name`: tekst, pärast trimmimist 1–80 märki
- `monthly_price`: number (või numbriline string, nt `"9.99"`), suurem kui 0 ja väiksem kui 100000000
- `billing_day`: täisarv 1–31 (või numbriline string, nt `"15"`)

## Supabase'i seadistamine (teeb üks inimene)

1. Loo projekt aadressil https://supabase.com
2. Ava **SQL Editor**, kleebi sinna faili `supabase/schema.sql` sisu ja vajuta **Run**. See loob tabeli, RLS-reeglid ja 3 näidistellimust.
3. Ava **Project Settings → API Keys** (ja **Data API** URL-i jaoks) ning kopeeri:
   - Project URL
   - Publishable key (`sb_publishable_...`)
4. Saada need tiimile **privaatselt** (mitte Giti, mitte avalikku chati).

## Iga tiimiliikme `.env.local`

Kopeeri `.env.example` nimega `.env.local` ja pane sinna päris väärtused:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
```

Pärast `.env.local` muutmist taaskäivita `npm run dev`. Kui kõik töötab, näitab avaleht 3 näidistellimust ja http://localhost:3000/api/subscriptions tagastab JSON-i.

Võtmeid kasutatakse ainult serveris (`lib/supabase.js`, route handlerid), mitte brauseris. RLS on sisse lülitatud; praegu on lugemine, lisamine ja kustutamine lubatud kõigile, sest sisselogimist pole. Kui lisandub login, tuleb reeglid muuta omaniku-põhiseks.

## Git töövoog

1. Uuenda `main`:
   ```bash
   git switch main
   git pull origin main
   ```
2. Tee oma haru:
   ```bash
   git switch -c feat/frontend-form
   ```
   Nimed: `feat/frontend-...`, `feat/api-...`, `feat/db-...`, `test/...`, `fix/...`
3. Tee väikesed commitid:
   ```bash
   git add <failid>
   git commit -m "feat: add subscription form"
   git push -u origin feat/frontend-form
   ```
4. Ava GitHubis pull request `main`-i. Kirjelda, mida muutsid, miks ja kuidas testisid.
5. Üks tiimikaaslane vaatab PR-i üle ja kommenteerib.
6. Pärast heakskiitu merge'i PR ja uuenda kõik oma `main`:
   ```bash
   git switch main
   git pull origin main
   ```
7. Kui sinu haru on vana, too `main`-i muudatused sisse:
   ```bash
   git fetch origin
   git merge origin/main
   ```

Reeglid:

- Otse `main`-i ei commiti keegi.
- Üks PR = üks asi.
- `.env.local` ei lähe kunagi Giti.

## Demo eesmärk

- Tellimuse lisamine ja kustutamine töötab
- Kogusumma kuus ja aastas uueneb
- Andmed on alles ka pärast lehe värskendamist
