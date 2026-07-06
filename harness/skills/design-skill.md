# CareerFit AI Design Skill

> **대상:** React + Tailwind CSS 프론트엔드 바이브코딩  
> **사용자:** 대학생·취업 준비생  
> **톤:** 전문성(신뢰) + 친근함(부담 없는 상담)

---

## 0. 디자인 목표

CareerFit AI는 **취업·공모전 데이터 기반 AI 포트폴리오 코치**처럼 보여야 한다.

| 원칙 | 설명 |
|------|------|
| 신뢰 | 출처(sources)가 보이고, 과장된 UI 없이 정돈된 카드 레이아웃 |
| 친근 | 딱딱한 기업 포털이 아닌, 상담 받는 느낌의 여백·문장 톤 |
| 설명 가능 | 발표 시 "입력 → 결과 → 근거" 흐름을 화면만 보고 설명 가능 |
| 단순 | 한 화면에 핵심만. 화려한 애니메이션·불필요한 차트 금지 |

---

## 1. 컬러 팔레트 (Tailwind CSS)

### 1-1. 시맨틱 토큰

| 역할 | Tailwind 클래스 | HEX 참고 | 용도 |
|------|-----------------|----------|------|
| **primary** | `blue-600` / hover: `blue-700` | `#2563eb` | CTA 버튼, 포커스 링(`ring-blue-500`), 주요 액션 |
| **secondary** | `emerald-500` / `emerald-600` | `#10b981` | 분석 결과 강조, 성공 상태, ResultCard 좌측 악센트 |
| **background** | `slate-50` (페이지) / `white` (카드) | `#f8fafc` / `#ffffff` | 전체 배경·카드 본문 |
| **text** | `slate-800` (제목) / `slate-600` (본문) / `slate-500` (보조) | `#1e293b` / `#475569` / `#64748b` | h1·h2, 본문, placeholder·캡션 |
| **border** | `slate-200` (카드) / `slate-300` (input) | `#e2e8f0` / `#cbd5e1` | 카드 외곽, 입력 필드 테두리 |
| **error** | `bg-red-50` `border-red-200` `text-red-700` | — | API 오류, 연결 실패 메시지 |

### 1-2. 보조 색 (상태·강조)

| 역할 | Tailwind | 용도 |
|------|----------|------|
| loading | `text-slate-500` | "분석 중입니다..." |
| disabled | `bg-slate-300` `text-white` | 버튼 비활성 |
| empty / no sources | `bg-slate-50` `text-slate-500` | 출처 없음 안내 |
| focus | `ring-2 ring-blue-500` | input·button 키보드 포커스 |

### 1-3. 사용 규칙

```text
✅ primary는 버튼·포커스에만 — 남용 금지
✅ secondary(emerald)는 ResultCard·성공 피드백에만
✅ 페이지 배경은 slate-50, 카드는 white로 레이어 구분
✅ 텍스트 대비: 본문 slate-600 이상, 보조 slate-500 이하

❌ purple·pink·gradient 남용 금지 (학생 서비스 톤 이탈)
❌ primary와 secondary를 같은 요소에 동시 적용 금지
❌ error 색을 일반 본문·장식에 사용 금지
```

### 1-4. tailwind.config.js 확장 (선택)

팀에서 색 이름을 통일하려면 `theme.extend.colors`에 시맨틱 이름을 추가할 수 있다.

```js
// 예시 — 적용은 선택
colors: {
  primary: { DEFAULT: "#2563eb", hover: "#1d4ed8" },
  secondary: { DEFAULT: "#10b981" },
}
```

바이브코딩 초기에는 **Tailwind 기본 팔레트 클래스를 그대로** 쓰고, 위 표의 클래스명을 따른다.

---

## 2. 타이포그래피 규칙

### 2-1. 폰트

| 항목 | Tailwind / CSS | 비고 |
|------|----------------|------|
| 기본 폰트 | `font-sans` (시스템 UI) | Pretendard·Noto Sans KR 추가는 선택 |
| 코드·스킬 | `font-mono text-xs` | 인라인 스킬 태그에만 |

### 2-2. 크기·굵기 계층

