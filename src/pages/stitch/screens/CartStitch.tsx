import React from 'react';

const CartStitch: React.FC = () => {
  return (
    <div className="stitch-scope min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-['Inter'] antialiased">
      <style dangerouslySetInnerHTML={{ __html: `
        .stitch-scope {
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
        }

        .stitch-scope .font-h1 { font-family: 'Plus Jakarta Sans'; font-size: 32px; line-height: 1.2; font-weight: 800; }
        .stitch-scope .font-h2 { font-family: 'Plus Jakarta Sans'; font-size: 24px; line-height: 1.3; font-weight: 700; }
        .stitch-scope .font-h3 { font-family: 'Plus Jakarta Sans'; font-size: 20px; line-height: 1.3; font-weight: 700; }
        .stitch-scope .font-price-display { font-family: 'Plus Jakarta Sans'; font-size: 20px; line-height: 1.0; font-weight: 700; }
        .stitch-scope .font-body-lg { font-family: 'Inter'; font-size: 18px; line-height: 1.6; font-weight: 400; }
        .stitch-scope .font-body-md { font-family: 'Inter'; font-size: 16px; line-height: 1.5; font-weight: 400; }
        .stitch-scope .font-body-sm { font-family: 'Inter'; font-size: 14px; line-height: 1.4; font-weight: 400; }
        .stitch-scope .font-label-bold { font-family: 'Inter'; font-size: 14px; line-height: 1.0; font-weight: 600; }

        .stitch-scope .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .stitch-scope .icon-filled {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      ` }} />

      {/* TopAppBar */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between px-4 py-3 w-full h-16">
        <button className="text-zinc-500 p-2 rounded-full flex items-center justify-center hover:bg-zinc-50 transition-colors active:scale-95">
          <span className="material-symbols-outlined icon-filled">menu</span>
        </button>
        <span className="text-[#bb001b] font-black tracking-tighter italic text-xl">COMANDA PRO</span>
        <button className="text-zinc-500 p-2 rounded-full flex items-center justify-center hover:bg-zinc-50 transition-colors active:scale-95">
          <span className="material-symbols-outlined">search</span>
        </button>
      </header>

      {/* Main Canvas */}
      <main className="pt-4 pb-[180px] px-4 flex flex-col gap-8 max-w-2xl mx-auto w-full">
        {/* Header */}
        <section>
          <h1 className="font-h1 text-[#1a1c1c] mb-1">Seu Pedido</h1>
          <p className="font-body-sm text-[#5d3f3d]">Revise os itens antes de enviar para a cozinha.</p>
        </section>

        {/* Cart Items List */}
        <section className="flex flex-col gap-4">
          {/* Item 1 */}
          <article className="bg-white p-2 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#eeeeee] flex gap-4 relative overflow-hidden">
            <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-[#f3f3f3]">
              <img 
                alt="Smash Burger" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVHnznkirWluBCdEpaEgHrGadpr8TfPpicmF_jDfZET0VNtAuUdldu2qa0nsni37AkjQdsxHLD7ItYaBwJwW0D2jNXS4zhlMmHynzp2seDrveh3Nbi2wSpLtJ7Bwwebog4tie316FYA4KAVd23JyqsSy6_hzTjFk3XMtc78GaPsONOK1NWVkbRMphHtMEBmOJ-k223-ac-ljd9Fi96eyxA_Urj89oSRw9s64dyUQ4dP0kj6LK-5SCetWDZgsU9icSL4c07EsawJeA"
              />
            </div>
            <div className="flex flex-col justify-between flex-grow py-1">
              <div>
                <h3 className="font-label-bold text-[#1a1c1c] mb-1">Double Smash Clássico</h3>
                <p className="font-body-sm text-[#5d3f3d] leading-tight mb-2">Sem cebola, Ponto da carne: Ao ponto, Adicional de Bacon.</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center bg-[#f3f3f3] rounded-full border border-[#e8e8e8]">
                  <button className="w-8 h-8 flex items-center justify-center text-[#bb001b] active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="font-label-bold text-[#1a1c1c] w-6 text-center">2</span>
                  <button className="w-8 h-8 flex items-center justify-center text-[#bb001b] active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                <span className="font-price-display text-[#bb001b] tracking-tight">R$ 78,00</span>
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent flex items-center justify-end pr-2 opacity-50 pointer-events-none">
              <span className="material-symbols-outlined text-[#e7bcb9] text-[16px]">chevron_left</span>
            </div>
          </article>

          {/* Item 2 */}
          <article className="bg-white p-2 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#eeeeee] flex gap-4 relative overflow-hidden">
            <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-[#f3f3f3]">
              <img 
                alt="Batata Frita" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGFWTKP7EszO4oT4KpWIqSNXQd5tOCt4KMlNs7Uz85Z-hUvk6OyyKk5tOEIayTw0PngcBxNL_cgz_EhjRk4_UvfmMvo-O8dId3f5Oq85j3kkbN3S50jV1XZSRph9xbeLpYb8oN3kohVuvhZuumOsJ1OX9BxXMmUVr56tsf89XPygboqg9tjY89vuA7up_-BI_ZqSZCrIh1akzIfD6a1c_EX5FaVi2R4cjS5UYk1OpUMwsqedjw6K6XZZFeOyELmd9f258OF1eaznM"
              />
            </div>
            <div className="flex flex-col justify-between flex-grow py-1">
              <div>
                <h3 className="font-label-bold text-[#1a1c1c] mb-1">Fritas Rústicas Média</h3>
                <p className="font-body-sm text-[#5d3f3d] leading-tight mb-2">Acompanha maionese da casa.</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center bg-[#f3f3f3] rounded-full border border-[#e8e8e8]">
                  <button className="w-8 h-8 flex items-center justify-center text-[#bb001b] active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="font-label-bold text-[#1a1c1c] w-6 text-center">1</span>
                  <button className="w-8 h-8 flex items-center justify-center text-[#bb001b] active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                <span className="font-price-display text-[#bb001b] tracking-tight">R$ 22,00</span>
              </div>
            </div>
          </article>

          <button className="w-full py-3 flex items-center justify-center gap-2 text-[#bb001b] font-label-bold border-2 border-dashed border-[#e7bcb9] rounded-xl hover:bg-[#f3f3f3] transition-colors active:scale-[0.98]">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Adicionar mais itens
          </button>
        </section>

        {/* Table Information */}
        <section className="bg-white rounded-xl p-4 border border-[#eeeeee] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <label className="block font-h3 text-[#1a1c1c] mb-2 flex items-center gap-2" htmlFor="table-number">
            <span className="material-symbols-outlined text-[#bb001b]">table_restaurant</span>
            Onde você está?
          </label>
          <p className="font-body-sm text-[#5d3f3d] mb-4">Informe o número da sua mesa ou identificador.</p>
          <div className="relative">
            <input 
              className="w-full bg-[#f9f9f9] border-2 border-[#e2e2e2] rounded-lg px-4 py-4 font-body-lg text-[#1a1c1c] focus:border-[#bb001b] focus:ring-0 transition-colors placeholder:text-[#926e6b] outline-none" 
              id="table-number" 
              placeholder="Ex: Mesa 12 ou Balcão" 
              type="text"
            />
          </div>
        </section>

        {/* Order Summary */}
        <section className="bg-white rounded-xl p-4 border border-[#eeeeee] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-3">
          <div className="flex justify-between items-center text-[#5d3f3d]">
            <span className="font-body-md">Subtotal</span>
            <span className="font-label-bold text-[#1a1c1c]">R$ 100,00</span>
          </div>
          <div className="flex justify-between items-center text-[#5d3f3d]">
            <span className="font-body-md flex items-center gap-1">
              Taxa de Serviço (10%)
              <span className="material-symbols-outlined text-[14px] text-[#926e6b] cursor-help">info</span>
            </span>
            <span className="font-label-bold text-[#1a1c1c]">R$ 10,00</span>
          </div>
          <div className="h-px bg-[#e2e2e2] w-full my-1"></div>
          <div className="flex justify-between items-end mt-1">
            <span className="font-h3 text-[#1a1c1c]">Total</span>
            <span className="font-h1 text-[#bb001b] tracking-tight">R$ 110,00</span>
          </div>
        </section>
      </main>

      {/* Sticky Checkout Action */}
      <div className="fixed bottom-[88px] left-0 w-full px-4 z-40 bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9] to-transparent pt-8 pb-4">
        <div className="max-w-2xl mx-auto">
          <button className="w-full bg-[#bb001b] text-white font-h3 py-5 rounded-xl shadow-[0_8px_30px_rgba(234,29,44,0.3)] hover:bg-[#c0001c] transition-all active:scale-[0.98] active:translate-y-1 flex items-center justify-center gap-3 tracking-wide">
            ENVIAR PEDIDO
            <span className="material-symbols-outlined icon-filled">send</span>
          </button>
        </div>
      </div>

      {/* BottomNavBar */}
      <nav className="bg-zinc-900 text-[11px] font-semibold fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-6 rounded-t-2xl shadow-[0_-8px_30px_rgba(234,29,44,0.15)] md:hidden">
        <button className="flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-all active:translate-y-1 duration-200 w-16 gap-1">
          <span className="material-symbols-outlined text-[24px]">restaurant_menu</span>
          <span>Menu</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-all active:translate-y-1 duration-200 w-16 gap-1">
          <span className="material-symbols-outlined text-[24px]">receipt_long</span>
          <span>Orders</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-all active:translate-y-1 duration-200 w-16 gap-1">
          <span className="material-symbols-outlined text-[24px]">person</span>
          <span>Profile</span>
        </button>
        <button className="flex flex-col items-center justify-center text-red-500 scale-110 hover:text-white transition-all active:translate-y-1 duration-200 w-16 gap-1">
          <span className="material-symbols-outlined text-[24px] icon-filled">shopping_bag</span>
          <span>Cart</span>
        </button>
      </nav>
    </div>
  );
};

export default CartStitch;
