import os
import json
import logging
import re
import sqlite3
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import google.generativeai as genai
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from dotenv import load_dotenv
from passlib.context import CryptContext
from pathlib import Path
from jose import JWTError, jwt

# --- Carregamento de Configurações ---
current_dir = Path(__file__).parent
env_path = current_dir / '.env'
load_dotenv(dotenv_path=env_path)

# --- Constantes de Segurança ---
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 horas

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY não configurada no arquivo .env. A aplicação não pode iniciar.")

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
        # Tabela de Usuários com campos de perfil
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                hashed_password TEXT NOT NULL,
                company_name TEXT,
                company_services TEXT
            )
        """)
        # Tabela de Histórico de Leads
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS lead_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                lead_data TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        print(f"Erro no banco de dados ao criar tabelas: {e}")
        raise

# --- Configuração de Autenticação e Segurança ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# --- Modelos Pydantic ---

class User(BaseModel):
    id: int
    email: EmailStr
    company_name: Optional[str] = None
    company_services: Optional[str] = None

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    company_services: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str

class Lead(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra='ignore')

    id: str = Field(alias="id")
    name: str = Field(alias="name")
    instagram: Optional[str] = None
    website: Optional[str] = None
    whatsapp: Optional[str] = None
    contact: str = Field(alias="contact")
    score: int = Field(alias="score")

class LeadConfigRequest(
    BaseModel
):
    niche: str
    region: str
    quantity: int
    criteria: str
    include_keywords: Optional[str] = None
    exclude_keywords: Optional[str] = None

# --- Funções de Segurança ---

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(conn: sqlite3.Connection, email: str) -> Optional[UserInDB]:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user_row = cursor.fetchone()
    if user_row:
        return UserInDB(**user_row)
    return None

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    conn = get_db_connection()
    user = get_user(conn, email=email)
    conn.close()
    
    if user is None:
        raise credentials_exception
    return User(**user.model_dump())

# --- Configuração do App FastAPI ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("leadhunterai")
app = FastAPI()
create_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

# --- Configuração da API Gemini ---
try:
    if "GEMINI_API_KEY" not in os.environ:
        logger.warning("GEMINI_API_KEY não encontrada no .env.")
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
except Exception as e:
    logger.error(f"Falha ao configurar a API Gemini: {e}")

# --- Endpoints ---

@app.post("/api/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db_connection()
    user = get_user(conn, form_data.username)
    conn.close()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/register")
def register_user(user: UserCreate):
    conn = get_db_connection()
    try:
        if get_user(conn, user.email):
            raise HTTPException(status_code=400, detail="Email já registrado")
        hashed_password = get_password_hash(user.password)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (email, hashed_password) VALUES (?, ?)", (user.email, hashed_password))
        conn.commit()
    finally:
        conn.close()
    return {"message": "Usuário registrado com sucesso"}

@app.get("/api/profile", response_model=User)
async def read_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/api/profile", response_model=User)
async def update_user_profile(profile_data: ProfileUpdate, current_user: User = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET company_name = ?, company_services = ? WHERE id = ?",
            (profile_data.company_name, profile_data.company_services, current_user.id)
        )
        conn.commit()
    finally:
        conn.close()
    # Retorna os dados atualizados
    updated_user_data = current_user.model_dump()
    updated_user_data.update(profile_data.model_dump())
    return User(**updated_user_data)

@app.get("/api/history", response_model=List[Lead])
async def get_user_history(current_user: User = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT lead_data FROM lead_history WHERE user_id = ? ORDER BY created_at DESC", (current_user.id,))
        history_rows = cursor.fetchall()
        leads = [Lead(**json.loads(row['lead_data'])) for row in history_rows]
        return leads
    finally:
        conn.close()

@app.post("/api/search", response_model=List[Lead])
async def search_leads(request: LeadConfigRequest, current_user: User = Depends(get_current_user)):
    # Lógica de busca aprimorada
    conn = get_db_connection()
    try:
        # 1. Buscar histórico de leads para evitar repetição
        cursor = conn.cursor()
        cursor.execute("SELECT lead_data FROM lead_history WHERE user_id = ?", (current_user.id,))
        history_rows = cursor.fetchall()
        previous_leads = [json.loads(row['lead_data']) for row in history_rows]
        previous_leads_str = json.dumps(previous_leads, indent=2)

        # 2. Construir prompt dinâmico
        prompt_parts = [
            f"Sua tarefa é encontrar {request.quantity} empresas ou profissionais do nicho de '{request.niche}' na região de '{request.region}'.",
            f"Os leads ideais são aqueles com baixa presença digital, conforme os seguintes critérios: {request.criteria}."
        ]
        if current_user.company_name and current_user.company_services:
            prompt_parts.append(f"CONTEXTO DO USUÁRIO: A busca é para a empresa '{current_user.company_name}', que oferece os seguintes serviços: '{current_user.company_services}'. Use este contexto para encontrar leads que sejam clientes ideais.")
        
        prompt_parts.append("Seja extremamente rigoroso na sua busca. Priorize encontrar um contato direto (e-mail ou telefone) que não seja genérico.")

        if request.include_keywords:
            prompt_parts.append(f"A busca DEVE incluir menções a: '{request.include_keywords}'.")
        if request.exclude_keywords:
            prompt_parts.append(f"A busca DEVE EXCLUIR menções a: '{request.exclude_keywords}'.")
        
        if previous_leads:
            prompt_parts.append(f"IMPORTANTE: Os leads a seguir já foram encontrados para este usuário. NÃO os inclua na nova resposta: \n{previous_leads_str}")

        task_description = "\n".join(prompt_parts)
        prompt = f"""
