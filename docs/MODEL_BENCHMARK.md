# CareerFit AI 모델 벤치마크 문서

> **최종 업데이트:** 2026-07-06  
> **테스트 환경:** macOS, Python 3.11, FastAPI backend, RAG 샘플 문서 1건 포함 프롬프트

---

## 1. 문서 목적

이 문서는 CareerFit AI 프로젝트에서 사용할 AI 모델을 선택하기 위해 작성한다.

공개 리더보드 점수만 보고 모델을 고르지 않고, **내 프로젝트의 실제 사용 목적**에 맞게 직접 질문하고 비교한다.

CareerFit AI의 모델 선택 기준:

| 기준 | 설명 |
|------|------|
| 한국어 답변 품질 | 자연스럽고 이해하기 쉬운 한국어 |
| 취업·직무 상담 적합성 | 포트폴리오·직무 맥락 이해 |
| 채용공고 요약 능력 | RAG 문서 기반 요약·추천 |
| 사용자 맥락 반영 | 전공, 스킬, 관심 직무 반영 |
| 환각 억제 | 없는 공고·조건을 지어내지 않음 |
| 응답 속도 | 수업·데모에서 기다릴 만한 수준 |
| 비용 | 무료 티어·저비용 실습 가능 여부 |
| API 연결 난이도 | `llm_service.py` 연동 용이성 |
| 라이선스 | 교육·포트폴리오 사용 가능 여부 |

---

## 2. 평가 대상 모델

| 번호 | Provider | Model | `LLM_MODEL` 설정값 | 용도 | 상태 |
|:--:|----------|-------|---------------------|------|------|
| 1 | Google Gemini | Gemini 2.5 Flash-Lite | `gemini-2.5-flash-lite` | 기본 LLM | ✅ 테스트 완료 |
| 2 | Google Gemini | Gemini 2.5 Flash | `gemini-2.5-flash` | 품질 우선 LLM | ✅ 테스트 완료 |
| 3 | Mistral | mistral-small-latest | `mistral-small-latest` | Gemini 대체 | ⬜ 테스트 예정 |
| 4 | Hugging Face | Llama 3.2 3B Instruct 등 | `huggingface:meta-llama/Llama-3.2-3B-Instruct` | 무료/저비용 후보 | ⬜ 테스트 예정 |
| 5 | Ollama | llama3.2:3b | `ollama:llama3.2:3b` | 오프라인·로컬 실습 | ⬜ 모델 미설치 |
| 6 | Mock | Mock Response | `MOCK_MODE=true` | 한도 초과·오프라인 대비 | ✅ 사용 가능 |

> 프로젝트 코드(`backend/services/llm_service.py`)는 위 provider를 `LLM_MODEL` 환경변수 하나로 전환할 수 있다.

---

## 3. 모델 후보 선정 기준

### 3-1. 기본 확인 항목

- [x] 내가 하려는 작업(취업 상담 + RAG)과 모델 Task가 일치하는가?
- [x] API로 호출 가능한 모델인가?
- [x] 무료 티어 또는 테스트 가능한 크레딧이 있는가?
- [x] 한국어 입력과 출력이 가능한가?
- [x] 응답 속도가 실습에 적절한가?
- [ ] 모든 후보 모델에 대해 라이선스·비용을 확인했는가?

### 3-2. 라이선스 확인 항목

| 모델 | 라이선스 / 제한 | 비고 |
|------|----------------|------|
| Gemini 2.5 Flash-Lite | Google API 이용약관 | 무료 티어 일 1,000 요청 (2026-03 기준) |
| Gemini 2.5 Flash | Google API 이용약관 | Flash-Lite보다 비용·한도 엄격 |
| Mistral Small | Mistral API 약관 | 유료·무료 크레딧 별도 확인 필요 |
| Llama 3.2 3B | Llama 3.2 Community License | HF Inference Providers 과금 확인 |
| Ollama 로컬 | 모델별 오픈 라이선스 | 로컬 실행, API 키 불필요 |
| Mock | 해당 없음 | 고정 문자열 반환 |

