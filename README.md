# CareerFit AI

> 취업·공모전 데이터 기반 맞춤형 AI 포트폴리오 코치

---

## 프로젝트 개요

CareerFit AI는 대학생과 취업 준비생이 **전공, 기술 스택, 관심 직무**를 입력하면 AI가 **채용 공고(jobs)** 와 **공모전(competitions)** 데이터를 분석하여 맞춤형 조언을 제공하는 플랫폼이다.

### 핵심 기능

| 기능 | 설명 | 상태 |
|------|------|------|
| 채용 공고 탐색 | `GET /jobs` — 취업 공고 목록·상세 조회 | ✅ 목업 (DB 연동 예정) |
| AI 맞춤 분석 | `POST /analyze` — Gemini 기반 커리어 조언 | ✅ MOCK/Gemini 연동 |
| 데이터 파이프라인 | CSV → 전처리 → SQLite → RAG JSON | 🔄 jobs 완료, competitions 예정 |
| RAG 검색 | ChromaDB 벡터 검색 후 AI 답변 | ⬜ 예정 |

### 프로젝트 범위

> **포함:** `jobs.csv`(채용 공고) + `competitions.csv`(공모전)  
> **제외:** 대학원·연구실 추천 (데이터 수집 난이도로 범위에서 제외)

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| IDE | Cursor |
| 언어 | Python 3.11 |
| 백엔드 | FastAPI 0.115.5, Uvicorn 0.32.1 |
| AI API | Gemini 2.5 Flash-Lite (`google-generativeai`) |
| 로컬 LLM (선택) | Ollama (`ollama_service.py`) |
| 데이터 처리 | Pandas 2.2.3 |
| 저장소 | SQLite (`careerfit.db`), ChromaDB 0.6.3 (예정) |
| 프론트엔드 | React + Vite (예정) |
| 실행 환경 | Docker (예정) |

---

## 프로젝트 구조

```
careerfit_ai_new/
├── backend/
│   ├── main.py                     # FastAPI 앱 진입점, CORS·라우터 등록
│   ├── requirements.txt            # Python 패키지 목록
│   ├── .env                        # 환경 변수 (Git 미포함)
│   ├── data/
│   │   ├── jobs.csv                # 취업 공고 원본 (18건)
│   │   ├── competitions.csv        # 공모전 원본
│   │   ├── preprocess.py           # 데이터 전처리 파이프라인
│   │   ├── careerfit.db            # SQLite DB (전처리 후 15건)
│   │   └── rag_documents.json      # RAG 문서 JSON (preprocess 실행 시 생성)
│   ├── routers/
│   │   ├── health.py               # GET /health
│   │   ├── jobs.py                 # GET /jobs, /jobs/{id}
│   │   └── analyze.py              # POST /analyze
│   └── services/
│       ├── llm_service.py          # Gemini API / MOCK_MODE
│       └── ollama_service.py       # Ollama 로컬 LLM (선택)
├── docs/
│   ├── PROJECT_PLAN.md             # 프로젝트 기획서
│   ├── CHECKLIST.md                # 일차별 체크리스트
│   ├── PROMPTS.md                  # 바이브코딩 프롬프트
│   └── EVAL_QUESTIONS.md             # 자기 평가 질문
├── .env.example
└── README.md
```

---

## 빠른 시작

### 1. 환경 변수 설정

| 변수 | 설명 |
|------|------|
| `GEMINI_API_KEY` | Google Gemini API 키 |
| `MOCK_MODE` | `true`: 목업 응답 / `false`: 실제 Gemini 호출 |
| `LLM_MODEL` | Gemini 모델명 (기본: `gemini-2.5-flash-lite`) |
| `HUGGINGFACE_TOKEN` | HuggingFace 토큰 (ChromaDB 임베딩용, 예정) |

> ⚠️ `.env` 파일은 **절대 GitHub에 올리지 않는다.**

### 3. 데이터 전처리 실행

```bash
cd backend
source venv/bin/activate
python3 data/preprocess.py
```

**실행 결과:**
- `careerfit.db` — SQLite에 jobs 15건 저장
- `rag_documents.json` — RAG용 자연어 문서 15건 생성

