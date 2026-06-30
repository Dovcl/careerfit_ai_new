from fastapi import APIRouter

from pydantic import BaseModel

from typing import List

router = APIRouter()

# 요청 본문(Request Body) 모델

# 손님이 제출하는 주문서 양식

class AnalyzeRequest(BaseModel):

    major: str          # 전공 (예: "통계학과")

    skills: List[str]      # 보유 스킬 목록 (예: ["Python", "SQL"])

    job_type: str        # 관심 직무 (예: "데이터 분석")

    experience_years: int = 0  # 경력 연수 (0이면 신입)

    preferred_company_size: str = "무관"  # 무관 / 대기업 / 중견기업 / 스타트업

# 응답 본문(Response Body) 모델

# 주방에서 손님에게 돌려주는 영수증 양식

class AnalyzeResponse(BaseModel):

    answer: str         # AI 분석 결과 텍스트

    sources: List[dict]     # 답변 근거 데이터 목록



@router.post("/analyze", response_model=AnalyzeResponse, tags=["Analyze"])

def analyze_career(request: AnalyzeRequest):

    """

    사용자의 전공·스킬·관심 직무를 기반으로 취업·공모전 맞춤 분석을 제공한다.

    현재는 목업 응답을 반환하며, 실습 8에서 Gemini API와 연결한다.

    """

    # 임시 목업 응답: 실습 8에서 실제 Gemini + RAG 응답으로 교체한다

    mock_answer = (

        f"{request.major} 학생으로서 {request.job_type} 직무에 지원하려면, "

        f"현재 보유하신 {', '.join(request.skills)} 역량을 바탕으로 "

        f"다음과 같은 준비를 추천드립니다. (목업 응답 — 실습 8에서 Gemini로 교체)"

    )

    mock_sources = [ { "title": "목업 데이터 — 테크스타트업A 데이터 분석가", "content": "요구 스킬: Python, SQL, 통계" } ] 
    return AnalyzeResponse(answer=mock_answer, sources=mock_sources) # 응답 반환 -> 반환값이 응답본문이 됨.