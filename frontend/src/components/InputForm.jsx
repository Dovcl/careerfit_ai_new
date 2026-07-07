import { useState } from "react";
import { Search, Briefcase, BookOpen, Plus, X } from "lucide-react";

const SKILL_SUGGESTIONS = [
  "Python", "SQL", "Java", "JavaScript", "TypeScript", "React", "Node.js",
  "R", "TensorFlow", "AWS", "Docker", "Excel", "PowerBI", "Tableau",
];

const MAJOR_SUGGESTIONS = [
  "통계학과", "컴퓨터공학", "소프트웨어공학", "데이터사이언스", "경영학",
  "산업공학", "AI·인공지능",
];

const JOB_SUGGESTIONS = [
  "데이터 분석", "백엔드 개발자", "프론트엔드 개발자", "ML엔지니어",
  "풀스택 개발자", "DevOps 엔지니어", "UX 디자이너",
];

function TagPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} className="hover:opacity-60 transition-opacity" aria-label={`${label} 제거`}>
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

function SuggestionChip({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border text-sm text-muted-foreground hover:border-accent hover:text-accent hover:bg-secondary transition-all duration-150 disabled:opacity-50"
    >
      <Plus className="w-3 h-3" />
      {label}
    </button>
  );
}

function InputForm({ onSubmit, isLoading }) {
  const [major, setMajor] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [jobType, setJobType] = useState("");

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const isValid = major.trim() && skills.length > 0 && jobType.trim();
  const unusedSkills = SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 6);

  function handleSubmit(event) {
    event.preventDefault();
    if (!isValid || isLoading) return;

    onSubmit({
      major: major.trim(),
      skills,
      jobType: jobType.trim(),
    });
  }

  return (
    <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div>
            <label htmlFor="major" className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
              <BookOpen className="w-3 h-3 inline mr-1.5" />
              전공
            </label>
            <input
              id="major"
              type="text"
              placeholder="예: 통계학과"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              disabled={isLoading}
              className="cf-input"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {MAJOR_SUGGESTIONS.slice(0, 4).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMajor(m)}
                  disabled={isLoading}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-all disabled:opacity-50 ${
                    major === m
                      ? "bg-secondary border-accent/50 text-secondary-foreground"
                      : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="skill-input" className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
              보유 스킬
            </label>
            <div className="flex gap-2">
              <input
                id="skill-input"
                type="text"
                placeholder="스킬 추가"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                disabled={isLoading}
                className="cf-input flex-1"
              />
              <button
                type="button"
                onClick={() => addSkill(skillInput)}
                disabled={isLoading}
                className="px-3 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                aria-label="스킬 추가"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((s) => (
                  <TagPill key={s} label={s} onRemove={() => removeSkill(s)} />
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {unusedSkills.map((s) => (
                <SuggestionChip key={s} label={s} onClick={() => addSkill(s)} disabled={isLoading} />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="jobType" className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
              <Briefcase className="w-3 h-3 inline mr-1.5" />
              관심 직무
            </label>
            <input
              id="jobType"
              type="text"
              placeholder="예: 데이터 분석"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              disabled={isLoading}
              className="cf-input"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {JOB_SUGGESTIONS.slice(0, 4).map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setJobType(j)}
                  disabled={isLoading}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-all disabled:opacity-50 ${
                    jobType === j
                      ? "bg-secondary border-accent/50 text-secondary-foreground"
                      : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" disabled={isLoading || !isValid} className="cf-btn-primary flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              AI가 분석 중...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              맞춤 분석 시작
            </>
          )}
        </button>

        {!isValid && !isLoading && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            전공, 스킬, 관심 직무를 모두 입력하면 분석을 시작할 수 있습니다.
          </p>
        )}
      </form>
    </section>
  );
}

export default InputForm;