Aja como um especialista em prospecção de clientes e geração de leads B2B, com foco em alta precisão.

**INSTRUÇÕES CRÍTICAS DE FORMATO:**
1. Você DEVE retornar APENAS um objeto JSON.
2. Este objeto JSON DEVE conter uma ÚNICA chave de nível superior chamada "leads".
3. O valor da chave "leads" DEVE ser um ARRAY de objetos.
4. CADA objeto dentro do array "leads" DEVE conter as SEGUINTES CHAVES EXATAS (em inglês, minúsculas):
   - "id" (string, UUID v4)
   - "name" (string)
   - "instagram" (string, URL ou null)
   - "website" (string, URL ou null)
   - "whatsapp" (string, número de telefone ou null)
   - "contact" (string, número de telefone ou email, OBRIGATÓRIO)
   - "score" (inteiro de 0 a 100)
5. NÃO use chaves em português (ex: "nome", "contato", "pontuacao").
6. NÃO inclua nenhum texto, explicação, formatação extra ou caracteres antes ou depois do JSON.
7. SIGA O EXEMPLO DE SAÍDA RIGOROSAMENTE.

{task_description}

Exemplo de formato de saída (SIGA ESTE EXEMPLO RIGOROSAMENTE):
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

        # 3. Chamar a IA
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        
        # 4. Processar e salvar novos leads
        parsed_response = json.loads(response.text)
        new_leads_data = parsed_response.get("leads", [])
        validated_leads = [Lead(**lead) for lead in new_leads_data]
        
        # 5. Salvar no histórico
        now = datetime.now(timezone.utc)
        for lead in validated_leads:
            cursor.execute(
                "INSERT INTO lead_history (user_id, lead_data, created_at) VALUES (?, ?, ?)",
                (current_user.id, lead.model_dump_json(), now)
            )
        conn.commit()
        return validated_leads

    except Exception as e:
        logger.error(f"Erro em /api/search: {e}")
        # Evita expor detalhes internos da exceção ao cliente
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Falha ao gerar leads.")
    finally:
        conn.close()

# Endpoint de contato (público)
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