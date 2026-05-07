import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchOrders, 
  fetchTables, 
  subscribeToOrders, 
  subscribeToTables, 
  unsubscribe, 
  updateOrder, 
  updateTableStatusSafe, 
  logActivity,
  OrderData, 
  TableData 
} from '../lib/database';
import CaixaStitch from './stitch/screens/CaixaStitch';
import { toast } from 'react-hot-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

export default function Caixa() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    try {
      const [fetchedOrders, fetchedTables] = await Promise.all([
        fetchOrders(),
        fetchTables()
      ]);
      setOrders(fetchedOrders);
      setTables(fetchedTables);
    } catch (error) {
      console.error('Erro ao carregar dados do caixa:', error);
      toast.error('Erro ao atualizar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const ordersSubscription = subscribeToOrders(() => loadData());
    const tablesSubscription = subscribeToTables(() => loadData());

    return () => {
      unsubscribe(ordersSubscription as RealtimeChannel);
      unsubscribe(tablesSubscription as RealtimeChannel);
    };
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(o => 
      o.status === 'paid' && 
      new Date(o.created_at || '').getTime() >= today.getTime()
    );

    const totalPix = todayOrders
      .filter(o => o.payment_method === 'pix')
      .reduce((sum, o) => sum + o.total_amount, 0);
    
    const totalCard = todayOrders
      .filter(o => o.payment_method === 'card')
      .reduce((sum, o) => sum + o.total_amount, 0);
    
    const totalCash = todayOrders
      .filter(o => o.payment_method === 'cash')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const totalRevenue = totalPix + totalCard + totalCash;
    
    const openOrdersCount = orders.filter(o => 
      o.status !== 'paid' && o.status !== 'cancelled' && o.status !== 'archived'
    ).length;

    const closedTodayCount = todayOrders.length;

    return {
      totalPix,
      totalCard,
      totalCash,
      totalRevenue,
      openOrdersCount,
      closedTodayCount
    };
  }, [orders]);

  const handleCloseTable = async (method: 'pix' | 'card' | 'cash') => {
    if (!selectedTableId) return;
    
    setIsProcessing(true);
    try {
      const tableOrders = orders.filter(o => 
        o.table_id === selectedTableId && 
        o.status !== 'paid' && 
        o.status !== 'cancelled'
      );

      if (tableOrders.length === 0) {
        toast.error('Não há pedidos ativos para esta mesa');
        return;
      }

      // 1. Atualizar todos os pedidos para 'paid' com o método escolhido
      await Promise.all(tableOrders.map(order => 
        updateOrder(order.id, { 
          status: 'paid', 
          payment_method: method 
        })
      ));

      // 2. Liberar a mesa
      await updateTableStatusSafe(selectedTableId, 'available');

      toast.success('Mesa fechada com sucesso!');
      setSelectedTableId(null);
      loadData();
    } catch (error) {
      console.error('Erro ao fechar mesa:', error);
      toast.error('Erro ao fechar mesa');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseRegister = async () => {
    const confirm = window.confirm(
      `Deseja realmente fechar o caixa do dia?\n\n` +
      `Total Pix: R$ ${stats.totalPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Total Cartão: R$ ${stats.totalCard.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Total Dinheiro: R$ ${stats.totalCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Total Geral: R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    );

    if (!confirm) return;

    setIsProcessing(true);
    try {
      await logActivity('caixa_fechamento_dia', {
        stats,
        timestamp: new Date().toISOString()
      });

      toast.success('Caixa fechado e registrado com sucesso!');
      // Opcional: Redirecionar para relatórios ou limpar dashboard local
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      toast.error('Erro ao registrar fechamento');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <CaixaStitch 
      orders={orders}
      tables={tables}
      stats={stats}
      onCloseRegister={handleCloseRegister}
      onTableSelect={setSelectedTableId}
      onCloseTable={handleCloseTable}
      selectedTableId={selectedTableId}
      isProcessing={isProcessing}
    />
  );
}
