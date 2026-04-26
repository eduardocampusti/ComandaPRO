import { useState, useEffect } from 'react';
import { fetchOrders } from '../lib/database';
import { LayoutDashboard, TrendingUp, DollarSign, ShoppingBag, Users, Calendar, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface OrderData {
  id: string;
  table_id: string;
  items: CartItem[];
  status: string;
  total_amount: number;
  created_at?: string;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4', '#14b8a6'];

export default function Reports() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersData = await fetchOrders();
        ordersData.sort((a, b) => {
          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return timeA - timeB;
        });
        setOrders(ordersData);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        setLoading(false);
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const paidOrders = orders.filter(o => ['paid', 'archived'].includes(o.status));

  // Summary Metrics
  const totalRevenue = paidOrders.reduce((acc, curr) => acc + curr.total_amount, 0);
  const todaysRevenue = paidOrders.filter(o => {
    if (!o.created_at) return false;
    const today = new Date();
    const orderDate = new Date(o.created_at);
    return today.toDateString() === orderDate.toDateString();
  }).reduce((acc, curr) => acc + curr.total_amount, 0);
  const totalOrdersCount = validOrders.length;
  const avgTicket = totalOrdersCount > 0 ? validOrders.reduce((acc, curr) => acc + curr.total_amount, 0) / totalOrdersCount : 0;

  // 1. Revenue per day (Last 7 days)
  const getRevenueByDay = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const dayTotal = paidOrders.filter(o => {
          if (!o.created_at) return false;
          const time = new Date(o.created_at).getTime();
          return time >= startOfDay.getTime() && time <= endOfDay.getTime();
      }).reduce((acc, curr) => acc + curr.total_amount, 0);
      
      result.push({
        date: dateStr,
        total: parseFloat(dayTotal.toFixed(2))
      });
    }
    return result;
  };

  // 2. Top Items
  const getTopItems = () => {
    const itemsCount: Record<string, number> = {};
    
    validOrders.forEach(o => {
        o.items.forEach(item => {
            if (!itemsCount[item.name]) itemsCount[item.name] = 0;
            itemsCount[item.name] += item.quantity;
        });
    });
    
    return Object.entries(itemsCount)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
  };

  // 3. Top Tables
  const getTopTables = () => {
    const tableRevenue: Record<string, number> = {};
    
    validOrders.forEach(o => {
        const tableName = o.table_id ? `Mesa ${o.table_id}` : 'Balcão/Delivery';
        if (!tableRevenue[tableName]) tableRevenue[tableName] = 0;
        tableRevenue[tableName] += o.total_amount;
    });
    
    return Object.entries(tableRevenue)
        .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
  };

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white p-3 rounded-lg shadow-xl text-sm border border-slate-700">
          <p className="font-bold mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }}>
              R$ {p.value.toFixed(2).replace('.', ',')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto p-4 sm:p-6 pb-20 overflow-x-hidden flex flex-col min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <BarChart3 className="w-6 h-6 text-indigo-500" />
            Visão Geral de Desempenho
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe as métricas e indicadores chave do seu estabelecimento.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Faturamento Hoje</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">R$ {todaysRevenue.toFixed(2).replace('.', ',')}</h3>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Faturamento Total</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">R$ {totalRevenue.toFixed(2).replace('.', ',')}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Pedidos</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalOrdersCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ticket Médio</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">R$ {avgTicket.toFixed(2).replace('.', ',')}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Faturamento dos Últimos 7 Dias
            </h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getRevenueByDay()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-500" />
              Produtos Mais Vendidos
            </h2>
          </div>
          <div className="space-y-4">
            {getTopItems().length > 0 ? getTopItems().map((item, index) => (
              <div key={index} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                     index === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                     index === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700' :
                     index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' :
                     'bg-slate-100 text-slate-500 dark:bg-slate-800'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-900 dark:text-white font-bold">{item.quantity}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">unidades</span>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 py-8 text-center">Não há dados suficientes.</p>
            )}
          </div>
        </div>

        {/* Top Tables Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-pink-500" />
              Top Mesas por Faturamento
            </h2>
          </div>
          <div className="h-64 w-full">
            {getTopTables().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getTopTables()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getTopTables().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                 <p className="text-slate-500 text-center">Não há dados suficientes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
