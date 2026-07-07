export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
).replace(/\/$/, "");

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

/** Render 콜드 스타트 대비: 페이지 로드 시 백엔드 깨우기 */
export async function wakeBackend() {
  const start = performance.now();
  try {
    await fetch(apiUrl("/health"));
    const elapsedMs = performance.now() - start;
    return { ok: true, elapsedMs };
  } catch {
    // 분석 요청에서 연결 오류를 처리한다
    const elapsedMs = performance.now() - start;
    return { ok: false, elapsedMs };
  }
}
