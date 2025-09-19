# Diretório src/components

Este diretório contém os componentes React reutilizáveis que compõem a interface do usuário do LeadHunterAI. Eles são projetados para serem modulares e focados em uma única responsabilidade.

### Componentes Principais:

- `Layout.tsx`: Define a estrutura de layout principal da aplicação, incluindo cabeçalho, navegação e rodapé, envolvendo o conteúdo das páginas.
- `LeadConfigForm.tsx`: O formulário para configurar os parâmetros de busca de leads (nicho, região, quantidade, critérios, palavras-chave).
- `LeadResults.tsx`: Exibe os leads retornados pela IA em formato de tabela.
- `ScheduleGuide.tsx`: Um componente informativo ou de agendamento.
- `ContactForm.tsx`: O formulário de contato para solicitações de orçamento/acesso.
- `ProtectedRoute.tsx`: Um componente de rota que verifica a autenticação do usuário antes de renderizar rotas protegidas.

### Subdiretórios:

- `ui/`: Contém os componentes de UI genéricos do `shadcn-ui`, que são construídos sobre Radix UI e estilizados com Tailwind CSS. Estes são blocos de construção básicos como botões, inputs, cards, etc.

