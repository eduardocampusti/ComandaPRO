import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userEmail = user?.email?.split('@')[0] || 'Admin';

  const menuItems = [
    { label: 'Painel', path: '/', icon: 'dashboard' },
    { label: 'Pedidos', path: '/orders', icon: 'receipt_long' },
    { label: 'Mesas', path: '/tables', icon: 'restaurant' },
    { label: 'Caixa', path: '/cashier', icon: 'payments' },
    { label: 'Cardápio', path: '/menu', icon: 'restaurant_menu' },
    { label: 'Relatórios', path: '/reports', icon: 'bar_chart' },
    { label: 'Configurações', path: '/settings', icon: 'settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen p-6 space-y-2 w-72 border-r bg-white/95 dark:bg-slate-950/95 border-slate-200/50 dark:border-slate-800 z-40 relative flex-shrink-0 shadow-[4px_0_24px_rgba(15,23,42,0.02)]">
      <div className="mb-8 px-2 pt-4">
        <h1 className="text-primary font-black text-2xl tracking-tighter mb-10 flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">restaurant</span>
          COMANDA PRO
        </h1>
        <div className="flex items-center gap-3 mb-8 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <img 
            alt="Admin User" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD06E6l4tNvJ2WbyGxtThYIr4A-FJynGePITg-ekloVtCHQ60kLfG3cYq0ZzXeWoLdcN3uRkLafGmwezZ4Eorgq2w6q_EfIAECCp_31nNO_OmFQoYoaT_33ivBZv25qdH7ccEQOF8KhlVcRR4pYRt6Iax3P3cO1Le9SfYuAuSiVxyHRpKlY-IMWYa__ISc31j2E7Z_kKnVsV_uH8g6RFqkC7SIvvyBdCe-S3NoZnL7kxCye_4DYT6yTYfv0wlPCV6G9veO44V46rrs"
          />
          <div className="overflow-hidden">
            <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{userEmail}</div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Administrador</div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-primary text-white shadow-[0_10px_25px_rgba(220,38,38,0.25)] font-bold translate-x-1' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:translate-x-1'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary transition-colors'}`}>
                {item.icon}
              </span>
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg hover:translate-x-1 transition-transform duration-200 ease-in-out"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

