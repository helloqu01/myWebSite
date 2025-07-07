"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Stack,
  useTheme,
  Chip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import {
  ChevronDown,
  Calendar,
  Wrench,
  Mail,
  Linkedin,
  Github,
  Link2,
} from "lucide-react";
import { motion } from "framer-motion";

interface LinkDetail {
  url: string;
}
type Detail = string | LinkDetail;

interface Experience {
  period: string;
  duration: string;
  company: string;
  role: string;
  details: Detail[];
  techStack?: string;
  extra?: string[];
}

interface Project {
  title: string;
  description: string;
  image: string;
  link: string;
  detailImage: string;
  detailText: string;
}


const EXPERIENCES: Experience[] = [
  {
    period: "2025.06 ~ 2025.06",
    duration: "2주",
    company: "퀸즈스마일",
    role: "용역 외주",
    details: [
      "키오스크 결제 연동 시스템 개발 및 운영 환경 구축",
      "C#/.NET 기반 tPayDaemon HTTP 플러그인 개발",
      "HttpClient 설정 최적화 및 SSL, JSON 바인딩 구현",
      "/Auth, /Cancel 엔드포인트 결제 요청 처리 안정화",
      "Chromium(CefSharp.WinForms) 임베딩 및 JS↔C# 바인딩",
      "JavascriptObjectRepository 설정 및 ChromeAPI 통신 처리",
      "EMV 카드결제 단말기 시리얼 연동 및 ACK 로직 구현",
      "자동 POS 정보 채움 기능, 디버깅 로깅 및 fallback 처리",
    ],
    techStack: "C#, .NET Framework, CefSharp, HttpClient, JSON, WinForms, SerialPort, Windows Registry",
    extra: [
      "POS 단말기 연동 후 ACK 흐름을 직접 디버깅하며 문제 해결 경험 축적",
      "JS와 C# 간 통신 동기화를 위한 메시지 구조 설계 주도",
      "운영 환경에서 발생하는 다양한 예외 상황에 대한 fallback 처리 로직 경험"
    ]
  },
  {
    period: "2022.04 ~ 2025.05",
    duration: "3년 2개월",
    company: "이노쓰리디",
    role: "플랫폼팀 주임연구원 팀원",
    details: [
      "환자·기공소·치과 간 실시간 주문·3D 파일 뷰어·로그인 유지·파트너 네트워크 플랫폼 설계 및 개발",
      "AWS EC2, RDS, 로드밸런서를 통한 무중단 고가용성 플랫폼 배포",
      "JWT 로그인 및 OTP 인증 세션 유지 기능, Nest.js Guard를 통한 RDS 보호",
      "Redis로 세션 공유 및 재시작 세션 유지, RDS 복제를 통한 백엔드 분산",
      "WebSocket + Bull Queue로 1:N 실시간 그룹 채팅, 대규모 트래픽 최적화",
      "AWS IAM + Git 환경 설정 자동화",
      "Jest 테스트 기반 버그 효율성 40% 향상",
    ],
    techStack: "AWS, Nest.js, React, Redis, WebSocket, Bull Queue, PostgreSQL, Jest",
    extra: [
      "CI/CD 자동화로 무중단 배포 실현, 트래픽 대비 시스템 안정성 확보",
      "프로덕션 환경에서 발생한 메모리 릭 및 세션 유실 이슈 직접 분석 및 해결",
      "PM과 협업하여 요건 정의부터 개발·배포·고도화까지 전 주기 경험"
    ]
  },
  {
    period: "2021.08 ~ 2022.01",
    duration: "6개월",
    company: "해피메이드",
    role: "개발팀 주임/계장",
    details: [
      "사내 거래소 서비스의 관리자 페이지 및 사용자 페이지 PHP 개발",
      "MySQL 기반 데이터 연동 및 오류 수정",
    ],
    techStack: "PHP, MySQL, HTML, CSS, JavaScript",
    extra: [
      "사용자 로그 기반 오류 분석 및 예외처리 개선으로 서비스 안정성 확보",
      "코드 리팩토링 및 SQL 쿼리 최적화를 통해 페이지 로딩 속도 향상"
    ]
  },
  {
    period: "2021.05 ~ 2021.08",
    duration: "4개월",
    company: "한커뮤니케이션",
    role: "개발팀 사원",
    details: [
      "사내 고객사 홈페이지 유지보수 및 스토리보드 작성",
      "고객사 홈페이지 풀스택 개발 (cafe24 기반)",
      { url: "https://hanleeon02.cafe24.com/main/" },
    ],
    techStack: "HTML, CSS, JavaScript",
    extra: [
      "기획자가 작성한 문서를 바탕으로 직접 스토리보드 작성 및 기획 보완",
      "HTML 구조 개선 및 레거시 JS 코드를 최신화하여 유지보수 편의성 향상"
    ]
  },
  {
    period: "2020.09 ~ 2020.11",
    duration: "3개월",
    company: "비플",
    role: "기업부설연구소 연구원",
    details: [
      "사내 홈페이지 리뉴얼 및 관리자 페이지 개발",
      "PHP, MariaDB 기반 백엔드와 JS, HTML, CSS3 기반 프론트엔드 구현",
      "공지사항, 갤러리, 영상 게시판 등 주요 기능 개발",
      "웹 퍼블리싱 직접 진행",
      { url: "http://www.businessplus.co.kr/" },
    ],
    techStack: "PHP, MariaDB, HTML, CSS, JavaScript",
    extra: [
      "고객 요청사항 기반 기능 추가 및 유지보수 반복 경험",
      "웹표준 준수 및 크로스 브라우징 대응으로 호환성 강화"
    ]
  },
  {
    period: "2017.01 ~ 2018.07",
    duration: "1년 7개월",
    company: "한일네트웍스",
    role: "경영지원팀 사원",
    details: [
      "부서비용, 예산, 마케팅 및 기획 관리",
      "총무, 회계, 문서관리, 구매관리, ERP운용 지원",
    ],
    techStack: "ERP, MS Excel, Office",
    extra: [
      "ERP 시스템을 통한 비용/계약 관리 프로세스 익숙",
      "사무행정 전반의 운영과 협업 경험 기반의 커뮤니케이션 능력 향상"
    ]
  }
];



