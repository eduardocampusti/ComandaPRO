import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchOrders, OrderData } from '../lib/database';

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = user?.email?.split('@')[0] || 'Admin';
  
  const todayLabel = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    weekday: 'long',
  }).format(new Date());

  useEffect(() => {
    async function loadData() {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Buscamos os pedidos de hoje
        // Como o fetchOrders atual não tem filtro de data complexo no argumento, 
        // mas o Supabase permite, vamos buscar e filtrar em memória para simplicidade inicial
        // ou poderíamos ajustar o database.ts. Para manter o foco no visual:
        const allOrders = await fetchOrders();
        const todayOrders = allOrders.filter(o => {
          if (!o.created_at) return false;
          const orderDate = new Date(o.created_at);
          return orderDate >= today;
        });
        
        setOrders(todayOrders);
      } catch (error) {
        console.error('Erro ao carregar dados da dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Métricas
  const ordersTodayCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const ticketMedio = ordersTodayCount > 0 ? totalRevenue / ordersTodayCount : 0;

  // Gráfico de Vendas por Hora (11h - 18h)
  const hours = ['11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h'];
  const salesByHour = hours.map(h => {
    const hourInt = parseInt(h);
    const total = orders.filter(o => {
      if (!o.created_at) return false;
      const date = new Date(o.created_at);
      return date.getHours() === hourInt;
    }).reduce((sum, o) => sum + (o.total_amount || 0), 0);
    return total;
  });

  const maxSale = Math.max(...salesByHour, 100); // 100 como base mínima para escala

  // Pedidos Recentes (limite 5)
  const recentOrders = [...orders]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop w-full max-w-7xl mx-auto space-y-10">
      {/* Header da Seção */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Visão Geral, <span className="text-primary">{userName}</span>
          </h2>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            Acompanhe o desempenho de hoje, {todayLabel}.
          </p>
        </div>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700">
          {['Hoje', '7 Dias', 'Mês'].map((label) => (
            <button 
              key={label}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                label === 'Hoje' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Pedidos Hoje */}
        <MetricCard 
          title="Pedidos Hoje"
          value={ordersTodayCount}
          trend="+0% vs ontem"
          icon="receipt_long"
          color="primary"
        />
        {/* Card: Faturamento */}
        <MetricCard 
          title="Faturamento"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
          trend="+0% vs ontem"
          icon="payments"
          color="tertiary"
        />
        {/* Card: Ticket Médio */}
        <MetricCard 
          title="Ticket Médio"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ticketMedio)}
          trend="Estável"
          icon="point_of_sale"
          color="secondary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico: Vendas por Hora */}
        <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.08)] p-8 col-span-1 lg:col-span-2 flex flex-col h-[400px] transition-all duration-300 ease-out hover:shadow-[0_22px_55px_rgba(15,23,42,0.12)]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Vendas por Hora</h3>
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
            {hours.map((hour, i) => {
              const value = salesByHour[i];
              const height = `${Math.max((value / maxSale) * 100, 4)}%`;
              const isPeak = value === Math.max(...salesByHour) && value > 0;
              
              return (
                <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full gap-3 group/bar">
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
                    {hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista: Pedidos Recentes */}
        <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.08)] flex flex-col col-span-1 h-[400px] overflow-hidden transition-all duration-300 ease-out hover:shadow-[0_22px_55px_rgba(15,23,42,0.12)]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pedidos Recentes</h3>
            <a className="text-sm font-bold text-primary hover:underline" href="#/orders">Ver todos</a>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar scrollbar-premium">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300">
                <span className="material-symbols-outlined text-5xl mb-3">receipt_long</span>
                <p className="font-bold text-sm">Nenhum pedido hoje</p>
              </div>
            ) : (
              recentOrders.map((order, idx) => {
                const statusInfo = getStatusInfo(order.status);
                const orderTime = order.created_at ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(order.created_at)) : '--:--';
                return (
                  <div key={order.id} className="flex items-center justify-between p-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-black text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {String(recentOrders.length - idx).padStart(2, '0')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">Mesa {order.table_id.slice(0, 2)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-xs font-medium text-slate-400">{orderTime}</span>
                        </div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)} • {order.items.length} itens
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full ${statusInfo.color} text-[10px] font-black uppercase tracking-wider shadow-sm border border-black/5`}>
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

function MetricCard({ title, value, trend, icon, color }: { title: string, value: string | number, trend: string, icon: string, color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary bg-primary/5 border-primary/10',
    tertiary: 'text-amber-600 bg-amber-50/50 border-amber-200/50',
    secondary: 'text-slate-600 bg-slate-100/50 border-slate-200/50'
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl p-8 border border-slate-200/70 dark:border-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(15,23,42,0.12)] transition-all duration-300 ease-out group overflow-hidden relative">
      <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
        <span className="material-symbols-outlined text-9xl">{icon}</span>
      </div>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorMap[color] || colorMap.secondary}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className={`text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-black/5 ${trend.includes('+') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-50'}`}>
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h4>
      </div>
    </div>
  );
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'pending': return { label: 'Pendente', color: 'bg-slate-50 text-slate-600 border-slate-200' };
    case 'preparing': return { label: 'Cozinha', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'ready': return { label: 'Pronto', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'delivered': return { label: 'Entregue', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'paid': return { label: 'Pago', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    default: return { label: status, color: 'bg-slate-50 text-slate-600 border-slate-200' };
  }
}


