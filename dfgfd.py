import streamlit as st
import os
from langchain_groq import ChatGroq
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import OllamaEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFDirectoryLoader
import openai

from dotenv import load_dotenv
load_dotenv()
## load the GROQ API Key
os.environ['OPENAI_API_KEY']=os.getenv("OPENAI_API_KEY")
os.environ['GROQ_API_KEY']=os.getenv("GROQ_API_KEY")
groq_api_key=os.getenv("GROQ_API_KEY")

## If you do not have open AI key use the below Huggingface embedding
os.environ['HF_TOKEN']=os.getenv("HF_TOKEN")
from langchain_huggingface import HuggingFaceEmbeddings
embeddings=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

llm=ChatGroq(groq_api_key=groq_api_key,model_name="Llama3-8b-8192")

prompt=ChatPromptTemplate.from_template(
    """
    Answer the questions based on the provided context only.
    Please provide the most accurate respone based on the question
    <context>
    {context}
    <context>
    Question:{input}

    """

)

def create_vector_embedding(docs):
    st.session_state.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    st.session_state.final_documents = st.session_state.text_splitter.split_documents(docs[:50])
    st.session_state.vectors = FAISS.from_documents(st.session_state.final_documents, embeddings)

st.title("RAG Document Q&A With Groq And Llama3")

# Button to upload a file
uploaded_files = st.file_uploader("Upload PDF or Document", type=["pdf", "docx"], accept_multiple_files=True)

# Button to select files from a folder (this is a placeholder, as Streamlit does not support folder selection directly)
folder_files = st.text_input("Enter folder path to load files (not implemented)")

# Process uploaded files
if uploaded_files:
    st.session_state.docs = []
    for uploaded_file in uploaded_files:
        st.session_state.docs.append(uploaded_file.read())  # Replace with actual processing if needed
    create_vector_embedding(st.session_state.docs)
    st.write("Documents processed and vectors created.")

# Ask a question button
user_prompt = st.text_input("Enter your question from the uploaded document")

if st.button("Ask"):
    if 'vectors' in st.session_state:
        document_chain = create_stuff_documents_chain(llm, prompt)
        retriever = st.session_state.vectors.as_retriever()
        retrieval_chain = create_retrieval_chain(retriever, document_chain)

        start = time.process_time()
        response = retrieval_chain.invoke({'input': user_prompt})
        st.write(f"Response time: {time.process_time() - start}")

        st.write(response['answer'])
    else:
        st.write("Please upload a document first.")