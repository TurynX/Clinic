import os
from pypdf import PdfReader
import io
from fastapi import APIRouter, UploadFile, File, Form
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import CharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from pypdf import PdfReader
from groq import Groq
from langchain_groq import ChatGroq
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
FAISS_PATH = "faiss_index"
llm = ChatGroq(api_key=os.getenv("GROQ_API_KEY"), model_name="llama-3.3-70b-versatile")
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)


if os.path.exists(FAISS_PATH):
    db = FAISS.load_local(FAISS_PATH, embeddings, allow_dangerous_deserialization=True)
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm, retriever=db.as_retriever(search_kwargs={"k": 3}), memory=memory
    )
    print("FAISS loaded from disk")
else:
    db = None
    chain = None
    print("No FAISS found, upload a PDF first")


class ChatRequest(BaseModel):
    question: str


@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    global db, chain

    content = await file.read()
    pdf = PdfReader(io.BytesIO(content))
    text = ""
    for page in pdf.pages:
        text += page.extract_text()

    splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = splitter.create_documents([text])
    db = FAISS.from_documents(docs, embeddings)
    db.save_local(FAISS_PATH)

    chain = ConversationalRetrievalChain.from_llm(
        llm=llm, retriever=db.as_retriever(search_kwargs={"k": 3}), memory=memory
    )

    return {"status": "Successfully"}


@router.post("/chat")
def chat(data: ChatRequest):

    if chain is None:
        return {"error": "None pdf loaded"}

    response = chain.invoke({"question": data.question})

    return {"response": response["answer"]}