### 3-3. 비용 확인 항목

- [x] Gemini 무료 티어 한도 확인 (수업 권장: Flash-Lite)
- [ ] Hugging Face Inference Providers 가격·Billing 확인
- [ ] Mistral API 크레딧·과금 구조 확인
- [x] API 한도 초과 시 `MOCK_MODE=true` 전환 경로 확보

---

## 4. 평가 방식

### 4-1. 정량 평가 (1~5점)

| 점수 | 의미 |
|:--:|------|
| 5 | 매우 좋음 — 프로덕션·수업 기본값으로 적합 |
| 4 | 좋음 — 대부분 상황에서 사용 가능 |
| 3 | 보통 — 보조·실습용으로 적합 |
| 2 | 부족함 — 특정 상황에서만 사용 |
| 1 | 사용 어려움 — 현재 프로젝트에 부적합 |

### 4-2. 정성 평가

점수만으로 판단하지 않고, 실제 답변을 읽고 아래를 기록한다.

- 답변이 자연스러운가?
- 사용자의 전공, 경험, 목표를 반영했는가?
- 없는 정보를 지어내지 않았는가?
- 너무 일반적인 조언만 하지 않았는가?
- 실제 포트폴리오 개선에 도움이 되는가?
- 답변 형식이 보기 쉬운가?
- 한국어 표현이 어색하지 않은가?

### 4-3. 자동 측정 항목

`backend/data/benchmark_models.py` 스크립트로 아래를 측정한다.

```bash
cd backend
source venv/bin/activate
python3 data/benchmark_models.py
# 결과: backend/data/benchmark_results.json
```

| 측정 항목 | 설명 |
|-----------|------|
| `rag_test.elapsed_sec` | RAG 프롬프트 + `get_llm_response()` 응답 시간 |
| `simple_test.elapsed_sec` | 단순 질문 1회 호출 시간 |
| `answer_len` | 답변 길이 (형식 준수·간결성 참고) |

**2026-07-06 측정 결과 (응답 시간):**

| Model | RAG 테스트 | 단순 질문 테스트 |
|-------|:----------:|:--------------:|
| Mock | 0.00s | — |
| Gemini 2.5 Flash-Lite | 13.08s | 6.58s |
| Gemini 2.5 Flash | 10.52s | 12.07s |

---

## 5. 평가 기준표

| 평가 항목 | 설명 | 점수 범위 |
|-----------|------|:---------:|
| 한국어 자연스러움 | 한국어 문장이 자연스럽고 이해하기 쉬운가 | 1~5 |
| 정확성 | 질문 의도에 맞게 답했는가 | 1~5 |
| 직무 적합성 | 취업·직무·포트폴리오 맥락을 잘 반영했는가 | 1~5 |
| 맥락 반영 | 사용자 전공, 경력, 관심사를 반영했는가 | 1~5 |
| 환각 방지 | 없는 정보를 지어내지 않았는가 | 1~5 |
| 답변 구조화 | 표, 목록, 단계 등으로 보기 쉽게 정리했는가 | 1~5 |
| 실행 가능성 | 사용자가 바로 실행할 수 있는 조언인가 | 1~5 |
| 응답 속도 | 실습 또는 서비스에서 기다릴 만한 속도인가 | 1~5 |
| 비용 효율 | 무료/저비용 실습에 적합한가 | 1~5 |
| API 연결 난이도 | 프로젝트 코드에 연결하기 쉬운가 | 1~5 |

---

## 6. 테스트 질문 세트

아래 질문을 모든 모델에 **동일하게** 입력하고 결과를 비교한다.

### 6-1. CareerFit AI 핵심 질문 (RAG 연동)

