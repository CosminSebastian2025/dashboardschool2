# Setup Database PostgreSQL

## 1. Crea il file .env.local nella root del progetto

```bash
# .env.local
DATABASE_URL="postgresql://postgres:2026@localhost:5432/postgres"
```

## 2. Sostituisci i valori con i tuoi:

- `username`: il tuo utente PostgreSQL
- `password`: la tua password PostgreSQL
- `localhost:5432`: host e porta del tuo database
- `dashboardschool`: nome del database

## 3. Esempi di configurazione:

### Database locale:

```
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/dashboardschool"
```

### Database remoto (es. Supabase, Railway, etc.):

```
DATABASE_URL="postgresql://user:pass@db.xyz.supabase.co:5432/postgres?sslmode=require"
```

## 4. Testa la connessione

Dopo aver creato il file .env.local, avvia l'app:

```bash
npm run dev
```

Il database verrà inizializzato automaticamente al primo avvio.

