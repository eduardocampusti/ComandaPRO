import React, { useEffect } from 'react';

/**
 * CardapioListaStitch - Cardápio Digital (Lista de Produtos)
 * Fonte técnica literal: design-stitch/card_pio_digital_lista/index.html
 */
export default function CardapioListaStitch() {
  useEffect(() => {
    const linkFonts = document.createElement('link');
    linkFonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Plus+Jakarta+Sans:ital,wght@0,700;0,800;1,900&display=swap';
    linkFonts.rel = 'stylesheet';
    document.head.appendChild(linkFonts);

    const linkIcons = document.createElement('link');
    linkIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);
  }, []);

  return (
    <div className="stitch-scope-cardapio-lista bg-background text-on-surface font-body-md antialiased min-h-screen relative pb-[160px] w-full overflow-x-hidden">
      <style>{`
        .stitch-scope-cardapio-lista {
          --surface-dim: #dadada;
          --inverse-primary: #ffb3ad;
          --inverse-on-surface: #f1f1f1;
          --on-tertiary: #ffffff;
          --on-surface: #1a1c1c;
          --primary-container: #e6182a;
          --on-secondary-fixed-variant: #474747;
          --tertiary: #795600;
          --primary: #bb001b;
          --on-tertiary-fixed: #271900;
          --tertiary-fixed: #ffdea8;
          --on-tertiary-container: #fffbff;
          --on-surface-variant: #5d3f3d;
          --surface-container-highest: #e2e2e2;
          --on-secondary-container: #656464;
          --surface-variant: #e2e2e2;
          --on-error-container: #93000a;
          --secondary-fixed-dim: #c8c6c6;
          --surface-container-low: #f3f3f3;
          --surface-container: #eeeeee;
          --surface-container-high: #e8e8e8;
          --outline: #926e6b;
          --on-error: #ffffff;
          --secondary: #5f5e5e;
          --secondary-fixed: #e4e2e1;
          --surface-bright: #f9f9f9;
          --on-primary-fixed: #410004;
          --on-primary-fixed-variant: #930013;
          --on-secondary: #ffffff;
          --primary-fixed-dim: #ffb3ad;
          --error-container: #ffdad6;
          --on-background: #1a1c1c;
          --on-tertiary-fixed-variant: #5e4200;
          --surface-container-lowest: #ffffff;
          --on-secondary-fixed: #1b1c1c;
          --error: #ba1a1a;
          --secondary-container: #e4e2e1;
          --surface: #f9f9f9;
          --inverse-surface: #2f3131;
          --on-primary-container: #fffbff;
          --primary-fixed: #ffdad7;
          --tertiary-fixed-dim: #ffba20;
          --outline-variant: #e7bcb9;
          --on-primary: #ffffff;
          --tertiary-container: #986d00;
          --surface-tint: #c0001c;
          --background: #f9f9f9;

          --stack-lg: 32px;
          --unit: 4px;
          --section-gap: 48px;
          --stack-sm: 8px;
          --container-padding-mobile: 16px;
          --container-padding-desktop: 40px;
          --stack-md: 16px;
        }

        .stitch-scope-cardapio-lista .hide-scrollbar::-webkit-scrollbar { display: none; }
        .stitch-scope-cardapio-lista .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .stitch-scope-cardapio-lista .font-h1 { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 32px; line-height: 1.2; }
        .stitch-scope-cardapio-lista .font-h2 { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 24px; line-height: 1.3; }
        .stitch-scope-cardapio-lista .font-h3 { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 20px; line-height: 1.3; }
        .stitch-scope-cardapio-lista .font-body-md { font-family: 'Inter'; font-weight: 400; font-size: 16px; line-height: 1.5; }
        .stitch-scope-cardapio-lista .font-body-sm { font-family: 'Inter'; font-weight: 400; font-size: 14px; line-height: 1.4; }
        .stitch-scope-cardapio-lista .font-label-bold { font-family: 'Inter'; font-weight: 600; font-size: 14px; line-height: 1.0; }
        .stitch-scope-cardapio-lista .font-price-display { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 20px; line-height: 1.0; }

        .stitch-scope-cardapio-lista .text-h1 { font-size: 32px; line-height: 1.2; font-weight: 800; }
        .stitch-scope-cardapio-lista .text-h2 { font-size: 24px; line-height: 1.3; font-weight: 700; }
        .stitch-scope-cardapio-lista .text-h3 { font-size: 20px; line-height: 1.3; font-weight: 700; }
        .stitch-scope-cardapio-lista .text-body-md { font-size: 16px; line-height: 1.5; font-weight: 400; }
        .stitch-scope-cardapio-lista .text-body-sm { font-size: 14px; line-height: 1.4; font-weight: 400; }
        .stitch-scope-cardapio-lista .text-label-bold { font-size: 14px; line-height: 1.0; font-weight: 600; }
        .stitch-scope-cardapio-lista .text-price-display { font-size: 20px; line-height: 1.0; font-weight: 700; }

        .stitch-scope-cardapio-lista .bg-background { background-color: var(--background); }
        .stitch-scope-cardapio-lista .bg-primary { background-color: var(--primary); }
        .stitch-scope-cardapio-lista .text-on-primary { color: var(--on-primary); }
        .stitch-scope-cardapio-lista .bg-surface-container { background-color: var(--surface-container); }
        .stitch-scope-cardapio-lista .text-on-surface { color: var(--on-surface); }
        .stitch-scope-cardapio-lista .bg-surface-container-lowest { background-color: var(--surface-container-lowest); }
        .stitch-scope-cardapio-lista .text-primary { color: var(--primary); }
        .stitch-scope-cardapio-lista .bg-inverse-surface { background-color: var(--inverse-surface); }
        .stitch-scope-cardapio-lista .text-inverse-on-surface { color: var(--inverse-on-surface); }
        .stitch-scope-cardapio-lista .bg-zinc-900 { background-color: #18181b; }
        .stitch-scope-cardapio-lista .bg-white { background-color: #ffffff; }

        .stitch-scope-cardapio-lista .px-container-padding-mobile { padding-left: var(--container-padding-mobile); padding-right: var(--container-padding-mobile); }
        .stitch-scope-cardapio-lista .py-stack-sm { padding-top: var(--stack-sm); padding-bottom: var(--stack-sm); }
        .stitch-scope-cardapio-lista .gap-unit { gap: var(--unit); }
        .stitch-scope-cardapio-lista .gap-stack-md { gap: var(--stack-md); }
        
        .stitch-scope-cardapio-lista .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          vertical-align: middle;
        }
      `}</style>

      <header className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md docked full-width top-0 sticky z-50 border-b border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between px-4 py-3 w-full h-16">
        <button className="text-zinc-500 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors active:scale-95 duration-150 p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="text-red-600 dark:text-red-500 font-black tracking-tighter italic text-xl">
          COMANDA PRO
        </div>
        <button className="text-zinc-500 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors active:scale-95 duration-150 p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">search</span>
        </button>
      </header>

      <main className="w-full max-w-lg mx-auto">
        <div className="px-container-padding-mobile py-stack-sm mt-2">
          <div className="relative flex items-center w-full h-12 rounded-full bg-surface-container focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">search</span>
            <input 
              className="w-full h-full bg-transparent border-none pl-12 pr-4 font-body-md text-on-surface placeholder:text-on-surface-variant focus:ring-0 rounded-full" 
              placeholder="O que você deseja comer hoje?" 
              type="text"
            />
          </div>
        </div>

        <div className="flex overflow-x-auto gap-unit px-container-padding-mobile py-stack-sm hide-scrollbar items-center">
          <button className="flex-shrink-0 bg-primary text-on-primary rounded-full px-5 py-2.5 font-label-bold text-label-bold shadow-sm transition-transform active:scale-95">
            Burgers
          </button>
          <button className="flex-shrink-0 bg-surface-container text-on-surface rounded-full px-5 py-2.5 font-label-bold text-label-bold transition-colors hover:bg-surface-container-high active:scale-95">
            Bebidas
          </button>
          <button className="flex-shrink-0 bg-surface-container text-on-surface rounded-full px-5 py-2.5 font-label-bold text-label-bold transition-colors hover:bg-surface-container-high active:scale-95">
            Sobremesas
          </button>
          <button className="flex-shrink-0 bg-surface-container text-on-surface rounded-full px-5 py-2.5 font-label-bold text-label-bold transition-colors hover:bg-surface-container-high active:scale-95">
            Acompanhamentos
          </button>
        </div>

        <div className="flex flex-col gap-stack-md px-container-padding-mobile py-stack-sm">
          <div className="flex justify-between items-stretch bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-low">
            <div className="flex flex-col justify-between pr-4 flex-1">
              <div>
                <h3 className="font-h3 text-h3 text-on-surface">Classic Burger</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">Pão brioche tostado na manteiga, blend 180g de costela, queijo cheddar derretido, alface americana e molho especial da casa.</p>
              </div>
              <div className="font-price-display text-price-display text-primary mt-3">R$ 34,90</div>
            </div>
            <div className="relative shrink-0 flex items-center">
              <div className="w-[100px] h-[100px] rounded-xl overflow-hidden shadow-sm">
                <img 
                  alt="Classic Burger" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuqhwW7TZ-8oUysXZjquw8phSsge78zOKjLs-9ZuXrhXe7454__voWSI0sPaSM1tRyacWFcsg64DgP_SYZVa6hiiZmNj4x3uWceLX7Y586bcf-YXmyjPkpR4UrMQgsa1LhCc384wRjGMYgIFFDGyqh7clEFW3cTUvS5RvUJ7FoNWO6A3Zzr0g7rswR8k_hwQf4CLufz2C4tCT8NWJ1sPlrKNr8WUlYQzexxZZYtpGse089orgVyeRdHVGSTrmAq72ML7nUOWS9uRc"
                />
              </div>
              <button className="absolute -bottom-2 -left-3 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(187,0,27,0.3)] hover:bg-primary-container active:scale-90 transition-all z-10">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-stretch bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-low">
            <div className="flex flex-col justify-between pr-4 flex-1">
              <div>
                <h3 className="font-h3 text-h3 text-on-surface">Smash Bacon Duplo</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">Dois smash burgers de 90g com crostinha perfeita, fatias generosas de bacon crocante, queijo prato e maionese defumada.</p>
              </div>
              <div className="font-price-display text-price-display text-primary mt-3">R$ 42,50</div>
            </div>
            <div className="relative shrink-0 flex items-center">
              <div className="w-[100px] h-[100px] rounded-xl overflow-hidden shadow-sm">
                <img 
                  alt="Smash Bacon Duplo" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzd5vTVFp869jFpXNWu7NLVJ7is20JJHcj_CJz8kGiZt8AhVHiFSgOsqGJgPH5-RTuh0T04dIAwLPEhwpZSyu7DU7lFxeWRdyTOWjTujG5gQ_etWev4XI9Dp0SdoLFd9zQd7IjLbJaKBa6TNwrZPjZ_hInIQcorL4wu4_WJjzyWbYbULrYsQ7SixZ4HtXyPP5tf3tz0Po0Icx6YIzN8DdI1t5Are8IAnD5Adi_1ZKHuJy4qR_dLOUEjqNuBrbJRH787IcygdQWxBo"
                />
              </div>
              <button className="absolute -bottom-2 -left-3 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(187,0,27,0.3)] hover:bg-primary-container active:scale-90 transition-all z-10">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-stretch bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-low">
            <div className="flex flex-col justify-between pr-4 flex-1">
              <div>
                <h3 className="font-h3 text-h3 text-on-surface">Chicken Crispy</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">Sobrecoxa de frango empanada hiper crocante, salada coleslaw refrescante, picles de pepino e pão australiano.</p>
              </div>
              <div className="font-price-display text-price-display text-primary mt-3">R$ 38,00</div>
            </div>
            <div className="relative shrink-0 flex items-center">
              <div className="w-[100px] h-[100px] rounded-xl overflow-hidden shadow-sm">
                <img 
                  alt="Chicken Crispy" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCB0B6jgcoBI-6QJma4Btu1qa_7ffgPptkyCyzfC2Nam7P99sNTHov-P5bXsw8YY1z60aWNc-AU_y0-NXQrX6GafNedjtWTlprHoiO6irt42rDcxDjXwX1pCJqTnIyq5cvGFR9Cvx8698juTrjZzoDW4rt6O4swyqkh508_Tselo3pg4wMSyVSnHNE8E7tbzicTBxPQGLaNViLEcgsTx3PuOIcGrMebPvuwXIki4knRcc94Wcod3gFJNRhKiz9HwTQrjyupUW3Y5kw"
                />
              </div>
              <button className="absolute -bottom-2 -left-3 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(187,0,27,0.3)] hover:bg-primary-container active:scale-90 transition-all z-10">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-[88px] left-4 right-4 max-w-lg mx-auto z-40">
        <button className="w-full bg-inverse-surface text-inverse-on-surface rounded-2xl p-4 flex justify-between items-center shadow-[0_8px_30px_rgba(234,29,44,0.15)] active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-inverse-on-surface/20 flex items-center justify-center font-label-bold text-label-bold">1</div>
            <div className="flex flex-col items-start">
              <span className="font-body-sm text-body-sm text-surface-dim">Total do pedido</span>
              <span className="font-price-display text-price-display">R$ 34,90</span>
            </div>
          </div>
          <div className="flex items-center gap-2 font-label-bold text-label-bold text-primary-fixed">
            Ver Carrinho
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </div>
        </button>
      </div>

      <nav className="bg-zinc-900 dark:bg-black docked full-width bottom-0 rounded-t-2xl shadow-[0_-8px_30px_rgba(234,29,44,0.15)] fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-6">
        <button className="flex flex-col items-center justify-center text-red-500 scale-110 active:translate-y-1 duration-200">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Menu</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-all active:translate-y-1 duration-200">
          <span className="material-symbols-outlined mb-1">receipt_long</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Orders</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-all active:translate-y-1 duration-200">
          <span className="material-symbols-outlined mb-1">person</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Profile</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-all active:translate-y-1 duration-200">
          <span className="material-symbols-outlined mb-1">shopping_bag</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Cart</span>
        </button>
      </nav>
    </div>
  );
}