```text
Python과 SQL이 필요한 데이터 분석 공고를 찾아줘.
```

```text
경영학과 학생이 지원할 수 있는 AI 관련 직무를 추천해줘.
```

```text
이 채용공고에 맞춰 포트폴리오 개선 방향을 알려줘.
```

```text
신입 기준으로 데이터 분석가 직무에 부족한 역량을 알려줘.
```

```text
다음 채용공고 내용을 5줄로 요약해줘.
```

### 6-2. 사용자 맞춤형 질문

```text
나는 AI융합교육학을 전공했고, AI 사내강사 직무에 관심이 있어. 어떤 포트폴리오를 준비하면 좋을까?
```

```text
비전공자가 FastAPI와 RAG 프로젝트를 포트폴리오로 설명하려면 어떤 구조로 말하면 좋을까?
```

```text
내 경험을 STAR 방식으로 정리해줘.
```

### 6-3. 안전성 및 환각 확인 질문

```text
채용공고에 없는 내용을 추측하지 말고, 확인 가능한 내용과 추측을 구분해서 답해줘.
```

```text
정보가 부족하면 억지로 답하지 말고, 어떤 정보가 더 필요한지 알려줘.
```

### 6-4. 형식 준수 테스트

```text
답변을 표 없이 마크다운 bullet 형식으로 정리해줘.
```

```text
초보자도 이해할 수 있게 ELI5 방식으로 설명해줘.
```

### 6-5. RAG 통합 테스트 (벤치마크 스크립트 기본값)

```text
전공: 통계학과, 보유 스킬: Python, SQL, 데이터 분석, 관심 직무: 데이터 분석
```

참고 문서: `테크스타트업A — 데이터 분석가 (Python, SQL, 통계)`

---

## 7. 모델별 평가 기록

### 7-1. Gemini 2.5 Flash-Lite

#### 기본 정보

| 항목 | 내용 |
|------|------|
| Provider | Google Gemini |
| Model | `gemini-2.5-flash-lite` |
| 사용 목적 | 기본 LLM (수업·서비스 기본값) |
| 호출 방식 | API (`google-generativeai`) |
| 라이선스 | Google API 이용약관 |
| 비용 구조 | 무료 티어 일 1,000 요청 |
| 테스트 날짜 | 2026-07-06 |
| RAG 응답 시간 | 13.08s |

#### 테스트 결과 요약

| 평가 항목 | 점수 | 메모 |
|-----------|:----:|------|
| 한국어 자연스러움 | 5 | 자연스러운 한국어, 전문 용어 적절 |
| 정확성 | 5 | RAG 공고(테크스타트업A)를 정확히 인용 |
| 직무 적합성 | 5 | 데이터 분석 직무 맥락·신입 관점 반영 |
| 맥락 반영 | 5 | 통계학과·Python·SQL 스킬 모두 언급 |
| 환각 방지 | 4 | 제공 문서 기반 답변, 추가 공고는 언급 안 함 |
| 답변 구조화 | 5 | 3단 구조(역량 평가·추천·준비 방향) 준수 |
| 실행 가능성 | 4 | 실무 경험·도메인 지식 등 구체적 조언 |
| 응답 속도 | 3 | 10~13초, 수업 데모에서 허용 가능 |
| 비용 효율 | 5 | 무료 티어로 수업 실습에 최적 |
| API 연결 난이도 | 5 | `LLM_MODEL=gemini-2.5-flash-lite` 한 줄 설정 |
| **소계** | **45/50** | |

#### 실제 답변 샘플 (RAG 테스트)

**질문:** 통계학과 + Python/SQL + 데이터 분석 직무

**모델 답변 (발췌):**

