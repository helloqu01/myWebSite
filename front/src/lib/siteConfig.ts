const fallbackAdsenseClient = "ca-pub-1115617071874827";
const fallbackGaMeasurementId = "G-C2589TCWZ6";
const fallbackClarityProjectId = "v2sj4o2bvk";

export const siteConfig = {
  name: "Oh Hyunji",
  role: "Freelance Full-stack Developer",
  siteUrl: "https://codingbyohj.com",
  email: "helloqu@naver.com",
  phoneE164: "+821090677472",
  linkedInUrl: "https://www.linkedin.com/in/hyunji-oh-13949233a/",
  githubUrl: "https://github.com/helloqu01",
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || fallbackAdsenseClient,
  gaMeasurementId:
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || fallbackGaMeasurementId,
  clarityProjectId:
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || fallbackClarityProjectId,
};
