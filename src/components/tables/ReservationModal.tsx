import { FormEvent } from 'react';
import { 
  Users, 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  Trash2,
  Plus
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, IconButton, Card } from '../ui/AppPrimitives';
import { TableData, ReservationData } from '../../lib/database';

interface ReservationModalProps {
  table: TableData | null;
  isOpen: boolean;
  onClose: () => void;
  reservations: ReservationData[];
  newReservation: Partial<ReservationData>;
  setNewReservation: (res: Partial<ReservationData>) => void;
  onAddReservation: (e: FormEvent) => void;
  onUpdateStatus: (id: string, status: ReservationData['status']) => void;
  onDelete: (res: ReservationData) => void;
  error: string | null;
}

export function ReservationModal({
  table,
  isOpen,
  onClose,
  reservations,
  newReservation,
  setNewReservation,
  onAddReservation,
  onUpdateStatus,
  onDelete,
  error
}: ReservationModalProps) {
  if (!table) return null;

  const activeReservations = reservations.filter(res => res.status === 'scheduled');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reservas - Mesa ${String(table.number).padStart(2, '0')}`}
      size="lg"
    >
      <div className="space-y-8 pb-4">
        {/* Form para Nova Reserva */}
        <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Plus size={18} />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">Nova Reserva</h3>
          </div>

          <form onSubmit={onAddReservation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={newReservation.customer_name}
                  onChange={e => setNewReservation({ ...newReservation, customer_name: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Data</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={newReservation.date}
                    onChange={e => setNewReservation({ ...newReservation, date: e.target.value })}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Horário</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="time"
                    required
                    value={newReservation.time}
                    onChange={e => setNewReservation({ ...newReservation, time: e.target.value })}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold p-3 rounded-xl border border-red-100 dark:border-red-500/20">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 shadow-lg shadow-primary-500/20 font-black tracking-tight"
            >
              CONFIRMAR RESERVA
            </Button>
          </form>
        </div>

        {/* Lista de Reservas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[11px]">Agendamentos Ativos</h3>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-black">
              {activeReservations.length}
            </span>
          </div>

          <div className="space-y-3">
            {activeReservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 dark:bg-slate-800/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <CalendarIcon className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm font-bold">Nenhuma reserva agendada</p>
              </div>
            ) : (
              activeReservations.map(res => (
                <Card 
                  key={res.id} 
                  className="p-4 flex items-center justify-between bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 shadow-sm group hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <Users size={20} />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">
                        {res.customer_name}
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <span className="text-[10px] font-bold flex items-center gap-1">
                          <CalendarIcon size={12} />
                          {new Date(res.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-[10px] font-bold flex items-center gap-1">
                          <Clock size={12} />
                          {res.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <IconButton
                      icon={Check}
                      variant="ghost"
                      size="sm"
                      label="Confirmar chegada"
                      onClick={() => onUpdateStatus(res.id, 'seated')}
                      className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                      title="Confirmar chegada"
                    />
                    <IconButton
                      icon={Trash2}
                      variant="ghost"
                      size="sm"
                      label="Excluir reserva"
                      onClick={() => onDelete(res)}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      title="Excluir reserva"
                    />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
