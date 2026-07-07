import { useEffect, useState } from "react";
import { Sparkles, Briefcase, BookOpen, ChevronRight } from "lucide-react";
import InputForm from "./components/InputForm";
import ResultCard from "./components/ResultCard";
import SourceCard from "./components/SourceCard";
import { apiUrl, wakeBackend } from "./config/api";

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
  const [lastQuery, setLastQuery] = useState(null);

  useEffect(() => {
    wakeBackend();
  }, []);

  async function handleAnalyze(formData) {
    if (isLoading) return;

    setIsLoading(true);
    setIsStreaming(true);
    setError(null);
    setResult({ answer: "", sources: [] });
    setLastQuery(formData);

    try {
      const response = await fetch(apiUrl("/analyze/stream"), {
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
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">CareerFit</span>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold mb-5">
            <Sparkles className="w-3 h-3" />
            AI 기반 맞춤 추천
          </div>
          <h1 className="text-4xl font-extrabold text-foreground leading-tight tracking-tight mb-3">
            어디에 지원할지<br />
            아직 막막하다면<br />
            <span className="text-accent">CareerFit</span>이 먼저 정리해 드릴게요
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            맞춤 조언과 함께, 참고할 수 있는 기업 공고를 함께 확인하세요.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mb-12">
        <InputForm onSubmit={handleAnalyze} isLoading={isLoading} />
      </section>

      {error && (
        <section className="max-w-6xl mx-auto px-6 mb-8">
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p className="font-medium">요청 오류</p>
            <p className="mt-1">{error}</p>
          </div>
        </section>
      )}

      {showLoadingBanner && (
        <section className="max-w-6xl mx-auto px-6 mb-12">
          <div
            aria-live="polite"
            aria-busy="true"
            className="flex items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl"
          >
            <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-accent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">채용 데이터를 검색하고 분석 중입니다...</p>
          </div>
        </section>
      )}

      {showResults && (
        <section className="max-w-6xl mx-auto px-6 pb-20 space-y-6">
          {lastQuery && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/60 border border-secondary">
              <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
              <p className="text-xs text-secondary-foreground">
                <span className="font-semibold text-foreground">{lastQuery.major}</span>
                {" · "}
                <span className="font-semibold text-foreground">{lastQuery.skills.join(", ")}</span>
                {" · "}
                <span className="font-semibold text-foreground">{lastQuery.jobType}</span>
                &nbsp;기준으로 AI 맞춤 분석 결과입니다.
              </p>
              <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto flex-shrink-0" />
            </div>
          )}

          {isStreaming && result.answer && (
            <p className="text-xs font-medium text-accent">AI가 답변을 작성 중입니다...</p>
          )}

          <ResultCard answer={result.answer} sources={result.sources} />
          <SourceCard sources={result.sources} />
        </section>
      )}

      {!showResults && !isLoading && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Briefcase, title: "RAG 검색", desc: "채용·공모전 데이터 검색", color: "text-indigo-500" },
              { icon: Sparkles, title: "AI 분석", desc: "맞춤형 역량 코칭", color: "text-emerald-500" },
              { icon: BookOpen, title: "출처 제공", desc: "근거 공고 투명 공개", color: "text-amber-500" },
            ].map((stat) => (
              <div key={stat.title} className="flex items-center gap-4 p-5 bg-card border border-border rounded-xl">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
