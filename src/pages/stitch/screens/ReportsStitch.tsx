import React, { useEffect, useState, useMemo } from 'react';
import { BarChart3, ReceiptText, Download, Filter, Search, Calendar, CreditCard, Wallet, Banknote } from 'lucide-react';

export interface ReportsStitchProps {
  loading: boolean;
  errorMessage: string | null;
  todaysRevenue: number;
  totalRevenue: number;
  totalOrdersCount: number;
  avgTicket: number;
  revenueByDay: { date: string; total: number }[];
  hasRevenueData: boolean;
  topItems: { name: string; quantity: number }[];
  topItemMaxQuantity: number;
  topTables: { name: string; value: number }[];
  formatCurrency: (value: number) => string;
  // Novas métricas do PROMPT 2
  revenueByPaymentMethod?: { method: string; total: number; count: number; icon: string; color: string }[];
  hourlyPeak?: string;
  cancellationRate?: number;
  weekdayRevenue?: { day: string; total: number }[];
  highestOrderValue?: number;
  topProductByRevenue?: { name: string; total: number };
  paidOrders?: any[];
}

const ReportsStitch: React.FC<ReportsStitchProps> = ({
  loading,
  errorMessage,
  todaysRevenue,
  totalRevenue,
  totalOrdersCount,
  avgTicket,
  revenueByDay,
  hasRevenueData,
  topItems,
  topItemMaxQuantity,
  topTables,
  formatCurrency,
  revenueByPaymentMethod = [],
  hourlyPeak = 'N/A',
  cancellationRate = 0,
  weekdayRevenue = [],
  highestOrderValue = 0,
  topProductByRevenue = { name: 'N/A', total: 0 },
  paidOrders = []
}) => {
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  useEffect(() => {
    const link = document.createElement('link');
    link.id = 'stitch-reports-icons';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    if (!document.getElementById(link.id)) document.head.appendChild(link);

    const font1 = document.createElement('link');
    font1.id = 'stitch-reports-fonts';
    font1.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap';
    font1.rel = 'stylesheet';
    if (!document.getElementById(font1.id)) document.head.appendChild(font1);
  }, []);

  const filteredOrders = useMemo(() => {
    return paidOrders.filter(o => {
      const matchPayment = filterPayment === 'all' || o.payment_method === filterPayment;
      
      let matchPeriod = true;
      if (filterPeriod === 'today') {
        const today = new Date().toDateString();
        matchPeriod = o.created_at && new Date(o.created_at).toDateString() === today;
      } else if (filterPeriod === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchPeriod = o.created_at && new Date(o.created_at) >= sevenDaysAgo;
      }
      
      return matchPayment && matchPeriod;
    });
  }, [paidOrders, filterPayment, filterPeriod]);

  const exportToCSV = () => {
    const headers = ['Data/Hora', 'Mesa', 'Itens', 'Forma de Pagamento', 'Valor'];
    const rows = filteredOrders.map(o => [
      o.created_at ? new Date(o.created_at).toLocaleString('pt-BR') : 'N/A',
      o.table_number || o.table_id || 'N/A',
      o.items.map((i: any) => `${i.quantity}x ${i.name}`).join('; '),
      o.payment_method || 'N/A',
      o.total_amount.toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_pedidos_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="stitch-reports-scope flex min-h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#ffdad7] border-t-[#bb001b]" />
          <p className="mt-4 font-plus-jakarta-sans text-lg font-black text-[#1a1c1c]">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  // Custom SVG Bar Chart calculation
  const maxDayRevenue = Math.max(...weekdayRevenue.map(d => d.total), 1);
  const barChartWidth = 100;
  const barChartHeight = 150;

  return (
    <div className="stitch-reports-scope">
      <style>{`
        .stitch-reports-scope {
          --primary: #bb001b;
          --background: #f9f9f9;
          --surface: #ffffff;
          --text: #1a1c1c;
          --text-secondary: #5d3f3d;
          --border: #eeeeee;
          background-color: var(--background);
          font-family: 'Inter', sans-serif;
          width: 100%;
          color: var(--text);
        }
        .stitch-reports-scope .font-h1, .stitch-reports-scope .font-h3, .stitch-reports-scope .font-plus-jakarta-sans {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .stitch-reports-scope .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .progress-bar-bg { background-color: #f3f3f3; height: 8px; border-radius: 4px; overflow: hidden; }
        .progress-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>

      <div className="p-4 md:p-8 flex flex-col gap-8 w-full max-w-[1500px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[32px] leading-[1.2] font-extrabold text-[#1a1c1c] tracking-tight font-h1">Dashboard de Relatórios</h1>
            <p className="text-[16px] leading-[1.5] font-normal text-[#5d3f3d] mt-1">Visão completa da performance do seu Brotar.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 bg-white border border-[#eeeeee] p-1.5 rounded-lg shadow-sm">
                <Calendar className="w-4 h-4 text-[#5d3f3d]" />
                <select 
                  value={filterPeriod} 
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-[#5d3f3d] outline-none border-none pr-4"
                >
                  <option value="today">Hoje</option>
                  <option value="7days">7 Dias</option>
                  <option value="all">Total Histórico</option>
                </select>
             </div>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm flex items-center gap-3">
            <ReceiptText className="h-5 w-5" />
            <p className="text-sm font-bold">{errorMessage}</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Hoje', val: formatCurrency(todaysRevenue), sub: 'Faturamento bruto', icon: 'payments', bg: 'bg-green-50', text: 'text-green-600' },
            { label: 'Total', val: formatCurrency(totalRevenue), sub: 'Histórico acumulado', icon: 'trending_up', bg: 'bg-blue-50', text: 'text-blue-600' },
            { label: 'Pedidos', val: totalOrdersCount, sub: 'Volume de vendas', icon: 'shopping_bag', bg: 'bg-orange-50', text: 'text-orange-600' },
            { label: 'Ticket Médio', val: formatCurrency(avgTicket), sub: 'Média por pedido', icon: 'local_activity', bg: 'bg-purple-50', text: 'text-purple-600' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-[#eeeeee] shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.text}`}>
                  <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
                </div>
                <span className="text-[12px] font-bold text-[#5d3f3d] uppercase tracking-wider">{kpi.label}</span>
              </div>
              <div>
                <div className="text-[24px] font-bold tracking-tight font-plus-jakarta-sans">{kpi.val}</div>
                <div className="text-[12px] text-[#5d3f3d]">{kpi.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Seção 1 — Breakdown por forma de pagamento */}
        <div className="bg-white p-6 rounded-2xl border border-[#eeeeee] shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-[#bb001b]" />
            <h3 className="text-lg font-bold font-plus-jakarta-sans">Breakdown por Pagamento</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {revenueByPaymentMethod.map((item) => {
              const percentage = totalRevenue > 0 ? (item.total / totalRevenue) * 100 : 0;
              return (
                <div key={item.method} className="flex flex-col gap-3 p-4 rounded-xl border border-[#f5f5f5] bg-[#fafafa]">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: item.color, color: '#fff' }}>
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.method}</p>
                        <p className="text-[11px] text-[#5d3f3d] font-semibold">{item.count} pedidos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(item.total)}</p>
                      <p className="text-[11px] font-bold" style={{ color: item.color }}>{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="progress-bar-bg mt-1">
                    <div className="progress-bar-fill" style={{ width: `${percentage}%`, backgroundColor: item.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seção 2 — Faturamento por dia da semana (Custom SVG) */}
          <div className="bg-white p-6 rounded-2xl border border-[#eeeeee] shadow-sm">
            <h3 className="text-lg font-bold font-plus-jakarta-sans mb-6">Faturamento Semanal</h3>
            <div className="w-full flex items-end justify-between h-[180px] gap-2 px-2">
              {weekdayRevenue.map((d, i) => {
                const height = (d.total / maxDayRevenue) * 140;
                const isMax = d.total === maxDayRevenue && d.total > 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="relative w-full flex flex-col items-center">
                      <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1c1c] text-white text-[10px] px-2 py-1 rounded-md z-10 whitespace-nowrap">
                        {formatCurrency(d.total)}
                      </div>
                      <div 
                        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ease-out ${isMax ? 'bg-[#bb001b]' : 'bg-[#ffdad7]'}`}
                        style={{ height: `${height}px` }}
                      ></div>
                    </div>
                    <span className={`text-[12px] font-bold ${isMax ? 'text-[#bb001b]' : 'text-[#5d3f3d]'}`}>{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seção 3 — Indicadores operacionais */}
          <div className="bg-white p-6 rounded-2xl border border-[#eeeeee] shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold font-plus-jakarta-sans mb-2">Indicadores Operacionais</h3>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {[
                { label: 'Cancelamentos', val: `${cancellationRate.toFixed(1)}%`, icon: 'cancel', color: 'text-red-500', bg: 'bg-red-50' },
                { label: 'Hora de Pico', val: hourlyPeak, icon: 'timer', color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Maior Pedido', val: formatCurrency(highestOrderValue), icon: 'star', color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Top Faturamento', val: topProductByRevenue.name, sub: formatCurrency(topProductByRevenue.total), icon: 'local_fire_department', color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map((ind, i) => (
                <div key={i} className={`p-4 rounded-xl ${ind.bg} border border-[#00000005] flex flex-col gap-2`}>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[18px] ${ind.color}`}>{ind.icon}</span>
                    <span className="text-[11px] font-bold uppercase text-[#5d3f3d]">{ind.label}</span>
                  </div>
                  <div>
                    <div className="text-[16px] font-extrabold tracking-tight truncate">{ind.val}</div>
                    {ind.sub && <div className="text-[11px] font-semibold text-[#5d3f3d]">{ind.sub}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seção 4 — Tabela de pedidos exportável */}
        <div className="bg-white rounded-2xl border border-[#eeeeee] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#eeeeee] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold font-plus-jakarta-sans">Listagem de Pedidos</h3>
              <p className="text-sm text-[#5d3f3d] font-medium">Visualize e exporte os detalhes financeiros.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-[#f9f9f9] border border-[#eeeeee] px-3 py-2 rounded-xl text-sm w-full md:w-auto">
                <CreditCard className="w-4 h-4 text-[#5d3f3d]" />
                <select 
                  value={filterPayment} 
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="bg-transparent font-semibold outline-none border-none pr-2 text-[#1a1c1c]"
                >
                  <option value="all">Todos Pagamentos</option>
                  <option value="pix">Pix</option>
                  <option value="card">Cartão</option>
                  <option value="cash">Dinheiro</option>
                </select>
              </div>
              
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-[#bb001b] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#a00018] transition-all"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f9f9f9]">
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#5d3f3d] tracking-wider">Data/Hora</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#5d3f3d] tracking-wider">Mesa</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#5d3f3d] tracking-wider">Itens</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#5d3f3d] tracking-wider">Pagamento</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#5d3f3d] tracking-wider text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee]">
                {filteredOrders.length > 0 ? (
                  filteredOrders.slice(0, 50).map((o) => (
                    <tr key={o.id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="px-6 py-4 text-sm whitespace-nowrap font-medium">
                        {o.created_at ? new Date(o.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--/--'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        <span className="px-2 py-1 bg-[#f3f3f3] rounded-md">{o.table_number || o.table_id || 'Balcão'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-[#5d3f3d] font-semibold truncate max-w-[200px]">
                          {o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {o.payment_method === 'pix' && <Wallet className="w-3.5 h-3.5 text-green-500" />}
                          {o.payment_method === 'card' && <CreditCard className="w-3.5 h-3.5 text-blue-500" />}
                          {o.payment_method === 'cash' && <Banknote className="w-3.5 h-3.5 text-amber-500" />}
                          <span className="text-xs font-bold uppercase">{o.payment_method || '---'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-extrabold text-right text-[#1a1c1c]">
                        {formatCurrency(o.total_amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#5d3f3d] font-semibold">
                      Nenhum pedido encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredOrders.length > 50 && (
            <div className="p-4 bg-[#f9f9f9] text-center border-t border-[#eeeeee]">
              <p className="text-xs font-bold text-[#5d3f3d]">Exibindo os últimos 50 pedidos pagos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsStitch;
