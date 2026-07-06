import { useMemo, useState } from "react";

const DEMO_PROFILE = {
  major: "통계학과",
  skillsInput: "Python, SQL, 데이터 분석",
  jobType: "데이터 분석",
};

const FIELDS = [
  {
    id: "major",
    step: 1,
    label: "전공",
    hint: "학과·전공 분야를 입력해 주세요.",
    placeholder: "예: 통계학과, 경영학과",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-6-3l6 3 6-3"
      />
    ),
  },
  {
    id: "skills",
    step: 2,
    label: "보유 스킬",
    hint: "쉼표(,)로 구분해 입력하면 태그로 미리보기됩니다.",
    placeholder: "예: Python, SQL, R",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    ),
  },
  {
    id: "jobType",
    step: 3,
    label: "관심 직무",
    hint: "지원하고 싶은 직무 유형을 적어 주세요.",
    placeholder: "예: 데이터 분석, AI/ML",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6"
      />
    ),
  },
];

function InputForm({ onSubmit, isLoading }) {
  const [major, setMajor] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [jobType, setJobType] = useState("");

  const skillPreview = useMemo(
    () =>
      skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [skillsInput]
  );

  const filledCount = [major, skillsInput, jobType].filter((v) => v.trim()).length;
  const isValid = filledCount === 3;

  function handleSubmit(event) {
    event.preventDefault();
    if (!isValid || isLoading) return;

    onSubmit({
      major: major.trim(),
      skills: skillPreview,
      jobType: jobType.trim(),
    });
  }

  function fillDemo() {
    if (isLoading) return;
    setMajor(DEMO_PROFILE.major);
    setSkillsInput(DEMO_PROFILE.skillsInput);
    setJobType(DEMO_PROFILE.jobType);
  }

  function clearForm() {
    if (isLoading) return;
    setMajor("");
    setSkillsInput("");
    setJobType("");
  }

  const values = { major, skills: skillsInput, jobType };
  const setters = {
    major: setMajor,
    skills: setSkillsInput,
    jobType: setJobType,
  };

  return (
    <section className="cf-card overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-slate-800">내 정보 입력</h2>
              <p className="mt-1 text-sm text-slate-500">
                3가지 항목을 입력하면 AI가 맞춤 분석을 시작합니다.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            {filledCount}/3 작성 완료
          </span>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(filledCount / 3) * 100}%` }}
            role="progressbar"
            aria-valuenow={filledCount}
            aria-valuemin={0}
            aria-valuemax={3}
            aria-label="입력 진행률"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-7">
        {FIELDS.map((field) => (
          <div
            key={field.id}
            className="rounded-xl border border-slate-100 bg-white p-4 transition-colors focus-within:border-blue-200 focus-within:ring-2 focus-within:ring-blue-500/10"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                {field.step}
              </span>
              <label htmlFor={field.id} className="text-sm font-semibold text-slate-700">
                {field.label}
              </label>
              {values[field.id].trim() && (
                <span className="ml-auto text-xs font-medium text-emerald-600">입력됨</span>
              )}
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  {field.icon}
                </svg>
              </span>
              <input
                id={field.id}
                type="text"
                value={values[field.id]}
                onChange={(e) => setters[field.id](e.target.value)}
                placeholder={field.placeholder}
                className="cf-input pl-10"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">{field.hint}</p>

            {field.id === "skills" && skillPreview.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5" aria-label="스킬 미리보기">
                {skillPreview.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-800 ring-1 ring-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={fillDemo}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            발표용 예시 채우기
          </button>
          <button
            type="button"
            onClick={clearForm}
            disabled={isLoading || filledCount === 0}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            초기화
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="cf-btn-primary flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              분석 중...
            </>
          ) : (
            <>
              역량 분석 요청
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>

        {!isValid && !isLoading && (
          <p className="text-center text-xs text-slate-400">
            모든 항목을 입력하면 분석을 요청할 수 있습니다.
          </p>
        )}
      </form>
    </section>
  );
}

export default InputForm;
