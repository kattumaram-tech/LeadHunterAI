# LeadHunterAI

LeadHunterAI é uma aplicação full-stack que utiliza a Inteligência Artificial do Google Gemini para encontrar leads de negócios (clientes potenciais) com base em critérios definidos pelo usuário. A aplicação conta com um sistema de autenticação de usuários e um formulário para solicitação de orçamento.

![LeadHunterAI Screenshot](https://i.imgur.com/rS42y4p.png)

## ✨ Funcionalidades

- **Autenticação de Usuários:** Sistema de registro e login para acesso à plataforma.
- **Banco de Dados SQLite:** Armazenamento seguro de informações de usuários.
- **Formulário de Contato:** Permite que visitantes enviem solicitações de orçamento ou acesso, com notificação por e-mail.
- **Busca Avançada de Leads:**
  - Define um nicho, região e quantidade de leads (até 300) para a IA buscar.
  - Especifica critérios de baixa presença digital em linguagem natural.
  - Utiliza palavras-chave para incluir ou excluir resultados, refinando a busca.
- **Resultados Detalhados:** Recebe uma lista de leads com nome, contato e um score de qualificação gerado pela IA.

## 🚀 Stack de Tecnologias

- **Frontend:**
  - **Framework:** React com Vite
  - **Linguagem:** TypeScript
  - **Roteamento:** React Router DOM
  - **Estilização:** Tailwind CSS
  - **Componentes UI:** shadcn-ui

- **Backend:**
  - **Framework:** FastAPI
  - **Linguagem:** Python
  - **Banco de Dados:** SQLite
  - **Autenticação:** Passlib com Bcrypt
  - **Servidor:** Uvicorn

- **Inteligência Artificial:**
  - **API:** Google Gemini

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
- [Python](https://www.python.org/downloads/) (versão 3.9 ou superior)
- `npm` (incluso no Node.js)

## ⚙️ Instalação e Execução

Siga os passos abaixo para configurar e executar o projeto localmente.

**1. Clone o Repositório**

```bash
git clone https://github.com/seu-usuario/LeadHunterAI.git
cd LeadHunterAI
```

**2. Configure o Backend**

O backend gerencia os usuários, a busca com IA e o envio de e-mails.

```bash
# 1. Navegue até a pasta do backend
cd backend

# 2. Crie e ative um ambiente virtual (recomendado)
python -m venv .venv
# No Windows:
.venv\Scripts\activate
# No macOS/Linux:
source .venv/bin/activate

# 3. Instale as dependências do Python
pip install -r requirements.txt

# 4. Crie e configure o arquivo de ambiente
# Copie o .env.example para .env
copy .env.example .env
# ou no macOS/Linux: cp .env.example .env
```

**5. Preencha o arquivo `.env`** com as seguintes informações:
   - `GEMINI_API_KEY`: Sua chave da API do Google Gemini.
   - `EMAIL_HOST`: Endereço do seu servidor SMTP (ex: "smtp.gmail.com").
   - `EMAIL_PORT`: A porta do servidor SMTP (ex: 587).
   - `EMAIL_USERNAME`: O e-mail que fará o envio das mensagens.
   - `EMAIL_PASSWORD`: A senha de aplicação do seu e-mail. **(Importante: use uma senha de app, não sua senha principal)**.

**3. Configure o Frontend**

```bash
# Volte para a raiz do projeto
cd ..

# Instale as dependências do Node.js
npm install
```

**4. Execute a Aplicação**

Você precisará de **dois terminais** abertos simultaneamente.

- **Terminal 1: Iniciar o Backend**

```bash
# A partir da raiz do projeto, inicie o servidor FastAPI
python -m uvicorn backend.main:app --reload

# O backend estará rodando em http://127.0.0.1:8000
# O banco de dados 'database.db' será criado automaticamente.
```

- **Terminal 2: Iniciar o Frontend**

```bash
# Na raiz do projeto, execute o comando para desenvolvimento local
npm run dev:local

# O frontend estará acessível em http://localhost:8080
```

Agora, você pode abrir `http://localhost:8080` em seu navegador. Você será direcionado para a tela de login, onde poderá criar uma conta ou solicitar um orçamento.
