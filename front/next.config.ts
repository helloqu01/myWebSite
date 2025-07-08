/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  // React Strict Mode 활성화
  reactStrictMode: true,

  // 빌드시 각 페이지에 /index.html 을 붙여서 생성하려면
  trailingSlash: true,

  // next-i18next 설정 (언어 라우팅)
  i18n,

  // 정적 export 할 때 이미지 최적화 비활성화
  images: {
    unoptimized: true,
  },

  // 환경변수 주입 (빌드 타임에 치환됩니다)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // (선택) 추가적인 설정이 필요하면 여기에…
  // outputFileTracingRoot: __dirname,
  // headers: async () => [ … ],
  // redirects: async () => [ … ],
};

export default nextConfig;
