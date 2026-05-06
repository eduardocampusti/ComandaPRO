import React from 'react';
import { CheckCircle2, ReceiptText } from 'lucide-react';
import { motion } from 'motion/react';
import { OrderData } from '../../lib/database';

interface ClosedOrdersTableProps {
  orders: OrderData[];
  tables: any[];
  totalClosedAmount: number;
}

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

export const ClosedOrdersTable: React.FC<ClosedOrdersTableProps> = ({
  orders,
  tables,
  totalClosedAmount,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-primary-600 dark:text-primary-300">
            Historico
          </p>
          <h2 className="mt-1 font-display text-2xl font-black text-slate-950 dark:text-white">
            Recebimentos finalizados
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pedidos marcados como pagos.</p>
        </div>
        <div className="rounded-lg bg-green-50 px-4 py-3 text-green-700 ring-1 ring-green-200 dark:bg-green-950/30 dark:text-green-300 dark:ring-green-900">
          <p className="text-xs font-black uppercase tracking-normal">Total recebido</p>
          <p className="font-display text-2xl font-black">{formatCurrency(totalClosedAmount)}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="app-state m-5 min-h-[320px]">
          <ReceiptText className="h-12 w-12 text-slate-300 dark:text-slate-700" />
          <div>
            <p className="font-display text-lg font-black text-slate-950 dark:text-white">
              Nenhum recebimento registrado
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              As contas pagas aparecerao aqui automaticamente.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50">
                <th className="px-5 py-4 text-xs font-black uppercase tracking-normal text-slate-400">Pedido</th>
                <th className="px-5 py-4 text-xs font-black uppercase tracking-normal text-slate-400">Mesa</th>
                <th className="px-5 py-4 text-xs font-black uppercase tracking-normal text-slate-400">Consumo</th>
                <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-normal text-slate-400">Total</th>
                <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-normal text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 font-black text-primary-700 ring-1 ring-primary-100 dark:bg-primary-950/40 dark:text-primary-200 dark:ring-primary-900">
                      {tables.find((table) => table.id === order.table_id)?.number || '?'}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex max-w-xs flex-col gap-0.5">
                      {order.items.slice(0, 2).map((item, index) => (
                        <span key={`${order.id}-${item.menu_item_id}-${index}`} className="truncate text-sm text-slate-500 dark:text-slate-400">
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                      {order.items.length > 2 && (
                        <span className="text-xs font-bold text-slate-400">+{order.items.length - 2} itens</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-display text-lg font-black text-slate-950 dark:text-white">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-black text-green-700 ring-1 ring-green-200 dark:bg-green-950/30 dark:text-green-300 dark:ring-green-900">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Pago
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  );
};
