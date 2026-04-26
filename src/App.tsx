import React from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LogOut, Sun, Moon, Settings as SettingsIcon, LayoutDashboard, LayoutGrid, Receipt, Store, Wallet, BarChart3 } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { useSettings } from './contexts/SettingsContext';
import Dashboard from './pages/Dashboard';
import Tables from './pages/Tables';
import Order from './pages/Order';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Cashier from './pages/Cashier';

import Reports from './pages/Reports';

import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings } = useSettings();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors duration-200">
        <div className="flex items-center gap-2">
          {settings.logoUrl ? (
            <img 
              src={settings.logoUrl} 
              alt="Logo" 
              className="h-10 object-contain rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} 
            />
          ) : (
            <div className="bg-primary-600 dark:bg-primary-500 p-2 rounded-lg">
              <Store className="text-white w-6 h-6" />
            </div>
          )}
          <h1 className="text-xl font-bold tracking-tight ml-2">{settings.businessName}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-2 mr-4 border-r border-slate-200 dark:border-slate-700 pr-4">
            <Link to="/" className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link to="/tables" className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
              <LayoutGrid className="w-5 h-5" />
              <span className="text-sm font-medium">Mesas</span>
            </Link>
            <Link to="/orders" className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              <span className="text-sm font-medium">Cozinha</span>
            </Link>
            <Link to="/cashier" className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <span className="text-sm font-medium">Caixa</span>
            </Link>
            <Link to="/reports" className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Relatórios</span>
            </Link>
            <Link to="/settings" className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Ajustes</span>
            </Link>
          </nav>
          
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Alternar tema"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{user?.email?.split('@')[0] || 'Usuário'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
              {(user?.email?.charAt(0) || 'U').toUpperCase()}
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-2"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex overflow-x-auto">
        <Link to="/" className="p-3 text-slate-500 hover:text-emerald-600 flex-1 text-center border-r border-slate-100 dark:border-slate-700">
          <LayoutDashboard className="w-5 h-5 mx-auto" />
        </Link>
        <Link to="/tables" className="p-3 text-slate-500 hover:text-emerald-600 flex-1 text-center border-r border-slate-100 dark:border-slate-700">
          <LayoutGrid className="w-5 h-5 mx-auto" />
        </Link>
        <Link to="/orders" className="p-3 text-slate-500 hover:text-emerald-600 flex-1 text-center border-r border-slate-100 dark:border-slate-700">
          <Receipt className="w-5 h-5 mx-auto" />
        </Link>
        <Link to="/cashier" className="p-3 text-slate-500 hover:text-emerald-600 flex-1 text-center border-r border-slate-100 dark:border-slate-700">
          <Wallet className="w-5 h-5 mx-auto" />
        </Link>
        <Link to="/reports" className="p-3 text-slate-500 hover:text-emerald-600 flex-1 text-center border-r border-slate-100 dark:border-slate-700">
          <BarChart3 className="w-5 h-5 mx-auto" />
        </Link>
        <Link to="/settings" className="p-3 text-slate-500 hover:text-emerald-600 flex-1 text-center">
          <SettingsIcon className="w-5 h-5 mx-auto" />
        </Link>
      </div>

      {children}

      <footer className="mt-12 border-t border-slate-200 dark:border-slate-700 py-8 px-6 text-center text-slate-400 dark:text-slate-500 text-sm transition-colors">
        <p>&copy; 2026 {settings.businessName}</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/order/:tableId" element={<Order />} />

        {/* AUTH ROUTE */}
        <Route path="/login" element={<Auth />} />

        {/* PROTECTED ROUTES */}
        <Route path="/" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/orders" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Orders />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/cashier" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Cashier />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Reports />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/tables" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Tables />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Settings />
            </ProtectedLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
