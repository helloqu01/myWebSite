function publicFlag(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null || value.trim() === "") return defaultValue;
  return !["false", "0", "off", "no"].includes(value.trim().toLowerCase());
}

/**
 * 정적 배포 시 빌드에 포함되는 공개 상태입니다.
 * GitHub Actions의 `resume_public` 옵션 또는 RESUME_PUBLIC 저장소 변수로 제어합니다.
 */
export const isResumePublic = publicFlag(
  process.env.NEXT_PUBLIC_RESUME_PUBLIC,
  false,
);

/** 노묘 건강관리 외 포트폴리오 페이지의 전체 공개 여부 */
export const isPortfolioPublic = publicFlag(
  process.env.NEXT_PUBLIC_PORTFOLIO_PUBLIC,
  false,
);

// 평문 비밀번호는 번들에 넣지 않고 SHA-256 해시만 비교합니다.
// 배포 시 GitHub Secret `RESUME_ACCESS_HASH`로 교체할 수 있습니다.
const fallbackResumeAccessHash =
  "caf070a90a72ecef23c68585c01b1c51130a03ad5469275e3fb038e4f0d57700";

export const resumeAccessHash =
  process.env.NEXT_PUBLIC_RESUME_ACCESS_HASH || fallbackResumeAccessHash;
