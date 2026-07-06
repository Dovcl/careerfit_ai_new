import { useMemo } from "react";

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
  // ChromaDB 거리(낮을수록 유사) → 발표용 매칭 점수(0~100)
  return Math.min(100, Math.max(0, Math.round((1 / (1 + best)) * 100)));
}

function confidenceLabel(value) {
  if (value == null) return { text: "산출 불가", color: "bg-slate-100 text-slate-600 ring-slate-200" };
  if (value >= 80) return { text: "높음", color: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
  if (value >= 60) return { text: "보통", color: "bg-blue-50 text-blue-700 ring-blue-100" };
  return { text: "낮음", color: "bg-amber-50 text-amber-700 ring-amber-100" };
}

function TagList({ items, variant = "blue" }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-400">표시할 항목이 없습니다.</p>;
  }

  const colors = {
    blue: "bg-blue-50 text-blue-800 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    amber: "bg-amber-50 text-amber-800 ring-amber-100",
  };

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium ring-1 ${colors[variant]}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function SectionBlock({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
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
      <section className="cf-card border-l-4 border-slate-300 p-6">
        <p className="text-sm text-slate-500">분석 결과가 없습니다.</p>
      </section>
    );
  }

  const conf = confidenceLabel(parsed.confidence);

  return (
    <section className="cf-card overflow-hidden border-l-4 border-emerald-500">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-emerald-50/40 px-6 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">AI 분석 결과</h2>
            <p className="text-xs text-slate-500">RAG 검색 데이터를 근거로 생성된 조언입니다.</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-medium text-slate-500">매칭 신뢰도</p>
          <div className="mt-1 flex items-center justify-end gap-2">
            {parsed.confidence != null && (
              <span className="text-xl font-bold text-slate-800">{parsed.confidence}%</span>
            )}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${conf.color}`}>
              {conf.text}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <SectionBlock title="종합 코멘트" subtitle="현재 역량에 대한 AI 요약">
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {parsed.summaryBody || answer}
          </p>
        </SectionBlock>

        <SectionBlock title="보유 역량 (Matched Skills)" subtitle="입력·공고와 잘 맞는 스킬">
          <TagList items={parsed.matched} variant="emerald" />
        </SectionBlock>

        <SectionBlock title="보완 역량 (Missing Skills)" subtitle="취업 준비 시 강화하면 좋은 역량">
          {parsed.missing.length > 0 ? (
            <ol className="space-y-2">
              {parsed.missing.map((item, i) => (
                <li key={item} className="flex gap-2 text-sm text-slate-600">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800">
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
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">추천 항목을 answer에서 추출하지 못했습니다.</p>
          )}
        </SectionBlock>
      </div>
    </section>
  );
}

export default ResultCard;
