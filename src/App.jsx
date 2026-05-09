import { useState } from 'react';
import { FileSearch, Home, UploadCloud } from 'lucide-react';
import { HomePage } from './pages/Home.jsx';
import { UploadPage } from './pages/Upload.jsx';
import { SearchPage } from './pages/Search.jsx';
import { LetterDetailPage } from './pages/LetterDetail.jsx';
import { AuthForm } from './components/AuthForm.jsx';
import { Button } from './components/Button.jsx';
import { LoadingSpinner } from './components/LoadingSpinner.jsx';
import { useAuthSession } from './hooks/useAuthSession.js';
import { supabase } from './services/supabaseClient.js';

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'upload', label: 'Upload', icon: UploadCloud },
  { id: 'search', label: 'Search', icon: FileSearch }
];

export function App() {
  const [activePageId, setActivePageId] = useState('home');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const { session, isLoadingSession, isSignedIn } = useAuthSession();

  const ActivePage = {
    home: HomePage,
    upload: UploadPage,
    search: SearchPage,
    detail: LetterDetailPage
  }[activePageId];

  async function handleSignOut() {
    console.log('[App] Signing out user.');
    await supabase?.auth.signOut();
  }

  function handleNavigateToPage(pageId) {
    if (pageId !== 'detail') {
      setSelectedLetter(null);
    }

    setActivePageId(pageId);
  }

  function handleOpenLetter(letter) {
    setSelectedLetter(letter);
    setActivePageId('detail');
  }

  function handleBackHome() {
    setSelectedLetter(null);
    setActivePageId('home');
  }

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-paper p-6">
        <LoadingSpinner label="Loading session" className="min-h-[calc(100vh-3rem)]" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-white/10 bg-panel">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Docpilot</h1>
            <p className="text-sm text-zinc-400">{session.user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex gap-2" aria-label="Primary">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activePageId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigateToPage(item.id)}
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                      isActive
                      ? 'bg-civic text-neutral-950'
                      : 'bg-white/10 text-zinc-200 hover:bg-white/15'
                    }`}
                  >
                    <Icon aria-hidden="true" size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <Button type="button" variant="secondary" onClick={handleSignOut}>Sign out</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ActivePage
          session={session}
          letter={selectedLetter}
          onBack={handleBackHome}
          onOpenLetter={handleOpenLetter}
        />
      </main>
    </div>
  );
}
