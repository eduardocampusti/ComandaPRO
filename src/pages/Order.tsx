import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Utensils, ShoppingCart, Plus, Minus, Trash2, CheckCircle2, ChevronLeft, AlertCircle, Receipt, X, Clock, ChevronDown, QrCode, Search, Edit2, Save, XCircle, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addMenuItem, addOrder, addSession, deleteMenuItem, fetchMenuItems, fetchOrders, updateMenuItem, updateOrder, updateTable } from '../lib/database';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
}

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

export default function Order() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { tableId } = useParams();
  const [tableNumber, setTableNumber] = useState<number | string>('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showUnavailable, setShowUnavailable] = useState(false);

  const [isSessionClosedModalOpen, setIsSessionClosedModalOpen] = useState(false);
  const [isTableReservedModalOpen, setIsTableReservedModalOpen] = useState(false);
  const [isPaymentSuccessModalOpen, setIsPaymentSuccessModalOpen] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderData[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  const [unavailableItems, setUnavailableItems] = useState<CartItem[]>([]);
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> & { isNew?: boolean } | null>(null);
  const [extraCategories, setExtraCategories] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [toastNotification, setToastNotification] = useState<{ id: number, message: string } | null>(null);

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const activateTable = async () => {
      if (!tableId) {
        setError("ID da mesa não fornecido na URL.");
        setLoading(false);
        return;
      }

      const sessionKey = `table_${tableId}_activated`;

      try {
        const { data: tableData, error: tableError } = await supabase
          .from('tables')
          .select('*')
          .eq('id', tableId)
          .single();

        if (tableError || !tableData) {
          setError(`Mesa não encontrada no sistema (ID: ${tableId}). Verifique o QR Code.`);
          setLoading(false);
          return;
        }

        setTableNumber(tableData.number);

        if (tableData.status === 'reserved') {
          setError(`Mesa não disponível. Esta mesa encontra-se reservada.`);
          setLoading(false);
          return;
        }

        if (sessionStorage.getItem(sessionKey)) {
          return; // Already activated in this browser session
        }

        if (tableData.status === 'available') {
          try {
            const session = await addSession(tableId);
            await updateTable(tableId, {
              status: 'occupied',
              active: true,
              opened_at: new Date().toISOString(),
              current_session_id: session.id
            });
            
            sessionStorage.setItem(sessionKey, 'true');
          } catch (err: any) {
            console.error("Erro ao ativar mesa:", err);
            setError(`Erro de permissão ao ativar a mesa: ${err.message}`);
          }
        } else if (tableData.status === 'occupied') {
          if (!sessionStorage.getItem(sessionKey)) {
            setError("Esta mesa já está em uso (comanda ativa). Por favor, aguarde a liberação ou procure um atendente.");
            setLoading(false);
            return;
          }
        } else {
          // Table is already occupied or reserved. We just proceed.
          sessionStorage.setItem(sessionKey, 'true');
        }
      } catch (err: any) {
        console.error("Erro ao buscar mesa:", err);
        setError(`Erro de permissão ao buscar a mesa: ${err.message}`);
      }
    };

    activateTable();

    let checkInterval: ReturnType<typeof setInterval> | undefined;
    if (tableId) {
      const sessionKey = `table_${tableId}_activated`;
      checkInterval = setInterval(async () => {
        try {
          const { data: currentData } = await supabase
            .from('tables')
            .select('*')
            .eq('id', tableId)
            .single();
          if (currentData) {
            setTableNumber(currentData.number);
            if (currentData.status === 'available' && sessionStorage.getItem(sessionKey)) {
              setIsSessionClosedModalOpen(true);
            } else if (currentData.status === 'reserved' && sessionStorage.getItem(sessionKey)) {
              setIsTableReservedModalOpen(true);
            }
          } else {
            setError(`A mesa (ID: ${tableId}) foi removida do sistema.`);
          }
        } catch (err) {
          console.error("Erro na verificação periódica da mesa:", err);
        }
      }, 3000);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [tableId]);

  useEffect(() => {
    if (error) return; // Don't load menu if there's a fatal error

    const loadMenu = async () => {
      try {
        const items = await fetchMenuItems();
        setMenuItems(items as MenuItem[]);
        setLoading(false);
      } catch (err: any) {
        console.error("Erro ao carregar cardápio:", err);
        setError(`Erro ao carregar cardápio: ${err.message}`);
        setLoading(false);
      }
    };

    loadMenu();
    const interval = setInterval(loadMenu, 3000);

    return () => clearInterval(interval);
  }, [error]);

  useEffect(() => {
    if (!tableId) return;

    const loadOrders = async () => {
      try {
        const allOrders = await fetchOrders();
        const orders = (allOrders as OrderData[]).filter(order => order.table_id === tableId);
      orders.sort((a, b) => {
          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });
      setOrderHistory(orders);
      } catch (err: any) {
        console.error("Erro ao carregar histórico:", err);
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 3000);

    return () => clearInterval(interval);
  }, [tableId]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menu_item_id === item.id);
      let newQuantity = 1;
      let newCart;
      if (existing) {
        newQuantity = existing.quantity + 1;
        newCart = prev.map(i => i.menu_item_id === item.id ? { ...i, quantity: newQuantity } : i);
      } else {
        newCart = [...prev, { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1 }];
      }
      
      setToastNotification({
        id: Date.now(),
        message: `${newQuantity}x ${item.name} adicionado ao carrinho`
      });
      
      return newCart;
    });
  };

  const updateQuantity = (menu_item_id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.menu_item_id === menu_item_id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const updateNotes = (menu_item_id: string, notes: string) => {
    setCart(prev => prev.map(item => {
      if (item.menu_item_id === menu_item_id) {
        return { ...item, notes };
      }
      return item;
    }));
  };

  const removeFromCart = (menu_item_id: string) => {
    setCart(prev => prev.filter(item => item.menu_item_id !== menu_item_id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const unpaidOrders = orderHistory.filter(o => !['paid', 'cancelled', 'archived'].includes(o.status));
  const unpaidOrdersTotal = unpaidOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const totalAPagar = cartTotal + unpaidOrdersTotal;

  const toggleItemAvailability = async (itemId: string, currentAvailable: boolean) => {
    try {
      await updateMenuItem(itemId, { available: !currentAvailable });
    } catch (err: any) {
      console.error("Erro ao atualizar disponibilidade:", err);
      setError(`Erro ao atualizar disponibilidade: ${err.message}`);
    }
  };

  const confirmPayment = async () => {
    if (cart.length === 0 && unpaidOrders.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // 1. Submit cart as 'paid' if there are items
      if (cart.length > 0) {
        await addOrder({
          table_id: tableId || 'unknown',
          items: cart,
          status: 'paid',
          total_amount: cartTotal
        });
      }

      // 2. Mark past unpaid orders as 'paid'
      for (const order of unpaidOrders) {
        await updateOrder(order.id, { status: 'paid' });
      }
      
      // 3. Free the table
      if (tableId) {
        sessionStorage.removeItem(`table_${tableId}_activated`);
        await updateTable(tableId, {
          status: 'available',
          active: false,
          current_session_id: null
        });
      }

      setCart([]);
      setIsPaymentModalOpen(false);
      setIsCartOpen(false);
      setIsPaymentSuccessModalOpen(true);
    } catch (err: any) {
      console.error("Erro ao processar pagamento:", err);
      setError(`Erro ao processar pagamento: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsSubmitting(true);
    try {
      await updateOrder(orderToCancel, { status: 'cancelled' });
      setOrderHistory(prev => prev.map(o => o.id === orderToCancel ? { ...o, status: 'cancelled' } : o));
      setOrderToCancel(null);
    } catch (err: any) {
      console.error("Erro ao cancelar o pedido:", err);
      setError(`Erro ao cancelar o pedido: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;

    // Check for unavailable items before submitting
    const unavailable = cart.filter(cartItem => {
      const menuItem = menuItems.find(item => item.id === cartItem.menu_item_id);
      return !menuItem || menuItem.available === false;
    });

    if (unavailable.length > 0) {
      setUnavailableItems(unavailable);
      setIsUnavailableModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await addOrder({
        table_id: tableId || 'unknown',
        items: cart,
        status: 'pending',
        total_amount: cartTotal
      });
      setCart([]);
      setIsCartOpen(false);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Erro ao enviar pedido:", err);
      setError(`Erro ao enviar pedido: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeUnavailableItems = () => {
    setCart(prev => prev.filter(cartItem => !unavailableItems.some(ui => ui.menu_item_id === cartItem.menu_item_id)));
    setIsUnavailableModalOpen(false);
    setUnavailableItems([]);
  };

  const cancelUnavailableModal = () => {
    setIsUnavailableModalOpen(false);
    setUnavailableItems([]);
  };

  const handleAddNewItem = (categoryName: string) => {
    setEditingItem({
      isNew: true,
      category: categoryName,
      name: '',
      description: '',
      price: 0,
      available: true
    });
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem({ ...item });
  };

  const handleSaveItem = async () => {
    if (!editingItem || !editingItem.name || editingItem.price === undefined) return;
    try {
      const dbData = {
        name: editingItem.name,
        description: editingItem.description || '',
        price: Number(editingItem.price),
        category: editingItem.category || 'Geral',
        available: editingItem.available !== false
      };
      
      if (editingItem.isNew) {
        await addMenuItem(dbData);
      } else if (editingItem.id) {
        await updateMenuItem(editingItem.id, dbData);
      }
      setEditingItem(null);
    } catch (e: any) {
      console.error("Erro ao salvar item:", e);
      alert("Erro ao salvar: " + e.message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    try {
      await deleteMenuItem(id);
    } catch (e: any) {
      console.error("Erro ao deletar:", e);
      alert("Erro ao deletar: " + e.message);
    }
  };

  // Filter items based on user role, availability, and search query efficiently
  const visibleItems = useMemo(() => {
    let items = (user && showUnavailable) ? menuItems : menuItems.filter(item => item.available !== false);
    
    if (debouncedSearchQuery.trim() !== '') {
      const query = debouncedSearchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    return items;
  }, [menuItems, user, debouncedSearchQuery, showUnavailable]);

  // Group items by category
  const groupedItems = visibleItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const allCategories = Array.from(new Set([
    ...Object.keys(groupedItems),
    ...extraCategories
  ]));

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim() && !allCategories.includes(newCategoryName.trim())) {
      setExtraCategories(prev => [...prev, newCategoryName.trim()]);
    }
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-2xl max-w-md w-full border border-red-200 dark:border-red-800">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Ops! Ocorreu um erro</h2>
          <p className="text-red-600 dark:text-red-300 text-sm mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 transition-colors relative">
      {/* Success Toast */}
      {isSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium whitespace-nowrap">Pedido enviado com sucesso!</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-10 object-contain rounded-md" />
            ) : (
              <div className="bg-primary-600 dark:bg-primary-500 p-2 rounded-lg">
                <Utensils className="text-white w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{settings.businessName}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mesa {tableNumber}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span className="hidden sm:inline">Histórico</span>
          </button>
        </div>
      </header>

      {/* Menu List */}
      <main className="max-w-3xl mx-auto p-4">
        {/* Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar no cardápio..."
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl leading-5 bg-transparent placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900 dark:text-white transition-shadow"
            />
          </div>
          {user && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center justify-center sm:justify-start gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={showUnavailable}
                  onChange={(e) => setShowUnavailable(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mostrar indisponíveis
                </span>
              </label>
              
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                  isEditMode 
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-300' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/50'
                }`}
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isEditMode ? 'Sair da Edição' : 'Editar Cardápio'}
                </span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 dark:border-primary-400"></div>
          </div>
        ) : Object.keys(groupedItems).length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 mt-6">
            <Utensils className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {menuItems.length === 0 ? "O cardápio está vazio no momento." : "Nenhum item encontrado."}
            </p>
          </div>
        ) : (
          allCategories.map((category) => {
            const items = groupedItems[category] || [];
            return (
            <div key={category} className="mb-8 relative">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 px-2">{category}</h2>
              <div className="space-y-4">
                {(items as MenuItem[]).map(item => {
                  if (isEditMode && editingItem?.id === item.id) {
                    return (
                      <div key={item.id} className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border-2 border-emerald-500 shadow-sm flex flex-col gap-3">
                        <input
                          type="text"
                          value={editingItem.name}
                          onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                          placeholder="Nome do Item"
                        />
                        <textarea
                          value={editingItem.description}
                          onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                          placeholder="Descrição (opcional)"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editingItem.price}
                            onChange={e => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                            className="w-1/3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                            placeholder="Preço"
                          />
                          <select
                            value={editingItem.category}
                            onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                          >
                            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                           <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 mr-auto cursor-pointer">
                             <input type="checkbox" checked={editingItem.available !== false} onChange={e => setEditingItem({ ...editingItem, available: e.target.checked })} className="rounded text-emerald-500 focus:ring-emerald-500" />
                             Disponível
                           </label>
                           
                           <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                             <Trash2 className="w-5 h-5" />
                           </button>
                           <button onClick={() => setEditingItem(null)} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                             <X className="w-5 h-5" />
                           </button>
                           <button onClick={handleSaveItem} className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors">
                             <Save className="w-5 h-5" />
                           </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                  <div key={item.id} className={`bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center gap-4 ${!item.available ? 'opacity-60 grayscale' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
                        {user && (
                          <button
                            onClick={() => toggleItemAvailability(item.id, item.available)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-opacity-75 ${
                              item.available ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                            title={item.available ? 'Item disponível (clique para ocultar)' : 'Item oculto (clique para disponibilizar)'}
                          >
                            <span className="sr-only">Toggle availability</span>
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                item.available ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        )}
                        
                        {isEditMode && (
                           <button onClick={() => handleEditItem(item)} className="ml-1 p-1 text-slate-400 hover:text-emerald-500 transition-colors">
                             <Edit2 className="w-4 h-4" />
                           </button>
                        )}
                      </div>
                      {item.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>}
                      <p className="font-medium text-emerald-600 dark:text-emerald-400 mt-2">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    {item.available && !isEditMode && (
                      <button 
                        onClick={() => addToCart(item)}
                        className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shrink-0"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )})}
                
                {isEditMode && editingItem?.isNew && editingItem?.category === category && (
                   <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border-2 border-emerald-500 shadow-sm flex flex-col gap-3">
                     <input type="text" value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white" placeholder="Nome do Item" />
                     <textarea value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white" placeholder="Descrição (opcional)" rows={2} />
                     <div className="flex gap-2">
                       <input type="number" value={editingItem.price} onChange={e => setEditingItem({ ...editingItem, price: Number(e.target.value) })} className="w-1/3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white" placeholder="Preço" />
                       <select value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white">
                         {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                       </select>
                     </div>
                     <div className="flex items-center justify-end gap-2 mt-1">
                        <button onClick={() => setEditingItem(null)} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                        <button onClick={handleSaveItem} className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors">
                          <Save className="w-5 h-5" />
                        </button>
                     </div>
                   </div>
                )}
                
                {isEditMode && !(editingItem?.isNew && editingItem?.category === category) && (
                  <button 
                    onClick={() => handleAddNewItem(category)}
                    className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors flex justify-center items-center gap-2 font-medium"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Adicionar Novo Item nesta Categoria
                  </button>
                )}
              </div>
            </div>
          )})
        )}
        
        {isEditMode && (
           <div className="mt-8 relative">
              {isAddingCategory ? (
                <form onSubmit={handleAddCategory} className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border-2 border-emerald-500 shadow-sm flex flex-col gap-3">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                    placeholder="Nome da Categoria"
                  />
                  <div className="flex items-center justify-end gap-2 mt-1">
                     <button type="button" onClick={() => setIsAddingCategory(false)} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                       <X className="w-5 h-5" />
                     </button>
                     <button type="submit" className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors">
                       <Save className="w-5 h-5" />
                     </button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => setIsAddingCategory(true)}
                  className="w-full py-4 border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex justify-center items-center gap-2 font-bold"
                >
                  <PlusCircle className="w-6 h-6" />
                  Adicionar Nova Categoria
                </button>
              )}
           </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {cartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-emerald-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Ver pedido ({cartCount})</span>
              </div>
              <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-30 flex flex-col justify-end sm:justify-center sm:p-6">
          <div className="bg-white dark:bg-slate-800 w-full sm:max-w-md sm:mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Seu Pedido</h2>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">Seu carrinho está vazio.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.menu_item_id} className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white">{item.name}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                          <button 
                            onClick={() => item.quantity > 1 ? updateQuantity(item.menu_item_id, -1) : removeFromCart(item.menu_item_id)}
                            className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-md shadow-sm transition-colors"
                          >
                            {item.quantity > 1 ? <Minus className="w-4 h-4" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                          </button>
                          <span className="w-4 text-center font-medium text-slate-900 dark:text-white">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.menu_item_id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-md shadow-sm transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Alguma observação? (ex: sem cebola)" 
                        value={item.notes || ''}
                        onChange={(e) => updateNotes(item.menu_item_id, e.target.value)}
                        className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Pending Orders inside Cart */}
              {orderHistory.filter(o => o.status === 'pending').length > 0 && (
                 <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                   <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Pedidos Aguardando</h3>
                   <div className="space-y-4">
                     {orderHistory.filter(o => o.status === 'pending').map(order => (
                       <div key={order.id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 relative">
                         <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-medium px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400">
                             Pendente
                           </span>
                           <span className="text-sm font-bold text-slate-900 dark:text-white">
                            R$ {order.total_amount.toFixed(2).replace('.', ',')}
                           </span>
                         </div>
                         <ul className="text-sm text-slate-600 dark:text-slate-400 mb-3 space-y-1">
                           {order.items.map((item, idx) => (
                             <li key={idx}>- {item.quantity}x {item.name}</li>
                           ))}
                         </ul>
                         <button
                           onClick={() => setOrderToCancel(order.id)}
                           className="w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                         >
                           <X className="w-4 h-4" /> Cancelar Pedido
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 sm:rounded-b-3xl shrink-0">
              {unpaidOrdersTotal > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Pedidos anteriores</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">R$ {unpaidOrdersTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{unpaidOrdersTotal > 0 ? 'Total a pagar' : 'Total do pedido'}</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">R$ {totalAPagar.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={submitOrder}
                  disabled={cart.length === 0 || isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-4 px-4 rounded-xl flex items-center justify-center transition-colors"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Confirmar Pedido'
                  )}
                </button>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={(cart.length === 0 && unpaidOrders.length === 0) || isSubmitting}
                  className="flex-1 bg-[#32BCAD] hover:bg-[#2CA89A] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <QrCode className="w-5 h-5" />
                  Pagar Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-30 flex flex-col justify-end sm:justify-center sm:p-6">
          <div className="bg-white dark:bg-slate-800 w-full sm:max-w-md sm:mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pedidos da Mesa</h2>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {orderHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">Nenhum pedido realizado ainda.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orderHistory.map(order => {
                    const statusMap: Record<string, { label: string, color: string, bgColor: string }> = {
                      'pending': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-800', bgColor: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/30' },
                      'preparing': { label: 'Preparando', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800', bgColor: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30' },
                      'ready': { label: 'Pronto', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800', bgColor: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' },
                      'delivered': { label: 'Entregue', color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800', bgColor: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30' },
                      'served': { label: 'Aguard. Pagto', color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800', bgColor: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/30' },
                      'paid': { label: 'Pago', color: 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', bgColor: 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700' },
                      'cancelled': { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800', bgColor: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30' }
                    };
                    const statusObj = statusMap[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-800', bgColor: 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700' };
                    
                    return (
                      <div key={order.id} className={`rounded-xl p-4 border ${statusObj.bgColor}`}>
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusObj.color}`}>
                            {statusObj.label}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {order.created_at ? new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                          </span>
                        </div>
                        
                        <div className="space-y-3 mb-3">
                          {order.items.map((item, idx) => (
                            <details key={idx} className="group flex flex-col text-sm border-b border-slate-100 dark:border-slate-800/50 last:border-0 pb-2 last:pb-0">
                              <summary className="flex justify-between items-center cursor-pointer list-none outline-none marker:content-none select-none">
                                <div className="flex items-center gap-2 truncate pr-4">
                                  <span className="font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-xs rounded-md shrink-0">
                                    {item.quantity}x
                                  </span>
                                  <span className="text-slate-700 dark:text-slate-300 truncate font-semibold">
                                    {item.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="text-slate-900 dark:text-white font-bold whitespace-nowrap">
                                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                  </span>
                                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                                </div>
                              </summary>
                              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/30 rounded-lg p-3 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500">Preço unitário:</span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                                </div>
                                {item.notes && (
                                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span className="block text-slate-500 mb-1">Observações:</span>
                                    <p className="italic text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 p-2 rounded">
                                      {item.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </details>
                          ))}
                        </div>
                        
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center font-medium shadow-sm mb-3">
                          <span className="text-slate-900 dark:text-white">Total</span>
                          <span className="text-emerald-600 dark:text-emerald-400">R$ {order.total_amount.toFixed(2).replace('.', ',')}</span>
                        </div>
                        {order.status === 'pending' && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50">
                            <button
                              onClick={() => setOrderToCancel(order.id)}
                              className="w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                            >
                              <X className="w-4 h-4" /> Cancelar Pedido
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 flex flex-col justify-end sm:justify-center sm:p-6">
          <div className="bg-white dark:bg-slate-800 w-full sm:max-w-md sm:mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pagamento Pix</h2>
              <div className="w-10"></div>
            </div>
            
            <div className="p-6 text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-2xl border-4 border-[#32BCAD] w-48 h-48 flex items-center justify-center relative shadow-lg">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://cdn-icons-png.flaticon.com/512/107/107120.png')] bg-cover"></div>
                  <QrCode className="w-32 h-32 text-slate-800" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md">
                   <div className="w-8 h-8 flex items-center justify-center text-[#32BCAD] font-black text-2xl">
                     P
                   </div>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total a pagar</p>
                <p className="text-3xl font-black text-[#32BCAD]">
                  R$ {totalAPagar.toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  Escaneie o QR Code com o aplicativo do seu banco para pagar.
                </p>
              </div>

              <button 
                onClick={confirmPayment}
                disabled={isSubmitting}
                className="w-full bg-[#32BCAD] hover:bg-[#2CA89A] disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium py-4 rounded-xl flex items-center justify-center transition-colors shadow-md shadow-[#32BCAD]/20"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Simular Pagamento Concluído'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex flex-col justify-end sm:justify-center sm:p-6">
          <div className="bg-white dark:bg-slate-800 w-full sm:max-w-md sm:mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cancelar Pedido?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Esta ação removerá o pedido do histórico e do fluxo da cozinha. Deseja continuar?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOrderToCancel(null)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium py-3 rounded-xl transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={confirmCancelOrder}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Sim, Cancelar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Closed Modal */}
      {isSessionClosedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex flex-col justify-center items-center p-6 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center border-t-4 border-amber-500">
            <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sessão Encerrada</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              A mesa foi liberada pelo restaurante. Sua sessão atual foi finalizada. Para continuar, você precisará ler o QR Code novamente.
            </p>
            <button
              onClick={() => {
                sessionStorage.removeItem(`table_${tableId}_activated`);
                setCart([]);
                setIsSessionClosedModalOpen(false);
                setError("Sua sessão foi encerrada, pois a mesa foi liberada. Para fazer um novo pedido, leia o QR Code novamente.");
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Table Reserved Modal */}
      {isTableReservedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex flex-col justify-center items-center p-6 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center border-t-4 border-amber-500">
            <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mesa Reservada</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Ocorreu uma mudança no status desta mesa, ela está marcada como reservada. Para evitar problemas no fechamento da sua conta, por favor, verifique a disponibilidade ou solicite auxílio de um garçom.
            </p>
            <button
              onClick={() => {
                setIsTableReservedModalOpen(false);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
            >
              Certo, vou verificar
            </button>
          </div>
        </div>
      )}

      {/* Unavailable Items Modal */}
      {isUnavailableModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex flex-col justify-center items-center p-6 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 border-t-4 border-red-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Item Indisponível</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Ops! Os seguintes itens do seu carrinho acabaram de ficar indisponíveis no cardápio:
            </p>
            <ul className="mb-6 space-y-2 max-h-40 overflow-y-auto">
              {unavailableItems.map(item => (
                <li key={item.menu_item_id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{item.name}</span>
                  <span className="text-sm font-semibold text-slate-500">x{item.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 mt-auto flex-col sm:flex-row">
              <button
                onClick={cancelUnavailableModal}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 font-bold py-3 px-4 rounded-xl transition-colors text-center"
              >
                Voltar ao carrinho
              </button>
              <button
                onClick={removeUnavailableItems}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-center"
              >
                Remover itens e continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {isPaymentSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex flex-col justify-center items-center p-6 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center border-t-4 border-emerald-500">
            <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pagamento Concluído!</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Obrigado pela preferência! Sua mesa foi liberada e esperamos ver você em breve.
            </p>
            <button
              onClick={() => {
                setIsPaymentSuccessModalOpen(false);
                setError("Pagamento confirmado. Sessão encerrada.");
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-full flex items-center gap-3 shadow-2xl"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-medium whitespace-nowrap text-sm">{toastNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
