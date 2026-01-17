"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";

export default function PrivacyPage() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            개인정보처리방침
          </Typography>
          <Typography variant="body2" color="text.secondary">
            최종 업데이트: 2026-01-17
          </Typography>

          <Typography variant="body1">
            오현지(이하 “운영자”)는 이용자의 개인정보를 중요하게 생각하며 관련 법령을 준수합니다.
            본 방침은 https://codingbyohj.com(이하 “사이트”)에서 어떤 정보를 수집하고 어떻게
            사용하는지 설명합니다.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            1. 수집하는 정보
          </Typography>
          <Typography variant="body1">
            - 문의 폼: 이름, 이메일, 메시지 내용을 수집합니다.
          </Typography>
          <Typography variant="body1">
            - 로그/분석: Google Analytics 및 Microsoft Clarity를 통해 방문 정보(접속
            시간, 페이지 뷰, 브라우저 정보 등)를 수집할 수 있습니다.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            2. 이용 목적
          </Typography>
          <Typography variant="body1">
            - 문의 응대 및 커뮤니케이션
          </Typography>
          <Typography variant="body1">
            - 사이트 품질 개선 및 이용 패턴 분석
          </Typography>
          <Typography variant="body1">
            - 광고 서비스 제공 및 성과 측정(승인 후 Google AdSense)
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            3. 보관 및 파기
          </Typography>
          <Typography variant="body1">
            문의 처리가 완료되면 합리적인 기간 내에 삭제하거나 익명화합니다. 법령에 따른
            보관 의무가 있는 경우 해당 기간 동안 보관할 수 있습니다.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            4. 제3자 제공 및 처리위탁
          </Typography>
          <Typography variant="body1">
            사이트는 Google, Microsoft 등 외부 서비스의 분석/광고 도구를 사용할 수 있으며,
            이 과정에서 쿠키가 사용될 수 있습니다. 자세한 사항은 각 서비스의 정책을
            참고해 주세요.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            5. 쿠키
          </Typography>
          <Typography variant="body1">
            쿠키는 이용자의 환경을 기억하여 더 나은 서비스를 제공하기 위해 사용됩니다.
            브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            6. 문의
          </Typography>
          <Typography variant="body1">
            개인정보 관련 문의는 아래 이메일로 연락해 주세요.
          </Typography>
          <Typography variant="body1">
            이메일: helloqu@naver.com
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            English Summary
          </Typography>
          <Typography variant="body1">
            We collect contact form details (name, email, message) and basic analytics data to respond
            to inquiries and improve the site. We may use Google AdSense and analytics services that
            set cookies. Contact: helloqu@naver.com.
          </Typography>

          <Link component={NextLink} href="/" underline="hover" color="primary">
            홈으로 돌아가기
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
