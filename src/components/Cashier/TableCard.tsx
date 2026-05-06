import React from 'react';
import { AlertTriangle, CheckCircle2, Clock3, ReceiptText, WalletCards } from 'lucide-react';
import { motion } from 'motion/react';
import { OrderData } from '../../lib/database';
import { cx } from '../ui/AppPrimitives';

interface TableCardProps {
  table: {
    id: string;
    number: number | string;
    status: string;
  };
  tableOrders: OrderData[];
  onViewDetails: () => void;
  onCloseTable: () => void;
}

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

export const TableCard: React.FC<TableCardProps> = ({
  table,
  tableOrders,
  onViewDetails,
  onCloseTable,
}) => {
  const total = tableOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const hasPendingOrders = tableOrders.some((order) =>
    !['delivered', 'served', 'paid', 'cancelled', 'archived'].includes(order.status)
  );
  const isReadyToPay = tableOrders.length > 0 && !hasPendingOrders;
  const itemCount = tableOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className={cx(
        'flex flex-col overflow-hidden rounded-2xl border bg-white shadow-soft transition-all hover:shadow-lifted dark:bg-slate-900',
        isReadyToPay
          ? 'border-green-200 dark:border-green-900/50'
          : hasPendingOrders
            ? 'border-amber-200 dark:border-amber-900/50'
            : 'border-slate-200 dark:border-slate-800'
      )}
    >
      <div className="p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-950 font-display text-2xl font-black text-white shadow-soft dark:bg-white dark:text-slate-950">
              {table.number}
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-xl font-black leading-tight text-slate-950 dark:text-white">
                Mesa {table.number}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <ReceiptText className="h-3.5 w-3.5" />
                {tableOrders.length} pedido{tableOrders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <span
            className={cx(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ring-1 ring-inset',
              hasPendingOrders
                ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900'
                : isReadyToPay
                  ? 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/30 dark:text-green-300 dark:ring-green-900'
                  : 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
            )}
          >
            {hasPendingOrders ? (
              <>
                <Clock3 className="h-3.5 w-3.5" />
                Em aberto
              </>
            ) : isReadyToPay ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Checkout
              </>
            ) : (
              'Sem consumo'
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-950/50 dark:ring-slate-800">
            <p className="text-[11px] font-black uppercase tracking-normal text-slate-400">Itens</p>
            <p className="mt-1 font-display text-xl font-black text-slate-950 dark:text-white">{itemCount}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-950/50 dark:ring-slate-800">
            <p className="text-[11px] font-black uppercase tracking-normal text-slate-400">Total</p>
            <p className="mt-1 font-display text-xl font-black text-primary-700 dark:text-primary-200">
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        {hasPendingOrders && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Existem pedidos ainda nao entregues.
          </div>
        )}
      </div>

      <div className="mt-auto grid grid-cols-1 gap-2 border-t border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
        <button type="button" onClick={onViewDetails} className="app-button-secondary h-11 w-full">
          <ReceiptText className="h-4 w-4" />
          Ver comanda
        </button>
        <button type="button" onClick={onCloseTable} className="app-button-primary h-12 w-full">
          <WalletCards className="h-5 w-5" />
          Receber e liberar
        </button>
      </div>
    </motion.article>
  );
};
