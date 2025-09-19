import os
import json
import logging
import re
import sqlite3
import smtplib
from email.mime.text import MIMEText
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from passlib.context import CryptContext
from pathlib import Path

"""
Backend principal do LeadHunterAI
Para iniciar: python -m uvicorn backend.main:app --reload
"""

# Carrega o .env a partir do diretório do script para evitar problemas de caminho
current_dir = Path(__file__).parent
env_path = current_dir / '.env'
load_dotenv(dotenv_path=env_path)

# --- Configuração do Banco de Dados ---
DATABASE_URL = "database.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                hashed_password TEXT NOT NULL
            )
        """)
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        print(f"Erro no banco de dados ao criar tabelas: {e}")
        raise

# --- Configuração de Autenticação ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- Configuração do App FastAPI ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("leadhunterai")

app = FastAPI()

# Criar tabelas na inicialização
create_tables()

# Configurar CORS
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuração da API Gemini ---
try:
    if "GEMINI_API_KEY" not in os.environ:
        logger.warning("GEMINI_API_KEY não encontrada no .env. A busca de leads não funcionará.")
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
except Exception as e:
    logger.error(f"Falha ao configurar a API Gemini: {e}")

# --- Modelos Pydantic ---

# Modelos de Autenticação
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Modelo de Contato
class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    message: str

# Modelos de Busca de Leads
class LeadConfigRequest(BaseModel):
    niche: str
    region: str
    quantity: int
    criteria: str
    include_keywords: str | None = None
    exclude_keywords: str | None = None

class Lead(BaseModel):
    id: str
    name: str
    instagram: str | None = None
    website: str | None = None
    whatsapp: str | None = None
    contact: str
    score: int

# --- Endpoints de Autenticação ---

@app.post("/api/register")
def register_user(user: UserCreate):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT email FROM users WHERE email = ?", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email já registrado")
        
        hashed_password = get_password_hash(user.password)
        cursor.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
            (user.email, hashed_password)
        )
        conn.commit()
    except sqlite3.Error as e:
        logger.error(f"Erro de banco de dados ao registrar: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor.")
    finally:
        conn.close()
    return {"message": "Usuário registrado com sucesso"}

@app.post("/api/login")
def login_user(user: UserLogin):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT hashed_password FROM users WHERE email = ?", (user.email,))
        db_user = cursor.fetchone()
    except sqlite3.Error as e:
        logger.error(f"Erro de banco de dados ao fazer login: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor.")
    finally:
        conn.close()
    
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
        
    return {"message": "Login bem-sucedido"}

# --- Endpoint de Contato ---

@app.post("/api/contact")
def contact_request(request: ContactRequest):
    EMAIL_HOST = os.getenv("EMAIL_HOST")
    EMAIL_PORT_STR = os.getenv("EMAIL_PORT", "587")
    EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
    
    if not all([EMAIL_HOST, EMAIL_PORT_STR, EMAIL_USERNAME, EMAIL_PASSWORD]):
        logger.error("Variáveis de ambiente para e-mail não configuradas.")
        raise HTTPException(status_code=500, detail="Serviço de e-mail não configurado.")

    try:
        EMAIL_PORT = int(EMAIL_PORT_STR)
    except ValueError:
        logger.error(f"EMAIL_PORT inválida: '{EMAIL_PORT_STR}'. Deve ser um número.")
        raise HTTPException(status_code=500, detail="Configuração de servidor de e-mail inválida.")

    to_email = "kattumaram.td@gmail.com"
    subject = f"Nova Solicitação de Orçamento/Acesso de {request.name}"
    body = f"""
    Você recebeu uma nova mensagem de:
    Nome: {request.name}
    Email: {request.email}
    Telefone: {request.phone if request.phone else 'Não informado'}

    Mensagem:
    {request.message}
    """

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = EMAIL_USERNAME
    msg['To'] = to_email

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USERNAME, [to_email], msg.as_string())
        return {"message": "Mensagem enviada com sucesso!"}
    except Exception as e:
        logger.error(f"Falha ao enviar e-mail: {e}")
        raise HTTPException(status_code=500, detail="Falha ao enviar a mensagem.")


# --- Endpoint de Busca de Leads (Protegido) ---

generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

model = None
if os.environ.get("GEMINI_API_KEY"):
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        safety_settings=safety_settings
    )

@app.post("/api/search", response_model=list[Lead])
async def search_leads(request: LeadConfigRequest):
    if not model:
        raise HTTPException(status_code=500, detail="API do Gemini não configurada.")

    # Construção dinâmica do prompt para maior assertividade
    prompt_parts = [
        f"Sua tarefa é encontrar {request.quantity} empresas ou profissionais do nicho de '{request.niche}' na região de '{request.region}'.",
        f"Os leads ideais são aqueles com baixa presença digital, conforme os seguintes critérios: {request.criteria}.",
        "Seja extremamente rigoroso na sua busca. Priorize encontrar um contato direto (e-mail ou telefone) que não seja genérico. Verifique múltiplas fontes para garantir que a empresa se encaixa nos critérios antes de adicioná-la à lista."
    ]
    if request.include_keywords:
        prompt_parts.append(f"A busca DEVE incluir empresas que mencionem ou estejam relacionadas a estas palavras-chave: '{request.include_keywords}'.")
    if request.exclude_keywords:
        prompt_parts.append(f"A busca DEVE EXCLUIR empresas que mencionem ou estejam relacionadas a estas palavras-chave: '{request.exclude_keywords}'.")

    task_description = "\n".join(prompt_parts)

    prompt = f"""
    Aja como um especialista em prospecção de clientes e geração de leads B2B, com foco em alta precisão.

    {task_description}

    Para cada lead, forneça as seguintes informações em um formato JSON aninhado e válido:
    - id: um uuid v4 para identificar o lead.
    - name: O nome da empresa/profissional.
    - instagram: O link do perfil do Instagram (se encontrar).
    - website: O link do website (se encontrar).
    - whatsapp: O número do WhatsApp para contato (se encontrar).
    - contact: Um número de telefone ou email de contato (OBRIGATÓRIO, e deve ser o mais direto possível).
    - score: Uma pontuação de 0 a 100 que representa o quão bem o lead se encaixa nos critérios de 'baixa presença digital'. Leads com pontuação mais alta são mais promissores. Seja crítico e conservador ao atribuir esta pontuação.

    O resultado final deve ser um único array JSON chamado 'leads' contendo os objetos de cada lead. Não inclua nenhum texto ou explicação fora do JSON.
    Exemplo de formato de saída:
    {{
        "leads": [
            {{
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "Exemplo de Empresa",
                "instagram": "https://instagram.com/exemplo",
                "website": "https://exemplo.com",
                "whatsapp": "+5561999998888",
                "contact": "joao.silva@exemplodireto.com",
                "score": 90
            }}
        ]
    }}
    """

    try:
        response = model.generate_content(prompt)
        text = response.text
        try:
            parsed_response = json.loads(text)
        except json.JSONDecodeError:
            logger.error(f"Resposta do Gemini não é um JSON válido: {text}")
            raise HTTPException(status_code=500, detail="Resposta do Gemini não retornou um JSON válido.")
        
        leads_data = parsed_response.get("leads", [])
        validated_leads = [Lead(**lead) for lead in leads_data]
        return validated_leads
    except Exception as e:
        logger.error(f"Erro ao gerar conteúdo ou validar leads: {e}")
        # Evita expor detalhes internos da exceção ao cliente
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Falha ao gerar leads do Gemini.")

@app.get("/")
def read_root():
    return {"message": "LeadHunterAI Backend is running"}
