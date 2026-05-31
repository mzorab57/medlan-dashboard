# medlan-dashboard (Frontend)

React (Vite) dashboard frontend only.

## Separation Rules

- This repository contains frontend code only.
- Do not add or link any PHP/backend code into this repo.
- Backend is a separate project and lives only at:
  - `/Applications/XAMPP/xamppfiles/htdocs/medlan-backend`

## API Config

Set the backend base URL via:
- `.env.development` → `VITE_API_BASE_URL=http://localhost/medlan-backend/public`

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run build`
