import io
import os
from fastapi import FastAPI, UploadFile, File, Form
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import CharacterTextSplitter
from pypdf import PdfReader
from groq import Groq
from pydantic import BaseModel
from datetime import datetime

current_year = datetime.now().year

app = FastAPI()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

db = None

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    global db

    content = await file.read()
    pdf = PdfReader(io.BytesIO(content))
    text = ""
    for page in pdf.pages:
        text += page.extract_text()

    splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = splitter.create_documents([text])
    db = FAISS.from_documents(docs, embeddings)

    return {"status": "PDF uploaded successfully"}

class Question(BaseModel):
    question: str

@app.post("/ask")
async def ask(body: Question):
    if db is None:
        return {"error": "PDF not uploaded"}

    context = db.similarity_search(body.question, k=2)
    context_text = " ".join([c.page_content for c in context])

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content":  f"""
            You are a strict assistant.
            Only answer using the provided context.
            If the answer is not in the context, say: "Not found in document."
            Current year is {current_year}.Context: {context_text}"""},
            {"role": "user", "content": body.question}
        ]
    )

    return {"analysis": response.choices[0].message.content}