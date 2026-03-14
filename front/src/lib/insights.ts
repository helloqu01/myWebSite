export type InsightSection = {
  variant?: "default" | "callout";
  title?: string;
  paragraphs?: string[];
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
