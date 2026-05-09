# Deployment

This app can deploy as one Node web service. Express serves the API routes and the built React app from `dist`.

## Render

1. Push this project to GitHub.
2. In Render, create a new Blueprint or Web Service from the repo.
3. Use this build command:

```bash
npm install && npm run build
```

4. Use this start command:

```bash
npm start
```

5. Set these environment variables:

```env
NODE_ENV=production
SERVER_PORT=10000
CLIENT_ORIGIN=https://your-render-app.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash
```

6. In Supabase Auth settings, add the deployed URL as an allowed site/redirect URL.

## Notes

- `VITE_*` values are baked into the frontend during `npm run build`.
- `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` are backend-only secrets.
- Uploaded images are currently saved as data URLs in the database. For production scale, use Supabase Storage.
