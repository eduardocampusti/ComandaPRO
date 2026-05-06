import React from 'react';
import { CheckCircle2, ReceiptText, Store, WalletCards } from 'lucide-react';
import { motion } from 'motion/react';
import { cx } from '../ui/AppPrimitives';

interface StatsCardsProps {
  totalOpenAmount: number;
  totalClosedAmount: number;
  openTablesCount: number;
  paidOrdersCount: number;
}

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalOpenAmount,
  totalClosedAmount,
  openTablesCount,
  paidOrdersCount,
}) => {
  const stats = [
    {
      title: 'Mesas abertas',
      value: String(openTablesCount),
      subtitle: 'Comandas em andamento',
      icon: Store,
      tone: 'primary',
    },
    {
      title: 'Total em aberto',
      value: formatCurrency(totalOpenAmount),
      subtitle: 'A receber no caixa',
      icon: ReceiptText,
      tone: 'warning',
    },
    {
      title: 'Vendas do dia',
      value: formatCurrency(totalClosedAmount),
      subtitle: 'Recebido e fechado',
      icon: WalletCards,
      tone: 'success',
    },
    {
      title: 'Contas fechadas',
      value: String(paidOrdersCount),
      subtitle: 'Pedidos pagos hoje',
      icon: CheckCircle2,
      tone: 'neutral',
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="app-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-lifted"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-normal text-slate-400">
                {stat.title}
              </p>
              <p className="mt-2 truncate font-display text-2xl font-black text-slate-950 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.subtitle}</p>
            </div>
            <div
              className={cx(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset',
                stat.tone === 'primary' &&
                  'bg-primary-50 text-primary-700 ring-primary-200 dark:bg-primary-950/40 dark:text-primary-200 dark:ring-primary-900',
                stat.tone === 'warning' &&
                  'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900',
                stat.tone === 'success' &&
                  'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/30 dark:text-green-300 dark:ring-green-900',
                stat.tone === 'neutral' &&
                  'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
              )}
            >
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
