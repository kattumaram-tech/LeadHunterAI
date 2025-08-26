# Arquitetura e Integração com Gemini

Este documento descreve a arquitetura do backend e como ele se integra com a API do Google Gemini para o projeto LeadHunterAI.

## 1. Backend (Python & FastAPI)

O diretório `backend` contém uma aplicação FastAPI que serve como a interface entre o frontend e a API do Gemini.

### Dependências

As dependências do backend estão listadas no arquivo `backend/requirements.txt`:
- `fastapi`: Para a criação do servidor web.
- `uvicorn`: Para executar o servidor FastAPI.
- `python-dotenv`: Para gerenciar as variáveis de ambiente (chave da API).
- `google-generativeai`: A biblioteca oficial do Google para a API Gemini.
- `fastapi-cors`: Para lidar com o Cross-Origin Resource Sharing (CORS).

### Variáveis de Ambiente

O backend requer um arquivo `.env` no diretório `backend` com a seguinte variável:
```
GEMINI_API_KEY="SUA_CHAVE_API_DO_GEMINI"
```

### API Endpoint

- **Endpoint:** `/api/search`
- **Método:** `POST`
- **Corpo da Requisição (Request Body):**
  ```json
  {
    "niche": "string",
    "region": "string",
    "quantity": "integer",
    "criteria": "string"
  }
  ```
- **Resposta de Sucesso (200):**
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "instagram": "string (opcional)",
      "website": "string (opcional)",
      "whatsapp": "string (opcional)",
      "contact": "string",
      "score": "integer"
    }
  ]
  ```
- **Resposta de Erro (500):**
  ```json
  {
    "detail": "Mensagem de erro"
  }
  ```

### Engenharia de Prompt

O backend constrói um prompt detalhado para o modelo `gemini-1.5-flash`, instruindo-o a atuar como um especialista em geração de leads. O prompt solicita um array JSON de leads com base no nicho, região e critérios fornecidos pelo usuário.

O prompt utilizado é:
```python
f"""
Aja como um especialista em prospecção de clientes e geração de leads B2B.

Sua tarefa é encontrar {request.quantity} empresas ou profissionais do nicho de '{request.niche}' na região de '{request.region}'.

Os leads ideais são aqueles com baixa presença digital, conforme os seguintes critérios: {request.criteria}.

Para cada lead, forneça as seguintes informações em um formato JSON aninhado e válido:
- id: um uuid v4 para identificar o lead.
- name: O nome da empresa/profissional.
- instagram: O link do perfil do Instagram (se encontrar).
- website: O link do website (se encontrar).
- whatsapp: O número do WhatsApp para contato (se encontrar).
- contact: Um número de telefone ou email de contato (obrigatório).
- score: Uma pontuação de 0 a 100 que representa o quão bem o lead se encaixa nos critérios de 'baixa presença digital'. Leads com pontuação mais alta são mais promissores.

O resultado final deve ser um único array JSON chamado 'leads' contendo os objetos de cada lead.
Exemplo de formato de saída:
{{
    "leads": [
        {{
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Exemplo de Empresa",
            "instagram": "https://instagram.com/exemplo",
            "website": "https://exemplo.com",
            "whatsapp": "+5561999998888",
            "contact": "contato@exemplo.com",
            "score": 85
        }}
    ]
}}
"""
```

## 2. Frontend (React & Vite)

### Integração com a API

- A função `handleFormSubmit` em `src/pages/Index.tsx` envia uma requisição `POST` para o endpoint `/api/search` utilizando `fetch`.
- O estado do componente (`leads`, `isLoading`, `showResults`) é atualizado com base na resposta do backend.

### Proxy do Servidor de Desenvolvimento

- O arquivo `vite.config.ts` foi modificado para incluir um proxy de servidor. Isso redireciona qualquer requisição feita para `/api` do servidor de desenvolvimento do frontend (ex: `localhost:8080`) para o servidor do backend (`localhost:8000`), evitando problemas de CORS durante o desenvolvimento.

```typescript
// Adicionado em vite.config.ts
server: {
  host: "::",
  port: 8080,
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  },
},
```

## 3. Desenvolvimento Local

Para executar o projeto localmente, é necessário usar o arquivo `vite.config.mts`, que é uma cópia do `vite.config.ts` sem a propriedade `base`. A propriedade `base` é usada para o deploy no GitHub Pages e causa problemas localmente.

Use o seguinte comando para iniciar o frontend localmente:

```bash
npm run dev:local
```

Este comando inicia o servidor de desenvolvimento Vite usando o arquivo de configuração correto para o ambiente local.