| 요소 | 클래스 | 예시 |
|------|--------|------|
| 서비스명 (h1) | `text-2xl font-bold text-slate-800` | CareerFit AI |
| 서비스 설명 | `text-sm text-slate-500` | 한 줄 부제 |
| 카드 제목 (h2) | `text-lg font-semibold text-slate-700` | 내 정보 입력, AI 분석 결과 |
| 라벨 | `text-sm font-medium text-slate-600` | 전공, 보유 스킬 |
| 본문·답변 | `text-sm text-slate-600 leading-relaxed` | ResultCard answer |
| 캡션·메타 | `text-xs text-slate-500` | 필수 스킬, 출처 부가 정보 |
| 버튼 | `text-sm font-medium` | 역량 분석 요청 |

### 2-3. 줄간격·줄바꿈

| 상황 | 클래스 |
|------|--------|
| AI 답변 (줄바꿈 유지) | `whitespace-pre-line` |
| 일반 문단 | `leading-relaxed` |
| 카드 내부 간격 | `space-y-4` (폼), `space-y-3` (목록) |

### 2-4. 문장 톤 (UI 카피)

- **친근:** "~해 주세요", "내 정보 입력", "분석 중입니다..."
- **전문:** "참고한 공고 출처", "역량 분석 요청" — 반말·과한 이모지 지양
- 이모지는 카드 제목에 **최대 1개** (📊, 📄) — 남용 금지

---

## 3. 컴포넌트 구조

```
frontend/src/
├── App.jsx                 # 페이지 셸, API 호출, 상태 관리
└── components/
    ├── InputForm.jsx       # 사용자 입력 폼
    ├── ResultCard.jsx      # AI 분석 결과
    └── SourceCard.jsx      # RAG 출처 목록
```

### 3-1. App.jsx — 페이지 셸

**역할:** 레이아웃, `fetch` 호출, `loading` / `error` / `result` 상태 분기

| 책임 | 내용 |
|------|------|
| 레이아웃 | `min-h-screen bg-slate-50`, `max-w-2xl mx-auto` |
| 헤더 | h1 + 한 줄 설명 |
| 자식 배치 | InputForm → error → loading → (ResultCard + SourceCard) |
| API | `POST /analyze` — Key는 절대 프론트에 두지 않음 |

**상태 UI 순서 (위 → 아래):**

```text
Header
  ↓
InputForm
  ↓
error (있을 때만)
  ↓
loading (요청 중)
  ↓
result: ResultCard → SourceCard
```

### 3-2. InputForm.jsx — 입력

**Props:** `onSubmit(formData)`, `isLoading`

| 필드 | state | 전송 키 |
|------|-------|---------|
| 전공 | `major` | `major` |
| 보유 스킬 (쉼표 구분) | `skillsInput` → 배열 변환 | `skills` |
| 관심 직무 | `jobType` | `job_type` (App에서 변환) |

**스타일 패턴:**

```text
컨테이너: bg-white rounded-xl shadow-sm border border-slate-200 p-6
input:    w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
button:   w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300
          text-white font-medium py-2 px-4 rounded-lg text-sm
```

### 3-3. ResultCard.jsx — 분석 결과

**Props:** `answer` (string)

| 요소 | 스타일 |
|------|--------|
| 카드 | `bg-white rounded-xl shadow-sm border-l-4 border-emerald-500 p-6` |
| 제목 | `text-lg font-semibold text-slate-700` |
| 본문 | `text-sm text-slate-600 leading-relaxed whitespace-pre-line` |

- `answer`는 **텍스트로만** 렌더 (`dangerouslySetInnerHTML` 금지)
- 마크다운 렌더링이 필요하면 별도 라이브러리·컴포넌트 도입 후 이 문서 업데이트

### 3-4. SourceCard.jsx — 출처

**Props:** `sources` (array)

| 필드 표시 | API 키 |
|-----------|--------|
| 회사 — 직무 | `company`, `title` |
| 필수 스킬 | `required_skills` |

| 상태 | UI |
|------|-----|
| `sources` 비어 있음 | `bg-slate-50` 안내 카드 — "참고한 공고 데이터가 없습니다." |
| 목록 있음 | `white` 카드 + `border-b border-slate-100` 구분선 |

- **출처 카드는 성공 시 반드시 표시** (빈 배열이어도 empty 상태 UI)
- `key`는 가능하면 `doc_id` 등 고유값, 없을 때만 `index`

---

## 4. 레이아웃 규칙

### 4-1. 페이지 그리드