### 4. FastAPI 서버 실행

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8080
```

- Swagger UI: http://localhost:8080/docs
- 서버 확인: http://localhost:8080/

---

## 데이터 파이프라인 (`preprocess.py`)

`python3 data/preprocess.py` 실행 시 10단계가 순서대로 진행된다.

| 단계 | 함수 | 설명 | 입출력 |
|------|------|------|--------|
| 1 | `load_data()` | CSV 읽기 (UTF-8 → CP949 폴백) | `jobs.csv` 18행 |
| 2 | `check_missing()` | 결측치 수·비율 확인 | 콘솔 출력 |
| 3 | `handle_missing()` | 핵심 컬럼 빈 행 제거, 텍스트 빈칸 채우기 | 18 → 16행 |
| 4 | `remove_duplicates()` | company+title 중복 제거 | 16 → 15행 |
| 5 | `standardize_skills()` | 스킬 키워드 표준화 (`python` → `Python`) | 15행 |
| 6 | `save_to_sqlite()` | SQLite DB 저장 | `careerfit.db` |
| 7 | `query_sqlite()` | 저장 결과 SQL 조회 테스트 | 콘솔 출력 |
| 8 | `convert_to_rag_documents()` | RAG용 자연어 문서 변환 | list |
| 9 | `save_rag_documents()` | JSON 파일 저장 | `rag_documents.json` |
| 10 | 완료 메시지 | 최종 행 수·문서 수 출력 | — |

### RAG 문서 변환 예시

```json
{
  "text": "테크스타트업A에서 데이터 분석가를 채용합니다. 필수 스킬은 Python, SQL, 통계입니다...",
  "metadata": {
    "id": "1",
    "company": "테크스타트업A",
    "title": "데이터 분석가",
    "job_type": "데이터 분석",
    "deadline": "2026-08-31",
    "source": "jobs.csv"
  },
  "doc_id": "job_1"
}
```

---

## SQLite 조회

```bash
cd backend/data

# Python 필요 공고 3건 조회
sqlite3 -header -column careerfit.db \
  "SELECT company, title, required_skills FROM jobs WHERE required_skills LIKE '%Python%' LIMIT 3;"

# 전체 공고 수
sqlite3 careerfit.db "SELECT COUNT(*) FROM jobs;"

# 직무별 공고 수
sqlite3 careerfit.db "SELECT job_type, COUNT(*) FROM jobs GROUP BY job_type;"

# 대화형 모드
sqlite3 careerfit.db
# sqlite> .tables
# sqlite> SELECT * FROM jobs LIMIT 3;
# sqlite> .quit
```

### `LIKE '%Python%'` 설명

| 기호 | 역할 |
|------|------|
| `%` (앞) | Python 앞에 다른 글자가 있어도 OK |
| `Python` | 이 단어가 포함되어야 함 |
| `%` (뒤) | Python 뒤에 다른 글자가 있어도 OK |

예: `"Python, SQL, 통계"` ✅ / `"Java, SQL"` ❌

---

## API 엔드포인트

### `GET /` — 서버 확인

```json
{ "message": "CareerFit AI 서버가 실행 중입니다." }
```

### `GET /health` — 헬스체크

```json
{
  "status": "ok",
  "message": "CareerFit AI 서버가 정상 동작 중입니다."
}
```

### `GET /jobs` — 취업 공고 목록

> 현재 `jobs.py`의 **목업 데이터 3건** 반환. SQLite 연동은 다음 단계.

```json
{
  "count": 3,
  "jobs": [
    {
      "id": 1,
      "company": "현대모비스",
      "title": "자율주행 인지 AI 엔지니어",
      "required_skills": ["Python", "PyTorch", "Computer Vision"],
      "deadline": "2026-08-31"
    }
  ]
}
```

### `GET /jobs/{job_id}` — 공고 상세

- 존재하는 ID → 공고 JSON 반환
- 없는 ID → `404 Not Found`

### `POST /analyze` — AI 맞춤 분석

**요청:**

```json
{
  "major": "통계학과",
  "skills": ["Python", "SQL"],
  "job_type": "데이터 분석"
}
```

**응답 (MOCK_MODE=true):**

```json
{
  "answer": "[MOCK 응답] MOCK_MODE=true 상태입니다. 질문 '전공: 통계학과, ...'에 대한 실제 응답은 .env에서 MOCK_MODE=false 로 설정하면 받을 수 있습니다.",
  "sources": [{ "title": "mock", "content": "mock 데이터" }]
}
```

**처리 흐름:**

```
사용자 입력 (AnalyzeRequest)
    ↓