const PROJECTS: Project[] = [
  {
    title: "MyPortfolio",
    description: "개인 포트폴리오 사이트. Next.js · MUI · Framer Motion 애니메이션 적용.",
    image: "https://picsum.photos/seed/portfolio/800/600",
    link: "#",
    detailImage: "https://picsum.photos/seed/portfolio-detail/800/400",
    detailText:
      "상세 설명: 이 포트폴리오는 Next.js의 SSG와 MUI 컴포넌트를 활용하여 반응형 디자인으로 구현되었습니다.",
  },
  {
    title: "E-Commerce Platform",
    description: "GraphQL API 백엔드 + React SPA, AWS Lambda · RDS 구성.",
    image: "https://picsum.photos/seed/ecommerce/800/600",
    link: "#",
    detailImage: "https://picsum.photos/seed/ecommerce-detail/800/400",
    detailText:
      "상세 설명: GraphQL과 Apollo Client로 효율적인 데이터 페칭 구현, AWS Lambda로 서버리스 배포를 구성했습니다.",
  },
  {
    title: "Real-time Chat App",
    description: "WebSocket · Redis · Bull Queue 기반 실시간 채팅 서버.",
    image: "https://picsum.photos/seed/chat/800/600",
    link: "#",
    detailImage: "https://picsum.photos/seed/chat-detail/800/400",
    detailText:
      "상세 설명: Socket.io와 Redis PUB/SUB 패턴을 사용해 안정적인 실시간 메시징을 제공하며, Bull Queue로 메시지 송수신 로깅을 처리합니다.",
  },
];

