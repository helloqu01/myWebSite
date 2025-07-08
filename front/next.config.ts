/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1) 완전 정적 내보내기 모드
  output: 'export',

  // 2) 빌드시 각 페이지에 /index.html 을 붙여서 생성하려면
  trailingSlash: true,

  // 3) React Strict Mode 활성화
  reactStrictMode: true,



  // 5) 정적 export 할 때 이미지 최적화 비활성화
  images: {
    unoptimized: true,
  },

  // 6) 환경변수 주입 (빌드 타임에 치환됩니다)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

 

  // 8) (선택) 커스텀 빌드 폴더명, 헤더/리다이렉트 설정 등…
  // outputFileTracingRoot: __dirname,
  // headers: async () => [...],
  // redirects: async () => [...],
};

export default nextConfig;
