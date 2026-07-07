import { Sparkles, FileText } from "lucide-react";

function SkillTags({ skills }) {
  if (!skills) {
    return <span className="text-xs text-muted-foreground">스킬 정보 없음</span>;
  }

  const tags = skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (tags.length === 0) {
    return <span className="text-xs text-muted-foreground">스킬 정보 없음</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((skill) => (
        <span
          key={skill}
          className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-mono"
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

function MatchBadge({ score }) {
  if (score == null) return null;

  const color =
    score >= 90 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    score >= 80 ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
    "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium border ${color}`}>
      <Sparkles className="w-3 h-3" />
      {score}% 매칭
    </span>
  );
}

function SourceItemCard({ source, rank }) {
  const score = distanceToMatchScore(source.distance);
  const initial = (source.company || "?").charAt(0).toUpperCase();
  const logoColors = ["#4338ca", "#6366f1", "#0f766e", "#b45309", "#1d4ed8"];
  const logoColor = logoColors[(rank - 1) % logoColors.length];

  return (
    <article className="group bg-card border border-border rounded-xl p-5 hover:border-accent/40 hover:shadow-lg hover:shadow-indigo-100/60 transition-all duration-200">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 font-mono text-white"
            style={{ backgroundColor: logoColor }}
          >
            {initial}
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{source.company || "회사명 없음"}</p>
            <h3 className="text-sm font-semibold text-foreground leading-tight mt-0.5 group-hover:text-accent transition-colors">
              {source.title || "직무명 없음"}
            </h3>
          </div>
        </div>
        <MatchBadge score={score} />
      </div>

      {source.job_type && (
        <span className="inline-block mb-3 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
          {source.job_type}
        </span>
      )}

      <div className="rounded-lg bg-muted/60 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">필수 스킬</p>
        <SkillTags skills={source.required_skills} />
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">검색 순위 #{rank}</span>
        {typeof source.distance === "number" && (
          <span className="text-xs font-mono text-muted-foreground">거리 {source.distance.toFixed(3)}</span>
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
      <section className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
        <div className="mx-auto w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          <FileText className="w-5 h-5" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">기업 공고</h2>
        <p className="mt-1 text-sm text-muted-foreground">검색된 기업 공고가 없습니다.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <FileText className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-semibold text-foreground">기업 공고</h2>
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-mono">
          {sortedSources.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
