import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopAppBar from './TopAppBar';
import '../../styles/stitch-tokens.css';

interface StitchLayoutProps {
  children?: React.ReactNode;
}

export default function StitchLayout({ children }: StitchLayoutProps) {
  useEffect(() => {
    // Garantir que as fontes do Stitch e ícones estejam carregados
    // (Também estão no index.html, mas mantemos aqui por segurança)
    if (!document.getElementById('stitch-layout-fonts')) {
      const fonts = document.createElement('link');
      fonts.id = 'stitch-layout-fonts';
      fonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Plus+Jakarta+Sans:ital,wght@0,700;0,800;1,900&display=swap';
      fonts.rel = 'stylesheet';
      document.head.appendChild(fonts);
    }
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md text-body-md h-screen w-full flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 bg-surface-container-low h-full overflow-hidden">
        {/* TopAppBar - Mobile */}
        <TopAppBar />

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto w-full h-full relative">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

