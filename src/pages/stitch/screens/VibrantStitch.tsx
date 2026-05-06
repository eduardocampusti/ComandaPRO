import React from 'react';

const VibrantStitch: React.FC = () => {
  return (
    <div className="stitch-scope min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-['Inter'] antialiased p-8">
      <style dangerouslySetInnerHTML={{ __html: `
        .stitch-scope {
          --primary: #bb001b;
          --on-primary: #ffffff;
          --primary-container: #e6182a;
          --on-primary-container: #fffbff;
          
          --secondary: #5f5e5e;
          --on-secondary: #ffffff;
          --secondary-container: #e4e2e1;
          --on-secondary-container: #656464;
          
          --tertiary: #795600;
          --on-tertiary: #ffffff;
          --tertiary-container: #986d00;
          
          --background: #f9f9f9;
          --on-background: #1a1c1c;
          
          --surface: #f9f9f9;
          --on-surface: #1a1c1c;
          --surface-variant: #e2e2e2;
          --on-surface-variant: #5d3f3d;
          
          --outline: #926e6b;
          --outline-variant: #e7bcb9;
          
          --error: #ba1a1a;
          --on-error: #ffffff;
        }

        .stitch-scope .font-h1 { font-family: 'Plus Jakarta Sans'; font-size: 32px; line-height: 1.2; font-weight: 800; }
        .stitch-scope .font-h2 { font-family: 'Plus Jakarta Sans'; font-size: 24px; line-height: 1.3; font-weight: 700; }
        .stitch-scope .font-h3 { font-family: 'Plus Jakarta Sans'; font-size: 20px; line-height: 1.3; font-weight: 700; }
        .stitch-scope .font-body-lg { font-family: 'Inter'; font-size: 18px; line-height: 1.6; font-weight: 400; }
        .stitch-scope .font-body-md { font-family: 'Inter'; font-size: 16px; line-height: 1.5; font-weight: 400; }
        .stitch-scope .font-body-sm { font-family: 'Inter'; font-size: 14px; line-height: 1.4; font-weight: 400; }
        .stitch-scope .font-label-bold { font-family: 'Inter'; font-size: 14px; line-height: 1.0; font-weight: 600; }
        .stitch-scope .font-price { font-family: 'Plus Jakarta Sans'; font-size: 20px; line-height: 1.0; font-weight: 700; }

        .stitch-scope .shadow-level-1 { shadow: 0px 4px 20px rgba(0,0,0,0.05); }
        .stitch-scope .shadow-level-2 { shadow: 0px 8px 30px rgba(234, 29, 44, 0.15); }
      ` }} />

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="border-b border-[#e2e2e2] pb-8">
          <h1 className="font-h1 text-[#bb001b] mb-2">Vibrant Gourmet</h1>
          <p className="font-body-lg text-[#5d3f3d]">Design System & Visual Language Guide</p>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 bg-[#bb001b] text-white rounded-full text-xs font-bold uppercase tracking-wider">Crave-First Philosophy</span>
            <span className="px-3 py-1 bg-[#5f5e5e] text-white rounded-full text-xs font-bold uppercase tracking-wider">High-Velocity UI</span>
          </div>
        </header>

        {/* Colors Section */}
        <section className="space-y-6">
          <h2 className="font-h2 border-l-4 border-[#bb001b] pl-4">Cores (Palette)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorCard color="#bb001b" name="Primary (Vibrant Red)" label="Action & Branding" onColor="#ffffff" />
            <ColorCard color="#e6182a" name="Primary Container" label="Highlight Background" onColor="#ffffff" />
            <ColorCard color="#5f5e5e" name="Secondary" label="Headings & Text" onColor="#ffffff" />
            <ColorCard color="#e4e2e1" name="Secondary Container" label="Muted Accents" onColor="#656464" />
            <ColorCard color="#795600" name="Tertiary (Amber)" label="Ratings & Social Proof" onColor="#ffffff" />
            <ColorCard color="#f9f9f9" name="Background" label="Page Base" onColor="#1a1c1c" />
            <ColorCard color="#ffffff" name="Surface" label="Cards & Content" onColor="#1a1c1c" />
            <ColorCard color="#ba1a1a" name="Error" label="Alerts & Errors" onColor="#ffffff" />
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-6 bg-white p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#eeeeee]">
          <h2 className="font-h2 border-l-4 border-[#bb001b] pl-4">Tipografia (Typography)</h2>
          <div className="space-y-8">
            <div>
              <p className="text-xs text-gray-400 mb-2 font-mono uppercase tracking-widest">H1 - Heading 1 (Plus Jakarta Sans 800)</p>
              <h1 className="font-h1">The perfect burger for your hunger</h1>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2 font-mono uppercase tracking-widest">H2 - Heading 2 (Plus Jakarta Sans 700)</p>
              <h2 className="font-h2">Categorias de Produtos</h2>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2 font-mono uppercase tracking-widest">Body LG - Large Copy (Inter 400)</p>
              <p className="font-body-lg text-[#5d3f3d]">Our menu is carefully curated to bring you the best culinary experience with fresh ingredients.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-gray-400 mb-2 font-mono uppercase tracking-widest">Body MD - Medium (Inter 400)</p>
                <p className="font-body-md text-[#5d3f3d]">Classic cheeseburger with secret sauce, caramelized onions, and premium beef patty.</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2 font-mono uppercase tracking-widest">Price Display (Plus Jakarta Sans 700)</p>
                <p className="font-price text-[#bb001b]">R$ 34,90</p>
              </div>
            </div>
          </div>
        </section>

        {/* Components Showcase */}
        <section className="space-y-6">
          <h2 className="font-h2 border-l-4 border-[#bb001b] pl-4">Componentes (Interactive Elements)</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Buttons */}
            <div className="space-y-4 bg-white p-6 rounded-xl border border-[#eeeeee]">
              <p className="font-label-bold text-[#5f5e5e] uppercase tracking-wider mb-4">Botões</p>
              <button className="w-full bg-[#bb001b] text-white font-label-bold py-4 rounded-lg shadow-[0_8px_30px_rgba(234,29,44,0.15)] hover:bg-[#e6182a] transition-all active:scale-95">
                ADICIONAR AO CARRINHO
              </button>
              <button className="w-full bg-[#5f5e5e] text-white font-label-bold py-4 rounded-lg hover:bg-[#474747] transition-all">
                FINALIZAR PEDIDO
              </button>
              <div className="flex gap-4">
                <button className="flex-1 bg-[#f3f3f3] text-[#1a1c1c] font-label-bold py-3 rounded-lg border border-[#e2e2e2] hover:bg-[#eeeeee]">
                  CANCELAR
                </button>
                <button className="flex-1 bg-white text-[#bb001b] font-label-bold py-3 rounded-lg border-2 border-[#bb001b] hover:bg-[#fff5f5]">
                  VER DETALHES
                </button>
              </div>
            </div>

            {/* Product Card Example */}
            <div className="space-y-4 bg-white p-6 rounded-xl border border-[#eeeeee] flex gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex-1 space-y-2">
                <h3 className="font-h3 text-[#1a1c1c]">Double Truffle Burger</h3>
                <p className="font-body-sm text-[#5d3f3d] line-clamp-2">Two premium beef patties with truffle oil, melted gouda, and fresh arugula.</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-price text-[#1a1c1c]">R$ 42,00</span>
                  <button className="bg-[#bb001b] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                    <span className="text-2xl font-bold">+</span>
                  </button>
                </div>
              </div>
              <div className="w-24 h-24 bg-[#f3f3f3] rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80" alt="Burger" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Layout & Shapes */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#e6182a] text-white p-6 rounded-[24px] space-y-2 shadow-lg">
            <h3 className="font-label-bold uppercase">Border Radius: XL</h3>
            <p className="font-body-sm opacity-90">24px - Used for bottom sheets and large container top corners.</p>
          </div>
          <div className="bg-[#5f5e5e] text-white p-6 rounded-lg space-y-2 shadow-lg">
            <h3 className="font-label-bold uppercase">Border Radius: LG</h3>
            <p className="font-body-sm opacity-90">8px - Standard for buttons, cards and input fields.</p>
          </div>
          <div className="bg-white text-[#1a1c1c] p-6 rounded-full border border-[#e2e2e2] space-y-1 text-center shadow-md">
            <h3 className="font-label-bold uppercase">Shapes: Pill</h3>
            <p className="font-body-sm text-gray-500">Fully rounded for search bars and categories.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

const ColorCard: React.FC<{ color: string; name: string; label: string; onColor: string }> = ({ color, name, label, onColor }) => (
  <div className="bg-white rounded-xl overflow-hidden border border-[#eeeeee] shadow-sm flex flex-col">
    <div className="h-20 w-full" style={{ backgroundColor: color }} />
    <div className="p-4 flex-1">
      <p className="font-label-bold text-xs mb-1" style={{ color }}>{color.toUpperCase()}</p>
      <p className="font-label-bold text-sm text-[#1a1c1c] mb-1">{name}</p>
      <p className="font-body-sm text-[#5d3f3d] text-[11px] leading-tight">{label}</p>
    </div>
  </div>
);

export default VibrantStitch;
