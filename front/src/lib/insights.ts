export type InsightSection = {
  variant?: "default" | "callout";
  title?: string;
  paragraphs?: string[];
  steps?: string[];
  items?: string[];
};

export type InsightArticle = {
  slug: string;
  categoryEn: string;
  categoryKo: string;
  titleEn: string;
  titleKo: string;
  summaryEn: string;
  summaryKo: string;
  published: string;
  sectionsEn: InsightSection[];
  sectionsKo: InsightSection[];
};

const published = "2026-03-14";

export const insights: InsightArticle[] = [
  {
    slug: "nextjs-aws-deployment",
    categoryEn: "Deploy & Infra",
    categoryKo: "배포와 인프라",
    titleEn: "How to Deploy Next.js to AWS",
    titleKo: "Next.js를 AWS에 배포하는 법",
    summaryEn:
      "Choose the right AWS path for static, hybrid, or server-rendered Next.js apps.",
    summaryKo:
      "정적 사이트, 하이브리드 앱, 서버 렌더링 앱에 맞는 AWS 배포 경로를 정리했습니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "Start with the rendering model",
        paragraphs: [
          "A static marketing site or portfolio is usually simplest with `next export`, S3, and CloudFront.",
          "If you need server rendering, image optimization, auth-heavy middleware, or dynamic APIs, move the runtime to App Runner, ECS, or Lambda-based hosting.",
        ],
      },
      {
        title: "Deployment checklist",
        items: [
          "Separate static assets, runtime, and API boundaries before choosing infrastructure.",
          "Define cache rules, invalidation strategy, and environment-specific secrets early.",
          "Compare cold starts, rollout speed, and rollback simplicity before committing to one path.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Audit the app first. Check whether the site can be exported statically or whether it depends on server rendering, dynamic APIs, middleware, or image optimization at runtime.",
          "Run a local production build before touching AWS. A broken route, missing environment variable, or asset path issue is faster to fix locally than after deployment.",
          "If the app is static, prepare S3, CloudFront, ACM, and DNS in that order. If it needs runtime logic, choose App Runner or ECS before you design the deployment pipeline.",
          "Automate build and deploy with CI/CD so artifact upload, cache invalidation, and environment injection happen the same way every time.",
          "After release, verify HTTPS, 404 behavior, cache refresh, log visibility, and rollback steps. Deployment is only done when you can also debug the next failure quickly.",
        ],
      },
      {
        title: "Actual cases from delivery",
        paragraphs: [
          "This portfolio itself is deployed as a static Next.js export on S3 and CloudFront, which is the right fit for a content-first site with minimal runtime needs.",
          "In prior production work, I also handled AWS delivery paths across App Runner and serverless-style transitions, including CloudFront auth issues that required origin request policy fixes and tighter environment handling in CI/CD.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "먼저 렌더링 방식부터 정합니다",
        paragraphs: [
          "포트폴리오나 마케팅 사이트처럼 정적 비중이 높은 경우는 `next export`와 S3, CloudFront 조합이 가장 단순합니다.",
          "서버 렌더링, 이미지 최적화, 인증 미들웨어, 동적 API가 중요하면 App Runner, ECS, Lambda 계열 런타임으로 넘어가는 편이 맞습니다.",
        ],
      },
      {
        title: "배포 체크리스트",
        items: [
          "정적 자산, 앱 런타임, API 경계를 먼저 분리해서 생각합니다.",
          "캐시 정책, 무효화 전략, 환경별 시크릿 주입 방식을 초기에 정합니다.",
          "콜드 스타트, 배포 속도, 롤백 단순성을 비교한 뒤 최종 경로를 고릅니다.",
        ],
      },
      {
        title: "초보자 기준 진행 순서",
        steps: [
          "먼저 이 앱이 정적 export 가능한지 확인합니다. 서버 렌더링, 동적 API, 미들웨어, 런타임 이미지 최적화가 핵심이면 정적 배포만으로 끝나지 않을 수 있습니다.",
          "AWS를 건드리기 전에 로컬에서 프로덕션 빌드를 돌립니다. 깨진 라우트, 빠진 환경변수, 잘못된 자산 경로는 로컬에서 잡는 편이 훨씬 빠릅니다.",
          "정적 사이트면 S3, CloudFront, ACM, DNS 순서로 준비하고, 런타임이 필요하면 App Runner나 ECS를 먼저 결정한 뒤 파이프라인을 설계합니다.",
          "빌드와 배포, 캐시 무효화, 환경변수 주입은 CI/CD로 자동화합니다. 수동 업로드는 처음 한 번은 되지만 반복 운영에서는 바로 실수 지점이 됩니다.",
          "배포 후에는 HTTPS, 404 처리, 캐시 갱신, 로그 확인, 롤백 경로까지 점검합니다. 배포는 올리는 것보다 다음 장애를 빨리 찾을 수 있어야 끝입니다.",
        ],
      },
      {
        title: "실제로 풀었던 사례",
        paragraphs: [
          "이 포트폴리오 자체는 정적 Next.js export를 S3와 CloudFront로 배포하는 구조라서, 콘텐츠 중심 사이트에 맞는 가장 단순한 경로를 직접 적용하고 있습니다.",
          "실무에서는 App Runner와 서버리스 전환 경험도 있었고, CloudFront origin request policy 조정으로 인증 이슈를 해결하는 등 배포 경로에 따라 다른 운영 문제를 직접 다뤘습니다.",
        ],
      },
    ],
  },
  {
    slug: "openai-web-integration",
    categoryEn: "AI in Web Apps",
    categoryKo: "웹앱의 AI 기능",
    titleEn: "How to Integrate the OpenAI API into a Web Service",
    titleKo: "OpenAI API를 웹서비스에 붙이는 방법",
    summaryEn:
      "Design the API boundary, streaming flow, logging, and fallback behavior before you ship.",
    summaryKo:
      "API 경계, 스트리밍 흐름, 로깅, 실패 대응을 먼저 설계한 뒤 붙여야 안정적으로 운영됩니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "Do not call the model directly from the browser",
        paragraphs: [
          "Put the provider call behind your backend so you can enforce auth, quotas, prompt rules, and audit logs.",
          "The frontend should only send task-safe payloads and render streamed or batched responses.",
        ],
      },
      {
        title: "What usually matters in production",
        items: [
          "Store request metadata, token usage, and latency for every call.",
          "Add retries only for safe failure modes and cap total spend per user or workspace.",
          "Prepare fallback responses for timeouts, moderation blocks, and upstream model errors.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Start with one narrow task such as summary generation, support reply drafting, or internal search help. Do not begin by promising a general-purpose assistant.",
          "Create a backend endpoint that receives validated user input and calls the model with server-side secrets. This is where auth, quota, and prompt rules should live.",
          "Decide what context the model can access and trim it aggressively. Most bad answers come from sending too much noisy context, not too little.",
          "Build the frontend around loading, streaming, timeout, and retry states. Users need to understand when the model is still working and when it failed safely.",
          "Log prompt metadata, token usage, latency, and error categories from day one so you can control cost and improve quality with evidence instead of intuition.",
        ],
      },
      {
        title: "Actual cases from delivery",
        paragraphs: [
          "I used AI-assisted flows in an internal settlement statement site where speed and consistency mattered more than flashy generation. The useful part was workflow standardization, not raw model novelty.",
          "I also built a festival content studio that connected source aggregation, AI-generated cardnews drafts and captions, Canva handoff, and Instagram publishing queues into one operational surface.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "브라우저에서 모델을 직접 호출하지 않습니다",
        paragraphs: [
          "인증, 사용량 제한, 프롬프트 규칙, 감사 로그를 제어하려면 반드시 백엔드 뒤에 모델 호출을 두는 편이 맞습니다.",
          "프론트엔드는 작업에 필요한 최소 입력만 보내고, 스트리밍이나 배치 결과를 표시하는 역할에 집중하는 것이 안전합니다.",
        ],
      },
      {
        title: "운영 단계에서 중요한 것",
        items: [
          "모든 호출에 대해 요청 메타데이터, 토큰 사용량, 지연 시간을 남깁니다.",
          "재시도는 안전한 실패 유형에만 적용하고 사용자나 워크스페이스 단위 비용 상한을 둡니다.",
          "타임아웃, 정책 차단, 상위 모델 오류에 대한 대체 응답을 준비합니다.",
        ],
      },
      {
        title: "초보자 기준 진행 순서",
        steps: [
          "처음에는 요약, 답변 초안, 내부 검색 보조처럼 범위가 좁은 작업 하나만 정합니다. 처음부터 만능 AI 비서를 만들겠다고 시작하면 실패할 확률이 높습니다.",
          "검증된 사용자 입력을 받는 백엔드 API를 만들고, 서버에서만 모델을 호출합니다. 인증, 쿼터, 프롬프트 규칙은 이 경계 안에 있어야 합니다.",
          "모델이 볼 수 있는 문맥 범위를 정하고 과감히 줄입니다. 실제로는 문맥이 부족해서보다 너무 많은 잡정보를 넣어서 품질이 떨어지는 경우가 많습니다.",
          "프론트엔드는 로딩, 스트리밍, 타임아웃, 재시도 상태를 명확히 보여주도록 만듭니다. 사용자는 모델이 아직 처리 중인지, 안전하게 실패했는지를 알아야 합니다.",
          "처음부터 프롬프트 메타데이터, 토큰 사용량, 지연 시간, 오류 유형을 기록합니다. 그래야 감이 아니라 근거로 품질과 비용을 조정할 수 있습니다.",
        ],
      },
      {
        title: "실제로 적용했던 사례",
        paragraphs: [
          "사내 정산서 사이트에서는 AI를 화려한 생성 기능보다 처리 속도와 문서 일관성을 높이는 보조 흐름으로 붙였습니다. 핵심은 모델 자체보다 워크플로 표준화였습니다.",
          "또 다른 프로젝트에서는 축제 데이터 수집, AI 카드뉴스 초안과 캡션 생성, Canva 연동, Instagram 발행 큐를 하나의 운영 화면으로 연결했습니다.",
        ],
      },
    ],
  },
  {
    slug: "app-runner-ecs-lambda",
    categoryEn: "Deploy & Infra",
    categoryKo: "배포와 인프라",
    titleEn: "App Runner vs ECS vs Lambda",
    titleKo: "App Runner, ECS, Lambda 비교",
    summaryEn:
      "Pick the runtime that matches traffic shape, operational control, and release complexity.",
    summaryKo:
      "트래픽 형태, 운영 제어 수준, 배포 복잡도에 맞는 런타임을 고르는 기준을 정리했습니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "The best option depends on request shape",
        paragraphs: [
          "Lambda is strong for bursty APIs and event-driven jobs, App Runner is useful for straightforward containers, and ECS fits teams that need deeper network and runtime control.",
          "The wrong choice usually shows up as cold-start pain, networking complexity, or deployment friction.",
        ],
      },
      {
        title: "Practical selection rules",
        items: [
          "Use Lambda when the app is naturally stateless and request bursts are unpredictable.",
          "Use App Runner when you want a simpler container platform without managing ECS primitives.",
          "Use ECS when you need custom sidecars, richer autoscaling control, or long-running worker services.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "List the app shape first: request duration, background jobs, websocket needs, VPC dependencies, and whether traffic is steady or bursty.",
          "Package one small API or service and deploy it to the simplest candidate runtime. Hands-on friction teaches more than a feature matrix.",
          "Check startup time, deploy speed, log visibility, secret handling, and networking setup before you compare edge cases.",
          "Estimate who will operate the service after launch. The cheapest technical option can still be the wrong one if the team cannot support it reliably.",
          "Choose the runtime that gives the simplest day-two operations, not the runtime with the most impressive architecture slide.",
        ],
      },
      {
        title: "Actual cases from delivery",
        paragraphs: [
          "In practice, I have worked with AWS delivery paths spanning EC2, RDS, load-balanced services, App Runner-style container deployment, and serverless transitions driven by cost and operational simplicity.",
          "The comparison becomes concrete only when you include rollout speed, auth/network friction, and whether the team can realistically operate the platform after launch.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "정답은 요청 특성에 따라 달라집니다",
        paragraphs: [
          "Lambda는 버스트형 API와 이벤트 처리에 강하고, App Runner는 단순한 컨테이너 앱에 편하며, ECS는 네트워크와 런타임을 더 깊게 제어해야 할 때 유리합니다.",
          "선택이 잘못되면 콜드 스타트, 네트워크 복잡도, 배포 마찰 같은 문제로 바로 드러납니다.",
        ],
      },
      {
        title: "실전 선택 기준",
        items: [
          "상태 없는 API이고 트래픽 급증이 불규칙하면 Lambda가 잘 맞습니다.",
          "컨테이너는 쓰되 ECS 자원을 세세하게 다루고 싶지 않으면 App Runner가 편합니다.",
          "사이드카, 세밀한 오토스케일링, 장기 실행 워커가 필요하면 ECS가 유리합니다.",
        ],
      },
      {
        title: "초보자 기준 선택 순서",
        steps: [
          "먼저 요청 특성을 적어 봅니다. 실행 시간, 백그라운드 작업 유무, 웹소켓 필요 여부, VPC 의존성, 트래픽이 꾸준한지 급증형인지가 핵심입니다.",
          "작은 API 하나를 가장 단순한 후보 런타임에 직접 올려 봅니다. 표 비교표보다 실제 배포 마찰을 보는 편이 훨씬 정확합니다.",
          "기동 시간, 배포 속도, 로그 확인 편의, 시크릿 주입, 네트워크 설정 난이도를 먼저 확인합니다. 초보자에겐 이 지점이 진짜 운영 비용입니다.",
          "출시 후 누가 이 서비스를 운영할지까지 계산합니다. 기술적으로 더 싸 보여도 팀이 안정적으로 관리하지 못하면 잘못된 선택일 수 있습니다.",
          "결국 가장 중요한 기준은 화려한 아키텍처가 아니라, 출시 후 둘째 날에도 가장 단순하게 운영할 수 있는가입니다.",
        ],
      },
      {
        title: "실제로 비교하게 된 사례",
        paragraphs: [
          "실무에서는 EC2, RDS, 로드밸런서 환경부터 App Runner 계열 컨테이너 배포, 서버리스 전환까지 운영 복잡도와 비용을 기준으로 선택을 바꿔 본 경험이 있습니다.",
          "결국 비교는 기능표가 아니라 배포 속도, 인증과 네트워크 마찰, 런칭 이후 팀이 감당할 수 있는 운영 수준까지 넣어야 현실적입니다.",
        ],
      },
    ],
  },
  {
    slug: "payment-failure-debugging",
    categoryEn: "Payments & SaaS",
    categoryKo: "결제와 SaaS",
    titleEn: "Common Reasons Payment Integrations Fail",
    titleKo: "결제 연동 실패 원인 정리",
    summaryEn:
      "Most payment bugs are state-management bugs, not UI bugs.",
    summaryKo:
      "결제 연동 문제는 화면 문제가 아니라 상태 관리 문제인 경우가 훨씬 많습니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "Treat payment state as a distributed system problem",
        paragraphs: [
          "The browser redirect, your server, the PG callback, and the webhook rarely arrive in a neat order.",
          "A payment flow becomes stable only when success, cancel, timeout, and duplicate events all map to explicit states.",
        ],
      },
      {
        title: "Failure patterns that keep repeating",
        items: [
          "Missing idempotency checks on approval and refund endpoints.",
          "Webhook signatures not verified or retried events not handled safely.",
          "Order, payment, settlement, and refund records drifting out of sync after partial failures.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Draw the full payment timeline before writing more code. Include browser redirect, backend approval, PG callback, webhook, cancel flow, and refund flow on one diagram.",
          "Create explicit states for order, payment, and settlement records so each system transition is visible instead of implied.",
          "Add idempotency checks and correlation IDs to approval, cancel, refund, and webhook handlers before testing the happy path again.",
          "Run sandbox tests for success, user cancel, timeout, duplicate webhook, partial failure, and delayed callback. Payment bugs usually hide outside the success case.",
          "Build an admin view that shows the event timeline and allows safe manual recovery. Without that screen, support work turns into database guesswork.",
        ],
      },
      {
        title: "Actual cases from delivery",
        paragraphs: [
          "On kiosk payment work, I had to stabilize `/Auth` and `/Cancel` flows across a C#/.NET plugin, terminal communication, browser bridge code, and fallback ACK handling.",
          "In a Firebase-based commerce back office, the hard parts were payment state transitions, eFinance webhook signature verification, reconciliation, and keeping admin operations aligned with actual settlement state.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "결제 상태는 분산 시스템 문제로 다뤄야 합니다",
        paragraphs: [
          "브라우저 리다이렉트, 서버 승인 처리, PG 콜백, 웹훅은 깔끔한 순서로 오지 않는 경우가 많습니다.",
          "성공, 취소, 타임아웃, 중복 이벤트를 명시적인 상태로 관리해야 결제 플로우가 안정됩니다.",
        ],
      },
      {
        title: "반복해서 나오는 실패 패턴",
        items: [
          "승인과 환불 엔드포인트에 멱등성 처리가 빠져 있는 경우.",
          "웹훅 서명 검증이 없거나 재전송 이벤트를 안전하게 처리하지 못하는 경우.",
          "부분 실패 이후 주문, 결제, 정산, 환불 레코드가 서로 어긋나는 경우.",
        ],
      },
      {
        title: "초보자 기준 진행 순서",
        steps: [
          "코드를 더 쓰기 전에 결제 전체 타임라인을 먼저 그립니다. 브라우저 리다이렉트, 서버 승인, PG 콜백, 웹훅, 취소, 환불 흐름을 한 장에 담아야 합니다.",
          "주문, 결제, 정산 레코드의 상태를 명시적으로 정의합니다. 상태가 코드에 암묵적으로 숨어 있으면 장애 때 설명이 안 됩니다.",
          "승인, 취소, 환불, 웹훅 처리부에 멱등성 검사와 correlation ID를 넣고 나서 정상 케이스를 다시 검증합니다.",
          "샌드박스에서 성공, 사용자 취소, 타임아웃, 중복 웹훅, 부분 실패, 지연 콜백을 각각 테스트합니다. 실제 결제 버그는 성공 케이스 밖에서 숨어 있습니다.",
          "이벤트 타임라인과 안전한 수동 복구 동작이 보이는 관리자 화면을 만듭니다. 그 화면이 없으면 CS와 운영이 결국 DB 추측으로 흘러갑니다.",
        ],
      },
      {
        title: "실제로 겪은 사례",
        paragraphs: [
          "키오스크 결제 연동에서는 C#/.NET 플러그인, 단말기 통신, 브라우저 브리지, ACK 및 fallback 처리까지 얽혀 있어서 `/Auth`와 `/Cancel` 흐름을 안정화하는 데 상태 관리가 핵심이었습니다.",
          "Firebase 기반 상거래 백오피스에서는 결제 상태 전이, eFinance 웹훅 서명 검증, 정산 대사, 관리자 운영 흐름을 실제 결제 상태와 맞추는 작업이 가장 어려운 부분이었습니다.",
        ],
      },
    ],
  },
  {
    slug: "ai-portfolio-site",
    categoryEn: "AI in Web Apps",
    categoryKo: "웹앱의 AI 기능",
    titleEn: "How to Build a Portfolio Site with AI Features",
    titleKo: "AI 기능을 붙인 포트폴리오 사이트 만드는 법",
    summaryEn:
      "Show one focused workflow that proves product judgment, not a pile of random AI demos.",
    summaryKo:
      "무작위 AI 데모를 많이 붙이는 것보다, 실제 가치가 있는 한두 개의 흐름을 선명하게 보여주는 편이 훨씬 낫습니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "The strongest portfolio feature is a believable use case",
        paragraphs: [
          "A chatbot, summary assistant, proposal generator, or admin helper works only when it clearly supports the business goal of the site.",
          "The feature should demonstrate product judgment, guardrails, logging, and graceful fallback behavior.",
        ],
      },
      {
        title: "What to show on the site",
        items: [
          "What user problem the AI feature solves and when it should not trigger.",
          "How usage is limited, logged, and billed or capped.",
          "How the system behaves when the provider is slow, unavailable, or returns low-quality output.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Pick one believable workflow first, such as a project summarizer, portfolio Q&A helper, or proposal draft generator. One strong feature is better than five shallow demos.",
          "Define the trigger clearly so users know when the AI should run and when the normal UI should stay in control.",
          "Build the feature behind your backend and add usage limits, latency states, and fallback messages before polishing the visual layer.",
          "Explain the system on the page itself: what data it uses, what it cannot do well, and how errors are handled.",
          "Document the outcome as a case study with problem, approach, and operator value. The explanation is part of the portfolio signal, not an optional extra.",
        ],
      },
      {
        title: "Actual cases from delivery",
        paragraphs: [
          "The strongest examples in my own work were not generic chat UIs. They were operational tools: an AI-assisted settlement workflow and a content operations studio that combined generation, human review, template handoff, and publish queues.",
          "Those projects were credible because the AI feature sat inside a real business flow with clear limits and measurable operator value.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "가장 강한 포트폴리오 기능은 그럴듯한 사용 사례입니다",
        paragraphs: [
          "챗봇, 요약, 제안서 생성, 관리자 보조 기능은 사이트의 실제 목적과 연결될 때만 설득력이 생깁니다.",
          "기능 자체보다 제품 판단, 가드레일, 로깅, 실패 대응까지 보여주는 구성이 더 중요합니다.",
        ],
      },
      {
        title: "사이트에서 보여줘야 할 것",
        items: [
          "AI 기능이 어떤 문제를 해결하고 언제는 동작하지 않아야 하는지.",
          "사용량을 어떻게 제한하고 기록하며 비용을 어떻게 통제하는지.",
          "모델 응답이 느리거나 실패하거나 품질이 낮을 때 시스템이 어떻게 버티는지.",
        ],
      },
      {
        title: "초보자 기준 진행 순서",
        steps: [
          "먼저 프로젝트 요약 도우미, 포트폴리오 Q&A, 제안서 초안 생성처럼 그럴듯한 흐름 하나만 고릅니다. 얕은 데모 다섯 개보다 강한 기능 하나가 낫습니다.",
          "사용자가 언제 AI를 실행해야 하는지, 언제는 일반 UI가 주도권을 가져야 하는지 트리거를 명확히 정합니다.",
          "기능은 백엔드 뒤에 두고, 화면 다듬기 전에 사용량 제한, 지연 상태, 실패 메시지를 먼저 넣습니다.",
          "페이지 안에서 이 기능이 어떤 데이터를 보고 무엇을 잘 못하는지, 오류는 어떻게 처리되는지를 설명합니다.",
          "마지막으로 문제, 접근 방식, 운영 가치가 보이는 케이스 스터디 형태로 정리합니다. 설명 자체가 포트폴리오의 신뢰 신호입니다.",
        ],
      },
      {
        title: "실제로 설득력이 있었던 사례",
        paragraphs: [
          "제가 직접 만든 AI 기능 중에서 강했던 것은 일반 챗봇보다 운영 도구에 들어간 기능이었습니다. 예를 들면 AI 보조 정산 워크플로와 생성, 검수, 템플릿 전달, 발행 큐가 연결된 콘텐츠 운영 스튜디오입니다.",
          "이 사례들이 설득력 있었던 이유는 AI가 실제 비즈니스 흐름 안에 들어가 있었고, 한계와 운영 가치가 분명했기 때문입니다.",
        ],
      },
    ],
  },
  {
    slug: "nestjs-redis-queue",
    categoryEn: "Automation",
    categoryKo: "자동화",
    titleEn: "Building a NestJS + Redis Queue System",
    titleKo: "NestJS + Redis 대기열 시스템 구현",
    summaryEn:
      "Queues are useful when work is slow, retryable, and safe to process outside the request cycle.",
    summaryKo:
      "느리고, 재시도가 가능하고, 요청 흐름 밖에서 처리해도 되는 작업이라면 큐를 두는 편이 맞습니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "Do not queue everything",
        paragraphs: [
          "Queues help with email, webhooks, image processing, sync jobs, and burst control.",
          "They become a liability when the job has unclear ownership, weak idempotency, or no visibility into retries and dead letters.",
        ],
      },
      {
        title: "Implementation rules",
        items: [
          "Keep payloads small and fetch the latest source of truth inside the worker.",
          "Add retry limits, dead-letter handling, and per-job observability from day one.",
          "Protect shared resources with locks or version checks when multiple workers compete on the same record.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Start by listing which tasks are slow, retryable, and safe to run after the HTTP response. That is the real queue boundary.",
          "Create one queue and one worker first, and keep the job payload small. Store IDs, not large mutable objects, so the worker can fetch the latest state safely.",
          "Add retry count, dead-letter handling, and structured logs before you add more job types. A queue without observability becomes a hidden failure machine.",
          "Protect shared records with Redis locks, version checks, or transaction rules if multiple workers can update the same entity.",
          "Prepare operator tools for replay, pause, and recovery. You do not really own a queue until you can recover from a stuck or duplicated job.",
        ],
      },
      {
        title: "Actual cases from delivery",
        paragraphs: [
          "I applied this in a NestJS and Redis-based waiting system where session open/close, registration, admin force-state changes, metrics, and notifications all had to stay consistent under load.",
          "I also worked on Redis-backed session sharing, WebSocket messaging, and Bull Queue-based real-time collaboration features where queue boundaries and session ownership mattered as much as the transport itself.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "모든 작업을 큐로 보내면 안 됩니다",
        paragraphs: [
          "이메일, 웹훅, 이미지 처리, 동기화 작업, 버스트 제어 같은 경우에 큐가 특히 유용합니다.",
          "하지만 소유권이 불분명하거나 멱등성이 약하거나 재시도 가시성이 없으면 오히려 장애 지점을 늘립니다.",
        ],
      },
      {
        title: "구현 원칙",
        items: [
          "페이로드는 작게 유지하고 워커 안에서 최신 원본 데이터를 다시 읽습니다.",
          "재시도 제한, 데드레터 처리, 작업별 관측성을 처음부터 넣습니다.",
          "여러 워커가 같은 레코드를 건드릴 수 있으면 락이나 버전 체크로 보호합니다.",
        ],
      },
      {
        title: "초보자 기준 진행 순서",
        steps: [
          "먼저 어떤 작업이 느리고, 재시도 가능하고, HTTP 응답 뒤에서 처리돼도 되는지 목록으로 나눕니다. 그 경계가 진짜 큐 경계입니다.",
          "처음에는 큐 하나와 워커 하나만 만들고, 작업 페이로드는 작게 유지합니다. 큰 가변 객체 대신 ID만 넣고 워커에서 최신 상태를 다시 읽는 편이 안전합니다.",
          "재시도 횟수, 데드레터 처리, 구조화 로그를 먼저 넣고 나서 작업 종류를 늘립니다. 관측성 없는 큐는 숨겨진 장애 생성기가 됩니다.",
          "여러 워커가 같은 엔터티를 건드릴 수 있으면 Redis 락, 버전 체크, 트랜잭션 규칙으로 보호합니다.",
          "재실행, 일시정지, 복구를 위한 운영자 도구를 준비합니다. 멈춘 작업이나 중복 작업을 복구할 수 있어야 진짜로 큐를 소유한 것입니다.",
        ],
      },
      {
        title: "실제로 적용한 사례",
        paragraphs: [
          "NestJS와 Redis 기반 대기열 시스템에서는 세션 오픈·종료, 대기 등록, 관리자 강제 상태 변경, 통계, 알림이 피크 트래픽에서도 어긋나지 않도록 정합성을 잡아야 했습니다.",
          "또 다른 실시간 플랫폼 기능에서는 Redis 세션 공유, WebSocket 메시징, Bull Queue가 함께 돌아가면서 큐 경계와 세션 소유권을 명확히 나누는 것이 핵심이었습니다.",
        ],
      },
    ],
  },
  {
    slug: "firebase-vs-aws-costs",
    categoryEn: "Deploy & Infra",
    categoryKo: "배포와 인프라",
    titleEn: "Firebase vs AWS: Which Is Cheaper?",
    titleKo: "Firebase vs AWS 어떤 게 더 싼지",
    summaryEn:
      "The cheaper option depends on traffic shape, background jobs, storage, and how much ops work your team can absorb.",
    summaryKo:
      "무엇이 더 싼지는 트래픽 형태, 백그라운드 작업, 스토리지, 그리고 팀이 감당할 수 있는 운영 복잡도에 따라 달라집니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "There is no universal winner",
        paragraphs: [
          "Firebase is often faster to start with for small teams that want auth, hosting, and basic backend services quickly.",
          "AWS becomes attractive when you need finer cost control, broader infrastructure choices, or more predictable scaling patterns.",
        ],
      },
      {
        title: "What changes the bill the most",
        items: [
          "Realtime reads, write amplification, and storage growth on the Firebase side.",
          "Idle container cost, egress, CloudFront patterns, and operational tooling on the AWS side.",
          "The price of engineering time when the platform model does not fit the product.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Write down the product shape first: number of users, realtime requirements, file storage, background jobs, and admin workflows.",
          "Estimate the usage drivers that actually create cost, such as document reads, function invocations, image delivery, container uptime, and data transfer.",
          "Include developer time in the comparison. A platform that is slightly cheaper on paper can still be more expensive if it slows delivery or debugging.",
          "Prototype one representative workload on each stack instead of debating only from pricing tables.",
          "Choose the platform that fits both the current phase and the likely next phase. Migration cost is part of the total cost, even when it is not on the invoice.",
        ],
      },
      {
        title: "Actual cases from delivery",
        paragraphs: [
          "I have worked on both sides: Firebase-powered commerce operations for fast product iteration, and AWS-based delivery for infrastructure control, CI/CD, custom domains, and cost-sensitive runtime choices.",
          "The cost answer changed depending on whether the team valued shipping speed, realtime convenience, or long-term operational control more.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "항상 더 싼 쪽은 없습니다",
        paragraphs: [
          "작은 팀이 인증, 호스팅, 기본 백엔드를 빠르게 붙일 때는 Firebase가 시작 비용을 줄여주는 경우가 많습니다.",
          "더 세밀한 비용 제어, 다양한 인프라 선택지, 예측 가능한 스케일링이 필요하면 AWS가 유리해집니다.",
        ],
      },
      {
        title: "비용을 크게 바꾸는 요인",
        items: [
          "Firebase 쪽에서는 실시간 읽기, 쓰기 증폭, 스토리지 증가가 크게 작용합니다.",
          "AWS 쪽에서는 유휴 컨테이너 비용, egress, CloudFront 패턴, 운영 도구 비용이 중요합니다.",
          "플랫폼과 제품 구조가 맞지 않을 때 발생하는 개발 시간 비용도 반드시 포함해야 합니다.",
        ],
      },
      {
        title: "초보자 기준 비교 순서",
        steps: [
          "먼저 제품 형태를 적습니다. 사용자 수, 실시간 기능 필요 여부, 파일 저장량, 백그라운드 작업, 관리자 기능이 핵심입니다.",
          "그다음 실제 비용을 만드는 요소를 추정합니다. 문서 읽기, 함수 호출, 이미지 전송, 컨테이너 가동 시간, 데이터 전송량처럼요.",
          "개발 시간 비용도 비교표에 넣습니다. 청구서상 조금 싸 보여도 개발과 디버깅이 느려지면 총비용은 더 커질 수 있습니다.",
          "가격표만 보지 말고 대표적인 워크로드 하나를 각 스택에서 직접 돌려 봅니다.",
          "현재 단계와 다음 단계 둘 다에 맞는 플랫폼을 고릅니다. 나중에 갈아타는 비용도 결국 총비용의 일부입니다.",
        ],
      },
      {
        title: "실제로 비교하게 된 사례",
        paragraphs: [
          "저는 Firebase 기반 상거래 운영 시스템도 만들어 봤고, AWS 기반 배포와 CI/CD, 커스텀 도메인, 런타임 선택이 중요한 프로젝트도 해봤습니다.",
          "무엇이 더 싼지는 결국 출시 속도가 더 중요한지, 실시간 기능 편의가 더 중요한지, 장기적인 인프라 제어가 더 중요한지에 따라 달라졌습니다.",
        ],
      },
    ],
  },
  {
    slug: "canva-instagram-automation",
    categoryEn: "Automation",
    categoryKo: "자동화",
    titleEn: "Canva API and Instagram Automation Architecture",
    titleKo: "Canva API / Instagram 자동화 구조",
    summaryEn:
      "Automation works when asset generation, approval, and publish limits are separated cleanly.",
    summaryKo:
      "자동화는 생성, 검수, 발행 한계를 분리해 두어야 안정적으로 굴러갑니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "Publishing should never be the first automated step",
        paragraphs: [
          "Template generation, caption assembly, asset checks, and scheduling are usually safe to automate earlier than final publishing.",
          "Instagram and partner APIs often impose approval, account, format, and rate restrictions that must be modeled explicitly.",
        ],
      },
      {
        title: "A safer automation pipeline",
        items: [
          "Generate assets from template variables and keep versioned output references.",
          "Insert a review checkpoint before social publishing when content risk is non-trivial.",
          "Persist publish status, retry reason, and platform response IDs for later reconciliation.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Define the source data first: title, date, venue, image set, CTA, hashtags, and template variant. Automation breaks quickly when the input schema is vague.",
          "Generate drafts and assets before you touch publishing. The early stages are safer places to automate than the final customer-facing action.",
          "Add a human review step for copy, image fit, and policy risk. This is where bad automation should be caught before it becomes public.",
          "Queue publishing with retry limits, rate awareness, and a visible status model so you know whether a post is pending, failed, or successfully published.",
          "Save asset versions, external post IDs, and analytics references so later edits and reconciliation are possible.",
        ],
      },
      {
        title: "Actual cases from delivery",
        paragraphs: [
          "In a festival content operations studio, I connected source aggregation, AI-generated cardnews drafts, Canva handoff, Instagram publishing queues, and analytics in one workflow.",
          "What mattered most was not the generation step alone, but the review boundary and the ability to track which asset version and publish attempt mapped to which downstream result.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "발행은 자동화의 첫 단계가 되면 안 됩니다",
        paragraphs: [
          "템플릿 생성, 캡션 조합, 자산 검증, 예약 등록까지는 비교적 자동화하기 쉽지만 최종 발행은 별도 통제가 필요합니다.",
          "Instagram과 연동 API는 계정 조건, 포맷 제약, 승인 흐름, 레이트 제한을 명시적으로 모델링해야 합니다.",
        ],
      },
      {
        title: "더 안전한 자동화 파이프라인",
        items: [
          "템플릿 변수로 자산을 생성하고 결과물 버전을 추적합니다.",
          "콘텐츠 리스크가 있으면 소셜 발행 전에 검수 단계를 둡니다.",
          "발행 상태, 재시도 사유, 플랫폼 응답 ID를 저장해 나중에 정합성을 맞춥니다.",
        ],
      },
      {
        title: "초보자 기준 진행 순서",
        steps: [
          "먼저 입력 데이터를 정의합니다. 제목, 일정, 장소, 이미지 세트, CTA, 해시태그, 템플릿 종류가 최소 기준입니다. 입력 스키마가 흐리면 자동화는 금방 깨집니다.",
          "발행 전에 초안과 자산 생성까지 자동화합니다. 실제 사용자에게 노출되는 최종 발행보다 앞단이 훨씬 안전한 자동화 지점입니다.",
          "문구, 이미지 적합성, 정책 리스크를 보는 사람 검수 단계를 둡니다. 자동화가 잘못되었는지는 공개되기 전에 여기서 걸러져야 합니다.",
          "발행은 재시도 제한, 레이트 고려, 상태 표시가 있는 큐로 처리합니다. 대기 중인지, 실패했는지, 발행됐는지가 보여야 운영이 가능합니다.",
          "자산 버전, 외부 플랫폼 게시물 ID, 분석 기준값을 함께 저장합니다. 그래야 나중에 수정과 정합성 점검이 가능합니다.",
        ],
      },
      {
        title: "실제로 구성했던 사례",
        paragraphs: [
          "축제 콘텐츠 운영 스튜디오에서는 소스 수집, AI 카드뉴스 초안 생성, Canva 전달, Instagram 발행 큐, 분석 화면을 하나의 흐름으로 연결했습니다.",
          "여기서 중요한 건 생성 기능 그 자체보다 검수 경계와, 어떤 자산 버전이 어떤 발행 시도와 연결되는지 추적 가능한 구조였습니다.",
        ],
      },
    ],
  },
  {
    slug: "model-api-integration",
    categoryEn: "AI in Web Apps",
    categoryKo: "웹앱의 AI 기능",
    titleEn: "Integrating OpenAI, Gemini, and Claude APIs",
    titleKo: "OpenAI / Gemini / Claude API 붙이기",
    summaryEn:
      "Build a provider abstraction only where behavior really differs: models, tools, streaming, and policy limits.",
    summaryKo:
      "모델, 도구 호출, 스트리밍, 정책 제한처럼 실제로 차이가 나는 지점만 추상화하는 편이 실용적입니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "Provider-agnostic does not mean feature-agnostic",
        paragraphs: [
          "A thin adapter for request shape, usage logging, and retry policy is useful.",
          "Trying to hide every provider difference usually slows product work and removes the ability to use model-specific strengths.",
        ],
      },
      {
        title: "What to standardize",
        items: [
          "Prompt assembly, auth, quota checks, and response tracing.",
          "Timeout policy, fallback model routing, and cost monitoring.",
          "A clear contract for text, tool calls, images, and streaming events.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Start with one provider first and make the feature work end to end before adding a second provider.",
          "Define a small internal contract for input, output, usage logging, and error shape. This is the layer that should stay stable when providers change.",
          "Create one adapter per provider for auth, model selection, and request formatting instead of trying to hide every difference behind one giant abstraction.",
          "Test streaming, tool calls, images, and fallback behavior separately because providers differ most at those edges.",
          "Route traffic by use case after you have real quality and cost data. Provider abstraction is useful only when it helps product decisions, not when it hides them.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "공급자 공통화가 기능 공통화를 뜻하진 않습니다",
        paragraphs: [
          "요청 형태, 사용량 로깅, 재시도 정책 정도를 얇게 감싸는 어댑터는 유용합니다.",
          "하지만 공급자 차이를 전부 숨기려 하면 모델별 강점을 못 쓰고 제품 개발 속도도 떨어집니다.",
        ],
      },
      {
        title: "표준화할 것",
        items: [
          "프롬프트 조립, 인증, 쿼터 검사, 응답 추적.",
          "타임아웃 정책, 대체 모델 라우팅, 비용 모니터링.",
          "텍스트, 도구 호출, 이미지, 스트리밍 이벤트에 대한 명확한 계약.",
        ],
      },
      {
        title: "초보자 기준 진행 순서",
        steps: [
          "처음에는 공급자 하나만 붙여서 기능을 끝까지 동작시키고, 그다음 두 번째 공급자를 추가합니다.",
          "입력, 출력, 사용량 기록, 오류 형태에 대한 작은 내부 계약을 먼저 정합니다. 공급자가 바뀌어도 안정적으로 유지돼야 하는 부분은 이 계층입니다.",
          "공급자별 인증, 모델 선택, 요청 포맷은 어댑터로 분리하고, 모든 차이를 억지로 하나의 거대한 추상화로 숨기려 하지는 않습니다.",
          "스트리밍, 도구 호출, 이미지 생성, fallback 동작은 각각 따로 테스트합니다. 공급자 차이는 이 경계에서 가장 크게 드러납니다.",
          "실제 품질과 비용 데이터를 본 뒤 기능별 라우팅을 결정합니다. 추상화는 제품 판단을 돕는 수준에서만 유용합니다.",
        ],
      },
    ],
  },
  {
    slug: "ai-features-in-web-apps",
    categoryEn: "AI in Web Apps",
    categoryKo: "웹앱의 AI 기능",
    titleEn: "Building Chatbot, Summary, Recommendation, and Image Features",
    titleKo: "챗봇, 요약, 추천, 이미지 생성 기능 구현",
    summaryEn:
      "AI features feel better when each feature has a clear job, a clear fallback, and a clear limit.",
    summaryKo:
      "각 기능의 역할과 실패 시 대체 흐름, 사용 한도가 분명할 때 AI 기능이 훨씬 제품답게 느껴집니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "Treat each AI feature as a product surface",
        paragraphs: [
          "A chatbot handles exploration, summaries reduce reading time, recommendations narrow choices, and image tools accelerate asset creation.",
          "Bundling all of them into one vague assistant usually harms trust and performance.",
        ],
      },
      {
        title: "Feature design checklist",
        items: [
          "Define the user input contract and what context the model can see.",
          "Show latency states, source citations, or confidence hints where users need them.",
          "Limit expensive tasks with quotas, async jobs, or approval steps.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Choose one feature class first: chatbot, summary, recommendation, or image generation. Each one has a different interaction and failure pattern.",
          "Define the user input and the system context separately so you know what the model is allowed to use.",
          "Design the fallback before polishing the happy path. Decide what happens when the model is slow, wrong, unavailable, or too expensive to run.",
          "Use asynchronous jobs for expensive work such as bulk summarization or image generation, and keep the UI honest about progress.",
          "Measure whether the feature actually saves time or improves decisions. AI features that do not improve real behavior should not stay in the product.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "AI 기능마다 제품 표면을 따로 봐야 합니다",
        paragraphs: [
          "챗봇은 탐색, 요약은 읽기 시간 단축, 추천은 선택 좁히기, 이미지 생성은 자산 제작 속도 향상처럼 역할이 분명해야 합니다.",
          "이 기능들을 하나의 모호한 도우미로 뭉치면 신뢰와 성능이 모두 떨어지는 경우가 많습니다.",
        ],
      },
      {
        title: "기능 설계 체크리스트",
        items: [
          "사용자 입력 계약과 모델이 볼 수 있는 문맥 범위를 정의합니다.",
          "필요한 곳에는 지연 상태, 출처, 신뢰 힌트를 노출합니다.",
          "비싼 작업은 쿼터, 비동기 처리, 승인 단계로 제한합니다.",
        ],
      },
      {
        title: "초보자 기준 진행 순서",
        steps: [
          "먼저 챗봇, 요약, 추천, 이미지 생성 중 하나만 고릅니다. 기능마다 상호작용 방식과 실패 패턴이 다르기 때문입니다.",
          "사용자 입력과 시스템 문맥을 분리해서 정의합니다. 모델이 무엇을 볼 수 있는지 경계가 분명해야 합니다.",
          "정상 흐름보다 실패 대체 흐름을 먼저 설계합니다. 느릴 때, 틀릴 때, unavailable일 때, 비용이 너무 클 때를 먼저 정해야 합니다.",
          "대량 요약이나 이미지 생성처럼 비싼 작업은 비동기 잡으로 빼고, 화면에는 진행 상태를 솔직하게 보여줍니다.",
          "마지막으로 이 기능이 실제로 시간을 줄였는지, 선택을 더 쉽게 했는지 측정합니다. 행동을 바꾸지 못하는 기능은 제품에 남길 이유가 약합니다.",
        ],
      },
    ],
  },
  {
    slug: "auth-billing-token-management",
    categoryEn: "AI in Web Apps",
    categoryKo: "웹앱의 AI 기능",
    titleEn: "Managing Auth, Permissions, Billing, and Tokens for AI Features",
    titleKo: "인증/권한/요금/토큰 관리",
    summaryEn:
      "Most AI product bugs come from entitlement and spending logic, not from prompt quality.",
    summaryKo:
      "AI 제품에서 자주 터지는 문제는 프롬프트 품질보다 권한과 과금 통제에서 나오는 경우가 많습니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "Tie usage to a billing entity, not only a session",
        paragraphs: [
          "A real product needs to know which user, team, plan, or workspace consumed the model budget.",
          "Without that mapping you cannot implement limits, upgrade paths, refunds, or abuse controls cleanly.",
        ],
      },
      {
        title: "Control points worth implementing early",
        items: [
          "Role-based feature access before the provider call begins.",
          "Soft and hard usage limits with visible remaining quota.",
          "A token and cost ledger that can be reconciled against provider usage reports.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Choose the billing entity first: individual user, team, workspace, or company account. Everything else depends on that mapping.",
          "Check entitlement before the model call starts so blocked users do not consume tokens before being rejected.",
          "Record every request with user ID, plan, feature type, token usage, and estimated cost in one ledger.",
          "Expose remaining quota and upgrade rules clearly in the UI so limits do not feel random or broken.",
          "Reconcile your internal ledger against provider usage reports and refund flows regularly. Billing systems drift unless someone closes the loop.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "사용량은 세션이 아니라 과금 주체에 연결해야 합니다",
        paragraphs: [
          "실제 제품은 어떤 사용자, 팀, 플랜, 워크스페이스가 모델 비용을 썼는지 알아야 합니다.",
          "이 매핑이 없으면 사용량 제한, 업그레이드, 환불, 남용 통제를 제대로 구현할 수 없습니다.",
        ],
      },
      {
        title: "초기에 넣어둘 제어 지점",
        items: [
          "모델 호출 전에 역할 기반 기능 접근 제어를 거칩니다.",
          "남은 사용량이 보이는 soft / hard limit를 둡니다.",
          "공급자 사용량 리포트와 맞출 수 있는 토큰 및 비용 원장을 남깁니다.",
        ],
      },
      {
        title: "초보자 기준 진행 순서",
        steps: [
          "먼저 누가 비용을 부담하는지 정합니다. 개인 사용자, 팀, 워크스페이스, 회사 계정 중 하나가 명확해야 나머지가 정리됩니다.",
          "모델 호출 전에 권한과 플랜을 검사해서, 차단된 사용자가 토큰부터 쓰고 거절되는 상황을 막습니다.",
          "모든 요청에 대해 사용자 ID, 플랜, 기능 종류, 토큰 사용량, 예상 비용을 한 원장에 기록합니다.",
          "남은 사용량과 업그레이드 기준을 UI에서 명확히 보여줘야 제한이 고장처럼 느껴지지 않습니다.",
          "정기적으로 내부 사용량 원장과 공급자 사용량 리포트, 환불 내역을 맞춰 봅니다. 과금 시스템은 누가 닫아보지 않으면 조금씩 어긋납니다.",
        ],
      },
    ],
  },
  {
    slug: "docker-cicd-github-actions",
    categoryEn: "Deploy & Infra",
    categoryKo: "배포와 인프라",
    titleEn: "Docker, CI/CD, and GitHub Actions for Web Delivery",
    titleKo: "Docker, CI/CD, GitHub Actions",
    summaryEn:
      "A useful pipeline makes build, deploy, rollback, and secret handling boring and repeatable.",
    summaryKo:
      "좋은 파이프라인은 빌드, 배포, 롤백, 시크릿 관리를 지루할 정도로 반복 가능하게 만듭니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "The pipeline should match the runtime",
        paragraphs: [
          "Static Next.js exports, container services, and Lambda packages need different artifacts and different rollback mechanics.",
          "The fastest route is often one workflow per deployment surface rather than one giant universal pipeline.",
        ],
      },
      {
        title: "Pipeline essentials",
        items: [
          "Reproducible builds with pinned dependency install and environment injection at the right step.",
          "Artifact validation before deploy, not after deploy.",
          "A rollback path that is documented and can be executed without improvisation.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Start by making the build reproducible on one machine. Pin dependencies, freeze the Node version, and make the build pass locally before writing workflow YAML.",
          "Define the deployment artifact clearly: static export, Docker image, or packaged function bundle. The pipeline should move one known artifact, not rebuild unpredictably later.",
          "Inject environment variables and secrets at the stage that matches the runtime, and avoid mixing build-time and runtime configuration accidentally.",
          "Validate the artifact before deploy with smoke checks such as build output existence, image startup, or health endpoint verification.",
          "Document rollback as a normal path, not an emergency improvisation. A pipeline is only mature when the previous stable version can be restored quickly.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "파이프라인은 런타임 구조와 맞아야 합니다",
        paragraphs: [
          "정적 Next.js export, 컨테이너 서비스, Lambda 패키지는 산출물과 롤백 방식이 서로 다릅니다.",
          "하나의 거대한 범용 파이프라인보다 배포 표면별 워크플로를 나누는 편이 더 빠른 경우가 많습니다.",
        ],
      },
      {
        title: "파이프라인 필수 요소",
        items: [
          "의존성 설치 버전 고정과 올바른 단계의 환경변수 주입으로 재현 가능한 빌드를 만듭니다.",
          "배포 후가 아니라 배포 전에 산출물을 검증합니다.",
          "문서화된 롤백 절차를 즉시 실행할 수 있어야 합니다.",
        ],
      },
      {
        title: "초보자 기준 진행 순서",
        steps: [
          "먼저 한 대의 개발 환경에서 빌드가 재현 가능해야 합니다. 의존성 버전과 Node 버전을 고정하고 로컬 빌드부터 통과시킵니다.",
          "배포 산출물을 명확히 정합니다. 정적 export인지, Docker 이미지인지, 함수 번들인지 먼저 고정해야 파이프라인이 흔들리지 않습니다.",
          "환경변수와 시크릿은 런타임에 맞는 단계에서 주입하고, 빌드 시점과 실행 시점 설정을 섞지 않도록 주의합니다.",
          "배포 전에 산출물을 검증합니다. 빌드 결과 존재 여부, 컨테이너 기동, health endpoint 확인 같은 작은 점검이 장애를 크게 줄입니다.",
          "롤백 절차를 비상 대응이 아니라 정상 경로로 문서화합니다. 이전 안정 버전으로 빨리 돌아갈 수 있어야 파이프라인이 성숙합니다.",
        ],
      },
    ],
  },
  {
    slug: "n8n-backoffice-automation",
    categoryEn: "Automation",
    categoryKo: "자동화",
    titleEn: "n8n and Back-office Automation",
    titleKo: "n8n / 관리자 백오피스 자동화",
    summaryEn:
      "Automation works best on repetitive admin flows with clear approvals and audit trails.",
    summaryKo:
      "자동화는 반복적인 백오피스 흐름에 승인 단계와 감사 기록이 있을 때 가장 효과적입니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "Automate operations, not hidden business rules",
        paragraphs: [
          "n8n is useful for notifications, sync jobs, approval chains, CRM updates, and content operations.",
          "Critical pricing, permission, or settlement logic should still live in versioned application code when correctness matters most.",
        ],
      },
      {
        title: "What makes an automation durable",
        items: [
          "Idempotent steps and visible retry history.",
          "An approval checkpoint before destructive or customer-facing actions.",
          "A source-of-truth system that remains authoritative even when automation fails halfway.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Map the current manual flow first and mark which steps are repetitive, approval-based, or error-prone. Those are the best candidates for automation.",
          "Choose one source of truth such as your database, CRM, or admin backend and treat n8n as an orchestrator, not the final authority.",
          "Build each automation step so it can be retried safely without creating duplicates or destructive side effects.",
          "Insert approval gates before sending messages, changing customer-visible data, or triggering payments and refunds.",
          "Add alerts, run logs, and manual replay instructions so operators can recover without reading workflow internals every time.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "숨겨진 핵심 규칙보다 운영 절차를 자동화합니다",
        paragraphs: [
          "n8n은 알림, 동기화, 승인 체인, CRM 업데이트, 콘텐츠 운영 자동화에 특히 잘 맞습니다.",
          "가격, 권한, 정산처럼 정확성이 중요한 핵심 규칙은 여전히 버전 관리되는 애플리케이션 코드에 두는 편이 안전합니다.",
        ],
      },
      {
        title: "오래가는 자동화 조건",
        items: [
          "멱등적인 단계와 보이는 재시도 이력.",
          "파괴적이거나 고객 노출이 있는 작업 전 승인 단계.",
          "자동화가 중간에 실패해도 최종 기준이 되는 원본 시스템의 존재.",
        ],
      },
      {
        title: "초보자 기준 진행 순서",
        steps: [
          "먼저 현재 수작업 흐름을 그려 보고, 반복적이고 승인 기반이며 실수가 자주 나는 단계를 표시합니다. 자동화 후보는 여기서 나옵니다.",
          "DB, CRM, 관리자 백엔드 중 하나를 원본 시스템으로 정하고 n8n은 오케스트레이터로만 둡니다.",
          "각 단계는 재실행해도 중복이나 파괴적 부작용이 없도록 멱등적으로 만듭니다.",
          "메시지 발송, 고객 노출 데이터 변경, 결제/환불 트리거 전에는 승인 단계를 둡니다.",
          "알림, 실행 로그, 수동 재실행 절차를 같이 준비해서 운영자가 매번 워크플로 내부를 뜯어보지 않아도 복구할 수 있게 합니다.",
        ],
      },
    ],
  },
  {
    slug: "toss-pg-subscription-systems",
    categoryEn: "Payments & SaaS",
    categoryKo: "결제와 SaaS",
    titleEn: "Toss, PG Integrations, and Subscription Admin Systems",
    titleKo: "Toss / PG 연동, 구독 모델, 관리자용 결제/정산 시스템",
    summaryEn:
      "A subscription product needs more than a payment button: plan state, invoicing, reconciliation, and admin visibility.",
    summaryKo:
      "구독형 서비스는 결제 버튼만으로 끝나지 않습니다. 플랜 상태, 청구, 정합성 점검, 관리자 가시성이 함께 필요합니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "The hard part starts after payment success",
        paragraphs: [
          "Plans, renewals, grace periods, failed rebills, refunds, and settlement reporting all need explicit states.",
          "Admin tooling matters because finance and support teams need to answer what happened without reading raw logs.",
        ],
      },
      {
        title: "Core entities to model",
        items: [
          "Customer, plan, subscription, invoice, payment, refund, and settlement.",
          "Webhook reconciliation flows for duplicated, delayed, and partial events.",
          "Admin views for payment timeline, billing status, and manual recovery actions.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Model the core records first: customer, plan, subscription, invoice, payment, refund, and settlement. The UI will stay confused if these entities are vague.",
          "Write the lifecycle timeline for signup, initial payment, renewal, failed rebill, grace period, cancel, refund, and expiry before implementing the screens.",
          "Make webhook handlers idempotent and store external event IDs so retries do not corrupt subscription state.",
          "Build an admin timeline that shows what happened in business language, not only raw gateway logs.",
          "Reconcile settlements on a regular schedule and compare invoice totals, payment success, refunds, and payout data. Subscription systems quietly drift unless someone checks the books.",
        ],
      },
      {
        title: "Actual cases from delivery",
        paragraphs: [
          "In commerce operations work, I had to tie order creation, stock deduction, webhook verification, payment state transitions, SMS job queues, admin dashboards, and CSV reconciliation into one operational model.",
          "That experience is why I treat subscriptions and settlement systems as state machines first and UI problems second.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "어려운 부분은 결제 성공 이후부터 시작됩니다",
        paragraphs: [
          "플랜, 갱신, 유예기간, 재결제 실패, 환불, 정산 리포트까지 모두 명시적인 상태로 관리해야 합니다.",
          "재무나 CS가 원시 로그 없이도 무슨 일이 있었는지 설명할 수 있어야 하므로 관리자 도구가 중요합니다.",
        ],
      },
      {
        title: "모델링해야 할 핵심 엔터티",
        items: [
          "고객, 플랜, 구독, 청구서, 결제, 환불, 정산.",
          "중복, 지연, 부분 이벤트를 처리하는 웹훅 정합성 흐름.",
          "결제 타임라인, 청구 상태, 수동 복구 동작을 보여주는 관리자 화면.",
        ],
      },
      {
        title: "초보자 기준 진행 순서",
        steps: [
          "먼저 고객, 플랜, 구독, 청구서, 결제, 환불, 정산 엔터티를 정의합니다. 이 구조가 흐리면 화면도 계속 흔들립니다.",
          "가입, 첫 결제, 정기 갱신, 재결제 실패, 유예기간, 해지, 환불, 만료까지 생명주기를 먼저 적고 나서 화면을 만듭니다.",
          "웹훅 처리부는 멱등적으로 만들고 외부 이벤트 ID를 저장해서 재전송이 와도 구독 상태가 깨지지 않게 합니다.",
          "관리자 화면은 원시 로그가 아니라 비즈니스 언어로 무엇이 일어났는지 보여주는 타임라인이 되어야 합니다.",
          "정기적으로 청구서 합계, 결제 성공, 환불, 실제 정산 데이터를 대조합니다. 구독 시스템은 누가 장부를 맞추지 않으면 조용히 어긋납니다.",
        ],
      },
      {
        title: "실제로 했던 일과 연결되는 이유",
        paragraphs: [
          "상거래 운영 프로젝트에서는 주문 생성, 재고 차감, 웹훅 검증, 결제 상태 전이, SMS 작업 큐, 관리자 대시보드, CSV 정산 대사까지 하나의 운영 모델로 묶어야 했습니다.",
          "그래서 구독이나 정산 시스템도 화면보다 먼저 상태 머신으로 봐야 한다는 관점이 생겼습니다.",
        ],
      },
    ],
  },
  {
    slug: "real-world-debugging-playbook",
    categoryEn: "Real-world Debugging",
    categoryKo: "실전 디버깅",
    titleEn: "Real-world Debugging: 401, CORS, OAuth, Uploads, and Concurrency",
    titleKo: "401/403/500, CORS, OAuth, 업로드, 동시성 문제 디버깅",
    summaryEn:
      "Most production bugs stop being mysterious once you trace request boundaries, state transitions, and timing.",
    summaryKo:
      "실서비스 버그는 요청 경계, 상태 전이, 타이밍을 따라가면 대부분 미스터리에서 벗어납니다.",
    published,
    sectionsEn: [
      {
        variant: "callout",
        title: "Classify the failure before changing code",
        paragraphs: [
          "401 and 403 often point to auth context or permission drift, 500 usually points to unhandled invariants, and CORS errors often mask a deeper backend failure.",
          "Presigned URL bugs, OAuth re-auth flows, and Redis or DB races all need timing-aware inspection rather than guesswork.",
        ],
      },
      {
        title: "A practical debugging routine",
        items: [
          "Log the exact request path, user identity, correlation ID, and upstream dependency involved.",
          "Reconstruct the timeline between browser, backend, third-party callback, and storage layer.",
          "Write a minimal replay case before attempting the permanent fix.",
        ],
      },
      {
        title: "Step by step for beginners",
        steps: [
          "Name the failure first: auth, permission, validation, upstream dependency, storage, concurrency, or browser-only issue. Debugging gets faster once the class of problem is clear.",
          "Capture the exact request, response, headers, user identity, and timestamps before reproducing. Missing evidence is why many fixes turn into guesswork.",
          "Trace the full path across browser, backend, third-party service, queue, and database so you can see where reality diverged from expectation.",
          "Create the smallest replayable case and confirm that it fails for the same reason every time before changing architecture or adding retries.",
          "After the fix, add one guardrail such as a log, alert, test, or timeout rule so the same failure is easier to catch next time.",
        ],
      },
      {
        title: "Actual cases from delivery",
        paragraphs: [
          "I have dealt with CloudFront-origin auth issues that looked like access failures until request policy and header propagation were inspected properly.",
          "I have also debugged queue consistency and recovery in Redis-backed waiting systems, plus terminal ACK and fallback failures in kiosk payment integrations where timing mattered more than code volume.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "코드 수정 전에 실패 유형부터 분류합니다",
        paragraphs: [
          "401과 403은 인증 문맥이나 권한 드리프트 문제일 때가 많고, 500은 처리되지 않은 불변식 위반인 경우가 많습니다. CORS 오류는 실제로는 백엔드 실패를 가리는 표면일 수도 있습니다.",
          "presigned URL, OAuth 재인증, Redis나 DB 경합 문제는 추측보다 타이밍 중심 분석이 더 중요합니다.",
        ],
      },
      {
        title: "실전 디버깅 루틴",
        items: [
          "정확한 요청 경로, 사용자 정체성, correlation ID, 관련 외부 의존성을 먼저 기록합니다.",
          "브라우저, 백엔드, 외부 콜백, 스토리지 계층 사이의 타임라인을 복원합니다.",
          "영구 수정 전에 최소 재현 케이스를 먼저 만듭니다.",
        ],
      },
      {
        title: "초보자 기준 진행 순서",
        steps: [
          "먼저 문제 이름을 붙입니다. 인증, 권한, 검증, 외부 의존성, 저장소, 동시성, 브라우저 전용 문제 중 어디에 속하는지 분류하면 디버깅이 빨라집니다.",
          "재현 전에 정확한 요청, 응답, 헤더, 사용자 정보, 시간 정보를 수집합니다. 증거가 없으면 수정이 추측이 됩니다.",
          "브라우저, 백엔드, 외부 서비스, 큐, DB까지 전체 경로를 따라가며 기대와 실제가 갈라진 지점을 찾습니다.",
          "아키텍처를 바꾸거나 재시도를 넣기 전에, 같은 이유로 반복 실패하는 최소 재현 케이스를 먼저 만듭니다.",
          "수정 후에는 로그, 알림, 테스트, 타임아웃 규칙 중 하나라도 추가해서 다음에 같은 문제가 더 빨리 보이게 만듭니다.",
        ],
      },
      {
        title: "실제로 디버깅했던 사례",
        paragraphs: [
          "CloudFront 인증 문제처럼 처음에는 접근 제어 실패처럼 보였지만, 실제로는 request policy와 헤더 전달 경로를 봐야 풀리는 경우를 직접 겪었습니다.",
          "또 Redis 기반 대기열 시스템의 정합성·복구 문제와 키오스크 결제 연동의 ACK/fallback 타이밍 문제처럼, 코드 양보다 순서와 타이밍이 더 중요한 장애도 실제로 다뤘습니다.",
        ],
      },
    ],
  },
  {
    slug: "site-performance",
    categoryEn: "Deploy & Infra",
    categoryKo: "배포와 인프라",
    titleEn: "Shipping Fast: Practical Web Performance Checks",
    titleKo: "빠르게 여는 사이트: 실전 성능 점검 포인트",
    summaryEn:
      "A short checklist of measurable improvements that keep page load stable on real devices.",
    summaryKo:
      "실제 사용자 환경에서 로딩 안정성을 높이는 체크리스트를 정리했습니다.",
    published: "2026-01-17",
    sectionsEn: [
      {
        paragraphs: [
          "Performance is easiest to keep stable when you set a few simple guardrails early.",
          "Start with image budgets, code-splitting on heavy widgets, and avoiding layout shifts on hero sections.",
        ],
      },
      {
        title: "Fast wins",
        items: [
          "Measure on real devices and throttled networks before trusting lab-only numbers.",
          "Preload only critical assets and defer non-critical scripts aggressively.",
          "Treat every third-party tag as part of the performance budget.",
        ],
      },
    ],
    sectionsKo: [
      {
        paragraphs: [
          "성능은 초기에 몇 가지 기준을 잡아두면 안정적으로 유지됩니다.",
          "이미지 용량 제한, 무거운 위젯의 코드 분할, 히어로 섹션의 레이아웃 시프트 방지가 핵심입니다.",
        ],
      },
      {
        title: "빠른 개선 포인트",
        items: [
          "실제 기기와 느린 네트워크 기준으로 먼저 측정합니다.",
          "정말 필요한 자산만 preload하고 비핵심 스크립트는 지연 로드합니다.",
          "외부 태그도 성능 예산의 일부로 취급합니다.",
        ],
      },
    ],
  },
  {
    slug: "ux-accessibility",
    categoryEn: "Product Delivery",
    categoryKo: "제품 설계와 전달",
    titleEn: "UX & Accessibility: Small Fixes, Big Gains",
    titleKo: "UX와 접근성: 작은 개선으로 큰 효과",
    summaryEn:
      "Simple accessibility fixes improve usability, trust, and conversion at the same time.",
    summaryKo:
      "접근성 기본기를 잡는 것만으로 사용성, 신뢰도, 전환율이 함께 좋아질 수 있습니다.",
    published: "2026-01-17",
    sectionsEn: [
      {
        paragraphs: [
          "Accessibility improvements usually align with better UX for everyone.",
          "Use clear heading hierarchy, sufficient color contrast, and visible focus states on buttons and links.",
        ],
      },
      {
        title: "Where small fixes compound",
        items: [
          "Descriptive labels and error text on forms reduce abandonment.",
          "Keyboard navigation and sensible tab order prevent blocked flows.",
          "Consistent interaction states help users recover from confusion quickly.",
        ],
      },
    ],
    sectionsKo: [
      {
        paragraphs: [
          "접근성 개선은 대부분 사용자 경험 개선과 함께 움직입니다.",
          "명확한 제목 구조, 충분한 색 대비, 버튼과 링크의 포커스 표시가 기본입니다.",
        ],
      },
      {
        title: "작은 수정이 크게 누적되는 지점",
        items: [
          "폼의 라벨과 오류 메시지를 명확히 하면 이탈이 줄어듭니다.",
          "키보드 탐색과 자연스러운 탭 순서는 핵심 흐름의 막힘을 줄입니다.",
          "일관된 상호작용 상태는 사용자가 빨리 회복하도록 도와줍니다.",
        ],
      },
    ],
  },
  {
    slug: "adsense-readiness",
    categoryEn: "Growth & Monetization",
    categoryKo: "성장과 수익화",
    titleEn: "AdSense Readiness: Content and Compliance",
    titleKo: "애드센스 승인 준비: 콘텐츠와 정책",
    summaryEn:
      "Developer, AI, and SaaS practical content is a realistic AdSense strategy when it is original and people-first.",
    summaryKo:
      "개발자, AI, SaaS 실무 콘텐츠는 원본성과 사람 우선 원칙이 있을 때 현실적인 애드센스 전략이 됩니다.",
    published: "2026-01-17",
    sectionsEn: [
      {
        variant: "callout",
        title: "Best-fit niche",
        paragraphs: [
          "Developer, AI, and SaaS practical content is the most realistic path when you already have delivery experience and original case material.",
          "Higher-value topics help, but durable results come from trustworthy operational writing, not keyword stuffing.",
        ],
      },
      {
        title: "What to publish",
        items: [
          "Deployment retrospectives, architecture decisions, and cost optimization notes.",
          "Client-site SEO, analytics, and conversion improvements tied to real work.",
          "Workflow automation and selective AI integrations with clear before and after outcomes.",
        ],
      },
      {
        title: "Approval basics still matter",
        items: [
          "Keep policy pages, crawlability, and clear navigation in place.",
          "Avoid aggressive ad density that damages the reading experience.",
          "Write for real operators and builders first, search traffic second.",
        ],
      },
    ],
    sectionsKo: [
      {
        variant: "callout",
        title: "추천 방향",
        paragraphs: [
          "개발자, AI, SaaS 실무 콘텐츠는 이미 가진 배포 경험과 결과물이 있을 때 가장 현실적인 전략이 됩니다.",
          "광고 단가가 높은 주제는 도움이 되지만, 결국 오래가는 결과는 키워드 나열이 아니라 신뢰 가능한 실무형 글에서 나옵니다.",
        ],
      },
      {
        title: "어떤 글을 쓰면 좋은가",
        items: [
          "배포 회고, 아키텍처 선택 이유, 비용 최적화 기록.",
          "실제 사이트에서 SEO, 분석, 문의 전환을 어떻게 개선했는지.",
          "업무 자동화와 필요한 범위의 AI 연동이 어떤 변화를 만들었는지.",
        ],
      },
      {
        title: "승인 기본 조건도 여전히 중요합니다",
        items: [
          "정책 페이지, 크롤링 가능 상태, 명확한 내비게이션을 유지합니다.",
          "읽는 경험을 해치는 과도한 광고 밀도를 피합니다.",
          "검색 노출보다 먼저 실제 운영자와 사용자에게 도움이 되는 글을 씁니다.",
        ],
      },
    ],
  },
  {
    slug: "api-reliability",
    categoryEn: "Real-world Debugging",
    categoryKo: "실전 디버깅",
    titleEn: "API Reliability: Guardrails That Prevent Incidents",
    titleKo: "API 안정성: 장애를 줄이는 가드레일",
    summaryEn:
      "Timeouts, retries, idempotency, and observability matter more than optimistic happy-path design.",
    summaryKo:
      "낙관적인 정상 흐름보다 타임아웃, 재시도, 멱등성, 관측성이 훨씬 더 중요합니다.",
    published: "2026-01-17",
    sectionsEn: [
      {
        paragraphs: [
          "Reliable APIs come from small guardrails that prevent cascading failures.",
          "Start with timeouts, retries with backoff, and idempotency keys on write operations.",
        ],
      },
      {
        title: "Guardrails worth standardizing",
        items: [
          "Circuit breakers and explicit dependency time budgets.",
          "Clear error semantics and structured logs with correlation IDs.",
          "SLOs that teams can monitor rather than vague uptime hopes.",
        ],
      },
    ],
    sectionsKo: [
      {
        paragraphs: [
          "안정적인 API는 작은 가드레일에서 시작합니다.",
          "타임아웃, 지수 백오프 재시도, 쓰기 요청의 멱등성 키를 먼저 적용하세요.",
        ],
      },
      {
        title: "표준화할 가드레일",
        items: [
          "서킷 브레이커와 외부 의존성 시간 예산.",
          "명확한 에러 의미와 correlation ID가 포함된 구조적 로그.",
          "막연한 기대 대신 실제로 모니터링 가능한 SLO.",
        ],
      },
    ],
  },
  {
    slug: "design-systems",
    categoryEn: "Product Delivery",
    categoryKo: "제품 설계와 전달",
    titleEn: "Design Systems That Scale With Teams",
    titleKo: "팀과 함께 커지는 디자인 시스템",
    summaryEn:
      "A design system should reduce friction and accelerate delivery, not create ceremony.",
    summaryKo:
      "디자인 시스템은 절차를 늘리는 도구가 아니라 전달 속도를 높이는 기반이어야 합니다.",
    published: "2026-01-17",
    sectionsEn: [
      {
        paragraphs: [
          "A design system should remove friction, not add it.",
          "Define tokens first: colors, spacing, typography, and elevation.",
        ],
      },
      {
        title: "What makes adoption easier",
        items: [
          "Ship the smallest reusable set that covers most UI patterns.",
          "Document real examples instead of abstract component rules only.",
          "Align designers and engineers on change management and ownership.",
        ],
      },
    ],
    sectionsKo: [
      {
        paragraphs: [
          "디자인 시스템은 속도를 늦추지 않고 마찰을 줄여야 합니다.",
          "컬러, 간격, 타이포, 그림자 등 토큰부터 정의하세요.",
        ],
      },
      {
        title: "도입이 쉬워지는 조건",
        items: [
          "대부분의 UI 패턴을 덮는 최소 재사용 세트를 먼저 제공합니다.",
          "추상 규칙만이 아니라 실제 예시 중심으로 문서화합니다.",
          "디자이너와 엔지니어가 변경 관리와 소유권을 함께 맞춥니다.",
        ],
      },
    ],
  },
  {
    slug: "cloud-costs",
    categoryEn: "Deploy & Infra",
    categoryKo: "배포와 인프라",
    titleEn: "Cloud Costs: Reduce Waste Without Breaking Systems",
    titleKo: "클라우드 비용 최적화: 낭비 줄이기",
    summaryEn:
      "Tagging, rightsizing, caching, and storage lifecycle rules create the fastest cost wins.",
    summaryKo:
      "태깅, 리사이징, 캐시, 스토리지 라이프사이클 규칙이 가장 빠른 비용 절감 포인트를 만듭니다.",
    published: "2026-01-17",
    sectionsEn: [
      {
        paragraphs: [
          "Start by tagging resources so cost reports have clear ownership.",
          "Right-size compute, turn off idle environments, and add CDN caching rules.",
        ],
      },
      {
        title: "Cost discipline patterns",
        items: [
          "Move cold data to cheaper storage tiers and delete unused snapshots.",
          "Track unit costs per request, tenant, or workflow where possible.",
          "Review new infrastructure with both performance and cost envelopes in mind.",
        ],
      },
    ],
    sectionsKo: [
      {
        paragraphs: [
          "태그를 정리해 비용 리포트의 소유권을 명확히 합니다.",
          "컴퓨트 리사이징, 유휴 환경 종료, CDN 캐시 규칙 추가가 빠른 효과를 냅니다.",
        ],
      },
      {
        title: "비용 관리 패턴",
        items: [
          "콜드 데이터는 더 저렴한 스토리지로 옮기고 불필요한 스냅샷을 삭제합니다.",
          "가능하면 요청, 테넌트, 워크플로 단위 비용을 추적합니다.",
          "새 인프라는 성능뿐 아니라 비용 한계도 함께 검토합니다.",
        ],
      },
    ],
  },
  {
    slug: "testing-strategy",
    categoryEn: "Product Delivery",
    categoryKo: "제품 설계와 전달",
    titleEn: "Testing Strategy: Coverage That Matters",
    titleKo: "테스트 전략: 의미 있는 커버리지",
    summaryEn:
      "High-value tests focus on critical flows, contracts, and regressions that actually hurt users.",
    summaryKo:
      "가치 있는 테스트는 사용자 핵심 흐름, 계약 경계, 실제로 아픈 회귀를 중심으로 잡아야 합니다.",
    published: "2026-01-17",
    sectionsEn: [
      {
        paragraphs: [
          "High-value tests focus on user-critical flows and integration points.",
          "Keep unit tests fast, but invest more in integration and smoke tests.",
        ],
      },
      {
        title: "What stabilizes CI",
        items: [
          "Contract tests around APIs and external boundaries.",
          "Deterministic fixtures and explicit teardown rules.",
          "A small set of trusted smoke tests after deploy.",
        ],
      },
    ],
    sectionsKo: [
      {
        paragraphs: [
          "사용자 핵심 플로우와 통합 지점을 중심으로 테스트를 설계합니다.",
          "유닛 테스트는 빠르게, 통합 테스트와 스모크 테스트에 더 투자하세요.",
        ],
      },
      {
        title: "CI를 안정시키는 요소",
        items: [
          "API와 외부 경계를 둘러싼 컨트랙트 테스트.",
          "결정적인 테스트 데이터와 명시적인 정리 절차.",
          "배포 후 믿고 보는 소수의 스모크 테스트.",
        ],
      },
    ],
  },
  {
    slug: "security-basics",
    categoryEn: "Real-world Debugging",
    categoryKo: "실전 디버깅",
    titleEn: "Security Basics for Product Teams",
    titleKo: "제품팀을 위한 보안 기초",
    summaryEn:
      "Secrets, headers, dependency hygiene, and least privilege are usually the first practical wins.",
    summaryKo:
      "시크릿 관리, 보안 헤더, 의존성 위생, 최소 권한 원칙이 가장 먼저 챙겨야 할 실전 보안 기본기입니다.",
    published: "2026-01-17",
    sectionsEn: [
      {
        paragraphs: [
          "Start with secrets management and avoid committing keys to repositories.",
          "Add security headers, enforce HTTPS, and limit third-party scripts.",
        ],
      },
      {
        title: "Good baseline habits",
        items: [
          "Keep dependencies updated and triage known vulnerabilities regularly.",
          "Use least-privilege access for humans, apps, and infrastructure roles.",
          "Review which data really needs to be stored before building new features.",
        ],
      },
    ],
    sectionsKo: [
      {
        paragraphs: [
          "시크릿 관리부터 시작해 키가 저장소에 남지 않도록 합니다.",
          "보안 헤더 적용, HTTPS 강제, 외부 스크립트 최소화를 권장합니다.",
        ],
      },
      {
        title: "좋은 기본 습관",
        items: [
          "의존성을 최신으로 유지하고 알려진 취약점을 주기적으로 점검합니다.",
          "사람, 앱, 인프라 역할 모두 최소 권한 원칙을 적용합니다.",
          "새 기능을 만들기 전에 정말 저장해야 하는 데이터인지부터 검토합니다.",
        ],
      },
    ],
  },
];

export function getInsightBySlug(slug: string) {
  return insights.find(article => article.slug === slug);
}

export function getRelatedInsights(currentSlug: string, limit = 4) {
  const current = getInsightBySlug(currentSlug);
  const pool = insights.filter(article => article.slug !== currentSlug);

  if (!current) return pool.slice(0, limit);

  const sameCategory = pool.filter(article => article.categoryEn === current.categoryEn);
  const otherCategories = pool.filter(article => article.categoryEn !== current.categoryEn);
  return [...sameCategory, ...otherCategories].slice(0, limit);
}
