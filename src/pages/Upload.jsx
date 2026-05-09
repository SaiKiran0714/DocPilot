import { useState } from 'react';
import { Card } from '../components/Card.jsx';
import { UploadForm } from '../components/UploadForm.jsx';
import { LetterCard } from '../components/LetterCard.jsx';
import { Button } from '../components/Button.jsx';

export function UploadPage() {
  const [latestCreatedLetter, setLatestCreatedLetter] = useState(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(420px,1.2fr)]">
      <Card>
        {latestCreatedLetter ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-ink">Uploaded image</h2>
                <p className="mt-2 text-sm text-zinc-400">{latestCreatedLetter.original_file_name}</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setLatestCreatedLetter(null)}>
                Upload another
              </Button>
            </div>
            <div className="mt-5 rounded-lg border border-white/10 bg-panel p-3">
              <img
                src={latestCreatedLetter.image_data_url}
                alt="Uploaded letter"
                className="max-h-[520px] w-full rounded-md object-contain"
              />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-ink">Analyze a new letter</h2>
            <p className="mt-2 text-sm text-zinc-400">The backend extracts full text, translates German to English, and builds a categorized overview.</p>
            <div className="mt-5">
              <UploadForm onUploadComplete={setLatestCreatedLetter} />
            </div>
          </>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-ink">Latest result</h2>
        <div className="mt-5">
          {latestCreatedLetter ? (
            <LetterCard letter={latestCreatedLetter} showFullExtractedText showOverview />
          ) : (
            <p className="rounded-md border border-white/10 bg-panel p-4 text-sm text-zinc-400">No letter analyzed in this session yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
