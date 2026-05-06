import React from 'react';
import { CheckCircle2, Clock3, ReceiptText, Timer, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { OrderData } from '../../lib/database';
import { StatusBadge } from '../ui/AppPrimitives';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: OrderData[];
}

type BadgeTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'Recebido';
    case 'preparing':
      return 'Em preparo';
    case 'ready':
      return 'Pronto';
    case 'delivered':
    case 'served':
      return 'Entregue';
    case 'paid':
      return 'Pago';
    case 'cancelled':
      return 'Cancelado';
    case 'archived':
      return 'Arquivado';
    default:
      return status;
  }
}

function getStatusTone(status: string): BadgeTone {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'preparing':
      return 'primary';
    case 'ready':
    case 'delivered':
    case 'served':
    case 'paid':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'neutral';
  }
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
}) => {
  const accumulatedTotal = history.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const activeOrders = history.filter((order) => !['paid', 'cancelled', 'archived'].includes(order.status));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%', opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 1 }}
            transition={{ type: 'spring', damping: 28, stiffness: 230 }}
            role="dialog"
            aria-modal="true"
            aria-label="Status dos pedidos"
            className="relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:mx-auto sm:max-w-lg sm:rounded-2xl"
          >
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>

            <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-primary-950/40 dark:text-primary-200 dark:ring-primary-900">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-xl font-black leading-tight text-slate-950 dark:text-white">
                      Status do pedido
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {activeOrders.length} em andamento
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar status dos pedidos"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {history.length === 0 ? (
                <div className="app-state min-h-[280px]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <Clock3 className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-black text-slate-950 dark:text-white">
                      Nenhum pedido ainda
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Seus pedidos aparecerao aqui em tempo real.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((order) => (
                    <article
                      key={order.id}
                      className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-950/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge tone={getStatusTone(order.status)} dot>
                              {getStatusLabel(order.status)}
                            </StatusBadge>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                              <Timer className="h-3.5 w-3.5" />
                              {order.created_at
                                ? new Date(order.created_at).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Agora'}
                            </span>
                          </div>
                          <p className="mt-3 font-display text-lg font-black text-slate-950 dark:text-white">
                            {formatCurrency(order.total_amount || 0)}
                          </p>
                        </div>

                        {['ready', 'delivered', 'served', 'paid'].includes(order.status) && (
                          <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600 dark:text-green-400" />
                        )}
                      </div>

                      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {order.items.map((item, index) => (
                          <div key={`${order.id}-${item.menu_item_id}-${index}`} className="flex gap-3 text-sm">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              {item.quantity}x
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-700 dark:text-slate-200">{item.name}</p>
                              {item.notes && (
                                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 font-bold text-slate-500 dark:text-slate-400">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}

                  <div className="rounded-lg border border-primary-100 bg-primary-50 p-4 dark:border-primary-900 dark:bg-primary-950/30">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-bold text-primary-800 dark:text-primary-200">
                        Total consumido
                      </span>
                      <span className="font-display text-xl font-black text-primary-800 dark:text-primary-100">
                        {formatCurrency(accumulatedTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className="border-t border-slate-100 bg-slate-50 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 dark:border-slate-800 dark:bg-slate-950">
              <button type="button" onClick={onClose} className="app-button-primary h-12 w-full">
                Continuar pedindo
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