```text
1. 현재 역량 평가
통계학과 전공과 Python, SQL, 데이터 분석 스킬을 보유하고 있어
데이터 분석 직무에 필요한 기본적인 역량을 잘 갖추고 계십니다.

2. 추천 공고
[공고 1] 테크스타트업A 데이터 분석가
이유: 전공(통계학)과 보유 스킬(Python, SQL, 통계)을 필수 역량으로 요구...

3. 부족한 역량 및 준비 방향
- 실무 경험: 인턴십·프로젝트 경험 쌓기
- 도메인 지식: 지원 산업 분야 이해도 향상
```

**평가 메모:** `build_rag_prompt()` 형식 지시를 잘 따름. 공고 출처를 명시하여 환각 위험이 낮음.

---

### 7-2. Gemini 2.5 Flash

#### 기본 정보

| 항목 | 내용 |
|------|------|
| Provider | Google Gemini |
| Model | `gemini-2.5-flash` |
| 사용 목적 | 품질 우선·데모용 |
| 호출 방식 | API |
| 비용 구조 | Flash-Lite보다 비용·한도 엄격 |
| 테스트 날짜 | 2026-07-06 |
| RAG 응답 시간 | 10.52s |

#### 테스트 결과 요약

| 평가 항목 | 점수 | 메모 |
|-----------|:----:|------|
| 한국어 자연스러움 | 5 | 간결하고 자연스러움 |
| 정확성 | 5 | RAG 문서 기반 정확한 추천 |
| 직무 적합성 | 5 | 신입·통계 전공 맥락 반영 |
| 맥락 반영 | 5 | 스킬·전공·직무 모두 반영 |
| 환각 방지 | 4 | 제공 문서 내에서만 추천 |
| 답변 구조화 | 5 | 번호·bullet 구조 명확 |
| 실행 가능성 | 5 | 포트폴리오 구체화 조언 우수 |
| 응답 속도 | 4 | RAG 10.5s, Lite보다 빠름 |
| 비용 효율 | 4 | 무료 한도 소진 빠를 수 있음 |
| API 연결 난이도 | 5 | 동일 SDK, 모델명만 변경 |
| **소계** | **47/50** | |

#### 총평

답변 품질·구조화는 Flash-Lite보다 약간 우수하나, 수업에서 API 한도를 빠르게 소진할 수 있다. **발표·데모**에는 Flash, **일상 실습**에는 Flash-Lite를 권장한다.

---

### 7-3. Mock Response

#### 기본 정보

| 항목 | 내용 |
|------|------|
| Provider | 내장 Mock |
| Model | `MOCK_MODE=true` |
| 사용 목적 | API 한도 초과·오프라인 실습 |
| 호출 방식 | 로컬 (API 호출 없음) |
| 비용 구조 | 무료 |
| 테스트 날짜 | 2026-07-06 |
| RAG 응답 시간 | 0.00s |

#### 테스트 결과 요약

| 평가 항목 | 점수 | 메모 |
|-----------|:----:|------|
| 한국어 자연스러움 | 3 | 고정 메시지, 실제 조언 아님 |
| 정확성 | 1 | 질문에 대한 실질 답변 없음 |
| 직무 적합성 | 1 | 커리어 조언 미제공 |
| 맥락 반영 | 2 | 질문·문서 수만 표시 |
| 환각 방지 | 5 | 지어내지 않음 (답변 자체 없음) |
| 답변 구조화 | 2 | 단일 문자열 |
| 실행 가능성 | 1 | 사용자 조언 불가 |
| 응답 속도 | 5 | 즉시 응답 |
| 비용 효율 | 5 | 완전 무료 |
| API 연결 난이도 | 5 | `.env` 한 줄 전환 |
| **소계** | **30/50** | |

#### 총평

**API 연동·RAG 파이프라인 검증**과 **한도 초과 시 수업 연속성** 유지용으로 적합하다. 실제 AI 품질 평가 대상은 아니다.

---

### 7-4. Ollama (llama3.2:3b) — 테스트 예정

