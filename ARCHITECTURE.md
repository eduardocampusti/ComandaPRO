# Documentação Técnica: Comanda Digital Pro

## 1. Requisitos Funcionais por Módulo

### Módulo: Cardápio Digital
- **RF01:** Listar categorias de produtos (ex: Bebidas, Porções, Lanches).
- **RF02:** Listar produtos por categoria com foto, descrição e preço.
- **RF03:** Permitir busca de produtos por nome.
- **RF04:** Exibir disponibilidade de produtos em tempo real.

### Módulo: Mesas e Comandas
- **RF05:** Gerar QR Code único por mesa/comanda.
- **RF06:** Vincular cliente a uma comanda ativa via QR Code.
- **RF07:** Visualizar status das mesas (Livre, Ocupada, Reservada).

### Módulo: Pedidos
- **RF08:** Adicionar itens ao carrinho com observações (ex: Sem cebola).
- **RF09:** Enviar pedido para produção.
- **RF10:** Histórico de pedidos da comanda atual para o cliente.

### Módulo: Cozinha/Bar
- **RF11:** Painel de pedidos pendentes em ordem cronológica.
- **RF12:** Alterar status do pedido (Pendente, Preparo, Pronto, Entregue).
- **RF13:** Atualização em tempo real via Supabase Realtime.

### Módulo: Caixa e Pagamentos
- **RF14:** Fechamento de comanda com conferência de itens.
- **RF15:** Integração com API de Pix (geração de QR Code dinâmico).
- **RF16:** Registro de pagamentos manuais (Dinheiro, Cartão físico).

### Módulo: Fluxo de Caixa e Relatórios
- **RF17:** Relatório de vendas diário/mensal.
- **RF18:** Produtos mais vendidos.
- **RF19:** Ticket médio por comanda.

---

## 2. Regras de Negócio Detalhadas

- **RN01 (Abertura):** Uma comanda só pode ser aberta se a mesa estiver com status "Livre".
- **RN02 (Pedidos):** Clientes só podem fazer pedidos se a comanda estiver vinculada e ativa.
- **RN03 (Cancelamento):** Um pedido só pode ser cancelado pelo cliente se ainda não tiver entrado "Em Preparo". Após isso, apenas o Gerente pode cancelar.
- **RN04 (Estoque):** Se um produto atingir estoque zero, ele deve ser ocultado automaticamente do cardápio digital.
- **RN05 (Pagamento):** A comanda só é considerada "Finalizada" após a confirmação total do pagamento.
- **RN06 (Segurança):** O QR Code contém o ID da mesa, validado pelo sistema para evitar acessos indevidos.

---

## 3. Fluxo Operacional Completo

1. **Chegada:** Cliente senta à mesa e escaneia o QR Code.
2. **Identificação:** O sistema identifica a mesa e abre a interface do cardápio.
3. **Escolha:** Cliente navega, seleciona itens e envia o pedido.
4. **Produção:** O pedido aparece instantaneamente no monitor da Cozinha ou Bar.
5. **Entrega:** Garçom visualiza o status "Pronto" e entrega na mesa.
6. **Consumo:** Cliente pode repetir o processo de pedido.
7. **Fechamento:** Cliente solicita o fechamento pelo celular ou diretamente no caixa.
8. **Pagamento:**
    - **Pix:** Sistema gera QR Code via integração.
    - **Balcão:** Cliente paga no caixa e o funcionário encerra manualmente.
9. **Liberação:** Mesa volta ao status "Livre".

---

## 4. Perfis de Usuário e Permissões

| Perfil | Permissões |
| :--- | :--- |
| **Cliente** | Visualizar cardápio, fazer pedidos, ver extrato. |
| **Garçom** | Ver status das mesas, entregar pedidos, abrir mesas. |
| **Cozinha/Bar** | Visualizar pedidos pendentes, alterar status para "Preparo" e "Pronto". |
| **Caixa** | Fechar comandas, registrar pagamentos manuais. |
| **Gerente** | Gerenciar cardápio, relatórios financeiros, configurações do sistema. |

---

## 5. Modelagem do Banco de Dados (Supabase / PostgreSQL)

### Tabela: `tables` (Mesas)
- `id`: uuid (PK)
- `number`: integer
- `status`: enum (available, occupied, reserved)
- `capacity`: integer
- `current_session_id`: uuid (FK)

### Tabela: `sessions` (Sessões / Comandas)
- `id`: uuid (PK)
- `table_id`: uuid (FK)
- `status`: enum (active, closed)
- `opened_at`: timestamptz

### Tabela: `orders` (Pedidos)
- `id`: uuid (PK)
- `table_id`: uuid (FK)
- `items`: jsonb (Lista de itens do carrinho)
- `status`: enum (pending, preparing, ready, delivered, paid, etc.)
- `total_amount`: numeric
- `created_at`: timestamptz

### Tabela: `menu_items` (Cardápio)
- `id`: uuid (PK)
- `name`: text
- `description`: text
- `price`: numeric
- `category`: text
- `image_url`: text
- `available`: boolean

### Tabela: `settings` (Configurações)
- `id`: text (PK: 'general')
- `business_name`: text
- `theme_color`: text
- `logo_url`: text

---

## 6. Arquitetura Técnica

- **Frontend:** React 19 (Vite) + Tailwind CSS 4.
- **Backend:** Supabase (Auth + Database + Realtime).
- **Animações:** Motion (Framer Motion).
- **Ícones:** Lucide React.
- **Gráficos:** Recharts.
- **IA:** Google Gemini (IA generativa para suporte e sugestões).

---

## 7. MVP e Ordem de Desenvolvimento

1. **Fase 1 (Estrutura):** Setup Supabase e Tabelas. (Concluído)
2. **Fase 2 (Cardápio):** Visualização e Filtros. (Concluído)
3. **Fase 3 (Pedidos):** Fluxo de carrinho e persistência. (Concluído)
4. **Fase 4 (Cozinha):** Painel Realtime de produção. (Concluído)
5. **Fase 5 (Caixa):** Fechamento e Pagamentos. (Em progresso)
6. **Fase 6 (IA):** Integração com Gemini. (Pendente)
7. **Fase 7 (Relatórios):** Dashboards Gerenciais. (Pendente)

