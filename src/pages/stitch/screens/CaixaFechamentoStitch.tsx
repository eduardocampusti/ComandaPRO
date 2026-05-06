import React, { useEffect } from 'react';

/**
 * CaixaFechamentoStitch - Caixa e Fechamento
 * Fonte técnica literal: design-stitch/caixa_e_fechamento_comanda_pro/index.html
 */
export default function CaixaFechamentoStitch() {
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

  return (
    <div className="stitch-scope-caixa-fechamento bg-background text-on-background font-body-md text-body-md min-h-screen w-full flex overflow-hidden antialiased">
      <style>{`
        .stitch-scope-caixa-fechamento {
          --on-error: #ffffff;
          --on-secondary: #ffffff;
          --on-primary-fixed-variant: #930013;
          --tertiary-fixed: #ffdea8;
          --secondary-fixed: #e4e2e1;
          --on-tertiary-fixed-variant: #5e4200;
          --on-surface-variant: #5d3f3d;
          --tertiary-fixed-dim: #ffba20;
          --primary-container: #e6182a;
          --inverse-surface: #2f3131;
          --surface-container-lowest: #ffffff;
          --secondary-fixed-dim: #c8c6c6;
          --primary: #bb001b;
          --outline: #926e6b;
          --on-error-container: #93000a;
          --on-secondary-container: #656464;
          --inverse-primary: #ffb3ad;
          --secondary: #5f5e5e;
          --surface: #f9f9f9;
          --background: #f9f9f9;
          --on-primary: #ffffff;
          --on-secondary-fixed-variant: #474747;
          --inverse-on-surface: #f1f1f1;
          --surface-dim: #dadada;
          --surface-bright: #f9f9f9;
          --secondary-container: #e4e2e1;
          --error: #ba1a1a;
          --surface-variant: #e2e2e2;
          --primary-fixed-dim: #ffb3ad;
          --on-tertiary-container: #fffbff;
          --surface-container-highest: #e2e2e2;
          --surface-container-high: #e8e8e8;
          --surface-tint: #c0001c;
          --tertiary-container: #986d00;
          --outline-variant: #e7bcb9;
          --error-container: #ffdad6;
          --surface-container-low: #f3f3f3;
          --tertiary: #795600;
          --on-surface: #1a1c1c;
          --primary-fixed: #ffdad7;
          --on-secondary-fixed: #1b1c1c;
          --on-primary-container: #fffbff;
          --on-primary-fixed: #410004;
          --surface-container: #eeeeee;
          --on-background: #1a1c1c;
          --on-tertiary-fixed: #271900;
          --on-tertiary: #ffffff;
          
          --section-gap: 48px;
          --container-padding-mobile: 16px;
          --stack-md: 16px;
          --container-padding-desktop: 40px;
          --stack-lg: 32px;
          --unit: 4px;
          --stack-sm: 8px;
        }

        .stitch-scope-caixa-fechamento .hide-scrollbar::-webkit-scrollbar { display: none; }
        .stitch-scope-caixa-fechamento .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .stitch-scope-caixa-fechamento .font-price-display { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 20px; line-height: 1.0; }
        .stitch-scope-caixa-fechamento .font-body-md { font-family: 'Inter'; font-weight: 400; font-size: 16px; line-height: 1.5; }
        .stitch-scope-caixa-fechamento .font-body-lg { font-family: 'Inter'; font-weight: 400; font-size: 18px; line-height: 1.6; }
        .stitch-scope-caixa-fechamento .font-h3 { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 20px; line-height: 1.3; }
        .stitch-scope-caixa-fechamento .font-h1 { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 32px; line-height: 1.2; }
        .stitch-scope-caixa-fechamento .font-label-bold { font-family: 'Inter'; font-weight: 600; font-size: 14px; line-height: 1.0; }
        .stitch-scope-caixa-fechamento .font-h2 { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 24px; line-height: 1.3; }
        .stitch-scope-caixa-fechamento .font-body-sm { font-family: 'Inter'; font-weight: 400; font-size: 14px; line-height: 1.4; }

        .stitch-scope-caixa-fechamento .text-price-display { font-size: 20px; line-height: 1.0; font-weight: 700; }
        .stitch-scope-caixa-fechamento .text-body-md { font-size: 16px; line-height: 1.5; font-weight: 400; }
        .stitch-scope-caixa-fechamento .text-body-lg { font-size: 18px; line-height: 1.6; font-weight: 400; }
        .stitch-scope-caixa-fechamento .text-h3 { font-size: 20px; line-height: 1.3; font-weight: 700; }
        .stitch-scope-caixa-fechamento .text-h1 { font-size: 32px; line-height: 1.2; font-weight: 800; }
        .stitch-scope-caixa-fechamento .text-label-bold { font-size: 14px; line-height: 1.0; font-weight: 600; }
        .stitch-scope-caixa-fechamento .text-h2 { font-size: 24px; line-height: 1.3; font-weight: 700; }
        .stitch-scope-caixa-fechamento .text-body-sm { font-size: 14px; line-height: 1.4; font-weight: 400; }

        .stitch-scope-caixa-fechamento .bg-background { background-color: var(--background); }
        .stitch-scope-caixa-fechamento .text-on-background { color: var(--on-background); }
        .stitch-scope-caixa-fechamento .bg-white { background-color: #ffffff; }
        .stitch-scope-caixa-fechamento .bg-surface-container { background-color: var(--surface-container); }
        .stitch-scope-caixa-fechamento .border-outline-variant { border-color: var(--outline-variant); }
        .stitch-scope-caixa-fechamento .text-on-surface { color: var(--on-surface); }
        .stitch-scope-caixa-fechamento .text-secondary { color: var(--secondary); }
        .stitch-scope-caixa-fechamento .bg-red-50 { background-color: #fef2f2; }
        .stitch-scope-caixa-fechamento .text-red-600 { color: #dc2626; }
        .stitch-scope-caixa-fechamento .bg-surface { background-color: var(--surface); }
        .stitch-scope-caixa-fechamento .bg-surface-container-low { background-color: var(--surface-container-low); }
        .stitch-scope-caixa-fechamento .bg-surface-container-lowest { background-color: var(--surface-container-lowest); }
        .stitch-scope-caixa-fechamento .bg-primary { background-color: var(--primary); }
        .stitch-scope-caixa-fechamento .text-on-primary { color: var(--on-primary); }
        .stitch-scope-caixa-fechamento .bg-surface-container-high { background-color: var(--surface-container-high); }
        .stitch-scope-caixa-fechamento .bg-primary-fixed { background-color: var(--primary-fixed); }
        .stitch-scope-caixa-fechamento .text-on-primary-fixed { color: var(--on-primary-fixed); }
        .stitch-scope-caixa-fechamento .text-on-primary-fixed-variant { color: var(--on-primary-fixed-variant); }
        .stitch-scope-caixa-fechamento .text-primary { color: var(--primary); }
        .stitch-scope-caixa-fechamento .bg-error-container { background-color: var(--error-container); }
        .stitch-scope-caixa-fechamento .text-on-error-container { color: var(--on-error-container); }
        .stitch-scope-caixa-fechamento .bg-surface-tint { background-color: var(--surface-tint); }

        .stitch-scope-caixa-fechamento .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          vertical-align: middle;
        }
      `}</style>

      <nav className="bg-white dark:bg-zinc-950 h-full w-72 border-r rounded-none border-r border-zinc-100 dark:border-zinc-800 flex flex-col h-screen p-4 space-y-2 shrink-0 z-10 relative">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden shrink-0 border border-outline-variant">
            <img 
              alt="Admin Avatar" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCy4FfzjATJ0TTw4FZGqNajiND7lwkRNyZVI0WxbApLX_RQS0AwISexFjDgBzNkNDo4rY9yuypLxq9pQVYSasQbNjzk_Z_WN1ihXJeXAPlcJvJLKVumAfOau3vb9oBjOo63IGxxzGLPgZQWXgo2sSwhlzKjXCuLuaFRkpkbJbIMi9E7L1VupMmfeNbvtmjR5sLuS0FHLeomEcHDQjgjeUm3EWE_28jCIucB1L1spldTMnNKvjfC2msbK_1QkqD7qSzJtJhNs13jmFo"
            />
          </div>
          <div>
            <h2 className="font-label-bold text-label-bold text-on-surface">Store Admin</h2>
            <p className="font-body-sm text-body-sm text-secondary">Central Kitchen #01</p>
          </div>
        </div>
        <div className="text-red-600 font-black text-xl mb-8 px-2 tracking-tighter italic">COMANDA PRO</div>
        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-1">
          <a className="flex items-center gap-3 px-3 py-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out font-['Plus_Jakarta_Sans'] text-sm font-medium" href="#">
            <span className="material-symbols-outlined text-xl">dashboard</span>
            Dashboard
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 font-bold rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out font-['Plus_Jakarta_Sans'] text-sm font-medium relative overflow-hidden" href="#">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-600 rounded-r-full"></span>
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
            Live Orders
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out font-['Plus_Jakarta_Sans'] text-sm font-medium" href="#">
            <span className="material-symbols-outlined text-xl">edit_note</span>
            Menu Editor
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out font-['Plus_Jakarta_Sans'] text-sm font-medium" href="#">
            <span className="material-symbols-outlined text-xl">bar_chart</span>
            Analytics
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out font-['Plus_Jakarta_Sans'] text-sm font-medium" href="#">
            <span className="material-symbols-outlined text-xl">settings</span>
            Settings
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out font-['Plus_Jakarta_Sans'] text-sm font-medium" href="#">
            <span className="material-symbols-outlined text-xl">group</span>
            Staff
          </a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col bg-surface min-w-0">
        <header className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md docked full-width top-0 sticky z-50 border-b border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between px-4 py-3 w-full h-16 shrink-0">
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors rounded-full active:scale-95 duration-150 flex items-center justify-center lg:hidden">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="text-red-600 dark:text-red-500 font-black tracking-tighter italic text-xl">COMANDA PRO</div>
            <div className="h-6 w-px bg-outline-variant mx-2 hidden md:block"></div>
            <h1 className="font-h3 text-h3 text-on-surface hidden md:block">Caixa Operacional</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-secondary text-lg">search</span>
              <input 
                className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all" 
                placeholder="Buscar mesa ou comanda..." 
                type="text"
              />
            </div>
            <button className="p-2 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors rounded-full active:scale-95 duration-150 flex items-center justify-center md:hidden">
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex gap-4 p-4 overflow-hidden min-h-0">
          <section className="w-1/4 min-w-[280px] max-w-[350px] bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low rounded-t-xl shrink-0">
              <h2 className="font-h3 text-h3 text-on-surface">Mesas Abertas</h2>
              <span className="bg-primary text-on-primary font-label-bold text-[12px] px-2 py-0.5 rounded-full">14</span>
            </div>
            <div className="p-3 shrink-0">
              <div className="flex gap-2">
                <button className="flex-1 bg-surface-container-high text-on-surface font-label-bold text-label-bold py-2 rounded-lg border border-outline-variant active:scale-95 transition-transform">Todas</button>
                <button className="flex-1 bg-surface text-secondary font-label-bold text-label-bold py-2 rounded-lg border border-transparent hover:bg-surface-container transition-colors">Aguardando</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar">
              <button className="w-full text-left bg-primary-fixed border border-primary rounded-lg p-3 flex justify-between items-stretch shadow-sm active:scale-[0.98] transition-transform group">
                <div className="flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-h2 text-h2 text-on-primary-fixed">12</span>
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                    <span className="font-body-sm text-body-sm text-on-primary-fixed-variant opacity-80">4 pax</span>
                  </div>
                  <div className="font-label-bold text-label-bold text-primary mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Fechando
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <span className="font-body-sm text-body-sm text-on-primary-fixed-variant opacity-80">01:45h</span>
                  <span className="font-price-display text-price-display text-primary mt-2">R$ 284,50</span>
                </div>
              </button>

              <button className="w-full text-left bg-surface-container-lowest border border-outline-variant rounded-lg p-3 flex justify-between items-stretch hover:border-secondary hover:shadow-sm active:scale-[0.98] transition-all group">
                <div className="flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-h2 text-h2 text-on-surface">04</span>
                    <span className="material-symbols-outlined text-secondary text-sm">groups</span>
                    <span className="font-body-sm text-body-sm text-secondary">2 pax</span>
                  </div>
                  <div className="font-label-bold text-label-bold text-secondary mt-2 flex items-center gap-1">Consumindo</div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <span className="font-body-sm text-body-sm text-secondary">00:32h</span>
                  <span className="font-price-display text-price-display text-on-surface mt-2">R$ 112,00</span>
                </div>
              </button>

              <button className="w-full text-left bg-surface-container-lowest border border-outline-variant rounded-lg p-3 flex justify-between items-stretch hover:border-secondary hover:shadow-sm active:scale-[0.98] transition-all group">
                <div className="flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-h2 text-h2 text-on-surface">08</span>
                    <span className="material-symbols-outlined text-secondary text-sm">person</span>
                    <span className="font-body-sm text-body-sm text-secondary">1 pax</span>
                  </div>
                  <div className="font-label-bold text-label-bold text-secondary mt-2 flex items-center gap-1">Consumindo</div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <span className="font-body-sm text-body-sm text-secondary">00:15h</span>
                  <span className="font-price-display text-price-display text-on-surface mt-2">R$ 45,90</span>
                </div>
              </button>

              <button className="w-full text-left bg-surface-container-lowest border border-outline-variant rounded-lg p-3 flex justify-between items-stretch hover:border-secondary hover:shadow-sm active:scale-[0.98] transition-all group">
                <div className="flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-h2 text-h2 text-on-surface">15</span>
                    <span className="material-symbols-outlined text-secondary text-sm">groups</span>
                    <span className="font-body-sm text-body-sm text-secondary">6 pax</span>
                  </div>
                  <div className="font-label-bold text-label-bold text-secondary mt-2 flex items-center gap-1">Aguardando Prato</div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <span className="font-body-sm text-body-sm text-secondary">00:55h</span>
                  <span className="font-price-display text-price-display text-on-surface mt-2">R$ 410,00</span>
                </div>
              </button>
            </div>
          </section>

          <section className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-white rounded-t-xl shrink-0">
              <div>
                <div className="flex items-baseline gap-3">
                  <h2 className="font-h1 text-h1 text-on-surface">Mesa 12</h2>
                  <span className="font-body-lg text-body-lg text-secondary">Comanda #8492</span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary mt-1">Abertura: 19:30 • Garçom: Carlos M.</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined">print</span>
                </button>
                <button className="p-2 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined">edit</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 hide-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant text-secondary font-label-bold text-label-bold">
                    <th className="pb-3 w-16 font-normal">Qtd</th>
                    <th className="pb-3 font-normal">Item</th>
                    <th className="pb-3 text-right font-normal">V. Unit</th>
                    <th className="pb-3 text-right font-normal">Total</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  <tr className="border-b border-surface-variant hover:bg-surface-container-low transition-colors group">
                    <td className="py-4 align-top"><span className="bg-surface-container-high px-2 py-1 rounded font-label-bold text-label-bold">2x</span></td>
                    <td className="py-4">
                      <div className="font-label-bold text-label-bold">Chopp Artesanal IPA 500ml</div>
                    </td>
                    <td className="py-4 text-right text-secondary">R$ 18,00</td>
                    <td className="py-4 text-right font-label-bold text-label-bold">R$ 36,00</td>
                  </tr>
                  <tr className="border-b border-surface-variant hover:bg-surface-container-low transition-colors group">
                    <td className="py-4 align-top"><span className="bg-surface-container-high px-2 py-1 rounded font-label-bold text-label-bold">1x</span></td>
                    <td className="py-4">
                      <div className="font-label-bold text-label-bold">Porção Picanha Fatiada</div>
                      <div className="font-body-sm text-body-sm text-secondary mt-1 text-sm bg-surface-container-low inline-block px-2 py-0.5 rounded">Sem cebola, Ao ponto</div>
                    </td>
                    <td className="py-4 text-right text-secondary align-top">R$ 110,00</td>
                    <td className="py-4 text-right font-label-bold text-label-bold align-top">R$ 110,00</td>
                  </tr>
                  <tr className="border-b border-surface-variant hover:bg-surface-container-low transition-colors group">
                    <td className="py-4 align-top"><span className="bg-surface-container-high px-2 py-1 rounded font-label-bold text-label-bold">1x</span></td>
                    <td className="py-4">
                      <div className="font-label-bold text-label-bold">Risoto de Camarão</div>
                    </td>
                    <td className="py-4 text-right text-secondary">R$ 78,50</td>
                    <td className="py-4 text-right font-label-bold text-label-bold">R$ 78,50</td>
                  </tr>
                  <tr className="border-b border-surface-variant hover:bg-surface-container-low transition-colors group">
                    <td className="py-4 align-top"><span className="bg-surface-container-high px-2 py-1 rounded font-label-bold text-label-bold">3x</span></td>
                    <td className="py-4">
                      <div className="font-label-bold text-label-bold">Água com Gás</div>
                    </td>
                    <td className="py-4 text-right text-secondary">R$ 6,00</td>
                    <td className="py-4 text-right font-label-bold text-label-bold">R$ 18,00</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors group">
                    <td className="py-4 align-top"><span className="bg-surface-container-high px-2 py-1 rounded font-label-bold text-label-bold">1x</span></td>
                    <td className="py-4">
                      <div className="font-label-bold text-label-bold">Pudim de Leite</div>
                    </td>
                    <td className="py-4 text-right text-secondary">R$ 16,00</td>
                    <td className="py-4 text-right font-label-bold text-label-bold">R$ 16,00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-5 bg-surface-container-low border-t border-outline-variant rounded-b-xl shrink-0">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between font-body-md text-body-md text-secondary">
                  <span>Subtotal Itens</span>
                  <span>R$ 258,50</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md text-secondary">
                  <span>Taxa de Serviço (10%)</span>
                  <span>R$ 25,85</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md text-secondary text-primary">
                  <span className="flex items-center gap-1 cursor-pointer hover:underline">
                    <span className="material-symbols-outlined text-[16px]">add_circle</span> Adicionar Desconto
                  </span>
                  <span>R$ 0,00</span>
                </div>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-outline-variant">
                <span className="font-h2 text-h2 text-on-surface">Total a Pagar</span>
                <span className="font-h1 text-h1 text-primary">R$ 284,35</span>
              </div>
            </div>
          </section>

          <section className="w-[320px] shrink-0 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="p-5 border-b border-outline-variant bg-white rounded-t-xl shrink-0">
              <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                Pagamento
              </h2>
            </div>
            <div className="p-5 flex-1 overflow-y-auto hide-scrollbar space-y-6">
              <div>
                <label className="font-label-bold text-label-bold text-secondary mb-3 block">Método de Pagamento</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-primary-fixed border-2 border-primary text-primary rounded-xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
                    <span className="font-label-bold text-label-bold">Pix</span>
                  </button>
                  <button className="bg-surface border border-outline-variant text-on-surface rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-secondary hover:bg-surface-container-low active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-3xl">credit_card</span>
                    <span className="font-label-bold text-label-bold">Crédito</span>
                  </button>
                  <button className="bg-surface border border-outline-variant text-on-surface rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-secondary hover:bg-surface-container-low active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-3xl">credit_score</span>
                    <span className="font-label-bold text-label-bold">Débito</span>
                  </button>
                  <button className="bg-surface border border-outline-variant text-on-surface rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-secondary hover:bg-surface-container-low active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-3xl">payments</span>
                    <span className="font-label-bold text-label-bold">Dinheiro</span>
                  </button>
                </div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                <label className="font-label-bold text-label-bold text-secondary mb-2 block">Valor Recebido (Pix)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-h2 text-h2 text-on-surface">R$</span>
                  <input 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant rounded-lg font-h2 text-h2 text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                    type="text" 
                    defaultValue="284,35"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <button className="py-2 bg-white border border-outline-variant rounded font-label-bold text-label-bold text-on-surface hover:bg-surface-container active:scale-95 transition-transform">Metade</button>
                  <button className="py-2 bg-white border border-outline-variant rounded font-label-bold text-label-bold text-on-surface hover:bg-surface-container active:scale-95 transition-transform">R$ 300</button>
                  <button className="py-2 bg-white border border-outline-variant rounded font-label-bold text-label-bold text-on-surface hover:bg-surface-container active:scale-95 transition-transform">Exato</button>
                </div>
              </div>
            </div>
            <div className="p-5 bg-white border-t border-outline-variant shrink-0 z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
              <button className="w-full bg-primary hover:bg-surface-tint text-on-primary font-h3 text-h3 py-4 rounded-xl shadow-[0_8px_30px_rgba(234,29,44,0.15)] active:translate-y-1 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Fechar Conta
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
