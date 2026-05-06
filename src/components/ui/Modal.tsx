
import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cx } from './AppPrimitives';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'premium';
}

const sizes = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  premium: 'sm:max-w-[560px]',
};

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  footer,
  size = 'md'
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex h-[100dvh] flex-col justify-end sm:justify-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 230 }}
              role="dialog"
              aria-modal="true"
              className={cx(
                "relative flex max-h-[96dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:mx-auto sm:rounded-2xl sm:max-h-[min(90dvh,850px)]",
                sizes[size]
              )}
            >
              {/* Mobile handle */}
              <div className="flex justify-center pt-3 sm:hidden">
                <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>

              <header className={cx(
                "flex items-center justify-between gap-4 px-6 py-4 dark:border-slate-800",
                size === 'premium' ? "border-b border-[#f0f0f0]" : "border-b border-slate-100"
              )}>
                <div className="min-w-0">
                  <h2 className={cx(
                    "font-display leading-tight text-slate-950 dark:text-white",
                    size === 'premium' ? "text-[17px] font-bold" : "text-xl font-black"
                  )}>
                    {title}
                  </h2>
                  {description && (
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                      {description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className={cx(
                "flex-1 overflow-y-auto scrollbar-hide",
                size === 'premium' ? "p-6" : "px-6 py-4 sm:py-6"
              )}>
                {children}
              </div>

              {footer && (
                <footer className={cx(
                  "shrink-0 bg-white/80 backdrop-blur-md dark:bg-slate-900/80",
                  size === 'premium' 
                    ? "border-t border-[#f0f0f0] px-6 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]" 
                    : "border-t border-slate-100 px-6 py-5 pb-[calc(env(safe-area-inset-bottom,24px)+1.5rem)] sm:py-5 sm:pb-6"
                )}>
                  {footer}
                </footer>
              )}
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
