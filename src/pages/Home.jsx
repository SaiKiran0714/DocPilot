import { Card } from '../components/Card.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { useLetters } from '../hooks/useLetters.js';

export function HomePage({ onOpenLetter }) {
  const { letters, isLoadingLetters, lettersErrorMessage } = useLetters();
  const upcomingReminderEvents = buildUpcomingReminderEvents(letters);
  const highPriorityActions = buildHighPriorityActions(letters);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        {lettersErrorMessage && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {lettersErrorMessage}
          </p>
        )}

        {isLoadingLetters ? (
          <LoadingSpinner label="Loading your letters" />
        ) : letters.length === 0 ? (
          <p className="rounded-md border border-white/10 bg-surface p-5 text-sm text-zinc-400">No letters uploaded yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {letters.map((letter) => (
              <HomeLetterCard key={letter.id} letter={letter} onOpenLetter={onOpenLetter} />
            ))}
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <ReminderSettings />
        <UpcomingActionsPanel
          upcomingReminderEvents={upcomingReminderEvents}
          highPriorityActions={highPriorityActions}
          onOpenLetter={onOpenLetter}
        />
      </aside>
    </div>
  );
}

function HomeLetterCard({ letter, onOpenLetter }) {
  const previewText = letter.ai_overview || letter.translated_text || letter.extracted_text || 'No extracted text available.';

  return (
    <article
      className="cursor-pointer rounded-lg border border-white/10 bg-surface p-3 shadow-sm shadow-black/20 transition hover:-translate-y-0.5 hover:border-civic hover:shadow-lg hover:shadow-black/30"
      role="button"
      tabIndex={0}
      onClick={() => onOpenLetter?.(letter)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenLetter?.(letter);
        }
      }}
    >
      <div className="aspect-square w-full overflow-hidden rounded-md bg-panel">
        {letter.image_data_url ? (
          <img
            src={letter.image_data_url}
            alt={letter.provider || 'Uploaded letter'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-zinc-500">
            No image
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="truncate text-sm font-semibold text-ink">{letter.provider || 'Unknown company'}</h3>
        <p className="mt-1 text-xs font-medium text-zinc-400">{letter.category} - {letter.urgency_level}</p>
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-300">{previewText}</p>
      </div>
    </article>
  );
}

function ReminderSettings() {
  const reminderEmail = window.localStorage.getItem('reminderEmail') || '';
  const reminderPhone = window.localStorage.getItem('reminderPhone') || '';

  function handleReminderSettingsSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    window.localStorage.setItem('reminderEmail', formData.get('reminderEmail') || '');
    window.localStorage.setItem('reminderPhone', formData.get('reminderPhone') || '');
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-ink">Reminder contacts</h2>
      <form className="mt-4 space-y-3" onSubmit={handleReminderSettingsSubmit}>
        <div>
          <label className="block text-sm font-semibold text-zinc-100" htmlFor="reminderEmail">Email</label>
          <input
            id="reminderEmail"
            name="reminderEmail"
            type="email"
            defaultValue={reminderEmail}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-md border border-white/10 bg-panel px-3 py-2 text-sm text-zinc-100 outline-none focus:border-civic"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-100" htmlFor="reminderPhone">Phone</label>
          <input
            id="reminderPhone"
            name="reminderPhone"
            type="tel"
            defaultValue={reminderPhone}
            placeholder="+491234567890"
            className="mt-1 w-full rounded-md border border-white/10 bg-panel px-3 py-2 text-sm text-zinc-100 outline-none focus:border-civic"
          />
        </div>
        <button type="submit" className="rounded-md bg-civic px-3 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-200">
          Save contacts
        </button>
      </form>
    </Card>
  );
}

function UpcomingActionsPanel({ upcomingReminderEvents, highPriorityActions, onOpenLetter }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-ink">Upcoming actions</h2>
      <div className="mt-4 space-y-4">
        {highPriorityActions.length === 0 && upcomingReminderEvents.length === 0 ? (
          <p className="text-sm text-zinc-400">No urgent actions or dated reminders found yet.</p>
        ) : (
          <>
            {highPriorityActions.map((action) => (
              <ActionItem key={`priority-${action.letter.id}`} action={action} onOpenLetter={onOpenLetter} />
            ))}
            {upcomingReminderEvents.slice(0, 6).map((event) => (
              <ActionItem key={event.id} action={event} onOpenLetter={onOpenLetter} />
            ))}
          </>
        )}
      </div>
    </Card>
  );
}

function ActionItem({ action, onOpenLetter }) {
  const reminderEmail = window.localStorage.getItem('reminderEmail') || '';
  const reminderPhone = window.localStorage.getItem('reminderPhone') || '';
  const reminderSubject = encodeURIComponent(`Reminder: ${action.provider}`);
  const reminderBody = encodeURIComponent(`${action.label}\nProvider: ${action.provider}\nDate: ${formatDate(action.date)}\n\n${action.summary}`);
  const emailHref = reminderEmail ? `mailto:${reminderEmail}?subject=${reminderSubject}&body=${reminderBody}` : '';
  const smsHref = reminderPhone ? `sms:${reminderPhone}?&body=${reminderBody}` : '';

  return (
    <div className="rounded-md border border-white/10 bg-panel/60 p-3">
      <button
        type="button"
        onClick={() => onOpenLetter?.(action.letter)}
        className="block w-full text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">{action.provider}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            action.urgency === 'High' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {action.urgency}
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-zinc-400">{formatDate(action.date)}</p>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-300">{action.summary}</p>
      </button>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={emailHref || undefined}
          className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${emailHref ? 'bg-white/10 text-zinc-200 hover:bg-white/15' : 'bg-white/5 text-zinc-500'}`}
        >
          Email reminder
        </a>
        <a
          href={smsHref || undefined}
          className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${smsHref ? 'bg-white/10 text-zinc-200 hover:bg-white/15' : 'bg-white/5 text-zinc-500'}`}
        >
          SMS reminder
        </a>
      </div>
    </div>
  );
}

function buildUpcomingReminderEvents(letters) {
  const now = startOfDay(new Date());

  return letters
    .flatMap((letter) => {
      if (!Array.isArray(letter.key_dates)) {
        return [];
      }

      return letter.key_dates
        .map((keyDate, index) => {
          const date = parseReminderDate(keyDate.date);

          if (!date || date < now) {
            return null;
          }

          return {
            id: `${letter.id}-${index}`,
            letter,
            provider: letter.provider || 'Unknown provider',
            label: keyDate.label || 'Reminder',
            date,
            urgency: letter.urgency_level || 'Medium',
            summary: letter.ai_overview || letter.extracted_text || 'Reminder from uploaded letter.'
          };
        })
        .filter(Boolean);
    })
    .sort((firstEvent, secondEvent) => firstEvent.date - secondEvent.date);
}

function buildHighPriorityActions(letters) {
  return letters
    .filter((letter) => letter.urgency_level === 'High')
    .map((letter) => ({
      id: `priority-${letter.id}`,
      letter,
      provider: letter.provider || 'Unknown provider',
      label: 'High priority action',
      date: parseReminderDate(letter.key_dates?.[0]?.date) || new Date(letter.created_at),
      urgency: 'High',
      summary: letter.ai_overview || letter.extracted_text || 'High priority letter needs attention.'
    }));
}

function parseReminderDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(date) {
  if (!date) {
    return 'No date';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
