import { FormEvent, useEffect, useMemo, useState, useRef } from 'react';
import { 
  Users, 
  CheckCircle2, 
  PlusCircle,
  LayoutGrid,
  Clock,
  Calendar,
  Receipt,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  OrderData,
  ReservationData,
  TableData,
  addReservation as createReservation,
  addTable as createTable,
  deleteTable,
  fetchOrders,
  fetchReservations,
  fetchAllActiveReservations,
  fetchTables,
  updateReservation as updateReservationInDb,
  deleteReservation as deleteReservationInDb,
  updateTable,
  checkExistingReservation,
  cleanupStaleTables,
} from '../lib/database';
import { cx, Card, Button } from '../components/ui/AppPrimitives';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { AnimatePresence } from 'motion/react';
import { TableCard, TableStatus, TABLE_STATUS_STYLES } from '../components/tables/TableCard';
import { QrCodeModal } from '../components/tables/QrCodeModal';
import { ReservationModal } from '../components/tables/ReservationModal';

type TableFilter = 'all' | 'available' | 'occupied' | 'preparing' | 'payment' | 'reserved';
type FeedbackType = 'success' | 'info' | 'error';

interface TableViewModel {
  table: TableData;
  statusKey: TableStatus;
  visualStatus: 'available' | 'occupied' | 'reserved';
  statusLabel: string;
  openOrders: OrderData[];
  openTotal: number;
  elapsed: string;
  activeReservation?: ReservationData;
}

const openOrderStatuses = ['pending', 'preparing', 'ready', 'delivered', 'served'];



