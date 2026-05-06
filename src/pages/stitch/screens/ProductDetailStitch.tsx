import React from 'react';

const ProductDetailStitch: React.FC = () => {
  return (
    <div className="stitch-scope min-h-screen bg-[#f9f9f9] pb-[120px] font-['Inter'] text-[#1a1c1c] antialiased">
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

      {/* Hero Image Section */}
      <div className="relative w-full h-[400px] bg-[#e8e8e8]">
        <img 
          alt="Cheese Bacon Burger" 
          className="w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwsMH-IpHEBwECzpdXre4Y7J6w2oeSdGctBitt5zTwy-TtSJ3l-wdYMLM2oJ4CAyOALabDfUP-ZNNfbg6EJWPti_Kkb3ooxpvyjTF9zr2aQPzrXNoU0gBy3z3_PbRiCPwqURVOkbH-yAFTsYXfXRJxhhcvC5NY5S4cds9PCRItsY505WVha5h-bmnJTzSauknXwe-CyKi85vNZO16J9hwiGd60gKfm8gNjDJ8stiLn1V7lFMOPUjKTkFaANsDiuy9sY4IEwRlpy5I"
        />
        <button className="absolute top-4 left-4 w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-[#1a1c1c]">close</span>
        </button>
      </div>

      {/* Content Section */}
      <div className="relative -mt-8 bg-white rounded-t-[32px] px-4 pt-8 flex flex-col gap-12 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {/* Product Info */}
        <section className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-h1 text-[#1a1c1c] flex-1">Cheese Bacon</h1>
            <span className="font-price-display text-[#bb001b] whitespace-nowrap mt-2">R$ 32,90</span>
          </div>
          <p className="font-body-md text-[#656464] mt-2">
            Hambúrguer artesanal de 180g de puro Angus, queijo cheddar inglês derretido, generosas fatias de bacon rústico super crocante, alface americana fresca, tomate italiano e nosso molho especial da casa, servido em um pão brioche amanteigado e selado.
          </p>
        </section>

        {/* Option Group: Adicionais */}
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-h3 text-[#1a1c1c]">Adicionais</h2>
            <span className="font-body-sm text-[#5f5e5e]">Escolha até 3</span>
          </div>
          <div className="flex flex-col gap-[2px] bg-[#e8e8e8] rounded-xl overflow-hidden border border-[#e8e8e8]">
            <label className="flex items-center justify-between p-4 bg-white hover:bg-[#f3f3f3] transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center w-6 h-6">
                  <input className="peer appearance-none w-6 h-6 border-2 border-[#dadada] rounded checked:bg-[#bb001b] checked:border-[#bb001b] transition-all cursor-pointer" type="checkbox"/>
                  <span className="material-symbols-outlined text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-[18px]">check</span>
                </div>
                <span className="font-label-bold text-[#1a1c1c] group-hover:text-[#bb001b] transition-colors">Extra Queijo Cheddar</span>
              </div>
              <span className="font-body-sm text-[#5f5e5e]">+R$ 4,00</span>
            </label>
            <label className="flex items-center justify-between p-4 bg-white hover:bg-[#f3f3f3] transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center w-6 h-6">
                  <input className="peer appearance-none w-6 h-6 border-2 border-[#dadada] rounded checked:bg-[#bb001b] checked:border-[#bb001b] transition-all cursor-pointer" type="checkbox"/>
                  <span className="material-symbols-outlined text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-[18px]">check</span>
                </div>
                <span className="font-label-bold text-[#1a1c1c] group-hover:text-[#bb001b] transition-colors">Bacon Crocante Rústico</span>
              </div>
              <span className="font-body-sm text-[#5f5e5e]">+R$ 5,00</span>
            </label>
            <label className="flex items-center justify-between p-4 bg-white hover:bg-[#f3f3f3] transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center w-6 h-6">
                  <input className="peer appearance-none w-6 h-6 border-2 border-[#dadada] rounded checked:bg-[#bb001b] checked:border-[#bb001b] transition-all cursor-pointer" type="checkbox"/>
                  <span className="material-symbols-outlined text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-[18px]">check</span>
                </div>
                <span className="font-label-bold text-[#1a1c1c] group-hover:text-[#bb001b] transition-colors">Hambúrguer Extra (180g)</span>
              </div>
              <span className="font-body-sm text-[#5f5e5e]">+R$ 12,00</span>
            </label>
          </div>
        </section>

        {/* Observations */}
        <section className="flex flex-col gap-4">
          <h2 className="font-h3 text-[#1a1c1c]">Observações</h2>
          <textarea 
            className="w-full bg-[#f3f3f3] border border-transparent focus:border-[#bb001b] focus:ring-1 focus:ring-[#bb001b] rounded-xl p-4 font-body-sm text-[#1a1c1c] placeholder:text-[#c8c6c6] resize-none h-28 transition-all" 
            placeholder="Ex: Tirar cebola, maionese à parte, carne bem passada..."
          />
        </section>
      </div>

      {/* Footer / Actions */}
      <div className="fixed bottom-0 left-0 w-full bg-white px-4 pt-4 pb-6 shadow-[0_-8px_30px_rgba(234,29,44,0.15)] flex items-center gap-4 z-50 rounded-t-2xl">
        <div className="flex items-center justify-between bg-[#f3f3f3] rounded-full h-14 px-2 border border-[#e2e2e2] min-w-[120px]">
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-[#5f5e5e] hover:bg-[#e2e2e2] transition-colors active:scale-95">
            <span className="material-symbols-outlined">remove</span>
          </button>
          <span className="font-h3 text-[#1a1c1c] w-8 text-center">1</span>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-[#bb001b] hover:bg-[#ffdad7] transition-colors active:scale-95">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
        <button className="flex-1 h-14 bg-[#bb001b] rounded-full flex items-center justify-between px-6 shadow-[0_4px_20px_rgba(187,0,27,0.25)] active:scale-[0.98] transition-transform">
          <span className="font-label-bold text-white">Adicionar ao Carrinho</span>
          <span className="font-price-display text-[16px] text-white">R$ 32,90</span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetailStitch;
