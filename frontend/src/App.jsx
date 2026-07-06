// frontend/src/App.jsx
import { useState } from "react";
import InputForm from "./components/InputForm";
import ResultCard from "./components/ResultCard";
import SourceCard from "./components/SourceCard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
// ⚠️ API Key는 절대 여기에 넣지 않습니다

function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAnalyze(formData) {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          major: formData.major,
          skills: formData.skills,
          job_type: formData.jobType,
        }),
      });

      if (!response.ok) throw new Error(`서버 오류: ${response.status}`);

      const data = await response.json();
      setResult({
        answer: data.answer ?? "",
        sources: Array.isArray(data.sources) ? data.sources : [],
      });
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError("FastAPI 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.");
      } else {
        setError("분석 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80">
      <main className="mx-auto max-w-2xl px-4 py-10 sm:py-12">
        <header className="mb-8 text-left">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
            RAG 기반 AI 코치
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            CareerFit AI
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            전공·스킬·관심 직무를 입력하면 채용·공모전 데이터를 바탕으로 맞춤 조언을 드립니다.
          </p>
        </header>

        <InputForm onSubmit={handleAnalyze} isLoading={isLoading} />

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p className="font-medium">요청 오류</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {isLoading && (
          <div
            aria-live="polite"
            aria-busy="true"
            className="cf-card mt-8 flex items-center justify-center gap-3 p-6"
          >
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            <p className="text-sm text-slate-500">채용 데이터를 검색하고 분석 중입니다...</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="mt-8 space-y-4" aria-live="polite">
            <ResultCard
              answer={result.answer}
              sources={result.sources}
            />
            <SourceCard sources={result.sources} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
