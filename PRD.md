# PRD — COMANDA PRO

## 1. Visão Geral do Produto

O **COMANDA PRO** é uma solução SaaS (Software as a Service) de gestão operacional para o setor de alimentação (bares, restaurantes, lanchonetes e food trucks). O sistema substitui as comandas de papel e processos manuais por um ecossistema digital integrado que conecta o cliente, o garçom, a cozinha e o caixa em tempo real.

- **O que é:** Uma plataforma de autoatendimento e gestão de pedidos ponta a ponta.
- **Problema central:** Lentidão no atendimento, erros na anotação de pedidos, falta de comunicação entre salão e cozinha, e dificuldade no controle financeiro.
- **Proposta de valor:** Digitalizar a jornada do cliente desde a entrada (QR Code) até o fechamento (Pagamento), otimizando a produtividade da equipe e aumentando o ticket médio através de inteligência operacional.
- **Diferencial:** Integração nativa com IA (Google Gemini) para sugestões inteligentes e arquitetura serverless de alta performance (Supabase).

## 2. Objetivo da Página/Sistema Atual

Com base na análise do codebase atual, o sistema encontra-se em um estágio avançado de MVP (Produto Mínimo Viável), com as fundações operacionais totalmente funcionais:

- **Objetivo Atual:** Oferecer uma plataforma onde o comerciante pode gerenciar mesas, visualizar pedidos na cozinha (KDS), controlar o fluxo de caixa e permitir que o cliente peça diretamente pelo celular.
- **Páginas Existentes:** Dashboard Administrativo, Gestão de Mesas, Cardápio Digital (Cliente), Painel de Cozinha (KDS), Caixa/Fechamento e Relatórios.
- **Jornada Principal:** Cliente escaneia QR Code -> Faz pedido -> Cozinha recebe e prepara -> Garçom entrega -> Caixa fecha a conta.
- **Status de Funcionalidade:** O core de pedidos e sincronização via Supabase Realtime está funcional. A parte de relatórios e configurações está implementada, enquanto a integração completa de pagamentos e IA está em fase de expansão.

## 3. Público-Alvo

- **Estabelecimentos:** Bares, Restaurantes, Lanchonetes, Hamburguerias, Pizzarias, Food Trucks, Quiosques e Cafeterias.
- **Porte:** Pequenos e médios comerciantes que buscam profissionalização e agilidade sem o custo de sistemas legados complexos.

## 4. Personas e Perfis de Acesso

| Persona | Objetivo | Principais ações no sistema | Nível de acesso |
|---|---|---|---|
| **Cliente da Mesa** | Realizar pedidos de forma autônoma e rápida. | Escanear QR Code, navegar no cardápio, adicionar ao carrinho, enviar pedidos, ver histórico. | Público (Via Link QR) |
| **Garçom/Atendente** | Apoiar o cliente e monitorar o status das mesas. | Abrir mesas, registrar pedidos manuais, monitorar status de entrega. | Autenticado (Staff) |
| **Cozinha/KDS** | Preparar os pedidos com eficiência e ordem. | Visualizar pedidos em tempo real, alterar status para "Preparo", "Pronto" e "Entregue". | Autenticado (Cozinha) |
| **Caixa** | Finalizar o atendimento e receber pagamentos. | Conferir itens da comanda, aplicar descontos, fechar conta, registrar pagamento. | Autenticado (Caixa) |
| **Gerente/Admin** | Gerir o negócio e tomar decisões baseadas em dados. | Cadastro de produtos/categorias, gerenciar usuários, visualizar relatórios, configurar sistema. | Autenticado (Admin) |

## 5. Proposta de Valor

- **Redução de Erros:** Elimina o erro de interpretação de letras em comandas de papel.
- **Agilidade:** O pedido chega na cozinha no instante em que o cliente confirma no celular.
- **Otimização de Equipe:** Garçons focam na entrega e experiência, não apenas em "tirar pedido".
- **Comunicação Fluida:** Sincronização em tempo real entre todos os módulos.
- **Aumento de Vendas:** Sugestões da IA e facilidade de pedir estimulam o consumo.
- **Gestão Data-Driven:** Relatórios precisos de vendas, produtos mais vendidos e ticket médio.

## 6. Estrutura Atual das Seções e Funcionalidades Existentes

| Área/Módulo | Arquivos ou componentes encontrados | Status | Observações |
|---|---|---|---|
| **Landing Page/Dashboard** | `Dashboard.tsx` | Implementado | Visão geral de vendas e status. |
| **Login/Autenticação** | `Auth.tsx`, `AuthContext.tsx` | Implementado | Login via Supabase Auth. |
| **Gestão de Mesas** | `Tables.tsx`, `TableCard.tsx` | Implementado | Visualização de mesas livres/ocupadas. |
| **Cardápio Digital** | `Order.tsx`, `MenuItemCard.tsx` | Implementado | Interface de pedido para o cliente. |
| **Pedidos (KDS)** | `Orders.tsx` | Implementado | Painel de produção com filtros de status. |
| **Caixa/Financeiro** | `Cashier.tsx`, `Cashier/` components | Implementado | Fechamento de contas e estatísticas. |
| **Relatórios** | `Reports.tsx` | Implementado | Gráficos de vendas e performance. |
| **Configurações** | `Settings.tsx` | Implementado | Personalização de tema e dados da empresa. |
| **Integração IA** | `gemini.ts` | Parcial | Base para sugestões gourmet pronta. |

## 7. Épicos do Produto

