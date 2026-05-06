# SPEC — COMANDA PRO

## 1. Visão Técnica Geral

O **COMANDA PRO** é uma aplicação web moderna construída com a stack **React + Vite**, utilizando **TypeScript** para garantir segurança de tipos e manutenibilidade. A arquitetura segue o modelo de aplicação de página única (SPA) com roteamento via `HashRouter` para compatibilidade simplificada com hospedagem estática.

- **Arquitetura de Dados:** Utiliza **Supabase** como backend-as-a-service (BaaS), integrando Banco de Dados PostgreSQL, Autenticação e sincronização em tempo real (Realtime).
- **Gerenciamento de Estado:** Baseado em **React Context API** para estados globais (Auth, Theme, Settings) e hooks customizados para interação com o banco de dados.
- **Estilização:** Utiliza **Tailwind CSS 4**, aproveitando as novas funcionalidades de configuração via CSS e performance otimizada.
- **Segurança:** Implementação de **Row Level Security (RLS)** no PostgreSQL via Supabase, garantindo que usuários anônimos (clientes) possam apenas ler itens necessários e criar pedidos, enquanto funções administrativas exigem autenticação.

## 2. Stack Tecnológico

| Camada | Tecnologia | Versão detectada | Uso no projeto |
|---|---|---|---|
| **Core** | React | ^19.0.0 | Framework principal da UI. |
| **Bundler** | Vite | ^6.2.0 | Ferramenta de build e dev server. |
| **Linguagem** | TypeScript | ~5.8.2 | Tipagem estática em todo o projeto. |
| **Estilização** | Tailwind CSS | ^4.1.14 | Framework CSS utilitário. |
| **Backend/DB** | Supabase | ^2.104.1 | DB, Auth e Realtime. |
| **Animações** | Motion | ^12.38.0 | Transições e micro-interações suaves. |
| **Ícones** | Lucide React | ^0.546.0 | Conjunto de ícones vetoriais. |
| **IA** | Google Gemini | ^1.46.0 | Sugestões gourmet e harmonizações. |
| **Gráficos** | Recharts | ^3.8.1 | Dashboards e relatórios visuais. |
| **Roteamento** | React Router | ^7.13.1 | Navegação entre páginas. |
| **QR Code** | qrcode.react | ^4.2.0 | Geração dinâmica de QR Codes para mesas. |

## 3. Estrutura de Pastas

```text
/src
  /components          # Componentes reutilizáveis
    /Cashier           # Modals e listas específicos do caixa
    /Order             # Cards e controles do fluxo de pedido cliente
    Auth.tsx           # UI de login/cadastro
    ProtectedRoute.tsx # Componente de proteção de rotas
  /contexts            # Contextos de estado global (Auth, Theme, Settings)
  /lib                 # Configurações de bibliotecas externas
    database.ts        # Helper para operações complexas no DB
    gemini.ts          # Integração com a API do Google Gemini
    supabase.ts        # Inicialização do cliente Supabase
  /pages               # Páginas completas da aplicação
    Cashier.tsx        # Módulo de faturamento
    Dashboard.tsx      # Resumo administrativo
    Order.tsx          # Interface do cliente (menu)
    Orders.tsx         # Painel KDS (Cozinha)
    Reports.tsx        # Relatórios financeiros
    Settings.tsx       # Configurações do sistema
    Tables.tsx         # Gestão de mesas
  /types               # Definições de interfaces TypeScript
  /utils               # Funções auxiliares (formatadores, validadores)
  App.tsx              # Definição de rotas e layout principal
  main.tsx             # Ponto de entrada da aplicação
  index.css            # Estilos globais e Tailwind
```

## 4. Integrações e Fluxo de Dados

- **Supabase Realtime:** Utilizado nas páginas de `Orders` (Cozinha) e `Tables` para garantir que a equipe veja novos pedidos e mudanças de status instantaneamente sem refresh.
- **Google Gemini AI:** Configurado para receber nome e descrição de pratos e retornar objetos JSON formatados com descrições "gourmetizadas" e sugestões de harmonização.
- **LocalStorage:** Utilizado para persistência de tema (light/dark) e preferências locais simples.

## 5. Modelo de Dados (Supabase/PostgreSQL)

O esquema está definido no arquivo `supabase-schema.sql` e inclui as seguintes tabelas principais:

- **tables:** Controla o estado das mesas (`available`, `occupied`, `reserved`).
- **sessions:** Gerencia a "comanda" ativa de uma mesa específica.
- **menu_items:** Armazena o cardápio (preço, categoria, disponibilidade).
- **orders:** Registra cada pedido individual, contendo um JSONB com os itens.
- **settings:** Tabela de chave-valor para configurações globais do estabelecimento.
- **reservations:** Sistema de agendamento de mesas.

## 6. Considerações de Performance e Segurança

- **Performance:** O uso do Tailwind 4 e React 19 garante um bundle leve e renderização eficiente.
- **Segurança (RLS):** 
    - `menu_items`: Leitura pública, escrita autenticada.
    - `orders`: Inserção pública (para clientes pedirem), leitura pública (via ID), atualização autenticada (para cozinha mudar status).
    - `settings`: Leitura pública, escrita autenticada.
