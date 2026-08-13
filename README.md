# nexteduwise

College discovery and counselor lead-management platform.

## Run with Docker (recommended)

```powershell
docker compose up --build
```

Open `http://localhost:8080`. The frontend, API, and MongoDB start together; the API is available internally through `/api`.

## Run locally

1. Start MongoDB: `docker compose up -d`
2. Install dependencies: `npm install`
3. Copy `apps/api/.env.example` to `apps/api/.env`
4. Start the API: `npm run dev:api`
5. Start the web app: `npm run dev:web`

The API seeds two example colleges on first startup. The retention task permanently removes student leads older than 90 days every night at 02:00.
