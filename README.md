# German Bureaucracy Buddy

A React + Vite + Tailwind CSS prototype for uploading German letters, extracting OCR text, classifying document metadata with an LLM, and saving searchable records in Supabase.

## Project Structure

- `src/components`: reusable UI components such as buttons, cards, letter cards, and the upload form
- `src/pages`: main views for home, upload, and provider search
- `src/services`: Supabase client, letter queries, and OCR API client
- `src/hooks`: letter loading and provider grouping logic
- `server`: Express API and OCR/LLM processing pipeline
- `supabase/schema.sql`: database table, indexes, and RLS policy

## Setup

1. Copy `.env.example` to `.env`.
2. Add your Supabase project URL, anon key, service role key, and OpenAI API key.
3. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor.
4. Install and run:

```bash
npm install
npm run dev:full
```

The frontend runs at `http://localhost:5173`, and the API runs at `http://localhost:8787`.

## OCR Route

The main backend route is `POST /api/letters/process` in `server/index.js`.
It accepts `letterImage`, then `server/ocr/processLetterImage.js`:

1. validates the upload and environment
2. runs Tesseract OCR
3. sends extracted text to the LLM
4. normalizes provider, category, urgency, and key dates
5. inserts the structured record into Supabase

Each step logs a descriptive message to make pipeline failures easier to trace.
