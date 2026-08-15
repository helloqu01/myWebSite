# AWS 배포 보안 설정

GitHub Actions의 `configure-cloudfront.sh` 단계가 다음 설정을 반복 적용합니다.

- `/senior-cat/` 같은 정적 경로를 `/senior-cat/index.html`로 재작성하는 CloudFront Function
- CSP, HSTS, 클릭재킹 차단, Referrer/Permissions Policy를 포함한 응답 헤더 정책
- S3 Origin Access Control(OAC)과 Public Access Block
- 해당 CloudFront 배포만 허용하는 S3 버킷 정책
- `API_ORIGIN_DOMAIN`이 설정된 경우 `/api/*`를 API Gateway `/prod`로 전달하는 캐시 비활성 동작

필요한 GitHub Secrets는 `CF_DISTRIBUTION_ID`, `S3_BUCKET_NAME`, `API_ORIGIN_DOMAIN`입니다. API 도메인은 `https://`와 경로를 제외한 `abc123.execute-api.ap-northeast-2.amazonaws.com` 형태로 넣습니다.

`cf-config.json`과 `s3-policy.json`은 구조를 설명하는 참조 파일이며, 실제 계정·배포 ID가 포함된 설정은 스크립트가 배포 시 생성합니다.
