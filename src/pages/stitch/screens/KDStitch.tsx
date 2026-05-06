import React, { useEffect } from 'react';

/**
 * KDStitch - Tela de KDS (Kitchen Display System) convertida do Google Stitch
 * Fidelidade 100% ao design original.
 */
export default function KDStitch() {
  useEffect(() => {
    // Carregar fontes e ícones conforme o original
    const linkFonts = document.createElement('link');
    linkFonts.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&family=Inter:wght@400;500;600;700&display=swap';
    linkFonts.rel = 'stylesheet';
    document.head.appendChild(linkFonts);

    const linkIcons = document.createElement('link');
    linkIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);
  }, []);

  return (
    <div className="stitch-scope-kds_cozinha_comanda_pro min-h-screen bg-background text-on-surface font-body-md antialiased overflow-hidden w-full flex h-screen">
      <style>{`
        .stitch-scope-kds_cozinha_comanda_pro {
          /* Tokens de Cores extraídos do tailwind.config do code.html */
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

          /* Typography & Spacing */
          --font-h1: 'Plus Jakarta Sans', sans-serif;
          --font-h2: 'Plus Jakarta Sans', sans-serif;
          --font-h3: 'Plus Jakarta Sans', sans-serif;
          --font-body: 'Inter', sans-serif;
        }

        .stitch-scope-kds_cozinha_comanda_pro .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
          width: 24px;
          height: 24px;
          vertical-align: middle;
        }

        /* Classes utilitárias mapeadas para os tokens do escopo */
        .stitch-scope-kds_cozinha_comanda_pro .bg-background { background-color: var(--background); }
        .stitch-scope-kds_cozinha_comanda_pro .bg-surface { background-color: var(--surface); }
        .stitch-scope-kds_cozinha_comanda_pro .bg-primary { background-color: var(--primary); }
        .stitch-scope-kds_cozinha_comanda_pro .bg-primary-container { background-color: var(--primary-container); }
        .stitch-scope-kds_cozinha_comanda_pro .bg-secondary-container { background-color: var(--secondary-container); }
        .stitch-scope-kds_cozinha_comanda_pro .bg-surface-container { background-color: var(--surface-container); }
        .stitch-scope-kds_cozinha_comanda_pro .bg-surface-container-low { background-color: var(--surface-container-low); }
        .stitch-scope-kds_cozinha_comanda_pro .bg-surface-container-high { background-color: var(--surface-container-high); }
        .stitch-scope-kds_cozinha_comanda_pro .bg-surface-container-lowest { background-color: var(--surface-container-lowest); }
        .stitch-scope-kds_cozinha_comanda_pro .bg-error { background-color: var(--error); }
        .stitch-scope-kds_cozinha_comanda_pro .bg-error-container { background-color: var(--error-container); }
        .stitch-scope-kds_cozinha_comanda_pro .bg-tertiary-fixed-dim { background-color: var(--tertiary-fixed-dim); }
        .stitch-scope-kds_cozinha_comanda_pro .bg-surface-dim { background-color: var(--surface-dim); }

        .stitch-scope-kds_cozinha_comanda_pro .text-primary { color: var(--primary); }
        .stitch-scope-kds_cozinha_comanda_pro .text-on-primary { color: var(--on-primary); }
        .stitch-scope-kds_cozinha_comanda_pro .text-on-surface { color: var(--on-surface); }
        .stitch-scope-kds_cozinha_comanda_pro .text-secondary { color: var(--secondary); }
        .stitch-scope-kds_cozinha_comanda_pro .text-on-primary-container { color: var(--on-primary-container); }
        .stitch-scope-kds_cozinha_comanda_pro .text-error { color: var(--error); }
        .stitch-scope-kds_cozinha_comanda_pro .text-on-surface-variant { color: var(--on-surface-variant); }
        .stitch-scope-kds_cozinha_comanda_pro .text-outline { color: var(--outline); }
        .stitch-scope-kds_cozinha_comanda_pro .text-on-tertiary-fixed-variant { color: var(--on-tertiary-fixed-variant); }

        .stitch-scope-kds_cozinha_comanda_pro .font-h1 { font-family: var(--font-h1); font-weight: 800; font-size: 32px; line-height: 1.2; }
        .stitch-scope-kds_cozinha_comanda_pro .font-h2 { font-family: var(--font-h2); font-weight: 700; font-size: 24px; line-height: 1.3; }
        .stitch-scope-kds_cozinha_comanda_pro .font-h3 { font-family: var(--font-h3); font-weight: 700; font-size: 20px; line-height: 1.3; }
        .stitch-scope-kds_cozinha_comanda_pro .font-label-bold { font-family: var(--font-body); font-weight: 600; font-size: 14px; line-height: 1.0; }
        .stitch-scope-kds_cozinha_comanda_pro .font-body-md { font-family: var(--font-body); font-weight: 400; font-size: 16px; line-height: 1.5; }
        .stitch-scope-kds_cozinha_comanda_pro .font-body-sm { font-family: var(--font-body); font-weight: 400; font-size: 14px; line-height: 1.4; }

        .stitch-scope-kds_cozinha_comanda_pro .kanban-column { min-height: calc(100vh - 140px); }
        .stitch-scope-kds_cozinha_comanda_pro .kanban-column::-webkit-scrollbar { width: 6px; }
        .stitch-scope-kds_cozinha_comanda_pro .kanban-column::-webkit-scrollbar-track { background: transparent; }
        .stitch-scope-kds_cozinha_comanda_pro .kanban-column::-webkit-scrollbar-thumb { background-color: #e2e2e2; border-radius: 20px; }
        
        .stitch-scope-kds_cozinha_comanda_pro .px-container-padding-desktop { padding-left: 40px; padding-right: 40px; }
      `}</style>

      {/* NavigationDrawer */}
      <aside className="hidden md:flex flex-col h-screen p-4 space-y-2 bg-white h-full w-72 border-r border-zinc-100 z-40 shrink-0">
        <div className="mb-8">
          <h1 className="text-red-600 font-black text-xl mb-8 font-h2 italic tracking-tighter">COMANDA PRO</h1>
          <div className="flex items-center gap-3 p-2 bg-surface-container-low rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-label-bold">
              SA
            </div>
            <div>
              <p className="font-label-bold text-on-surface">Store Admin</p>
              <p className="font-body-sm text-on-surface-variant">Central Kitchen #01</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-50 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-['Plus_Jakarta_Sans'] text-sm font-medium">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
            <span className="font-['Plus_Jakarta_Sans'] text-sm font-medium">Live Orders</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-50 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">edit_note</span>
            <span className="font-['Plus_Jakarta_Sans'] text-sm font-medium">Menu Editor</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-50 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="font-['Plus_Jakarta_Sans'] text-sm font-medium">Analytics</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-50 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-['Plus_Jakarta_Sans'] text-sm font-medium">Settings</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-50 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">group</span>
            <span className="font-['Plus_Jakarta_Sans'] text-sm font-medium">Staff</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-background relative z-10 overflow-hidden">
        {/* TopAppBar (Mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 w-full h-16 bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <button className="text-zinc-500 p-2 rounded-full flex items-center justify-center hover:bg-zinc-50">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="text-red-600 font-black tracking-tighter italic text-xl">COMANDA PRO</span>
          <button className="text-zinc-500 p-2 rounded-full flex items-center justify-center hover:bg-zinc-50">
            <span className="material-symbols-outlined">search</span>
          </button>
        </header>

        {/* KDS Header */}
        <div className="px-container-padding-desktop py-4 bg-surface-container-lowest border-b border-surface-variant flex justify-between items-center hidden md:flex shrink-0">
          <div>
            <h2 className="font-h2 text-on-surface">Kitchen Display System</h2>
            <p className="font-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Live Updates Active
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface-container p-2 rounded-lg flex items-center gap-3">
              <div className="text-center px-3 border-r border-outline-variant">
                <p className="font-body-sm text-on-surface-variant">Pending</p>
                <p className="font-h3 text-on-surface">12</p>
              </div>
              <div className="text-center px-3 border-r border-outline-variant">
                <p className="font-body-sm text-on-surface-variant">Avg Time</p>
                <p className="font-h3 text-on-surface">14m</p>
              </div>
              <div className="text-center px-3">
                <p className="font-body-sm text-on-surface-variant">Efficiency</p>
                <p className="font-h3 text-primary">94%</p>
              </div>
            </div>
            <button className="bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 p-4 md:p-6 overflow-x-auto bg-background">
          <div className="flex gap-4 h-full min-w-[1000px]">
            {/* Column 1: Novo */}
            <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-3 border-b border-surface-variant bg-surface flex justify-between items-center shrink-0">
                <h3 className="font-label-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">fiber_new</span>
                  NOVO
                  <span className="bg-primary-container text-on-primary-container text-xs px-2 py-0.5 rounded-full ml-1">3</span>
                </h3>
              </div>
              <div className="p-3 overflow-y-auto kanban-column flex flex-col gap-3">
                {/* Order Card 1 */}
                <div className="bg-surface-container-lowest border border-error-container rounded-lg p-4 shadow-[0_4px_12px_rgba(186,26,26,0.08)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <div>
                      <span className="font-h3 text-on-surface">#4092</span>
                      <p className="font-body-sm text-on-surface-variant">Mesa 12 • Salão</p>
                    </div>
                    <div className="bg-error-container text-error font-label-bold text-[12px] px-2 py-1 rounded-md flex items-center gap-1 animate-pulse">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      18:42
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 pl-2">
                    <div className="flex items-start gap-2">
                      <span className="font-label-bold text-on-surface mt-0.5">2x</span>
                      <div>
                        <p className="font-body-md text-on-surface font-medium">Hambúrguer Clássico</p>
                        <p className="font-body-sm text-error italic">- Sem cebola</p>
                        <p className="font-body-sm text-on-surface-variant italic">+ Extra queijo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 border-t border-surface-variant pt-2">
                      <span className="font-label-bold text-on-surface mt-0.5">1x</span>
                      <div>
                        <p className="font-body-md text-on-surface font-medium">Batata Frita Grande</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-primary hover:bg-surface-tint text-on-primary font-label-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[18px]">skillet</span>
                    INICIAR PREPARO
                  </button>
                </div>

                {/* Order Card 2 */}
                <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-surface-dim"></div>
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <div>
                      <span className="font-h3 text-on-surface">#4095</span>
                      <p className="font-body-sm text-on-surface-variant">Ifood • Delivery</p>
                    </div>
                    <div className="bg-surface-container text-on-surface-variant font-label-bold text-[12px] px-2 py-1 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      04:15
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 pl-2">
                    <div className="flex items-start gap-2">
                      <span className="font-label-bold text-on-surface mt-0.5">1x</span>
                      <div>
                        <p className="font-body-md text-on-surface font-medium">Pizza Margherita (M)</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[18px]">skillet</span>
                    INICIAR PREPARO
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2: Em Preparo */}
            <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-3 border-b border-surface-variant bg-surface flex justify-between items-center shrink-0">
                <h3 className="font-label-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-sm">skillet</span>
                  EM PREPARO
                  <span className="bg-surface-container text-on-surface text-xs px-2 py-0.5 rounded-full ml-1">2</span>
                </h3>
              </div>
              <div className="p-3 overflow-y-auto kanban-column flex flex-col gap-3">
                {/* Order Card 3 */}
                <div className="bg-tertiary-fixed/10 border border-tertiary-fixed-dim/30 rounded-lg p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-tertiary-fixed-dim"></div>
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <div>
                      <span className="font-h3 text-on-surface">#4088</span>
                      <p className="font-body-sm text-on-surface-variant">Balcão • Retirada</p>
                    </div>
                    <div className="bg-surface-container text-on-surface-variant font-label-bold text-[12px] px-2 py-1 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      12:05
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 pl-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 w-5 h-5 rounded border-2 border-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                      </div>
                      <span className="font-label-bold text-outline mt-0.5 line-through">1x</span>
                      <div>
                        <p className="font-body-md text-outline font-medium line-through">Salada Caesar</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 border-t border-surface-variant/50 pt-2">
                      <div className="mt-0.5 w-5 h-5 rounded border-2 border-surface-variant flex shrink-0"></div>
                      <span className="font-label-bold text-on-surface mt-0.5">1x</span>
                      <div>
                        <p className="font-body-md text-on-surface font-medium">Bife Ancho 300g</p>
                        <p className="font-body-sm text-error italic">Ponto: Mal Passado</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-tertiary-fixed-dim hover:bg-tertiary-container text-on-tertiary-fixed-variant font-label-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[18px]">done_all</span>
                    MARCAR PRONTO
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Pronto */}
            <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden opacity-80">
              <div className="p-3 border-b border-surface-variant bg-surface flex justify-between items-center shrink-0">
                <h3 className="font-label-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600 text-sm">room_service</span>
                  PRONTO
                  <span className="bg-surface-container text-on-surface text-xs px-2 py-0.5 rounded-full ml-1">1</span>
                </h3>
              </div>
              <div className="p-3 overflow-y-auto kanban-column flex flex-col gap-3">
                {/* Order Card 4 */}
                <div className="bg-surface-container-lowest border border-green-200 rounded-lg p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <div>
                      <span className="font-h3 text-on-surface">#4085</span>
                      <p className="font-body-sm text-on-surface-variant">Mesa 04 • Salão</p>
                    </div>
                    <div className="bg-green-100 text-green-800 font-label-bold text-[12px] px-2 py-1 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Pronto
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 pl-2 opacity-60">
                    <p className="font-body-sm text-on-surface-variant italic">2 itens concluídos</p>
                  </div>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-label-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                    DESPACHAR
                  </button>
                </div>
              </div>
            </div>

            {/* Column 4: Entregue */}
            <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden opacity-50 hidden xl:flex">
              <div className="p-3 border-b border-surface-variant bg-surface flex justify-between items-center shrink-0">
                <h3 className="font-label-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-sm">task_alt</span>
                  ENTREGUE
                  <span className="bg-surface-container text-on-surface text-xs px-2 py-0.5 rounded-full ml-1">14</span>
                </h3>
              </div>
              <div className="p-3 overflow-y-auto kanban-column flex flex-col gap-3">
                <div className="flex flex-col items-center justify-center h-32 text-outline">
                  <span className="material-symbols-outlined text-3xl mb-2">inventory_2</span>
                  <p className="font-body-sm">Pedidos finalizados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
