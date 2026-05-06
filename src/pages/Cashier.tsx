import { useEffect, useMemo, useState } from 'react';
import {
  fetchOrders,
  fetchTables,
  subscribeToOrders,
  subscribeToTables,
  updateOrder,
  updateTable,
} from '../lib/database';
import type { OrderData, TableData } from '../lib/database';
import {
  AlertCircle,
  Check,
  RefreshCw,
  ReceiptText,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ClosedOrdersTable } from '../components/Cashier/ClosedOrdersTable';
import { CloseTableConfirmationModal } from '../components/Cashier/CloseTableConfirmationModal';
import { cx } from '../components/ui/AppPrimitives';

type ViewMode = 'open' | 'closed';

export default function Cashier() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [closedOrders, setClosedOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('open');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    window.setTimeout(() => setFeedback(null), 3000);
  };

  const handleRealtimeError = (realtimeError: unknown) => {
    console.error('Erro ao sincronizar caixa:', realtimeError);
    setError('Não foi possível sincronizar o caixa em tempo real.');
  };

  const loadTables = async () => {
    const data = await fetchTables();
    setTables(data);
  };

  const loadOrders = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const data = await fetchOrders({
      status: ['pending', 'preparing', 'ready', 'delivered', 'served'],
      startDate: today.toISOString(),
    });
    setOrders(data);
  };

  const loadClosedOrders = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const data = await fetchOrders({ 
      status: ['paid'],
      startDate: today.toISOString(),
    });
    setClosedOrders(data);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadTables(), loadOrders(), loadClosedOrders()]);
      setError(null);
    } catch (loadError) {
      console.error('Erro ao carregar caixa:', loadError);
      setError('Não foi possível carregar o caixa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAllData();

    const tablesSubscription = subscribeToTables(() => {
      loadTables().catch(handleRealtimeError);
    });

    const ordersSubscription = subscribeToOrders(() => {
      Promise.all([loadOrders(), loadClosedOrders()]).catch(handleRealtimeError);
    });

    return () => {
      tablesSubscription.unsubscribe();
      ordersSubscription.unsubscribe();
    };
  }, []);

  const getTableOrders = (tableId: string) => {
    return orders.filter((order) => order.table_id === tableId);
  };

  const selectedTable = useMemo(() => {
    return tables.find(t => t.id === selectedTableId) || null;
  }, [tables, selectedTableId]);

  const selectedTableOrders = useMemo(() => {
    return selectedTableId ? getTableOrders(selectedTableId) : [];
  }, [selectedTableId, orders]);

  const confirmCloseTable = async () => {
    if (!selectedTable) return;

    try {
      const tableOrders = getTableOrders(selectedTable.id);
      await Promise.all(tableOrders.map((order) => updateOrder(order.id, { status: 'paid' })));
      await updateTable(selectedTable.id, {
        status: 'available',
        active: false,
        current_session_id: null,
      });

      setIsConfirmModalOpen(false);
      setSelectedTableId(null);
      showFeedback(`Mesa ${selectedTable.number} liberada`);
      await Promise.all([loadTables(), loadOrders(), loadClosedOrders()]);
    } catch (closeError) {
      console.error('Erro ao fechar a mesa:', closeError);
      showFeedback('Não foi possível fechar a mesa', 'error');
    }
  };

  const occupiedTables = useMemo(() => {
    return tables.filter((table) => table.status === 'occupied' || getTableOrders(table.id).length > 0);
  }, [tables, orders]);

  const filteredTables = useMemo(() => {
    return occupiedTables.filter((table) => {
      if (!searchTerm) return true;
      return String(table.number).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [occupiedTables, searchTerm]);

  const totalClosedAmount = useMemo(
    () => closedOrders.reduce((sum, order) => {
      const amount = Number(order.total_amount);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0),
    [closedOrders]
  );

  const subtotal = useMemo(() => 
    selectedTableOrders.reduce((sum, order) => {
      const amount = Number(order.total_amount);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0),
  [selectedTableOrders]);

  const serviceCharge = subtotal * 0.1;
  const totalToPay = subtotal + serviceCharge;

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-red-100 border-t-red-600" />
          <p className="mt-4 font-['Plus_Jakarta_Sans'] text-lg font-black text-zinc-950">
            Sincronizando caixa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f9f9f9] text-[#1a1c1c] font-['Inter']" id="stitch-cashier-root">
      <style dangerouslySetInnerHTML={{ __html: `
        #stitch-cashier-root {
          --primary: #bb001b;
          --on-primary: #ffffff;
          --surface: #f9f9f9;
          --on-surface: #1a1c1c;
          --secondary: #5f5e5e;
          --outline-variant: #e7bcb9;
          --surface-container-low: #f3f3f3;
          --surface-container-lowest: #ffffff;
          --primary-fixed: #ffdad7;
          --on-primary-fixed: #410004;
          --on-primary-fixed-variant: #930013;
        }

        #stitch-cashier-root .hide-scrollbar::-webkit-scrollbar { display: none; }
        #stitch-cashier-root .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        #stitch-cashier-root .font-h1 { font-family: 'Plus Jakarta Sans'; font-size: 32px; font-weight: 800; line-height: 1.2; }
        #stitch-cashier-root .font-h2 { font-family: 'Plus Jakarta Sans'; font-size: 24px; font-weight: 700; line-height: 1.3; }
        #stitch-cashier-root .font-h3 { font-family: 'Plus Jakarta Sans'; font-size: 20px; font-weight: 700; line-height: 1.3; }
        #stitch-cashier-root .font-price { font-family: 'Plus Jakarta Sans'; font-size: 20px; font-weight: 700; line-height: 1; }
        #stitch-cashier-root .font-label-bold { font-family: 'Inter'; font-size: 14px; font-weight: 600; line-height: 1; }
        #stitch-cashier-root .font-body-md { font-family: 'Inter'; font-size: 16px; font-weight: 400; line-height: 1.5; }
        #stitch-cashier-root .font-body-sm { font-family: 'Inter'; font-size: 14px; font-weight: 400; line-height: 1.4; }
      `}} />

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between px-4 py-3 w-full h-16 shrink-0">
        <div className="flex items-center gap-4">
          <div className="text-[#bb001b] font-black tracking-tighter italic text-xl">COMANDA PRO</div>
          <div className="h-6 w-px bg-[#e7bcb9] mx-2 hidden md:block"></div>
          <h1 className="font-h3 text-[#1a1c1c] hidden md:block">Caixa Operacional</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-full border border-zinc-200 bg-zinc-50 p-1">
            <button
              onClick={() => setViewMode('open')}
              className={cx(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                viewMode === 'open' ? "bg-white text-[#bb001b] shadow-sm" : "text-zinc-500"
              )}
            >
              Mesas Abertas
            </button>
            <button
              onClick={() => setViewMode('closed')}
              className={cx(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                viewMode === 'closed' ? "bg-white text-[#bb001b] shadow-sm" : "text-zinc-500"
              )}
            >
              Recebimentos
            </button>
          </div>
          
          <div className="relative hidden md:flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#5f5e5e] text-lg">search</span>
            <input 
              className="pl-10 pr-4 py-2 bg-[#f3f3f3] border border-[#e7bcb9] rounded-full font-body-sm text-sm focus:outline-none focus:border-[#bb001b] w-64 transition-all" 
              placeholder="Buscar mesa..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button onClick={loadAllData} className="p-2 text-zinc-500 hover:bg-zinc-50 rounded-full transition-colors">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden min-h-0">
        <AnimatePresence mode="wait">
          {viewMode === 'open' ? (
            <motion.div 
              key="view-open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex gap-4 overflow-hidden"
            >
              {/* Sidebar: Mesas Abertas */}
              <section className="w-1/4 min-w-[280px] max-w-[350px] bg-white border border-[#e7bcb9] rounded-xl flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="p-4 border-b border-[#e7bcb9] flex justify-between items-center bg-[#f3f3f3] rounded-t-xl shrink-0">
                  <h2 className="font-h3 text-[#1a1c1c]">Mesas Abertas</h2>
                  <span className="bg-[#bb001b] text-white font-label-bold text-[12px] px-2 py-0.5 rounded-full">
                    {occupiedTables.length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar">
                  {filteredTables.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ReceiptText className="h-12 w-12 text-zinc-200 mb-4" />
                      <p className="font-label-bold text-zinc-400">Nenhuma mesa aberta</p>
                    </div>
                  ) : (
                    filteredTables.map((table) => {
                      const tableOrders = getTableOrders(table.id);
                      const tableTotal = tableOrders.reduce((sum, o) => sum + o.total_amount, 0);
                      const isSelected = selectedTableId === table.id;
                      
                      return (
                        <button 
                          key={table.id}
                          onClick={() => setSelectedTableId(table.id)}
                          className={cx(
                            "w-full text-left rounded-lg p-3 flex justify-between items-stretch transition-all group border",
                            isSelected 
                              ? "bg-[#ffdad7] border-[#bb001b] shadow-sm active:scale-[0.98]" 
                              : "bg-white border-[#e7bcb9] hover:border-[#5f5e5e] hover:shadow-sm active:scale-[0.98]"
                          )}
                        >
                          <div className="flex flex-col justify-between">
                            <div className="flex items-center gap-2">
                              <span className={cx("font-h2", isSelected ? "text-[#410004]" : "text-[#1a1c1c]")}>
                                {String(table.number).padStart(2, '0')}
                              </span>
                              <span className={cx("material-symbols-outlined text-sm", isSelected ? "text-[#bb001b]" : "text-[#5f5e5e]")}>
                                {tableOrders.length > 2 ? 'groups' : 'person'}
                              </span>
                            </div>
                            <div className={cx("font-label-bold text-[12px] mt-2 flex items-center gap-1", isSelected ? "text-[#bb001b]" : "text-[#5f5e5e]")}>
                              {isSelected && <span className="w-2 h-2 rounded-full bg-[#bb001b] animate-pulse"></span>}
                              {tableTotal > 0 ? 'Consumindo' : 'Ocupada'}
                            </div>
                          </div>
                          <div className="flex flex-col justify-between items-end text-right">
                            <span className={cx("font-body-sm text-xs opacity-80", isSelected ? "text-[#930013]" : "text-[#5f5e5e]")}>
                              {tableOrders.length} itens
                            </span>
                            <span className={cx("font-price mt-2", isSelected ? "text-[#bb001b]" : "text-[#1a1c1c]")}>
                              R$ {tableTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Main: Detalhes da Mesa */}
              <section className="flex-1 bg-white border border-[#e7bcb9] rounded-xl flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                {selectedTable ? (
                  <>
                    <div className="p-5 border-b border-[#e7bcb9] flex justify-between items-center bg-white rounded-t-xl shrink-0">
                      <div>
                        <div className="flex items-baseline gap-3">
                          <h2 className="font-h1 text-[#1a1c1c]">Mesa {selectedTable.number}</h2>
                          <span className="font-body-lg text-zinc-400">ID: {selectedTable.id.slice(0, 8)}</span>
                        </div>
                        <p className="font-body-sm text-[#5f5e5e] mt-1">Status: Ocupada • {selectedTableOrders.length} itens no total</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-5 hide-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#e7bcb9] text-[#5f5e5e] font-label-bold">
                            <th className="pb-3 w-16 font-normal">Qtd</th>
                            <th className="pb-3 font-normal">Item</th>
                            <th className="pb-3 text-right font-normal">V. Unit</th>
                            <th className="pb-3 text-right font-normal">Total</th>
                          </tr>
                        </thead>
                        <tbody className="font-body-md text-[#1a1c1c]">
                          {selectedTableOrders.flatMap(order => order.items).length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-zinc-400">
                                Nenhum item lançado nesta mesa.
                              </td>
                            </tr>
                          ) : (
                            selectedTableOrders.flatMap((order) => 
                              order.items.map((item) => (
                                <tr key={item.cart_item_id} className="border-b border-zinc-100 hover:bg-[#f3f3f3] transition-colors group">
                                  <td className="py-4 align-top">
                                    <span className="bg-zinc-100 px-2 py-1 rounded font-label-bold text-xs">
                                      {item.quantity}x
                                    </span>
                                  </td>
                                  <td className="py-4">
                                    <div className="font-label-bold">{item.name || 'Item sem nome'}</div>
                                    {item.notes && (
                                      <div className="font-body-sm text-xs text-[#5f5e5e] mt-1 italic">{item.notes}</div>
                                    )}
                                    {item.options && item.options.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {item.options.map(opt => (
                                          <span key={opt.id} className="text-[10px] bg-zinc-50 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-100">
                                            + {opt.name}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-4 text-right text-[#5f5e5e]">
                                    R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-4 text-right font-label-bold">
                                    R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))
                            )
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-5 bg-[#f3f3f3] border-t border-[#e7bcb9] rounded-b-xl shrink-0">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between font-body-md text-[#5f5e5e]">
                          <span>Subtotal Itens</span>
                          <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between font-body-md text-[#5f5e5e]">
                          <span>Taxa de Serviço (10%)</span>
                          <span>R$ {serviceCharge.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end pt-4 border-t border-[#e7bcb9]">
                        <span className="font-h2 text-[#1a1c1c]">Total a Pagar</span>
                        <span className="font-h1 text-[#bb001b]">R$ {totalToPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6 border border-zinc-100">
                      <span className="material-symbols-outlined text-4xl text-zinc-300">touch_app</span>
                    </div>
                    <h2 className="font-h2 text-[#1a1c1c]">Selecione uma Mesa</h2>
                    <p className="font-body-md text-[#5f5e5e] mt-2 max-w-sm">
                      Escolha uma mesa aberta ao lado para visualizar os itens e realizar o fechamento da conta.
                    </p>
                  </div>
                )}
              </section>

              {/* Sidebar: Pagamento */}
              <section className="w-[320px] shrink-0 bg-white border border-[#e7bcb9] rounded-xl flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                <div className="p-5 border-b border-[#e7bcb9] bg-white rounded-t-xl shrink-0">
                  <h2 className="font-h3 text-[#1a1c1c] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#bb001b]">payments</span>
                    Pagamento
                  </h2>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto hide-scrollbar space-y-6">
                  <div>
                    <label className="font-label-bold text-[#5f5e5e] mb-3 block">Método de Pagamento</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="bg-[#ffdad7] border-2 border-[#bb001b] text-[#bb001b] rounded-xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
                        <span className="font-label-bold">Pix</span>
                      </button>
                      <button className="bg-white border border-[#e7bcb9] text-[#1a1c1c] rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#5f5e5e] hover:bg-[#f3f3f3] active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-3xl">credit_card</span>
                        <span className="font-label-bold">Cartão</span>
                      </button>
                      <button className="bg-white border border-[#e7bcb9] text-[#1a1c1c] rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#5f5e5e] hover:bg-[#f3f3f3] active:scale-95 transition-all col-span-2">
                        <span className="material-symbols-outlined text-3xl">payments</span>
                        <span className="font-label-bold">Dinheiro</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#f3f3f3] p-4 rounded-xl border border-[#e7bcb9]">
                    <label className="font-label-bold text-[#5f5e5e] mb-2 block">Confirmar Valor</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-h2 text-[#1a1c1c]">R$</span>
                      <input 
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[#e7bcb9] rounded-lg font-h2 text-right focus:outline-none focus:border-[#bb001b] transition-all" 
                        type="text" 
                        readOnly
                        value={totalToPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white border-t border-[#e7bcb9] shrink-0 z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
                  <button 
                    disabled={!selectedTable}
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="w-full bg-[#bb001b] hover:bg-[#c0001c] disabled:bg-zinc-300 text-white font-h3 py-4 rounded-xl shadow-[0_8px_30px_rgba(234,29,44,0.15)] active:translate-y-1 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Fechar Conta
                  </button>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="view-closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 bg-white border border-[#e7bcb9] rounded-xl flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden"
            >
              <div className="p-5 border-b border-[#e7bcb9] bg-[#f3f3f3] flex justify-between items-center shrink-0">
                <h2 className="font-h3 text-[#1a1c1c]">Histórico de Recebimentos</h2>
                <div className="font-price text-[#bb001b]">Total: R$ {totalClosedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <ClosedOrdersTable orders={closedOrders} tables={tables} totalClosedAmount={totalClosedAmount} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modais e Feedback */}
      {selectedTable && (
        <CloseTableConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={confirmCloseTable}
          tableNumber={selectedTable.number}
          hasPendingOrders={selectedTableOrders.some(o => !['delivered', 'served'].includes(o.status))}
        />
      )}

      {feedback && (
        <div
          className={cx(
            'fixed bottom-6 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-2xl',
            feedback.type === 'error' ? 'bg-red-600' : 'bg-zinc-950'
          )}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="h-5 w-5 shrink-0" />
          ) : (
            <Check className="h-5 w-5 shrink-0 text-green-400" />
          )}
          <span className="min-w-0 flex-1">{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
