import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlignJustify,
  Archive,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock3,
  Flame,
  LayoutDashboard,
  Maximize,
  MoveLeft,
  MoveRight,
  Printer,
  Receipt,
  RefreshCw,
  Search,
  ShieldAlert,
  Utensils,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { fetchOrders, fetchTables, updateOrder } from '../lib/database';
import { supabase } from '../lib/supabase';
import type { CartItem, OrderData as DatabaseOrderData } from '../lib/database';
import { cx } from '../components/ui/AppPrimitives';

type OrderStatus = DatabaseOrderData['status'];
type ViewMode = 'kanban' | 'by-table' | 'summary';

interface OrderData extends DatabaseOrderData {
  items: CartItem[];
  tableNumber?: string | number;
}

interface KdsColumn {
  id: OrderStatus;
  title: string;
  subtitle: string;
  actionLabel?: string;
  emptyLabel: string;
  nextStatus?: OrderStatus;
  prevStatus?: OrderStatus;
  className: string;
  headerClassName: string;
  badgeClassName: string;
}

interface ConfirmModalData {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  icon?: 'check' | 'archive';
}

const kitchenStatuses: OrderStatus[] = ['pending', 'preparing', 'ready', 'delivered'];

const columns: KdsColumn[] = [
  {
    id: 'pending',
    title: 'Novos',
    subtitle: 'Aguardando inicio',
    actionLabel: 'Iniciar preparo',
    emptyLabel: 'Nenhum pedido novo',
    nextStatus: 'preparing',
    className: 'border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/10',
    headerClassName: 'bg-amber-500 text-white',
    badgeClassName: 'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900',
  },
  {
    id: 'preparing',
    title: 'Em preparo',
    subtitle: 'Produzindo agora',
    actionLabel: 'Marcar pronto',
    emptyLabel: 'Nada em preparo',
    nextStatus: 'ready',
    prevStatus: 'pending',
    className: 'border-blue-200 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/10',
    headerClassName: 'bg-blue-600 text-white',
    badgeClassName: 'bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-900',
  },
  {
    id: 'ready',
    title: 'Prontos',
    subtitle: 'Aguardando retirada',
    actionLabel: 'Marcar entregue',
    emptyLabel: 'Nenhum pedido pronto',
    nextStatus: 'delivered',
    prevStatus: 'preparing',
    className: 'border-green-200 bg-green-50/70 dark:border-green-900/50 dark:bg-green-950/10',
    headerClassName: 'bg-green-600 text-white',
    badgeClassName: 'bg-green-100 text-green-800 ring-green-200 dark:bg-green-950/40 dark:text-green-200 dark:ring-green-900',
  },
  {
    id: 'delivered',
    title: 'Entregues',
    subtitle: 'Saiu da cozinha',
    emptyLabel: 'Nenhum pedido entregue',
    prevStatus: 'ready',
    className: 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40',
    headerClassName: 'bg-slate-800 text-white dark:bg-slate-700',
    badgeClassName: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
  },
];

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case 'pending':
      return 'Novo';
    case 'preparing':
      return 'Em preparo';
    case 'ready':
      return 'Pronto';
    case 'delivered':
    case 'served':
      return 'Entregue';
    case 'paid':
      return 'Pago';
    case 'archived':
      return 'Arquivado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
}

