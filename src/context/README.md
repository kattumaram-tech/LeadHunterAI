# Diretório src/context

Este diretório contém os Contextos React que são usados para gerenciar estados globais da aplicação, tornando-os acessíveis a múltiplos componentes sem a necessidade de passar props manualmente em cada nível da árvore de componentes.

### Contextos:

- `AuthContext.tsx`: Fornece o contexto de autenticação para a aplicação. Ele gerencia o token JWT do usuário, o estado de login/logout e oferece funções para autenticar e desautenticar usuários. Componentes podem usar o hook `useAuth` para acessar este contexto.