analyze.py — query 문자열 생성
    ↓
llm_service.get_llm_response(query, context_docs=[])
    ↓
MOCK_MODE=true  → 목업 응답
MOCK_MODE=false → build_prompt() → Gemini 2.5 Flash-Lite
    ↓
AnalyzeResponse (answer + sources)
```

---

## 데이터 파일

### `backend/data/jobs.csv` (18건 → 전처리 후 15건)

| 컬럼 | 설명 |
|------|------|
| `id` | 공고 고유 ID |
| `company` | 회사명 |
| `title` | 직무명 |
| `required_skills` | 필수 스킬 |
| `preferred_skills` | 우대 스킬 |
| `description` | 업무 설명 |
| `job_type` | 직무 유형 |
| `deadline` | 마감일 |

**직접 추가한 데이터 분석 공고:**

| id | company | title | deadline |
|----|---------|-------|----------|
| 16 | 네오데이터솔루션 | 데이터 분석가 | 2026-08-15 |
| 17 | 한빛AI랩 | 주니어 데이터 애널리스트 | 2026-08-22 |
| 18 | 스마트인사이트테크 | BI 데이터 분석가 | 2026-08-30 |

> CSV에는 의도적 노이즈(대소문자 혼용, 빈 필드, 중복 행, 날짜 형식 불일치)가 포함되어 전처리 실습에 활용한다.

### `backend/data/competitions.csv`

| 컬럼 | 설명 |
|------|------|
| `id` | 공모전 ID |
| `name` | 공모전명 |
| `organizer` | 주최기관 |
| `field` | 분야 |
| `required_skills` | 요구 기술 |
| `eligibility` | 참가 자격 |
| `prize` | 상금 |
| `deadline` | 마감일 |

> competitions 전처리 및 ChromaDB 연동은 다음 단계 예정.

---

## 진행 현황

### ✅ 1일차: 프로젝트 기획 및 개발 환경 세팅

- [x] 프로젝트 기획서 작성 (`docs/PROJECT_PLAN.md`)
  - 문제 정의: 채용 공고·공모전 정보 탐색의 어려움
  - 범위 조정: 대학원·연구실 제외 → **jobs + competitions**
- [x] 데이터 계획 수립 (사용자 프로필, 채용 공고, 공모전)
- [x] Cursor IDE 및 GitHub 저장소 세팅
- [x] 프로젝트 폴더 구조 설계

---

### ✅ 2일차: FastAPI 서버 구축 및 Gemini API 연결

#### Python 환경
- [x] `backend/` 가상환경(`venv`) 생성 및 활성화
- [x] `requirements.txt` 패키지 설치
- [x] chromadb·transformers 의존성 충돌 해결 (chromadb 0.6.3)

#### 환경 변수
- [x] `.env` / `.env.example` 설정 (`GEMINI_API_KEY`, `MOCK_MODE`, `LLM_MODEL`, `HUGGINGFACE_TOKEN`)
- [x] `MOCK_MODE` 분기 — 목업 / 실제 Gemini 전환

#### FastAPI 서버
- [x] FastAPI 앱 생성, Swagger `/docs` 확인
- [x] CORS 미들웨어 (`localhost:5173` 허용)
- [x] `health`, `jobs`, `analyze` 라우터 등록
- [x] `uvicorn main:app --reload --port 8080` 실행 확인

#### API
- [x] `GET /`, `GET /health`
- [x] `GET /jobs`, `GET /jobs/{job_id}` — MOCK_JOBS 3건
- [x] `POST /analyze` — Pydantic 모델 + `llm_service` 연동

#### LLM 서비스 (`llm_service.py`)
- [x] `MOCK_MODE` / Gemini 2.5 Flash-Lite 분기
- [x] `build_prompt()` — 사용자 정보 + RAG 컨텍스트 프롬프트
- [x] `get_llm_response()` — API 호출 및 429 한도 초과 폴백
- [x] `ollama_service.py` — Ollama 로컬 LLM (선택적)

#### 데이터
- [x] `jobs.csv` 18건 (데이터 분석 3건 포함)
- [x] `competitions.csv` 준비

---

### 🔄 3일차: 데이터 파이프라인 구축 (진행 중)

#### 완료
- [x] `preprocess.py` 작성
  - [x] CSV 로드 (`load_data`)
  - [x] 결측치 확인·처리 (`check_missing`, `handle_missing`)
  - [x] 중복 제거 (`remove_duplicates`)
  - [x] 스킬 키워드 표준화 (`standardize_skills`, `SKILL_NORMALIZATION`)
  - [x] SQLite 저장 (`save_to_sqlite`) → `careerfit.db` 15건
  - [x] SQLite 조회 테스트 (`query_sqlite`)
  - [x] RAG 문서 변환 (`convert_to_rag_documents`)
  - [x] RAG JSON 저장 (`save_rag_documents`)
- [x] SQLite 터미널 조회 (`sqlite3 careerfit.db "SELECT ..."`)
- [x] `analyze.py` — `get_llm_response()` 연결 (MOCK_MODE 동작 확인)

#### 남은 작업
- [x] `competitions.csv` 전처리 및 DB/RAG 추가
- [x] ChromaDB 벡터 임베딩 및 RAG 검색 파이프라인
- [x] `GET /jobs` API → SQLite `careerfit.db` 연동
- [x] `POST /analyze` → ChromaDB 검색 결과를 `context_docs`에 전달

---

### ⬜ 4일차: RAG 기반 서비스 + React UI (예정)

- [x] `analyze` API에 ChromaDB RAG 컨텍스트 연동
- [x] React + Vite 프론트엔드 UI
- [x] FastAPI ↔ React 연동


### 5일차: Docker + 포트폴리오 완성 (예정)
- [x] Dockerfile 작성 완료
- [x] Docker build 성공
- [x] Docker run 후 /health 접속 확인
- [x] README 최종화 완료
- [x] .env 미포함 보안 확인
- [x] 최종 하네스 파일 업데이트 완료
- [x] GitHub 최종 커밋 완료

---

## 트러블슈팅

### `Address already in use` (포트 8080 충돌)

```bash
lsof -i :8080          # 사용 중인 프로세스 확인
kill <PID>             # 종료
# 또는 실행 중인 터미널에서 Ctrl + C
```

### `422 Unprocessable Entity` (JSON 형식 오류)

Swagger `/docs` Request body JSON 문법 오류.

```json
{
  "major": "통계학과",
  "skills": ["Python", "SQL"],
  "job_type": "데이터 분석"
}
```

- 큰따옴표(`"`)만 사용
- `"키": "값"` 콜론 필수
- 마지막 항목 뒤 쉼표 금지

### `MOCK_MODE`가 적용되지 않을 때

1. `analyze.py`가 `get_llm_response()`를 호출하는지 확인
2. `.env`에 `MOCK_MODE=true` 설정
3. `.env` 수정 후 서버 재시작 (`Ctrl + C` → uvicorn)
4. `/docs` 새로고침(F5) 후 Execute

### Git push가 안 될 때

```bash
git status             # 변경 파일 확인
git add .              # (.env 제외!)
git commit -m "메시지"
git push origin main
```

commit 없이 push하면 "Everything up-to-date"로 아무것도 올라가지 않는다.

---

## 참고 문서

| 파일 | 내용 |
|------|------|
| `docs/PROJECT_PLAN.md` | 프로젝트 기획서 (jobs + competitions 범위) |
| `docs/CHECKLIST.md` | 일차별 실습 체크리스트 |
| `docs/PROMPTS.md` | 바이브코딩 프롬프트 모음 |
| `docs/EVAL_QUESTIONS.md` | 자기 평가 질문 |
| `harness/skills/design-skill.md` | React UI 디자인 스킬 |
| [TailGrids](https://github.com/TailGrids/tailgrids) (MIT) | UI Card·Form 스타일 참고 |
