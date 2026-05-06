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

  const revenueByDay = useMemo(() => getRevenueByDay(), [paidOrders]);
  const topItems = useMemo(() => getTopItems(), [validOrders]);
  const topTables = useMemo(() => getTopTables(), [validOrders]);
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
    />
  );
}
