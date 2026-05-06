import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Clock3,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  Utensils,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrandMark, StatusBadge } from './ui/AppPrimitives';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/'); // Redirect to dashboard
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              restaurant_name: restaurantName,
            }
          }
        });
        if (error) throw error;
        setSuccess('Cadastro realizado com sucesso. Voce ja pode fazer login.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  return (
    <main className="min-h-screen overflow-hidden bg-surface text-on-surface dark:bg-slate-950 dark:text-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(234,29,44,0.34),transparent_32%),radial-gradient(circle_at_70%_45%,rgba(255,184,0,0.16),transparent_30%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0)_45%)]" />

          <div className="relative z-10">
            <BrandMark name="Comanda Pro" className="[&_p:first-of-type]:text-white" />
          </div>

          <div className="relative z-10 max-w-xl">
            <StatusBadge tone="primary" className="mb-6 bg-white/10 text-white ring-white/20">
              Plataforma SaaS para restaurantes
            </StatusBadge>
            <h1 className="font-display text-5xl font-black leading-tight tracking-normal">
              Operacao de mesa, cozinha e caixa em um painel unico.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              Entre para acompanhar pedidos em tempo real, organizar mesas, receber comandas e manter o restaurante rodando com clareza.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                { icon: Utensils, label: 'Pedidos QR' },
                { icon: ChefHat, label: 'KDS ativo' },
                { icon: ShieldCheck, label: 'SaaS seguro' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <Icon className="h-5 w-5 text-primary-300" />
                  <p className="mt-3 text-sm font-bold text-white">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-sm text-slate-400">
            <Clock3 className="h-4 w-4 text-primary-300" />
            Sincronizado para rotinas de atendimento em tempo real
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <BrandMark name="Comanda Pro" />
            </div>

            <div className="app-card overflow-hidden rounded-xl">
              <div className="border-b border-slate-100 bg-white px-6 py-7 text-center dark:border-slate-800 dark:bg-slate-900 sm:px-8">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 dark:bg-primary-950/40 dark:text-primary-200 dark:ring-primary-900">
                  <Store className="h-8 w-8" />
                </div>
                <h2 className="font-display text-2xl font-black text-slate-950 dark:text-white">
                  {isLogin ? 'Acesse o painel' : 'Crie sua conta'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {isLogin
                    ? 'Use suas credenciais para entrar no COMANDA PRO.'
                    : 'Cadastre o restaurante para iniciar a configuracao.'}
                </p>
              </div>

              <div className="px-6 py-6 sm:px-8">
                <div className="space-y-3" aria-live="polite">
                  {error && (
                    <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleAuth} className="mt-6 space-y-4">
                  {!isLogin && (
                    <div>
                      <label htmlFor="restaurant-name" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                        Nome do restaurante
                      </label>
                      <div className="relative">
                        <Store className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="restaurant-name"
                          type="text"
                          required
                          value={restaurantName}
                          onChange={(e) => setRestaurantName(e.target.value)}
                          className="app-input pl-12"
                          placeholder="Meu Restaurante"
                          autoComplete="organization"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="app-input pl-12"
                        placeholder="seu@email.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="app-input pl-12"
                        placeholder="********"
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="app-button-primary mt-2 h-12 w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processando
                      </>
                    ) : (
                      isLogin ? 'Entrar no sistema' : 'Criar conta'
                    )}
                  </button>
                </form>

                <div className="mt-7 border-t border-slate-100 pt-5 text-center dark:border-slate-800">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-sm font-bold text-slate-500 transition-colors hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4 dark:text-slate-400 dark:hover:text-primary-200 dark:focus-visible:ring-offset-slate-900"
                  >
                    {isLogin ? 'Ainda nao e cliente? Cadastre seu restaurante' : 'Ja possui conta? Faca login'}
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
              Acesso protegido por Supabase Auth
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
