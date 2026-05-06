import React, { useEffect } from 'react';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, ReceiptText, LayoutDashboard, PieChart as PieChartIcon } from 'lucide-react';

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
}

const COLORS = ['#bb001b', '#ffba20', '#2f3131', '#c8c6c6', '#ffb3ad', '#986d00', '#5f5e5e', '#e6182a'];

const CustomTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#eeeeee] bg-white p-3 text-sm text-[#1a1c1c] shadow-lg">
        <p className="mb-1 font-bold">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color || '#bb001b' }} className="font-semibold">
            {formatCurrency ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
  formatCurrency
}) => {
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

  if (loading) {
    return (
      <div className="stitch-reports-scope flex min-h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#ffdad7] border-t-[#bb001b]" />
          <p className="mt-4 font-plus-jakarta-sans text-lg font-black text-[#1a1c1c]">
            Carregando relatórios...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="stitch-reports-scope">
      <style>{`
        .stitch-reports-scope {
          --primary: #bb001b;
          --background: #f9f9f9;
          background-color: var(--background);
          font-family: 'Inter', sans-serif;
          width: 100%;
        }
        .stitch-reports-scope .font-h1, 
        .stitch-reports-scope .font-h3,
        .stitch-reports-scope .font-plus-jakarta-sans {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .stitch-reports-scope .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      <div className="p-4 md:p-8 flex flex-col gap-8 w-full max-w-[1500px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[32px] leading-[1.2] font-extrabold text-[#1a1c1c] tracking-tight font-h1">Visão Geral</h1>
            <p className="text-[16px] leading-[1.5] font-normal text-[#5d3f3d] mt-1">Acompanhe a performance financeira e de vendas do seu restaurante.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 bg-white border border-[#eeeeee] p-1 rounded-lg shadow-sm">
            <button className="px-4 py-2 text-[14px] font-semibold text-[#5d3f3d] hover:bg-[#eeeeee] rounded-md transition-colors">Hoje</button>
            <button className="px-4 py-2 text-[14px] font-semibold bg-[#e6182a] text-white rounded-md shadow-sm transition-colors">7 Dias</button>
            <button className="px-4 py-2 text-[14px] font-semibold text-[#5d3f3d] hover:bg-[#eeeeee] rounded-md transition-colors">Total Histórico</button>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-800 shadow-sm">
            <div className="flex items-center gap-3">
              <ReceiptText className="h-5 w-5 shrink-0" />
              <p className="text-sm font-bold">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Faturamento Hoje */}
          <div className="bg-white p-6 rounded-xl border border-[#eeeeee] shadow-[0px_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="text-[14px] font-semibold text-[#5d3f3d] uppercase tracking-wider text-xs">Faturamento Hoje</span>
              </div>
            </div>
            <div>
              <div className="text-[28px] leading-[1.0] font-bold text-[#1a1c1c] tracking-tight font-plus-jakarta-sans">{formatCurrency(todaysRevenue)}</div>
              <div className="mt-2 text-[#5d3f3d] text-[13px] font-normal">Pedidos pagos de hoje</div>
            </div>
          </div>

          {/* Faturamento Total */}
          <div className="bg-white p-6 rounded-xl border border-[#eeeeee] shadow-[0px_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <span className="text-[14px] font-semibold text-[#5d3f3d] uppercase tracking-wider text-xs">Faturamento Total</span>
              </div>
            </div>
            <div>
              <div className="text-[28px] leading-[1.0] font-bold text-[#1a1c1c] tracking-tight font-plus-jakarta-sans">{formatCurrency(totalRevenue)}</div>
              <div className="mt-2 text-[#5d3f3d] text-[13px] font-normal">Pedidos pagos e arquivados</div>
            </div>
          </div>

          {/* Total Pedidos */}
          <div className="bg-white p-6 rounded-xl border border-[#eeeeee] shadow-[0px_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                  <span className="material-symbols-outlined">shopping_bag</span>
                </div>
                <span className="text-[14px] font-semibold text-[#5d3f3d] uppercase tracking-wider text-xs">Total de Pedidos</span>
              </div>
            </div>
            <div>
              <div className="text-[28px] leading-[1.0] font-bold text-[#1a1c1c] tracking-tight font-plus-jakarta-sans">{totalOrdersCount}</div>
              <div className="mt-2 text-[#5d3f3d] text-[13px] font-normal">Pedidos não cancelados</div>
            </div>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white p-6 rounded-xl border border-[#eeeeee] shadow-[0px_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <span className="material-symbols-outlined">local_activity</span>
                </div>
                <span className="text-[14px] font-semibold text-[#5d3f3d] uppercase tracking-wider text-xs">Ticket Médio</span>
              </div>
            </div>
            <div>
              <div className="text-[28px] leading-[1.0] font-bold text-[#1a1c1c] tracking-tight font-plus-jakarta-sans">{formatCurrency(avgTicket)}</div>
              <div className="mt-2 text-[#5d3f3d] text-[13px] font-normal">Média dos pedidos válidos</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evolução de Faturamento */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#eeeeee] shadow-[0px_4px_20px_rgba(0,0,0,0.02)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#bb001b]">Últimos 7 dias</p>
                <h3 className="text-[20px] leading-[1.3] font-bold text-[#1a1c1c] font-h3 mt-1">Evolução de Faturamento</h3>
              </div>
            </div>
            {hasRevenueData ? (
              <div className="flex-1 w-full relative min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueByDay} margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#eeeeee" vertical={false} />
                    <XAxis dataKey="date" stroke="#5d3f3d" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#5d3f3d" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
                    <RechartsTooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#bb001b"
                      strokeWidth={4}
                      dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: '#bb001b' }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#bb001b' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <BarChart3 className="h-10 w-10 text-[#e2e2e2] mb-3" />
                <h3 className="font-plus-jakarta-sans text-lg font-bold text-[#1a1c1c]">Sem faturamento no período</h3>
                <p className="text-sm text-[#5d3f3d] mt-1">Os valores aparecerão quando houver pedidos pagos.</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#eeeeee] shadow-[0px_4px_20px_rgba(0,0,0,0.02)] flex flex-col">
            <p className="text-xs font-bold uppercase tracking-wider text-[#bb001b]">Ranking</p>
            <h3 className="text-[20px] leading-[1.3] font-bold text-[#1a1c1c] font-h3 mt-1 mb-6">Top Produtos (Qtd)</h3>
            
            {topItems.length > 0 ? (
              <div className="space-y-4">
                {topItems.map((item, index) => (
                  <div key={item.name} className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-[#1a1c1c] truncate pr-2">{index + 1}. {item.name}</span>
                      <span className="font-bold text-[#bb001b] shrink-0">{item.quantity}</span>
                    </div>
                    <div className="h-2 w-full bg-[#f3f3f3] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#e6182a] rounded-full" 
                        style={{ width: `${topItemMaxQuantity > 0 ? (item.quantity / topItemMaxQuantity) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsStitch;

