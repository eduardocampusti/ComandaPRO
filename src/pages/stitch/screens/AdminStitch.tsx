import React from 'react';

const AdminStitch: React.FC = () => {
  return (
    <div className="stitch-admin-scope bg-surface font-body-md text-on-surface antialiased flex h-screen overflow-hidden w-full">
      {/* Definindo as variáveis CSS baseadas no code.html original */}
      <style dangerouslySetInnerHTML={{ __html: `
        .stitch-admin-scope {
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
          
          --font-plus-jakarta: 'Plus Jakarta Sans', sans-serif;
          --font-inter: 'Inter', sans-serif;
        }

        .stitch-admin-scope .font-h1 { font-family: var(--font-plus-jakarta); font-size: 32px; font-weight: 800; line-height: 1.2; }
        .stitch-admin-scope .font-h2 { font-family: var(--font-plus-jakarta); font-size: 24px; font-weight: 700; line-height: 1.3; }
        .stitch-admin-scope .font-h3 { font-family: var(--font-plus-jakarta); font-size: 20px; font-weight: 700; line-height: 1.3; }
        .stitch-admin-scope .font-body-lg { font-family: var(--font-inter); font-size: 18px; font-weight: 400; line-height: 1.6; }
        .stitch-admin-scope .font-body-md { font-family: var(--font-inter); font-size: 16px; font-weight: 400; line-height: 1.5; }
        .stitch-admin-scope .font-body-sm { font-family: var(--font-inter); font-size: 14px; font-weight: 400; line-height: 1.4; }
        .stitch-admin-scope .font-label-bold { font-family: var(--font-inter); font-size: 14px; font-weight: 600; line-height: 1.0; }
        .stitch-admin-scope .font-price-display { font-family: var(--font-plus-jakarta); font-size: 20px; font-weight: 700; line-height: 1.0; }

        .stitch-admin-scope .bg-surface { background-color: var(--surface); }
        .stitch-admin-scope .bg-surface-container-lowest { background-color: var(--surface-container-lowest); }
        .stitch-admin-scope .bg-surface-container-low { background-color: var(--surface-container-low); }
        .stitch-admin-scope .bg-surface-container { background-color: var(--surface-container); }
        .stitch-admin-scope .bg-surface-container-highest { background-color: var(--surface-container-highest); }
        .stitch-admin-scope .bg-surface-bright { background-color: var(--surface-bright); }
        .stitch-admin-scope .bg-error-container { background-color: var(--error-container); }
        .stitch-admin-scope .bg-primary { background-color: var(--primary); }
        .stitch-admin-scope .bg-primary-container { background-color: var(--primary-container); }
        .stitch-admin-scope .bg-primary-fixed-dim { background-color: var(--primary-fixed-dim); }
        .stitch-admin-scope .bg-primary-fixed { background-color: var(--primary-fixed); }
        
        .stitch-admin-scope .text-primary { color: var(--primary); }
        .stitch-admin-scope .text-on-surface { color: var(--on-surface); }
        .stitch-admin-scope .text-on-surface-variant { color: var(--on-surface-variant); }
        .stitch-admin-scope .text-on-secondary-container { color: var(--on-secondary-container); }
        .stitch-admin-scope .text-on-primary-fixed-variant { color: var(--on-primary-fixed-variant); }
        
        .stitch-admin-scope .border-surface-variant { border-color: var(--surface-variant); }
        .stitch-admin-scope .border-outline-variant { border-color: var(--outline-variant); }

        .stitch-admin-scope .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }

        /* Espaçamentos customizados */
        .stitch-admin-scope .p-container-padding-desktop { padding: 40px; }
        .stitch-admin-scope .py-container-padding-desktop { padding-top: 40px; padding-bottom: 40px; }
        .stitch-admin-scope .space-y-section-gap > :not([hidden]) ~ :not([hidden]) { --tw-space-y-reverse: 0; margin-top: calc(48px * calc(1 - var(--tw-space-y-reverse))); margin-bottom: calc(48px * var(--tw-space-y-reverse)); }
      ` }} />

      {/* NavigationDrawer */}
      <aside className="bg-surface-container-lowest text-primary flex flex-col h-screen p-4 space-y-2 w-72 border-r border-surface-variant z-20 flex-shrink-0">
        <div className="mb-8">
          <h1 className="text-primary font-black text-xl italic tracking-tighter">COMANDA PRO</h1>
        </div>
        
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden flex-shrink-0">
            <img 
              alt="Admin User" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuApFqaUTeMQ-OoEZcJ4u75s9lq1YtzEzaHPEUPFuHs1dW3Kar2pjiI62jNLaskAUhPhFe_th2W6rVUw49pzBwDCj17u6r4lwHhx4QISYaT2t_va9Rrk1tSdbgofwbzMhili0Jawy9iP6_SpEO4B57gpntj7m5wS8FvfTZ4quKO-wNlAiCR96pNeAPhOnduFHOXAoro2juYw_CDRCiUkK-ZAb_RDTYEp6rLgqg-hMoqIIdLSyYnF91vh4OHVGJD-gUMFsmxxAYhkEG8"
            />
          </div>
          <div>
            <p className="font-h3 text-on-surface text-[20px]">Store Admin</p>
            <p className="font-body-sm text-on-surface-variant">Central Kitchen #01</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <a className="flex items-center space-x-3 px-3 py-2 bg-error-container text-primary font-bold rounded-lg duration-200 ease-in-out hover:translate-x-1 transition-transform" href="#/stitch/painel">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="font-plus-jakarta text-sm font-medium">Dashboard</span>
          </a>
          <a className="flex items-center space-x-3 px-3 py-2 text-on-secondary-container hover:bg-surface-container-low rounded-lg duration-200 ease-in-out hover:translate-x-1 transition-transform" href="#/stitch/kds">
            <span className="material-symbols-outlined">notifications_active</span>
            <span className="font-plus-jakarta text-sm font-medium">Live Orders</span>
          </a>
          <a className="flex items-center space-x-3 px-3 py-2 text-on-secondary-container hover:bg-surface-container-low rounded-lg duration-200 ease-in-out hover:translate-x-1 transition-transform" href="#/stitch/cardapio-web">
            <span className="material-symbols-outlined">edit_note</span>
            <span className="font-plus-jakarta text-sm font-medium">Menu Editor</span>
          </a>
          <a className="flex items-center space-x-3 px-3 py-2 text-on-secondary-container hover:bg-surface-container-low rounded-lg duration-200 ease-in-out hover:translate-x-1 transition-transform" href="#/stitch/relatorios">
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="font-plus-jakarta text-sm font-medium">Analytics</span>
          </a>
          <a className="flex items-center space-x-3 px-3 py-2 text-on-secondary-container hover:bg-surface-container-low rounded-lg duration-200 ease-in-out hover:translate-x-1 transition-transform" href="#/stitch/configuracoes">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-plus-jakarta text-sm font-medium">Settings</span>
          </a>
          <a className="flex items-center space-x-3 px-3 py-2 text-on-secondary-container hover:bg-surface-container-low rounded-lg duration-200 ease-in-out hover:translate-x-1 transition-transform" href="#">
            <span className="material-symbols-outlined">group</span>
            <span className="font-plus-jakarta text-sm font-medium">Staff</span>
          </a>
        </nav>

        <div className="mt-auto">
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-on-secondary-container hover:bg-surface-container-low rounded-lg duration-200 ease-in-out transition-colors">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-plus-jakarta text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-surface relative">
        {/* TopAppBar */}
        <header className="bg-surface-container-lowest/95 backdrop-blur-md flex items-center justify-between px-container-padding-desktop py-3 w-full h-16 border-b border-surface-variant z-10 flex-shrink-0">
          <h2 className="font-h2 text-on-surface tracking-tight">Overview</h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-surface-container-lowest"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-container-padding-desktop">
          <div className="max-w-[1200px] mx-auto space-y-section-gap">
            
            {/* Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-surface-variant/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-primary">receipt_long</span>
                </div>
                <p className="font-body-sm text-on-surface-variant mb-2">Pedidos Hoje</p>
                <p className="font-h1 text-on-surface mb-2">142</p>
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                  <span>+12% vs ontem</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-surface-variant/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-primary">payments</span>
                </div>
                <p className="font-body-sm text-on-surface-variant mb-2">Faturamento</p>
                <p className="font-h1 text-on-surface mb-2">R$ 4.850</p>
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                  <span>+8.5% vs ontem</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-surface-variant/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-primary">sell</span>
                </div>
                <p className="font-body-sm text-on-surface-variant mb-2">Ticket Médio</p>
                <p className="font-h1 text-on-surface mb-2">R$ 34,15</p>
                <div className="flex items-center text-sm text-outline font-medium">
                  <span className="material-symbols-outlined text-sm mr-1">trending_flat</span>
                  <span>Estável</span>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart Section */}
              <section className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-surface-variant/50 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-h3 text-on-surface">Vendas por Hora</h3>
                  <button className="text-primary font-label-bold hover:underline flex items-center">
                    Relatório Completo <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                  </button>
                </div>
                
                {/* Simulated Chart Area */}
                <div className="flex-1 min-h-[300px] flex items-end justify-between space-x-2 relative pt-10">
                  {/* Y-Axis Labels */}
                  <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-on-surface-variant pr-4">
                    <span>R$ 1k</span>
                    <span>R$ 500</span>
                    <span>R$ 0</span>
                  </div>
                  {/* Grid Lines */}
                  <div className="absolute left-10 right-0 top-0 bottom-8 flex flex-col justify-between z-0">
                    <div className="border-t border-surface-variant/30 w-full h-0"></div>
                    <div className="border-t border-surface-variant/30 w-full h-0"></div>
                    <div className="border-t border-surface-variant/30 w-full h-0"></div>
                  </div>
                  {/* Bars */}
                  <div className="w-full flex justify-between items-end h-[calc(100%-2rem)] z-10 pl-10">
                    <div className="w-1/12 bg-surface-container-highest rounded-t-sm h-[20%] group relative hover:bg-inverse-primary transition-colors cursor-pointer">
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface-container-lowest text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">R$ 200</span>
                    </div>
                    <div className="w-1/12 bg-surface-container-highest rounded-t-sm h-[35%] group relative hover:bg-inverse-primary transition-colors cursor-pointer">
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface-container-lowest text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">R$ 350</span>
                    </div>
                    <div className="w-1/12 bg-primary-fixed-dim rounded-t-sm h-[60%] group relative hover:bg-primary transition-colors cursor-pointer">
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface-container-lowest text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">R$ 600</span>
                    </div>
                    <div className="w-1/12 bg-primary rounded-t-sm h-[85%] shadow-[0_0_15px_rgba(230,24,42,0.3)] group relative hover:bg-primary-container transition-colors cursor-pointer">
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface-container-lowest text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">R$ 850</span>
                    </div>
                    <div className="w-1/12 bg-primary-fixed-dim rounded-t-sm h-[40%] group relative hover:bg-primary transition-colors cursor-pointer">
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface-container-lowest text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">R$ 400</span>
                    </div>
                    <div className="w-1/12 bg-surface-container-highest rounded-t-sm h-[25%] group relative hover:bg-inverse-primary transition-colors cursor-pointer">
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface-container-lowest text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">R$ 250</span>
                    </div>
                  </div>
                  {/* X-Axis Labels */}
                  <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs text-on-surface-variant pt-2 border-t border-surface-variant z-10">
                    <span>11h</span>
                    <span>12h</span>
                    <span>13h</span>
                    <span>14h</span>
                    <span>15h</span>
                    <span>16h</span>
                  </div>
                </div>
              </section>

              {/* Recent Orders List */}
              <section className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-surface-variant/50 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-surface-variant/50 bg-surface-bright">
                  <h3 className="font-h3 text-on-surface">Pedidos Recentes</h3>
                </div>
                <ul className="flex-1 overflow-y-auto divide-y divide-surface-variant/50">
                  {/* Order Item 1 */}
                  <li className="p-4 hover:bg-surface-container-lowest/50 transition-colors cursor-pointer flex justify-between items-center group">
                    <div>
                      <p className="font-label-bold text-on-surface">#8402</p>
                      <p className="font-body-sm text-on-surface-variant">João Silva • 2 itens</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Preparando</span>
                      <p className="font-price-display text-sm text-on-surface mt-1 group-hover:text-primary transition-colors">R$ 45,90</p>
                    </div>
                  </li>
                  {/* Order Item 2 */}
                  <li className="p-4 hover:bg-surface-container-lowest/50 transition-colors cursor-pointer flex justify-between items-center group">
                    <div>
                      <p className="font-label-bold text-on-surface">#8401</p>
                      <p className="font-body-sm text-on-surface-variant">Maria Oliveira • 1 item</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed-variant border border-outline-variant">Aguardando</span>
                      <p className="font-price-display text-sm text-on-surface mt-1 group-hover:text-primary transition-colors">R$ 22,50</p>
                    </div>
                  </li>
                  {/* Order Item 3 */}
                  <li className="p-4 hover:bg-surface-container-lowest/50 transition-colors cursor-pointer flex justify-between items-center group">
                    <div>
                      <p className="font-label-bold text-on-surface">#8400</p>
                      <p className="font-body-sm text-on-surface-variant">Carlos Eduardo • 4 itens</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">Pronto</span>
                      <p className="font-price-display text-sm text-on-surface mt-1 group-hover:text-primary transition-colors">R$ 112,00</p>
                    </div>
                  </li>
                  {/* Order Item 4 */}
                  <li className="p-4 hover:bg-surface-container-lowest/50 transition-colors cursor-pointer flex justify-between items-center group">
                    <div>
                      <p className="font-label-bold text-on-surface">#8399</p>
                      <p className="font-body-sm text-on-surface-variant">Ana Souza • 3 itens</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant border border-surface-variant">Entregue</span>
                      <p className="font-price-display text-sm text-on-surface mt-1 group-hover:text-primary transition-colors">R$ 89,90</p>
                    </div>
                  </li>
                </ul>
                <div className="p-4 border-t border-surface-variant/50 text-center">
                  <button className="text-on-secondary-container font-label-bold hover:text-primary transition-colors">Ver todos os pedidos</button>
                </div>
              </section>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminStitch;