export default function Page() {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const cardBg = isLight ? theme.palette.background.paper : theme.palette.grey[900];

  const [expandedExp, setExpandedExp] = useState<Record<number, boolean>>({});
  const [projIndex, setProjIndex] = useState<number | null>(null);

  const toggleExp = (idx: number) =>
    setExpandedExp((prev) => ({ ...prev, [idx]: !prev[idx] }));
  const openProj = (idx: number) => setProjIndex(idx);
  const closeProj = () => setProjIndex(null);

  return (
    <Box sx={{ scrollBehavior: "smooth" }}>
      {/* Hero Section */}
      <Box
        id="hero"
        component={motion.section}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: theme.palette.primary.contrastText,
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
          Hi, I’m OhJ.
        </Typography>
        <Typography variant="h5" sx={{ opacity: 0.9, mb: 4 }}>
          Full-stack Developer · Next.js · Nest.js · AWS
        </Typography>
        <IconButton sx={{ color: "inherit" }}>
          <ChevronDown size={36} />
        </IconButton>
      </Box>

      {/* Projects Section */}
      <Container id="projects" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1 }}>
          <Wrench size={24} /> Projects
        </Typography>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }}
          gap={4}
        >
          {PROJECTS.map((proj, idx) => (
            <Card
              key={idx}
              component={motion.div}
              whileHover={{ y: -5 }}
              sx={{
                bgcolor: cardBg,
                borderRadius: 3,
                boxShadow: 4,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardMedia component="img" height="160" image={proj.image} alt={proj.title} />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {proj.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {proj.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                <Button
                  onClick={() => openProj(idx)}
                  variant={isLight ? "contained" : "outlined"}
                  color="primary"
                >
                  View
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Container>


      {/* Project Detail Dialog */}
      <Dialog open={projIndex !== null} onClose={closeProj} maxWidth="md" fullWidth>
        {projIndex !== null && (
          <>
            <DialogTitle>{PROJECTS[projIndex].title}</DialogTitle>
            <DialogContent>
              <Box
                component="img"
                src={PROJECTS[projIndex].detailImage}
                alt="detail"
                width="100%"
                mb={2}
              />
              <Typography>{PROJECTS[projIndex].detailText}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeProj}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Experience Section */}
        <Container id="experience" sx={{ py: 10 }}>
        <Typography variant="h3" sx={{ mb: 6, fontWeight: 700, textAlign: "center" }}>
          <Calendar size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />
          Experience
        </Typography>
        <Timeline position="alternate">
          {EXPERIENCES.map((exp, idx) => (
            <TimelineItem key={idx}>
              <TimelineSeparator>
                <TimelineDot color="primary" />
                {idx < EXPERIENCES.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Card
                  sx={{
                    p: 3,
                    bgcolor: cardBg,
                    borderRadius: 3,
                    boxShadow: 3,
                    mb: 4,
                    transition: "0.3s",
                    '&:hover': { boxShadow: 6 },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {exp.company}
                    </Typography>
                    <Chip label={exp.role} size="small" color="primary" />
                    {exp.details.some(d => typeof d !== "string") && (
                      <IconButton
                        component="a"
                        href={(exp.details.find(d => typeof d !== "string") as LinkDetail).url}
                        target="_blank"
                        rel="noreferrer"
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <Link2 size={16} />
                      </IconButton>
                    )}
                  </Stack>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {exp.period} · {exp.duration}
                  </Typography>

                  <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                    {exp.details.map((d, i) =>
                      typeof d === "string" ? (
                        <Typography key={i} component="li" variant="body2" sx={{ mb: 0.5 }}>
                          {d}
                        </Typography>
                      ) : null
                    )}
                  </Box>

                  {exp.techStack && (
                    <Typography variant="body2" sx={{ fontStyle: "italic", mb: 2 }}>
                      📦 Tech Stack: {exp.techStack}
                    </Typography>
                  )}

                  {exp.extra && (
                    <Collapse in={expandedExp[idx]} timeout="auto" unmountOnExit>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        상세보기:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2 }}>
                        {exp.extra.map((item, i) => (
                          <li key={i}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{item}</Typography>
                          </li>
                        ))}
                      </Box>
                    </Collapse>
                  )}

                  <CardActions sx={{ justifyContent: "flex-end", pt: 2 }}>
                    <Button size="small" onClick={() => toggleExp(idx)}>
                      {expandedExp[idx] ? "접기" : "상세보기"}
                    </Button>
                  </CardActions>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Container>

      {/* Contact Section */}
      <Container id="contact" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Mail size={24} /> Contact
        </Typography>
        <Stack direction="row" spacing={2}>
          <IconButton component="a" href="mailto:helloqu@naver.com" target="_blank">
            <Mail size={20} />
          </IconButton>
          <IconButton component="a" href="https://www.linkedin.com/in/hyunji-oh-13949233a/" target="_blank">
            <Linkedin size={20} />
          </IconButton>
          <IconButton component="a" href="https://github.com/helloqu01" target="_blank">
            <Github size={20} />
          </IconButton>
        </Stack>
      </Container>
    </Box>
  );
}