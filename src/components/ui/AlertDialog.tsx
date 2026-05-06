
import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Button, cx } from './AppPrimitives';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'warning' | 'success';
  isLoading?: boolean;
}

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Continuar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  isLoading = false
}: AlertDialogProps) {
  const icons = {
    danger: <AlertTriangle className="h-6 w-6" />,
    warning: <AlertCircle className="h-6 w-6" />,
    success: <CheckCircle2 className="h-6 w-6" />,
    primary: <Info className="h-6 w-6" />,
  };

  const colors = {
    danger: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-100 dark:border-red-500/20",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
    success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
    primary: "bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary-400 border-primary/10 dark:border-primary-500/20",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:bg-slate-900 border border-white/20 dark:border-slate-800"
          >
            {/* Header with Icon */}
            <div className="flex flex-col items-center text-center">
              <div className={cx(
                "mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] border shadow-sm transition-transform duration-500 hover:scale-110",
                colors[variant]
              )}>
                {icons[variant]}
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  {title}
                </h3>
                <div className="mx-auto max-w-[280px] text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                onClick={onClose}
                disabled={isLoading}
                className="h-14 rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                {cancelLabel}
              </Button>
              <Button 
                variant={variant === 'danger' ? 'danger' : 'primary'} 
                onClick={onConfirm}
                isLoading={isLoading}
                className={cx(
                  "h-14 rounded-2xl shadow-lifted transition-all active:scale-95",
                  variant === 'warning' && "bg-amber-500 hover:bg-amber-600 text-white",
                  variant === 'success' && "bg-emerald-500 hover:bg-emerald-600 text-white"
                )}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
