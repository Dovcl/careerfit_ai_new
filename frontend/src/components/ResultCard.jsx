import { useMemo } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

function splitSections(text) {
  const normalized = text.replace(/\r\n/g, "\n");
  const parts = normalized.split(/\n(?=\*{0,2}\s*\d+\.\s)/);

  const sections = { summary: "", recommend: "", missing: "" };

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (/현재\s*역량|역량\s*평가/i.test(trimmed)) {
      sections.summary = trimmed;
    } else if (/추천\s*공고|공모전/i.test(trimmed)) {
      sections.recommend = trimmed;
    } else if (/부족한\s*역량|준비\s*방향/i.test(trimmed)) {
      sections.missing = trimmed;
    } else if (!sections.summary) {
      sections.summary = trimmed;
    }
  }

  return sections;
}

function cleanLine(line) {
  return line
    .replace(/^\s*[\d]+\.\s*/, "")
    .replace(/^\s*[\*\-•]\s*/, "")
    .replace(/\*\*/g, "")
    .trim();
}

function extractListItems(sectionText) {
  if (!sectionText) return [];

  return sectionText
    .split("\n")
    .map(cleanLine)
    .filter((line) => line.length > 1)
    .filter((line) => !/^\d+\.\s/.test(line) || line.includes("**"))
    .map(cleanLine)
    .filter(Boolean);
}

function extractMissingSkills(sectionText) {
  if (!sectionText) return [];

  const numbered = [...sectionText.matchAll(/^\s*\d+\.\s*\*?\*?([^:\n]+)/gm)]
    .map((m) => cleanLine(m[1].split(":")[0]))
    .filter(Boolean);

  if (numbered.length > 0) return numbered;

  return extractListItems(sectionText).filter((line) => !/추천|이유|공고/i.test(line));
}

function extractRecommended(sectionText) {
  if (!sectionText) return [];

  const items = [];

  const bulletMatches = [...sectionText.matchAll(/[\*\-•]\s*\*?\*?([^:\n]+)/g)];
  for (const match of bulletMatches) {
    const line = cleanLine(match[1]);
    if (line && !/^이유$/i.test(line) && line.length > 3) {
      items.push(line);
    }
  }

  const inlineMatches = [...sectionText.matchAll(/([가-힣A-Za-z0-9]+)\s*[-—]\s*([^(\n]+?)(?:\s*\(유사도|$)/g)];
  for (const match of inlineMatches) {
    items.push(`${match[1].trim()} — ${match[2].trim()}`);
  }

  return [...new Set(items)].slice(0, 5);
}

function extractMatchedSkills(sectionText, answer) {
  const skillPattern = /\b(Python|SQL|R\b|Java|JavaScript|TypeScript|FastAPI|React|통계|데이터\s*분석|머신러닝|AI|Tableau|Excel|Pandas)\b/gi;
  const fromText = [...(sectionText + " " + answer).matchAll(skillPattern)].map((m) =>
    m[0] === "R" ? "R" : m[0].charAt(0).toUpperCase() + m[0].slice(1)
  );

  const unique = [...new Set(fromText.map((s) => (s.toLowerCase() === "r" ? "R" : s)))];
  return unique.slice(0, 8);
}

function extractConfidence(answer, sources, explicit) {
  if (typeof explicit === "number" && !Number.isNaN(explicit)) {
    return Math.min(100, Math.max(0, Math.round(explicit)));
  }

  const distances = [];

  if (Array.isArray(sources) && sources.length > 0) {
    for (const s of sources) {
      if (typeof s.distance === "number") distances.push(s.distance);
    }
  }

  const fromAnswer = [...answer.matchAll(/유사도\s*거리[:\s]*([\d.]+)/g)].map((m) => parseFloat(m[1]));
  distances.push(...fromAnswer);

  if (distances.length === 0) return null;

  const best = Math.min(...distances);
  return Math.min(100, Math.max(0, Math.round((1 / (1 + best)) * 100)));
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

function TagList({ items, variant = "muted" }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground">표시할 항목이 없습니다.</p>;
  }

  const colors = {
    muted: "bg-muted text-muted-foreground",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
  };

  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className={`px-2 py-0.5 rounded-md text-xs font-mono ${colors[variant]}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function SectionBlock({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ResultCard({
  answer,
  matched_skills,
  missing_skills,
  recommended_projects,
  confidence,
  sources,
}) {
  const parsed = useMemo(() => {
    if (!answer) return null;

    const sections = splitSections(answer);
    const summaryBody = sections.summary
      .replace(/^\*{0,2}\s*\d+\.\s*현재\s*역량\s*평가\*{0,2}\s*/i, "")
      .trim();

    return {
      summaryBody,
      matched: matched_skills?.length
        ? matched_skills
        : extractMatchedSkills(sections.summary, answer),
      missing: missing_skills?.length ? missing_skills : extractMissingSkills(sections.missing),
      recommended: recommended_projects?.length
        ? recommended_projects
        : extractRecommended(sections.recommend),
      confidence: extractConfidence(answer, sources, confidence),
    };
  }, [answer, matched_skills, missing_skills, recommended_projects, confidence, sources]);

  if (!answer) {
    return (
      <section className="bg-card border border-border rounded-xl p-6">
        <p className="text-sm text-muted-foreground">분석 결과가 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/20 transition-all">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-secondary/40 px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">AI 분석 결과</h2>
            <p className="text-xs text-muted-foreground mt-0.5">RAG 검색 데이터를 근거로 생성된 조언입니다.</p>
          </div>
        </div>
        <MatchBadge score={parsed.confidence} />
      </div>

      <div className="space-y-4 p-6">
        <SectionBlock title="종합 코멘트" subtitle="현재 역량에 대한 AI 요약">
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {parsed.summaryBody || answer}
          </p>
        </SectionBlock>

        <SectionBlock title="보유 역량" subtitle="입력·공고와 잘 맞는 스킬">
          <TagList items={parsed.matched} variant="emerald" />
        </SectionBlock>

        <SectionBlock title="보완 역량" subtitle="취업 준비 시 강화하면 좋은 역량">
          {parsed.missing.length > 0 ? (
            <ol className="space-y-2">
              {parsed.missing.map((item, i) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-semibold text-amber-700 border border-amber-200">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ol>
          ) : (
            <TagList items={[]} variant="amber" />
          )}
        </SectionBlock>

        <SectionBlock title="추천 공고·프로젝트" subtitle="Recommended Projects">
          {parsed.recommended.length > 0 ? (
            <ul className="space-y-2">
              {parsed.recommended.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground group-hover:text-accent"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">추천 항목을 answer에서 추출하지 못했습니다.</p>
          )}
        </SectionBlock>
      </div>
    </section>
  );
}

export default ResultCard;
