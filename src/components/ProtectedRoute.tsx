import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, CreditCard, LogOut } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkSubscription(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkSubscription(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSubscription = async (userId: string) => {
    // [MODO TESTE/DEV] - Bypass seguro apenas para desenvolvimento
    // Permite acessar o sistema mesmo sem assinatura ativa se a flag estiver ligada no .env
    if (import.meta.env.DEV && import.meta.env.VITE_BYPASS_SUBSCRIPTION_CHECK === 'true') {
      console.warn('⚠️ [MODO TESTE] Bypass de assinatura ativo. Acesso liberado apenas em ambiente de desenvolvimento.');
      setSubscriptionActive(true);
      setLoading(false);
      return;
    }

    try {
      // Busca o restaurante vinculado ao profile do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', userId)
        .single();
      
      if (profile?.restaurant_id) {
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('subscription_status')
          .eq('id', profile.restaurant_id)
          .single();
          
        setSubscriptionActive(restaurant?.subscription_status === 'active');
      } else {
        // Se ainda não tiver profile/restaurant atrelado vamos permitir ou bloquear? 
        // Em um onboarding real, talvez direcionaríamos para setup. 
        // Por ora, vamos deixar passar caso o teste local não tenha banco populado.
        // Mas a lógica do SaaS exige assinatura.
        setSubscriptionActive(false); 
      }
    } catch (error) {
      console.error('Erro ao checar assinatura:', error);
      // Se a query falhar pq a tabela nao existe ainda localmente, 
      // ou pra não travar o desenvolvimento caso RLS recuse, podemos setar bypass para DEV.
      // Vou setar true em DEV temporariamente se der erro, 
      // mas num fluxo real seria false. Para garantir que mostramos a tela pedida:
      setSubscriptionActive(false); 
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeClick = () => {
    // Integração com Stripe Checkout
    alert('Integração com Stripe finalizada na próxima release!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (subscriptionActive === false) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 mx-auto rounded-full flex items-center justify-center mb-6">
            <CreditCard className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Assinatura Inativa</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Seu restaurante não possui uma assinatura ativa no momento. Para liberar o acesso ao painel e continuar recebendo pedidos, realize a assinatura.
          </p>
          <button 
            onClick={handleSubscribeClick}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-colors shadow-sm mb-4"
          >
            Assinar Comanda Pro
          </button>
          
          <button 
            onClick={() => supabase.auth.signOut()}
            className="flex items-center justify-center gap-2 w-full py-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
