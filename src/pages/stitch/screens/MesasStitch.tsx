import React, { useEffect } from 'react';

/**
 * MesasStitch - Tela de Gestão de Mesas convertida do Google Stitch
 * 100% fiel ao design original com escopo isolado.
 */
export default function MesasStitch() {
  useEffect(() => {
    // Injetar fontes necessárias
    if (!document.getElementById('stitch-fonts')) {
      const link = document.createElement('link');
      link.id = 'stitch-fonts';
      link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Injetar ícones Material Symbols
    if (!document.getElementById('stitch-icons')) {
      const link = document.createElement('link');
      link.id = 'stitch-icons';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="stitch-mesas-scope w-full h-screen overflow-hidden bg-background text-on-background font-body-md antialiased">
      <style>{`
        .stitch-mesas-scope {
          /* Cores extraídas do tailwind.config do Stitch */
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

          /* Tipografia */
          --font-plus-jakarta: 'Plus Jakarta Sans', sans-serif;
          --font-inter: 'Inter', sans-serif;
        }

        .stitch-mesas-scope .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
          width: 24px;
          height: 24px;
          vertical-align: middle;
        }

        /* Mapeamento de utilitários Stitch */
        .stitch-mesas-scope .bg-background { background-color: var(--background); }
        .stitch-mesas-scope .bg-surface { background-color: var(--surface); }
        .stitch-mesas-scope .bg-primary { background-color: var(--primary); }
        .stitch-mesas-scope .bg-primary-container { background-color: var(--primary-container); }
        .stitch-mesas-scope .bg-secondary-container { background-color: var(--secondary-container); }
        .stitch-mesas-scope .bg-tertiary-container { background-color: var(--tertiary-container); }
        .stitch-mesas-scope .bg-surface-container { background-color: var(--surface-container); }
        .stitch-mesas-scope .bg-surface-container-low { background-color: var(--surface-container-low); }
        .stitch-mesas-scope .bg-surface-container-high { background-color: var(--surface-container-high); }
        .stitch-mesas-scope .bg-surface-container-lowest { background-color: var(--surface-container-lowest); }
        .stitch-mesas-scope .bg-surface-tint { background-color: var(--surface-tint); }
        .stitch-mesas-scope .bg-tertiary { background-color: var(--tertiary); }
        .stitch-mesas-scope .bg-secondary-fixed-dim { background-color: var(--secondary-fixed-dim); }

        .stitch-mesas-scope .text-on-background { color: var(--on-background); }
        .stitch-mesas-scope .text-on-surface { color: var(--on-surface); }
        .stitch-mesas-scope .text-secondary { color: var(--secondary); }
        .stitch-mesas-scope .text-on-primary { color: var(--on-primary); }
        .stitch-mesas-scope .text-primary { color: var(--primary); }
        .stitch-mesas-scope .text-tertiary { color: var(--tertiary); }
        .stitch-mesas-scope .text-on-primary-container { color: var(--on-primary-container); }
        .stitch-mesas-scope .text-on-secondary-container { color: var(--on-secondary-container); }
        .stitch-mesas-scope .text-secondary-fixed-dim { color: var(--secondary-fixed-dim); }

        .stitch-mesas-scope .font-h1 { font-family: var(--font-plus-jakarta); font-weight: 800; font-size: 32px; line-height: 1.2; }
        .stitch-mesas-scope .font-h2 { font-family: var(--font-plus-jakarta); font-weight: 700; font-size: 24px; line-height: 1.3; }
        .stitch-mesas-scope .font-h3 { font-family: var(--font-plus-jakarta); font-weight: 700; font-size: 20px; line-height: 1.3; }
        .stitch-mesas-scope .font-price-display { font-family: var(--font-plus-jakarta); font-weight: 700; font-size: 20px; line-height: 1.0; }
        .stitch-mesas-scope .font-label-bold { font-family: var(--font-inter); font-weight: 600; font-size: 14px; line-height: 1.0; }
        .stitch-mesas-scope .font-body-md { font-family: var(--font-inter); font-weight: 400; font-size: 16px; line-height: 1.5; }
        .stitch-mesas-scope .font-body-sm { font-family: var(--font-inter); font-weight: 400; font-size: 14px; line-height: 1.4; }
        .stitch-mesas-scope .font-body-lg { font-family: var(--font-inter); font-weight: 400; font-size: 18px; line-height: 1.6; }

        .stitch-mesas-scope .gap-stack-md { gap: 16px; }
        .stitch-mesas-scope .gap-stack-lg { gap: 32px; }
        .stitch-mesas-scope .mb-stack-md { margin-bottom: 16px; }
        .stitch-mesas-scope .mb-stack-lg { margin-bottom: 32px; }
        .stitch-mesas-scope .p-container-padding-mobile { padding: 16px; }
        .stitch-mesas-scope .md\\:p-container-padding-desktop { padding: 40px; }

        .stitch-mesas-scope .hide-scrollbar::-webkit-scrollbar { display: none; }
        .stitch-mesas-scope .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Dark Mode Support */
        .dark .stitch-mesas-scope {
          /* Adicionar overrides de dark mode se necessário, mas por enquanto mantendo literal */
        }

      `}</style>

      <div className="flex h-screen w-full flex-col md:flex-row">
        {/* Sidebar NavigationDrawer (Desktop) */}
        <nav className="hidden md:flex flex-col h-screen p-4 space-y-2 bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800 h-full w-72 rounded-none z-10 shrink-0">
          <div className="text-red-600 font-black text-xl mb-8 flex items-center gap-3 px-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
            COMANDA PRO
          </div>
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
              <img alt="Admin User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbJSS3c8eWirmElkZSsZUgKka2attfQ3TQaxTgXav80nzAQGRzOCvkIUX-CByUtnhTAYlJUbQ-9DHlTplHV7IxYoGwemTBNQ9IcD9ZH8WE-8H6mVXJgpp82mwJOg4G3mwj26YpYU8N5DciX3HSTCwmgcum9qSQHxJF2QuXag2Dg6GHs7H2YszBzqBmPckbnNSfED6-IW5i85GcfJKqAsuxdq16ykYZ5qPjg2v0E3iRhY532juDdH3e7L6LVhk9GVGt58SBpjMHyPE"/>
            </div>
            <div>
              <div className="font-label-bold text-on-surface">Store Admin</div>
              <div className="font-body-sm text-secondary">Central Kitchen #01</div>
            </div>
          </div>
          <a className="flex items-center gap-3 px-3 py-2.5 font-['Plus_Jakarta_Sans'] text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 font-['Plus_Jakarta_Sans'] text-sm font-medium bg-red-50 dark:bg-red-900/10 text-red-600 font-bold rounded-lg duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">notifications_active</span>
            Live Orders
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 font-['Plus_Jakarta_Sans'] text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">edit_note</span>
            Menu Editor
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 font-['Plus_Jakarta_Sans'] text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">bar_chart</span>
            Analytics
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 font-['Plus_Jakarta_Sans'] text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 font-['Plus_Jakarta_Sans'] text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined">group</span>
            Staff
          </a>
        </nav>
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-surface">
          {/* TopAppBar (Mobile) */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 w-full h-16 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <button className="text-red-600 dark:text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors active:scale-95 duration-150 p-2 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="text-red-600 dark:text-red-500 font-black tracking-tighter italic text-xl">
              COMANDA PRO
            </div>
            <button className="text-red-600 dark:text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors active:scale-95 duration-150 p-2 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">search</span>
            </button>
          </header>
          {/* Scrollable Canvas */}
          <div className="flex-1 overflow-y-auto p-container-padding-mobile md:p-container-padding-desktop pb-32 md:pb-container-padding-desktop">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md mb-stack-lg">
              <div>
                <h1 className="font-h1 text-h1 text-on-surface">Gestão de Mesas</h1>
                <p className="font-body-md text-secondary mt-1">Acompanhe e gerencie o status das mesas em tempo real.</p>
              </div>
              <button className="bg-primary text-on-primary rounded-full px-6 py-3 font-label-bold text-label-bold flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(234,29,44,0.15)] hover:bg-primary-container hover:text-on-primary-container transition-colors active:scale-95">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
                Gerar QR Code
              </button>
            </div>
            {/* Filters */}
            <div className="flex overflow-x-auto pb-4 mb-stack-md gap-3 hide-scrollbar">
              <button className="shrink-0 px-5 py-2 rounded-full bg-surface-tint text-on-primary font-label-bold text-label-bold shadow-sm transition-all">
                Todos
              </button>
              <button className="shrink-0 px-5 py-2 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high font-label-bold text-label-bold transition-all">
                Livre
              </button>
              <button className="shrink-0 px-5 py-2 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high font-label-bold text-label-bold transition-all">
                Ocupada
              </button>
              <button className="shrink-0 px-5 py-2 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high font-label-bold text-label-bold transition-all">
                Aguardando Pagamento
              </button>
            </div>
            {/* Tables Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-stack-md">
              {/* Table Card: Livre */}
              <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-surface-container relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
                <div className="flex justify-between items-start mb-8">
                  <h2 className="font-h2 text-h2 text-on-surface">01</h2>
                  <span className="px-2 py-1 rounded-md bg-secondary-container text-on-secondary-container font-label-bold text-[10px] uppercase tracking-wider">Livre</span>
                </div>
                <div className="mt-auto">
                  <p className="font-body-sm text-secondary mb-1">Total Parcial</p>
                  <p className="font-price-display text-price-display text-secondary-fixed-dim">R$ 0,00</p>
                </div>
              </div>
              {/* Table Card: Ocupada */}
              <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-surface-container relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                <div className="flex justify-between items-start mb-8">
                  <h2 className="font-h2 text-h2 text-on-surface">02</h2>
                  <span className="px-2 py-1 rounded-md bg-primary-container text-on-primary-container font-label-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    45 min
                  </span>
                </div>
                <div className="mt-auto">
                  <p className="font-body-sm text-secondary mb-1">Total Parcial</p>
                  <p className="font-price-display text-price-display text-primary">R$ 142,50</p>
                </div>
              </div>
              {/* Table Card: Aguardando Pagamento */}
              <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-surface-container relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
                <div className="absolute top-0 left-0 w-full h-1 bg-tertiary"></div>
                <div className="flex justify-between items-start mb-8">
                  <h2 className="font-h2 text-h2 text-on-surface">03</h2>
                  <span className="px-2 py-1 rounded-md bg-tertiary-container text-tertiary font-label-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">payments</span>
                    Aguardando
                  </span>
                </div>
                <div className="mt-auto">
                  <p className="font-body-sm text-secondary mb-1">Total Final</p>
                  <p className="font-price-display text-price-display text-tertiary">R$ 89,90</p>
                </div>
              </div>
              {/* Table Card: Ocupada */}
              <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-surface-container relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                <div className="flex justify-between items-start mb-8">
                  <h2 className="font-h2 text-h2 text-on-surface">04</h2>
                  <span className="px-2 py-1 rounded-md bg-primary-container text-on-primary-container font-label-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    12 min
                  </span>
                </div>
                <div className="mt-auto">
                  <p className="font-body-sm text-secondary mb-1">Total Parcial</p>
                  <p className="font-price-display text-price-display text-primary">R$ 35,00</p>
                </div>
              </div>
              {/* Table Card: Livre */}
              <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-surface-container relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
                <div className="flex justify-between items-start mb-8">
                  <h2 className="font-h2 text-h2 text-on-surface">05</h2>
                  <span className="px-2 py-1 rounded-md bg-secondary-container text-on-secondary-container font-label-bold text-[10px] uppercase tracking-wider">Livre</span>
                </div>
                <div className="mt-auto">
                  <p className="font-body-sm text-secondary mb-1">Total Parcial</p>
                  <p className="font-price-display text-price-display text-secondary-fixed-dim">R$ 0,00</p>
                </div>
              </div>
              {/* Table Card: Livre */}
              <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-surface-container relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
                <div className="flex justify-between items-start mb-8">
                  <h2 className="font-h2 text-h2 text-on-surface">06</h2>
                  <span className="px-2 py-1 rounded-md bg-secondary-container text-on-secondary-container font-label-bold text-[10px] uppercase tracking-wider">Livre</span>
                </div>
                <div className="mt-auto">
                  <p className="font-body-sm text-secondary mb-1">Total Parcial</p>
                  <p className="font-price-display text-price-display text-secondary-fixed-dim">R$ 0,00</p>
                </div>
              </div>
              {/* Table Card: Ocupada */}
              <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-surface-container relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                <div className="flex justify-between items-start mb-8">
                  <h2 className="font-h2 text-h2 text-on-surface">07</h2>
                  <span className="px-2 py-1 rounded-md bg-primary-container text-on-primary-container font-label-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    85 min
                  </span>
                </div>
                <div className="mt-auto">
                  <p className="font-body-sm text-secondary mb-1">Total Parcial</p>
                  <p className="font-price-display text-price-display text-primary">R$ 310,20</p>
                </div>
              </div>
            </div>
          </div>
          {/* BottomNavBar (Mobile) */}
          <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-6 bg-zinc-900 dark:bg-black sticky bottom-0 rounded-t-2xl shadow-[0_-8px_30px_rgba(234,29,44,0.15)]">
            <a className="flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-all active:translate-y-1 duration-200" href="#">
              <span className="material-symbols-outlined mb-1">restaurant_menu</span>
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Menu</span>
            </a>
            <a className="flex flex-col items-center justify-center text-red-500 scale-110 hover:text-white transition-all active:translate-y-1 duration-200" href="#">
              <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Orders</span>
            </a>
            <a className="flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-all active:translate-y-1 duration-200" href="#">
              <span className="material-symbols-outlined mb-1">person</span>
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Profile</span>
            </a>
            <a className="flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-all active:translate-y-1 duration-200" href="#">
              <span className="material-symbols-outlined mb-1">shopping_bag</span>
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Cart</span>
            </a>
          </nav>
        </main>
      </div>
    </div>
  );
}