| 항목 | 내용 |
|------|------|
| 상태 | Ollama 서버 실행됨, **로컬 모델 미설치** (`ollama pull llama3.2:3b` 필요) |
| 예상 장점 | API 키·한도 없음, 오프라인 실습 |
| 예상 단점 | 한국어 품질·RAG 형식 준수 Flash-Lite 대비 낮을 가능성, 응답 지연 |
| 연결 방법 | `LLM_MODEL=ollama:llama3.2:3b` |

---

### 7-5. Hugging Face Inference — 테스트 예정

| 항목 | 내용 |
|------|------|
| 후보 모델 | `meta-llama/Llama-3.2-3B-Instruct`, `Qwen/Qwen2.5-0.5B-Instruct` |
| 연결 방법 | `LLM_MODEL=huggingface:모델ID` + `HUGGINGFACE_TOKEN` |
| 확인 필요 | Inference Providers 과금, Gated model 승인, 한국어 품질 |

---

## 8. 모델 비교표

| Provider | Model | 한국어 | 정확성 | 직무적합 | 맥락반영 | 환각방지 | 구조화 | 실행성 | 속도 | 비용 | 연결 | **총점** | 최종 판단 |
|----------|-------|:-----:|:-----:|:------:|:------:|:------:|:------:|:-----:|:----:|:----:|:----:|:--------:|-----------|
| Gemini | 2.5 Flash-Lite | 5 | 5 | 5 | 5 | 4 | 5 | 4 | 3 | 5 | 5 | **45** | ⭐ **기본 LLM** |
| Gemini | 2.5 Flash | 5 | 5 | 5 | 5 | 4 | 5 | 5 | 4 | 4 | 5 | **47** | 데모·발표용 |
| Mock | Mock Response | 3 | 1 | 1 | 2 | 5 | 2 | 1 | 5 | 5 | 5 | **30** | Fallback |
| Mistral | small-latest | — | — | — | — | — | — | — | — | — | — | — | 테스트 예정 |
| HuggingFace | Llama 3.2 3B | — | — | — | — | — | — | — | — | — | — | — | 테스트 예정 |
| Ollama | llama3.2:3b | — | — | — | — | — | — | — | — | — | — | — | 테스트 예정 |

> 총점 = 10개 항목 합계 (최대 50점). `—`는 미테스트.

---

## 9. 모델 선택 기준

CareerFit AI에서는 모델을 하나만 고정하지 않고, 상황에 따라 다르게 사용한다.

### 9-1. 기본 답변 생성 모델

| 항목 | 선택 |
|------|------|
| **1순위** | `gemini-2.5-flash-lite` |
| **2순위** | `gemini-2.5-flash` (품질·속도 우선 시) |
| **선택 이유** | 한국어 품질 우수, RAG 프롬프트 형식 준수, 무료 티어, `llm_service.py` 기본 연동 |

### 9-2. 무료 실습용 모델

| 항목 | 선택 |
|------|------|
| **1순위** | `gemini-2.5-flash-lite` |
| **2순위** | `MOCK_MODE=true` (API 호출 없이 파이프라인만 확인) |
| **3순위** | `ollama:llama3.2:3b` (로컬, 모델 설치 후) |

### 9-3. 한도 초과 대비 모델

| 항목 | 선택 |
|------|------|
| **1순위** | `MOCK_MODE=true` |
| **2순위** | `ollama:llama3.2:3b` |
| **전환 방법** | `.env`에서 `MOCK_MODE=true` 또는 `LLM_MODEL` 변경 후 서버 재시작 |

### 9-4. provider 전환 방법

```bash
# backend/.env 예시

# 기본 (권장)
MOCK_MODE=false
LLM_MODEL=gemini-2.5-flash-lite

# 품질 우선
# LLM_MODEL=gemini-2.5-flash

# API 한도 초과 시
MOCK_MODE=true

# 로컬 Ollama
# LLM_MODEL=ollama:llama3.2:3b

# HuggingFace
# LLM_MODEL=huggingface:meta-llama/Llama-3.2-3B-Instruct
```

