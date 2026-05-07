import React, { useState } from 'react';
import { Edit2, ImageIcon, Plus, Power, PowerOff, Sparkles, Wand2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { MenuItemData } from '../../lib/database';
import { getMenuAIAssistance } from '../../lib/gemini';
import { StatusBadge, cx } from '../ui/AppPrimitives';

interface MenuItemCardProps {
  item: MenuItemData;
  isEditMode: boolean;
  isAdmin: boolean;
  onAdd: (item: MenuItemData) => void;
  onEdit: (item: MenuItemData) => void;
  onToggleAvailability: (id: string, current: boolean) => void;
}

const formatCurrency = (value: any) => {
  const num = typeof value === 'number' ? value : Number(value || 0);
  if (isNaN(num)) return 'R$ 0,00';
  return `R$ ${num.toFixed(2).replace('.', ',')}`;
};

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  isEditMode,
  isAdmin,
  onAdd,
  onEdit,
  onToggleAvailability,
}) => {
  const isOutOfStock = item.track_stock && (item.stock_quantity ?? 0) <= 0;
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    gourmetDescription: string;
    pairingSuggestion: string;
  } | null>(null);

  const handleAiAssistance = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (aiSuggestion) {
      setAiSuggestion(null);
      return;
    }

    setIsAiLoading(true);
    const result = await getMenuAIAssistance(item.name, item.description);
    if (result) {
      setAiSuggestion(result);
    }
    setIsAiLoading(false);
  };

  return (
    <article
      className={cx(
        'flex justify-between items-stretch bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f3f3f3] dark:border-zinc-800 transition-all duration-200',
        !item.available && 'opacity-60 grayscale'
      )}
    >
      <div className="flex flex-col justify-between pr-4 flex-1">
        <div className="min-w-0">
          <h3 className="font-['Plus_Jakarta_Sans'] text-[20px] font-bold text-[#1a1c1c] leading-[1.3]">
            {item.name}
          </h3>
          <p className="font-['Inter'] text-[14px] text-[#5d3f3d] mt-1 line-clamp-2 leading-[1.4]">
            {item.description || 'Descrição não informada.'}
          </p>
        </div>

        <div className="font-['Plus_Jakarta_Sans'] text-[20px] font-bold text-[#bb001b] mt-3 leading-[1.0]">
          {formatCurrency(item.price)}
        </div>
      </div>

      <div className="relative shrink-0 flex items-center">
        <div className="w-[100px] h-[100px] rounded-xl overflow-hidden shadow-sm bg-[#f9f9f9] dark:bg-zinc-800 ring-1 ring-[#f3f3f3] dark:ring-zinc-800">
          {item.image_url ? (
            <img alt={item.name} className="w-full h-full object-cover" src={item.image_url} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <span className="material-symbols-outlined text-3xl">image</span>
            </div>
          )}
        </div>
        
        {isEditMode ? (
          <div className="absolute -bottom-2 -left-3 flex gap-1">
            <button
              type="button"
              onClick={() => onToggleAvailability(item.id, item.available)}
              className={cx(
                'w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all z-10',
                item.available ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'
              )}
            >
              <span className="material-symbols-outlined">{item.available ? 'visibility_off' : 'visibility'}</span>
            </button>
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAdd(item)}
            disabled={!item.available || isOutOfStock}
            className="absolute -bottom-2 -left-3 w-10 h-10 bg-[#bb001b] text-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(187,0,27,0.3)] hover:bg-[#e6182a] active:scale-90 transition-all z-10 disabled:bg-slate-300 disabled:shadow-none"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          </button>
        )}
      </div>


      <AnimatePresence>
        {aiSuggestion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute left-4 right-4 bottom-full mb-2 z-20 bg-[#1a1c1c] text-white p-3 rounded-xl shadow-xl text-xs"
          >
            <p className="font-bold mb-1">Dica do Chef IA:</p>
            <p className="opacity-90">{aiSuggestion.gourmetDescription}</p>
            <div className="mt-2 pt-2 border-t border-white/20">
              <span className="opacity-75">Combina com: </span>
              <span className="font-bold">{aiSuggestion.pairingSuggestion}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};
