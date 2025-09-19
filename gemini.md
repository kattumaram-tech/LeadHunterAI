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

## 4. Automação de Documentação e Dependências

Para garantir que a documentação (arquivos `README.md`) e as dependências (`requirements.txt`) estejam sempre atualizadas e consistentes, é recomendável implementar um processo de automação.

### Como Funciona:

Um script pode ser configurado para:
- Atualizar o `requirements.txt` com as versões exatas das dependências Python (`pip freeze`).
- Gerar ou atualizar o conteúdo dos arquivos `README.md` em todos os diretórios, refletindo a estrutura e funcionalidade atual do projeto.

### Implementação (Exemplo de Script Python):

Você pode criar um script Python na raiz do projeto (ex: `update_docs.py`) que execute essas tarefas. Este script pode ser:

- **Executado manualmente:** Antes de cada commit importante ou release.
- **Integrado a Hooks de Git:** Usando ferramentas como `pre-commit` para rodar o script automaticamente antes de cada commit.
- **Integrado a CI/CD:** Em plataformas como GitHub Actions, GitLab CI/CD, etc., para rodar o script em cada push ou pull request.

```python
# Exemplo de script Python (update_docs.py)
import os
import subprocess

def update_requirements():
    print("Atualizando backend/requirements.txt...")
    try:
        result = subprocess.run(
            ["pip", "freeze"],
            capture_output=True, text=True, check=True
        )
        with open("backend/requirements.txt", "w") as f:
            f.write(result.stdout)
        print("backend/requirements.txt atualizado com sucesso.")
    except subprocess.CalledProcessError as e:
        print(f"Erro ao atualizar requirements.txt: {e.stderr}")

def update_readme_files():
    print("Atualizando arquivos README.md...")
    # Aqui você adicionaria a lógica para gerar/atualizar o conteúdo de cada README.md
    # Isso pode ser feito lendo templates, ou gerando conteúdo dinamicamente com base na estrutura do projeto.
    # Por exemplo, para o README.md principal, você pode ter um template e preenchê-lo.
    # Para os READMEs de diretório, você pode ter uma função que lista os arquivos e subdiretórios.
    print("Arquivos README.md atualizados (lógica de geração precisa ser implementada aqui).")

if __name__ == "__main__":
    # Certifique-se de estar no diretório raiz do projeto ao executar este script
    update_requirements()
    update_readme_files()
    print("Processo de atualização de documentação concluído.")
```

### Próximos Passos:

1.  **Crie o script:** Salve o conteúdo acima em um arquivo como `update_docs.py` na raiz do seu projeto.
2.  **Implemente a lógica de `update_readme_files()`:** A parte mais complexa é a geração dinâmica dos `README.md`. Você pode usar bibliotecas Python para manipulação de arquivos e strings para isso.
3.  **Integre:** Escolha um método de automação (manual, hook de git, CI/CD) e configure-o para executar este script.
