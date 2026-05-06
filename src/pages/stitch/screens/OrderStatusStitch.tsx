import React from 'react';

const OrderStatusStitch: React.FC = () => {
  return (
    <div className="stitch-scope min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-['Inter'] antialiased flex flex-col items-center justify-center p-4">
      <style dangerouslySetInnerHTML={{ __html: `
        .stitch-scope {
          --on-surface: #1a1c1c;
          --primary: #bb001b;
          --primary-container: #e6182a;
          --on-primary: #ffffff;
          --on-surface-variant: #5d3f3d;
          --surface-container-highest: #e2e2e2;
          --on-secondary-container: #656464;
          --surface-container-low: #f3f3f3;
          --surface-container-high: #e8e8e8;
          --surface-container-lowest: #ffffff;
        }

        .stitch-scope .font-h1 { font-family: 'Plus Jakarta Sans'; font-size: 32px; line-height: 1.2; font-weight: 800; }
        .stitch-scope .font-h2 { font-family: 'Plus Jakarta Sans'; font-size: 24px; line-height: 1.3; font-weight: 700; }
        .stitch-scope .font-h3 { font-family: 'Plus Jakarta Sans'; font-size: 20px; line-height: 1.3; font-weight: 700; }
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

      <main className="w-full max-w-lg bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 flex flex-col items-center text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(34,197,94,0.15)]">
          <span className="material-symbols-outlined text-green-500 icon-filled" style={{ fontSize: '48px' }}>check_circle</span>
        </div>

        {/* Headline */}
        <h1 className="font-h1 text-[#1a1c1c] mb-1">Pedido enviado para a cozinha!</h1>
        <p className="font-body-md text-[#5d3f3d] mb-8">Seu pedido foi recebido com sucesso e já estamos cuidando dele.</p>

        {/* Estimated Time Badge */}
        <div className="inline-flex items-center space-x-2 bg-[#f3f3f3] px-4 py-3 rounded-full mb-8 border border-[#e2e2e2]">
          <span className="material-symbols-outlined text-[#656464]">schedule</span>
          <span className="font-label-bold text-[#1a1c1c]">Tempo estimado: 15-20 min</span>
        </div>

        {/* Status Timeline */}
        <div className="w-full max-w-sm mb-8">
          <div className="relative flex flex-col space-y-6">
            {/* Line Connecting Steps */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-[#e8e8e8] z-0"></div>
            
            {/* Step 1: Received (Active) */}
            <div className="flex items-center relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#bb001b] text-white flex items-center justify-center shadow-[0_4px_10px_rgba(187,0,27,0.3)] shrink-0">
                <span className="material-symbols-outlined icon-filled">receipt</span>
              </div>
              <div className="ml-4 text-left">
                <h3 className="font-label-bold text-[#1a1c1c]">Pedido Recebido</h3>
                <p className="font-body-sm text-[#5d3f3d]">Agora mesmo</p>
              </div>
            </div>

            {/* Step 2: Preparing (Pending) */}
            <div className="flex items-center relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#e2e2e2] text-[#656464] flex items-center justify-center shrink-0 border-2 border-[#e2e2e2]">
                <span className="material-symbols-outlined">outdoor_grill</span>
              </div>
              <div className="ml-4 text-left">
                <h3 className="font-label-bold text-[#656464]">Em Preparo</h3>
              </div>
            </div>

            {/* Step 3: On the way (Pending) */}
            <div className="flex items-center relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#e2e2e2] text-[#656464] flex items-center justify-center shrink-0 border-2 border-[#e2e2e2]">
                <span className="material-symbols-outlined">room_service</span>
              </div>
              <div className="ml-4 text-left">
                <h3 className="font-label-bold text-[#656464]">A caminho da mesa</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-[#bb001b] text-white font-label-bold py-4 rounded-full shadow-[0_8px_30px_rgba(234,29,44,0.15)] hover:bg-[#e6182a] transition-colors duration-200">
          Voltar ao Cardápio
        </button>
      </main>
    </div>
  );
};

export default OrderStatusStitch;
