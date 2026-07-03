import os
from dotenv import load_dotenv

load_dotenv()

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Gemini 클라이언트 초기화 (MOCK_MODE가 아닐 때만)
if not MOCK_MODE and GEMINI_API_KEY:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    # 수업 권장 모델: gemini-2.5-flash-lite (무료 한도 하루 1,000 요청)
    model = genai.GenerativeModel("gemini-2.5-flash-lite")
else:
    model = None


def build_prompt(query: str, context_docs: list) -> str:
    """
    사용자 질문과 RAG 문서를 결합해 Gemini에게 보낼 프롬프트를 만든다.
    요리 비유: 외부 셰프에게 주문서를 작성하는 단계
    """
    # 3일차에 context_docs가 실제 ChromaDB 검색 결과로 채워진다
    # 지금은 빈 컨텍스트로 테스트한다
    context_text = "\n".join([
        f"- {doc.get('content', '')}" for doc in context_docs
    ]) if context_docs else "관련 데이터 없음 (3일차에 추가 예정)"

    prompt = f"""
당신은 취업·공모전 전문 커리어 코치입니다.
다음 지원자 정보와 참고 데이터를 바탕으로 맞춤형 조언을 한국어로 제공하세요.

[지원자 정보]
{query}

[참고 데이터]
{context_text}

[답변 형식]
1. 현재 역량 평가 (2~3문장)
2. 부족한 역량 및 준비 방향 (3가지 이내)
3. 추천 프로젝트 또는 공모전 (1~2개)

출처 데이터가 없는 경우 일반적인 커리어 조언을 제공하되,
데이터가 있다면 반드시 그 데이터를 근거로 답변하세요.
"""
    return prompt.strip()


def get_llm_response(query: str, context_docs: list) -> dict:
    """
    사용자 질문과 검색된 문서를 받아 LLM 응답을 반환한다.
    """
    if MOCK_MODE or model is None:
        return {
            "answer": (
                "[MOCK 응답] MOCK_MODE=true 상태입니다. "
                f"질문 '{query}'에 대한 실제 응답은 "
                ".env에서 MOCK_MODE=false 로 설정하면 받을 수 있습니다."
            ),
            "sources": [{"title": "mock", "content": "mock 데이터"}]
        }

    try:
        prompt = build_prompt(query, context_docs)
        response = model.generate_content(prompt)

        return {
            "answer": response.text,
            "sources": context_docs if context_docs else []
        }

    except Exception as e:
        # API 오류 발생 시 mock 응답으로 폴백
        error_msg = str(e)

        # 429: 한도 초과 안내
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return {
                "answer": (
                    "[API 한도 초과] Gemini API 무료 한도에 도달했습니다. "
                    ".env에서 MOCK_MODE=true 로 설정하고 실습을 계속하세요."
                ),
                "sources": []
            }

        # 그 외 오류
        return {
            "answer": f"[오류 발생] {error_msg}. 강사에게 문의하거나 MOCK_MODE=true 로 전환하세요.",
            "sources": []
        }