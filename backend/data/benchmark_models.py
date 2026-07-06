#!/usr/bin/env python3
"""CareerFit AI 모델 벤치마크 — docs/MODEL_BENCHMARK.md 결과 생성용"""

import json
import os
import sys
import time
from pathlib import Path

# backend 루트를 import path에 추가
BACKEND_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(BACKEND_DIR / ".env")

# 테스트할 모델 목록 (환경변수 LLM_MODEL 형식)
MODELS_TO_TEST = [
    {"name": "Mock", "env": None, "mock": True},
    {"name": "Gemini 2.5 Flash-Lite", "env": "gemini-2.5-flash-lite", "mock": False},
    {"name": "Gemini 2.5 Flash", "env": "gemini-2.5-flash", "mock": False},
]

TEST_QUERY = (
    "전공: 통계학과, 보유 스킬: Python, SQL, 보유 스킬: 데이터 분석, "
    "관심 직무: 데이터 분석"
)
SIMPLE_PROMPT = (
    "경영학과 학생이 지원할 수 있는 AI 관련 직무를 추천해줘. "
    "한국어로 3가지 bullet 형식으로 답해줘."
)

SAMPLE_CONTEXT = [
    {
        "text": (
            "테크스타트업A에서 데이터 분석가를 채용합니다. "
            "필수 스킬은 Python, SQL, 통계입니다. "
            "신입·경력 1년 이하 지원 가능합니다."
        ),
        "metadata": {
            "company": "테크스타트업A",
            "title": "데이터 분석가",
            "required_skills": "Python, SQL, 통계",
            "job_type": "데이터 분석",
        },
        "distance": 0.42,
    }
]


def run_single(model_cfg: dict) -> dict:
    """단일 모델 1회 호출 — RAG 프롬프트 + 단순 프롬프트"""
    import importlib

    if model_cfg.get("mock"):
        os.environ["MOCK_MODE"] = "true"
    else:
        os.environ["MOCK_MODE"] = "false"
        os.environ["LLM_MODEL"] = model_cfg["env"]

    # 모듈 캐시 초기화 (환경변수 반영)
    for mod_name in list(sys.modules):
        if mod_name.startswith("services.llm_service"):
            del sys.modules[mod_name]

    from services.llm_service import build_rag_prompt, call_llm, get_llm_response

    result = {
        "model": model_cfg["name"],
        "llm_model_env": model_cfg.get("env"),
        "rag_test": {},
        "simple_test": {},
        "error": None,
    }

    try:
        # RAG 통합 테스트
        t0 = time.perf_counter()
        rag_result = get_llm_response(query=TEST_QUERY, context_docs=SAMPLE_CONTEXT)
        rag_elapsed = round(time.perf_counter() - t0, 2)
        result["rag_test"] = {
            "elapsed_sec": rag_elapsed,
            "answer_preview": rag_result["answer"][:500],
            "answer_len": len(rag_result["answer"]),
            "sources_count": len(rag_result["sources"]),
        }

        # 단순 프롬프트 테스트
        t0 = time.perf_counter()
        simple_answer = call_llm(SIMPLE_PROMPT)
        simple_elapsed = round(time.perf_counter() - t0, 2)
        result["simple_test"] = {
            "elapsed_sec": simple_elapsed,
            "answer_preview": simple_answer[:400],
            "answer_len": len(simple_answer),
        }
    except Exception as e:
        result["error"] = str(e)

    return result


def main():
    results = []
    for cfg in MODELS_TO_TEST:
        print(f"Testing: {cfg['name']}...", flush=True)
        results.append(run_single(cfg))

    out_path = BACKEND_DIR / "data" / "benchmark_results.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\nSaved: {out_path}")
    for r in results:
        status = "ERROR" if r["error"] else "OK"
        rag_t = r.get("rag_test", {}).get("elapsed_sec", "-")
        print(f"  [{status}] {r['model']}: RAG {rag_t}s")


if __name__ == "__main__":
    main()
