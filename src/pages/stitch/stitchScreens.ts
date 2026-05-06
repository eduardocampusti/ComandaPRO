// Registry centralizado de todas as telas do Google Stitch
// Cada entrada mapeia: id (URL slug) → folder (nome da pasta em public/design-stitch/)

import React from 'react';
import DashboardStitch from './screens/DashboardStitch';
import CaixaStitch from './screens/CaixaStitch';
import LoginStitch from './screens/LoginStitch';
import MesasStitch from './screens/MesasStitch';
import KDStitch from './screens/KDStitch';
import ReportsStitch from './screens/ReportsStitch';
import SettingsStitch from './screens/SettingsStitch';
import AdminStitch from './screens/AdminStitch';
import LoginMobileStitch from './screens/LoginMobileStitch';
import MenuWebStitch from './screens/MenuWebStitch';
import CardapioListaStitch from './screens/CardapioListaStitch';
import ProductDetailStitch from './screens/ProductDetailStitch';
import CartStitch from './screens/CartStitch';
import OrderStatusStitch from './screens/OrderStatusStitch';
import VibrantStitch from './screens/VibrantStitch';

export interface StitchScreen {
  id: string;
  folder: string;
  label: string;
  description: string;
  deviceType: 'desktop' | 'mobile' | 'both';
  component?: React.ComponentType;
}

export const STITCH_SCREENS: StitchScreen[] = [
  {
    id: 'dashboard',
    folder: 'dashboard_administrativo_comanda_pro',
    label: 'Dashboard Administrativo',
    description: 'Visão geral com KPIs, gráficos de vendas e pedidos recentes',
    deviceType: 'desktop',
    component: DashboardStitch,
  },
  {
    id: 'caixa',
    folder: 'caixa_e_fechamento_comanda_pro',
    label: 'Caixa e Fechamento',
    description: 'Operações de caixa, fechamento de mesa e formas de pagamento',
    deviceType: 'desktop',
    component: CaixaStitch,
  },
  {
    id: 'mesas',
    folder: 'gest_o_de_mesas_comanda_pro',
    label: 'Gestão de Mesas',
    description: 'Mapa visual de mesas com status em tempo real',
    deviceType: 'desktop',
    component: MesasStitch,
  },
  {
    id: 'kds',
    folder: 'kds_cozinha_comanda_pro',
    label: 'KDS Cozinha',
    description: 'Kitchen Display System — fila de preparo por setor',
    deviceType: 'desktop',
    component: KDStitch,
  },
  {
    id: 'relatorios',
    folder: 'relat_rios_gerenciais_comanda_pro',
    label: 'Relatórios Gerenciais',
    description: 'Análise de faturamento, produtos e desempenho',
    deviceType: 'desktop',
    component: ReportsStitch,
  },
  {
    id: 'configuracoes',
    folder: 'configura_es_do_sistema_comanda_pro',
    label: 'Configurações do Sistema',
    description: 'Dados do estabelecimento, integração e preferências',
    deviceType: 'desktop',
    component: SettingsStitch,
  },
  {
    id: 'painel',
    folder: 'painel_administrativo',
    label: 'Painel Administrativo',
    description: 'Painel de controle para administrador do sistema',
    deviceType: 'desktop',
    component: AdminStitch,
  },
  {
    id: 'login-desktop',
    folder: 'login_desktop',
    label: 'Login Desktop',
    description: 'Tela de autenticação para acesso ao painel administrativo',
    deviceType: 'desktop',
    component: LoginStitch,
  },
  {
    id: 'login-mobile',
    folder: 'login_mobile',
    label: 'Login Mobile',
    description: 'Tela de autenticação otimizada para dispositivos móveis',
    deviceType: 'mobile',
    component: LoginMobileStitch,
  },
  {
    id: 'cardapio-web',
    folder: 'card_pio_digital_web_comanda_pro',
    label: 'Cardápio Digital Web',
    description: 'Cardápio digital para cliente via QR Code (desktop)',
    deviceType: 'both',
    component: MenuWebStitch,
  },
  {
    id: 'cardapio-lista',
    folder: 'card_pio_digital_lista',
    label: 'Cardápio — Lista',
    description: 'Visualização em lista dos itens do cardápio',
    deviceType: 'mobile',
    component: CardapioListaStitch,
  },
  {
    id: 'produto',
    folder: 'detalhes_do_produto',
    label: 'Detalhes do Produto',
    description: 'Modal/página com detalhes do item selecionado',
    deviceType: 'mobile',
    component: ProductDetailStitch,
  },
  {
    id: 'carrinho',
    folder: 'meu_carrinho',
    label: 'Meu Carrinho',
    description: 'Resumo do pedido antes de confirmar',
    deviceType: 'mobile',
    component: CartStitch,
  },
  {
    id: 'status-pedido',
    folder: 'status_do_pedido',
    label: 'Status do Pedido',
    description: 'Acompanhamento em tempo real do pedido pelo cliente',
    deviceType: 'mobile',
    component: OrderStatusStitch,
  },
  {
    id: 'vibrant',
    folder: 'vibrant_gourmet',
    label: 'Vibrant Gourmet',
    description: 'Theme alternativo — Vibrant Gourmet color scheme',
    deviceType: 'both',
    component: VibrantStitch,
  },
];

export function getScreenById(id: string): StitchScreen | undefined {
  return STITCH_SCREENS.find((s) => s.id === id);
}

export function getPublicPath(screen: StitchScreen): string {
  return `/design-stitch/${screen.folder}/index.html`;
}

export function getScreenshotPath(screen: StitchScreen): string {
  return `/design-stitch/${screen.folder}/screen.png`;
}
