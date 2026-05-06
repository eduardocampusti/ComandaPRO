import React, { useState, useEffect } from 'react';
import LoginStitch from './stitch/screens/LoginStitch';
import LoginMobileStitch from './stitch/screens/LoginMobileStitch';

/**
 * Página de Login principal do sistema, agora utilizando o design Stitch.
 * Alterna dinamicamente entre os designs Desktop e Mobile conforme a largura da tela.
 */
export default function Login() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <LoginMobileStitch /> : <LoginStitch />;
}