export default function Orders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [rawOrders, setRawOrders] = useState<OrderData[]>([]);
  const [tablesMap, setTablesMap] = useState<Map<string, string | number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [highlightPending, setHighlightPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  const [confirmModalData, setConfirmModalData] = useState<ConfirmModalData>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => undefined,
  });

  const audioContext = useRef<AudioContext | null>(null);
  const prevPendingCount = useRef<number>(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const playBeep = () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const context = audioContext.current;
      if (context.state === 'suspended') context.resume();

      const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const currentTime = context.currentTime;
      playNote(392, currentTime, 0.4);
      playNote(523.25, currentTime + 0.15, 0.4);
      playNote(659.25, currentTime + 0.3, 0.4);
      playNote(783.99, currentTime + 0.45, 0.8);
    } catch (beepError) {
      console.log('Audio not supported or blocked', beepError);
    }
  };

  const loadTables = async () => {
    try {
      const tables = await fetchTables();
      const newMap = new Map<string, string | number>();
      tables.forEach((table) => {
        newMap.set(table.id, table.number);
      });
      setTablesMap(newMap);
    } catch (tableError) {
      console.error('Erro ao buscar mesas:', tableError);
    }
  };

  const loadOrders = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ordersData = (await fetchOrders({ 
        status: kitchenStatuses,
        startDate: today.toISOString()
      })) as OrderData[];
      ordersData.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeA - timeB;
      });

      setRawOrders(ordersData);
      setError(null);
      setLoading(false);
    } catch (orderError) {
      console.error('Erro ao buscar pedidos:', orderError);
      setError('Nao foi possivel carregar os pedidos da cozinha.');
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const safeLoadTables = async () => {
      if (!isMounted) return;
      await loadTables();
    };

    safeLoadTables();

    // Em vez de polling de 3s, usamos Realtime para as mesas
    const subscription = supabase
      .channel('kds-tables-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => {
        safeLoadTables();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const safeLoadOrders = async () => {
      if (!isMounted) return;
      await loadOrders();
    };

    safeLoadOrders();

    // Realtime para pedidos: remove o polling de 3s
    const subscription = supabase
      .channel('kds-orders-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders'
      }, () => {
        safeLoadOrders();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    if (rawOrders.length === 0) {
      setOrders([]);
      prevPendingCount.current = 0;
      return;
    }

    const compiledOrders = rawOrders.map((order) => ({
      ...order,
      tableNumber: tablesMap.get(order.table_id) || 'N/A',
    }));

    const currentPendingCount = compiledOrders.filter((order) => order.status === 'pending').length;
    if (currentPendingCount > prevPendingCount.current) {
      playBeep();
      setHighlightPending(true);
      window.setTimeout(() => setHighlightPending(false), 2500);
    }
    prevPendingCount.current = currentPendingCount;

    setOrders(compiledOrders);
  }, [rawOrders, tablesMap]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      await loadOrders();
    } catch (updateError) {
      console.error(`Erro ao atualizar pedido ${orderId}:`, updateError);
    }
  };

  const cancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      await updateOrder(orderToCancel, { status: 'cancelled' });
      setOrderToCancel(null);
      await loadOrders();
    } catch (cancelError) {
      console.error(`Erro ao cancelar pedido ${orderToCancel}:`, cancelError);
      setOrderToCancel(null);
    }
  };

  const advanceAllPreparingToReady = async (preparingOrders: OrderData[]) => {
    setConfirmModalData({
      isOpen: true,
      title: 'Avancar pedidos',
      message: `Tem certeza que deseja avancar todos os ${preparingOrders.length} pedidos para "Pronto"?`,
      icon: 'check',
      onConfirm: async () => {
        try {
          await Promise.all(preparingOrders.map((order) => updateOrder(order.id, { status: 'ready' })));
          await loadOrders();
        } catch (advanceError) {
          console.error('Erro ao avancar todos os pedidos:', advanceError);
        } finally {
          setConfirmModalData((previous) => ({ ...previous, isOpen: false }));
        }
      },
    });
  };

  const getElapsedTime = (createdAt?: string) => {
    if (!createdAt) return { minutes: 0, formatted: 'Agora' };
    const createdAtMs = new Date(createdAt).getTime();
    if (Number.isNaN(createdAtMs)) return { minutes: 0, formatted: 'Agora' };
    const diffMs = now.getTime() - createdAtMs;
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMins < 1) return { minutes: 0, formatted: 'Agora' };
    if (diffMins < 60) return { minutes: diffMins, formatted: `${diffMins}m` };
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return { minutes: diffMins, formatted: `${hours}h ${mins}m` };
  };

  const getUrgency = (order: OrderData) => {
    const timeInfo = getElapsedTime(order.created_at);
    if (!['pending', 'preparing', 'ready'].includes(order.status)) {
      return { ...timeInfo, level: 'normal' as const, label: 'No tempo' };
    }

    if (timeInfo.minutes > 30) {
      return { ...timeInfo, level: 'critical' as const, label: 'Atrasado' };
    }
    if (timeInfo.minutes > 15) {
      return { ...timeInfo, level: 'warning' as const, label: 'Atencao' };
    }
    return { ...timeInfo, level: 'normal' as const, label: 'No tempo' };
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((previous) => {
      const next = new Set(previous);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const printOrder = (order: OrderData) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const createdDate = order.created_at ? new Date(order.created_at) : null;
    const timeString = createdDate && !Number.isNaN(createdDate.getTime())
      ? createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    const dateString = createdDate && !Number.isNaN(createdDate.getTime())
      ? createdDate.toLocaleDateString()
      : '';

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
          <p style="text-align: center;">${dateString} as ${timeString}</p>
          <hr/>
          ${order.items.map((item) => `
            <div class="item">
              <div>${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
              ${item.notes ? `<div class="notes">Obs: ${item.notes}</div>` : ''}
            </div>
          `).join('')}
          <hr/>
          <div class="total">Total: R$ ${order.total_amount.toFixed(2).replace('.', ',')}</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const tableMatch = String(order.tableNumber).toLowerCase().includes(term);
      const itemMatch = order.items.some((item) =>
        item.name.toLowerCase().includes(term) ||
        (item.notes && item.notes.toLowerCase().includes(term))
      );
      return tableMatch || itemMatch;
    });
  }, [orders, searchTerm]);

  const countsByStatus = useMemo(() => {
    return kitchenStatuses.reduce((accumulator, status) => {
      accumulator[status] = filteredOrders.filter((order) => order.status === status).length;
      return accumulator;
    }, {} as Record<OrderStatus, number>);
  }, [filteredOrders]);

  const delayedCount = filteredOrders.filter((order) => getUrgency(order).level !== 'normal').length;
  const pendingCount = filteredOrders.filter((order) => order.status === 'pending').length;
  const preparingCount = filteredOrders.filter((order) => order.status === 'preparing').length;
  const readyCount = filteredOrders.filter((order) => order.status === 'ready').length;

  const getSummaryItems = () => {
    const activeOrders = filteredOrders.filter((order) => order.status === 'pending' || order.status === 'preparing');
    const itemCounts = new Map<string, {
      quantity: number;
      notes: Set<string>;
      isDelayed: boolean;
      isVeryDelayed: boolean;
    }>();

    activeOrders.forEach((order) => {
      const urgency = getUrgency(order);
      const isVeryDelayed = urgency.level === 'critical';
      const isDelayed = urgency.level === 'warning';

      order.items.forEach((item) => {
        const key = item.name;
        if (!itemCounts.has(key)) {
          itemCounts.set(key, {
            quantity: 0,
            notes: new Set(),
            isDelayed: false,
            isVeryDelayed: false,
          });
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

    return Array.from(itemCounts.entries())
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        notes: Array.from(data.notes),
        isDelayed: data.isDelayed,
        isVeryDelayed: data.isVeryDelayed,
      }))
      .sort((a, b) => b.quantity - a.quantity);
  };

  const getActiveOrdersByTable = () => {
    const activeOrders = filteredOrders.filter((order) => kitchenStatuses.includes(order.status));
    const grouped = new Map<string, { tableNumber: string | number; orders: OrderData[] }>();

    activeOrders.forEach((order) => {
      if (!grouped.has(order.table_id)) {
        grouped.set(order.table_id, { tableNumber: order.tableNumber || '?', orders: [] });
      }
      grouped.get(order.table_id)!.orders.push(order);
    });

    return Array.from(grouped.values()).sort((a, b) => {
      const numA = Number.parseInt(String(a.tableNumber), 10);
      const numB = Number.parseInt(String(b.tableNumber), 10);
      if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
      return String(a.tableNumber).localeCompare(String(b.tableNumber));
    });
  };

  const groupedOrders = getActiveOrdersByTable();

  const renderOrderCard = (order: OrderData) => {
    const column = columns.find((candidate) => candidate.id === order.status);
    if (!column) return null;

    const urgency = getUrgency(order);
    const isExpanded = expandedOrders.has(order.id);
    const visibleItems = isExpanded ? order.items : order.items.slice(0, 5);
    const hiddenItemsCount = order.items.length - visibleItems.length;
    const createdDate = order.created_at ? new Date(order.created_at) : null;
    const createdTime = createdDate && !Number.isNaN(createdDate.getTime())
      ? createdDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : 'Agora';

    return (
      <article
        key={order.id}
        className={cx(
          'group relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lifted dark:bg-slate-900',
          urgency.level === 'critical'
            ? 'border-red-400 ring-2 ring-red-200 dark:border-red-700 dark:ring-red-950/70'
            : urgency.level === 'warning'
              ? 'border-amber-400 ring-2 ring-amber-100 dark:border-amber-700 dark:ring-amber-950/70'
              : 'border-slate-200 dark:border-slate-800'
        )}
      >
        {urgency.level !== 'normal' && (
          <div
            className={cx(
              'absolute inset-x-0 top-0 h-1 animate-pulse',
              urgency.level === 'critical' ? 'bg-red-500' : 'bg-amber-500'
            )}
          />
        )}

        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 font-display text-xl font-black leading-none text-white dark:bg-white dark:text-slate-950">
                <Utensils className="h-5 w-5" />
                Mesa {order.tableNumber || '?'}
              </span>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={cx('rounded-full px-2.5 py-1 text-xs font-black ring-1 ring-inset', column.badgeClassName)}>
                  {getStatusLabel(order.status)}
                </span>
                <span
                  className={cx(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ring-1 ring-inset',
                    urgency.level === 'critical'
                      ? 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900'
                      : urgency.level === 'warning'
                        ? 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900'
                        : 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                  )}
                >
                  {urgency.level === 'critical' ? (
                    <ShieldAlert className="h-3.5 w-3.5" />
                  ) : urgency.level === 'warning' ? (
                    <Flame className="h-3.5 w-3.5" />
                  ) : (
                    <Clock3 className="h-3.5 w-3.5" />
                  )}
                  {urgency.formatted}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-black uppercase tracking-normal text-slate-400">Entrada</p>
              <p className="mt-1 font-display text-lg font-black text-slate-950 dark:text-white">{createdTime}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">{formatCurrency(order.total_amount || 0)}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-slate-50/70 p-4 dark:bg-slate-950/20">
          <ul className="space-y-3">
            {visibleItems.map((item, index) => (
              <li key={`${order.id}-${item.menu_item_id}-${index}`} className="rounded-lg bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-950 px-2 text-sm font-black text-white dark:bg-white dark:text-slate-950">
                    {item.quantity}x
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-black leading-tight text-slate-950 dark:text-white">
                      {item.name}
                    </p>
                    {item.notes && (
                      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold leading-relaxed text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                        Obs: {item.notes}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {hiddenItemsCount > 0 && (
            <button
              type="button"
              onClick={() => toggleExpand(order.id)}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {isExpanded ? 'Recolher itens' : `Ver mais ${hiddenItemsCount} item(ns)`}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1">
            {order.status === 'pending' && (
              <button
                type="button"
                onClick={() => cancelOrder(order.id)}
                aria-label="Cancelar pedido"
                title="Cancelar pedido"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-300"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => printOrder(order)}
              aria-label="Imprimir comanda"
              title="Imprimir comanda"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
            >
              <Printer className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {column.prevStatus && (
              <button
                type="button"
                onClick={() => updateOrderStatus(order.id, column.prevStatus!)}
                aria-label="Voltar etapa"
                title="Voltar etapa"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <MoveLeft className="h-5 w-5" />
              </button>
            )}

            {column.nextStatus && column.actionLabel ? (
              <button
                type="button"
                onClick={() => updateOrderStatus(order.id, column.nextStatus!)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-black text-white shadow-lifted transition-all hover:bg-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              >
                {column.actionLabel}
                <MoveRight className="h-4 w-4" />
              </button>
            ) : (
              <span className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 text-sm font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4" />
                Entregue
              </span>
            )}
          </div>
        </div>
      </article>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
          <p className="mt-4 font-display text-lg font-black text-slate-950 dark:text-white">
            Carregando cozinha
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Buscando pedidos em andamento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-96px)] max-w-[1700px] flex-col px-4 py-6 md:px-6 lg:px-8">
      <header className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-normal text-primary-600 dark:text-primary-300">
              KDS / Cozinha
            </p>
            <h1 className="mt-1 flex items-center gap-3 font-display text-3xl font-black tracking-normal text-slate-950 dark:text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-600 text-white shadow-lifted">
                <Utensils className="h-5 w-5" />
              </span>
              Gestao de Cozinha
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Acompanhe pedidos por etapa, priorize atrasos e avance o fluxo de producao em tempo real.
            </p>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:w-[520px]">
              <div className="rounded-lg bg-amber-50 p-3 ring-1 ring-amber-100 dark:bg-amber-950/20 dark:ring-amber-900/50">
                <p className="text-[11px] font-black uppercase tracking-normal text-amber-700 dark:text-amber-300">Novos</p>
                <p className="mt-1 font-display text-2xl font-black text-amber-900 dark:text-amber-100">{pendingCount}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 ring-1 ring-blue-100 dark:bg-blue-950/20 dark:ring-blue-900/50">
                <p className="text-[11px] font-black uppercase tracking-normal text-blue-700 dark:text-blue-300">Preparo</p>
                <p className="mt-1 font-display text-2xl font-black text-blue-900 dark:text-blue-100">{preparingCount}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 ring-1 ring-green-100 dark:bg-green-950/20 dark:ring-green-900/50">
                <p className="text-[11px] font-black uppercase tracking-normal text-green-700 dark:text-green-300">Prontos</p>
                <p className="mt-1 font-display text-2xl font-black text-green-900 dark:text-green-100">{readyCount}</p>
              </div>
              <div className="hidden rounded-lg bg-red-50 p-3 ring-1 ring-red-100 dark:bg-red-950/20 dark:ring-red-900/50 sm:block">
                <p className="text-[11px] font-black uppercase tracking-normal text-red-700 dark:text-red-300">Atrasos</p>
                <p className="mt-1 font-display text-2xl font-black text-red-900 dark:text-red-100">{delayedCount}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
                {[
                  { id: 'kanban' as const, label: 'Fluxo', icon: LayoutDashboard },
                  { id: 'by-table' as const, label: 'Por mesa', icon: AlignJustify },
                  { id: 'summary' as const, label: 'Resumo', icon: ClipboardList },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setViewMode(id)}
                    className={cx(
                      'inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition-colors sm:flex-none',
                      viewMode === id
                        ? 'bg-white text-primary-700 shadow-soft dark:bg-slate-800 dark:text-primary-200'
                        : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1 sm:w-72">
                  <label htmlFor="kds-search" className="sr-only">
                    Buscar pedidos
                  </label>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="kds-search"
                    type="search"
                    placeholder="Buscar mesa ou item"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="app-input h-10 pl-10"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen().catch((fullscreenError) => {
                        console.error(`Error attempting to enable fullscreen: ${fullscreenError.message}`);
                      });
                    } else {
                      document.exitFullscreen();
                    }
                  }}
                  aria-label="Tela cheia"
                  title="Tela cheia"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Maximize className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => loadOrders()}
                  aria-label="Atualizar pedidos"
                  title="Atualizar pedidos"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-soft dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
          <button type="button" onClick={() => loadOrders()} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white">
            Tentar novamente
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {viewMode === 'kanban' && (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid flex-1 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-4"
          >
            {columns.map((column) => {
              const columnOrders = filteredOrders.filter((order) => order.status === column.id);

              return (
                <section
                  key={column.id}
                  className={cx(
                    'flex min-h-[520px] flex-col overflow-hidden rounded-2xl border shadow-soft transition-all duration-700',
                    column.className,
                    column.id === 'pending' && highlightPending
                      ? 'scale-[1.01] ring-4 ring-amber-300 dark:ring-amber-700'
                      : ''
                  )}
                >
                  <div className={cx('flex shrink-0 items-center justify-between gap-3 p-4', column.headerClassName)}>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl font-black">{column.title}</h2>
                        <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-black">
                          {columnOrders.length}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-white/75">{column.subtitle}</p>
                    </div>

                    {column.id === 'preparing' && columnOrders.length > 0 && (
                      <button
                        type="button"
                        onClick={() => advanceAllPreparingToReady(columnOrders)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/20 px-3 text-xs font-black text-white transition-colors hover:bg-white/30"
                        title="Avancar todos para pronto"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Todos prontos
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto p-4">
                    {columnOrders.length === 0 ? (
                      <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300/80 bg-white/50 text-center text-slate-400 dark:border-slate-700 dark:bg-slate-950/20 dark:text-slate-500">
                        <Receipt className="mb-3 h-10 w-10 opacity-40" />
                        <p className="text-sm font-bold">{column.emptyLabel}</p>
                      </div>
                    ) : (
                      columnOrders.map((order) => renderOrderCard(order))
                    )}
                  </div>
                </section>
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
            className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-8 md:grid-cols-2 2xl:grid-cols-3"
          >
            {groupedOrders.length === 0 ? (
              <div className="app-state col-span-full min-h-[360px]">
                <Receipt className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                <p className="font-display text-lg font-black text-slate-950 dark:text-white">
                  Nenhum pedido ativo no momento
                </p>
              </div>
            ) : (
              groupedOrders.map((group) => (
                <section
                  key={group.tableNumber}
                  className="flex max-h-[82vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
                    <h2 className="flex items-center gap-2 font-display text-2xl font-black text-slate-950 dark:text-white">
                      <Utensils className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                      Mesa {group.tableNumber}
                    </h2>
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700 ring-1 ring-primary-200 dark:bg-primary-950/40 dark:text-primary-200 dark:ring-primary-900">
                      {group.orders.length} pedido(s)
                    </span>
                  </div>
                  <div className="flex flex-col gap-4 overflow-y-auto p-4">
                    {group.orders.map((order) => renderOrderCard(order))}
                  </div>
                </section>
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
            className="flex-1 overflow-y-auto pb-8"
          >
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-normal text-primary-600 dark:text-primary-300">
                    Producao agrupada
                  </p>
                  <h2 className="font-display text-2xl font-black text-slate-950 dark:text-white">
                    Resumo por produto
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  Pendentes e em preparo
                </span>
              </div>

              {getSummaryItems().length === 0 ? (
                <div className="app-state min-h-[360px]">
                  <Receipt className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                  <p className="font-display text-lg font-black text-slate-950 dark:text-white">
                    Nenhum item pendente para producao
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {getSummaryItems().map((item) => (
                    <article
                      key={item.name}
                      className={cx(
                        'rounded-2xl border p-5 shadow-soft',
                        item.isVeryDelayed
                          ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/20'
                          : item.isDelayed
                            ? 'border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20'
                            : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-display text-lg font-black leading-tight text-slate-950 dark:text-white">
                          {item.name}
                        </h3>
                        <span className="rounded-lg bg-slate-950 px-3 py-1 font-display text-xl font-black text-white dark:bg-white dark:text-slate-950">
                          {item.quantity}x
                        </span>
                      </div>

                      {item.notes.length > 0 && (
                        <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                          <span className="text-xs font-black uppercase tracking-normal text-slate-400">
                            Observacoes
                          </span>
                          {item.notes.map((note) => (
                            <div
                              key={note}
                              className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-amber-800 dark:border-amber-900 dark:bg-slate-900 dark:text-amber-200"
                            >
                              {note}
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="p-6 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl font-black text-slate-950 dark:text-white">
                Cancelar pedido
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Tem certeza que deseja cancelar este pedido? Esta acao nao pode ser desfeita.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderToCancel(null)}
                  className="app-button-secondary h-12"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={confirmCancelOrder}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                >
                  <XCircle className="h-5 w-5" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="p-6 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-200">
                {confirmModalData.icon === 'check' ? (
                  <CheckCircle2 className="h-8 w-8" />
                ) : (
                  <Archive className="h-8 w-8" />
                )}
              </div>
              <h3 className="font-display text-2xl font-black text-slate-950 dark:text-white">
                {confirmModalData.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {confirmModalData.message}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {confirmModalData.title !== 'Aviso' && (
                  <button
                    type="button"
                    onClick={() => setConfirmModalData((previous) => ({ ...previous, isOpen: false }))}
                    className="app-button-secondary h-12"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={confirmModalData.onConfirm}
                  className={cx('app-button-primary h-12', confirmModalData.title === 'Aviso' ? 'col-span-2' : '')}
                >
                  {confirmModalData.icon === 'check' ? <CheckCircle2 className="h-5 w-5" /> : <Archive className="h-5 w-5" />}
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