```text
┌─────────────────────────────────────┐
│  py-10 px-4  (페이지 패딩)           │
│  ┌─────────────────────────────┐    │
│  │ max-w-2xl mx-auto (672px)   │    │
│  │                             │    │
│  │  [Header]                   │    │
│  │  [InputForm]                │    │
│  │  [Error / Loading]          │    │
│  │  [ResultCard]               │    │
│  │  [SourceCard]               │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 4-2. 간격 (Spacing)

| 위치 | Tailwind |
|------|----------|
| 헤더 → 폼 | `mb-8` (설명), 폼 자체 `mb` 없음 |
| 폼 → error | `mt-4` |
| 폼 → loading / result | `mt-8` |
| ResultCard ↔ SourceCard | `space-y-4` (부모) |
| 카드 내부 패딩 | `p-6` (기본), empty 상태 `p-4` |

### 4-3. 카드 공통 패턴

```text
기본 카드:  bg-white rounded-xl shadow-sm border border-slate-200 p-6
강조 카드:  border-l-4 border-emerald-500 (ResultCard만)
안내 카드:  bg-slate-50 rounded-xl border border-slate-200 p-4
오류 박스:  bg-red-50 border border-red-200 rounded-lg p-4
```

### 4-4. 반응형

| 브레이크포인트 | 규칙 |
|----------------|------|
| 모바일 (기본) | `px-4`, 카드 full width |
| `sm` 이상 | 동일 `max-w-2xl` — 단일 컬럼 유지 |
| 데스크톱 | 2컬럼·사이드바 **도입 금지** (MVP 범위) |

### 4-5. UI 상태 (반드시 구분)

| 상태 | 표시 위치 | 스타일 |
|------|-----------|--------|
| `empty` | InputForm만 | 버튼 disabled |
| `loading` | App | `text-slate-500 text-center` + 버튼 "분석 중..." |
| `success` | ResultCard + SourceCard | white / emerald accent |
| `error` | App | red 계열 alert 박스 |
| `no sources` | SourceCard | slate-50 안내 |

---

## 5. 금지 사항

### 5-1. 보안

| 금지 | 이유 |
|------|------|
| React 코드에 API Key·토큰 하드코딩 | 프론트는 공개됨 |
| `.env` 값을 UI·console에 노출 | 키 유출 |
| `dangerouslySetInnerHTML`로 `answer` 렌더 | XSS 위험 |

### 5-2. 신뢰·UX

| 금지 | 이유 |
|------|------|
| `sources` 영역 완전 숨김 | RAG 근거 설명 불가 |
| 없는 채용공고처럼 보이는 가짜 UI | 환각·신뢰 훼손 |
| 로딩 없이 결과 영역만 깜빡임 | 사용자 혼란 |
| error를 toast만 쓰고 화면에 안 남김 | 발표·디버깅 어려움 |

### 5-3. 디자인

| 금지 | 이유 |
|------|------|
| 과도한 gradient·glassmorphism·애니메이션 | 전문성 훼손, 발표 산만 |
| primary 색을 배경 전체에 사용 | 피로·가독성 저하 |
| h1보다 큰 장식 텍스트·배너 | 정보 계층 붕괴 |
| 컴포넌트 4개(App·Input·Result·Source) 밖 UI 무단 추가 | 바이브코딩 범위 이탈 |
| `index.css` 커스텀 CSS로 Tailwind 중복 정의 | 유지보수 혼란 |

### 5-4. 바이브코딩 워크플로

| 금지 | 대신 |
|------|------|
| 한 번에 전체 UI 전면 개편 | 컴포넌트 1개씩 수정 |
| 디자인 스킬 없이 임의 색상 도입 | 이 문서 팔레트 준수 |
| 백엔드 응답 필드 없이 UI 필드 추가 | API 스키마 먼저 확인 |

---

## 6. 바이브코딩 프롬프트 예시

UI 작업 시 아래처럼 이 스킬을 참조한다.

```text
harness/skills/design-skill.md를 따르세요.
InputForm만 개선하세요.
primary=blue-600, 카드 패턴 유지, label-input 간격 space-y-4.
```

```text
ResultCard에 design-skill.md 타이포그래피 적용.
secondary emerald 좌측 border 유지, answer는 text-sm leading-relaxed.
```

---

## 7. 체크리스트 (PR·발표 전)

- [ ] 색상이 팔레트(primary/secondary/background/text/border/error)를 따르는가?
- [ ] 입력 → 로딩/오류 → 결과 → 출처 순서가 맞는가?
- [ ] SourceCard가 결과와 함께 보이는가?
- [ ] 버튼 disabled·loading 상태가 동작하는가?
- [ ] 모바일(`px-4`, `max-w-2xl`)에서 깨지지 않는가?
- [ ] API Key가 프론트 코드에 없는가?
