import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// ========== Types ==========

export interface TableData {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved';
  capacity: number;
  active?: boolean;
  opened_at?: string;
  current_session_id?: string | null;
  payment_requested?: boolean;
  payment_requested_at?: string;
  payment_requested_amount?: number;
  created_at?: string;
}

export interface ReservationData {
  id: string;
  table_id: string;
  customer_name: string;
  date: string;
  time: string;
  guests: number;
  status: 'scheduled' | 'seated' | 'cancelled';
  created_at?: string;
}

export interface CategoryData {
  id: string;
  name: string;
  sort_order: number;
  active: boolean;
  created_at?: string;
}

export interface MenuItemOptionData {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  type: 'addon' | 'size' | 'choice';
  group_name?: string;
  min_select?: number;
  max_select?: number | null;
  sort_order: number;
  active: boolean;
  created_at?: string;
}

export interface MenuItemData {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  category_id?: string;
  image_url?: string;
  available: boolean;
  is_archived: boolean;
  track_stock: boolean;
  stock_quantity: number;
  stock_alert_threshold: number;
  created_at?: string;
  options?: MenuItemOptionData[];
}

export interface CartItemOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cart_item_id: string; // Unique ID for the cart item instance
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  options?: CartItemOption[];
}

export interface OrderData {
  id: string;
  table_id: string;
  table_number?: string | number;
  items: CartItem[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'served' | 'paid' | 'archived' | 'cancelled';
  total_amount: number;
  payment_method?: 'pix' | 'card' | 'cash' | 'pending';
  created_at?: string;
}

export interface SessionData {
  id: string;
  table_id: string;
  status: 'active' | 'closed';
  opened_at?: string;
}

export interface AppSettings {
  theme_color: string;
  custom_theme_hex: string;
  logo_url: string;
  business_name: string;
  cnpj: string;
  address: string;
  phone: string;
  restaurant_id?: string;
}

export interface PublicRestaurantData {
  business_name: string;
  logo_url: string;
  theme_color: string;
  custom_theme_hex: string;
}

export interface PublicMenuResponse {
  table: Pick<TableData, 'id' | 'number' | 'status' | 'active'>;
  restaurant: PublicRestaurantData;
  categories: string[];
  items: MenuItemData[];
  orders: OrderData[];
}

export interface PublicOrderOptions {
  customerName?: string;
  notes?: string;
}

export interface ActivityLogData {
  id: string;
  restaurant_id: string;
  user_id?: string;
  action: string;
  details: any;
  created_at: string;
}

// ========== Realtime helpers ==========

export function subscribeToTable(
  table: string,
  callback: () => void,
  filter?: string
): RealtimeChannel {
  const channel = supabase
    .channel(`${table}-changes-${Math.random()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter: filter as string | undefined },
      () => callback()
    )
    .subscribe();
  return channel;
}

export function subscribeToTableStatus(tableId: string, callback: (status: string) => void) {
  return supabase
    .channel(`table-status-${tableId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'tables', filter: `id=eq.${tableId}` },
      (payload) => callback(payload.new.status)
    )
    .subscribe();
}

export function subscribeToTableOrders(tableId: string, callback: () => void) {
  return supabase
    .channel(`table-orders-${tableId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `table_id=eq.${tableId}` },
      () => callback()
    )
    .subscribe();
}

export function subscribeToTables(callback: () => void) {
  return supabase
    .channel('all-tables')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => callback())
    .subscribe();
}

export function subscribeToOrders(callback: () => void) {
  return supabase
    .channel('all-orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => callback())
    .subscribe();
}

export function unsubscribe(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
}

// ========== Public QR RPCs ==========

export async function getPublicMenu(tableId: string): Promise<PublicMenuResponse> {
  const { data, error } = await supabase.rpc('get_public_menu', {
    p_table_id: tableId,
  });

  if (error) throw error;
  return normalizePublicMenu(data);
}

export async function createPublicOrder(
  tableId: string,
  items: CartItem[],
  options: PublicOrderOptions = {}
): Promise<OrderData> {
  const rpcItems = items.map((item) => ({
    menu_item_id: item.menu_item_id,
    quantity: item.quantity,
    notes: item.notes || null,
    options: item.options ? item.options.map(opt => opt.id) : []
  }));

  const { data, error } = await supabase.rpc('create_public_order', {
    p_table_id: tableId,
    p_items: rpcItems,
    p_customer_name: options.customerName || null,
    p_notes: options.notes || null,
  });

  if (error) throw error;
  return normalizeOrder(data);
}

export async function occupyPublicTable(tableId: string): Promise<{ success: boolean; status: string; session_id: string }> {
  const { data, error } = await supabase.rpc('occupy_public_table', {
    p_table_id: tableId,
  });

  if (error) throw error;
  return data;
}

// ========== Tables ==========

export async function fetchTables(): Promise<TableData[]> {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('number');
  if (error) throw error;
  return (data || []).map(normalizeTable);
}

export async function addTable(number: number, capacity: number = 4): Promise<TableData> {
  const { data, error } = await supabase
    .from('tables')
    .insert({ number, status: 'available', capacity })
    .select()
    .single();
  if (error) throw error;
  return normalizeTable(data);
}

export async function updateTable(id: string, updates: Partial<TableData>): Promise<void> {
  const snakeUpdates = toSnakeCase(updates);
  const { error } = await supabase.from('tables').update(snakeUpdates).eq('id', id);
  if (error) throw error;
}

export async function updateTableStatusSafe(id: string, newStatus: string): Promise<{ success: boolean; new_status: string }> {
  const { data, error } = await supabase.rpc('update_table_status_safe', {
    p_table_id: id,
    p_new_status: newStatus,
  });

  if (error) throw error;
  return data;
}

export async function deleteTable(id: string): Promise<void> {
  const { error } = await supabase.from('tables').delete().eq('id', id);
  if (error) throw error;
}

export async function cleanupStaleTables(): Promise<{ success: boolean; cleaned_count: number; message: string }> {
  const { data, error } = await supabase.rpc('cleanup_stale_tables');

  if (error) {
    console.error('Erro ao limpar mesas estagnadas:', error);
    throw error;
  }
  return data;
}

export async function requestBillClosure(tableId: string, totalAmount: number): Promise<{ success: boolean }> {
  const { data, error } = await supabase.rpc('request_bill_closure', {
    p_table_id: tableId,
    p_total_amount: totalAmount,
  });

  if (error) throw error;
  return data;
}

// ========== Reservations ==========

export async function fetchReservations(tableId: string): Promise<ReservationData[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('table_id', tableId);
  if (error) throw error;
  return (data || []).map(normalizeReservation).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export async function addReservation(reservation: Omit<ReservationData, 'id'>): Promise<void> {
  const { error } = await supabase.from('reservations').insert(toSnakeCase(reservation));
  if (error) throw error;
}

export async function updateReservation(id: string, updates: Partial<ReservationData>): Promise<void> {
  const { error } = await supabase.from('reservations').update(toSnakeCase(updates)).eq('id', id);
  if (error) throw error;
}

export async function deleteReservation(id: string): Promise<void> {
  const { error } = await supabase.from('reservations').delete().eq('id', id);
  if (error) throw error;
}

export async function checkExistingReservation(tableId: string, date: string, time: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('reservations')
    .select('id')
    .eq('table_id', tableId)
    .eq('date', date)
    .eq('time', time)
    .neq('status', 'cancelled')
    .maybeSingle();
    
  if (error) throw error;
  return !!data;
}

export async function fetchAllActiveReservations(): Promise<ReservationData[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .neq('status', 'cancelled')
    .order('date')
    .order('time');
    
  if (error) throw error;
  return (data || []).map(normalizeReservation);
}

// ========== Orders ==========

export async function fetchOrders(filters?: { status?: string[]; tableId?: string; startDate?: string }): Promise<OrderData[]> {
  let query = supabase.from('orders').select('*, tables(number)');

  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }
  if (filters?.tableId) {
    query = query.eq('table_id', filters.tableId);
  }
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalizeOrder);
}

export async function getOrderHistory(tableId: string): Promise<OrderData[]> {
  return fetchOrders({ tableId });
}

export async function createOrder(tableId: string, items: CartItem[]): Promise<OrderData> {
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const { data, error } = await supabase
    .from('orders')
    .insert(toSnakeCase({ 
      tableId, 
      items, 
      status: 'pending', 
      totalAmount,
      createdAt: new Date().toISOString() 
    }))
    .select()
    .single();
  if (error) throw error;
  return normalizeOrder(data);
}

export async function updateOrder(id: string, updates: Partial<OrderData>): Promise<void> {
  const { error } = await supabase.from('orders').update(toSnakeCase(updates)).eq('id', id);
  if (error) throw error;
}

export async function updateOrderPaymentMethod(orderId: string, method: 'pix' | 'card' | 'cash'): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ payment_method: method })
    .eq('id', orderId);
  if (error) throw error;
}

// ========== Menu Items ==========

export async function fetchMenuItems(): Promise<MenuItemData[]> {
  const { data, error } = await supabase.from('menu_items').select('*').order('category', { ascending: true });
  if (error) throw error;
  return (data || []).map(normalizeMenuItem);
}

export const getMenuItems = fetchMenuItems;

export async function createMenuItem(item: Omit<MenuItemData, 'id'>): Promise<MenuItemData> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(toSnakeCase(item))
    .select()
    .single();
  if (error) throw error;
  return normalizeMenuItem(data);
}

export async function updateMenuItem(id: string, updates: Partial<MenuItemData>): Promise<void> {
  const { error } = await supabase.from('menu_items').update(toSnakeCase(updates)).eq('id', id);
  if (error) throw error;
}

export async function updateMenuItemAvailability(id: string, available: boolean): Promise<void> {
  return updateMenuItem(id, { available });
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}

export async function archiveMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').update({ is_archived: true }).eq('id', id);
  if (error) throw error;
}

export async function hasMenuItemHistory(id: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true })
    .eq('menu_item_id', id);
    
  if (error) throw error;
  return (count || 0) > 0;
}

// ========== Categories ==========

export async function fetchCategories(): Promise<CategoryData[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(normalizeCategory);
}

export async function createCategory(name: string, sortOrder: number = 0): Promise<CategoryData> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return normalizeCategory(data);
}

export async function updateCategory(id: string, updates: Partial<CategoryData>): Promise<void> {
  const { error } = await supabase.from('categories').update(toSnakeCase(updates)).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ========== Menu Item Options ==========

export async function fetchMenuItemOptions(menuItemId: string): Promise<MenuItemOptionData[]> {
  const { data, error } = await supabase
    .from('menu_item_options')
    .select('*')
    .eq('menu_item_id', menuItemId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(normalizeMenuItemOption);
}

export async function saveMenuItemOption(option: Omit<MenuItemOptionData, 'id'>): Promise<MenuItemOptionData> {
  const { data, error } = await supabase
    .from('menu_item_options')
    .insert(toSnakeCase(option))
    .select()
    .single();
  if (error) throw error;
  return normalizeMenuItemOption(data);
}

export async function updateMenuItemOption(id: string, updates: Partial<MenuItemOptionData>): Promise<void> {
  const { error } = await supabase.from('menu_item_options').update(toSnakeCase(updates)).eq('id', id);
  if (error) throw error;
}

export async function deleteMenuItemOption(id: string): Promise<void> {
  const { error } = await supabase.from('menu_item_options').delete().eq('id', id);
  if (error) throw error;
}

// ========== Storage ==========

export async function uploadImage(file: File, bucket: string = 'products'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// ========== Sessions ==========

export async function addSession(tableId: string): Promise<SessionData> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ table_id: tableId, status: 'active', opened_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return normalizeSession(data);
}

// ========== Activity Logs ==========

export async function logActivity(action: string, details: any = {}): Promise<void> {
  const { error } = await supabase.from('activity_logs').insert({ action, details });
  if (error) throw error;
}

// ========== Settings ==========

export async function fetchSettings(): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'general')
    .maybeSingle();
  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return normalizeSettings(data);
}

export async function updateSettings(settings: AppSettings): Promise<void> {
  // Garantir que temos o restaurant_id para o upsert (chave primária composta)
  let restaurantId = settings.restaurant_id;

  if (!restaurantId) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('restaurant_id')
      .single();
      
    if (profileError || !profile?.restaurant_id) {
      throw new Error('Não foi possível identificar o seu restaurante. Verifique se seu perfil está configurado corretamente.');
    }
    restaurantId = profile.restaurant_id;
  }

  const { error } = await supabase
    .from('settings')
    .upsert({ 
      ...toSnakeCase(settings),
      id: 'general', 
      restaurant_id: restaurantId,
      updated_at: new Date().toISOString()
    });
    
  if (error) {
    console.error('Erro ao salvar configurações no Supabase:', error);
    throw error;
  }
}

// ========== Normalize helpers (snake_case DB → camelCase app) ==========

function normalizePublicMenu(raw: any): PublicMenuResponse {
  if (!raw) {
    return {
      table: { id: '', number: 0, status: 'available', active: false },
      restaurant: { business_name: 'Comanda Digital Pro', logo_url: '', theme_color: 'emerald', custom_theme_hex: '#10b981' },
      categories: [],
      items: [],
      orders: [],
    };
  }

  const table = raw?.table || {};
  const restaurant = raw?.restaurant || {};

  return {
    table: {
      id: String(table.id || ''),
      number: Number(table.number ?? 0),
      status: (table.status || 'available') as TableData['status'],
      active: Boolean(table.active ?? false),
    },
    restaurant: {
      business_name: String(restaurant.business_name ?? 'Comanda Digital Pro'),
      logo_url: String(restaurant.logo_url ?? ''),
      theme_color: String(restaurant.theme_color ?? 'emerald'),
      custom_theme_hex: String(restaurant.custom_theme_hex ?? '#10b981'),
    },
    categories: Array.isArray(raw?.categories) ? raw.categories.filter((c: any) => typeof c === 'string') : [],
    items: Array.isArray(raw?.items) ? raw.items.filter(Boolean).map(normalizeMenuItem) : [],
    orders: Array.isArray(raw?.orders) ? raw.orders.filter(Boolean).map(normalizeOrder) : [],
  };
}

function normalizeTable(raw: any): TableData {
  if (!raw) return { id: '', number: 0, status: 'available', capacity: 0 };
  return {
    id: String(raw.id || ''),
    number: Number(raw.number ?? 0),
    status: (raw.status || 'available') as TableData['status'],
    capacity: Number(raw.capacity ?? 0),
    active: Boolean(raw.active ?? false),
    opened_at: raw.opened_at,
    current_session_id: raw.current_session_id,
    payment_requested: Boolean(raw.payment_requested ?? false),
    payment_requested_at: raw.payment_requested_at,
    payment_requested_amount: raw.payment_requested_amount ? Number(raw.payment_requested_amount) : undefined,
    created_at: raw.created_at,
  };
}

function normalizeReservation(raw: any): ReservationData {
  if (!raw) return { id: '', table_id: '', customer_name: '', date: '', time: '', guests: 0, status: 'scheduled' };
  return {
    id: String(raw.id || ''),
    table_id: String(raw.table_id || ''),
    customer_name: String(raw.customer_name || 'Cliente'),
    date: String(raw.date || ''),
    time: String(raw.time || ''),
    guests: Number(raw.guests ?? 0),
    status: (raw.status || 'scheduled') as ReservationData['status'],
    created_at: raw.created_at,
  };
}

function normalizeOrder(raw: any): OrderData {
  if (!raw) return { id: '', table_id: '', items: [], status: 'pending', total_amount: 0 };
  
  return {
    id: raw.id || '',
    table_id: raw.table_id || '',
    table_number: raw.table_number || raw.tableNumber || (raw.tables?.number),
    items: (Array.isArray(raw.items) ? raw.items : []).map((item: any) => {
      if (!item) return { menu_item_id: '', name: 'Item inválido', price: 0, quantity: 0 };
      return {
        menu_item_id: item.menu_item_id || item.menuItemId || '',
        name: item.name || 'Item sem nome',
        price: Number(item.price ?? 0),
        quantity: Number(item.quantity ?? 0),
        notes: item.notes || '',
        options: Array.isArray(item.options) ? item.options : [],
      };
    }),
    status: raw.status || 'pending',
    total_amount: Number(raw.total_amount ?? raw.totalAmount ?? 0),
    payment_method: raw.payment_method || raw.paymentMethod,
    created_at: raw.created_at,
  };
}

function normalizeMenuItem(raw: any): MenuItemData {
  if (!raw) return {
    id: '',
    name: 'Item não encontrado',
    price: 0,
    category: 'Geral',
    available: false,
    is_archived: false,
    track_stock: false,
    stock_quantity: 0,
    stock_alert_threshold: 0
  };

  return {
    id: raw.id || '',
    name: raw.name || 'Item sem nome',
    description: raw.description || '',
    price: Number(raw.price ?? 0),
    category: raw.category || 'Geral',
    category_id: raw.category_id,
    image_url: raw.image_url || '',
    available: raw.available ?? true,
    is_archived: raw.is_archived ?? false,
    track_stock: raw.track_stock ?? false,
    stock_quantity: Number(raw.stock_quantity ?? 0),
    stock_alert_threshold: Number(raw.stock_alert_threshold ?? 10),
    created_at: raw.created_at,
    options: Array.isArray(raw.options) ? raw.options.filter(Boolean).map(normalizeMenuItemOption) : undefined,
  };
}

function normalizeCategory(raw: any): CategoryData {
  return {
    id: raw.id,
    name: raw.name,
    sort_order: raw.sort_order,
    active: raw.active,
    created_at: raw.created_at,
  };
}

function normalizeMenuItemOption(raw: any): MenuItemOptionData {
  if (!raw) return { id: '', menu_item_id: '', name: '', price: 0, type: 'addon', sort_order: 0, active: false };
  return {
    id: raw.id || '',
    menu_item_id: raw.menu_item_id || '',
    name: raw.name || '',
    price: Number(raw.price ?? 0),
    type: raw.type || 'addon',
    group_name: raw.group_name,
    min_select: raw.min_select,
    max_select: raw.max_select,
    sort_order: raw.sort_order || 0,
    active: raw.active ?? true,
    created_at: raw.created_at,
  };
}

function normalizeSession(raw: any): SessionData {
  return {
    id: raw.id,
    table_id: raw.table_id,
    status: raw.status,
    opened_at: raw.opened_at,
  };
}

function normalizeSettings(raw: any): AppSettings {
  if (!raw) {
    return {
      theme_color: 'emerald',
      custom_theme_hex: '#10b981',
      logo_url: '',
      business_name: 'Comanda Digital Pro',
      cnpj: '',
      address: '',
      phone: '',
    };
  }
  return {
    theme_color: raw.theme_color ?? 'emerald',
    custom_theme_hex: raw.custom_theme_hex ?? '#10b981',
    logo_url: raw.logo_url ?? '',
    business_name: raw.business_name ?? 'Comanda Digital Pro',
    cnpj: raw.cnpj ?? '',
    address: raw.address ?? '',
    phone: raw.phone ?? '',
    restaurant_id: raw.restaurant_id,
  };
}

// ========== Snake case converter ==========

function toSnakeCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);

  const result: any = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = toSnakeCase(obj[key]);
  }
  return result;
}
