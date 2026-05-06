---
page: kds
---
Crie uma tela de Kitchen Display System (KDS) para o Comanda Pro Digital 2026. Esta tela será usada em tablets ou monitores na cozinha para gerenciar pedidos em tempo real.

**ESTRUTURA DA PÁGINA:**
1. **Header:** Título "Cozinha", relógio em tempo real, filtros por status (Pendente, Em Preparo, Pronto) e botão de configurações.
2. **Grade de Pedidos:** Cards de pedidos organizados por tempo de espera (mais antigos primeiro).
   - Cada card deve mostrar: Número da mesa, Lista de itens com quantidades, Observações (em destaque se houver), Tempo decorrido.
   - Ações no card: Botão "Iniciar Preparo" (Primary) e "Marcar como Pronto" (Success/Green).
3. **Sidebar Opcional:** Resumo de itens totais a serem preparados (ex: "10x Hambúrguer Clássico").

**REGRAS DO SISTEMA DE DESIGN (OBRIGATÓRIO):**
- **Cores:** Use Primary (#bb001b) para ações principais. Use Secondary (#5f5e5e) para textos informativos. Use Amber (#795600) para alertas de tempo (pedidos atrasados).
- **Tipografia:** Plus Jakarta Sans para cabeçalhos e números de mesa. Inter para lista de itens e observações.
- **Elevação:** Use Level 1 shadows para os cards de pedido sobre o fundo Surface (#f9f9f9).
- **Socratic Reminder:** Não use divisores de 1px se puder usar espaçamento ou tonalidades de superfície.

**DESIGN SYSTEM BLOCK:**
```markdown
## Brand & Style
This design system centers on a "Crave-First" philosophy, blending Corporate Modern efficiency with high-energy visual cues.

## Colors
- Primary (Vibrant Red): #bb001b
- Secondary (Deep Charcoal): #5f5e5e
- Accent (Amber): #795600
- Neutral/Background: #f9f9f9

## Elevation & Depth
- Level 0 (Background): #f9f9f9
- Level 1 (Cards): #ffffff with soft shadow (0px 4px 20px rgba(0,0,0,0.05))

## Shapes
- Standard Elements: 8px (0.5rem) radius.
```