function formatElapsed(openedAt?: string) {
  if (!openedAt) return '0 min';

  const opened = new Date(openedAt).getTime();
  if (Number.isNaN(opened)) return '0 min';

  const minutes = Math.max(0, Math.floor((Date.now() - opened) / 60000));
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function getOrderUrl(tableId: string) {
  if (!tableId || typeof tableId !== 'string' || tableId.trim() === '') {
    return window.location.origin + window.location.pathname;
  }
  
  // UUIDs são seguros para URL, mas garantimos que não haja espaços
  const cleanTableId = tableId.trim();
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  // Suporte para deploy em subdiretórios (ex: OneDrive ou GitHub Pages)
  const base = pathname.endsWith('/') ? pathname : pathname + '/';
  
  return `${origin}${base}#/cardapio/${cleanTableId}`;
}

function getTableStatus(table: TableData, openOrders: OrderData[], activeReservation?: ReservationData) {
  const hasPaymentOrder = openOrders.some((order) => ['delivered', 'served'].includes(order.status));
  if (hasPaymentOrder) return 'payment';
  
  const hasKitchenOrder = openOrders.some((order) => ['pending', 'preparing', 'ready'].includes(order.status));
  if (hasKitchenOrder) return 'preparing';
  
  if (table.status === 'occupied' || openOrders.length > 0) return 'occupied';
  
  if (activeReservation || table.status === 'reserved') return 'reserved';
  
  return 'available';
}

export default function Tables() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TableFilter>('all');
  const [feedback, setFeedback] = useState<{ message: string; type: FeedbackType } | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [selectedTableForReservations, setSelectedTableForReservations] = useState<TableData | null>(null);
  const [qrCodeModalTable, setQrCodeModalTable] = useState<TableData | null>(null);
  const [reopenModalTable, setReopenModalTable] = useState<TableData | null>(null);
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [allReservations, setAllReservations] = useState<ReservationData[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newReservation, setNewReservation] = useState<Partial<ReservationData>>({
    customer_name: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    guests: 2,
  });

  // Deletion states
  const [reservationToDelete, setReservationToDelete] = useState<ReservationData | null>(null);
  const [deleteReservationDialogOpen, setDeleteReservationDialogOpen] = useState(false);
  const [isDeletingReservation, setIsDeletingReservation] = useState(false);

  const [tableToDelete, setTableToDelete] = useState<TableData | null>(null);
  const [deleteTableDialogOpen, setDeleteTableDialogOpen] = useState(false);
  const [isDeletingTable, setIsDeletingTable] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const showFeedback = (message: string, type: FeedbackType = 'success') => {
    setFeedback({ message, type });
    window.setTimeout(() => setFeedback(null), 3000);
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedId(id);
        showFeedback('Link copiado');
        window.setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => showFeedback('Erro ao copiar', 'error'));
  };

  const loadTables = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const [tableData, activeReservations] = await Promise.all([
        fetchTables(),
        fetchAllActiveReservations()
      ]);
      setTables(tableData);
      setAllReservations(activeReservations);
      
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const orderData = await fetchOrders({ 
          status: openOrderStatuses,
          startDate: today.toISOString()
        });
        setOrders(orderData);
      } catch (orderError) {
        setOrders([]);
      }
    } catch (loadError) {
      setError('Erro ao carregar mesas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const safeLoad = async (showLoading = false) => {
      if (!isMounted) return;
      await loadTables(showLoading);
    };

    safeLoad(true);

    // Substitui polling por Realtime
    const tablesSubscription = supabase
      .channel('tables-main-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => {
        safeLoad(false);
      })
      .subscribe();

    const ordersSubscription = supabase
      .channel('orders-main-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        safeLoad(false);
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(tablesSubscription);
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  // Limpeza automática de mesas estagnadas
  useEffect(() => {
    // Executa uma vez ao montar o componente
    cleanupStaleTables().catch(err => console.error('Erro na limpeza inicial:', err));

    // Configura o intervalo para cada 60 segundos
    const interval = setInterval(() => {
      cleanupStaleTables().catch(err => console.error('Erro na limpeza periódica:', err));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedTableForReservations) return;
    const loadReservations = async () => {
      const data = await fetchReservations(selectedTableForReservations.id);
      setReservations(data.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)));
    };
    loadReservations();
  }, [selectedTableForReservations]);

  const tableViews = useMemo<TableViewModel[]>(() => {
    return tables.map((table) => {
      const openOrders = orders.filter((order) => order.table_id === table.id && openOrderStatuses.includes(order.status));
      const openTotal = openOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      
      // Encontrar reserva ativa para esta mesa hoje
      const today = new Date().toISOString().split('T')[0];
      const activeReservation = allReservations.find(res => 
        res.table_id === table.id && 
        res.date === today && 
        res.status === 'scheduled'
      );

      const statusKey = getTableStatus(table, openOrders, activeReservation) as TableStatus;
      
      // Mapear sub-status (preparando/pagamento) para o tema principal (occupied)
      const visualStatus = (statusKey === 'preparing' || statusKey === 'payment') ? 'occupied' : statusKey as 'available' | 'occupied' | 'reserved';
      const config = TABLE_STATUS_STYLES[visualStatus];

      return {
        table,
        statusKey,
        visualStatus,
        statusLabel: config.label,
        openOrders,
        openTotal,
        elapsed: formatElapsed(table.opened_at),
        activeReservation
      };
    });
  }, [orders, tables, allReservations]);

  const filteredTables = useMemo(() =>
    statusFilter === 'all'
      ? tableViews
      : tableViews.filter((view) => view.statusKey === statusFilter),
    [statusFilter, tableViews]
  );

  const counts = useMemo(() => {
    return tableViews.reduce((acc, view) => {
      acc.all += 1;
      acc[view.statusKey] += 1;
      return acc;
    }, { all: 0, available: 0, occupied: 0, preparing: 0, payment: 0, reserved: 0 } as Record<TableFilter, number>);
  }, [tableViews]);

  const updateTableStatus = async (tableId: string, status: TableData['status']) => {
    try {
      await updateTable(tableId, {
        status,
        ...(status === 'occupied' ? { active: true, opened_at: new Date().toISOString() } : { active: false })
      });
      showFeedback('Status atualizado');
      setActiveMenuId(null);
      await loadTables(false);
    } catch {
      showFeedback('Erro ao atualizar', 'error');
    }
  };

  const confirmReopenTable = async () => {
    if (!reopenModalTable) return;
    await updateTable(reopenModalTable.id, {
      status: 'available',
      active: false,
      opened_at: null
    });
    setReopenModalTable(null);
    showFeedback('Mesa liberada');
    loadTables(false);
  };

  const handleAddTable = async () => {
    if (isAddingTable) return;
    try {
      setIsAddingTable(true);
      const nextNumber = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1;
      await createTable(nextNumber, 4);
      showFeedback('Mesa adicionada');
      await loadTables(false);
    } catch {
      showFeedback('Erro ao adicionar mesa', 'error');
    } finally {
      setIsAddingTable(false);
    }
  };

  const removeTable = async (table: TableData) => {
    setTableToDelete(table);
    setDeleteTableDialogOpen(true);
    setActiveMenuId(null);
  };

  const confirmDeleteTable = async () => {
    if (!tableToDelete) return;
    try {
      setIsDeletingTable(true);
      await deleteTable(tableToDelete.id);
      showFeedback('Mesa removida');
      setDeleteTableDialogOpen(false);
      await loadTables(false);
    } catch {
      showFeedback('Erro ao remover mesa', 'error');
    } finally {
      setIsDeletingTable(false);
      setTableToDelete(null);
    }
  };

  const openReservations = (table: TableData) => {
    setSelectedTableForReservations(table);
    setIsReservationModalOpen(true);
    setActiveMenuId(null);
  };

  const handleAddReservation = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTableForReservations) return;
    
    try {
      setReservationError(null);
      
      // Validar duplicidade
      const exists = await checkExistingReservation(
        selectedTableForReservations.id,
        newReservation.date!,
        newReservation.time!
      );
      
      if (exists) {
        setReservationError('Já existe uma reserva ativa para esta mesa neste horário.');
        return;
      }

      await createReservation({
        ...newReservation as ReservationData,
        table_id: selectedTableForReservations.id,
        status: 'scheduled'
      });
      
      // Atualizar status da mesa para reserved
      await updateTable(selectedTableForReservations.id, { status: 'reserved' });
      
      showFeedback('Reserva criada');
      setIsReservationModalOpen(false);
      await loadTables(false);
      
      // Reset form
      setNewReservation({
        customer_name: '',
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        guests: 2,
      });
    } catch (err) {
      setReservationError('Erro ao criar reserva');
    }
  };

  const handleDeleteReservation = (res: ReservationData) => {
    setReservationToDelete(res);
    setDeleteReservationDialogOpen(true);
  };

  const confirmDeleteReservation = async () => {
    if (!reservationToDelete) return;
    
    try {
      setIsDeletingReservation(true);
      await deleteReservationInDb(reservationToDelete.id);
      showFeedback('Reserva excluída');
      
      if (selectedTableForReservations) {
        const remaining = await fetchReservations(selectedTableForReservations.id);
        const activeRemaining = remaining.filter(r => r.status === 'scheduled');
        setReservations(remaining);
        
        // Se não houver mais reservas ativas, voltar status da mesa para available (se não ocupada)
        if (activeRemaining.length === 0) {
          const openOrders = orders.filter(o => o.table_id === selectedTableForReservations.id && openOrderStatuses.includes(o.status));
          if (openOrders.length === 0) {
            await updateTable(selectedTableForReservations.id, { status: 'available' });
          }
        }
      }
      
      setDeleteReservationDialogOpen(false);
      await loadTables(false);
    } catch {
      showFeedback('Erro ao excluir reserva', 'error');
    } finally {
      setIsDeletingReservation(false);
      setReservationToDelete(null);
    }
  };

  const updateReservationStatus = async (id: string, status: ReservationData['status']) => {
    try {
      await updateReservationInDb(id, { status });
      if (status === 'seated' && selectedTableForReservations) {
        await updateTableStatus(selectedTableForReservations.id, 'occupied');
      }
      
      if (selectedTableForReservations) {
        const data = await fetchReservations(selectedTableForReservations.id);
        setReservations(data);
        
        // Se cancelou, verificar se precisa voltar status da mesa
        if (status === 'cancelled') {
          const activeRemaining = data.filter(r => r.status === 'scheduled');
          if (activeRemaining.length === 0) {
            const openOrders = orders.filter(o => o.table_id === selectedTableForReservations.id && openOrderStatuses.includes(o.status));
            if (openOrders.length === 0) {
              await updateTable(selectedTableForReservations.id, { status: 'available' });
            }
          }
        }
      }
      
      await loadTables(false);
    } catch {
      showFeedback('Erro ao atualizar reserva', 'error');
    }
  };

  const toggleMenu = (tableId: string) => setActiveMenuId(activeMenuId === tableId ? null : tableId);

  return (
    <div className="flex-1 overflow-y-auto p-container-padding-mobile md:p-container-padding-desktop pb-32 md:pb-container-padding-desktop bg-slate-50/30 dark:bg-slate-950/30">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestão de Mesas</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Acompanhe e gerencie o status das mesas em tempo real.</p>
        </div>
        <Button
          onClick={handleAddTable}
          disabled={isAddingTable}
          icon={PlusCircle}
          size="lg"
          className="shadow-lg shadow-primary-500/20"
        >
          {isAddingTable ? 'Adicionando...' : 'Nova Mesa'}
        </Button>
      </div>

      {/* Metrics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-emerald-50 border border-emerald-200 shadow-sm p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-600 opacity-80">Disponíveis</p>
            <p className="text-2xl font-black text-emerald-700">{counts.available}</p>
          </div>
        </Card>

        <Card className="bg-red-50 border border-red-200 shadow-sm p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-red-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-600 opacity-80">Ocupadas</p>
            <p className="text-2xl font-black text-red-600">{counts.occupied + counts.preparing + counts.payment}</p>
          </div>
        </Card>

        <Card className="bg-amber-50 border border-amber-200 shadow-sm p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-amber-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-600 opacity-80">Reservadas</p>
            <p className="text-2xl font-black text-amber-600">{counts.reserved}</p>
          </div>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Total</p>
            <p className="text-2xl font-black text-slate-900">{counts.all}</p>
          </div>
        </Card>
      </div>

      {/* Tabs / Filters */}
      <div className="mb-8 overflow-hidden">
        <Tabs value={statusFilter} onValueChange={(val) => setStatusFilter(val as TableFilter)}>
          <TabsList className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-soft p-1.5 border-slate-200/60 dark:border-slate-800">
            <TabsTrigger value="all" icon={LayoutGrid}>Todos</TabsTrigger>
            <TabsTrigger value="available" icon={CheckCircle2}>Livre</TabsTrigger>
            <TabsTrigger value="occupied" icon={Users}>Ocupada</TabsTrigger>
            <TabsTrigger value="reserved" icon={Calendar}>Reservada</TabsTrigger>
            <TabsTrigger value="preparing" icon={Clock}>Preparo</TabsTrigger>
            <TabsTrigger value="payment" icon={Receipt}>Pagamento</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTables.map((view) => (
            <TableCard
              key={view.table.id}
              {...view}
              activeMenuId={activeMenuId}
              onToggleMenu={toggleMenu}
              onOpenQrCode={setQrCodeModalTable}
              onOpenReservations={openReservations}
              onReleaseTable={setReopenModalTable}
              onRemoveTable={removeTable}
              onUpdateReservationStatus={updateReservationStatus}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* QrCode Modal */}
      <QrCodeModal
        table={qrCodeModalTable}
        isOpen={!!qrCodeModalTable}
        onClose={() => setQrCodeModalTable(null)}
        onCopyLink={handleCopyLink}
        getOrderUrl={getOrderUrl}
      />

      {/* Reservation Modal */}
      <ReservationModal
        table={selectedTableForReservations}
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        reservations={reservations}
        newReservation={newReservation}
        setNewReservation={setNewReservation}
        onAddReservation={handleAddReservation}
        onUpdateStatus={updateReservationStatus}
        onDelete={handleDeleteReservation}
        error={reservationError}
      />

      {/* Liberar Table Modal (AlertDialog) */}
      <AlertDialog
        isOpen={!!reopenModalTable}
        onClose={() => setReopenModalTable(null)}
        onConfirm={confirmReopenTable}
        title="Liberar Mesa"
        description={`Deseja realmente liberar a Mesa ${reopenModalTable?.number}? A sessão atual será encerrada.`}
        confirmLabel="Liberar Mesa"
        cancelLabel="Cancelar"
      />

      {/* Feedback Toast */}
      {feedback && (
        <div className={cx(
          "fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4",
          feedback.type === 'error' ? "bg-error text-on-error" : "bg-inverse-surface text-inverse-on-surface"
        )}>
          <span className="material-symbols-outlined">{feedback.type === 'error' ? 'error' : 'check_circle'}</span>
          <span className="font-bold">{feedback.message}</span>
        </div>
      )}

      {/* Delete Reservation Alert */}
      <AlertDialog
        isOpen={deleteReservationDialogOpen}
        onClose={() => !isDeletingReservation && setDeleteReservationDialogOpen(false)}
        onConfirm={confirmDeleteReservation}
        isLoading={isDeletingReservation}
        title="Excluir reserva"
        variant="danger"
        confirmLabel="Excluir reserva"
        cancelLabel="Cancelar"
        description={
          reservationToDelete && (
            <div className="space-y-2">
              <p>Tem certeza que deseja excluir esta reserva? Essa ação não poderá ser desfeita.</p>
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-left border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Trash2 size={16} />
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{reservationToDelete.customer_name}</p>
                </div>
                <div className="space-y-1 pl-11">
                  <p className="text-xs font-bold text-slate-500">
                    📅 {new Date(reservationToDelete.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {reservationToDelete.time}
                  </p>
                  <p className="text-xs font-bold text-slate-500">🪑 Mesa {selectedTableForReservations?.number}</p>
                </div>
              </div>
            </div>
          )
        }
      />

      {/* Delete Table Alert */}
      <AlertDialog
        isOpen={deleteTableDialogOpen}
        onClose={() => !isDeletingTable && setDeleteTableDialogOpen(false)}
        onConfirm={confirmDeleteTable}
        isLoading={isDeletingTable}
        title="Remover mesa"
        variant="danger"
        confirmLabel="Remover mesa"
        cancelLabel="Cancelar"
        description={
          tableToDelete && (
            <div className="space-y-2">
              <p>Deseja realmente remover a <strong>Mesa {tableToDelete.number}</strong>? Essa ação é permanente e removerá todos os dados vinculados.</p>
            </div>
          )
        }
      />
    </div>
  );
}
