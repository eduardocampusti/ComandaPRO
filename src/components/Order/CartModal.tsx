import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CartItem } from '../../lib/database';
import { cx } from '../ui/AppPrimitives';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  unpaidOrdersTotal: number;
  onUpdateQuantity: (id: string, delta: number) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onRemove: (id: string) => void;
  onSubmit: () => void;
  onCheckout: () => void;
  isSubmitting: boolean;
}

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  unpaidOrdersTotal,
  onUpdateQuantity,
  onUpdateNotes,
  onRemove,
  onSubmit,
  onCheckout,
  isSubmitting,
}) => {
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalGeral = cartTotal + unpaidOrdersTotal;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:p-6">
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
            transition={{ type: 'spring', damping: 28, stiffness: 230 }}
            role="dialog"
            aria-modal="true"
            aria-label="Meu carrinho"
            className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[40px] bg-background shadow-2xl dark:bg-zinc-950 sm:mx-auto sm:max-w-md sm:rounded-[40px]"
          >
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-surface-container-highest dark:bg-zinc-800" />
            </div>

            <header className="sticky top-0 z-10 border-b border-surface-container bg-background/95 px-6 py-5 backdrop-blur-xl dark:border-zinc-900 dark:bg-zinc-950/95">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/20">
                    <span className="material-symbols-outlined font-bold">shopping_bag</span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-plus-jakarta-sans text-xl font-[800] tracking-tight text-on-surface dark:text-white uppercase leading-none">
                      Meu carrinho
                    </h2>
                    <p className="mt-1 font-inter text-xs font-medium text-on-surface-variant">
                      {itemCount} {itemCount === 1 ? 'item selecionado' : 'itens selecionados'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar carrinho"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-all hover:bg-surface-container-high active:scale-90"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 hide-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface-container text-surface-container-highest dark:bg-zinc-900">
                    <span className="material-symbols-outlined text-5xl">shopping_cart_off</span>
                  </div>
                  <h3 className="font-plus-jakarta-sans text-xl font-extrabold text-on-surface dark:text-white uppercase">
                    Seu carrinho está vazio
                  </h3>
                  <p className="mt-2 font-inter text-sm text-on-surface-variant">
                    Escolha um item do cardápio para começar seu pedido.
                  </p>
                  <button 
                    type="button" 
                    onClick={onClose} 
                    className="mt-8 flex items-center gap-2 rounded-full border-2 border-surface-container px-6 py-3 font-plus-jakarta-sans text-sm font-black text-on-surface transition-all hover:bg-surface-container active:scale-95 dark:border-zinc-800 dark:text-zinc-200"
                  >
                    Voltar ao cardápio
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <article
                      key={item.cart_item_id}
                      className="group overflow-hidden rounded-3xl border-2 border-surface-container bg-surface-container-lowest p-5 transition-all hover:border-surface-container-highest dark:border-zinc-900 dark:bg-zinc-900/40"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-plus-jakarta-sans text-[16px] font-extrabold tracking-tight text-on-surface dark:text-white uppercase leading-tight">
                            {item.name}
                          </h3>
                          <p className="mt-1 font-plus-jakarta-sans text-[15px] font-black text-primary-600 dark:text-primary-400">
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemove(item.cart_item_id)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-container/50 text-error transition-all hover:bg-error-container active:scale-90 dark:bg-error/10"
                        >
                          <span className="material-symbols-outlined text-xl">delete_outline</span>
                        </button>
                      </div>

                      <div className="mt-4 space-y-4">
                        {item.options && item.options.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.options.map(opt => (
                              <span 
                                key={opt.id} 
                                className="inline-flex items-center rounded-lg bg-surface-container px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-on-surface-variant dark:bg-zinc-800 dark:text-zinc-400"
                              >
                                {opt.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                            sticky_note_2
                          </span>
                          <input
                            type="text"
                            placeholder="Alguma observação? (ex: sem cebola)"
                            value={item.notes || ''}
                            onChange={(event) => onUpdateNotes(item.cart_item_id, event.target.value)}
                            className="w-full rounded-2xl bg-surface-container py-3 pl-11 pr-4 font-inter text-sm font-medium text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:bg-zinc-900/50"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="font-inter text-[11px] font-black uppercase tracking-widest text-on-surface-variant/60">
                            Quantidade
                          </span>
                          <div className="flex items-center gap-1 rounded-2xl border-2 border-surface-container bg-surface-container-lowest p-1 dark:border-zinc-800 dark:bg-zinc-900">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.cart_item_id, -1)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors active:scale-90"
                            >
                              <span className="material-symbols-outlined text-lg">remove</span>
                            </button>
                            <span className="w-8 text-center font-plus-jakarta-sans text-base font-black text-on-surface dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.cart_item_id, 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors active:scale-90"
                            >
                              <span className="material-symbols-outlined text-lg">add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <footer className="border-t border-surface-container bg-background/95 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 backdrop-blur-xl dark:border-zinc-900 dark:bg-zinc-950/95">
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-inter text-sm font-medium text-on-surface-variant">Subtotal</span>
                  <span className="font-plus-jakarta-sans font-bold text-on-surface dark:text-white">{formatCurrency(cartTotal)}</span>
                </div>
                {unpaidOrdersTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-sm font-medium text-on-surface-variant">Pedidos anteriores</span>
                    <span className="font-plus-jakarta-sans font-bold text-on-surface dark:text-white">
                      {formatCurrency(unpaidOrdersTotal)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t-2 border-dashed border-surface-container dark:border-zinc-900">
                  <span className="font-plus-jakarta-sans text-base font-extrabold text-on-surface dark:text-white uppercase">
                    Total Geral
                  </span>
                  <span className="font-plus-jakarta-sans text-3xl font-black text-primary-600 dark:text-primary-400">
                    {formatCurrency(totalGeral)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={cart.length === 0 || isSubmitting}
                  className={cx(
                    "relative flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary-600 px-6 font-plus-jakarta-sans text-base font-black text-white shadow-xl shadow-primary-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale",
                    isSubmitting && "cursor-wait"
                  )}
                >
                  {isSubmitting ? (
                    <span className="h-6 w-6 rounded-full border-3 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined font-bold">check_circle</span>
                      <span>Enviar Pedido para Cozinha</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onCheckout}
                  disabled={totalGeral === 0 || isSubmitting}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-on-surface bg-on-surface px-6 font-plus-jakarta-sans text-base font-black text-white transition-all hover:bg-on-surface/90 active:scale-[0.98] disabled:opacity-30 dark:bg-white dark:text-on-surface dark:border-white"
                >
                  <span className="material-symbols-outlined">payments</span>
                  <span>Pedir Conta / Pagar via Pix</span>
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 font-inter text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant/40">
                <span className="material-symbols-outlined text-sm">bolt</span>
                Seu pedido é enviado em tempo real
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
