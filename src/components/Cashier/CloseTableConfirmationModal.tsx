import React from 'react';
import { AlertTriangle, CheckCircle2, WalletCards, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface CloseTableConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tableNumber: number | string;
  hasPendingOrders: boolean;
}

export const CloseTableConfirmationModal: React.FC<CloseTableConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tableNumber,
  hasPendingOrders,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Fechar mesa ${tableNumber}`}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
          >
            <div className="absolute right-4 top-4">
              <button
                type="button"
                onClick={onClose}
                aria-label="Cancelar fechamento"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-primary-950/40 dark:text-primary-200 dark:ring-primary-900">
                <WalletCards className="h-8 w-8" />
              </div>

              <h2 className="font-display text-2xl font-black text-slate-950 dark:text-white">
                Fechar Mesa {tableNumber}
              </h2>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                {hasPendingOrders ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900">
                      <AlertTriangle className="h-4 w-4" />
                      Pedidos em aberto
                    </div>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      Esta mesa ainda tem pedidos nao entregues. Ao confirmar, eles serao marcados como pagos.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Confirma o recebimento total e a liberacao da mesa para novos clientes?
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-3">
                <button type="button" onClick={onConfirm} className="app-button-primary h-12 w-full">
                  <CheckCircle2 className="h-5 w-5" />
                  Confirmar e liberar
                </button>
                <button type="button" onClick={onClose} className="app-button-secondary h-11 w-full">
                  Ainda nao
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
