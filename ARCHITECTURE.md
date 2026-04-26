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
- **RF07:** Visualizar status das mesas (Livre, Ocupada, Aguardando Pagamento).

### Módulo: Pedidos
- **RF08:** Adicionar itens ao carrinho com observações (ex: Sem cebola).
- **RF09:** Enviar pedido para produção.
- **RF10:** Histórico de pedidos da comanda atual para o cliente.

### Módulo: Cozinha/Bar
- **RF11:** Painel de pedidos pendentes em ordem cronológica.
- **RF12:** Alterar status do pedido (Em Preparo, Pronto, Entregue).
- **RF13:** Impressão automática de tickets de produção (opcional/API).

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
- **RN05 (Pagamento):** A comanda só é considerada "Finalizada" após a confirmação total do pagamento (Soma dos pagamentos == Total da comanda).
- **RN06 (Segurança):** O QR Code deve conter um token de sessão para evitar que clientes acessem comandas de outras mesas manualmente via URL.

---

## 3. Fluxo Operacional Completo

1. **Chegada:** Cliente senta à mesa e escaneia o QR Code.
2. **Identificação:** O sistema identifica a mesa e abre a interface do cardápio.
3. **Escolha:** Cliente navega, seleciona itens e envia o pedido.
4. **Produção:** O pedido aparece instantaneamente no monitor da Cozinha (comida) ou Bar (bebidas).
5. **Entrega:** Garçom visualiza o status "Pronto" e entrega na mesa, marcando como "Entregue".
6. **Consumo:** Cliente pode repetir o processo de pedido quantas vezes desejar.
7. **Fechamento:** Cliente solicita o fechamento pelo celular.
8. **Pagamento:**
    - **Pix:** Sistema gera QR Code, cliente paga, API confirma, comanda fecha automaticamente.
    - **Balcão:** Cliente vai ao caixa, funcionário confirma valores e encerra manualmente.
9. **Liberação:** Mesa volta ao status "Livre".

---

## 4. Perfis de Usuário e Permissões

| Perfil | Permissões |
| :--- | :--- |
| **Cliente** | Visualizar cardápio, fazer pedidos, ver extrato da comanda, pagar via Pix. |
| **Garçom** | Ver status das mesas, entregar pedidos, abrir comandas manualmente. |
| **Cozinha/Bar** | Visualizar pedidos pendentes, alterar status para "Em Preparo" e "Pronto". |
| **Caixa** | Fechar comandas, registrar pagamentos manuais, estornar itens. |
| **Gerente** | Gerenciar cardápio (preços/estoque), relatórios financeiros, cancelar pedidos em preparo. |

---

## 5. Modelagem do Banco de Dados (Firestore/NoSQL)

### Coleção: `tables` (Mesas)
- `id`: string
- `number`: number
- `status`: enum (FREE, OCCUPIED, BILLING)
- `current_order_id`: string (FK)

### Coleção: `orders` (Comandas/Atendimentos)
- `id`: string
- `table_id`: string
- `customer_name`: string (opcional)
- `status`: enum (OPEN, CLOSED, PAID)
- `total_amount`: number
- `created_at`: timestamp
- `closed_at`: timestamp

### Coleção: `order_items` (Itens do Pedido)
- `id`: string
- `order_id`: string (FK)
- `product_id`: string (FK)
- `quantity`: number
- `unit_price`: number
- `observations`: string
- `status`: enum (PENDING, PREPARING, READY, DELIVERED, CANCELLED)
- `category`: string (para filtro cozinha/bar)
- `created_at`: timestamp

### Coleção: `products` (Cardápio)
- `id`: string
- `name`: string
- `description`: string
- `price`: number
- `category_id`: string
- `image_url`: string
- `is_available`: boolean
- `stock_quantity`: number

---

## 6. Status do Sistema

- **Mesa:** `Livre` -> `Ocupada` -> `Aguardando Conta` -> `Livre`.
- **Comanda:** `Aberta` -> `Encerrada` (Aguardando Pagamento) -> `Paga`.
- **Pedido (Item):** `Pendente` -> `Em Preparo` -> `Pronto` -> `Entregue`.

---

## 7. Fluxo de Pagamento

### Pagamento via Pix (Automático)
1. Cliente clica em "Pagar com Pix".
2. Backend solicita à API (ex: Mercado Pago, Efí) um QR Code Dinâmico.
3. Backend salva o `payment_id` vinculado à comanda.
4. Webhook da API de pagamento notifica o backend sobre o sucesso.
5. Backend altera status da comanda para `PAID` e libera a mesa.

### Pagamento Manual (Caixa)
1. Cliente solicita fechamento.
2. Operador de caixa seleciona a mesa.
3. Operador seleciona o método (Dinheiro/Cartão).
4. Operador confirma o recebimento.
5. Sistema emite cupom fiscal (opcional) e encerra a comanda.

---

## 8. Estrutura de APIs (Endpoints Principais)

### Cardápio
- `GET /api/products` - Lista produtos ativos.
- `GET /api/categories` - Lista categorias.

### Comandas/Mesas
- `GET /api/tables` - Status das mesas (Admin).
- `POST /api/orders/open` - Abre nova comanda (via QR Code).
- `GET /api/orders/:id/summary` - Extrato da comanda.

### Pedidos
- `POST /api/orders/:id/items` - Adiciona itens (Cliente).
- `PATCH /api/items/:id/status` - Altera status (Cozinha/Garçom).

### Financeiro
- `POST /api/payments/pix/generate` - Gera QR Code Pix.
- `POST /api/payments/manual` - Registra pagamento físico.
- `GET /api/reports/daily` - Resumo do dia (Gerente).

---

## 9. Arquitetura Recomendada

- **Frontend:** React.js (SPA) com Tailwind CSS.
- **Backend:** Node.js (Express) para lógica de negócios e integrações de pagamento.
- **Banco de Dados:** Firebase Firestore (Real-time é essencial para cozinha e status de mesa).
- **Autenticação:** Firebase Auth (Anônimo para clientes, Email/Senha para staff).
- **Infra:** Cloud Run (Escalabilidade) ou Vercel.

---

## 10. Definição de MVP e Ordem de Desenvolvimento

1. **Fase 1 (Estrutura):** Setup do Banco de Dados e Cadastro de Produtos/Mesas.
2. **Fase 2 (Cardápio):** Visualização do cardápio via leitura de QR Code (Mesa Fixa).
3. **Fase 3 (Pedidos):** Fluxo de carrinho e envio para o banco de dados.
4. **Fase 4 (Painel Produção):** Tela simplificada para Cozinha visualizar e marcar como pronto.
5. **Fase 5 (Fechamento):** Visualização do total da conta e encerramento manual pelo caixa.
6. **Fase 6 (Pagamento Digital):** Integração com API de Pix.
7. **Fase 7 (Relatórios):** Dashboard básico de vendas.
