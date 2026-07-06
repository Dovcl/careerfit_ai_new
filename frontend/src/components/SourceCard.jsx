function SkillTags({ skills }) {
  if (!skills) {
    return <span className="text-xs text-slate-400">스킬 정보 없음</span>;
  }

  const tags = skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (tags.length === 0) {
    return <span className="text-xs text-slate-400">스킬 정보 없음</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((skill) => (
        <span
          key={skill}
          className="rounded-md bg-white px-2 py-0.5 font-mono text-xs text-slate-600 ring-1 ring-slate-200"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

function distanceToMatchScore(distance) {
  if (typeof distance !== "number" || Number.isNaN(distance)) return null;
  return Math.min(100, Math.max(0, Math.round((1 / (1 + distance)) * 100)));
}

function matchBadge(score) {
  if (score == null) return { label: "—", className: "bg-slate-100 text-slate-500 ring-slate-200" };
  if (score >= 58) return { label: "높음", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
  if (score >= 52) return { label: "보통", className: "bg-blue-50 text-blue-700 ring-blue-100" };
  return { label: "참고", className: "bg-slate-100 text-slate-600 ring-slate-200" };
}

function SourceItemCard({ source, rank }) {
  const score = distanceToMatchScore(source.distance);
  const badge = matchBadge(score);
  const initial = (source.company || "?").charAt(0).toUpperCase();

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {rank}
          </span>
          <span className="text-xs font-medium text-slate-500">검색 순위 {rank}</span>
        </div>
        {score != null && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">유사도 {score}%</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${badge.className}`}>
              {badge.label}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{source.company || "회사명 없음"}</p>
            <p className="mt-0.5 text-sm text-slate-600">{source.title || "직무명 없음"}</p>
            {source.job_type && (
              <span className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                {source.job_type}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">필수 스킬</p>
          <SkillTags skills={source.required_skills} />
        </div>

        {typeof source.distance === "number" && (
          <p className="mt-3 text-[11px] text-slate-400">
            벡터 거리: {source.distance} (낮을수록 질문과 유사)
          </p>
        )}
      </div>
    </article>
  );
}

function SourceCard({ sources }) {
  const sortedSources = [...(sources || [])].sort((a, b) => {
    const da = typeof a.distance === "number" ? a.distance : Infinity;
    const db = typeof b.distance === "number" ? b.distance : Infinity;
    return da - db;
  });

  if (sortedSources.length === 0) {
    return (
      <section className="cf-card border-dashed p-6 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </span>
        <h2 className="mt-3 text-sm font-semibold text-slate-700">참고한 공고 출처</h2>
        <p className="mt-1 text-sm text-slate-500">검색된 공고 데이터가 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="cf-card overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200/80 text-slate-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">참고한 공고 출처</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                ChromaDB RAG 검색 결과 · 총 {sortedSources.length}건
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            RAG Sources
          </span>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {sortedSources.map((source, index) => (
          <SourceItemCard
            key={source.doc_id || `${source.company}-${source.title}-${index}`}
            source={source}
            rank={index + 1}
          />
        ))}
      </div>
    </section>
  );
}

export default SourceCard;
