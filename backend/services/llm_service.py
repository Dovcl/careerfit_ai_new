# backend/services/llm_service.py (RAG 연결 최종 버전)

import os
from dotenv import load_dotenv

load_dotenv()

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not MOCK_MODE and GEMINI_API_KEY:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash-lite")
else:
    model = None


def build_rag_prompt(query: str, context_docs: list) -> str:
    """
    사용자 질문 + RAG 검색 문서 → Gemini 프롬프트 구성
    요리 비유: 셰프(Gemini)에게 레시피 카드(context_docs)를 건네며 요청합니다.
    """
    if context_docs:
        context_text = "\n".join([
            f"[공고 {i+1}]\n{doc['text']}\n출처: {doc['metadata'].get('company', '')} — {doc['metadata'].get('title', '')}"
            for i, doc in enumerate(context_docs)
        ])
        context_section = f"""
[참고 데이터 — 실제 취업·공모전 공고]
{context_text}

위 데이터를 반드시 근거로 사용해 답변하세요.
답변에서 어떤 공고를 참고했는지 명시하세요.
"""
    else:
        context_section = "[참고 데이터 없음 — 일반적인 조언을 제공합니다]"

    return f"""당신은 취업·공모전 전문 커리어 코치입니다.
다음 지원자 정보와 참고 데이터를 바탕으로 맞춤형 조언을 한국어로 제공하세요.

[지원자 정보]
{query}

{context_section}

[답변 형식]
1. 현재 역량 평가 (2문장 이내)
2. 추천 공고 또는 공모전 (1~2개, 이유 포함)
3. 부족한 역량 및 준비 방향 (3가지 이내)

간결하고 실용적으로 작성하세요."""


def get_llm_response(query: str, context_docs: list) -> dict:
    """RAG 문서와 함께 LLM 응답을 생성합니다."""
    if MOCK_MODE or model is None:
        return {
            "answer": f"[MOCK 응답] 질문: '{query}', 참고 문서 수: {len(context_docs)}개. MOCK_MODE=false 설정 시 실제 응답을 받습니다.",
            "sources": [
                {"company": doc["metadata"].get("company", ""), "title": doc["metadata"].get("title", ""), "required_skills": ""}
                for doc in context_docs
            ]
        }

    try:
        response = model.generate_content(build_rag_prompt(query, context_docs))
        return {
            "answer": response.text,
            "sources": [
                {"company": doc["metadata"].get("company", ""), "title": doc["metadata"].get("title", ""), "required_skills": doc["metadata"].get("required_skills", ""), "distance": doc.get("distance", 0)}
                for doc in context_docs
            ]
        }
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return {"answer": "[API 한도 초과] MOCK_MODE=true 로 전환하고 계속하세요.", "sources": []}
        return {"answer": f"[오류] {error_msg}", "sources": []}