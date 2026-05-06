import React from 'react';
import { Save, X, Trash2 } from 'lucide-react';
import { MenuItemData } from '../../lib/database';

interface EditItemFormProps {
  item: Partial<MenuItemData> & { isNew?: boolean };
  categories: string[];
  onChange: (updates: Partial<MenuItemData>) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export const EditItemForm: React.FC<EditItemFormProps> = ({
  item,
  categories,
  onChange,
  onSave,
  onCancel,
  onDelete
}) => {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-3xl border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
      <div className="grid grid-cols-1 gap-3">
        <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-1">Nome do Item</label>
        <input
          type="text"
          value={item.name || ''}
          onChange={e => onChange({ name: e.target.value })}
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          placeholder="Ex: Burger Clássico"
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-1">Descrição</label>
        <textarea
          value={item.description || ''}
          onChange={e => onChange({ description: e.target.value })}
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          placeholder="Descreva os ingredientes..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid grid-cols-1 gap-3">
          <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-1">Preço (R$)</label>
          <input
            type="number"
            step="0.01"
            value={item.price || ''}
            onChange={e => onChange({ price: Number(e.target.value) })}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            placeholder="0,00"
          />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-1">Categoria</label>
          <select
            value={item.category || 'Geral'}
            onChange={e => onChange({ category: e.target.value })}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 pt-4 border-t border-emerald-100 dark:border-emerald-900/30">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 mr-auto cursor-pointer">
          <input 
            type="checkbox" 
            checked={item.available !== false} 
            onChange={e => onChange({ available: e.target.checked })} 
            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500" 
          />
          Item Disponível
        </label>
        
        {item.id && onDelete && (
          <button 
            onClick={() => onDelete(item.id!)} 
            className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
            title="Excluir item"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
        
        <button 
          onClick={onCancel} 
          className="px-4 py-3 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors"
        >
          Cancelar
        </button>
        
        <button 
          onClick={onSave} 
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
        >
          <Save className="w-4 h-4" />
          Salvar
        </button>
      </div>
    </div>
  );
};
