import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

def check_api_key():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        raise ValueError("Groq API Key is missing or invalid. Please add it to the .env file.")
    return api_key

def process_pdf(file_path):
    check_api_key()
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    texts = text_splitter.split_documents(documents)
    
    embeddings = HuggingFaceEmbeddings(model="sentence-transformers/all-MiniLM-L6-v2")
    vector_store = FAISS.from_documents(texts, embeddings)
    vector_store.save_local("faiss_index")
    return vector_store

def get_rag_chain():
    check_api_key()
    embeddings = HuggingFaceEmbeddings(model="sentence-transformers/all-MiniLM-L6-v2")
    vector_store = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
    retriever = vector_store.as_retriever()
    
    # Allow overriding the model via environment variable; use a maintained default.
    # If your key doesn't have access to the default model, set GROQ_MODEL in `.env`
    # to one of your available models from the Groq console.
    groq_model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    llm = ChatGroq(model=groq_model, temperature=0)
    
    system_prompt = (
        "Use the following pieces of retrieved context to answer the question. "
        "If the answer is not contained within the context provided, strictly say 'The question does not match the uploaded PDF.' "
        "Do not use any external knowledge. Do not hallucinate."
        "\n\n"
        "{context}"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    return rag_chain

def query_rag(question):
    try:
        if not os.path.exists("faiss_index"):
            return "Please upload a PDF first."
        
        rag_chain = get_rag_chain()
        try:
            response = rag_chain.invoke({"input": question})
            # response may be a dict or object depending on chain implementation
            if isinstance(response, dict) and "answer" in response:
                return response["answer"]
            # fallback: stringify response
            return str(response)
        except Exception as api_err:
            msg = str(api_err)
            if "decommissioned" in msg or "model_decommissioned" in msg:
                return (
                    "Error: The Groq model configured has been decommissioned. "
                    "Set a supported model in the GROQ_MODEL environment variable (e.g. 'llama-3.1-8b-instant') "
                    "or check https://console.groq.com/docs/deprecations for current models."
                )
            if "model_not_found" in msg or "does not exist" in msg or "you do not have access" in msg:
                return (
                    "API Error: Your Groq API key does not have access to the configured model. "
                    "Set GROQ_MODEL in .env to a model available on your Groq account, such as 'llama-3.1-8b-instant'."
                )
            return f"API Error: {msg}"
    except Exception as e:
        return f"Error: {str(e)}"
