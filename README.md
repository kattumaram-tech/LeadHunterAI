# LeadHunterAI

LeadHunterAI é uma aplicação full-stack que utiliza a Inteligência Artificial do Google Gemini para encontrar leads de negócios (clientes potenciais) com base em critérios definidos pelo usuário, como nicho, região e nível de presença digital.

![LeadHunterAI Screenshot](https://i.imgur.com/rS42y4p.png)

## ✨ Funcionalidades

- **Busca Inteligente:** Define um nicho, região e quantidade de leads para a IA buscar.
- **Critérios de Qualificação:** Especifica critérios (em linguagem natural) para encontrar leads com baixa presença digital.
- **Resultados Detalhados:** Recebe uma lista de leads com nome, informações de contato, links (site, Instagram) e um score de qualificação.
- **Interface Moderna:** Interface de usuário limpa e reativa construída com as tecnologias mais recentes.

## 🚀 Stack de Tecnologias

O projeto é dividido em duas partes principais: o frontend e o backend.

- **Frontend:**
  - **Framework:** React com Vite
  - **Linguagem:** TypeScript
  - **Estilização:** Tailwind CSS
  - **Componentes UI:** shadcn-ui

- **Backend:**
  - **Framework:** FastAPI
  - **Linguagem:** Python
  - **Servidor:** Uvicorn

- **Inteligência Artificial:**
  - **API:** Google Gemini Pro

## 📋 Pré-requisitos

Antes de começar, garanta que você tem os seguintes softwares instalados:

- [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
- [Python](https://www.python.org/downloads/) (versão 3.9 ou superior)
- Um gerenciador de pacotes para o Node, como `npm` (incluso no Node.js) ou `bun`.

## 🔑 Configuração da API

O projeto requer uma chave de API do Google Gemini.

1.  Acesse o [Google AI Studio](https://aistudio.google.com/app/apikey) para gerar sua chave.
2.  Copie a chave gerada.

## ⚙️ Instalação e Execução

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

**1. Clone o Repositório**

```bash
git clone https://github.com/seu-usuario/LeadHunterAI.git
cd LeadHunterAI
```

**2. Configure o Backend**

```bash
# Navegue até a pasta do backend
cd backend

# Crie e ative um ambiente virtual (recomendado)
python -m venv .venv
# No Windows:
.venv\Scripts\activate
# No macOS/Linux:
source .venv/bin/activate

# Instale as dependências do Python
pip install -r requirements.txt

# Crie o arquivo de ambiente
# (Copie o .env.example para .env e adicione sua chave da API)
copy .env.example .env
# ou no macOS/Linux: cp .env.example .env

# Abra o arquivo .env e cole sua chave da API do Gemini:
GEMINI_API_KEY="SUA_CHAVE_AQUI"
```

**3. Configure o Frontend**

```bash
# Volte para a raiz do projeto
cd ..

# Instale as dependências do Node.js
npm install
```

**4. Execute a Aplicação**

Você precisará de dois terminais abertos: um para o backend e outro para o frontend.

- **Terminal 1: Iniciar o Backend**

```bash
# Navegue até a pasta do backend e ative o ambiente virtual se não estiver ativo
cd backend
.venv\Scripts\activate

# Inicie o servidor FastAPI
python -m uvicorn main:app --reload

# O backend estará rodando em http://127.0.0.1:8000
```

- **Terminal 2: Iniciar o Frontend**

```bash
# Na raiz do projeto, execute o comando para desenvolvimento local
npm run dev:local

# O frontend estará acessível em http://localhost:8080
```

Agora, você pode abrir `http://localhost:8080` em seu navegador para usar o LeadHunterAI.