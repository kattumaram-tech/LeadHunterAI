# Diretório Backend

Este diretório contém a aplicação FastAPI que serve como a API para o LeadHunterAI. Ele lida com:

- **Autenticação de Usuários:** Registro e login via JWT.
- **Gerenciamento de Dados:** Armazenamento de usuários, perfis de empresa e histórico de leads em um banco de dados SQLite.
- **Integração com Gemini AI:** Processa as requisições de busca de leads, constrói prompts avançados e interage com a API do Google Gemini.
- **Envio de E-mails:** Gerencia o envio de solicitações de contato.

### Arquivos Principais:

- `main.py`: O arquivo principal da aplicação FastAPI, contendo todas as rotas, lógica de negócio, configuração de banco de dados e integração com a IA.
- `requirements.txt`: Lista todas as dependências Python necessárias para o backend.
- `.env.example`: Um modelo para o arquivo de variáveis de ambiente `.env`, que deve ser criado e preenchido com suas chaves de API e credenciais de e-mail.
- `.env`: (Não versionado) Seu arquivo de variáveis de ambiente local.
- `database.db`: (Não versionado) O banco de dados SQLite gerado pela aplicação.

### Como Iniciar:

Para executar o backend, certifique-se de ter um ambiente virtual configurado e as dependências instaladas (conforme o `README.md` principal). Em seguida, execute:

```bash
python -m uvicorn backend.main:app --reload
```
