# CareerFit AI Frontend

CareerFit AI의 React/Vite 프론트엔드입니다. 사용자가 전공, 보유 스킬, 관심 직무를 입력하면 FastAPI 백엔드의 `/analyze/stream` API를 호출하고, AI 분석 결과와 참고 공고를 화면에 표시합니다.

## 주요 구성

```text
frontend/
├── src/
│   ├── App.jsx                 # 메인 화면, SSE 스트리밍 처리
│   ├── components/
│   │   ├── InputForm.jsx       # 사용자 입력 폼
│   │   ├── ResultCard.jsx      # AI 분석 결과
│   │   └── SourceCard.jsx      # 참고 공고 목록
│   ├── config/
│   │   └── api.js              # 백엔드 API 주소 관리
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
├── Dockerfile
└── vite.config.js
```

## 실행 방법

```bash
npm install
npm run dev
```

로컬 접속 주소:

```text
http://localhost:5173
```

## 환경 변수

`.env` 파일을 생성하고 백엔드 주소를 설정합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
```

Render 등 배포 환경에서는 실제 백엔드 주소를 넣습니다.

```env
VITE_API_BASE_URL=https://careerfit-ai-2vpe.onrender.com
```

## 빌드

```bash
npm run build
```

빌드 결과는 `dist/` 폴더에 생성됩니다.

## Docker

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8080 \
  -t careerfit-ai-frontend .

docker run -p 3000:3000 -e PORT=3000 careerfit-ai-frontend
```

## 백엔드 연동

프론트엔드는 기본적으로 아래 API를 사용합니다.

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `POST` | `/analyze/stream` | SSE 기반 AI 분석 스트리밍 |

요청 데이터:

```json
{
  "major": "통계학과",
  "skills": ["Python", "SQL"],
  "job_type": "데이터 분석"
}
```

응답은 `sources`, `token`, `done`, `error` 이벤트로 처리됩니다.
