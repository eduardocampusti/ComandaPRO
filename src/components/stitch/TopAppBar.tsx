import React from 'react';

export default function TopAppBar() {
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 w-full h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 shadow-sm">
      <button className="text-slate-500 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
        <span className="material-symbols-outlined text-slate-900 dark:text-white">menu</span>
      </button>
      <div className="font-bold tracking-tighter text-primary flex items-center gap-1">
        <span className="material-symbols-outlined text-xl">restaurant</span>
        <span className="text-lg font-black">COMANDA PRO</span>
      </div>
      <button className="text-slate-500 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
        <span className="material-symbols-outlined text-slate-900 dark:text-white">notifications</span>
      </button>
    </header>
  );
}

