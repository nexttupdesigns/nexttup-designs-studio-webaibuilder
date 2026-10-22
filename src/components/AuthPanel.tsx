import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

interface AuthPanelProps {
  client: SupabaseClient | null;
}

export function AuthPanel({ client }: AuthPanelProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (!client) {
    return (
      <main className="min-h-screen bg-ink-900 px-5 py-16 text-slate-200">
        <section className="glass mx-auto max-w-lg rounded-2xl p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-electric-400">Setup required</p>
          <h1 className="mt-3 font-display text-2xl font-bold text-white">Connect Supabase to continue</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to this app’s environment,
            then apply the private-projects migration and enable email sign-in in Supabase.
          </p>
          <p className="mt-3 text-xs text-slate-500">No project data is loaded or saved until the connection is configured.</p>
        </section>
      </main>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    try {
      if (mode === 'sign-in') {
        const { error: authError } = await client.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else {
        const { data, error: authError } = await client.auth.signUp({ email, password });
        if (authError) throw authError;
        if (!data.session) {
          setNotice('Account created. Check your email to confirm your address, then sign in.');
        }
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-ink-900 px-5 py-16 text-slate-200">
      <section className="glass mx-auto max-w-lg rounded-2xl p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-electric-400">Next Up Design Studio</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-white">
          {mode === 'sign-in' ? 'Sign in to your workspace' : 'Create your account'}
        </h1>
        <p className="mt-2 text-sm text-slate-400">Your projects are private to your account.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="auth-email" className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-electric-500/60"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-electric-500/60"
            />
            {mode === 'sign-up' && <p className="mt-1 text-[11px] text-slate-500">Use at least 8 characters.</p>}
          </div>

          {error && <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
          {notice && <p role="status" className="rounded-lg border border-electric-500/20 bg-electric-500/10 p-3 text-xs text-electric-200">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-gradient-to-r from-electric-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-50"
          >
            {busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          {mode === 'sign-in' ? 'New here?' : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
              setError('');
              setNotice('');
            }}
            className="font-medium text-electric-400 hover:text-electric-300"
          >
            {mode === 'sign-in' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </section>
    </main>
  );
}
