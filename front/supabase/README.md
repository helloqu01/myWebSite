# 노묘 건강관리 클라우드 설정

클라우드를 설정하지 않아도 브라우저의 로컬 저장 모드로 정상 동작합니다. Supabase를 연결하면 이메일 로그인, 여러 기기 백업, 가족 공유 코드, 병원 차트·검사결과 원본 사진 저장을 사용할 수 있습니다.

## 설정 순서

1. Supabase 프로젝트에 `cat-care-schema.sql`을 마이그레이션으로 적용합니다.
2. Authentication에서 Email 로그인을 활성화합니다.
3. `.env.example`을 참고해 `front/.env.local`에 아래 값을 설정합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. 배포 환경에서는 같은 이름의 GitHub Actions secret을 등록합니다.

브라우저에는 publishable key 또는 legacy anon key만 넣습니다. `service_role` 키는 RLS를 우회하므로 프런트엔드나 `NEXT_PUBLIC_*` 환경변수에 절대 넣으면 안 됩니다.

## 적용되는 보안 정책

- 이메일 로그인 사용자별 가족 공간 한 개
- 20자리 공유 코드로 가족 초대 및 참여
- 가족 구성원만 건강 데이터 조회
- 소유자와 편집자만 건강 데이터 수정
- 원본 사진은 10MB 이하 JPG·PNG·WebP만 비공개 `cat-medical-documents` 버킷에 저장
- 가족 구성원만 만료 시간이 있는 서명 URL로 원본 사진 열람
- 소유자와 편집자만 원본 사진 업로드·교체·삭제
- 공개 테이블은 필요한 열과 동작만 허용
- 권한 상승이 필요한 함수는 Data API에 노출되지 않는 `private` 스키마에 배치

동기화 충돌 시 마지막 저장이 우선합니다. 다른 기기에서 기록하기 전에는 **클라우드 기록 가져오기**로 최신 상태를 확인하는 편이 안전합니다.

사진 파일 자체는 JSON 백업에 포함되지 않습니다. JSON과 가족 클라우드 기록에는 비공개 Storage 경로와 파일 메타데이터만 저장되며, 실제 원본은 Supabase Storage에 보관됩니다. 따라서 원본 사진 업로드와 열람에는 로그인 및 가족 공간 참여가 필요합니다.
