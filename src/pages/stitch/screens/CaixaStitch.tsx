import React, { useEffect, useState } from 'react';
import { OrderData, TableData } from '../../../lib/database';

interface CaixaStitchProps {
  orders: OrderData[];
  tables: TableData[];
  stats: {
    totalPix: number;
    totalCard: number;
    totalCash: number;
    totalRevenue: number;
    openOrdersCount: number;
    closedTodayCount: number;
  };
  onCloseRegister: () => void;
  onTableSelect: (tableId: string | null) => void;
  onCloseTable: (method: 'pix' | 'card' | 'cash') => void;
  selectedTableId: string | null;
  isProcessing?: boolean;
}

/**
 * CaixaStitch - Caixa e Fechamento (Dinâmico)
 */
export default function CaixaStitch({ 
  orders, 
  tables, 
  stats, 
  onCloseRegister, 
  onTableSelect,
  onCloseTable,
  selectedTableId,
  isProcessing = false
}: CaixaStitchProps) {
  const [activeTab, setActiveTab] = useState<'mesas' | 'recebimentos'>('mesas');
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'card' | 'cash' | null>(null);

  useEffect(() => {
    const linkFonts = document.createElement('link');
    linkFonts.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Inter:wght@100..900&display=swap';
    linkFonts.rel = 'stylesheet';
    document.head.appendChild(linkFonts);

    const linkIcons = document.createElement('link');
    linkIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);
  }, []);

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const selectedTableOrders = orders.filter(o => o.table_id === selectedTableId && o.status !== 'paid' && o.status !== 'cancelled');
  
  const subtotal = selectedTableOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const serviceCharge = subtotal * 0.1;
  const totalToPay = subtotal + serviceCharge;

  // Filtro de mesas ocupadas ou com pedidos ativos
  const occupiedTables = tables.filter(t => t.status === 'occupied' || orders.some(o => o.table_id === t.id && o.status !== 'paid' && o.status !== 'cancelled'));

  // Últimos recebimentos (pedidos pagos hoje)
  const recentPayments = orders
    .filter(o => o.status === 'paid')
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  return (
    <div className="stitch-scope-caixa bg-background text-on-background font-body-md text-body-md h-screen w-full flex overflow-hidden antialiased">
      <style>{`
        .stitch-scope-caixa {
          --primary: #bb001b;
          --on-primary: #ffffff;
          --surface: #f9f9f9;
          --background: #f9f9f9;
          --on-background: #1a1c1c;
          --on-surface: #1a1c1c;
          --secondary: #5f5e5e;
          --outline-variant: #e7bcb9;
          --surface-container-low: #f3f3f3;
          --surface-container-lowest: #ffffff;
          --surface-container-high: #e8e8e8;
          --surface-variant: #e2e2e2;
          --primary-fixed: #ffdad7;
          --on-primary-fixed: #410004;
          --on-primary-fixed-variant: #930013;
          --surface-tint: #c0001c;
        }

        .stitch-scope-caixa .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
          width: 24px;
          height: 24px;
        }

        .stitch-scope-caixa .font-h1 { font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 32px; line-height: 1.2; }
        .stitch-scope-caixa .font-h2 { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 24px; line-height: 1.3; }
        .stitch-scope-caixa .font-h3 { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 20px; line-height: 1.3; }
        .stitch-scope-caixa .font-body-md { font-family: 'Inter'; font-weight: 400; font-size: 16px; line-height: 1.5; }
        .stitch-scope-caixa .font-body-sm { font-family: 'Inter'; font-weight: 400; font-size: 14px; line-height: 1.4; }
        .stitch-scope-caixa .font-label-bold { font-family: 'Inter'; font-weight: 600; font-size: 14px; line-height: 1.0; }
        .stitch-scope-caixa .font-price-display { font-family: 'Plus Jakarta Sans'; font-weight: 700; font-size: 20px; line-height: 1.0; }

        .stitch-scope-caixa .hide-scrollbar::-webkit-scrollbar { display: none; }
        .stitch-scope-caixa .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .stitch-scope-caixa .progress-bar {
          height: 8px;
          background: var(--surface-container-high);
          border-radius: 4px;
          overflow: hidden;
        }
        .stitch-scope-caixa .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease-out;
        }
      `}</style>

      <main className="flex-1 flex flex-col bg-surface min-w-0">
        <header className="bg-white/95 backdrop-blur-md top-0 sticky z-50 border-b border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between px-4 py-3 w-full h-16 shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-primary font-black tracking-tighter italic text-xl">COMANDA PRO</div>
            <div className="h-6 w-px bg-outline-variant mx-2 hidden md:block"></div>
            <h1 className="font-h3 text-on-surface">Caixa Operacional</h1>
          </div>
          
          <div className="flex bg-surface-container-low p-1 rounded-full border border-outline-variant">
            <button 
              onClick={() => setActiveTab('mesas')}
              className={`px-6 py-1.5 rounded-full font-label-bold text-sm transition-all ${activeTab === 'mesas' ? 'bg-white text-primary shadow-sm' : 'text-secondary'}`}
            >
              Mesas Abertas
            </button>
            <button 
              onClick={() => setActiveTab('recebimentos')}
              className={`px-6 py-1.5 rounded-full font-label-bold text-sm transition-all ${activeTab === 'recebimentos' ? 'bg-white text-primary shadow-sm' : 'text-secondary'}`}
            >
              Recebimentos
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-secondary text-lg">search</span>
              <input className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-full font-body-sm text-body-sm focus:outline-none focus:border-primary w-64 transition-all" placeholder="Buscar..." type="text" />
            </div>
          </div>
        </header>

        <div className="flex-1 flex gap-4 p-4 overflow-hidden min-h-0">
          {activeTab === 'mesas' ? (
            <>
              {/* Sidebar: Mesas Abertas */}
              <section className="w-1/4 min-w-[280px] max-w-[350px] bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low rounded-t-xl shrink-0">
                  <h2 className="font-h3 text-on-surface">Atendimento</h2>
                  <span className="bg-primary text-on-primary font-label-bold text-[12px] px-2 py-0.5 rounded-full">{occupiedTables.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar">
                  {occupiedTables.length === 0 ? (
                    <div className="py-12 text-center text-secondary font-body-sm">Nenhuma mesa ativa no momento</div>
                  ) : (
                    occupiedTables.map(table => {
                      const tableOrders = orders.filter(o => o.table_id === table.id && o.status !== 'paid' && o.status !== 'cancelled');
                      const tableTotal = tableOrders.reduce((sum, o) => sum + o.total_amount, 0);
                      const isSelected = selectedTableId === table.id;

                      return (
                        <button 
                          key={table.id}
                          onClick={() => onTableSelect(table.id)}
                          className={`w-full text-left rounded-lg p-3 flex justify-between items-stretch transition-all border ${isSelected ? 'bg-primary-fixed border-primary shadow-sm' : 'bg-surface-container-lowest border-outline-variant hover:border-secondary'}`}
                        >
                          <div className="flex flex-col justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`font-h2 ${isSelected ? 'text-on-primary-fixed' : 'text-on-surface'}`}>{String(table.number).padStart(2, '0')}</span>
                              <span className={`material-symbols-outlined text-sm ${isSelected ? 'text-primary' : 'text-secondary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                            </div>
                            <div className={`font-label-bold text-label-bold mt-2 flex items-center gap-1 ${isSelected ? 'text-primary' : 'text-secondary'}`}>
                              {isSelected && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                              {tableTotal > 0 ? 'Consumindo' : 'Ocupada'}
                            </div>
                          </div>
                          <div className="flex flex-col justify-between items-end">
                            <span className={`font-body-sm text-body-sm opacity-80 ${isSelected ? 'text-on-primary-fixed-variant' : 'text-secondary'}`}>
                              {tableOrders.length} ped.
                            </span>
                            <span className={`font-price-display text-price-display mt-2 ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                              R$ {tableTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Centro: Detalhes da Mesa */}
              <section className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                {selectedTable ? (
                  <>
                    <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-white rounded-t-xl shrink-0">
                      <div>
                        <div className="flex items-baseline gap-3">
                          <h2 className="font-h1 text-h1 text-on-surface">Mesa {selectedTable.number}</h2>
                          <span className="font-body-lg text-secondary">Aberto em {selectedTable.opened_at ? new Date(selectedTable.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container transition-colors flex items-center justify-center">
                          <span className="material-symbols-outlined">print</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 hide-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-outline-variant text-secondary font-label-bold text-label-bold">
                            <th className="pb-3 w-16 font-normal">Qtd</th>
                            <th className="pb-3 font-normal">Item</th>
                            <th className="pb-3 text-right font-normal">Total</th>
                          </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md text-on-surface">
                          {selectedTableOrders.flatMap(o => o.items).map((item, idx) => (
                            <tr key={idx} className="border-b border-surface-variant hover:bg-surface-container-low transition-colors group">
                              <td className="py-4 align-top"><span className="bg-surface-container-high px-2 py-1 rounded font-label-bold text-label-bold">{item.quantity}x</span></td>
                              <td className="py-4">
                                <div className="font-label-bold text-label-bold">{item.name}</div>
                                {item.notes && <div className="text-xs text-secondary italic">{item.notes}</div>}
                              </td>
                              <td className="py-4 text-right font-label-bold text-label-bold">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-5 bg-surface-container-low border-t border-outline-variant rounded-b-xl shrink-0">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between font-body-md text-body-md text-secondary">
                          <span>Subtotal</span>
                          <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between font-body-md text-body-md text-secondary">
                          <span>Taxa de Serviço (10%)</span>
                          <span>R$ {serviceCharge.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end pt-4 border-t border-outline-variant">
                        <span className="font-h2 text-h2 text-on-surface">Total</span>
                        <span className="font-h1 text-h1 text-primary">R$ {totalToPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-secondary opacity-50">
                    <span className="material-symbols-outlined text-6xl mb-4">restaurant</span>
                    <p>Selecione uma mesa para ver os detalhes</p>
                  </div>
                )}
              </section>

              {/* Sidebar: Pagamento */}
              <section className="w-[320px] shrink-0 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                <div className="p-5 border-b border-outline-variant bg-white rounded-t-xl shrink-0">
                  <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">payments</span>
                    Pagamento
                  </h2>
                </div>
                <div className="p-5 flex-1 overflow-y-auto hide-scrollbar space-y-6">
                  <div>
                    <label className="font-label-bold text-label-bold text-secondary mb-3 block">Método</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['pix', 'card', 'cash'] as const).map(m => (
                        <button 
                          key={m} 
                          onClick={() => setSelectedMethod(m)}
                          className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${selectedMethod === m ? 'bg-primary-fixed border-primary text-primary' : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container-low'}`}
                        >
                          <span className="material-symbols-outlined text-3xl">
                            {m === 'pix' ? 'qr_code_scanner' : m === 'card' ? 'credit_card' : 'payments'}
                          </span>
                          <span className="font-label-bold text-label-bold capitalize">{m === 'pix' ? 'Pix' : m === 'card' ? 'Cartão' : 'Dinheiro'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-white border-t border-outline-variant shrink-0 z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
                  <button 
                    onClick={() => selectedMethod && onCloseTable(selectedMethod)}
                    className="w-full bg-primary hover:bg-surface-tint text-on-primary font-h3 text-h3 py-4 rounded-xl shadow-[0_8px_30px_rgba(234,29,44,0.15)] active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50" 
                    disabled={!selectedTable || !selectedMethod || isProcessing}
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isProcessing ? 'sync' : 'check_circle'}
                    </span>
                    {isProcessing ? 'Processando...' : 'Fechar Conta'}
                  </button>
                </div>
              </section>
            </>
          ) : (
            /* ABA RECEBIMENTOS */
            <div className="flex-1 flex gap-4 overflow-hidden">
              <section className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="p-5 border-b border-outline-variant bg-surface-container-low rounded-t-xl flex justify-between items-center">
                  <h2 className="font-h2 text-on-surface">Resumo Financeiro do Dia</h2>
                  <button 
                    onClick={onCloseRegister}
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-h3 text-sm hover:bg-surface-tint transition-all shadow-md active:scale-95"
                  >
                    Fechar Caixa do Dia
                  </button>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
                  <div className="bg-white p-5 rounded-xl border border-outline-variant shadow-sm">
                    <p className="text-secondary font-label-bold text-xs uppercase tracking-wider mb-1">Faturamento Total</p>
                    <p className="font-h1 text-primary">R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  {[
                    { label: 'Pix', val: stats.totalPix, color: '#10b981', icon: 'qr_code_scanner' },
                    { label: 'Cartão', val: stats.totalCard, color: '#3b82f6', icon: 'credit_card' },
                    { label: 'Dinheiro', val: stats.totalCash, color: '#f59e0b', icon: 'payments' }
                  ].map(m => (
                    <div key={m.label} className="bg-white p-5 rounded-xl border border-outline-variant shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-secondary font-label-bold text-xs uppercase tracking-wider mb-1">{m.label}</p>
                          <p className="font-h2 text-on-surface">R$ {m.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <span className="material-symbols-outlined text-secondary opacity-50">{m.icon}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(m.val / (stats.totalRevenue || 1)) * 100}%`, backgroundColor: m.color }}></div>
                      </div>
                      <p className="text-[10px] text-secondary mt-2 font-label-bold text-right">
                        {((m.val / (stats.totalRevenue || 1)) * 100).toFixed(1)}% do total
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-t border-b border-outline-variant bg-surface-container-low font-label-bold text-on-surface">
                    Últimos Pagamentos Recebidos
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 hide-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-surface-container-lowest z-10 border-b border-outline-variant">
                        <tr className="text-secondary font-label-bold text-xs">
                          <th className="py-4">Hora</th>
                          <th className="py-4">Mesa</th>
                          <th className="py-4">Forma de Pagamento</th>
                          <th className="py-4 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-md text-on-surface">
                        {recentPayments.length === 0 ? (
                          <tr><td colSpan={4} className="py-12 text-center text-secondary opacity-50">Nenhum pagamento registrado hoje.</td></tr>
                        ) : (
                          recentPayments.map((p, i) => (
                            <tr key={i} className="border-b border-zinc-100 hover:bg-surface-container-low transition-colors">
                              <td className="py-4 text-sm text-secondary">
                                {p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                              </td>
                              <td className="py-4 font-label-bold text-primary">Mesa {p.table_number || '??'}</td>
                              <td className="py-4">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${p.payment_method === 'pix' ? 'bg-[#10b981]' : p.payment_method === 'card' ? 'bg-[#3b82f6]' : 'bg-[#f59e0b]'}`}></span>
                                  <span className="capitalize">{p.payment_method || 'Pendente'}</span>
                                </div>
                              </td>
                              <td className="py-4 text-right font-h3">R$ {p.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
              
              <section className="w-[320px] bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-6">
                <h3 className="font-h3 text-on-surface">Status do Dia</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-outline-variant">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">table_restaurant</span>
                      <span className="font-body-sm">Mesas Atendidas</span>
                    </div>
                    <span className="font-h2 text-on-surface">{stats.closedTodayCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-outline-variant">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">timer</span>
                      <span className="font-body-sm">Ticket Médio</span>
                    </div>
                    <span className="font-h2 text-on-surface">
                      R$ {(stats.totalRevenue / (stats.closedTodayCount || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-primary-fixed rounded-xl border border-primary text-on-primary-fixed">
                  <p className="font-label-bold mb-2">Atenção</p>
                  <p className="font-body-sm text-xs opacity-80">
                    Existem {occupiedTables.length} mesas abertas no momento. O fechamento do caixa não encerrará estas contas.
                  </p>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
