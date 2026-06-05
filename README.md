DATAGPT-AI 
An AI-powered PDF Question Answering system built using Flask, LangChain, FAISS, Hugging Face Embeddings, and Groq LLMs.

DATAGPT-AI allows users to upload PDF documents and ask questions about their content using Retrieval-Augmented Generation (RAG). The AI answers only from the uploaded PDF and avoids hallucinations.

* Features

1. Upload PDF documents

2. Extract and process PDF content

3. Create embeddings using Hugging Face

4. Store vectors using FAISS

5.Ask questions about uploaded PDFs

6. Groq LLM integration

7. RAG-based document retrieval

8.Restricts answers to PDF content only

9.Modern chatbot interface

 *Tech Stack
Frontend
HTML
CSS
JavaScript
Backend
Flask
Python
AI Technologies
LangChain
FAISS Vector Database
Hugging Face Embeddings
Groq API
RAG (Retrieval-Augmented Generation)

📁 Project Structure
DATAGPT-AI/
│
├── app.py
├── utils.py
├── .env
│
├── uploads/
│
├── faiss_index/
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
│
├── requirements.txt
│
└── README.md
*Installation
Clone Repository
git clone https://github.com/your-username/DATAGPT-AI.git
cd DATAGPT-AI
Create Virtual Environment
python -m venv venv
Activate Environment
Windows
venv\Scripts\activate
Linux / macOS
source venv/bin/activate
Install Dependencies
pip install -r requirements.txt
* Environment Variables

Create a .env file in the root directory.

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
▶️ Run the Application
python app.py

Open your browser:

http://127.0.0.1:5000
📄 How It Works
Step 1: Upload PDF

The user uploads a PDF document.

Step 2: Text Extraction

PDF content is extracted using PyPDFLoader.

Step 3: Chunking

The text is divided into smaller chunks for better retrieval.

Step 4: Embedding Generation

Embeddings are generated using:

sentence-transformers/all-MiniLM-L6-v2
Step 5: Vector Storage

Embeddings are stored in a FAISS vector database.

Step 6: Retrieval

Relevant document chunks are retrieved based on the user's question.

Step 7: Answer Generation

Groq LLM generates responses using only the retrieved context.

*Hallucination Prevention

The application follows a strict prompt:

If the answer is not found in the uploaded PDF, respond with:

The question does not match the uploaded PDF.

This ensures responses remain grounded in the uploaded document.

📦 Required Packages
flask
python-dotenv
langchain
langchain-community
langchain-core
langchain-classic
langchain-groq
langchain-huggingface
langchain-text-splitters
faiss-cpu
sentence-transformers
pypdf

Install all packages:

pip install -r requirements.txt
🧪 Example
Upload
Machine_Learning_Notes.pdf
Ask
What is supervised learning?
Response
Supervised learning is a machine learning approach where a model learns from labeled data.
Ask an Unrelated Question
Who won the FIFA World Cup?
Response
The question does not match the uploaded PDF.
* Future Enhancements
Multiple PDF Support
Chat History
User Authentication
PDF Summarization
Voice Assistant
ChromaDB Support
Cloud Deployment
Multi-Document Retrieval
* Author

Kowsalya Gopireddy
