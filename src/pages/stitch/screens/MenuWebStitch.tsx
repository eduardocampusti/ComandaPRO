import React, { useEffect } from 'react';

/**
 * MenuWebStitch - Cardápio Digital Web
 * Pasta: card_pio_digital_web_comanda_pro
 * Fonte técnica literal: design-stitch/card_pio_digital_web_comanda_pro/code.html
 */
export default function MenuWebStitch() {
  useEffect(() => {
    const linkFonts = document.createElement('link');
    linkFonts.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;600&display=swap';
    linkFonts.rel = 'stylesheet';
    document.head.appendChild(linkFonts);

    const linkIcons = document.createElement('link');
    linkIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);
  }, []);

  return (
    <div className="stitch-scope-menu-web bg-background text-on-background font-body-md min-h-screen flex flex-col overflow-hidden antialiased">
      <style>{`
        .stitch-scope-menu-web {
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

          /* Spacing */
          --section-gap: 48px;
          --container-padding-mobile: 16px;
          --stack-md: 16px;
          --container-padding-desktop: 40px;
          --stack-lg: 32px;
          --unit: 4px;
          --stack-sm: 8px;
        }

        .stitch-scope-menu-web .bg-background { background-color: var(--background); }
        .stitch-scope-menu-web .bg-surface-container-low { background-color: var(--surface-container-low); }
        .stitch-scope-menu-web .bg-surface-container-highest { background-color: var(--surface-container-highest); }
        .stitch-scope-menu-web .bg-surface-container-lowest { background-color: var(--surface-container-lowest); }
        .stitch-scope-menu-web .bg-primary-container { background-color: var(--primary-container); }
        .stitch-scope-menu-web .bg-primary { background-color: var(--primary); }
        .stitch-scope-menu-web .bg-surface-container { background-color: var(--surface-container); }
        .stitch-scope-menu-web .bg-surface-container-high { background-color: var(--surface-container-high); }
        .stitch-scope-menu-web .bg-inverse-surface { background-color: var(--inverse-surface); }

        .stitch-scope-menu-web .text-on-background { color: var(--on-background); }
        .stitch-scope-menu-web .text-on-surface-variant { color: var(--on-surface-variant); }
        .stitch-scope-menu-web .text-on-surface { color: var(--on-surface); }
        .stitch-scope-menu-web .text-on-primary-container { color: var(--on-primary-container); }
        .stitch-scope-menu-web .text-on-primary { color: var(--on-primary); }
        .stitch-scope-menu-web .text-error { color: var(--error); }
        .stitch-scope-menu-web .text-surface-variant { color: var(--surface-variant); }

        .stitch-scope-menu-web .border-surface-variant { border-color: var(--surface-variant); }

        .stitch-scope-menu-web .font-h1 { font-family: 'Plus Jakarta Sans'; font-size: 32px; line-height: 1.2; font-weight: 800; }
        .stitch-scope-menu-web .font-h2 { font-family: 'Plus Jakarta Sans'; font-size: 24px; line-height: 1.3; font-weight: 700; }
        .stitch-scope-menu-web .font-h3 { font-family: 'Plus Jakarta Sans'; font-size: 20px; line-height: 1.3; font-weight: 700; }
        .stitch-scope-menu-web .font-body-md { font-family: 'Inter'; font-size: 16px; line-height: 1.5; font-weight: 400; }
        .stitch-scope-menu-web .font-body-sm { font-family: 'Inter'; font-size: 14px; line-height: 1.4; font-weight: 400; }
        .stitch-scope-menu-web .font-label-bold { font-family: 'Inter'; font-size: 14px; line-height: 1.0; font-weight: 600; }
        .stitch-scope-menu-web .font-price-display { font-family: 'Plus Jakarta Sans'; font-size: 20px; line-height: 1.0; font-weight: 700; }

        .stitch-scope-menu-web .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            line-height: 1;
            width: 24px;
            height: 24px;
        }
        .stitch-scope-menu-web .material-symbols-outlined.filled {
            font-variation-settings: 'FILL' 1;
        }
        
        .stitch-scope-menu-web .no-scrollbar::-webkit-scrollbar { display: none; }
        .stitch-scope-menu-web .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* TopAppBar */}
      <header className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md top-0 sticky z-50 border-b border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between px-4 py-3 w-full h-16">
        <div className="flex items-center gap-4">
          <button className="text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors p-2 rounded-full active:scale-95 duration-150 flex items-center justify-center">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="text-red-600 dark:text-red-500 font-black tracking-tighter italic text-xl">COMANDA PRO</span>
        </div>
        {/* Search Bar in Header for Desktop */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative items-center">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">search</span>
          <input 
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-sm text-on-surface focus:ring-2 focus:ring-primary-container outline-none transition-all" 
            placeholder="Buscar no cardápio..." 
            type="text"
          />
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-red-600 border-b-2 border-red-600 pb-1 font-['Plus_Jakarta_Sans'] font-bold tracking-tight text-lg" href="#">Menu</a>
            <a className="text-zinc-500 font-medium font-['Plus_Jakarta_Sans'] tracking-tight text-lg hover:text-zinc-900 transition-colors" href="#">Orders</a>
            <a className="text-zinc-500 font-medium font-['Plus_Jakarta_Sans'] tracking-tight text-lg hover:text-zinc-900 transition-colors" href="#">Profile</a>
          </nav>
          <button className="md:hidden text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors p-2 rounded-full active:scale-95 duration-150 flex items-center justify-center">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar + Content + Cart */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)] max-w-[1440px] mx-auto w-full">
        {/* Left Sidebar: Categories */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-surface-variant bg-surface-container-lowest overflow-y-auto py-8 px-6">
          <h2 className="font-h2 text-on-surface mb-4">Categorias</h2>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-container text-on-primary-container font-label-bold transition-colors" href="#">
              <span className="material-symbols-outlined filled">lunch_dining</span>
              Burgers Premium
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-bold transition-colors" href="#">
              <span className="material-symbols-outlined">local_pizza</span>
              Pizzas Artesanais
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-bold transition-colors" href="#">
              <span className="material-symbols-outlined">kebab_dining</span>
              Porções
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-bold transition-colors" href="#">
              <span className="material-symbols-outlined">local_bar</span>
              Bebidas
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-bold transition-colors" href="#">
              <span className="material-symbols-outlined">icecream</span>
              Sobremesas
            </a>
          </nav>
        </aside>

        {/* Center Content: Product Grid */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-10 pb-32 md:pb-10">
          {/* Mobile Category Scroll */}
          <div className="flex lg:hidden overflow-x-auto gap-3 pb-4 mb-6 no-scrollbar sticky top-0 bg-background z-10 py-2">
            <button className="px-5 py-2 rounded-full bg-primary-container text-on-primary-container font-label-bold whitespace-nowrap shadow-[0_4px_20px_rgba(230,24,42,0.15)]">Burgers</button>
            <button className="px-5 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-bold whitespace-nowrap">Pizzas</button>
            <button className="px-5 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-bold whitespace-nowrap">Porções</button>
            <button className="px-5 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-bold whitespace-nowrap">Bebidas</button>
          </div>

          <div className="mb-8">
            <h1 className="font-h1 text-on-surface">Burgers Premium</h1>
            <p className="font-body-md text-on-surface-variant mt-1">Carnes selecionadas, pães artesanais e muito sabor.</p>
          </div>

          {/* Bento Grid / Asymmetric Layout for Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Featured Item */}
            <div className="md:col-span-2 xl:col-span-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-surface-variant group flex flex-col md:flex-row hover:shadow-[0_8px_30px_rgba(230,24,42,0.1)] transition-all duration-300">
              <div className="h-64 md:h-auto md:w-1/2 relative overflow-hidden bg-surface-container-low">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhPr2zNMPsDnx6u_SW2cL5xI7DiFxgJA2UmV6vs7sZXmjgkt4xMo9OIuPlvIDIWCCT03pjgbbSWqFpIF1IAtCt_R7KoYoagHFZ_Pn-e6_XiePb9QBwYi5-Ua3kl8yxIClrSQw34VtXtgvRGPOjvarTtp0bp8-DvPbGma720Us42CN3GaxraqcWPUIhe-fOlnTEKII7pMzs8umb9dUPNm6a1gUM5UAd-XFTQOBFg8qF03OU8R59_ttNAyO0bhm8i_K_ICy6lUFtJn4" 
                  alt="Comanda Master Double"
                />
                <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full font-label-bold text-xs uppercase tracking-wider">Mais Vendido</div>
              </div>
              <div className="p-6 md:w-1/2 flex flex-col justify-between">
                <div>
                  <h3 className="font-h3 text-on-surface mb-2">Comanda Master Double</h3>
                  <p className="font-body-sm text-on-surface-variant line-clamp-3 mb-4">Dois blends de 180g de costela angus, duplo queijo cheddar derretido, bacon artesanal crocante, cebola caramelizada e nosso molho secreto no pão brioche amanteigado.</p>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <span className="font-price-display text-on-surface">R$ 48,90</span>
                  <button className="bg-primary-container text-on-primary-container p-3 rounded-full hover:bg-primary transition-colors flex items-center justify-center shadow-[0_4px_20px_rgba(230,24,42,0.2)]">
                    <span className="material-symbols-outlined filled">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Standard Card 1 */}
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-surface-variant group flex flex-col hover:shadow-[0_8px_30px_rgba(230,24,42,0.1)] transition-all duration-300">
              <div className="h-48 relative overflow-hidden bg-surface-container-low">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1ecjzjc7Wk5jD03puXVTEWUK7ykl3wdQq0UXRe8kPh_zsj996DnD9zrpOJOa0hKrSyUWNF-uPEYk62yAYedvlX2CnUUuQPF0mxL1dNfsXTqm1J59NTCp4M-ofP7XWuUgiP8OVcyUsWUU37cU3NMbiwrKQg7flIRojj-v58-Td-kmznMqT-7mA3sJJuQBivtCIws9ixo2kwYyaNBpcaVmYjEDLzWFRLt468E_FLHNki3egNi77pmSj9a6yoj5DuiE-cfi3IvOl6tU" 
                  alt="Classic Classic"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-h3 text-on-surface mb-2">Classic Classic</h3>
                  <p className="font-body-sm text-on-surface-variant line-clamp-2">Blend de 160g, queijo prato, alface americana, tomate e maionese da casa.</p>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <span className="font-price-display text-on-surface">R$ 32,90</span>
                  <button className="bg-surface-container-high text-on-surface p-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Standard Card 2 */}
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-surface-variant group flex flex-col hover:shadow-[0_8px_30px_rgba(230,24,42,0.1)] transition-all duration-300">
              <div className="h-48 relative overflow-hidden bg-surface-container-low">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAT3PkSybhzNGgfhZaZ4X__-siAZeSZS_9gI4HxN6hCC2-Hrc0JKAha3wPBdVv5Pw_cVAADKqDQBQ61ESIEMRFGtgT0bCo6S3HUX9zpamytnQuy_8aK0ICad7bGWcfiGYLj_gQ6KZJuZSlwcl-zN4BXrX9G6Is7Bhq5-N_qWxWRG9nsIN52C3OVHyzJcPaoxwZvoLs8uDrK-fntx5Cj7i0X8YYEc_nMTfyw1RMRdOFlr5nKvqQFGHV5hZ8LK-KLR2ulQ6-UXDeeojo" 
                  alt="Smash Picante"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-h3 text-on-surface mb-2">Smash Picante</h3>
                  <p className="font-body-sm text-on-surface-variant line-clamp-2">Dois smash burgers de 80g, queijo pepper jack, jalapeños frescos e spicy mayo.</p>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <span className="font-price-display text-on-surface">R$ 36,90</span>
                  <button className="bg-surface-container-high text-on-surface p-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal List Card */}
            <div className="xl:col-span-3 bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-surface-variant group flex flex-row items-center p-4 hover:shadow-[0_8px_30px_rgba(230,24,42,0.1)] transition-all duration-300">
              <div className="h-24 w-24 md:h-32 md:w-32 flex-shrink-0 relative overflow-hidden rounded-lg bg-surface-container-low">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRJCZuoiihq9EgLnYOYzpdt66pOcLP8t9gxDNAi3b9V_MRgW8JZeGPn9YjTAgahQYEc-eXZOkMk9pxryIVoNH7Jkzwxs7RBPZoyuEPwGXl2B4gKU51ed9HmxV72AFW2Cq1odWttpjr8IF9Lthxb0FAwtFWZtqnaLZP_3iM0sqpDB85qosvjHFcNkyCOjutamudLe11ak5h664qGgD4uydddFDETEtxjU-1PlC_9jZQ-l5E8hETUjoros4z1juncK9d1XTt8Xfb_3E" 
                  alt="Fritas Rústicas"
                />
              </div>
              <div className="ml-4 flex-1 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-h3 text-on-surface mb-1">Fritas Rústicas Trudfadas</h3>
                    <p className="font-body-sm text-on-surface-variant line-clamp-1 md:line-clamp-2">Porção de batatas rústicas com azeite de trufas brancas e parmesão ralado.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 md:mt-4">
                  <span className="font-price-display text-on-surface">R$ 24,90</span>
                  <button className="bg-surface-container-high text-on-surface px-4 py-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center justify-center font-label-bold gap-2">
                    <span className="material-symbols-outlined">add</span> Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Fixed Cart (Desktop) */}
        <aside className="hidden md:flex flex-col w-80 lg:w-96 border-l border-surface-variant bg-surface-container-lowest shadow-[0_-8px_30px_rgba(0,0,0,0.05)] z-20">
          <div className="p-4 border-b border-surface-variant bg-surface-container-lowest flex items-center justify-between sticky top-0">
            <h2 className="font-h2 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">shopping_bag</span>
              Seu Pedido
            </h2>
            <span className="bg-primary-container text-on-primary-container px-2 py-1 rounded-full font-label-bold text-[12px]">2 itens</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-background">
            {/* Cart Item 1 */}
            <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-variant shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <h4 className="font-label-bold text-on-surface">Comanda Master Double</h4>
                <span className="font-price-display text-on-surface text-base">R$ 48,90</span>
              </div>
              <p className="font-body-sm text-on-surface-variant leading-tight">Sem cebola, Adicional de Bacon</p>
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center bg-surface-container rounded-full p-1 gap-3">
                  <button className="text-on-surface-variant hover:text-primary w-6 h-6 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="font-label-bold text-on-surface w-4 text-center">1</span>
                  <button className="text-on-surface-variant hover:text-primary w-6 h-6 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
                <button className="text-error hover:bg-error-container p-1 rounded-full transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
            {/* Cart Item 2 */}
            <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-variant shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <h4 className="font-label-bold text-on-surface">Fritas Rústicas Trufadas</h4>
                <span className="font-price-display text-on-surface text-base">R$ 24,90</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center bg-surface-container rounded-full p-1 gap-3">
                  <button className="text-on-surface-variant hover:text-primary w-6 h-6 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="font-label-bold text-on-surface w-4 text-center">1</span>
                  <button className="text-on-surface-variant hover:text-primary w-6 h-6 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
                <button className="text-error hover:bg-error-container p-1 rounded-full transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 bg-surface-container-lowest border-t border-surface-variant flex flex-col gap-4 sticky bottom-0">
            <div className="flex justify-between items-center text-on-surface-variant font-body-sm">
              <span>Subtotal</span>
              <span>R$ 73,80</span>
            </div>
            <div className="flex justify-between items-center text-on-surface-variant font-body-sm">
              <span>Taxa de Entrega</span>
              <span className="text-green-600 font-medium">Grátis</span>
            </div>
            <div className="flex justify-between items-center border-t border-surface-variant pt-3">
              <span className="font-h3 text-on-surface">Total</span>
              <span className="font-price-display text-[24px] text-on-surface font-bold">R$ 73,80</span>
            </div>
            <button className="w-full bg-primary-container text-on-primary-container font-h3 text-[18px] py-4 rounded-xl hover:bg-primary transition-colors shadow-[0_4px_20px_rgba(230,24,42,0.2)] flex items-center justify-center gap-2 active:scale-95 duration-150">
              Finalizar Pedido
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile Sticky Cart Bar */}
      <div className="md:hidden fixed bottom-[88px] left-4 right-4 bg-inverse-surface text-on-primary p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex justify-between items-center z-40">
        <div className="flex flex-col">
          <span className="font-body-sm text-[12px] text-surface-variant opacity-80">2 itens</span>
          <span className="font-price-display">R$ 73,80</span>
        </div>
        <button className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-bold flex items-center gap-2">
          Ver Carrinho
          <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
        </button>
      </div>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden bg-zinc-900 dark:bg-black fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-6 rounded-t-2xl shadow-[0_-8px_30px_rgba(234,29,44,0.15)]">
        <a className="flex flex-col items-center justify-center text-red-500 scale-110 active:translate-y-1 duration-200" href="#">
          <span className="material-symbols-outlined filled mb-1">restaurant_menu</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Menu</span>
        </a>
        <a className="flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-all active:translate-y-1 duration-200" href="#">
          <span className="material-symbols-outlined mb-1">receipt_long</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Orders</span>
        </a>
        <a className="flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-all active:translate-y-1 duration-200" href="#">
          <span className="material-symbols-outlined mb-1">person</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Profile</span>
        </a>
        <a className="flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-all active:translate-y-1 duration-200 relative" href="#">
          <span className="material-symbols-outlined mb-1">shopping_bag</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold">Cart</span>
          <span className="absolute top-0 right-1 bg-red-500 w-2 h-2 rounded-full"></span>
        </a>
      </nav>
    </div>
  );
}
