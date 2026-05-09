import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from './Button.jsx';
import { Card } from './Card.jsx';
import { supabase } from '../services/supabaseClient.js';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('sign-in');
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAuthSubmit(event) {
    event.preventDefault();

    if (!supabase) {
      setAuthError('Supabase frontend credentials are missing.');
      return;
    }

    try {
      setIsSubmitting(true);
      setAuthError('');
      setAuthMessage('');
      console.log('[AuthForm] Submitting auth mode:', authMode);

      const authResponse = authMode === 'sign-up'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (authResponse.error) {
        throw authResponse.error;
      }

      setAuthMessage(authMode === 'sign-up'
        ? 'Account created. Check your email if confirmation is enabled.'
        : 'Signed in.');
    } catch (error) {
      console.error('[AuthForm] Authentication failed:', error);
      setAuthError(error.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <h1 className="text-2xl font-semibold text-ink">Docpilot</h1>
        <p className="mt-2 text-sm text-zinc-400">Sign in to keep your uploaded letters private to your account.</p>

        <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-100" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-white/10 bg-panel px-3 py-2 text-sm text-zinc-100 outline-none focus:border-civic"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-100" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-md border border-white/10 bg-panel px-3 py-2 text-sm text-zinc-100 outline-none focus:border-civic"
            />
          </div>

          {authError && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{authError}</p>}
          {authMessage && <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{authMessage}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {authMode === 'sign-up' ? <UserPlus aria-hidden="true" size={18} /> : <LogIn aria-hidden="true" size={18} />}
            {isSubmitting ? 'Working...' : authMode === 'sign-up' ? 'Create account' : 'Sign in'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setAuthMode(authMode === 'sign-up' ? 'sign-in' : 'sign-up')}
          className="mt-4 text-sm font-semibold text-civic hover:text-emerald-200"
        >
          {authMode === 'sign-up' ? 'Already have an account? Sign in' : 'Need an account? Create one'}
        </button>
      </Card>
    </main>
  );
}