1. **Gestão de Estabelecimento:** Cadastro de dados, CNPJ, endereço e identidade visual.
2. **Gestão de Mesas:** Controle de layout, capacidade e status de ocupação.
3. **Cardápio Digital:** Organização por categorias, fotos, preços e disponibilidade.
4. **Autoatendimento via QR Code:** Link dinâmico para acesso direto por mesa.
5. **Gestão de Comandas:** Vínculo de sessões de consumo a mesas específicas.
6. **Gestão de Pedidos:** Fluxo completo do carrinho até a entrega.
7. **KDS para Cozinha:** Monitor de produção com tempos de preparo.
8. **Gestão de Caixa:** Abertura, fechamento e conferência de valores.
9. **Pagamentos:** Integração com meios de pagamento (Pix, Cartão).
10. **Relatórios e Indicadores:** BI para análise de faturamento e produtividade.
11. **Modo Rush:** Interface otimizada para períodos de alta demanda.

## 8. Histórias de Usuário

| Épico | História de Usuário | Prioridade | Status |
|---|---|---|---|
| Autoatendimento | Como cliente, quero escanear o QR Code da mesa para abrir o cardápio no meu celular sem baixar app. | Alta | Já existe |
| Pedidos | Como cliente, quero adicionar itens ao carrinho e enviar o pedido para a cozinha para agilizar meu atendimento. | Alta | Já existe |
| Gestão de Mesas | Como garçom, quero abrir uma comanda manualmente para clientes que não usam o celular. | Média | Já existe |
| KDS | Como cozinheiro, quero ver os pedidos em tempo real para organizar a ordem de preparo. | Alta | Já existe |
| KDS | Como cozinheiro, quero alterar o status do pedido para "Pronto" para notificar o garçom. | Alta | Já existe |
| Caixa | Como operador de caixa, quero fechar a conta de uma mesa para liberar o espaço e receber o pagamento. | Alta | Já existe |
| Relatórios | Como gerente, quero ver o faturamento diário para acompanhar a saúde financeira do negócio. | Alta | Já existe |
| IA | Como gerente, quero que o sistema sugira harmonizações para aumentar o ticket médio. | Baixa | Parcial |
| Modo Rush | Como cozinheiro, quero um modo de visualização condensada para agilizar a leitura em horários de pico. | Média | A fazer |

## 9. Funcionalidades Existentes x Funcionalidades Futuras

| Funcionalidade | Existe no código? | Evidência encontrada | Recomendação |
|---|---|---|---|
| QR Code por mesa | Sim | `qrcode.react` no package.json | Gerar QR Codes fixos para impressão. |
| Cardápio digital | Sim | `Order.tsx` | Melhorar descrições com IA. |
| Painel KDS | Sim | `Orders.tsx` | Adicionar alertas sonoros para novos pedidos. |
| Fechamento de conta | Sim | `Cashier.tsx` | Implementar divisão automática de conta. |
| Pagamento Pix | Sim (Parcial) | `RF15` na arquitetura | Integrar com gateways de pagamento real. |
| Dashboard gerencial | Sim | `Dashboard.tsx` | Adicionar comparação com períodos anteriores. |
| Notificações Realtime | Sim | Supabase Realtime | Implementar Push Notifications para Staff. |
| Upsell com IA | Parcial | `gemini.ts` | Exibir sugestões no carrinho do cliente. |

## 10. Métricas de Sucesso

- **Tempo Médio de Atendimento:** Tempo desde o escaneamento até o primeiro pedido.
- **Tempo Médio de Preparo:** Tempo que um pedido fica com status "Preparing".
- **Ticket Médio:** Valor médio gasto por comanda.
- **Taxa de Erro:** Número de pedidos cancelados ou estornados por erro de lançamento.
- **Giro de Mesa:** Quantidade de vezes que uma mesa é ocupada e liberada por dia.
- **Engajamento Digital:** Porcentagem de pedidos feitos pelo cliente vs. feitos pelo garçom.

## 11. Requisitos Funcionais

| Código | Requisito | Prioridade | Status |
|---|---|---|---|
| RF001 | O sistema deve gerar sessões únicas vinculadas a IDs de mesas. | Alta | Implementado |
| RF002 | O cliente deve conseguir filtrar produtos por categoria. | Alta | Implementado |
| RF003 | A cozinha deve receber atualizações sem necessidade de recarregar a página. | Alta | Implementado |
| RF004 | O sistema deve permitir o controle de estoque manual (disponível/indisponível). | Média | Implementado |
| RF005 | O caixa deve permitir a visualização detalhada de todos os itens antes do fechamento. | Alta | Implementado |

## 12. Requisitos Não Funcionais

| Código | Requisito | Descrição | Prioridade |
|---|---|---|---|
| RNF001 | Responsividade | O sistema deve ser perfeitamente funcional em dispositivos mobile e tablets. | Alta |
| RNF002 | Baixa Latência | Atualizações de status devem ocorrer em menos de 1 segundo (Realtime). | Alta |
| RNF003 | Segurança | Dados sensíveis de faturamento só podem ser acessados por administradores. | Alta |
| RNF004 | Disponibilidade | O sistema deve operar 24/7 com alta resiliência (Cloud Nativo). | Alta |

## 13. Roadmap Recomendado

| Fase | Objetivo | Entregas principais |
|---|---|---|
| **Fase 1** | Estabilidade do Core | Refatoração de estados globais e melhoria da UI/UX mobile. |
| **Fase 2** | Pagamentos Reais | Integração com PIX Dinâmico e Checkout de Cartão. |
| **Fase 3** | Inteligência de Vendas | Implementação ativa do Gemini para upsell e descrições gourmet. |
| **Fase 4** | Expansão Staff | Aplicativo dedicado para garçons com notificações push. |
| **Fase 5** | BI e Analytics | Dashboard avançado com exportação de relatórios em PDF/Excel. |
| **Fase 6** | Multi-loja | Suporte a redes de restaurantes com gestão centralizada. |
