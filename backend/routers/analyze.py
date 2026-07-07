# backend/routers/analyze.py (RAG 연결 + SSE 스트리밍)

import json
from typing import List

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.rag_service import search_documents
from services.llm_service import (
    build_rag_prompt,
    build_sources,
    get_llm_response,
    get_user_facing_error,
    stream_llm,
)

router = APIRouter()


class AnalyzeRequest(BaseModel):
    major: str
    skills: List[str]
    job_type: str


class AnalyzeResponse(BaseModel):
    answer: str
    sources: List[dict]


def _build_query(request: AnalyzeRequest) -> str:
    return (
        f"전공: {request.major}, "
        f"보유 스킬: {', '.join(request.skills)}, "
        f"관심 직무: {request.job_type}"
    )


def _sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@router.post("/analyze", response_model=AnalyzeResponse, tags=["Analyze"])
def analyze_career(request: AnalyzeRequest):
    """RAG 기반 역량 분석: ChromaDB 검색 → Gemini 답변 → sources 반환"""
    query = _build_query(request)
    context_docs = search_documents(query, n_results=3)
    result = get_llm_response(query=query, context_docs=context_docs)
    return AnalyzeResponse(answer=result["answer"], sources=result["sources"])


@router.post("/analyze/stream", tags=["Analyze"])
def analyze_career_stream(request: AnalyzeRequest):
    """SSE 스트리밍: sources 먼저 전송 → answer 토큰 스트리밍 → done"""
    query = _build_query(request)
    context_docs = search_documents(query, n_results=3)
    sources = build_sources(context_docs)
    prompt = build_rag_prompt(query, context_docs)

    def event_generator():
        try:
            yield _sse_event("sources", {"sources": sources})

            for token in stream_llm(prompt):
                yield _sse_event("token", {"text": token})

            yield _sse_event("done", {})
        except Exception as e:
            yield _sse_event("error", {"message": get_user_facing_error(e)})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
