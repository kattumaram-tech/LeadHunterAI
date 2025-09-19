# Diretório Frontend (src)

Este diretório contém o código-fonte da aplicação frontend do LeadHunterAI, construída com React, TypeScript e Vite. É a interface que o usuário interage para configurar buscas, visualizar leads, gerenciar seu perfil e histórico.

### Arquivos Principais:

- `App.tsx`: O componente raiz da aplicação, responsável pela configuração do roteamento (React Router DOM), provedores de contexto (autenticação, toast) e layout geral.
- `main.tsx`: O ponto de entrada da aplicação React, onde o componente `App` é renderizado no DOM.
- `index.css`: O arquivo CSS principal que importa as classes do Tailwind CSS e define estilos globais.
- `vite-env.d.ts`: Arquivo de declaração de tipos para o ambiente Vite.

### Subdiretórios:

- `assets/`: Contém imagens e outros recursos estáticos.
- `components/`: Componentes React reutilizáveis, incluindo os componentes de UI do `shadcn-ui`.
- `context/`: Provedores de contexto React para gerenciar estados globais, como autenticação.
- `hooks/`: Hooks React personalizados para lógica reutilizável.
- `lib/`: Funções utilitárias e de ajuda.
- `pages/`: Componentes React que representam as diferentes páginas da aplicação.

### Como Iniciar:

Para executar o frontend, certifique-se de ter as dependências do Node.js instaladas (conforme o `README.md` principal). Em seguida, execute na raiz do projeto:

```bash
npm run dev:local
```
