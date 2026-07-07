# Render 프론트엔드 배포 가이드

CareerFit AI React/Vite 프론트엔드를 **Docker 기반 Render Web Service**로 배포하고, 이미 배포된 FastAPI 백엔드와 연결하는 방법입니다.

---

## 1. 로컬 실행 방법

### 백엔드 (터미널 1)

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8080
```

### 프론트엔드 (터미널 2)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

브라우저: http://localhost:5173

로컬 확인:

```bash
curl http://localhost:8080/health
```

---

## 2. 프론트엔드 환경변수 설정

`frontend/.env` (Git에 올리지 않음):

```env
VITE_API_BASE_URL=http://localhost:8080
```

| 변수 | 설명 |
|------|------|
| `VITE_API_BASE_URL` | FastAPI 백엔드 주소. 미설정 시 `http://localhost:8080` |

> Vite는 **빌드 시점**에 `VITE_*` 값을 JS 번들에 넣습니다. Render 배포 시 Render 대시보드에서도 동일 변수를 설정해야 합니다.

---

## 3. 백엔드 CORS 환경변수 설정

`backend/.env` (Git에 올리지 않음):

```env
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,https://your-frontend-service.onrender.com
```

| 변수 | 설명 |
|------|------|
| `FRONTEND_ORIGINS` | 허용할 프론트 origin. 쉼표(`,`)로 여러 개 지정 |

`FRONTEND_ORIGINS`를 비우면 아래 로컬 origin만 기본 허용됩니다.

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:3000`
- `http://127.0.0.1:3000`

> Render 백엔드 서비스의 **Environment**에도 프론트 URL을 `FRONTEND_ORIGINS`에 추가해야 CORS 오류가 나지 않습니다.

---

## 4. 프론트엔드 Dockerfile 설명

경로: `frontend/Dockerfile`

| 단계 | 내용 |
|------|------|
| `build` | `npm ci` → `npm run build` (Vite 정적 파일 생성) |
| `production` | `serve`로 `dist/` 정적 서빙 |

빌드 인자:

```dockerfile
ARG VITE_API_BASE_URL=http://localhost:8080
```

로컬 Docker 테스트:

```bash
cd frontend
docker build \
  --build-arg VITE_API_BASE_URL=https://your-backend.onrender.com \
  -t careerfit-frontend .
docker run -p 3000:3000 -e PORT=3000 careerfit-frontend
```

---

## 5. Render에서 프론트엔드 Docker Web Service 배포

### 5-1. 사전 준비

- GitHub에 `main` 브랜치 푸시 완료
- 백엔드 FastAPI가 Render Web Service로 이미 배포됨
- 백엔드 URL 예: `https://careerfit-api.onrender.com`

### 5-2. Render에서 새 Web Service 생성

1. [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**
2. GitHub 저장소 연결
3. 설정:

| 항목 | 값 |
|------|-----|
| **Name** | `careerfit-frontend` (원하는 이름) |
| **Region** | 백엔드와 동일 권장 |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Runtime** | **Docker** |
| **Dockerfile Path** | `Dockerfile` (Root Directory 기준) |

### 5-3. Render 환경변수 (프론트엔드)

| Key | Value 예시 |
|-----|------------|
| `VITE_API_BASE_URL` | `https://careerfit-api.onrender.com` |

> Docker 빌드 시 Vite가 이 값을 읽으므로, Render의 **Environment** 탭에 반드시 추가하세요.

### 5-4. Render 환경변수 (백엔드 — CORS)

백엔드 서비스 **Environment**에 추가/수정:

| Key | Value 예시 |
|-----|------------|
| `FRONTEND_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173,https://careerfit-frontend.onrender.com` |
| `GEMINI_API_KEY` | (본인 Gemini API Key) |

백엔드 재배포 후 CORS가 적용됩니다.

### 5-5. 배포 완료

프론트 URL 예: `https://careerfit-frontend.onrender.com`

---

## 6. 배포 후 확인 방법

1. 프론트 URL 접속 → CareerFit 화면 로드
2. 전공·스킬·직무 입력 → **맞춤 분석 시작**
3. 브라우저 개발자 도구 → **Network** 탭
   - `https://your-backend.onrender.com/analyze/stream` 요청이 `200` 또는 SSE 스트림이면 성공
4. 백엔드 직접 확인:

```bash
curl https://your-backend.onrender.com/health
```

---

## 7. CORS 오류 해결 방법

증상: 브라우저 콘솔에 `blocked by CORS policy`

체크리스트:

1. **백엔드 `FRONTEND_ORIGINS`**에 프론트 URL이 **정확히** 포함되어 있는지 확인
   - `https://` vs `http://` 구분
   - 끝에 `/` 없이 origin만 (`https://careerfit-frontend.onrender.com`)
2. 백엔드 환경변수 변경 후 **재배포**했는지 확인
3. 프론트 `VITE_API_BASE_URL`이 **백엔드 URL**을 가리키는지 확인
4. `allow_origins=["*"]`로 우회하지 말 것 — 이 프로젝트는 명시적 origin만 허용

로컬에서만 테스트할 때는 `FRONTEND_ORIGINS` 없이도 기본 로컬 origin 4개가 허용됩니다.

---

## 8. Git에 올리면 안 되는 파일

| 파일/폴더 | 이유 |
|-----------|------|
| `.env` | API Key, 비밀값 |
| `.env.local`, `.env.production` | 환경별 비밀값 |
| `backend/.env` | `GEMINI_API_KEY` 등 |
| `frontend/.env` | `VITE_API_BASE_URL` (배포 URL 노출 방지) |
| `node_modules/` | 용량, 재설치 가능 |
| `dist/` | 빌드 산출물 |
| `venv/`, `.venv/` | 로컬 Python 환경 |
| `__pycache__/` | Python 캐시 |

**올려도 되는 것:** `.env.example`, `backend/.env.example`, `frontend/.env.example`

---

## 9. API 연결 구조 요약

```
[브라우저] → VITE_API_BASE_URL (Render 백엔드)
                ↓
         FastAPI /health, /jobs, /analyze
                ↑
         FRONTEND_ORIGINS에 프론트 URL 등록 필요
```

공통 설정 파일: `frontend/src/config/api.js`

```js
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
).replace(/\/$/, "");
```

---

## 10. 최종 확인 체크리스트

- [ ] `frontend/.env.example` 복사 → 로컬 `.env` 작성
- [ ] `backend/.env.example` 참고 → 로컬/Render 백엔드 env 설정
- [ ] 로컬: 백엔드 `:8080` + 프론트 `:5173` 동작
- [ ] Render 프론트: `VITE_API_BASE_URL` = 백엔드 URL
- [ ] Render 백엔드: `FRONTEND_ORIGINS`에 프론트 URL 포함
- [ ] `.env` 파일이 `git status`에 안 나오는지 확인
- [ ] 배포 후 `/health` 및 분석 요청 테스트
