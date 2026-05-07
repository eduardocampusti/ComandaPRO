import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  History,
  Loader2,
  QrCode,
  ReceiptText,
  RefreshCw,
  Utensils,
  Bell,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CartItem,
  MenuItemData,
  OrderData,
  PublicRestaurantData,
  createPublicOrder,
  getPublicMenu,
  occupyPublicTable,
  requestBillClosure,
} from '../lib/database';
import { CartModal } from '../components/Order/CartModal';
import { OrderHistoryModal } from '../components/Order/OrderHistoryModal';
import { SearchFilterBar } from '../components/Order/SearchFilterBar';
import { MenuItemCard } from '../components/Order/MenuItemCard';
import { PublicProductModal } from '../components/Menu/PublicProductModal';
import { StatusBadge, cx } from '../components/ui/AppPrimitives';
import toast from 'react-hot-toast';

const defaultRestaurant: PublicRestaurantData = {
  business_name: 'Comanda PRO',
  logo_url: '',
  theme_color: 'red',
  custom_theme_hex: '#EA1D2C',
};

const formatCurrency = (value: any) => {
  const num = typeof value === 'number' ? value : Number(value || 0);
  if (isNaN(num)) return 'R$ 0,00';
  return `R$ ${num.toFixed(2).replace('.', ',')}`;
};

const isValidUUID = (uuid: string) => {
  if (!uuid || typeof uuid !== 'string') return false;
  // Regex mais flexível para UUIDs (permite qualquer versão válida pelo PostgreSQL)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid.trim());
};

function getPublicErrorMessage(error: unknown): string {
  const errorObject = error && typeof error === 'object' ? error as { code?: string; message?: string } : null;
  const message = error instanceof Error
    ? error.message
    : errorObject?.message || String(error || '');

  if (errorObject?.code === 'PGRST202' || message.toLowerCase().includes('could not find the function')) {
    return 'Cardápio público indisponível no momento. Acione a equipe do restaurante.';
  }

  if (errorObject?.code === '22P02' || message.toLowerCase().includes('invalid input syntax for type uuid')) {
    return 'QR Code inválido ou mesa não identificada. Por favor, escaneie novamente.';
  }

  if (message.toLowerCase().includes('mesa nao encontrada')) {
    return 'Mesa nao encontrada. Verifique se o QR Code esta correto.';
  }

  if (message.toLowerCase().includes('mesa reservada')) {
    return 'Esta mesa esta reservada no momento. Procure um atendente.';
  }

  if (message.toLowerCase().includes('indisponivel')) {
    return 'Mesa ou item indisponivel no momento. Atualize o cardapio e tente novamente.';
  }

  if (message.toLowerCase().includes('pedido vazio')) {
    return 'Seu carrinho esta vazio.';
  }

  return message || 'Nao foi possivel carregar o cardapio. Tente novamente.';
}

