import { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, updateDoc, doc, getDoc, deleteDoc, where } from 'firebase/firestore';
import { Clock, Receipt, CheckCircle2, Utensils, MoveRight, MoveLeft, AlertCircle, XCircle, AlertTriangle, Search, Printer, ChevronDown, ChevronUp, LayoutDashboard, AlignJustify, Archive, ClipboardList, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  tableNumber?: string | number;
  items: CartItem[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'served' | 'paid' | 'archived' | 'cancelled';
  totalAmount: number;
  createdAt: any;
}

export default function Orders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [highlightPending, setHighlightPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
  const [viewMode, setViewMode] = useState<'kanban' | 'by-table' | 'summary'>('kanban');

  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    icon?: 'check' | 'archive';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Audio reference for new order beep
  const audioContext = useRef<AudioContext | null>(null);
  const prevPendingCount = useRef<number>(0);
  
  const [tablesMap, setTablesMap] = useState<Map<string, string | number>>(new Map());
  const [rawOrders, setRawOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    // Tick every minute to update elapsed times
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const playBeep = () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContext.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      // Sequência mais elaborada: Arpejo ascendente (G4, C5, E5, G5)
      playNote(392.00, now, 0.4);        // G4
      playNote(523.25, now + 0.15, 0.4); // C5
      playNote(659.25, now + 0.30, 0.4); // E5
      playNote(783.99, now + 0.45, 0.8); // G5 (sustenida leve)
    } catch (e) {
      console.log("Audio not supported or blocked", e);
    }
  };

  useEffect(() => {
    const qTables = query(collection(db, 'tables'));
    const unsubscribeTables = onSnapshot(qTables, (snapshot) => {
      const newMap = new Map<string, string | number>();
      snapshot.forEach(doc => {
        newMap.set(doc.id, doc.data().number);
      });
      setTablesMap(newMap);
    }, (error) => {
      console.error("Erro ao buscar mesas:", error);
    });

    return () => unsubscribeTables();
  }, []);

  useEffect(() => {
    // Apenas pedidos que não foram arquivados para economizar leitura
    const q = query(
      collection(db, 'orders'), 
      where('status', 'in', ['pending', 'preparing', 'ready'])
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: OrderData[] = [];
      
      for (const document of snapshot.docs) {
        ordersData.push({ id: document.id, ...document.data() } as OrderData);
      }
      
      ordersData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB; // Oldest first
      });

      setRawOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (rawOrders.length === 0) {
      setOrders([]);
      return;
    }

    const compiledOrders = rawOrders.map(order => ({
      ...order,
      tableNumber: tablesMap.get(order.tableId) || 'N/A'
    }));

    // Check if we have new pending orders
    const currentPendingCount = compiledOrders.filter(o => o.status === 'pending').length;
    if (currentPendingCount > prevPendingCount.current) {
      playBeep();
      setHighlightPending(true);
      setTimeout(() => setHighlightPending(false), 2500); // 2.5 second highlight pulse
    }
    prevPendingCount.current = currentPendingCount;
    
    setOrders(compiledOrders);
  }, [rawOrders, tablesMap]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderData['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const cancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      await updateDoc(doc(db, 'orders', orderToCancel), { status: 'cancelled' });
      setOrderToCancel(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderToCancel}`);
      setOrderToCancel(null); // Close modal on error, or you could let them try again
    }
  };

  const advanceAllPreparingToReady = async (preparingOrders: OrderData[]) => {
    setConfirmModalData({
      isOpen: true,
      title: 'Avançar Pedidos',
      message: `Tem certeza que deseja avançar todos os ${preparingOrders.length} pedidos para 'Prontos'?`,
      icon: 'check',
      onConfirm: async () => {
        try {
          await Promise.all(preparingOrders.map(order => 
            updateDoc(doc(db, 'orders', order.id), { status: 'ready' })
          ));
        } catch (error) {
          console.error("Erro ao avançar todos os pedidos:", error);
        } finally {
          setConfirmModalData(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const getElapsedTime = (createdAt: any) => {
    if (!createdAt || !createdAt.toMillis) return { minutes: 0, formatted: '' };
    const diffMs = now.getTime() - createdAt.toMillis();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return { minutes: diffMins, formatted: `${diffMins}m` };
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return { minutes: diffMins, formatted: `${hours}h ${mins}m` };
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const printOrder = (order: OrderData) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const timeString = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
    const dateString = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Comanda - Mesa ${order.tableNumber}</title>
          <style>
            body { font-family: monospace; padding: 10px; max-width: 300px; margin: 0 auto; color: #000; }
            h1, h2 { text-align: center; margin: 5px 0; }
            hr { border-top: 1px dashed #000; margin: 10px 0; }
            .item { margin-bottom: 5px; }
            .notes { font-size: 0.9em; margin-left: 10px; }
            .total { font-weight: bold; text-align: right; font-size: 1.2em; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Mesa ${order.tableNumber}</h1>
          <h2>Pedido</h2>
          <p style="text-align: center;">${dateString} às ${timeString}</p>
          <hr/>
          ${order.items.map(item => `
            <div class="item">
              <div>${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2).replace('.',',')}</div>
              ${item.notes ? `<div class="notes">Obs: ${item.notes}</div>` : ''}
            </div>
          `).join('')}
          <hr/>
          <div class="total">Total: R$ ${order.totalAmount.toFixed(2).replace('.',',')}</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const tableMatch = String(order.tableNumber).toLowerCase().includes(term);
    const itemMatch = order.items.some(item => 
      item.name.toLowerCase().includes(term) || 
      (item.notes && item.notes.toLowerCase().includes(term))
    );
    return tableMatch || itemMatch;
  });

  const getSummaryItems = () => {
    const activeOrders = filteredOrders.filter(o => o.status === 'pending' || o.status === 'preparing');
    const itemCounts = new Map<string, { quantity: number; notes: Set<string>; isDelayed: boolean; isVeryDelayed: boolean }>();
    
    activeOrders.forEach(order => {
      const timeInfo = getElapsedTime(order.createdAt);
      const isVeryDelayed = timeInfo.minutes > 30;
      const isDelayed = timeInfo.minutes > 15;

      order.items.forEach(item => {
        const key = item.name;
        if (!itemCounts.has(key)) {
          itemCounts.set(key, { quantity: 0, notes: new Set(), isDelayed: false, isVeryDelayed: false });
        }
        const current = itemCounts.get(key)!;
        current.quantity += item.quantity;
        if (item.notes) {
          current.notes.add(item.notes);
        }
        if (isVeryDelayed) current.isVeryDelayed = true;
        else if (isDelayed) current.isDelayed = true;
      });
    });

    return Array.from(itemCounts.entries()).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      notes: Array.from(data.notes),
      isDelayed: data.isDelayed,
      isVeryDelayed: data.isVeryDelayed
    })).sort((a, b) => b.quantity - a.quantity);
  };

  const columns: { id: OrderData['status'], title: string, color: string, headerColor: string, nextStatus?: OrderData['status'], prevStatus?: OrderData['status'] }[] = [
    { id: 'pending', title: 'Novos Pedidos', color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400', headerColor: 'bg-yellow-500 text-white', nextStatus: 'preparing' },
    { id: 'preparing', title: 'Em Preparo', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400', headerColor: 'bg-blue-500 text-white', nextStatus: 'ready', prevStatus: 'pending' },
    { id: 'ready', title: 'Prontos / Expedição', color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400', headerColor: 'bg-emerald-500 text-white', prevStatus: 'preparing' }
  ];

  const renderOrderCard = (order: OrderData) => {
    const col = columns.find(c => c.id === order.status);
    if (!col) return null;

    const timeInfo = getElapsedTime(order.createdAt);
    const isDelayed = (col.id === 'pending' || col.id === 'preparing') && timeInfo.minutes > 15;
    const isVeryDelayed = (col.id === 'pending' || col.id === 'preparing') && timeInfo.minutes > 30;
    
    return (
      <div key={order.id} className={`group relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl shadow-sm border transition-shadow hover:shadow-md flex flex-col ${
        isVeryDelayed ? 'border-red-400 dark:border-red-600 ring-1 ring-red-400 dark:ring-red-600' : 
        isDelayed ? 'border-orange-400 dark:border-orange-600 ring-1 ring-orange-400 dark:ring-orange-600' : 
        'border-slate-200 dark:border-slate-700'
      }`}>
        {(isVeryDelayed || isDelayed) && (
          <div className={`absolute top-0 right-0 left-0 h-1 z-10 animate-pulse ${
            isVeryDelayed ? 'bg-red-500' : 'bg-orange-500'
          }`}></div>
        )}
        
        <div className="flex justify-between items-start p-4 pb-2 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="flex items-center gap-1.5 bg-slate-900 dark:bg-slate-700 text-white text-lg font-black px-3 py-1 rounded-lg">
                Mesa {order.tableNumber || '?'}
              </span>
              
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full shadow-sm ${
                  isVeryDelayed 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' 
                    : isDelayed 
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  <Clock className={`w-4 h-4 ${isVeryDelayed ? 'animate-pulse text-red-600 dark:text-red-400' : ''}`} />
                  {timeInfo.formatted || 'Agora'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col p-4 bg-slate-50/50 dark:bg-slate-800/20">
          <ul className="space-y-3 mb-2">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex flex-col">
                <div className="flex items-start gap-3">
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-2 py-0.5 rounded text-sm shrink-0">
                    {item.quantity}x
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight pt-0.5">
                    {item.name}
                  </span>
                </div>
                {item.notes && (
                  <div className="mt-1.5 ml-9 flex text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1.5 rounded-md font-medium border border-rose-100 dark:border-rose-900/50">
                    <span className="shrink-0 mr-1.5">⚠️</span> 
                    <span>{item.notes}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {col.id === 'pending' && (
              <button
                onClick={() => cancelOrder(order.id)}
                className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Cancelar Pedido"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => printOrder(order)}
              className="text-slate-400 hover:text-indigo-500 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              title="Imprimir Comanda"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {col.prevStatus && (
              <button 
                onClick={() => updateOrderStatus(order.id, col.prevStatus!)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors"
                title="Voltar Etapa"
              >
                <MoveLeft className="w-5 h-5" />
              </button>
            )}
            
            {col.id === 'ready' ? (
              <button
                onClick={() => updateOrderStatus(order.id, 'delivered')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Entregar <MoveRight className="w-4 h-4" />
              </button>
            ) : col.nextStatus && (
              <button 
                onClick={() => updateOrderStatus(order.id, col.nextStatus!)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Avançar <MoveRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  const getActiveOrdersByTable = () => {
    const activeOrders = filteredOrders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
    const grouped = new Map<string, { tableNumber: string | number, orders: OrderData[] }>();
    activeOrders.forEach(o => {
        if (!grouped.has(o.tableId)) {
            grouped.set(o.tableId, { tableNumber: o.tableNumber || '?', orders: [] });
        }
        grouped.get(o.tableId)!.orders.push(o);
    });
    return Array.from(grouped.values()).sort((a, b) => {
      const numA = parseInt(String(a.tableNumber));
      const numB = parseInt(String(b.tableNumber));
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a.tableNumber).localeCompare(String(b.tableNumber));
    });
  };

  const groupedOrders = getActiveOrdersByTable();

  return (
    <main className="max-w-[1400px] mx-auto p-4 sm:p-6 overflow-x-auto flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-500" />
            Gestão de Cozinha
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe e mova os pedidos pelo fluxo de trabalho (atualizado em tempo real).</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Fluxo</span>
            </button>
            <button
              onClick={() => setViewMode('by-table')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'by-table' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <AlignJustify className="w-4 h-4" />
              <span className="hidden sm:inline">Por Mesa</span>
            </button>
            <button
              onClick={() => setViewMode('summary')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'summary' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Resumo</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
              />
            </div>
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                  });
                } else {
                  document.exitFullscreen();
                }
              }}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              title="Tela Cheia"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'kanban' && (
          <motion.div 
            key="kanban"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex gap-6 min-w-[1000px] h-full items-start overflow-y-hidden"
          >
            {columns.map(col => {
              const colOrders = filteredOrders.filter(o => o.status === col.id);
              
              return (
                <div key={col.id} className={`flex-1 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 flex flex-col h-[calc(100vh-170px)] min-w-[300px] transition-all duration-700 ${col.id === 'pending' && highlightPending ? 'ring-4 ring-yellow-400 dark:ring-yellow-500 shadow-xl shadow-yellow-200 dark:shadow-yellow-900/40 scale-[1.02] bg-yellow-50/50 dark:bg-yellow-900/20 animate-pulse' : ''}`}>
                  <div className={`p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center rounded-t-2xl shrink-0 ${col.headerColor}`}>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold">{col.title}</h2>
                      <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {colOrders.length}
                      </span>
                    </div>
                    {col.id === 'preparing' && colOrders.length > 0 && (
                      <button
                        onClick={() => advanceAllPreparingToReady(colOrders)}
                        className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1.5 rounded-md font-medium transition-colors shadow-sm flex items-center gap-1"
                        title="Avançar todos para Pronto"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Todos Prontos
                      </button>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1 overflow-y-auto space-y-4">
                    {colOrders.length === 0 ? (
                      <div className="h-full flex flex-col justify-center items-center text-slate-400 dark:text-slate-500">
                        <Receipt className="w-8 h-8 mb-2 opacity-20" />
                        <span className="text-sm">Nenhum pedido</span>
                      </div>
                    ) : (
                      colOrders.map(order => renderOrderCard(order))
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
        
        {viewMode === 'by-table' && (
          <motion.div 
            key="by-table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-y-auto pr-2 pb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {groupedOrders.length === 0 ? (
              <div className="col-span-full h-64 flex flex-col justify-center items-center text-slate-400 dark:text-slate-500">
                <Receipt className="w-12 h-12 mb-4 opacity-20" />
                <span className="text-lg font-medium">Nenhum pedido ativo no momento</span>
              </div>
            ) : (
              groupedOrders.map(group => (
                <div key={group.tableNumber} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-fit max-h-[80vh]">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 rounded-t-2xl shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-primary-500" />
                      Mesa {group.tableNumber}
                    </h2>
                    <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold px-3 py-1 rounded-full">
                      {group.orders.length} pedido{group.orders.length !== 1 ? 's' : ''} ativo{group.orders.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col gap-4 overflow-y-auto w-full max-w-full">
                    {group.orders.map(order => renderOrderCard(order))}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
        
        {viewMode === 'summary' && (
          <motion.div 
            key="summary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-y-auto pr-2 pb-8"
          >
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <ClipboardList className="w-6 h-6" />
                </span>
                Resumo de Produção (Agrupado por Produto)
              </h2>
              
              {getSummaryItems().length === 0 ? (
                 <div className="h-64 flex flex-col justify-center items-center text-slate-400 dark:text-slate-500">
                   <Receipt className="w-12 h-12 mb-4 opacity-20" />
                   <span className="text-lg font-medium">Nenhum item pendente para produção no momento</span>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSummaryItems().map((item, idx) => (
                    <div key={idx} className={`rounded-xl border p-5 flex flex-col gap-3 transition-colors ${
                      item.isVeryDelayed ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' :
                      item.isDelayed ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10' :
                      'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30'
                    }`}>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-tight">
                          {item.name}
                        </h3>
                        <span className="bg-indigo-600 text-white text-lg font-black px-3 py-1 rounded-lg shadow-sm">
                          {item.quantity}x
                        </span>
                      </div>
                      
                      {item.notes.length > 0 && (
                        <div className="mt-auto space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Atenção às Observações:</span>
                          {item.notes.map((note, nIdx) => (
                            <div key={nIdx} className="text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/30 p-2 rounded-md border border-amber-200/50 dark:border-amber-900/50">
                              ⚠️ {note}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {orderToCancel && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cancelar Pedido</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setOrderToCancel(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Sim, Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModalData.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                {confirmModalData.icon === 'check' ? (
                  <CheckCircle2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Archive className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{confirmModalData.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                {confirmModalData.message}
              </p>
              
              <div className="flex gap-3">
                {confirmModalData.title !== 'Aviso' && (
                  <button
                    onClick={() => setConfirmModalData(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={confirmModalData.onConfirm}
                  className={`${confirmModalData.title === 'Aviso' ? 'w-full' : 'flex-1'} bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2`}
                >
                  {confirmModalData.icon === 'check' ? <CheckCircle2 className="w-5 h-5" /> : <Archive className="w-5 h-5" />}
                  {confirmModalData.title === 'Aviso' ? 'Entendi' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
