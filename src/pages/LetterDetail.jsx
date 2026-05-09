import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { LetterCard } from '../components/LetterCard.jsx';

export function LetterDetailPage({ letter, onBack }) {
  if (!letter) {
    return (
      <Card>
        <p className="text-sm text-zinc-400">No letter selected.</p>
        <Button type="button" variant="secondary" className="mt-4" onClick={onBack}>
          <ArrowLeft aria-hidden="true" size={18} />
          Back home
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="secondary" onClick={onBack}>
        <ArrowLeft aria-hidden="true" size={18} />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(420px,1.2fr)]">
        <Card>
          <h2 className="text-xl font-semibold text-ink">Uploaded image</h2>
          <p className="mt-2 text-sm text-zinc-400">{letter.original_file_name}</p>
          <div className="mt-5 rounded-lg border border-white/10 bg-panel p-3">
            {letter.image_data_url ? (
              <img
                src={letter.image_data_url}
                alt={letter.provider || 'Uploaded letter'}
                className="max-h-[520px] w-full rounded-md object-contain"
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center rounded-md text-sm text-zinc-500">
                No image saved
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-ink">Letter details</h2>
          <div className="mt-5">
            <LetterCard letter={letter} showFullExtractedText showOverview />
          </div>
        </Card>
      </div>
    </div>
  );
}
