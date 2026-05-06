
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { Button, IconButton, StatusBadge, cx } from '../ui/AppPrimitives';
import { 
  MenuItemData, 
  CategoryData, 
  MenuItemOptionData,
  createMenuItem, 
  updateMenuItem,
  fetchMenuItemOptions,
  saveMenuItemOption,
  updateMenuItemOption,
  deleteMenuItemOption
} from '../../lib/database';
import { ImageUploader } from './ImageUploader';
import { AnimatePresence, motion } from 'motion/react';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: MenuItemData | null;
  categories: CategoryData[];
  onSuccess: () => void;
}

export function ProductModal({ isOpen, onClose, product, categories, onSuccess }: ProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'options'>('basic');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Basic info state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [available, setAvailable] = useState(true);
  const [trackStock, setTrackStock] = useState(false);
  const [stockQuantity, setStockQuantity] = useState('0');
  const [stockAlertThreshold, setStockAlertThreshold] = useState('10');
  const [auxField, setAuxField] = useState('');

  // Options state
  const [options, setOptions] = useState<MenuItemOptionData[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setName(product.name);
        setDescription(product.description || '');
        setPrice(product.price.toString());
        setCategoryId(product.category_id || '');
        setImageUrl(product.image_url || '');
        setAvailable(product.available);
        setTrackStock(product.track_stock || false);
        setStockQuantity((product.stock_quantity || 0).toString());
        setStockAlertThreshold((product.stock_alert_threshold || 10).toString());
        loadOptions(product.id);
      } else {
        setName('');
        setDescription('');
        setPrice('');
        setCategoryId(categories.length > 0 ? categories[0].id : '');
        setImageUrl('');
        setAvailable(true);
        setTrackStock(false);
        setStockQuantity('0');
        setStockAlertThreshold('10');
        setAuxField('');
        setOptions([]);
      }
      setActiveTab('basic');
    }
  }, [isOpen, product, categories]);

  const loadOptions = async (productId: string) => {
    setLoadingOptions(true);
    try {
      const data = await fetchMenuItemOptions(productId);
      setOptions(data);
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
    } finally {
      setLoadingOptions(false);
    }
  };
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setError('O nome do produto é obrigatório');
      return;
    }

    if (!price || isNaN(Number(price))) {
      setError('Preço inválido');
      return;
    }

    if (!categoryId) {
      setError('Selecione uma categoria');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    try {
      const category = categories.find(c => c.id === categoryId)?.name || '';
      
      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category_id: categoryId,
        category: category,
        image_url: imageUrl,
        available,
        track_stock: trackStock,
        stock_quantity: trackStock ? Number(stockQuantity) : null,
        stock_alert_threshold: trackStock ? Number(stockAlertThreshold) : null,
        is_archived: false
      };

      let savedProductId = product?.id;

      if (product) {
        await updateMenuItem(product.id, productData);
      } else {
        const newProduct = await createMenuItem(productData);
        savedProductId = newProduct.id;
      }

      // Save options
      if (savedProductId && options.length > 0) {
        for (const opt of options) {
          if (opt.id.startsWith('temp_')) {
            await saveMenuItemOption({
              menu_item_id: savedProductId,
              name: opt.name,
              price: opt.price,
              type: opt.type,
              group_name: opt.group_name || undefined,
              min_select: opt.min_select,
              max_select: opt.max_select,
              sort_order: opt.sort_order,
              active: opt.active
            });
          } else {
            await updateMenuItemOption(opt.id, {
              name: opt.name,
              price: opt.price,
              type: opt.type,
              group_name: opt.group_name || undefined,
              min_select: opt.min_select,
              max_select: opt.max_select,
              sort_order: opt.sort_order,
              active: opt.active
            });
          }
        }
      }

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      setError('Falha ao salvar produto. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addOption = () => {
    const newOption: MenuItemOptionData = {
      id: `temp_${Date.now()}`,
      menu_item_id: product?.id || '',
      name: '',
      price: 0,
      type: 'addon',
      group_name: '',
      min_select: 0,
      max_select: null,
      sort_order: options.length,
      active: true
    };
    setOptions([...options, newOption]);
  };

  const updateOption = (id: string, field: keyof MenuItemOptionData, value: any) => {
    setOptions(options.map(opt => {
      if (opt.id === id) {
        const newOpt = { ...opt, [field]: value };
        // Apply logic rules when type changes
        if (field === 'type') {
          if (value === 'size') {
            newOpt.min_select = 1;
            newOpt.max_select = 1;
            if (!newOpt.group_name) newOpt.group_name = 'Tamanho';
          } else if (value === 'choice') {
            newOpt.min_select = 1;
            newOpt.max_select = 1;
            if (!newOpt.group_name) newOpt.group_name = 'Escolhas';
          } else if (value === 'addon') {
            newOpt.min_select = 0;
            newOpt.max_select = null;
            if (!newOpt.group_name) newOpt.group_name = 'Adicionais';
          }
        }
        return newOpt;
      }
      return opt;
    }));
  };

  const removeOption = async (id: string) => {
    if (!id.startsWith('temp_')) {
      try {
        await deleteMenuItemOption(id);
      } catch (error) {
        toast.error('Erro ao remover opcional');
        return;
      }
    }
    setOptions(options.filter(opt => opt.id !== id));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Editar Produto' : 'Novo Produto'}
      size="premium"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Dados Validados
            </p>
          </div>
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting} 
              className="h-10 flex-1 rounded-lg border border-[#E5E7EB] px-4 text-[13px] font-bold text-[#6B7280] transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 sm:flex-none"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              form="product-form"
              disabled={isSubmitting}
              className="group relative h-10 flex-[2] overflow-hidden rounded-lg bg-[#EF4444] px-6 text-[13px] font-bold text-white shadow-soft transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 sm:flex-none sm:px-8"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                   <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
                )}
                <span>
                  {isSubmitting ? 'Salvando...' : (
                    <>
                      <span className="sm:hidden">Confirmar</span>
                      <span className="hidden sm:inline">Salvar Produto</span>
                    </>
                  )}
                </span>
              </div>
            </button>
          </div>
        </div>
      }
    >
      <div className="mb-6 flex border-b border-[#f0f0f0] dark:border-slate-800">
        <button
          onClick={() => setActiveTab('basic')}
          className={cx(
            "relative pb-3 text-[13px] font-bold uppercase tracking-wider transition-colors px-1",
            activeTab === 'basic' 
              ? "text-[#EF4444]" 
              : "text-[#9CA3AF] hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          Informações Gerais
          {activeTab === 'basic' && (
            <div className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[#EF4444]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('options')}
          className={cx(
            "relative ml-8 pb-3 text-[13px] font-bold uppercase tracking-wider transition-colors px-1",
            activeTab === 'options' 
              ? "text-[#EF4444]" 
              : "text-[#9CA3AF] hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          Personalização
          {activeTab === 'options' && (
            <div className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[#EF4444]" />
          )}
        </button>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="space-y-6 pb-20">
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            >
              <Alert 
                variant="success" 
                title="Produto Salvo!" 
                description="As alterações foram aplicadas com sucesso ao cardápio."
              />
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'basic' ? (
          <div className="space-y-5">
            <div className="flex items-start gap-5">
              <div className="shrink-0">
                <ImageUploader 
                  variant="premium"
                  value={imageUrl} 
                  onChange={setImageUrl} 
                  className="h-20 w-20 rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-100 dark:ring-slate-800"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: X-Bacon Artesanal"
                      className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-normal text-[#111827] transition-all placeholder:text-slate-400 focus:border-[#EF4444] focus:outline-none focus:ring-[3px] focus:ring-red-500/5 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                      Categoria
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-normal text-[#111827] transition-all focus:border-[#EF4444] focus:outline-none focus:ring-[3px] focus:ring-red-500/5 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      required
                    >
                      <option value="" disabled>Selecione...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-normal text-[#111827] transition-all placeholder:text-slate-400 focus:border-[#EF4444] focus:outline-none focus:ring-[3px] focus:ring-red-500/5 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                      Campo Auxiliar
                    </label>
                    <input
                      type="text"
                      value={auxField}
                      onChange={(e) => setAuxField(e.target.value)}
                      placeholder="Ex: 500g, Unidade"
                      className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-normal text-[#111827] transition-all placeholder:text-slate-400 focus:border-[#EF4444] focus:outline-none focus:ring-[3px] focus:ring-red-500/5 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                Descrição do Produto
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ingredientes e detalhes do produto..."
                className="w-full rounded-lg border border-[#E5E7EB] bg-white p-3 text-[14px] font-normal text-[#111827] transition-all placeholder:text-slate-400 focus:border-[#EF4444] focus:outline-none focus:ring-[3px] focus:ring-red-500/5 dark:border-slate-700 dark:bg-slate-900 dark:text-white min-h-[60px] max-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2 rounded-xl border border-[#f0f0f0] bg-slate-50/30 p-1 dark:border-slate-800 dark:bg-slate-900/30">
              <div className={cx(
                "flex h-14 items-center justify-between rounded-lg px-4 transition-all",
                available ? "bg-emerald-50/50 dark:bg-emerald-950/10" : "bg-white dark:bg-slate-900"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cx(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    available ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                  )}>
                    <Save className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={cx(
                      "text-[13px] font-bold transition-colors",
                      available ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
                    )}>
                      Disponível para Venda
                    </p>
                    <p className="text-[11px] font-medium text-[#9CA3AF]">Mostrar no cardápio digital</p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input 
                    type="checkbox" 
                    className="peer sr-only" 
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                  />
                  <div className="peer h-5 w-9 rounded-full bg-slate-200 transition-all after:absolute after:left-[2px] after:top-[2px] after:h-[16px] after:w-[16px] after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-4 dark:bg-slate-700"></div>
                </label>
              </div>

              <div className={cx(
                "flex h-14 items-center justify-between rounded-lg px-4 transition-all",
                trackStock ? "bg-red-50/50 dark:bg-red-950/10" : "bg-white dark:bg-slate-900"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cx(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    trackStock ? "bg-red-100 text-[#EF4444] dark:bg-red-900/30" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                  )}>
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={cx(
                      "text-[13px] font-bold transition-colors",
                      trackStock ? "text-red-700 dark:text-red-400" : "text-slate-700 dark:text-slate-300"
                    )}>
                      Controle de Estoque
                    </p>
                    <p className="text-[11px] font-medium text-[#9CA3AF]">Gerenciamento automático</p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input 
                    type="checkbox" 
                    className="peer sr-only" 
                    checked={trackStock}
                    onChange={(e) => setTrackStock(e.target.checked)}
                  />
                  <div className="peer h-5 w-9 rounded-full bg-slate-200 transition-all after:absolute after:left-[2px] after:top-[2px] after:h-[16px] after:w-[16px] after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-[#EF4444] peer-checked:after:translate-x-4 dark:bg-slate-700"></div>
                </label>
              </div>

              {trackStock && (
                <div className="grid grid-cols-2 gap-4 bg-transparent p-4 pt-2 animate-in fade-in slide-in-from-top-1 dark:bg-transparent">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-normal text-[#111827] transition-all focus:border-[#EF4444] focus:outline-none focus:ring-[3px] focus:ring-red-500/5 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      required={trackStock}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                      Alerta Mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stockAlertThreshold}
                      onChange={(e) => setStockAlertThreshold(e.target.value)}
                      className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-normal text-[#111827] transition-all focus:border-[#EF4444] focus:outline-none focus:ring-[3px] focus:ring-red-500/5 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      required={trackStock}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-[#f0f0f0] bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white">Opções e Adicionais</p>
                <p className="text-[11px] font-medium text-[#9CA3AF]">Configure variações como tamanhos e acompanhamentos.</p>
              </div>
              <button 
                type="button" 
                onClick={addOption} 
                className="inline-flex h-[32px] items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:bg-slate-800 active:scale-95 dark:bg-slate-100 dark:text-slate-900"
              >
                <Plus className="h-3.5 w-3.5" />
                Nova Opção
              </button>
            </div>

            {loadingOptions ? (
              <div className="flex py-12 justify-center">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#DC2626] border-t-transparent" />
              </div>
            ) : options.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E5E7EB] py-10 text-center dark:border-slate-800">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
                  <Plus className="h-5 w-5 text-[#9CA3AF]" />
                </div>
                <p className="text-[13px] font-medium text-[#9CA3AF]">Nenhum opcional configurado ainda.</p>
              </div>
            ) : (
              <div className="space-y-3 pb-2">
                {options.map((opt) => (
                  <div key={opt.id} className="group/opt rounded-xl border border-[#E5E7EB] bg-white p-4 transition-all hover:border-[#DC2626]/30 dark:border-slate-800 dark:bg-slate-950">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex flex-1 items-center gap-3">
                        <div className="cursor-grab text-slate-300 hover:text-slate-400 active:cursor-grabbing">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                            Nome da Opção
                          </label>
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => updateOption(opt.id, 'name', e.target.value)}
                            placeholder="Ex: Bacon extra"
                            className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-normal text-[#111827] transition-all placeholder:text-slate-400 focus:border-[#EF4444] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-end gap-2">
                        <IconButton 
                          icon={Trash2} 
                          tone="danger" 
                          label="Remover" 
                          onClick={() => removeOption(opt.id)}
                          className="h-9 w-9 rounded-lg border border-red-100 bg-red-50/30 text-red-500 transition-colors hover:bg-red-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                          Preço Adicional (R$)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#9CA3AF]">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={opt.price}
                            onChange={(e) => updateOption(opt.id, 'price', Number(e.target.value))}
                            className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 text-[14px] font-normal text-[#111827] transition-all focus:border-[#EF4444] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                          Tipo de Seleção
                        </label>
                        <select
                          value={opt.type}
                          onChange={(e) => updateOption(opt.id, 'type', e.target.value)}
                          className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-normal text-[#111827] transition-all focus:border-[#EF4444] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                          <option value="addon">Adicional (Opcional)</option>
                          <option value="size">Tamanho (Obrigatório)</option>
                          <option value="choice">Escolha Única</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <label className="flex cursor-pointer items-center gap-2">
                        <div className="relative flex h-5 w-5 items-center justify-center">
                          <input
                            type="checkbox"
                            checked={opt.active}
                            onChange={(e) => updateOption(opt.id, 'active', e.target.checked)}
                            className="peer h-full w-full cursor-pointer appearance-none rounded-md border border-[#E5E7EB] transition-all checked:bg-[#EF4444] checked:border-[#EF4444] dark:border-slate-700"
                          />
                          <Save className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                        </div>
                        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">Opção Ativa</span>
                      </label>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.06em] text-[#9CA3AF]">Grupo</label>
                        <input
                          type="text"
                          value={opt.group_name || ''}
                          onChange={(e) => updateOption(opt.id, 'group_name', e.target.value)}
                          placeholder="Ex: Coberturas"
                          className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-normal text-[#111827] transition-all placeholder:text-slate-400 focus:border-[#EF4444] focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.06em] text-[#9CA3AF]">Mín.</label>
                        <input
                          type="number"
                          min="0"
                          value={opt.min_select !== undefined ? opt.min_select : 0}
                          onChange={(e) => updateOption(opt.id, 'min_select', parseInt(e.target.value) || 0)}
                          className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-normal text-[#111827] transition-all focus:border-[#EF4444] focus:outline-none disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          disabled={opt.type === 'size'}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.06em] text-[#9CA3AF]">Máx.</label>
                        <input
                          type="number"
                          min="1"
                          value={opt.max_select || ''}
                          onChange={(e) => updateOption(opt.id, 'max_select', e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="∞"
                          className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-normal text-[#111827] transition-all focus:border-[#EF4444] focus:outline-none disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          disabled={opt.type === 'size'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </form>

    </Modal>
  );
}
