import React, { useEffect } from 'react';

/**
 * SettingsStitch Component
 * 
 * 100% fidelity conversion from Stitch design.
 * Uses isolated CSS scoping and custom design tokens.
 */
const SettingsStitch: React.FC = () => {
  useEffect(() => {
    // Inject required fonts and icons
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const font1 = document.createElement('link');
    font1.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Plus+Jakarta+Sans:wght@400;700;800&display=swap';
    font1.rel = 'stylesheet';
    document.head.appendChild(font1);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(font1);
    };
  }, []);

  return (
    <div className="stitch-scope-configura_es_do_sistema_comanda_pro">
      <style>{`
        .stitch-scope-configura_es_do_sistema_comanda_pro {
          /* Design Tokens from tailwind.config literal */
          --primary: #bb001b;
          --on-primary: #ffffff;
          --primary-container: #e6182a;
          --on-primary-container: #fffbff;
          --on-primary-fixed-variant: #930013;
          --primary-fixed: #ffdad7;
          
          --secondary: #5f5e5e;
          --on-secondary: #ffffff;
          --secondary-container: #e4e2e1;
          --on-secondary-container: #656464;
          --secondary-fixed: #e4e2e1;
          --secondary-fixed-dim: #c8c6c6;
          
          --tertiary: #795600;
          --on-tertiary: #ffffff;
          --tertiary-container: #986d00;
          --on-tertiary-container: #fffbff;
          
          --background: #f9f9f9;
          --on-background: #1a1c1c;
          
          --surface: #f9f9f9;
          --on-surface: #1a1c1c;
          --surface-variant: #e2e2e2;
          --on-surface-variant: #5d3f3d;
          --surface-tint: #c0001c;
          --surface-dim: #dadada;
          --surface-bright: #f9f9f9;
          
          --outline: #926e6b;
          --outline-variant: #e7bcb9;
          
          --surface-container-lowest: #ffffff;
          --surface-container-low: #f3f3f3;
          --surface-container: #eeeeee;
          --surface-container-high: #e8e8e8;
          --surface-container-highest: #e2e2e2;
          
          --error: #ba1a1a;
          --on-error: #ffffff;
          --error-container: #ffdad6;
          --on-error-container: #93000a;
          
          /* Spacing Tokens */
          --section-gap: 48px;
          --container-padding-desktop: 40px;
          --stack-lg: 32px;
          --stack-md: 16px;
          --stack-sm: 8px;

          background-color: var(--background);
          color: var(--on-background);
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          display: flex;
          width: 100%;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
        }

        /* Typography Mapping */
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 32px; line-height: 1.2; font-weight: 800; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; line-height: 1.3; font-weight: 700; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; line-height: 1.3; font-weight: 700; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-body-lg { font-family: 'Inter', sans-serif; font-size: 18px; line-height: 1.6; font-weight: 400; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-body-md { font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.5; font-weight: 400; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-body-sm { font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.4; font-weight: 400; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-label-bold { font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.0; font-weight: 600; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-price-display { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; line-height: 1.0; font-weight: 700; }

        .stitch-scope-configura_es_do_sistema_comanda_pro .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-style: normal;
          display: inline-block;
          line-height: 1;
          text-transform: none;
          letter-spacing: normal;
          word-wrap: normal;
          white-space: nowrap;
          direction: ltr;
        }

        /* Utility Classes within Scope */
        .stitch-scope-configura_es_do_sistema_comanda_pro .bg-primary { background-color: var(--primary); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .text-primary { color: var(--primary); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .bg-on-primary { color: var(--on-primary); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .text-on-primary { color: var(--on-primary); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .bg-primary-container { background-color: var(--primary-container); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .text-on-primary-container { color: var(--on-primary-container); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .bg-surface-container-lowest { background-color: var(--surface-container-lowest); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .bg-surface-container { background-color: var(--surface-container); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .border-surface-container-high { border-color: var(--surface-container-high); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .text-on-surface { color: var(--on-surface); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .text-on-surface-variant { color: var(--on-surface-variant); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .text-secondary { color: var(--secondary); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .text-error { color: var(--error); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .bg-error-container { background-color: var(--error-container); }
        .stitch-scope-configura_es_do_sistema_comanda_pro .border-error-container { border-color: var(--error-container); }
        
        .stitch-scope-configura_es_do_sistema_comanda_pro .no-scrollbar::-webkit-scrollbar { display: none; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Custom Input Styling */
        .stitch-scope-configura_es_do_sistema_comanda_pro input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(187, 0, 27, 0.2);
        }
      `}</style>

      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm flex flex-col p-4 space-y-2 z-50">
        <div className="px-4 py-6 mb-4 flex flex-col items-start gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-h3 shadow-sm">
              SG
            </div>
            <div>
              <h2 className="text-2xl font-black text-red-600 dark:text-red-500 tracking-tighter leading-tight">Admin SaaS</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Restaurant Manager</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200 rounded-lg active:scale-95 transition-transform" href="#">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="font-body-sm font-medium">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200 rounded-lg active:scale-95 transition-transform" href="#">
            <span className="material-symbols-outlined text-[20px]">table_restaurant</span>
            <span className="font-body-sm font-medium">Mesas</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200 rounded-lg active:scale-95 transition-transform" href="#">
            <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
            <span className="font-body-sm font-medium">Cardápio</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200 rounded-lg active:scale-95 transition-transform" href="#">
            <span className="material-symbols-outlined text-[20px]">skillet</span>
            <span className="font-body-sm font-medium">Cozinha</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200 rounded-lg active:scale-95 transition-transform" href="#">
            <span className="material-symbols-outlined text-[20px]">payments</span>
            <span className="font-body-sm font-medium">Caixa</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200 rounded-lg active:scale-95 transition-transform" href="#">
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <span className="font-body-sm font-medium">Relatórios</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg font-semibold active:scale-95 transition-transform" href="#">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
            <span className="font-body-sm">Configurações</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <header className="w-full sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-center h-16 px-8">
            <div className="flex-1 max-w-md">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
                </div>
                <input className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full text-sm placeholder-gray-500 focus:outline-none transition-all bg-gray-50 group-hover:bg-white text-gray-900 font-plus-jakarta-sans" placeholder="Buscar configurações..." type="text"/>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all rounded-full hover:bg-gray-100">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all rounded-full hover:bg-gray-100">
                <span className="material-symbols-outlined">help</span>
              </button>
              <button className="ml-2 pl-2 border-l border-gray-200 flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all">
                <span className="material-symbols-outlined text-[28px]">account_circle</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-[40px] w-full max-w-[1200px] mx-auto">
          <div className="mb-[32px] flex flex-col md:flex-row md:items-end justify-between gap-[16px]">
            <div>
              <h1 className="font-h1 text-on-surface tracking-tight">Configurações do Sistema</h1>
              <p className="font-body-md text-secondary mt-2">Gerencie as preferências, dados do estabelecimento e personalize sua experiência.</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label-bold px-6 py-3 rounded-full hover:bg-[#930013] transition-colors shadow-lg shadow-primary/20 active:scale-95 duration-200 whitespace-nowrap">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Salvar Alterações
            </button>
          </div>

          <div className="mb-[48px] border-b border-surface-container-high overflow-x-auto no-scrollbar">
            <nav className="-mb-px flex space-x-8">
              <a className="border-primary text-primary whitespace-nowrap py-4 px-1 border-b-2 font-label-bold flex items-center gap-2" href="#" aria-current="page">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
                Dados do Restaurante
              </a>
              <a className="border-transparent text-secondary hover:text-on-surface hover:border-surface-variant whitespace-nowrap py-4 px-1 border-b-2 font-label-bold flex items-center gap-2 transition-colors" href="#">
                <span className="material-symbols-outlined text-[18px]">group</span>
                Gestão de Usuários
              </a>
              <a className="border-transparent text-secondary hover:text-on-surface hover:border-surface-variant whitespace-nowrap py-4 px-1 border-b-2 font-label-bold flex items-center gap-2 transition-colors" href="#">
                <span className="material-symbols-outlined text-[18px]">table_bar</span>
                Configuração de Mesas
              </a>
              <a className="border-transparent text-secondary hover:text-on-surface hover:border-surface-variant whitespace-nowrap py-4 px-1 border-b-2 font-label-bold flex items-center gap-2 transition-colors" href="#">
                <span className="material-symbols-outlined text-[18px]">palette</span>
                Aparência
              </a>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[32px] items-start">
            <div className="lg:col-span-2 space-y-[32px]">
              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-high relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-surface-tint opacity-80"></div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">info</span>
                  </div>
                  <h2 className="font-h3 text-on-surface">Informações Gerais</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block font-label-bold text-on-surface-variant">Nome do Estabelecimento <span className="text-error">*</span></label>
                    <input className="w-full bg-surface border border-surface-container-high rounded-lg px-4 py-3 font-body-md text-on-surface transition-all shadow-sm" type="text" defaultValue="SaaS Gourmet Premium"/>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-label-bold text-on-surface-variant">CNPJ</label>
                    <input className="w-full bg-surface border border-surface-container-high rounded-lg px-4 py-3 font-body-md text-on-surface transition-all shadow-sm" placeholder="00.000.000/0001-00" type="text"/>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-label-bold text-on-surface-variant">Telefone de Contato</label>
                    <input className="w-full bg-surface border border-surface-container-high rounded-lg px-4 py-3 font-body-md text-on-surface transition-all shadow-sm" placeholder="(11) 99999-9999" type="tel"/>
                  </div>
                </div>
              </section>

              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-high relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                  </div>
                  <h2 className="font-h3 text-on-surface">Endereço de Operação</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
                  <div className="md:col-span-1 space-y-2 relative">
                    <label className="block font-label-bold text-on-surface-variant">CEP</label>
                    <div className="relative">
                      <input className="w-full bg-surface border border-surface-container-high rounded-lg pl-4 pr-10 py-3 font-body-md text-on-surface transition-all shadow-sm" placeholder="00000-000" type="text"/>
                      <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary hover:text-on-primary-fixed-variant transition-colors">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block font-label-bold text-on-surface-variant">Rua / Avenida</label>
                    <input className="w-full bg-surface border border-surface-container-high rounded-lg px-4 py-3 font-body-md text-on-surface transition-all shadow-sm" placeholder="Ex: Av. Paulista" type="text"/>
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="block font-label-bold text-on-surface-variant">Número</label>
                    <input className="w-full bg-surface border border-surface-container-high rounded-lg px-4 py-3 font-body-md text-on-surface transition-all shadow-sm" placeholder="1000" type="text"/>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block font-label-bold text-on-surface-variant">Complemento (Opcional)</label>
                    <input className="w-full bg-surface border border-surface-container-high rounded-lg px-4 py-3 font-body-md text-on-surface transition-all shadow-sm" placeholder="Sala, Andar, Bloco..." type="text"/>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-[32px]">
              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-high flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">image</span>
                  </div>
                  <h2 className="font-h3 text-on-surface">Identidade Visual</h2>
                </div>
                <p className="font-body-sm text-secondary mb-4">Faça upload da logo do seu restaurante para exibi-la nos recibos, cardápio digital e área do cliente.</p>
                
                <div className="mt-2 flex-1 flex justify-center rounded-xl border-2 border-dashed border-outline-variant px-6 py-10 hover:border-primary/50 hover:bg-primary-fixed/20 transition-all cursor-pointer group relative overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-cover bg-center" 
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD14kRYP1aXEC0teEt7t6nX7-if0dytZlccDTP8z6ilHHEEFlZrZv4Q8rSo5DC-XFFF9WAuAr0ox_LXtUMDJKyg0TNe7q1R_SoP63dTz9LfvPPyHnP-Rr7-jkC6pj5oZX4J7MGJY0APPOWWyXIr-KQyK_Up1FH4_9pcACohHheCRwZsuunyGt4bK5x-YafKmSHws86NGoGMlmxZc4NCnvqesfk6BJz-g2qGtPMNYJSyidP_UDIWqEKQ1qMwe2A3q3RSgZQLR5vAbB8')" }}
                  ></div>
                  <div className="text-center relative z-10">
                    <span className="material-symbols-outlined text-[48px] text-secondary-fixed-dim group-hover:text-primary transition-colors mb-3 block">cloud_upload</span>
                    <div className="mt-4 flex flex-col items-center text-sm leading-6 text-on-surface-variant">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-transparent font-label-bold text-primary hover:text-on-primary-fixed-variant">
                        <span>Fazer upload de arquivo</span>
                        <input id="file-upload" name="file-upload" className="sr-only" type="file"/>
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="font-body-sm text-secondary mt-2">PNG, JPG, SVG até 5MB</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-surface-container flex items-center justify-between">
                  <div>
                    <h3 className="font-label-bold text-on-surface">Tema do Cardápio Digital</h3>
                    <p className="font-body-sm text-secondary mt-1">Preferência de cor para clientes.</p>
                  </div>
                  <button aria-checked="true" role="switch" className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out">
                    <span aria-hidden="true" className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-[32px] p-6 rounded-xl border border-error-container bg-error-container/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-h3 text-error flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">warning</span>
                Zona de Perigo
              </h3>
              <p className="font-body-sm text-on-surface-variant mt-1">Ações destrutivas relativas à sua conta e dados do restaurante.</p>
            </div>
            <button className="px-5 py-2.5 bg-transparent border border-error text-error rounded-lg font-label-bold hover:bg-error hover:text-on-error transition-colors whitespace-nowrap">
              Desativar Conta
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsStitch;
