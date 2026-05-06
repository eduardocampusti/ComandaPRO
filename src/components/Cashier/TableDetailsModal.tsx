import React, { useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  Percent,
  Printer,
  QrCode,
  ReceiptText,
  WalletCards,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { OrderData } from '../../lib/database';
import { cx } from '../ui/AppPrimitives';

interface TableDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number | string;
  orders: OrderData[];
  onCloseTable: () => void;
}

type PaymentMethod = 'pix' | 'card' | 'cash' | 'split';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

const paymentMethods: Array<{ id: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'pix', label: 'Pix', icon: QrCode },
  { id: 'card', label: 'Cartao', icon: CreditCard },
  { id: 'cash', label: 'Dinheiro', icon: Banknote },
  { id: 'split', label: 'Dividido', icon: WalletCards },
];

export const TableDetailsModal: React.FC<TableDetailsModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  orders,
  onCloseTable,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  const subtotal = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const discount = 0;
  const serviceFee = 0;
  const total = subtotal - discount + serviceFee;
  const totalItems = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  const printReceipt = () => {
    const printWindow = window.open('', '_blank', 'width=420,height=640');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Recibo - Mesa ${tableNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; max-width: 340px; margin: 0 auto; color: #111; }
            h1, h2 { text-align: center; margin: 4px 0; }
            hr { border: 0; border-top: 1px dashed #999; margin: 14px 0; }
            .order { margin-bottom: 12px; }
            .item { display: flex; justify-content: space-between; gap: 8px; margin: 4px 0; font-size: 13px; }
            .notes { font-size: 11px; color: #555; margin-left: 16px; }
            .row { display: flex; justify-content: space-between; margin: 6px 0; }
            .total { font-size: 18px; font-weight: 800; }
          </style>
        </head>
        <body>
          <h1>COMANDA PRO</h1>
          <h2>Mesa ${tableNumber}</h2>
          <p style="text-align:center;">${new Date().toLocaleString('pt-BR')}</p>
          <hr/>
          ${orders.map((order, index) => `
            <div class="order">
              <strong>Pedido #${index + 1}</strong>
              ${order.items.map((item) => `
                <div class="item">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
                ${item.notes ? `<div class="notes">Obs: ${item.notes}</div>` : ''}
              `).join('')}
            </div>
          `).join('')}
          <hr/>
          <div class="row"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
          <div class="row"><span>Desconto</span><strong>${formatCurrency(discount)}</strong></div>
          <div class="row"><span>Taxa de servico</span><strong>${formatCurrency(serviceFee)}</strong></div>
          <hr/>
          <div class="row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 18 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 18 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Comanda da mesa ${tableNumber}`}
            className="relative grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 lg:grid-cols-[1fr_380px]"
          >
            <div className="flex min-h-0 flex-col">
              <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white shadow-lifted">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-2xl font-black leading-tight text-slate-950 dark:text-white">
                      Mesa {tableNumber}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {orders.length} pedido(s) - {totalItems} item(ns)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar comanda"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-5">
                {orders.length === 0 ? (
                  <div className="app-state min-h-[360px]">
                    <ReceiptText className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                    <p>Nenhum pedido realizado.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, index) => (
                      <article
                        key={order.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/30"
                      >
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-black uppercase tracking-normal text-white dark:bg-white dark:text-slate-950">
                              Pedido #{index + 1}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <Clock3 className="h-3.5 w-3.5" />
                              {order.created_at
                                ? new Date(order.created_at).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Agora'}
                            </span>
                          </div>
                          <span
                            className={cx(
                              'rounded-full px-2.5 py-1 text-xs font-black ring-1 ring-inset',
                              ['delivered', 'served'].includes(order.status)
                                ? 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/30 dark:text-green-300 dark:ring-green-900'
                                : 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900'
                            )}
                          >
                            {['delivered', 'served'].includes(order.status) ? 'Entregue' : 'Em aberto'}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {order.items.map((item, itemIndex) => (
                            <div key={`${order.id}-${item.menu_item_id}-${itemIndex}`} className="flex items-start justify-between gap-4 rounded-lg bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                              <div className="flex min-w-0 gap-3">
                                <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                  {item.quantity}x
                                </span>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                                  {item.notes && (
                                    <p className="mt-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                                      Obs: {item.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <p className="shrink-0 font-bold text-slate-950 dark:text-white">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                          <span className="text-xs font-black uppercase tracking-normal text-slate-400">
                            Subtotal pedido
                          </span>
                          <span className="font-display text-lg font-black text-slate-950 dark:text-white">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950 lg:border-l lg:border-t-0">
              <div className="sticky top-5 space-y-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-normal text-slate-400">Pagamento</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {paymentMethods.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className={cx(
                          'inline-flex h-12 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                          paymentMethod === id
                            ? 'border-primary-600 bg-primary-600 text-white shadow-lifted'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                      <span className="font-bold text-slate-950 dark:text-white">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Desconto</span>
                      <span className="font-bold text-slate-950 dark:text-white">{formatCurrency(discount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Taxa de servico</span>
                      <span className="font-bold text-slate-950 dark:text-white">{formatCurrency(serviceFee)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                      <span className="font-display text-lg font-black text-slate-950 dark:text-white">Total</span>
                      <span className="font-display text-3xl font-black text-primary-700 dark:text-primary-200">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-400 opacity-70 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <Percent className="h-4 w-4" />
                    Aplicar desconto
                  </button>
                  <button type="button" onClick={printReceipt} className="app-button-secondary h-11">
                    <Printer className="h-4 w-4" />
                    Imprimir recibo
                  </button>
                  <button type="button" onClick={onCloseTable} className="app-button-primary h-12">
                    <CheckCircle2 className="h-5 w-5" />
                    Finalizar pagamento
                  </button>
                </div>
              </div>
            </aside>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
