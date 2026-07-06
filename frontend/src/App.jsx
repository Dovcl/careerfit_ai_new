// frontend/src/App.jsx
import { useState } from "react";
import InputForm from "./components/InputForm";
import ResultCard from "./components/ResultCard";
import SourceCard from "./components/SourceCard";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
// ⚠️ API Key는 절대 여기에 넣지 않습니다

async function parseSseStream(response, onEvent) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      if (!part.trim()) continue;

      let event = "message";
      let data = "";

      for (const line of part.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) data += line.slice(5).trim();
      }

      if (!data) continue;
      onEvent(event, JSON.parse(data));
    }
  }
}

function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  async function handleAnalyze(formData) {
    if (isLoading) return;

    setIsLoading(true);
    setIsStreaming(true);
    setError(null);
    setResult({ answer: "", sources: [] });

    try {
      const response = await fetch(`${API_BASE}/analyze/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          major: formData.major,
          skills: formData.skills,
          job_type: formData.jobType,
        }),
      });

      if (!response.ok) throw new Error(`서버 오류: ${response.status}`);

      await parseSseStream(response, (event, data) => {
        if (event === "sources") {
          setResult((prev) => ({
            ...prev,
            sources: Array.isArray(data.sources) ? data.sources : [],
          }));
        }

        if (event === "token" && data.text) {
          setResult((prev) => ({
            ...prev,
            answer: (prev?.answer || "") + data.text,
          }));
        }

        if (event === "error") {
          throw new Error(data.message || "스트리밍 중 오류가 발생했습니다.");
        }
      });
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError("FastAPI 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.");
      } else {
        setError(err.message || "분석 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
      setResult(null);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  const showResults = result && (result.answer || result.sources?.length > 0);
  const showLoadingBanner = isLoading && !result?.answer;

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

        {showLoadingBanner && (
          <div
            aria-live="polite"
            aria-busy="true"
            className="cf-card mt-8 flex items-center justify-center gap-3 p-6"
          >
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            <p className="text-sm text-slate-500">채용 데이터를 검색하고 분석 중입니다...</p>
          </div>
        )}

        {showResults && (
          <div className="mt-8 space-y-4" aria-live="polite">
            {isStreaming && result.answer && (
              <p className="text-xs font-medium text-blue-600">AI가 답변을 작성 중입니다...</p>
            )}
            <ResultCard answer={result.answer} sources={result.sources} />
            <SourceCard sources={result.sources} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
