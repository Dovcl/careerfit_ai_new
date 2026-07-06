# backend/routers/analyze.py (RAG 연결 최종 버전)

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.rag_service import search_documents
from services.llm_service import get_llm_response   

router = APIRouter()

class AnalyzeRequest(BaseModel):
    major: str
    skills: List[str]
    job_type: str

class AnalyzeResponse(BaseModel):
    answer: str
    sources: List[dict]

@router.post("/analyze", response_model=AnalyzeResponse, tags=["Analyze"])
def analyze_career(request: AnalyzeRequest):
    """RAG 기반 역량 분석: ChromaDB 검색 → Gemini 답변 → sources 반환"""
    query = f"전공: {request.major}, 보유 스킬: {', '.join(request.skills)}, 관심 직무: {request.job_type}"
# ChromaDB 검색
    context_docs = search_documents(query, n_results=3)
# ChromaDB 검색 결과를 Gemini에 전달하여 답변 생성
    result = get_llm_response(query=query, context_docs=context_docs)
# 결과 반환
    return AnalyzeResponse(answer=result["answer"], sources=result["sources"])