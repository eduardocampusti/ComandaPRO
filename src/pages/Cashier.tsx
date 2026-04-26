import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, updateDoc, doc, where, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { Wallet, Store, Receipt, CheckCircle2, Search, Utensils, RotateCcw, AlertTriangle } from 'lucide-react';

interface Table {
  id: string;
  number: number | string;
  status: 'available' | 'occupied' | 'reserved';
  active?: boolean;
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface OrderData {
  id: string;
  tableId: string;
  items: CartItem[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'served' | 'paid' | 'archived' | 'cancelled';
  totalAmount: number;
  createdAt?: any;
}

export default function Cashier() {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [viewMode, setViewMode] = useState<'open' | 'closed'>('open');
  const [closedOrders, setClosedOrders] = useState<OrderData[]>([]);
  const [selectedTableDetails, setSelectedTableDetails] = useState<Table | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{table: Table, hasPending: boolean} | null>(null);

  useEffect(() => {

    const qTables = query(collection(db, 'tables'), orderBy('number'));
    const unsubscribeTables = onSnapshot(qTables, (snapshot) => {
      const tablesData: Table[] = [];
      snapshot.forEach(doc => tablesData.push({ id: doc.id, ...doc.data() } as Table));
      setTables(tablesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tables');
    });

    const qOrders = query(
      collection(db, 'orders'),
      where('status', 'in', ['pending', 'preparing', 'ready', 'delivered', 'served'])
    );
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersData: OrderData[] = [];
      snapshot.forEach(doc => ordersData.push({ id: doc.id, ...doc.data() } as OrderData));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    const qClosedOrders = query(
      collection(db, 'orders'),
      where('status', '==', 'paid')
    );
    const unsubscribeClosedOrders = onSnapshot(qClosedOrders, (snapshot) => {
      const ordersData: OrderData[] = [];
      snapshot.forEach(doc => ordersData.push({ id: doc.id, ...doc.data() } as OrderData));
      setClosedOrders(ordersData);
    });

    return () => {
      unsubscribeTables();
      unsubscribeOrders();
      unsubscribeClosedOrders();
    };
  }, []);

  const getTableOrders = (tableId: string) => {
    return orders.filter(o => o.tableId === tableId);
  };

  const getTableTotal = (tableOrders: OrderData[]) => {
    return tableOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const handleCloseTableClick = (table: Table) => {
    const tableOrders = getTableOrders(table.id);
    const unservedOrders = tableOrders.filter(o => o.status !== 'served');
    
    setConfirmModalData({ table, hasPending: unservedOrders.length > 0 });
    setIsConfirmModalOpen(true);
  };

  const confirmCloseTable = async () => {
    if (!confirmModalData) return;
    
    const { table } = confirmModalData;
    const tableOrders = getTableOrders(table.id);

    try {
      const batch = writeBatch(db);
      
      // Update all orders to paid
      tableOrders.forEach(order => {
        batch.update(doc(db, 'orders', order.id), { status: 'paid' });
      });

      // Free the table
      batch.update(doc(db, 'tables', table.id), { 
        status: 'available', 
        active: false, 
        currentSessionId: null
      });

      await batch.commit();
      setIsConfirmModalOpen(false);
      setConfirmModalData(null);
      setSelectedTableDetails(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'cashier/closeTable');
      // Just log the error, don't use alert()
      console.error("Erro ao fechar a mesa:", error);
    }
  };

  const occupiedTables = tables.filter(t => t.status === 'occupied' || getTableOrders(t.id).length > 0);

  const filteredTables = occupiedTables.filter(t => {
    if (!searchTerm) return true;
    return String(t.number).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalClosedAmount = closedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOpenAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Consider today based on createdAt timestamp if available, but for now we summarize the collections.
  const paidOrdersCount = closedOrders.length;
  const openTablesCount = occupiedTables.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto p-4 sm:p-6 overflow-x-auto flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-500" />
            Caixa
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gestão de contas abertas e fechamento de mesas do dia.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setViewMode('open')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'open' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Mesas Abertas
            </button>
            <button
              onClick={() => setViewMode('closed')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'closed' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Contas Pagas
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar mesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total em Aberto</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">R$ {totalOpenAmount.toFixed(2).replace('.', ',')}</p>
            <p className="text-xs text-slate-400 mt-1">{openTablesCount} mesa{openTablesCount !== 1 ? 's' : ''} em andamento</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recebido (Pagos)</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">R$ {totalClosedAmount.toFixed(2).replace('.', ',')}</p>
            <p className="text-xs text-slate-400 mt-1">{paidOrdersCount} pedido{paidOrdersCount !== 1 ? 's' : ''} fechado{paidOrdersCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vendas Totais</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">R$ {(totalClosedAmount + totalOpenAmount).toFixed(2).replace('.', ',')}</p>
            <p className="text-xs text-slate-400 mt-1">Previsão do momento</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {viewMode === 'open' ? (
          filteredTables.length === 0 ? (
            <div className="h-64 flex flex-col justify-center items-center text-slate-400 dark:text-slate-500">
              <Store className="w-12 h-12 mb-4 opacity-20" />
              <span className="text-lg font-medium">Nenhuma mesa com conta aberta.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTables.map(table => {
                const tableOrders = getTableOrders(table.id);
                const total = getTableTotal(tableOrders);
                const hasPendingOrders = tableOrders.some(o => o.status !== 'served');

                return (
                  <div key={table.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
                          {table.number}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">Mesa {table.number}</h3>
                          <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                            <Receipt className="w-3.5 h-3.5" />
                            {tableOrders.length} pedido{tableOrders.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {hasPendingOrders && (
                        <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1" title="Existem pedidos em preparo/entrega">
                          <AlertTriangle className="w-3 h-3" />
                          Abertos
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-center py-4 border-y border-slate-100 dark:border-slate-700/50 mb-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl px-4 text-center">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total da Conta</span>
                      <span className="text-3xl font-bold text-slate-800 dark:text-white">
                        R$ {total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedTableDetails(table)}
                        className="w-full bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Receipt className="w-5 h-5" />
                        Ver Detalhes
                      </button>
                      <button
                        onClick={() => handleCloseTableClick(table)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Receber e Fechar Mesa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Histórico de Pedidos Pagos</h2>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                Total Recebido: R$ {totalClosedAmount.toFixed(2).replace('.', ',')}
              </div>
            </div>
            
            {closedOrders.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center py-12 text-slate-400 dark:text-slate-500">
                <Receipt className="w-12 h-12 mb-4 opacity-20" />
                <span className="text-lg font-medium">Nenhum pedido pago (arquivado ou de hoje).</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">ID do Pedido</th>
                      <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Mesa</th>
                      <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Total</th>
                      <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedOrders.map((order, i) => (
                      <tr key={order.id} className={i !== closedOrders.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}>
                        <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-300 font-medium">{order.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {tables.find(t => t.id === order.tableId)?.number || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-slate-900 dark:text-white">
                          R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-md font-bold text-xs">
                            Pago
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedTableDetails && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex flex-col justify-center items-center p-4 sm:p-6 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-6 h-6 text-indigo-500" />
                Detalhes da Mesa {selectedTableDetails.number}
              </h2>
              <button 
                onClick={() => setSelectedTableDetails(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Fechar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {(() => {
                const tableOrders = getTableOrders(selectedTableDetails.id);
                if (tableOrders.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      Nenhum pedido encontrado para esta mesa.
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {tableOrders.map((order, index) => (
                      <div key={order.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Pedido #{index + 1} <span className="text-sm font-normal text-slate-500 ml-2">({order.id.slice(0, 6)})</span>
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            order.status === 'served' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {order.status === 'served' ? 'Entregue' : 'Em andamento'}
                          </span>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800">
                          <ul className="space-y-3">
                            {order.items?.map((item, i) => (
                              <li key={i} className="flex justify-between items-start text-sm">
                                <div className="flex gap-2">
                                  <span className="font-medium text-slate-900 dark:text-slate-200">{item.quantity}x</span>
                                  <div>
                                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                                    {item.notes && <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">{item.notes}</p>}
                                  </div>
                                </div>
                                <span className="font-medium text-slate-900 dark:text-slate-200">
                                  R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center font-bold">
                            <span className="text-slate-800 dark:text-slate-200">Subtotal</span>
                            <span className="text-slate-900 dark:text-white">R$ {order.totalAmount.toFixed(2).replace('.', ',')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="text-center sm:text-left">
                 <p className="text-sm text-slate-500 dark:text-slate-400">Total a Pagar</p>
                 <p className="text-2xl font-bold text-slate-900 dark:text-white">
                   R$ {getTableTotal(getTableOrders(selectedTableDetails.id)).toFixed(2).replace('.', ',')}
                 </p>
               </div>
               <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                 <button
                   onClick={() => setSelectedTableDetails(null)}
                   className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                 >
                   Voltar
                 </button>
                 <button
                   onClick={() => {
                     if (selectedTableDetails) {
                       handleCloseTableClick(selectedTableDetails);
                     }
                   }}
                   className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                 >
                   <CheckCircle2 className="w-5 h-5" />
                   Receber
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {isConfirmModalOpen && confirmModalData && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex flex-col justify-center items-center p-6 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center border-t-4 border-indigo-500">
            <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Fechar Mesa {confirmModalData.table.number}
            </h2>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {confirmModalData.hasPending ? 
                `Atenção: Esta mesa possui pedidos em andamento (não entregues). Deseja realmente fechar a mesa e marcar todos como pagos?`
                : `Confirmar o fechamento da conta da Mesa ${confirmModalData.table.number}?`}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmCloseTable}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
