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

export interface MenuItemData {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
  created_at?: string;
}

export interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface OrderData {
  id: string;
  table_id: string;
  items: CartItem[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'served' | 'paid' | 'archived' | 'cancelled';
  total_amount: number;
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
}

// ========== Realtime helpers ==========

export function subscribeToTable(
  table: string,
  callback: () => void,
  filter?: string
): RealtimeChannel {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter: filter as string | undefined },
      () => callback()
    )
    .subscribe();
  return channel;
}

export function unsubscribe(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
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

export async function deleteTable(id: string): Promise<void> {
  const { error } = await supabase.from('tables').delete().eq('id', id);
  if (error) throw error;
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

// ========== Orders ==========

export async function fetchOrders(filters?: { status?: string[]; tableId?: string }): Promise<OrderData[]> {
  let query = supabase.from('orders').select('*');

  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }
  if (filters?.tableId) {
    query = query.eq('table_id', filters.tableId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalizeOrder);
}

export async function addOrder(order: Omit<OrderData, 'id'>): Promise<OrderData> {
  const { data, error } = await supabase
    .from('orders')
    .insert(toSnakeCase({ ...order, createdAt: new Date().toISOString() }))
    .select()
    .single();
  if (error) throw error;
  return normalizeOrder(data);
}

export async function updateOrder(id: string, updates: Partial<OrderData>): Promise<void> {
  const { error } = await supabase.from('orders').update(toSnakeCase(updates)).eq('id', id);
  if (error) throw error;
}

// ========== Menu Items ==========

export async function fetchMenuItems(): Promise<MenuItemData[]> {
  const { data, error } = await supabase.from('menu_items').select('*');
  if (error) throw error;
  return (data || []).map(normalizeMenuItem);
}

export async function addMenuItem(item: Omit<MenuItemData, 'id'>): Promise<MenuItemData> {
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

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
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

// ========== Settings ==========

export async function fetchSettings(): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'general')
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return normalizeSettings(data);
}

export async function updateSettings(settings: AppSettings): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({ id: 'general', ...toSnakeCase(settings) });
  if (error) throw error;
}

// ========== Normalize helpers (snake_case DB → camelCase app) ==========

function normalizeTable(raw: any): TableData {
  return {
    id: raw.id,
    number: raw.number,
    status: raw.status,
    capacity: raw.capacity,
    active: raw.active ?? false,
    opened_at: raw.opened_at,
    current_session_id: raw.current_session_id,
    created_at: raw.created_at,
  };
}

function normalizeReservation(raw: any): ReservationData {
  return {
    id: raw.id,
    table_id: raw.table_id,
    customer_name: raw.customer_name,
    date: raw.date,
    time: raw.time,
    guests: raw.guests,
    status: raw.status,
    created_at: raw.created_at,
  };
}

function normalizeOrder(raw: any): OrderData {
  return {
    id: raw.id,
    table_id: raw.table_id,
    items: (raw.items || []).map((item: any) => ({
      menu_item_id: item.menu_item_id || item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes,
    })),
    status: raw.status,
    total_amount: raw.total_amount ?? raw.totalAmount ?? 0,
    created_at: raw.created_at,
  };
}

function normalizeMenuItem(raw: any): MenuItemData {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    category: raw.category,
    image_url: raw.image_url,
    available: raw.available ?? true,
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
  return {
    theme_color: raw.theme_color ?? 'emerald',
    custom_theme_hex: raw.custom_theme_hex ?? '#10b981',
    logo_url: raw.logo_url ?? '',
    business_name: raw.business_name ?? 'Comanda Digital Pro',
    cnpj: raw.cnpj ?? '',
    address: raw.address ?? '',
    phone: raw.phone ?? '',
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
