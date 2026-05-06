import React, { useEffect } from 'react';

/**
 * DashboardStitch - Dashboard Administrativo
 * Fonte técnica literal: design-stitch/dashboard_administrativo_comanda_pro/code.html
 */
export default function DashboardStitch({
  userName = 'Store Admin',
  todayLabel = 'Hoje'
}: {
  userName?: string;
  todayLabel?: string;
}) {
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
    <div className="stitch-scope-dashboard bg-surface-container-low text-on-background font-body-md text-body-md w-full min-h-full flex flex-col">
      <style>{`
        .stitch-scope-dashboard {
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

        .stitch-scope-dashboard .material-symbols-outlined {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .stitch-scope-dashboard .font-h1 { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 32px; line-height: 1.2; }
        .stitch-scope-dashboard .font-h2 { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 24px; line-height: 1.3; }
        .stitch-scope-dashboard .font-h3 { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 20px; line-height: 1.3; }
        .stitch-scope-dashboard .font-body-md { font-family: 'Inter'; font-weight: 400; font-size: 16px; line-height: 1.5; }
        .stitch-scope-dashboard .font-body-sm { font-family: 'Inter'; font-weight: 400; font-size: 14px; line-height: 1.4; }
        .stitch-scope-dashboard .font-label-bold { font-family: 'Inter'; font-weight: 600; font-size: 14px; line-height: 1.0; }
        .stitch-scope-dashboard .font-price-display { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 20px; line-height: 1.0; }

        .stitch-scope-dashboard .text-h1 { font-size: 32px; line-height: 1.2; font-weight: 800; }
        .stitch-scope-dashboard .text-h2 { font-size: 24px; line-height: 1.3; font-weight: 700; }
        .stitch-scope-dashboard .text-h3 { font-size: 20px; line-height: 1.3; font-weight: 700; }
        .stitch-scope-dashboard .text-body-md { font-size: 16px; line-height: 1.5; font-weight: 400; }
        .stitch-scope-dashboard .text-body-sm { font-size: 14px; line-height: 1.4; font-weight: 400; }
        .stitch-scope-dashboard .text-label-bold { font-size: 14px; line-height: 1.0; font-weight: 600; }
        .stitch-scope-dashboard .text-price-display { font-size: 20px; line-height: 1.0; font-weight: 700; }

        .stitch-scope-dashboard .mb-section-gap { margin-bottom: var(--section-gap); }
        .stitch-scope-dashboard .pb-stack-md { padding-bottom: var(--stack-md); }
        .stitch-scope-dashboard .mt-1 { margin-top: 0.25rem; }
        .stitch-scope-dashboard .pt-stack-lg { padding-top: var(--stack-lg); }
        .stitch-scope-dashboard .p-container-padding-mobile { padding: var(--container-padding-mobile); }
        .stitch-scope-dashboard .p-container-padding-desktop { padding: var(--container-padding-desktop); }
        .stitch-scope-dashboard .mb-stack-lg { margin-bottom: var(--stack-lg); }
        .stitch-scope-dashboard .mb-unit { margin-bottom: var(--unit); }
        .stitch-scope-dashboard .gap-stack-md { gap: var(--stack-md); }
        .stitch-scope-dashboard .gap-stack-lg { gap: var(--stack-lg); }
        .stitch-scope-dashboard .p-stack-lg { padding: var(--stack-lg); }
        .stitch-scope-dashboard .mb-stack-md { margin-bottom: var(--stack-md); }
      `}</style>
        <main className="flex-1 p-container-padding-mobile md:p-container-padding-desktop w-full max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-stack-lg">
            <div>
              <h2 className="font-h1 text-h1 text-on-surface mb-unit">Visão Geral, {userName}</h2>
              <p className="font-body-md text-body-md text-on-secondary-container">Acompanhe o desempenho da sua loja em {todayLabel}.</p>
            </div>
            <div className="hidden md:flex items-center bg-surface-container rounded-lg p-1 border border-outline-variant">
              <button className="px-4 py-2 rounded font-label-bold text-label-bold bg-surface-container-lowest text-on-surface shadow-sm">Hoje</button>
              <button className="px-4 py-2 rounded font-label-bold text-label-bold text-on-secondary-container hover:bg-surface-variant transition-colors">7 Dias</button>
              <button className="px-4 py-2 rounded font-label-bold text-label-bold text-on-secondary-container hover:bg-surface-variant transition-colors">Mês</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md lg:gap-stack-lg mb-section-gap">
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant p-stack-lg flex flex-col justify-between group hover:border-outline transition-colors relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
              <div className="flex items-center justify-between mb-stack-md relative z-10">
                <span className="font-label-bold text-label-bold text-on-secondary-container uppercase tracking-wider">Pedidos Hoje</span>
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
              </div>
              <div className="relative z-10">
                <div className="font-price-display text-price-display text-on-surface text-4xl">184</div>
                <div className="flex items-center gap-1 mt-2 text-primary font-label-bold text-label-bold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>+12% vs ontem</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant p-stack-lg flex flex-col justify-between group hover:border-outline transition-colors relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-container/5 rounded-full blur-2xl group-hover:bg-tertiary-container/10 transition-all"></div>
              <div className="flex items-center justify-between mb-stack-md relative z-10">
                <span className="font-label-bold text-label-bold text-on-secondary-container uppercase tracking-wider">Faturamento</span>
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined">payments</span>
                </div>
              </div>
              <div className="relative z-10">
                <div className="font-price-display text-price-display text-on-surface text-4xl">R$ 5.420</div>
                <div className="flex items-center gap-1 mt-2 text-primary font-label-bold text-label-bold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>+8.5% vs ontem</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant p-stack-lg flex flex-col justify-between group hover:border-outline transition-colors relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-fixed/30 rounded-full blur-2xl group-hover:bg-secondary-fixed/50 transition-all"></div>
              <div className="flex items-center justify-between mb-stack-md relative z-10">
                <span className="font-label-bold text-label-bold text-on-secondary-container uppercase tracking-wider">Ticket Médio</span>
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-fixed-variant">
                  <span className="material-symbols-outlined">point_of_sale</span>
                </div>
              </div>
              <div className="relative z-10">
                <div className="font-price-display text-price-display text-on-surface text-4xl">R$ 29,45</div>
                <div className="flex items-center gap-1 mt-2 text-on-secondary-container font-label-bold text-label-bold">
                  <span className="material-symbols-outlined text-[16px]">trending_flat</span>
                  <span>Estável</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md lg:gap-stack-lg">
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant p-stack-lg col-span-1 lg:col-span-2 flex flex-col h-96">
              <div className="flex justify-between items-center mb-stack-lg">
                <h3 className="font-h3 text-h3 text-on-surface">Vendas por Hora</h3>
                <button className="text-on-secondary-container hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              <div className="flex-1 flex items-end justify-between gap-2 pb-4 border-b border-surface-variant relative">
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] font-label-bold text-on-secondary-container -ml-6 pb-4">
                  <span>1k</span>
                  <span>500</span>
                  <span>0</span>
                </div>
                <div className="w-full flex flex-col items-center justify-end h-full gap-2 group">
                  <div className="w-full max-w-[40px] bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-colors h-[20%] relative"></div>
                  <span className="font-label-bold text-[10px] text-on-secondary-container">11h</span>
                </div>
                <div className="w-full flex flex-col items-center justify-end h-full gap-2 group">
                  <div className="w-full max-w-[40px] bg-primary/40 rounded-t-sm group-hover:bg-primary/60 transition-colors h-[45%] relative"></div>
                  <span className="font-label-bold text-[10px] text-on-secondary-container">12h</span>
                </div>
                <div className="w-full flex flex-col items-center justify-end h-full gap-2 group">
                  <div className="w-full max-w-[40px] bg-primary rounded-t-sm group-hover:bg-primary-container transition-colors h-[85%] relative shadow-[0_-4px_15px_rgba(230,24,42,0.2)]"></div>
                  <span className="font-label-bold text-[10px] text-on-surface">13h</span>
                </div>
                <div className="w-full flex flex-col items-center justify-end h-full gap-2 group">
                  <div className="w-full max-w-[40px] bg-primary/60 rounded-t-sm group-hover:bg-primary/80 transition-colors h-[60%] relative"></div>
                  <span className="font-label-bold text-[10px] text-on-secondary-container">14h</span>
                </div>
                <div className="w-full flex flex-col items-center justify-end h-full gap-2 group">
                  <div className="w-full max-w-[40px] bg-primary/30 rounded-t-sm group-hover:bg-primary/50 transition-colors h-[30%] relative"></div>
                  <span className="font-label-bold text-[10px] text-on-secondary-container">15h</span>
                </div>
                <div className="w-full flex flex-col items-center justify-end h-full gap-2 group">
                  <div className="w-full max-w-[40px] bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-colors h-[15%] relative"></div>
                  <span className="font-label-bold text-[10px] text-on-secondary-container">16h</span>
                </div>
                <div className="w-full flex flex-col items-center justify-end h-full gap-2 group">
                  <div className="w-full max-w-[40px] bg-primary/40 rounded-t-sm group-hover:bg-primary/60 transition-colors h-[50%] relative"></div>
                  <span className="font-label-bold text-[10px] text-on-secondary-container">17h</span>
                </div>
                <div className="w-full flex flex-col items-center justify-end h-full gap-2 group">
                  <div className="w-full max-w-[40px] bg-primary/80 rounded-t-sm group-hover:bg-primary transition-colors h-[75%] relative"></div>
                  <span className="font-label-bold text-[10px] text-on-secondary-container">18h</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant flex flex-col col-span-1 h-96 overflow-hidden">
              <div className="p-stack-lg border-b border-surface-variant flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="font-h3 text-h3 text-on-surface">Pedidos Recentes</h3>
                <a className="font-label-bold text-label-bold text-primary hover:text-primary-container transition-colors" href="#">Ver todos</a>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <div className="flex items-center justify-between p-stack-md hover:bg-surface-container transition-colors rounded-lg cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-surface-variant flex items-center justify-center font-price-display text-[14px] text-on-surface">
                      #142
                    </div>
                    <div>
                      <div className="font-label-bold text-label-bold text-on-surface">Mesa 04</div>
                      <div className="font-body-sm text-body-sm text-on-secondary-container">R$ 145,90 • 2 itens</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-bold text-[11px] border border-outline-variant/30">
                    Preparando
                  </div>
                </div>
                <div className="flex items-center justify-between p-stack-md hover:bg-surface-container transition-colors rounded-lg cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-surface-variant flex items-center justify-center font-price-display text-[14px] text-on-surface">
                      #141
                    </div>
                    <div>
                      <div className="font-label-bold text-label-bold text-on-surface">Delivery (iFood)</div>
                      <div className="font-body-sm text-body-sm text-on-secondary-container">R$ 89,50 • 1 item</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-bold text-[11px] border border-outline-variant/30">
                    Pronto
                  </div>
                </div>
                <div className="flex items-center justify-between p-stack-md hover:bg-surface-container transition-colors rounded-lg cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-surface-variant flex items-center justify-center font-price-display text-[14px] text-on-surface">
                      #140
                    </div>
                    <div>
                      <div className="font-label-bold text-label-bold text-on-surface">Mesa 12</div>
                      <div className="font-body-sm text-body-sm text-on-secondary-container">R$ 210,00 • 4 itens</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-bold text-[11px] border border-outline-variant/30">
                    Entregue
                  </div>
                </div>
                <div className="flex items-center justify-between p-stack-md hover:bg-surface-container transition-colors rounded-lg cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-surface-variant flex items-center justify-center font-price-display text-[14px] text-on-surface">
                      #139
                    </div>
                    <div>
                      <div className="font-label-bold text-label-bold text-on-surface">Balcão</div>
                      <div className="font-body-sm text-body-sm text-on-secondary-container">R$ 15,00 • 1 item</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-bold text-[11px] border border-outline-variant/30">
                    Entregue
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
