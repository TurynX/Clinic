import os
from pypdf import PdfReader
import io
from fastapi import APIRouter, UploadFile, File
from langchain_cohere import CohereEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import CharacterTextSplitter
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain, create_history_aware_retriever
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

embeddings = CohereEmbeddings(
    cohere_api_key=os.getenv("COHERE_API_KEY"), model="embed-english-v3.0"
)
FAISS_PATH = "faiss_index"
llm = ChatGroq(api_key=os.getenv("GROQ_API_KEY"), model_name="llama-3.3-70b-versatile")
history = ChatMessageHistory()
chain_with_history = None


def build_chain(retriever):
    contextualize_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "Given chat history and latest question, reformulate a standalone question.",
            ),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ]
    )
    history_aware_retriever = create_history_aware_retriever(
        llm, retriever, contextualize_prompt
    )

    qa_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "Answer based on context:\n\n{context}"),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ]
    )
    qa_chain = create_stuff_documents_chain(llm, qa_prompt)
    rag_chain = create_retrieval_chain(history_aware_retriever, qa_chain)

    return RunnableWithMessageHistory(
        rag_chain,
        lambda session_id: history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
    )


if os.path.exists(FAISS_PATH):
    db = FAISS.load_local(FAISS_PATH, embeddings, allow_dangerous_deserialization=True)
    chain_with_history = build_chain(db.as_retriever(search_kwargs={"k": 3}))
    print("FAISS loaded from disk")
else:
    db = None
    print("No FAISS found, upload a PDF first")


class ChatRequest(BaseModel):
    question: str


@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    global db, chain_with_history

    content = await file.read()
    pdf = PdfReader(io.BytesIO(content))
    text = ""
    for page in pdf.pages:
        text += page.extract_text()

    splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = splitter.create_documents([text])
    db = FAISS.from_documents(docs, embeddings)
    db.save_local(FAISS_PATH)
    chain_with_history = build_chain(db.as_retriever(search_kwargs={"k": 3}))

    return {"status": "Successfully"}


@router.post("/chat")
def chat(data: ChatRequest):
    if chain_with_history is None:
        return {"error": "No PDF loaded"}

    response = chain_with_history.invoke(
        {"input": data.question}, config={"configurable": {"session_id": "default"}}
    )

    return {"response": response["answer"]}
