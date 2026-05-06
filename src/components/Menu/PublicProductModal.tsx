import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItemData, CartItemOption, CartItem, MenuItemOptionData } from '../../lib/database';
import { cx } from '../ui/AppPrimitives';
import toast from 'react-hot-toast';

interface PublicProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: MenuItemData | null;
  onAddToCart: (item: CartItem) => void;
  primaryColorHex: string;
}

export function PublicProductModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  primaryColorHex,
}: PublicProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});

  // Reset state when opening a new product
  React.useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setNotes('');
      setSelectedOptions({});
    }
  }, [isOpen, product]);

  const options = product?.options || [];
  
  // Group options dynamically
  const optionGroups = useMemo(() => {
    const groups: Record<string, { id: string, title: string, type: string, items: MenuItemOptionData[], min: number, max: number | null }> = {};
    
    options.forEach(opt => {
      // Determine group identifier and title
      const groupId = opt.group_name || opt.type;
      const title = opt.group_name || (opt.type === 'size' ? 'Tamanhos' : opt.type === 'choice' ? 'Escolhas' : 'Adicionais');
      
      if (!groups[groupId]) {
        groups[groupId] = {
          id: groupId,
          title,
          type: opt.type,
          items: [],
          min: opt.min_select !== undefined ? opt.min_select : (opt.type === 'addon' ? 0 : 1),
          max: opt.max_select !== undefined ? opt.max_select : (opt.type === 'size' || opt.type === 'choice' ? 1 : null)
        };
      }
      groups[groupId].items.push(opt);
    });
    
    return Object.values(groups);
  }, [options]);

  const handleOptionToggle = (optionId: string, groupId: string, maxSelect: number | null) => {
    const isCurrentlySelected = selectedOptions[optionId];
    
    if (isCurrentlySelected) {
      // Unselect
      setSelectedOptions(prev => {
        const next = { ...prev };
        delete next[optionId];
        return next;
      });
      return;
    }

    // Try to select
    setSelectedOptions(prev => {
      const next = { ...prev };
      
      // Count currently selected in this group
      const groupItems = optionGroups.find(g => g.id === groupId)?.items || [];
      const selectedInGroup = groupItems.filter(item => next[item.id]);

      if (maxSelect !== null && selectedInGroup.length >= maxSelect) {
        if (maxSelect === 1) {
          // If max is 1, auto-unselect the previous one
          selectedInGroup.forEach(item => delete next[item.id]);
        } else {
          // If max > 1, prevent selection
          toast.error(`Você pode selecionar no máximo ${maxSelect} opções deste grupo.`);
          return prev;
        }
      }
      
      next[optionId] = true;
      return next;
    });
  };

  const isValid = useMemo(() => {
    for (const group of optionGroups) {
      const selectedCount = group.items.filter(item => selectedOptions[item.id]).length;
      if (selectedCount < group.min) {
        return false;
      }
    }
    return true;
  }, [optionGroups, selectedOptions]);

  const calculateTotal = () => {
    if (!product) return 0;
    let total = product.price;
    Object.keys(selectedOptions).forEach(optId => {
      if (selectedOptions[optId]) {
        const opt = options.find(o => o.id === optId);
        if (opt) total += opt.price;
      }
    });
    return total * quantity;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItemOptions: CartItemOption[] = Object.keys(selectedOptions)
      .filter(id => selectedOptions[id])
      .map(id => {
        const opt = options.find(o => o.id === id)!;
        return {
          id: opt.id,
          name: opt.name,
          price: opt.price
        };
      });

    const cartItem: CartItem = {
      cart_item_id: crypto.randomUUID(),
      menu_item_id: product.id,
      name: product.name,
      price: product.price + cartItemOptions.reduce((sum, o) => sum + o.price, 0),
      quantity,
      notes: notes.trim() || undefined,
      options: cartItemOptions
    };

    onAddToCart(cartItem);
    onClose();
  };

  const renderOptionGroup = (group: typeof optionGroups[0]) => {
    if (group.items.length === 0) return null;
    
    const selectedCount = group.items.filter(item => selectedOptions[item.id]).length;
    const isMissingRequired = selectedCount < group.min;
    
    return (
      <div className="mb-8" key={group.id}>
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-plus-jakarta-sans text-base font-extrabold text-on-surface dark:text-white uppercase tracking-tight">
              {group.title}
            </h4>
            <p className="font-inter text-xs font-medium text-on-surface-variant">
              {group.min > 0 && group.max === group.min
                ? `Escolha ${group.min}`
                : group.min > 0
                  ? `Escolha de ${group.min} a ${group.max || 'ilimitado'}`
                  : group.max
                    ? `Escolha até ${group.max}`
                    : `Opcional`}
            </p>
          </div>
          {isMissingRequired && (
            <span className="rounded-full bg-error-container px-3 py-1 text-[10px] font-black uppercase tracking-wider text-error dark:bg-error/20">
              Obrigatório
            </span>
          )}
        </div>
        
        <div className="space-y-3">
          {group.items.map(opt => (
            <label 
              key={opt.id}
              className={cx(
                "group flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all duration-200 active:scale-[0.98]",
                selectedOptions[opt.id] 
                  ? "border-primary-500 bg-primary-50/30 dark:border-primary-800 dark:bg-primary-900/10" 
                  : "border-surface-container bg-surface-container-lowest hover:border-surface-container-highest dark:border-zinc-800 dark:bg-zinc-900/50"
              )}
            >
              <div className="flex items-center gap-4">
                <div 
                  className={cx(
                    "flex h-6 w-6 items-center justify-center border-2 transition-all duration-200",
                    group.max !== 1 ? "rounded-lg" : "rounded-full", 
                    selectedOptions[opt.id] 
                      ? "border-primary-500 bg-primary-500" 
                      : "border-surface-container-highest bg-white dark:border-zinc-700 dark:bg-zinc-800"
                  )}
                  style={selectedOptions[opt.id] ? { backgroundColor: primaryColorHex, borderColor: primaryColorHex } : {}}
                >
                  {selectedOptions[opt.id] && (
                    <span className="material-symbols-outlined text-[16px] font-bold text-white">
                      {group.max !== 1 ? 'check' : 'radio_button_checked'}
                    </span>
                  )}
                </div>
                <span className="font-inter text-[15px] font-semibold text-on-surface dark:text-zinc-200">
                  {opt.name}
                </span>
              </div>
              {opt.price > 0 && (
                <span className="font-plus-jakarta-sans text-sm font-bold text-primary-600 dark:text-primary-400">
                  + R$ {opt.price.toFixed(2)}
                </span>
              )}
              <input 
                type={group.max !== 1 ? "checkbox" : "radio"}
                className="sr-only"
                checked={!!selectedOptions[opt.id]}
                onChange={() => handleOptionToggle(opt.id, group.id, group.max)}
              />
            </label>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-on-surface/40 backdrop-blur-[8px]"
        />
        
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="relative flex h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[40px] bg-background shadow-2xl dark:bg-zinc-950 sm:h-[85vh] sm:rounded-[40px]"
        >
          {/* Header Image */}
          <div className="relative h-56 w-full shrink-0 bg-surface-container dark:bg-zinc-900">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-surface-container-highest/50">
                  restaurant
                </span>
              </div>
            )}
            
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xl transition-all hover:bg-white/30 active:scale-90"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            {/* Visual indicator for modal handle on mobile */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-white/30 backdrop-blur-md sm:hidden" />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 hide-scrollbar">
            <div className="space-y-4">
              <h3 className="font-plus-jakarta-sans text-3xl font-[800] tracking-tight text-on-surface dark:text-white leading-none">
                {product.name}
              </h3>
              
              {product.description && (
                <p className="font-inter text-[15px] leading-relaxed text-on-surface-variant dark:text-zinc-400">
                  {product.description}
                </p>
              )}
              
              <div className="flex items-center gap-3 pt-2">
                <span className="font-plus-jakarta-sans text-2xl font-black text-primary-600 dark:text-primary-400">
                  R$ {product.price.toFixed(2)}
                </span>
                {product.track_stock && (
                  <span className={cx(
                    "rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider",
                    (product.stock_quantity || 0) <= (product.stock_alert_threshold || 10)
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-500"
                  )}>
                    {product.stock_quantity} em estoque
                  </span>
                )}
              </div>
            </div>

            <div className="my-8 h-px w-full bg-surface-container dark:bg-zinc-800" />

            {/* Options */}
            {optionGroups.map(group => renderOptionGroup(group))}

            {/* Notes */}
            <div className="mb-8">
              <h4 className="mb-4 font-plus-jakarta-sans text-base font-extrabold text-on-surface dark:text-white uppercase tracking-tight">
                Alguma observação?
              </h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Tirar cebola, ponto da carne..."
                className="w-full rounded-3xl bg-surface-container p-5 font-inter text-sm font-medium text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary-500/20 outline-none transition-all min-h-[120px] resize-none dark:bg-zinc-900 dark:text-zinc-200"
                maxLength={200}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-surface-container bg-background/95 p-6 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95">
            <div className="flex items-center gap-4">
              <div className="flex h-14 items-center justify-between rounded-2xl border-2 border-surface-container bg-surface-container-lowest px-2 dark:border-zinc-800 dark:bg-zinc-900">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors active:scale-90 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="w-10 text-center font-plus-jakarta-sans text-lg font-extrabold text-on-surface dark:text-white">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.track_stock && quantity >= (product.stock_quantity || 0)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container disabled:opacity-30 transition-colors active:scale-90 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!isValid}
                className={cx(
                  "flex h-14 flex-1 items-center justify-between rounded-2xl px-6 font-plus-jakarta-sans text-base font-black text-white shadow-xl transition-all",
                  isValid ? "hover:scale-[1.02] active:scale-[0.98] shadow-primary-500/20" : "opacity-50 cursor-not-allowed grayscale"
                )}
                style={isValid ? { backgroundColor: primaryColorHex } : {}}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">shopping_cart</span>
                  <span>Adicionar</span>
                </div>
                <span className="text-lg">R$ {calculateTotal().toFixed(2)}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
