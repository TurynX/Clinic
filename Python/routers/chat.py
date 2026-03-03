from services.groqService import GroqService
from pypdf import PdfReader
import io
from fastapi import APIRouter, UploadFile, File, Form
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import CharacterTextSplitter
from pypdf import PdfReader
from groq import Groq
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()
groq_service = GroqService()
db = None

class ChatRequest(BaseModel):
    question:str

@router.post("/upload")
async def upload(file:UploadFile = File (...)):
    global db
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    content = await file.read()
    pdf = PdfReader(io.BytesIO(content))
    text = ""
    for page in pdf.pages: text += page.extract_text()

    splitter = CharacterTextSplitter(chunk_size=500,chunk_overlap=50)
    docs = splitter.create_documents([text])
    db = FAISS.from_documents(docs,embeddings)

    return {"status":"Successfully"}

@router.post("/chat")
def chat(data:ChatRequest):
    global db

    if db is None:
        return {"error": "None pdf loaded"}

    docs = db.similarity_search(data.question, k=3)

    context = "\n".join([doc.page_content for doc in docs])

    prompt = f"""
You are an AI assistant. Answer the question strictly based on the provided context.
If the answer is not contained in the context, say that the information is not available.

Context:
    {context}

Question:
    {data.question}

Answer:
    """


    return {"response": groq_service.generate(prompt)}