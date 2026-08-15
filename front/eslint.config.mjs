import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      // 이 앱은 localStorage, 파일 미리보기, 외부 다이얼로그 상태를 effect에서 동기화합니다.
      // React 19의 실험적 권고 규칙이며 현재 동작 자체의 오류는 아닙니다.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
