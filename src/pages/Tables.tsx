import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Plus, Trash2, Copy, Check, Calendar, Clock, X, RotateCcw, QrCode, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, where, updateDoc, serverTimestamp } from 'firebase/firestore';

interface Table {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved';
  capacity: number;
}

interface Reservation {
  id: string;
  tableId: string;
  customerName: string;
  date: string;
  time: string;
  guests: number;
  status: 'scheduled' | 'seated' | 'cancelled';
}

export default function Tables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [selectedTableForReservations, setSelectedTableForReservations] = useState<Table | null>(null);
  const [qrCodeModalTable, setQrCodeModalTable] = useState<Table | null>(null);
  const [reopenModalTable, setReopenModalTable] = useState<Table | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [newReservation, setNewReservation] = useState<Partial<Reservation>>({
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    guests: 2
  });

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  useEffect(() => {
    const q = query(collection(db, 'tables'), orderBy('number'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tablesData: Table[] = [];
      snapshot.forEach((doc) => {
        tablesData.push({ id: doc.id, ...doc.data() } as Table);
      });
      setTables(tablesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tables');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedTableForReservations) return;
    const q = query(
      collection(db, 'reservations'),
      where('tableId', '==', selectedTableForReservations.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resData: Reservation[] = [];
      snapshot.forEach((doc) => {
        resData.push({ id: doc.id, ...doc.data() } as Reservation);
      });
      // Ensure time-based ordering client-side as we only query by tableId
      resData.sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
      setReservations(resData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reservations');
    });
    return () => unsubscribe();
  }, [selectedTableForReservations]);

  const updateTableStatus = async (tableId: string, status: Table['status']) => {
    try {
      if (status === 'occupied') {
        await updateDoc(doc(db, 'tables', tableId), { 
          status,
          active: true,
          openedAt: serverTimestamp()
        });
      } else if (status === 'available') {
        await updateDoc(doc(db, 'tables', tableId), { 
          status,
          active: false,
          currentSessionId: null,
          openedAt: null
        });
      } else {
        await updateDoc(doc(db, 'tables', tableId), { status });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tables/${tableId}`);
    }
  };

  const reopenTable = (table: Table) => {
    setReopenModalTable(table);
  };

  const confirmReopenTable = async () => {
    if (!reopenModalTable) return;
    try {
      await updateDoc(doc(db, 'tables', reopenModalTable.id), { 
        status: 'available',
        currentSessionId: null,
        active: false,
        openedAt: null
      });
      setReopenModalTable(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tables/${reopenModalTable.id}`);
    }
  };

  const addTable = async () => {
    const nextNumber = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1;
    try {
      await addDoc(collection(db, 'tables'), {
        number: nextNumber,
        status: 'available',
        capacity: 4
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tables');
    }
  };

  const removeTable = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tables', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tables/${id}`);
    }
  };

  const openReservations = (table: Table) => {
    setSelectedTableForReservations(table);
    setNewReservation({
      customerName: '',
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      guests: 2
    });
    setReservationError(null);
    setIsReservationModalOpen(true);
  };

  const closeReservations = () => {
    setIsReservationModalOpen(false);
    setSelectedTableForReservations(null);
    setReservations([]);
    setReservationError(null);
  };

  const addReservation = async (e: any) => {
    e.preventDefault();
    if (!selectedTableForReservations || !newReservation.customerName || !newReservation.date || !newReservation.time) return;
    
    // Check for conflicts
    const newDateTime = new Date(`${newReservation.date}T${newReservation.time}`);
    const MIN_INTERVAL_HOURS = 2;

    const conflictingRes = reservations.find(res => {
      if (res.status === 'cancelled') return false;
      const resDateTime = new Date(`${res.date}T${res.time}`);
      const diffMs = Math.abs(resDateTime.getTime() - newDateTime.getTime());
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours < MIN_INTERVAL_HOURS;
    });

    if (conflictingRes) {
      const resDateTime = new Date(`${conflictingRes.date}T${conflictingRes.time}`);
      const isBefore = resDateTime.getTime() < newDateTime.getTime();
      const diffMs = Math.abs(resDateTime.getTime() - newDateTime.getTime());
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      setReservationError(
        `🚨 Conflito de Horário!
A mesa já possui reserva para "${conflictingRes.customerName}" às ${conflictingRes.time}.
Seu horário (${newReservation.time}) está apenas ${diffMinutes} minutos ${isBefore ? 'depois' : 'antes'} dessa reserva.
Para garantir tempo de serviço e limpeza, o intervalo mínimo exigido é de 120 minutos (2 horas).`
      );
      return;
    }
    
    setReservationError(null);

    try {
      await addDoc(collection(db, 'reservations'), {
        tableId: selectedTableForReservations.id,
        customerName: newReservation.customerName,
        date: newReservation.date,
        time: newReservation.time,
        guests: Number(newReservation.guests) || 2,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      });
      setNewReservation({
        ...newReservation,
        customerName: '',
        time: '19:00'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reservations');
    }
  };

  const updateReservationStatus = async (resId: string, status: Reservation['status']) => {
    try {
      await updateDoc(doc(db, 'reservations', resId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reservations/${resId}`);
    }
  };

  const getOrderUrl = (tableId: string) => {
    if (!tableId || typeof tableId !== 'string' || tableId.trim() === '') {
      console.error('ID da mesa inválido ou ausente');
      return window.location.origin;
    }

    const cleanTableId = encodeURIComponent(tableId.trim());

    // Obter URL base
    const envUrl = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_PUBLIC_URL 
      ? (import.meta as any).env.VITE_PUBLIC_URL 
      : null;
      
    let baseOrigin = window.location.origin;
    let pathPrefix = window.location.pathname;

    // Ajuste para o ambiente AI Studio
    if (baseOrigin.includes('ais-dev-')) {
      baseOrigin = baseOrigin.replace('ais-dev-', 'ais-pre-');
    }

    // Limpar o dirname (remover index.html ou parâmetros estranhos)
    pathPrefix = pathPrefix.replace(/\/?[^\/]*\.html$/, '');

    // Aplicar a env URL se houver
    if (envUrl) {
      if (envUrl.startsWith('http')) {
        try {
          const parsed = new URL(envUrl);
          baseOrigin = parsed.origin;
          pathPrefix = parsed.pathname;
        } catch {
          baseOrigin = envUrl;
          pathPrefix = '';
        }
      } else {
        pathPrefix = envUrl;
      }
    }

    // Remover trailing slashes
    baseOrigin = baseOrigin.replace(/\/+$/, '');
    pathPrefix = pathPrefix === '/' ? '' : pathPrefix.replace(/\/+$/, '');

    // Garantir que a URL funcione em cenários de roteamento # (que nossa flag HashRouter requer)
    const isHashRouter = window.location.hash.startsWith('#') || true;
    
    if (isHashRouter) {
      return `${baseOrigin}${pathPrefix}/#/order/${cleanTableId}`;
    }
    
    return `${baseOrigin}${pathPrefix}/order/${cleanTableId}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gerenciar Mesas</h1>
            <p className="text-slate-500 dark:text-slate-400">Gere QR Codes para autoatendimento</p>
          </div>
        </div>
        <button
          onClick={addTable}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Mesa
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Nenhuma mesa cadastrada.</p>
          <button onClick={addTable} className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
            Adicionar primeira mesa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => (
              <div key={table.id} className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center relative transition-all duration-300 ${
              table.status === 'reserved' 
                ? 'bg-gradient-to-b from-amber-50 to-amber-100/50 dark:from-amber-900/30 dark:to-slate-800 border-amber-500 ring-2 ring-amber-400 dark:ring-amber-500 ring-offset-2 dark:ring-offset-slate-900 shadow-xl shadow-amber-500/20 scale-[1.02] z-10' 
                : table.status === 'occupied'
                ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 shadow-md shadow-blue-500/10'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600'
            }`}>
              {table.status === 'reserved' && (
                <div className="absolute -top-5 -right-5 bg-gradient-to-br from-amber-400 to-amber-600 text-white px-4 py-3 rounded-2xl border-[4px] border-white dark:border-slate-900 shadow-2xl rotate-6 flex flex-col items-center justify-center animate-pulse">
                  <Calendar className="w-8 h-8 mb-1 drop-shadow-md" />
                  <span className="text-[11px] font-black uppercase tracking-widest drop-shadow-md">Agendada</span>
                </div>
              )}
              {table.status === 'occupied' && (
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white p-2.5 rounded-full border-4 border-white dark:border-slate-900 shadow-md">
                  <Clock className="w-5 h-5 relative z-10" />
                </div>
              )}
              <div className="flex justify-between items-center w-full mb-4">
                <h3 className={`text-xl font-bold ${
                  table.status === 'reserved' ? 'text-amber-900 dark:text-amber-100' :
                  table.status === 'occupied' ? 'text-blue-900 dark:text-blue-100' :
                  'text-slate-900 dark:text-slate-100'
                }`}>Mesa {table.number}</h3>
                <select
                  value={table.status || 'available'}
                  onChange={(e) => updateTableStatus(table.id, e.target.value as Table['status'])}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md border-transparent focus:ring-0 cursor-pointer ${
                    table.status === 'reserved' 
                      ? 'bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300'
                      : table.status === 'occupied'
                      ? 'bg-blue-200 text-blue-900 dark:bg-blue-500/20 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                  }`}
                >
                  <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="available">Livre</option>
                  <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="occupied">Ocupada</option>
                  <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" value="reserved">Agendada</option>
                </select>
              </div>
              
              <button
                onClick={() => setQrCodeModalTable(table)}
                className={`w-full mb-4 py-3 flex justify-center items-center gap-2 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
                  table.status === 'reserved' ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-200' :
                  table.status === 'occupied' ? 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:text-blue-200' :
                  'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200'
                }`}
              >
                <QrCode className="w-5 h-5" />
                Mostrar QR Code
              </button>

              {table.status === 'occupied' && (
                <button
                  onClick={() => reopenTable(table)}
                  className="w-full mb-3 bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:text-blue-300 py-2 flex justify-center items-center gap-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Fechar Mesa
                </button>
              )}

              <div className="flex w-full gap-2 mt-auto">
                <button 
                  onClick={() => openReservations(table)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 py-2 flex justify-center items-center gap-1 rounded-lg text-sm font-medium transition-colors"
                  title="Reservas"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden xl:inline">Reservas</span>
                </button>
                <button 
                  onClick={() => handleCopyLink(getOrderUrl(table.id), table.id)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 py-2 flex justify-center items-center gap-1 rounded-lg text-sm font-medium transition-colors"
                  title="Copiar Link"
                >
                  {copiedId === table.id ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden xl:inline">{copiedId === table.id ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button 
                  onClick={() => window.open(getOrderUrl(table.id), '_blank')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 py-2 flex justify-center items-center gap-1 rounded-lg text-sm font-medium transition-colors"
                  title="Testar Link"
                >
                  Testar
                </button>
                <button 
                  onClick={() => removeTable(table.id)}
                  className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors border border-transparent"
                  title="Remover Mesa"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isReservationModalOpen && selectedTableForReservations && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Reservas - Mesa {selectedTableForReservations.number}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Capacidade atual: {selectedTableForReservations.capacity} pessoas</p>
              </div>
              <button 
                onClick={closeReservations}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-8">
              <div className="flex-1 min-w-[280px]">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Nova Reserva</h3>
                <form onSubmit={addReservation} className="space-y-4">
                  {reservationError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 text-red-800 dark:text-red-400 text-sm flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="whitespace-pre-wrap">{reservationError}</div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Cliente</label>
                    <input 
                      type="text" 
                      required
                      value={newReservation.customerName}
                      onChange={e => setNewReservation({...newReservation, customerName: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
                      <input 
                        type="date" 
                        required
                        value={newReservation.date}
                        onChange={e => setNewReservation({...newReservation, date: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Horário</label>
                      <input 
                        type="time" 
                        required
                        value={newReservation.time}
                        onChange={e => setNewReservation({...newReservation, time: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Qtd. de Pessoas</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={newReservation.guests}
                      onChange={e => setNewReservation({...newReservation, guests: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    Confirmar Reserva
                  </button>
                </form>
              </div>
              
              <div className="flex-[1.5] border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-6 md:pt-0 md:pl-8">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Agenda da Mesa</h3>
                {reservations.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma reserva para esta mesa.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservations.map(res => (
                      <div key={res.id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-900 dark:text-white tabular-nums">
                            {new Date(res.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {res.time}
                          </h4>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                            res.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            res.status === 'seated' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {res.status === 'scheduled' ? 'Agendado' : res.status === 'seated' ? 'Ocupado' : 'Cancelado'}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          {res.customerName} <span className="text-slate-500 dark:text-slate-400 font-normal">({res.guests} pessoas)</span>
                        </p>
                        
                        <div className="mt-4 flex gap-2">
                          {res.status === 'scheduled' && (
                            <>
                              <button 
                                onClick={() => updateReservationStatus(res.id, 'seated')}
                                className="flex-1 text-xs py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 rounded-lg font-medium transition-colors"
                              >
                                Marcar Ocupado
                              </button>
                              <button 
                                onClick={() => updateReservationStatus(res.id, 'cancelled')}
                                className="flex-1 text-xs py-1.5 bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg font-medium transition-colors"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                          {res.status === 'cancelled' && (
                            <button 
                                onClick={() => updateReservationStatus(res.id, 'scheduled')}
                                className="flex-1 text-xs py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-lg font-medium transition-colors"
                              >
                                Reativar
                              </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {qrCodeModalTable && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                QR Code - Mesa {qrCodeModalTable.number}
              </h2>
              <button 
                onClick={() => setQrCodeModalTable(null)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                <QRCodeSVG 
                  value={getOrderUrl(qrCodeModalTable.id)} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-2">
                Escaneie o QR Code para acessar o cardápio desta mesa.
              </p>
              <p className="text-xs text-slate-400 break-all text-center px-4">
                {getOrderUrl(qrCodeModalTable.id)}
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto flex gap-3">
              <button
                onClick={() => handleCopyLink(getOrderUrl(qrCodeModalTable.id), qrCodeModalTable.id)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {copiedId === qrCodeModalTable.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copiedId === qrCodeModalTable.id ? 'Copiado!' : 'Copiar Link'}
              </button>
              <button
                onClick={() => window.open(getOrderUrl(qrCodeModalTable.id), '_blank')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
              >
                Testar Link
              </button>
            </div>
          </div>
        </div>
      )}

      {reopenModalTable && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Reabrir Mesa {reopenModalTable.number}
              </h2>
              <button 
                onClick={() => setReopenModalTable(null)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                <RotateCcw className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">
                Tem certeza que deseja reabrir esta mesa?
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                A sessão atual será encerrada e o status voltará para livre.
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto flex gap-3">
              <button
                onClick={() => setReopenModalTable(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 py-3 px-4 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReopenTable}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
