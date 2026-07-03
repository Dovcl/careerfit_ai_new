from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.llm_service import get_llm_response   # ← 추가

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
    # 사용자 질문 구성
    query = (
        f"전공: {request.major}, "
        f"보유 스킬: {', '.join(request.skills)}, "
        f"관심 직무: {request.job_type}"
    )

    # llm_service 호출 (실습 8에서 Gemini + RAG로 교체)
    result = get_llm_response(query=query, context_docs=[])

    return AnalyzeResponse(
        answer=result["answer"],
        sources=result["sources"]
    )
