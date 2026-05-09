import { Search } from 'lucide-react';
import { useState } from 'react';
import { LetterCard } from '../components/LetterCard.jsx';
import { Card } from '../components/Card.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { useLetters } from '../hooks/useLetters.js';

export function SearchPage() {
  const [providerFilterInput, setProviderFilterInput] = useState('');
  const {
    groupedLettersByProvider,
    isLoadingLetters,
    lettersErrorMessage
  } = useLetters(providerFilterInput);

  const providerGroups = Object.entries(groupedLettersByProvider);

  return (
    <div className="space-y-6">
      <Card>
        <label className="block text-sm font-semibold text-zinc-100" htmlFor="provider-search">
          Filter by provider
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-md border border-white/10 bg-panel px-3 py-2 focus-within:border-civic">
          <Search aria-hidden="true" size={18} className="text-zinc-500" />
          <input
            id="provider-search"
            value={providerFilterInput}
            onChange={(event) => setProviderFilterInput(event.target.value)}
            placeholder="Finanzamt, TK, Vodafone..."
            className="w-full border-0 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
        </div>
      </Card>

      {lettersErrorMessage && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {lettersErrorMessage}
        </p>
      )}

      {isLoadingLetters ? (
        <LoadingSpinner label="Loading letters" />
      ) : providerGroups.length === 0 ? (
        <p className="rounded-md border border-white/10 bg-surface p-5 text-sm text-zinc-400">No letters found for this provider filter.</p>
      ) : (
        <div className="space-y-6">
          {providerGroups.map(([providerName, providerLetters]) => (
            <section key={providerName}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">{providerName}</h2>
                <span className="text-sm text-zinc-400">{providerLetters.length} letter{providerLetters.length === 1 ? '' : 's'}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {providerLetters.map((letter) => (
                  <LetterCard key={letter.id} letter={letter} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
