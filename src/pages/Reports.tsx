import { useEffect, useMemo, useState } from 'react';
import { fetchOrders } from '../lib/database';
import ReportsStitch from './stitch/screens/ReportsStitch';

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
  payment_method?: string;
  created_at?: string;
}

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

export default function Reports() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        setErrorMessage(null);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        setErrorMessage('Nao foi possivel carregar os relatorios. Tente novamente em instantes.');
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
        const tableName = o.table_id ? `Mesa ${o.table_id}` : 'Balcao/Delivery';
        if (!tableRevenue[tableName]) tableRevenue[tableName] = 0;
        tableRevenue[tableName] += o.total_amount;
    });

    return Object.entries(tableRevenue)
        .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
  };

  // New Calculations
  const totalPix = paidOrders.filter(o => o.payment_method === 'pix').reduce((s, o) => s + o.total_amount, 0);
  const totalCard = paidOrders.filter(o => o.payment_method === 'card').reduce((s, o) => s + o.total_amount, 0);
  const totalCash = paidOrders.filter(o => o.payment_method === 'cash').reduce((s, o) => s + o.total_amount, 0);
  const countPix = paidOrders.filter(o => o.payment_method === 'pix').length;
  const countCard = paidOrders.filter(o => o.payment_method === 'card').length;
  const countCash = paidOrders.filter(o => o.payment_method === 'cash').length;

  const revenueByPaymentMethod = [
    { method: 'Pix', total: totalPix, count: countPix, icon: 'pix', color: '#10b981' },
    { method: 'Cartão', total: totalCard, count: countCard, icon: 'credit_card', color: '#3b82f6' },
    { method: 'Dinheiro', total: totalCash, count: countCash, icon: 'payments', color: '#f59e0b' },
  ];

  const getHourlyPeak = () => {
    const today = new Date().toDateString();
    const todayOrders = paidOrders.filter(o => o.created_at && new Date(o.created_at).toDateString() === today);
    if (todayOrders.length === 0) return 'N/A';
    
    const hours: Record<number, number> = {};
    todayOrders.forEach(o => {
      const hour = new Date(o.created_at!).getHours();
      hours[hour] = (hours[hour] || 0) + o.total_amount;
    });
    
    let maxHour = -1;
    let maxTotal = 0;
    Object.entries(hours).forEach(([hour, total]) => {
      if (total > maxTotal) {
        maxTotal = total;
        maxHour = parseInt(hour);
      }
    });
    
    return maxHour !== -1 ? `${maxHour}:00 - ${maxHour + 1}:00` : 'N/A';
  };

  const getWeekdayRevenue = () => {
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const result = weekdays.map(day => ({ day, total: 0 }));
    
    paidOrders.forEach(o => {
      if (o.created_at) {
        const dayIndex = new Date(o.created_at).getDay();
        result[dayIndex].total += o.total_amount;
      }
    });
    return result;
  };

  const getHighestOrderValue = () => {
    if (paidOrders.length === 0) return 0;
    return Math.max(...paidOrders.map(o => o.total_amount));
  };

  const getTopSellingProductByRevenue = () => {
    const revenueMap: Record<string, number> = {};
    paidOrders.forEach(o => {
      o.items.forEach(item => {
        if (!revenueMap[item.name]) revenueMap[item.name] = 0;
        revenueMap[item.name] += item.price * item.quantity;
      });
    });
    
    const sorted = Object.entries(revenueMap).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { name: sorted[0][0], total: sorted[0][1] } : { name: 'N/A', total: 0 };
  };

  const revenueByDay = useMemo(() => getRevenueByDay(), [paidOrders]);
  const topItems = useMemo(() => getTopItems(), [validOrders]);
  const topTables = useMemo(() => getTopTables(), [validOrders]);
  const hourlyPeak = useMemo(() => getHourlyPeak(), [paidOrders]);
  const weekdayRevenue = useMemo(() => getWeekdayRevenue(), [paidOrders]);
  const highestOrderValue = useMemo(() => getHighestOrderValue(), [paidOrders]);
  const topProductByRevenue = useMemo(() => getTopSellingProductByRevenue(), [paidOrders]);
  const cancellationRate = orders.length > 0 ? (orders.filter(o => o.status === 'cancelled').length / orders.length * 100) : 0;
  
  const hasRevenueData = revenueByDay.some(day => day.total > 0);
  const topItemMaxQuantity = topItems[0]?.quantity || 0;

  return (
    <ReportsStitch
      loading={loading}
      errorMessage={errorMessage}
      todaysRevenue={todaysRevenue}
      totalRevenue={totalRevenue}
      totalOrdersCount={totalOrdersCount}
      avgTicket={avgTicket}
      revenueByDay={revenueByDay}
      hasRevenueData={hasRevenueData}
      topItems={topItems}
      topItemMaxQuantity={topItemMaxQuantity}
      topTables={topTables}
      formatCurrency={formatCurrency}
      revenueByPaymentMethod={revenueByPaymentMethod}
      hourlyPeak={hourlyPeak}
      cancellationRate={cancellationRate}
      weekdayRevenue={weekdayRevenue}
      highestOrderValue={highestOrderValue}
      topProductByRevenue={topProductByRevenue}
      paidOrders={paidOrders}
    />
  );
}
