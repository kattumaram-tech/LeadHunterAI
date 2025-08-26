import os
import json
import logging
import re
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

"""
Backend principal do LeadHunterAI
Para iniciar: python -m uvicorn backend.main:app --reload
"""

load_dotenv()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("leadhunterai")

# Configure Gemini API
if "GEMINI_API_KEY" not in os.environ:
    raise HTTPException(status_code=500, detail="GEMINI_API_KEY não encontrada no .env. Crie o arquivo e adicione a chave.")
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
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

# Pydantic models for request and response

class LeadConfigRequest(BaseModel):
    """Modelo de requisição para configuração de busca de leads."""
    niche: str
    region: str
    quantity: int
    criteria: str

class Lead(BaseModel):
    """Modelo de resposta para um lead."""
    id: str
    name: str
    instagram: str | None = None
    website: str | None = None
    whatsapp: str | None = None
    contact: str
    score: int

# Gemini model configuration
generation_config = {
    "temperature": 0.8,
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

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    safety_settings=safety_settings
)


@app.post("/api/search", response_model=list[Lead])
async def search_leads(request: LeadConfigRequest):
    """
    Rota para buscar leads usando o modelo Gemini.
    """
    prompt = f"""
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

    try:
        response = model.generate_content(prompt)
        # Tenta extrair JSON válido da resposta
        text = response.text
        match = re.search(r'\{[\s\S]*\}', text)
        if not match:
            logger.error(f"Resposta do Gemini não contém JSON: {text}")
            raise HTTPException(status_code=500, detail="Resposta do Gemini não contém JSON válido.")
        json_str = match.group(0)
        try:
            parsed_response = json.loads(json_str)
        except Exception as je:
            logger.error(f"Falha ao parsear JSON: {je} | Resposta: {json_str}")
            raise HTTPException(status_code=500, detail="Falha ao parsear JSON da resposta do Gemini.")
        leads_data = parsed_response.get("leads", [])
        # Validar com Pydantic
        validated_leads = [Lead(**lead) for lead in leads_data]
        return validated_leads
    except Exception as e:
        logger.error(f"Erro ao gerar conteúdo ou validar leads: {e}")
        raise HTTPException(status_code=500, detail=f"Falha ao gerar leads do Gemini: {e}")


@app.get("/")
def read_root():
    """Rota raiz para verificação de status do backend."""
    return {"message": "LeadHunterAI Backend is running"}