export default function Order() {
  const { tableId: paramTableId } = useParams<{ tableId: string }>();
  const [searchParams] = useSearchParams();
  const tableId = paramTableId || searchParams.get('table') || '';

  const [items, setItems] = useState<MenuItemData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderData[]>([]);
  const [restaurant, setRestaurant] = useState<PublicRestaurantData>(defaultRestaurant);
  const [tableNumber, setTableNumber] = useState<number | string>('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItemData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [unavailableItems, setUnavailableItems] = useState<CartItem[]>([]);
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    type: 'success' | 'info';
  } | null>(null);
  const [isClosingBill, setIsClosingBill] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'summary' | 'requested'>('summary');
  const [tableData, setTableData] = useState<any>(null);
  const [isOccupying, setIsOccupying] = useState(false);
  const hasAttemptedOccupation = useRef<string | null>(null);

  // --- Cart Persistence ---
  const CART_EXPIRATION_MS = 2 * 60 * 60 * 1000; // 2 hours
  const cartKey = `cart_table_${tableId}`;

  // Load cart from localStorage
  useEffect(() => {
    if (!tableId) return;
    
    const saved = localStorage.getItem(cartKey);
    if (saved) {
      try {
        const { items, savedAt } = JSON.parse(saved);
        const isExpired = Date.now() - (savedAt || 0) > CART_EXPIRATION_MS;
        
        if (!isExpired && Array.isArray(items)) {
          console.log('[PublicMenu] Carrinho recuperado do localStorage');
          setCart(items);
        } else {
          localStorage.removeItem(cartKey);
        }
      } catch (e) {
        console.error('[PublicMenu] Erro ao recuperar carrinho:', e);
      }
    }
  }, [tableId]);

  // Save cart to localStorage
  useEffect(() => {
    if (!tableId) return;
    
    if (cart.length === 0) {
      localStorage.removeItem(cartKey);
      return;
    }

    const data = {
      items: cart,
      savedAt: Date.now(),
      tableId,
    };
    localStorage.setItem(cartKey, JSON.stringify(data));
  }, [cart, tableId]);

  const loadPublicData = async (showLoading = false) => {
    if (!tableId) {
      setError('Mesa não identificada');
      setLoading(false);
      return;
    }

    if (!isValidUUID(tableId)) {
      setError('QR Code inválido. Por favor, escaneie novamente o código da mesa.');
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);

      console.log('[PublicMenu] Buscando dados para mesa:', tableId);
      const publicMenu = await getPublicMenu(tableId);
      
      if (!publicMenu) {
        throw new Error('O servidor não retornou dados do cardápio.');
      }

      setRestaurant(publicMenu.restaurant || defaultRestaurant);
      setTableNumber(publicMenu.table?.number || tableId);
      setTableData(publicMenu.table);
      setItems(publicMenu.items || []);
      setCategories(publicMenu.categories || []);
      setOrderHistory(publicMenu.orders || []);
      setError(null);
    } catch (err) {
      console.error('[PublicMenu] Erro fatal ao carregar dados:', err);
      const message = getPublicErrorMessage(err);
      if (showLoading || items.length === 0) {
        setError(message);
      } else {
        showToast(message, 'info');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Efeito para ocupar a mesa automaticamente ao montar o componente
  useEffect(() => {
    const handleAutoOccupy = async () => {
      // Só tenta ocupar se tiver tableId, o status for available e ainda não tiver tentado com sucesso nesta sessão do componente
      if (tableId && tableData?.status === 'available' && hasAttemptedOccupation.current !== tableId) {
        hasAttemptedOccupation.current = tableId;
        setIsOccupying(true);
        try {
          const result = await occupyPublicTable(tableId);
          if (result.success) {
            toast.success('Mesa ocupada! Bem-vindo.', { id: 'table-occ' });
            // Atualiza os dados após ocupar para pegar a nova sessão
            loadPublicData(false);
          }
        } catch (err) {
          // Trata o erro silenciosamente como solicitado
          console.error('[PublicMenu] Erro silencioso ao ocupar mesa:', err);
        } finally {
          setIsOccupying(false);
        }
      }
    };

    handleAutoOccupy();
  }, [tableId, tableData?.status]);

  useEffect(() => {
    // Só inicia se o tableId for um UUID válido para evitar spam de erro 22P02 no Supabase
    if (isValidUUID(tableId)) {
      loadPublicData(true);
      const interval = window.setInterval(() => loadPublicData(false), 10000);
      return () => window.clearInterval(interval);
    } else {
      setError('Mesa não identificada ou QR Code inválido.');
      setLoading(false);
    }
    return undefined;
  }, [tableId]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToastNotification({ message, type });
    window.setTimeout(() => setToastNotification(null), 3000);
  };

  const handleProductClick = (item: MenuItemData) => {
    setSelectedProduct(item);
    setIsProductModalOpen(true);
  };

  const addToCart = (newItem: CartItem) => {
    // Sort options to ensure reliable comparison
    const sortedNewOptions = [...(newItem.options || [])].sort((a, b) => a.id.localeCompare(b.id));
    const newItemWithSortedOptions = { ...newItem, options: sortedNewOptions };

    // If exact same item with exact same options exists, just increase quantity
    const product = items.find(i => i.id === newItemWithSortedOptions.menu_item_id);
    
    // Check total quantity in cart for this product against stock
    const totalInCart = cart
      .filter(i => i.menu_item_id === newItemWithSortedOptions.menu_item_id)
      .reduce((sum, i) => sum + i.quantity, 0);

    if (product?.track_stock && (totalInCart + newItemWithSortedOptions.quantity) > (product.stock_quantity || 0)) {
      toast.error(`Desculpe, temos apenas ${product.stock_quantity} unidades de ${product.name} disponíveis.`);
      return;
    }

    // Find if the exact same item with exact same options already exists in the cart
    const existingItemIndex = cart.findIndex(item => {
      if (item.menu_item_id !== newItemWithSortedOptions.menu_item_id) return false;
      
      const itemOptions = item.options || [];
      const newOptions = newItemWithSortedOptions.options || [];
      
      if (itemOptions.length !== newOptions.length) return false;
      
      return itemOptions.every((opt, idx) => 
        opt.id === newOptions[idx].id
      );
    });

    if (existingItemIndex >= 0) {
      setCart((prev) => {
        const updated = [...prev];
        updated[existingItemIndex].quantity += newItemWithSortedOptions.quantity;
        return updated;
      });
    } else {
      setCart((prev) => [...prev, newItemWithSortedOptions]);
    }
    showToast(`${newItemWithSortedOptions.name} adicionado!`);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((previousCart) =>
      previousCart
        .map((item) => {
          if (item.cart_item_id === cartItemId) {
            const product = items.find(i => i.id === item.menu_item_id);
            const newQuantity = Math.max(0, item.quantity + delta);
            
            // If increasing, check stock
            if (delta > 0 && product?.track_stock && newQuantity > (product.stock_quantity || 0)) {
              toast.error(`Limite de estoque atingido (${product.stock_quantity} unidades)`);
              return item;
            }
            
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const updateNotes = (cartItemId: string, notes: string) => {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.cart_item_id === cartItemId ? { ...item, notes } : item
      )
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((previousCart) => previousCart.filter((item) => item.cart_item_id !== cartItemId));
  };

  const submitOrder = async () => {
    if (!tableId || cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const latestMenu = await getPublicMenu(tableId);
      
      // Check for unavailable items AND items with insufficient stock
      const currentUnavailable = cart.filter((cartItem) => {
        const menuItem = latestMenu.items.find((mi) => mi.id === cartItem.menu_item_id);
        
        // Item no longer in menu or not available
        if (!menuItem || !menuItem.available) return true;
        
        // Stock check (sum all instances of same product in cart)
        if (menuItem.track_stock) {
          const totalRequested = cart
            .filter(i => i.menu_item_id === menuItem.id)
            .reduce((sum, i) => sum + i.quantity, 0);
          
          if (totalRequested > (menuItem.stock_quantity || 0)) return true;
        }
        
        return false;
      });

      if (currentUnavailable.length > 0) {
        setUnavailableItems(currentUnavailable);
        setIsUnavailableModalOpen(true);
        return;
      }

      await createPublicOrder(tableId, cart);
      localStorage.removeItem(cartKey);
      setCart([]);
      setIsCartOpen(false);
      showToast('Pedido enviado para a cozinha!', 'success');
      await loadPublicData(false);
    } catch (err) {
      showToast(getPublicErrorMessage(err), 'info');
      await loadPublicData(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeUnavailableItems = () => {
    const unavailableIds = unavailableItems.map((item) => item.menu_item_id);
    setCart((previousCart) =>
      previousCart.filter((item) => !unavailableIds.includes(item.menu_item_id))
    );
    setUnavailableItems([]);
    setIsUnavailableModalOpen(false);
    showToast('Itens removidos do carrinho', 'info');
  };

  const confirmPaymentRequest = async () => {
    if (!tableId || isClosingBill) return;

    setIsClosingBill(true);
    try {
      const result = await requestBillClosure(tableId, totalToPay);
      if (result.success) {
        setPaymentStep('requested');
        toast.success('Solicitação enviada!', { id: 'bill-req-success' });
      } else {
        toast.error('Não foi possível enviar a solicitação. Tente novamente.');
      }
    } catch (err) {
      console.error('[PublicMenu] Erro ao solicitar fechamento:', err);
      toast.error('Erro ao conectar com o servidor.');
    } finally {
      setIsClosingBill(false);
    }
  };

  const cartTotal = (cart ?? []).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = (cart ?? []).reduce((sum, item) => sum + item.quantity, 0);
  const unpaidOrders = (orderHistory ?? []).filter((order) => !['paid', 'cancelled', 'archived'].includes(order.status));
  const unpaidOrdersTotal = unpaidOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const totalToPay = cartTotal + unpaidOrdersTotal;

  const allCategories = useMemo(() => {
    try {
      const safeItems = Array.isArray(items) ? items : [];
      const categoryNames = (Array.isArray(categories) && categories.length > 0) 
        ? categories 
        : safeItems.map((item) => item?.category).filter((cat): cat is string => typeof cat === 'string' && cat.trim() !== '');
      
      const uniqueCategories = Array.from(new Set(categoryNames.filter((cat) => typeof cat === 'string' && cat.trim() !== '')));
      return uniqueCategories.length > 0 ? uniqueCategories : ['Geral'];
    } catch (e) {
      console.error('[PublicMenu] Error in allCategories useMemo:', e);
      return ['Geral'];
    }
  }, [categories, items]);

  useEffect(() => {
    if (selectedCategory !== 'all' && !allCategories.includes(selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [allCategories, selectedCategory]);

  const filteredItems = useMemo(() => {
    try {
      const search = searchQuery.trim().toLowerCase();
      const safeItems = Array.isArray(items) ? items : [];
      return safeItems.filter((item) => {
        if (!item) return false;
        
        const name = String(item.name || '').toLowerCase();
        const category = String(item.category || '').toLowerCase();
        const description = String(item.description || '').toLowerCase();
        
        const matchesSearch =
          !search ||
          name.includes(search) ||
          category.includes(search) ||
          description.includes(search);

        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
    } catch (e) {
      console.error('[PublicMenu] Error in filteredItems useMemo:', e);
      return [];
    }
  }, [items, searchQuery, selectedCategory]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItemData[]> = {};
    if (!filteredItems || !Array.isArray(filteredItems)) return groups;

    filteredItems.forEach(item => {
      if (!item) return;
      const category = item.category || 'Geral';
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const visibleCategories = useMemo(() => {
    const categoryNames = selectedCategory === 'all' ? allCategories : [selectedCategory];
    return categoryNames.filter((category) => (groupedItems[category] || []).length > 0);
  }, [allCategories, groupedItems, selectedCategory]);

  const themeStyle = {
    '--public-accent': restaurant.custom_theme_hex || '#EA1D2C',
  } as React.CSSProperties;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center dark:bg-slate-950">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 animate-pulse">
          <Utensils className="h-10 w-10 text-[#bb001b]" />
        </div>
        <div className="mt-8">
          <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-black text-slate-950 dark:text-white">
            Carregando cardápio...
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Buscando os melhores sabores para você.
          </p>
        </div>
      </div>
    );
  }

  if (error === 'Mesa não identificada') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 text-center dark:bg-slate-950">
        <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-10 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
            <QrCode className="h-10 w-10" />
          </div>
          <h1 className="mt-8 font-['Plus_Jakarta_Sans'] text-2xl font-black text-slate-950 dark:text-white">
            Mesa não identificada
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Não foi possível identificar a mesa. Escaneie o QR Code novamente.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 text-center dark:bg-slate-950">
        <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-10 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h1 className="mt-8 font-['Plus_Jakarta_Sans'] text-2xl font-black text-slate-950 dark:text-white">
            Não foi possível carregar o cardápio
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
            {error || 'Ocorreu um erro inesperado ao buscar os dados.'}
          </p>
          <button 
            type="button" 
            onClick={() => loadPublicData(true)} 
            className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#bb001b] text-lg font-bold text-white shadow-lg shadow-red-600/20 active:scale-95 transition-all"
          >
            <RefreshCw className="h-5 w-5" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const safeItems = items ?? [];
  const safeCategories = categories ?? [];
  const safeCart = cart ?? [];
  const safeHistory = orderHistory ?? [];

  return (
    <div
      className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-['Inter'] antialiased relative pb-[160px]"
      style={themeStyle}
    >
      {/* Header Compacto Sticky */}
      <header className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between px-4 py-3 w-full h-16">
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="text-zinc-500 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors active:scale-95 duration-150 p-2 rounded-full flex items-center justify-center"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        
        <div className="text-[#bb001b] dark:text-red-500 font-extrabold tracking-tighter italic text-xl font-['Plus_Jakarta_Sans']">
          {restaurant.business_name?.toUpperCase() || 'COMANDA PRO'}
        </div>

        <button 
          onClick={() => {
            const searchInput = document.getElementById('menu-search');
            searchInput?.focus();
          }}
          className="text-zinc-500 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors active:scale-95 duration-150 p-2 rounded-full flex items-center justify-center"
        >
          <span className="material-symbols-outlined">search</span>
        </button>
      </header>

      <main className="w-full max-w-lg mx-auto">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isAdmin={false}
          isEditMode={false}
          onToggleEditMode={() => undefined}
          showUnavailable={false}
          onToggleUnavailable={() => undefined}
          categories={allCategories ?? []}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {safeItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-6">
            <div className="w-16 h-16 bg-[#eeeeee] dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-zinc-400 text-3xl">restaurant_menu</span>
            </div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#1a1c1c]">Cardápio vazio</h2>
            <p className="mt-2 text-sm text-[#5d3f3d]">Nenhum item disponível no momento.</p>
          </div>
        ) : (visibleCategories ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[220px] text-center px-6">
            <span className="material-symbols-outlined text-zinc-300 text-4xl mb-4">search_off</span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#1a1c1c]">Nada encontrado</h2>
            <p className="mt-1 text-sm text-[#5d3f3d]">Tente buscar outro item ou limpar o filtro.</p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-6 px-6 py-2 bg-[#eeeeee] text-[#1a1c1c] rounded-full text-sm font-bold transition-all active:scale-95"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-4 py-2">
            {(visibleCategories ?? []).map((category) => (
              <div key={category} className="space-y-4">
                {selectedCategory === 'all' && (
                  <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#1a1c1c] px-1 pt-2">
                    {category}
                  </h2>
                )}
                <div className="flex flex-col gap-4">
                  {(groupedItems[category] ?? []).map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      isEditMode={false}
                      isAdmin={false}
                      onAdd={handleProductClick}
                      onEdit={() => undefined}
                      onToggleAvailability={() => undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Pill */}
      <AnimatePresence>
        {cartItemCount > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[88px] left-4 right-4 max-w-lg mx-auto z-40"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-[#2f3131] text-[#f1f1f1] rounded-2xl p-4 flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[14px] font-bold font-['Inter']">
                  {cartItemCount}
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-[12px] font-normal text-[#dadada] font-['Inter'] leading-none mb-1">Total do pedido</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[20px] font-bold leading-none">{formatCurrency(cartTotal)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 font-bold text-[14px] text-[#ffdad7] font-['Inter']">
                Ver Carrinho
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="bg-[#1a1c1c] fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-8 rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">
        <button 
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center text-[#bb001b] scale-110 active:translate-y-1 transition-all duration-200"
        >
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold">Menu</span>
        </button>
        
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="flex flex-col items-center justify-center text-zinc-400 hover:text-white active:translate-y-1 transition-all duration-200"
        >
          <span className="material-symbols-outlined mb-1">receipt_long</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold">Pedidos</span>
        </button>

        <button 
          onClick={() => setIsPaymentModalOpen(true)}
          className="flex flex-col items-center justify-center text-zinc-400 hover:text-white active:translate-y-1 transition-all duration-200"
        >
          <span className="material-symbols-outlined mb-1">payments</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold">Conta</span>
        </button>

        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center text-zinc-400 hover:text-white active:translate-y-1 transition-all duration-200"
        >
          <span className="material-symbols-outlined mb-1">shopping_bag</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold">Carrinho</span>
        </button>
      </nav>


      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        unpaidOrdersTotal={unpaidOrdersTotal}
        onUpdateQuantity={updateQuantity}
        onUpdateNotes={updateNotes}
        onRemove={removeFromCart}
        onSubmit={submitOrder}
        onCheckout={() => setIsPaymentModalOpen(true)}
        isSubmitting={isSubmitting}
      />

      <OrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={orderHistory}
      />

      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-5 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              role="dialog"
              aria-modal="true"
              className="w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white shadow-2xl dark:bg-slate-900 border border-white/20"
            >
              <AnimatePresence mode="wait">
                {paymentStep === 'summary' ? (
                  <motion.div
                    key="summary"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600">
                        <ReceiptText className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-black text-slate-900 dark:text-white leading-none">Resumo da Conta</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mesa {tableNumber}</p>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                      {unpaidOrders.length === 0 && cart.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">Nenhum item pendente.</p>
                      ) : (
                        <>
                          {/* Itens do Carrinho (se houver) */}
                          {cart.map((item, idx) => (
                            <div key={`cart-${idx}`} className="flex justify-between items-start group">
                              <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                  {item.quantity}x {item.name}
                                </p>
                                {item.options?.map(opt => (
                                  <p key={opt.id} className="text-[10px] text-slate-400 font-medium">+ {opt.name}</p>
                                ))}
                              </div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            </div>
                          ))}

                          {/* Itens de Pedidos Anteriores */}
                          {unpaidOrders.map((order) => (
                            <div key={order.id} className="space-y-2 border-t border-slate-50 dark:border-slate-800/50 pt-2">
                              {order.items.map((item: any, idx: number) => (
                                <div key={`${order.id}-${idx}`} className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                      {item.quantity}x {item.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium italic">Pedido em {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white">
                                    {formatCurrency((item.price || 0) * (item.quantity || 1))}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    <div className="rounded-3xl bg-slate-50 dark:bg-slate-800/50 p-6 space-y-3 mb-8 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Subtotal</span>
                        <span className="text-sm font-bold">{formatCurrency(totalToPay)}</span>
                      </div>
                      <div className="h-px bg-slate-200 dark:bg-slate-700" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Total Geral</span>
                        <span className="text-2xl font-black text-[#bb001b] dark:text-red-500">{formatCurrency(totalToPay)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={confirmPaymentRequest}
                        disabled={isClosingBill || (unpaidOrders.length === 0 && cart.length === 0)}
                        className="w-full h-14 bg-[#bb001b] hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-red-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {isClosingBill ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Bell className="h-5 w-5" />
                            Solicitar Fechamento da Conta
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => setIsPaymentModalOpen(false)}
                        className="w-full h-12 text-slate-400 hover:text-slate-600 font-bold text-sm uppercase tracking-widest transition-colors"
                      >
                        Voltar
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="requested"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-10 text-center"
                  >
                    <div className="relative mx-auto w-24 h-24 mb-8">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                        className="absolute inset-0 bg-emerald-500 rounded-full flex items-center justify-center text-white z-10"
                      >
                        <CheckCircle2 className="h-12 w-12" />
                      </motion.div>
                      <motion.div 
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-4 border-2 border-emerald-500 rounded-full"
                      />
                    </div>

                    <h3 className="font-['Plus_Jakarta_Sans'] text-2xl font-black text-slate-900 dark:text-white mb-2 italic">Solicitação Enviada!</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">
                      Um atendente está a caminho da sua mesa para finalizar o pagamento.
                    </p>

                    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl p-6 mb-8 border border-emerald-100 dark:border-emerald-500/20">
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-1">Total Confirmado</p>
                      <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(totalToPay)}</p>
                    </div>

                    <button 
                      onClick={() => {
                        setIsPaymentModalOpen(false);
                        setTimeout(() => setPaymentStep('summary'), 300);
                      }}
                      className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 dark:shadow-none"
                    >
                      Fechar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isUnavailableModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-5 text-center backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              role="dialog"
              aria-modal="true"
              aria-label="Itens indisponiveis"
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-['Plus_Jakarta_Sans'] text-xl font-black text-slate-950 dark:text-white">
                Itens indisponíveis
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Alguns itens do seu carrinho acabaram de sair do cardápio.
              </p>
              <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3 text-left dark:bg-slate-950/50">
                {unavailableItems.map((item) => (
                  <div key={item.menu_item_id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                    <StatusBadge tone="danger">{item.quantity}x</StatusBadge>
                  </div>
                ))}
              </div>
              <button type="button" onClick={removeUnavailableItems} className="mt-6 h-12 w-full rounded-lg bg-[#bb001b] px-4 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950">
                Remover itens
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className={cx(
              'fixed bottom-28 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-2xl',
              toastNotification.type === 'success' ? 'bg-[#1a1c1c]' : 'bg-amber-600'
            )}
          >
            {toastNotification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-white" />
            )}
            <span className="min-w-0 flex-1">{toastNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <PublicProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        onAddToCart={addToCart}
        primaryColorHex={restaurant?.custom_theme_hex || '#bb001b'}
      />
    </div>
  );
}
