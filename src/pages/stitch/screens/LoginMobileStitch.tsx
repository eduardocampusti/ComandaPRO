import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const LoginMobileStitch: React.FC = () => {
  const [email, setEmail] = useState('admin@restaurante.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Carregar fontes se necessário
    const linkFonts = document.createElement('link');
    linkFonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Plus+Jakarta+Sans:ital,wght@0,700;0,800;1,900&display=swap';
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
      setError(err.message || 'E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stitch-login-mobile-scope">
      <style dangerouslySetInnerHTML={{ __html: `
        .stitch-login-mobile-scope {
          /* Tokens do tailwind.config do code.html */
          --on-error: #ffffff;
          --on-error-container: #93000a;
          --on-primary: #ffffff;
          --surface-variant: #e2e2e2;
          --error: #ba1a1a;
          --primary-fixed: #ffdad7;
          --surface-container-high: #e8e8e8;
          --on-tertiary: #ffffff;
          --on-secondary-fixed-variant: #474747;
          --surface-dim: #dadada;
          --primary-fixed-dim: #ffb3ad;
          --on-tertiary-fixed: #271900;
          --tertiary: #795600;
          --surface-container: #eeeeee;
          --on-surface: #1a1c1c;
          --on-secondary-fixed: #1b1c1c;
          --on-tertiary-container: #fffbff;
          --secondary-fixed: #e4e2e1;
          --inverse-on-surface: #f1f1f1;
          --on-surface-variant: #5d3f3d;
          --on-tertiary-fixed-variant: #5e4200;
          --inverse-primary: #ffb3ad;
          --secondary-fixed-dim: #c8c6c6;
          --error-container: #ffdad6;
          --on-primary-container: #fffbff;
          --surface-bright: #f9f9f9;
          --tertiary-fixed: #ffdea8;
          --secondary-container: #e4e2e1;
          --secondary: #5f5e5e;
          --tertiary-container: #986d00;
          --tertiary-fixed-dim: #ffba20;
          --on-primary-fixed-variant: #930013;
          --on-primary-fixed: #410004;
          --background: #f9f9f9;
          --surface-container-low: #f3f3f3;
          --outline: #926e6b;
          --surface: #f9f9f9;
          --outline-variant: #e7bcb9;
          --surface-tint: #c0001c;
          --inverse-surface: #2f3131;
          --surface-container-highest: #e2e2e2;
          --on-secondary: #ffffff;
          --on-background: #1a1c1c;
          --on-secondary-container: #656464;
          --surface-container-lowest: #ffffff;
          --primary-container: #e6182a;
          --primary: #bb001b;

          /* Spacing */
          --stack-md: 16px;
          --stack-sm: 8px;
          --stack-lg: 32px;
          --unit: 4px;
          --container-padding-mobile: 16px;

          /* Fonts */
          --font-plus-jakarta: 'Plus Jakarta Sans', sans-serif;
          --font-inter: 'Inter', sans-serif;
        }

        /* Classes literais do Stitch baseadas no tailwind-config */
        .stitch-login-mobile-scope .font-h1, .stitch-login-mobile-scope .text-h1 { font-family: var(--font-plus-jakarta); font-size: 32px; font-weight: 800; line-height: 1.2; }
        .stitch-login-mobile-scope .font-h2, .stitch-login-mobile-scope .text-h2 { font-family: var(--font-plus-jakarta); font-size: 24px; font-weight: 700; line-height: 1.3; }
        .stitch-login-mobile-scope .font-body-md, .stitch-login-mobile-scope .text-body-md { font-family: var(--font-inter); font-size: 16px; font-weight: 400; line-height: 1.5; }
        .stitch-login-mobile-scope .font-body-sm, .stitch-login-mobile-scope .text-body-sm { font-family: var(--font-inter); font-size: 14px; font-weight: 400; line-height: 1.4; }
        .stitch-login-mobile-scope .font-label-bold, .stitch-login-mobile-scope .text-label-bold { font-family: var(--font-inter); font-size: 14px; font-weight: 600; line-height: 1.0; }

        .stitch-login-mobile-scope .bg-background { background-color: var(--background); }
        .stitch-login-mobile-scope .bg-surface-container-lowest { background-color: var(--surface-container-lowest); }
        .stitch-login-mobile-scope .bg-error-container { background-color: var(--error-container); }
        .stitch-login-mobile-scope .bg-surface { background-color: var(--surface); }
        .stitch-login-mobile-scope .bg-primary { background-color: var(--primary); }
        .stitch-login-mobile-scope .bg-tertiary { background-color: var(--tertiary); }

        .stitch-login-mobile-scope .text-primary { color: var(--primary); }
        .stitch-login-mobile-scope .text-on-surface { color: var(--on-surface); }
        .stitch-login-mobile-scope .text-on-surface-variant { color: var(--on-surface-variant); }
        .stitch-login-mobile-scope .text-on-error-container { color: var(--on-error-container); }
        .stitch-login-mobile-scope .text-secondary { color: var(--secondary); }
        .stitch-login-mobile-scope .text-on-primary { color: var(--on-primary); }
        
        .stitch-login-mobile-scope .border-surface-variant { border-color: var(--surface-variant); }
        .stitch-login-mobile-scope .border-error { border-color: var(--error); }

        .stitch-login-mobile-scope .mb-stack-lg { margin-bottom: var(--stack-lg); }
        .stitch-login-mobile-scope .mb-stack-sm { margin-bottom: var(--stack-sm); }
        .stitch-login-mobile-scope .mb-stack-md { margin-bottom: var(--stack-md); }
        .stitch-login-mobile-scope .mb-unit { margin-bottom: var(--unit); }
        .stitch-login-mobile-scope .p-stack-lg { padding: var(--stack-lg); }
        .stitch-login-mobile-scope .p-stack-sm { padding: var(--stack-sm); }
        .stitch-login-mobile-scope .gap-stack-md { gap: var(--stack-md); }
        .stitch-login-mobile-scope .px-container-padding-mobile { padding-left: var(--container-padding-mobile); padding-right: var(--container-padding-mobile); }
        .stitch-login-mobile-scope .mt-unit { margin-top: var(--unit); }

        .stitch-login-mobile-scope .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
          width: 24px;
          height: 24px;
        }

        .stitch-login-mobile-scope input::placeholder {
          color: var(--secondary);
          opacity: 0.7;
        }
      ` }} />

      <div className="bg-background min-h-screen flex flex-col justify-center items-center relative overflow-hidden w-full">
        {/* Decorative Background Elements - Replica 1:1 do SVG do Stitch */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><path d='M20 3c-4.971 0-9 4.029-9 9s4.029 9 9 9s9-4.029 9-9s-4.029-9-9-9zm0 12c-1.657 0-3-1.343-3-3s1.343-3 3-3s3 1.343 3 3s-1.343 3-3 3zm0 6c-6.627 0-12 5.373-12 12s5.373 12 12 12s12-5.373 12-12s-5.373-12-12-12zm0 20c-3.314 0-6-2.686-6-6s2.686-6 6-6s6 2.686 6 6s-2.686 6-6 6z' fill='%231a1c1c'/></svg>\")" }} />
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 z-0"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 z-0"></div>
        
        {/* Main Content Container */}
        <main className="w-full max-w-md px-container-padding-mobile z-10 relative">
          {/* Brand / Header */}
          <div className="flex flex-col items-center mb-stack-lg">
            <img
              src="/Logo_comandPRO.png"
              alt="COMANDA PRO"
              className="mx-auto h-[64px] w-auto object-contain mb-stack-sm"
            />
            <h2 className="font-h2 text-h2 text-on-surface text-center mb-unit">Entrar no painel</h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-center">Acesse sua conta para gerenciar seu restaurante</p>
          </div>

          {/* Login Card / Form */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-stack-lg">
            {/* Error Message Example (Simulated Active State) */}
            {error && (
              <div className="bg-error-container text-on-error-container p-stack-sm rounded-lg flex items-center mb-stack-md animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="material-symbols-outlined mr-unit" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <span className="font-body-sm text-body-sm">{error}</span>
              </div>
            )}

            <form className="flex flex-col gap-stack-md" onSubmit={handleLogin}>
              {/* Email Field */}
              <div className="relative">
                <label className="sr-only" htmlFor="email">E-mail</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-secondary">mail</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-3 py-3 border border-surface-variant rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50" 
                  id="email" 
                  name="email" 
                  placeholder="E-mail" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className="sr-only" htmlFor="password">Senha</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-secondary">lock</span>
                </div>
                <input 
                  className={`block w-full pl-10 pr-10 py-3 border ${error ? 'border-error bg-error-container/10' : 'border-surface-variant bg-surface'} rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 ${error ? 'focus:ring-error focus:border-error' : 'focus:ring-primary focus:border-primary'} transition-colors disabled:opacity-50`} 
                  id="password" 
                  name="password" 
                  placeholder="Senha" 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-secondary hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>

              {/* Utilities Row */}
              <div className="flex items-center justify-between mt-unit">
                <div className="flex items-center">
                  <input className="h-4 w-4 text-primary focus:ring-primary border-surface-variant rounded bg-surface" id="remember-me" name="remember-me" type="checkbox"/>
                  <label className="ml-2 block font-body-sm text-body-sm text-on-surface-variant cursor-pointer" htmlFor="remember-me">
                    Lembrar acesso
                  </label>
                </div>
                <div className="text-sm">
                  <a className="font-label-bold text-label-bold text-primary hover:text-primary-container transition-colors" href="#">
                    Esqueci minha senha
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-[0_8px_30px_rgba(234,29,44,0.15)] font-label-bold text-label-bold text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mt-stack-sm transition-all active:scale-95 duration-150 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} 
                type="submit"
                disabled={loading}
              >
                {loading && <span className="material-symbols-outlined animate-spin mr-2 text-[18px]">progress_activity</span>}
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>

          {/* Support Link */}
          <div className="mt-stack-lg text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Precisa de ajuda? <a className="font-label-bold text-label-bold text-primary hover:underline" href="#">Fale com o suporte</a>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginMobileStitch;
