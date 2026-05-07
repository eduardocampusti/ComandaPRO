import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchOrders, OrderData } from '../lib/database';

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [previousOrders, setPreviousOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>(
    (localStorage.getItem('dashboard_period') as any) || 'today'
  );

  const userName = user?.email?.split('@')[0] || 'Admin';
  
  const todayLabel = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    weekday: 'long',
  }).format(new Date());

  useEffect(() => {
    localStorage.setItem('dashboard_period', period);
    
    async function loadData() {
      setLoading(true);
      try {
        const now = new Date();
        const days = period === 'today' ? 1 : period === 'week' ? 7 : 30;
        
        // Data de início para o período atual
        const currentStartDate = new Date();
        if (period === 'today') {
          currentStartDate.setHours(0, 0, 0, 0);
        } else {
          currentStartDate.setDate(now.getDate() - days);
          currentStartDate.setHours(0, 0, 0, 0);
        }

        // Data de início para o período anterior (mesmo intervalo de tempo)
        const previousStartDate = new Date(currentStartDate);
        previousStartDate.setDate(previousStartDate.getDate() - days);

        const allOrders = await fetchOrders({ startDate: previousStartDate.toISOString() });
        
        const current = allOrders.filter(o => {
          if (!o.created_at) return false;
          return new Date(o.created_at) >= currentStartDate;
        });

        const previous = allOrders.filter(o => {
          if (!o.created_at) return false;
          const date = new Date(o.created_at);
          return date >= previousStartDate && date < currentStartDate;
        });
        
        setOrders(current);
        setPreviousOrders(previous);
      } catch (error) {
        console.error('Erro ao carregar dados da dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [period]);

  // Métricas Atuais
  const ordersCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const ticketMedio = ordersCount > 0 ? totalRevenue / ordersCount : 0;

  // Métricas Anteriores para Tendências
  const prevOrdersCount = previousOrders.length;
  const prevTotalRevenue = previousOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const prevTicketMedio = prevOrdersCount > 0 ? prevTotalRevenue / prevOrdersCount : 0;

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const diff = ((current - previous) / previous) * 100;
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };

  const ordersTrend = calculateTrend(ordersCount, prevOrdersCount);
  const revenueTrend = calculateTrend(totalRevenue, prevTotalRevenue);
  const ticketTrend = calculateTrend(ticketMedio, prevTicketMedio);
  
  // Totais por Forma de Pagamento
  const totalPix = orders.filter(o => o.payment_method === 'pix').reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalCard = orders.filter(o => o.payment_method === 'card').reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalCash = orders.filter(o => o.payment_method === 'cash').reduce((s, o) => s + (o.total_amount || 0), 0);

  // Lógica do Gráfico Adaptativo
  const chartLabels = period === 'today' 
    ? ['11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h']
    : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const salesData = chartLabels.map((label, idx) => {
    const total = orders.filter(o => {
      if (!o.created_at) return false;
      const date = new Date(o.created_at);
      
      if (period === 'today') {
        return date.getHours() === parseInt(label);
      } else {
        // Agrupar por dia da semana (0-6)
        // Precisamos mapear label para o índice do dia se quisermos ordem específica, 
        // mas o filter simplificado por date.getDay() === idx funciona se chartLabels seguir a ordem Dom=0
        return date.getDay() === idx;
      }
    }).reduce((sum, o) => sum + (o.total_amount || 0), 0);
    return total;
  });

  const maxSale = Math.max(...salesData, 100);

  // Pedidos Recentes (limite 5)
  const recentOrders = [...orders]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop w-full max-w-7xl mx-auto space-y-6">
      {/* Header da Seção */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Visão Geral, <span className="text-primary">{userName}</span>
          </h2>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            {period === 'today' ? `Acompanhe o desempenho de hoje, ${todayLabel}.` : 
             period === 'week' ? 'Desempenho dos últimos 7 dias.' : 'Desempenho dos últimos 30 dias.'}
          </p>
        </div>
      </div>
      
      {/* Card de Resumo de Período (Premium) */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 p-5 md:p-6 text-white shadow-xl border border-white/10 group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <span className="material-symbols-outlined text-[100px]">analytics</span>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Esquerda: título e faturamento */}
          <div className="space-y-1">
            <h3 className="text-xl font-black tracking-tight">Desempenho Geral</h3>
            <p className="text-slate-300 text-sm font-medium">
              Faturamento total de{' '}
              <span className="text-white font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
              </span>{' '}
              no período.
            </p>
          </div>

          {/* Direita: métricas + seletor de período em coluna */}
          <div className="flex flex-col items-end gap-3">
            
            {/* Seletor de período */}
            <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10">
              {(['today', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    period === p
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {p === 'today' ? 'Hoje' : p === 'week' ? '7 Dias' : 'Mês'}
                </button>
              ))}
            </div>

            {/* Crescimento + Status lado a lado */}
            <div className="flex gap-6 items-center">
              <div className="text-center">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Crescimento</p>
                <div className={`text-xl font-black ${
                  revenueTrend.startsWith('+') ? 'text-emerald-400' :
                  revenueTrend.startsWith('-') ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  {revenueTrend}
                </div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Status</p>
                <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-wider">
                  {parseFloat(revenueTrend) >= 0 ? 'Em Alta' : 'Atenção'}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card: Pedidos */}
        <MetricCard 
          title={period === 'today' ? "Pedidos Hoje" : period === 'week' ? "Pedidos (7d)" : "Pedidos (30d)"}
          value={ordersCount}
          trend={`${ordersTrend} vs anterior`}
          icon="receipt_long"
          color="primary"
        />
        {/* Card: Faturamento */}
        <MetricCard 
          title="Faturamento"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
          trend={`${revenueTrend} vs anterior`}
          icon="payments"
          color="tertiary"
        />
        {/* Card: Ticket Médio */}
        <MetricCard 
          title="Ticket Médio"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ticketMedio)}
          trend={`${ticketTrend.replace('+', '').replace('-', '') === '0.0%' ? 'Estável' : ticketTrend + ' vs ant.'}`}
          icon="point_of_sale"
          color="secondary"
        />
      </div>

      {/* Grid de Detalhamento Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Pix"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPix)}
          trend="PIX"
          icon="qr_code_2"
          color="tertiary"
          variant="secondary"
        />
        <MetricCard 
          title="Total Cartão"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCard)}
          trend="Cartão"
          icon="credit_card"
          color="secondary"
          variant="secondary"
        />
        <MetricCard 
          title="Total Dinheiro"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCash)}
          trend="Espécie"
          icon="payments"
          color="primary"
          variant="secondary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico: Vendas Adaptativo */}
        <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-[0_12px_35px_rgba(15,23,42,0.05)] p-5 col-span-1 lg:col-span-2 flex flex-col h-[320px] transition-all duration-300 ease-out hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {period === 'today' ? 'Vendas por Hora' : 'Vendas por Dia'}
            </h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-primary/20"></span> Normal
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-primary"></span> Pico
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-3 pb-6 border-b border-slate-50 dark:border-slate-800 relative group/chart">
            {chartLabels.map((label, i) => {
              const value = salesData[i];
              const height = `${Math.max((value / maxSale) * 100, 4)}%`;
              const isPeak = value === Math.max(...salesData) && value > 0;
              
              return (
                <div key={`${label}-${i}`} className="flex-1 flex flex-col items-center justify-end h-full gap-3 group/bar">
                  <div 
                    className={`w-full max-w-[48px] rounded-t-lg transition-all duration-500 relative ${
                      isPeak 
                        ? 'bg-gradient-to-t from-primary to-primary-container shadow-lg shadow-primary/20' 
                        : 'bg-slate-100 dark:bg-slate-800 group-hover/bar:bg-slate-200 dark:group-hover/bar:bg-slate-700'
                    }`}
                    style={{ height }}
                  >
                    {value > 0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">
                        R$ {value.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <span className={`text-[11px] font-bold tracking-tight ${isPeak ? 'text-primary' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista: Pedidos Recentes */}
        <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-[0_12px_35px_rgba(15,23,42,0.05)] flex flex-col col-span-1 h-[320px] overflow-hidden transition-all duration-300 ease-out hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pedidos Recentes</h3>
            <a className="text-xs font-bold text-primary hover:underline" href="#/orders">Ver todos</a>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar scrollbar-premium">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300">
                <span className="material-symbols-outlined text-5xl mb-3">receipt_long</span>
                <p className="font-bold text-sm">Nenhum pedido no período</p>
              </div>
            ) : (
              recentOrders.map((order, idx) => {
                const statusInfo = getStatusInfo(order.status);
                const orderTime = order.created_at ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(order.created_at)) : '--:--';
                return (
                  <div key={order.id} className="flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0 group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {String(recentOrders.length - idx).padStart(2, '0')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            Mesa {order.table_number || (order as any).table || order.table_id.slice(-4).toUpperCase()}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[10px] font-medium text-slate-400">{orderTime}</span>
                        </div>
                        <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)} • {order.items.length} itens
                        </div>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full ${statusInfo.color} text-[9px] font-black uppercase tracking-wider shadow-sm border border-black/5`}>
                      {statusInfo.label}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon, color, variant = 'primary' }: { title: string, value: string | number, trend: string, icon: string, color: string, variant?: 'primary' | 'secondary' }) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary bg-primary/5 border-primary/10',
    tertiary: 'text-amber-600 bg-amber-50/50 border-amber-200/50',
    secondary: 'text-slate-600 bg-slate-100/50 border-slate-200/50'
  };

  const isSecondary = variant === 'secondary';

  return (
    <div className={`${
      isSecondary ? 'bg-slate-50 dark:bg-slate-800/50 p-4 shadow-sm' : 'bg-white/95 dark:bg-slate-900/95 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]'
    } rounded-2xl border border-slate-200/70 dark:border-slate-800 hover:-translate-y-0.5 transition-all duration-300 ease-out group overflow-hidden relative`}>
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
        <span className="material-symbols-outlined text-7xl">{icon}</span>
      </div>
      <div className={`flex justify-between items-start ${isSecondary ? 'mb-4' : 'mb-5'}`}>
        <div className={`${isSecondary ? 'w-8 h-8' : 'w-9 h-9'} rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.secondary}`}>
          <span className="material-symbols-outlined !text-xl">{icon}</span>
        </div>
        <div className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm border border-black/5 ${trend.includes('+') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-50'}`}>
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <h4 className={`${isSecondary ? 'text-xl' : 'text-2xl'} font-black text-slate-900 dark:text-white tracking-tight`}>{value}</h4>
      </div>
    </div>
  );
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'pending': return { label: 'Aguardando', color: 'bg-slate-50 text-slate-600 border-slate-200' };
    case 'preparing': return { label: 'Em Preparo', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'ready': return { label: 'Pronto', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'delivered': 
    case 'served': return { label: 'Entregue', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'paid': return { label: 'Pago', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'cancelled': return { label: 'Cancelado', color: 'bg-red-50 text-red-700 border-red-200' };
    case 'closed': return { label: 'Fechado', color: 'bg-slate-50 text-slate-500 border-slate-200' };
    default: return { label: 'Desconhecido', color: 'bg-slate-50 text-slate-600 border-slate-200' };
  }
}


