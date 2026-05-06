import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cx } from './AppPrimitives';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs = ({ value, onValueChange, children, className }: TabsProps) => {
  return (
    <div className={cx("flex flex-col gap-6", className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { defaultValue: value, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const TabsList = ({ children, className, defaultValue, onValueChange }: TabsListProps) => {
  return (
    <div className={cx(
      "flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/50 p-1 dark:border-slate-800 dark:bg-slate-900/50 sm:self-start w-fit",
      className
    )}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeValue: defaultValue, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  activeValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  icon?: React.ElementType;
}

export const TabsTrigger = ({ value, children, activeValue, onValueChange, className, icon: Icon }: TabsTriggerProps) => {
  const isActive = activeValue === value;
  
  return (
    <button
      onClick={() => onValueChange?.(value)}
      className={cx(
        "relative flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold transition-all",
        isActive 
          ? "text-primary-700 dark:text-primary-200" 
          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
        className
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-slate-800"
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {Icon && <Icon className={cx("h-4 w-4 transition-colors", isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400")} />}
        {children}
      </span>
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  defaultValue?: string;
}

export const TabsContent = ({ value, children, defaultValue }: TabsContentProps) => {
  if (defaultValue !== value) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};
