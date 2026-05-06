import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

/**
 * LoginStitch - Tela de Login convertida do Google Stitch
 */
export default function LoginStitch() {
  const [email, setEmail] = useState('comandapro@comanda.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const linkFonts = document.createElement('link');
    linkFonts.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Inter:wght@100..900&display=swap';
    linkFonts.rel = 'stylesheet';
    document.head.appendChild(linkFonts);

    const linkIcons = document.createElement('link');
    linkIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'As credenciais fornecidas estão incorretas. Por favor, tente novamente.');
      setPassword(''); // Clear password on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stitch-login-scope min-h-screen flex items-center justify-center font-body-md text-on-background bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center relative w-full overflow-hidden">
      <style>{`
        .stitch-login-scope {
          --primary: #bb001b;
          --on-primary: #ffffff;
          --primary-container: #e6182a;
          --on-primary-container: #fffbff;
          --secondary: #5f5e5e;
          --on-secondary: #ffffff;
          --background: #f9f9f9;
          --on-background: #1a1c1c;
          --surface: #f9f9f9;
          --on-surface: #1a1c1c;
          --surface-variant: #e2e2e2;
          --on-surface-variant: #5d3f3d;
          --outline: #926e6b;
          --outline-variant: #e7bcb9;
          --surface-container-lowest: #ffffff;
          --surface-container-low: #f3f3f3;
          --error: #ba1a1a;
          --error-container: #ffdad6;
          --on-error-container: #93000a;
          
          --stack-md: 16px;
          --stack-sm: 8px;
          --stack-lg: 32px;
          --unit: 4px;
          --container-padding-mobile: 16px;
        }

        .stitch-login-scope .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
          width: 24px;
          height: 24px;
        }

        .stitch-login-scope .font-h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 32px; }
        .stitch-login-scope .font-h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 24px; }
        .stitch-login-scope .font-label-bold { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px; }
        .stitch-login-scope .font-body-md { font-family: 'Inter', sans-serif; font-weight: 400; font-size: 16px; }
        .stitch-login-scope .font-body-sm { font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; }

        .stitch-login-scope .bg-surface { background-color: var(--surface); }
        .stitch-login-scope .bg-surface-container-lowest { background-color: var(--surface-container-lowest); }
        .stitch-login-scope .bg-surface-container-low { background-color: var(--surface-container-low); }
        .stitch-login-scope .bg-primary { background-color: var(--primary); }
        .stitch-login-scope .bg-error-container { background-color: var(--error-container); }

        .stitch-login-scope .text-primary { color: var(--primary); }
        .stitch-login-scope .text-on-primary { color: var(--on-primary); }
        .stitch-login-scope .text-on-surface { color: var(--on-surface); }
        .stitch-login-scope .text-on-surface-variant { color: var(--on-surface-variant); }
        .stitch-login-scope .text-error { color: var(--error); }
        .stitch-login-scope .text-on-error-container { color: var(--on-error-container); }

        .stitch-login-scope .border-surface-variant { border-color: var(--surface-variant); }
        .stitch-login-scope .border-error { border-color: var(--error); }
      `}</style>

      <div className="absolute inset-0 bg-[#f9f9f9]/80 backdrop-blur-sm z-0"></div>

      <main className="relative z-10 w-full max-w-md px-[16px] md:px-0">
        <div className="bg-surface rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-surface-variant overflow-hidden">
          <div className="p-[32px] flex flex-col items-center border-b border-surface-variant/50">
            <span className="text-primary font-h1 italic tracking-tighter mb-[8px]">COMANDA PRO</span>
            <h1 className="font-h2 text-on-surface mb-[4px]">Entrar no painel</h1>
            <p className="font-body-sm text-on-surface-variant text-center">Acesse sua conta para gerenciar pedidos e configurações da loja.</p>
          </div>

          <div className="p-[32px] bg-surface-container-lowest">
            {error && (
              <div className="mb-[16px] bg-error-container border border-error/20 rounded-lg p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="material-symbols-outlined text-error mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <div>
                  <span className="font-label-bold text-on-error-container block mb-1">Erro de autenticação</span>
                  <span className="font-body-sm text-on-error-container">
                    {error.includes('Invalid login credentials') ? 'As credenciais fornecidas estão incorretas. Por favor, tente novamente.' : error}
                  </span>
                </div>
              </div>
            )}

            <form className="space-y-[16px]" onSubmit={handleLogin} autoComplete="on">
              <div className="space-y-[4px]">
                <label className="font-label-bold text-on-surface block" htmlFor="email">E-mail corporativo</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
                  <input 
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-surface-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors" 
                    id="email" 
                    name="email" 
                    placeholder="seu@email.com" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-[4px]">
                <div className="flex justify-between items-center">
                  <label className="font-label-bold text-on-surface block" htmlFor="password">Senha</label>
                  <a className="font-label-bold text-primary hover:opacity-80 transition-colors" href="#">Esqueceu a senha?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                  <input 
                    className={`w-full pl-10 pr-10 py-3 bg-surface border ${error ? 'border-error' : 'border-surface-variant'} rounded-lg font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors`} 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input 
                  className="w-4 h-4 rounded border-surface-variant text-primary focus:ring-primary bg-surface" 
                  id="remember" 
                  name="remember" 
                  type="checkbox"
                />
                <label className="ml-2 font-body-sm text-on-surface-variant cursor-pointer" htmlFor="remember">Lembrar-me neste dispositivo</label>
              </div>

              <button 
                className={`w-full bg-primary hover:opacity-90 text-on-primary font-label-bold py-3 px-4 rounded-lg shadow-[0_4px_12px_rgba(187,0,27,0.2)] hover:shadow-[0_6px_16px_rgba(187,0,27,0.3)] transition-all active:translate-y-px flex justify-center items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} 
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Entrando...' : 'Entrar'}</span>
                {!loading && <span className="material-symbols-outlined text-[20px]">login</span>}
              </button>
            </form>
          </div>

          <div className="bg-surface-container-low p-4 text-center border-t border-surface-variant">
            <p className="font-body-sm text-on-surface-variant">
              Problemas para acessar? <a className="text-primary font-label-bold hover:underline" href="#">Contatar Suporte TI</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
