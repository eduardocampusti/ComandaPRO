import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Calendar,
  AlertTriangle,
  QrCode as QrCodeIcon,
  MoreVertical,
  RotateCcw,
  Trash2,
  Timer,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { TableData, OrderData, ReservationData } from '../../lib/database';
import { cx, Card, Button, IconButton } from '../ui/AppPrimitives';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'preparing' | 'payment';

export interface TableCardProps {
  table: TableData;
  statusKey: TableStatus;
  visualStatus: 'available' | 'occupied' | 'reserved';
  statusLabel: string;
  openOrders: OrderData[];
  openTotal: number;
  elapsed: string;
  activeReservation?: ReservationData;
  activeMenuId: string | null;
  onToggleMenu: (id: string) => void;
  onOpenQrCode: (table: TableData) => void;
  onOpenReservations: (table: TableData) => void;
  onReleaseTable: (table: TableData) => void;
  onRemoveTable: (table: TableData) => void;
  onUpdateReservationStatus: (id: string, status: ReservationData['status']) => void;
}

export const TABLE_STATUS_STYLES = {
  occupied: {
    label: 'OCUPADA',
    cardBg: 'bg-[#FFF1F2]', // bg-red-50
    cardBorder: 'border-[#FECDD3]', // border-red-200
    headerBg: 'bg-[#FFF1F2]',
    headerBorder: 'border-b-[#FECDD3]',
    numberText: 'text-red-600',
    badge: 'bg-red-600 text-white',
    timerBlock: 'bg-red-100 text-red-600',
    priceLabel: 'text-red-400',
    priceText: 'text-red-700',
    emptyText: '',
    clientBlock: '',
    clientName: '',
    clientTime: '',
    primaryBtn: 'bg-red-600 hover:bg-red-700 text-white',
    secondaryBtn: 'border-red-200 text-red-600 bg-transparent hover:bg-red-50',
    icon: Users,
  },
  reserved: {
    label: 'RESERVADA',
    cardBg: 'bg-[#FFFBEB]', // bg-amber-50
    cardBorder: 'border-[#FDE68A]', // border-amber-200
    headerBg: 'bg-[#FFFBEB]',
    headerBorder: 'border-b-[#FDE68A]',
    numberText: 'text-amber-600',
    badge: 'bg-amber-500 text-white',
    timerBlock: '',
    priceLabel: '',
    priceText: '',
    emptyText: '',
    clientBlock: 'bg-amber-100 border-amber-200',
    clientName: 'text-amber-900',
    clientTime: 'text-amber-700',
    primaryBtn: 'bg-amber-500 hover:bg-amber-600 text-white',
    secondaryBtn: 'border-amber-200 text-amber-600 bg-transparent hover:bg-amber-50',
    icon: Calendar,
  },
  available: {
    label: 'LIVRE',
    cardBg: 'bg-white',
    cardBorder: 'border-emerald-200', // #D1FAE5
    headerBg: 'bg-[#ECFDF5]', // bg-emerald-50
    headerBorder: 'border-b-emerald-200',
    numberText: 'text-emerald-700',
    badge: 'bg-emerald-600 text-white',
    timerBlock: '',
    priceLabel: '',
    priceText: '',
    clientBlock: '',
    clientName: '',
    clientTime: '',
    emptyText: 'text-emerald-600 opacity-70',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    secondaryBtn: 'border-emerald-200 text-emerald-700 bg-transparent hover:bg-emerald-50',
    icon: CheckCircle2,
  },
};

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export function TableCard({
  table,
  statusKey,
  visualStatus,
  statusLabel,
  openTotal,
  elapsed,
  activeReservation,
  activeMenuId,
  onToggleMenu,
  onOpenQrCode,
  onOpenReservations,
  onReleaseTable,
  onRemoveTable,
  onUpdateReservationStatus,
}: TableCardProps) {
  const navigate = useNavigate();
  const styles = TABLE_STATUS_STYLES[visualStatus];
  const isOccupied = visualStatus === 'occupied';
  const isReserved = visualStatus === 'reserved';
  const isAvailable = visualStatus === 'available';

  const isOverTime = isOccupied && 
    table.opened_at && 
    (Date.now() - new Date(table.opened_at).getTime()) > 120 * 60000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cx(
          "group relative flex flex-col h-full shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border",
          styles.cardBg,
          styles.cardBorder
        )}
      >
        {/* Card Header */}
        <div className={cx("p-5 flex justify-between items-start border-b", styles.headerBg, styles.headerBorder)}>
          <div>
            <h2 className={cx("text-4xl font-black tracking-tight mb-1", styles.numberText)}>
              {String(table.number).padStart(2, '0')}
            </h2>
            <div className={cx(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase",
              styles.badge
            )}>
              {statusLabel}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {isOccupied && (
              <div className={cx(
                "flex items-center gap-1.5 px-2 py-1 rounded-md font-medium text-xs shadow-sm",
                styles.timerBlock,
                isOverTime && "animate-pulse"
              )}>
                <Timer className="h-3 w-3" />
                <span>{elapsed}</span>
                {isOverTime && <AlertTriangle className="h-3 w-3 ml-0.5" />}
              </div>
            )}
            
            <div className="relative">
              <IconButton
                icon={MoreVertical}
                variant="ghost"
                size="sm"
                label="Menu de ações"
                onClick={(e) => { e.stopPropagation(); onToggleMenu(table.id); }}
                className={cx("opacity-0 group-hover:opacity-100 transition-opacity", styles.numberText)}
              />
              
              {activeMenuId === table.id && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200"
                >
                  <button
                    onClick={() => { onOpenQrCode(table); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <QrCodeIcon className="h-4 w-4 text-slate-400" /> QR Code
                  </button>
                  <button
                    onClick={() => { onOpenReservations(table); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <Calendar className="h-4 w-4 text-slate-400" /> Reservas
                  </button>
                  {statusKey !== 'available' && (
                    <button
                      onClick={() => { onReleaseTable(table); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" /> Liberar Mesa
                    </button>
                  )}
                  <div className="my-1.5 border-t border-slate-100 dark:border-slate-700" />
                  <button
                    onClick={() => onRemoveTable(table)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Remover
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-5 py-6 flex-1 flex flex-col justify-center">
          {isReserved && activeReservation ? (
            <div className={cx("rounded-xl p-3 border shadow-sm", styles.clientBlock)}>
              <div className="flex items-center gap-2 mb-1.5">
                <Users className={cx("h-4 w-4", styles.clientTime)} />
                <p className={cx("font-black text-sm uppercase tracking-tight truncate", styles.clientName)}>
                  {activeReservation.customer_name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className={cx("h-3.5 w-3.5", styles.clientTime)} />
                <p className={cx("font-bold text-xs", styles.clientTime)}>
                  Reserva para as {activeReservation.time}
                </p>
              </div>
            </div>
          ) : isOccupied ? (
            <div className="flex flex-col gap-1 text-center">
              <p className={cx("text-[10px] font-black uppercase tracking-widest", styles.priceLabel)}>
                CONSUMO PARCIAL
              </p>
              <p className={cx("text-3xl font-black tracking-tight", styles.priceText)}>
                {formatCurrency(openTotal)}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className={cx("text-xs font-bold text-center px-4 leading-relaxed", styles.emptyText)}>
                MESA PRONTA PARA<br />NOVOS CLIENTES
              </p>
            </div>
          )}
        </div>

        {/* Card Actions Footer */}
        <div className="p-4 pt-0 flex flex-col gap-3">
          <Button
            onClick={() => navigate(`/order/${table.id}`)}
            className={cx("w-full font-black rounded-lg h-11 shadow-sm transition-all active:scale-[0.98]", styles.primaryBtn)}
          >
            {isAvailable ? 'ABRIR COMANDA' : isReserved ? 'VER RESERVA' : 'VER PEDIDOS'}
          </Button>
          
          <div className="flex gap-2">
            <button
              onClick={() => onOpenQrCode(table)}
              className={cx(
                "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-bold border transition-all active:scale-[0.98]",
                styles.secondaryBtn
              )}
            >
              <QrCodeIcon className="h-4 w-4" />
              QR CODE
            </button>
            
            <button
              onClick={() => {
                if (isAvailable) {
                  onOpenReservations(table);
                } else if (isReserved && activeReservation) {
                  onUpdateReservationStatus(activeReservation.id, 'cancelled');
                } else {
                  onReleaseTable(table);
                }
              }}
              className={cx(
                "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-bold border transition-all active:scale-[0.98]",
                styles.secondaryBtn
              )}
            >
              {isAvailable ? (
                <>
                  <Calendar className="h-4 w-4" />
                  RESERVAR
                </>
              ) : isReserved ? (
                <>
                  <X className="h-4 w-4" />
                  CANCELAR
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  FECHAR
                </>
              )}
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
