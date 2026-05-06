
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { CategoryData, createCategory, updateCategory } from '../../lib/database';
import { AnimatePresence, motion } from 'motion/react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryData | null;
  onSuccess: () => void;
}

export function CategoryModal({ isOpen, onClose, category, onSuccess }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(category?.name || '');
      setShowSuccess(false);
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('O nome da categoria é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      if (category) {
        await updateCategory(category.id, { name: name.trim() });
      } else {
        await createCategory(name.trim());
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Falha ao salvar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Editar Categoria' : 'Nova Categoria'}
      size="premium"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Pronto para salvar
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
              form="category-form"
              disabled={isSubmitting}
              className="group relative h-10 flex-[2] overflow-hidden rounded-lg bg-[#EF4444] px-6 text-[13px] font-bold text-white shadow-soft transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 sm:flex-none sm:px-8"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
                )}
                <span>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</span>
              </div>
            </button>
          </div>
        </div>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-6 pb-12">
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            >
              <Alert 
                variant="success" 
                title="Categoria Salva!" 
                description="As alterações foram aplicadas com sucesso."
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
            Nome da Categoria
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Hambúrgueres, Bebidas, Sobremesas"
            className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-normal text-[#111827] transition-all placeholder:text-slate-400 focus:border-[#EF4444] focus:outline-none focus:ring-[3px] focus:ring-red-500/5 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            autoFocus
            required
          />
          <p className="text-[11px] font-medium text-slate-400">
            Use nomes curtos e objetivos para facilitar a navegação no cardápio.
          </p>
        </div>
      </form>
    </Modal>
  );
}

