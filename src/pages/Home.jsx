import { Card } from '../components/Card.jsx';
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
          <p className="text-sm text-slate-500">Loading your letters...</p>
        ) : letters.length === 0 ? (
          <p className="rounded-md bg-white p-5 text-sm text-slate-500">No letters uploaded yet.</p>
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
      className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-civic hover:shadow-md"
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
      <div className="aspect-square w-full overflow-hidden rounded-md bg-slate-100">
        {letter.image_data_url ? (
          <img
            src={letter.image_data_url}
            alt={letter.provider || 'Uploaded letter'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-slate-400">
            No image
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="truncate text-sm font-semibold text-ink">{letter.provider || 'Unknown company'}</h3>
        <p className="mt-1 text-xs font-medium text-slate-500">{letter.category} · {letter.urgency_level}</p>
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">{previewText}</p>
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
          <label className="block text-sm font-semibold text-slate-800" htmlFor="reminderEmail">Email</label>
          <input
            id="reminderEmail"
            name="reminderEmail"
            type="email"
            defaultValue={reminderEmail}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-civic"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="reminderPhone">Phone</label>
          <input
            id="reminderPhone"
            name="reminderPhone"
            type="tel"
            defaultValue={reminderPhone}
            placeholder="+491234567890"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-civic"
          />
        </div>
        <button type="submit" className="rounded-md bg-civic px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800">
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
          <p className="text-sm text-slate-500">No urgent actions or dated reminders found yet.</p>
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
    <div className="rounded-md border border-slate-200 p-3">
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
        <p className="mt-1 text-xs font-medium text-slate-500">{formatDate(action.date)}</p>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{action.summary}</p>
      </button>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={emailHref || undefined}
          className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${emailHref ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-50 text-slate-400'}`}
        >
          Email reminder
        </a>
        <a
          href={smsHref || undefined}
          className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${smsHref ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-50 text-slate-400'}`}
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