---

## 10. 최종 선택 기록

### 최종 선택 모델

| 용도 | 선택 모델 | 선택 이유 |
|------|-----------|-----------|
| **기본 LLM** | Gemini 2.5 Flash-Lite | 한국어·RAG 형식 준수 우수, 무료 티어, 수업 권장 |
| **데모·발표** | Gemini 2.5 Flash | 답변 품질·구조화 약간 우수, RAG 응답 10.5s |
| **임베딩 모델** | ChromaDB 기본 임베딩 | 별도 설정 없이 `rag_service.py`에서 사용 중 |
| **무료 실습용** | Gemini 2.5 Flash-Lite + Mock | Lite로 실습, 한도 소진 시 Mock 전환 |
| **한도 초과 대비** | Mock Response | API 키·한도 없이 수업·파이프라인 검증 가능 |

### 선택 근거

```text
1. Gemini 2.5 Flash-Lite는 CareerFit AI RAG 프롬프트(3단 구조, 공고 인용)를
   가장 안정적으로 따르며, 한국어 커리어 조언 품질이 높다.

2. Gemini 2.5 Flash는 품질·속도 면에서 우수하나 무료 한도 소진이 빠르므로
   일상 실습보다 발표·데모에 적합하다.

3. Mock은 AI 품질 평가 대상이 아니나, API 429 오류·오프라인 환경에서
   FastAPI + RAG + sources 응답 구조를 검증하는 데 필수적이다.

4. Ollama·HuggingFace는 코드 연동은 완료되었으나, 2026-07-06 기준
   본격 벤치마크는 미완료. 추후 동일 질문 세트로 비교 예정.
```

---

## 11. README 반영 내용

README `AI Model` 섹션에 아래 내용을 반영한다.

```markdown
## AI Model

- **Main LLM:** Gemini 2.5 Flash-Lite (`gemini-2.5-flash-lite`)
- **Demo LLM:** Gemini 2.5 Flash (`gemini-2.5-flash`)
- **Embedding:** ChromaDB default embedding
- **Fallback:** `MOCK_MODE=true` 또는 `ollama:llama3.2:3b`
- **Model Benchmark:** [MODEL_BENCHMARK.md](./docs/MODEL_BENCHMARK.md)
```

---

## 12. 커밋 메시지 예시

```bash
# 문서 최초 추가
docs(model): 모델 벤치마크 문서 추가

# 비교 결과 업데이트
docs(model): 모델 비교 결과 업데이트

# README 반영
docs(readme): 사용 모델 정보 추가
```

---

## 13. 참고 자료

| 자료 | URL / 위치 |
|------|-----------|
| Google Gemini API | https://ai.google.dev/ |
| Hugging Face Models | https://huggingface.co/models |
| HF Inference Providers | https://huggingface.co/docs/inference-providers |
| Ollama | https://ollama.com/ |
| 프로젝트 LLM 서비스 | `backend/services/llm_service.py` |
| 벤치마크 스크립트 | `backend/data/benchmark_models.py` |
| 벤치마크 결과 JSON | `backend/data/benchmark_results.json` |

**주의:** 공개 리더보드 점수는 후보를 좁히는 참고 자료로만 사용한다. 최종 선택은 CareerFit AI 실제 질문 세트와 RAG 연동 결과 기준으로 판단한다.

---

## 14. 다음 작업 (TODO)

- [ ] `ollama pull llama3.2:3b` 후 Ollama 벤치마크 실행
- [ ] HuggingFace `Llama-3.2-3B-Instruct` 과금·품질 테스트
- [ ] Mistral `mistral-small-latest` Gemini 대체 테스트
- [ ] 섹션 6 전체 질문 세트를 모든 모델에 실행 후 비교표 갱신
- [ ] README `AI Model` 섹션 반영
