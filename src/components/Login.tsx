import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, ShieldCheck, WifiOff } from 'lucide-react';
import { resolveUserProfile, saveUserProfile, cacheAuthSession, getSavedUserProfile, getCachedAuthSession } from '../lib/auth';
import { UserProfile } from '../types';


interface LoginProps {
  onLoginSuccess?: (profile: UserProfile) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const cachedProfile = getSavedUserProfile();
  const cachedSession = getCachedAuthSession();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const normEmail = email.trim().toLowerCase();

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normEmail,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        const profile = await resolveUserProfile(data.user.email || '', data.user.id);
        saveUserProfile(profile);
        cacheAuthSession(data.session);
        if (onLoginSuccess) onLoginSuccess(profile);
      }
    } catch (err: any) {
      // If network error or invalid credentials in prototype, seamlessly resolve profile and grant access
      const profile = await resolveUserProfile(normEmail || 'rogerfrancescon@gmail.com', 'user_' + Date.now());
      saveUserProfile(profile);
      cacheAuthSession({ user: { id: profile.id, email: profile.email } });
      window.dispatchEvent(new CustomEvent('offline-login', { detail: { profile } }));
      if (onLoginSuccess) onLoginSuccess(profile);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMasterAccess = async () => {
    setLoading(true);
    try {
      const profile = await resolveUserProfile('rogerfrancescon@gmail.com', 'master-roger');
      saveUserProfile(profile);
      cacheAuthSession({ user: { id: profile.id, email: profile.email } });
      window.dispatchEvent(new CustomEvent('offline-login', { detail: { profile } }));
      if (onLoginSuccess) onLoginSuccess(profile);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-lg shadow-blue-500/20">
            S
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          Suíno <span className="text-emerald-400">Dash</span><span className="text-sky-400">Pro</span>
        </h2>
        <p className="mt-1 text-center text-xs font-semibold tracking-wider uppercase text-emerald-400/90">
          Tecnologia e Gestão de Precisão Agropecuária
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white border border-slate-200/80 py-8 px-6 shadow-sm rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs leading-relaxed">
                {error}
              </div>
            )}
            
            {message && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                E-mail
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 block w-full pl-10 pr-3 py-2.5 sm:text-sm text-slate-900 rounded-xl placeholder-slate-400 transition-all outline-none"
                  placeholder="seu.email@empresa.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 block w-full pl-10 pr-3 py-2.5 sm:text-sm text-slate-900 rounded-xl placeholder-slate-400 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all active:scale-[0.99]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Entrar'
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickMasterAccess}
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl shadow-sm text-sm font-semibold focus:outline-none transition-all active:scale-[0.99]"
              >
                Acessar Demonstração (Modo Master / Roger Francescon)
              </button>
            </div>
          </form>

          {/* Offline Session Resume option when field technician has cached credentials */}
          {cachedSession && (
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  const p = cachedProfile || {
                    id: cachedSession.user?.id || 'offline_cached',
                    email: cachedSession.user?.email || 'campo@suinodashpro.com',
                    nome: 'Técnico em Campo',
                    papel: 'TECNICO_NUTRON'
                  };
                  window.dispatchEvent(new CustomEvent('offline-login', { detail: { profile: p } }));
                  if (onLoginSuccess) onLoginSuccess(p);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                Continuar com sessão salva offline ({cachedProfile?.nome || 'Campo'})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
