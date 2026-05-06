import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Tables from './pages/Tables';
import PublicMenu from './pages/PublicMenu';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Cashier from './pages/Cashier';
import Reports from './pages/Reports';
import MenuManagement from './pages/MenuManagement';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import StitchViewer from './pages/stitch/StitchViewer';
import DesignReview from './pages/DesignReview';
import StitchLayout from './components/stitch/StitchLayout';

export default function App() {
  return (
    <HashRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* ── Rotas públicas prioritárias ── */}
        <Route path="/cardapio/:tableId" element={<PublicMenu />} />
        <Route path="/cardapio" element={<PublicMenu />} />
        
        {/* Compatibilidade com links antigos */}
        <Route path="/order/:tableId" element={<PublicMenu />} />
        <Route path="/order" element={<PublicMenu />} />
        
        <Route path="/login" element={<Login />} />

        {/* ── Design Review ── */}
        <Route path="/design-review" element={<DesignReview />} />
        <Route path="/design/:screenId" element={<StitchViewer />} />

        {/* ── Rotas protegidas (Admin) ── */}
        <Route
          element={
            <ProtectedRoute>
              <StitchLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/cashier" element={<Cashier />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
}

