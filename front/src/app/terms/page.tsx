"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";

export default function TermsPage() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            이용약관
          </Typography>
          <Typography variant="body2" color="text.secondary">
            최종 업데이트: 2026-01-17
          </Typography>

          <Typography variant="body1">
            본 사이트는 오현지의 포트폴리오 및 업무 소개를 목적으로 운영됩니다. 아래
            약관을 확인해 주세요.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            1. 서비스 범위
          </Typography>
          <Typography variant="body1">
            사이트 내 제공되는 정보는 일반적인 참고용이며, 특정 결과를 보장하지 않습니다.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            2. 지적재산권
          </Typography>
          <Typography variant="body1">
            사이트의 콘텐츠(텍스트, 이미지, 디자인 등)는 운영자에게 저작권이 있으며, 무단
            복제·배포를 금지합니다.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            3. 외부 링크
          </Typography>
          <Typography variant="body1">
            사이트에는 외부 사이트로 연결되는 링크가 있을 수 있으며, 해당 사이트의 정책에
            대해서는 책임지지 않습니다.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            4. 책임 제한
          </Typography>
          <Typography variant="body1">
            운영자는 사이트 이용으로 인해 발생하는 직접·간접 손해에 대해 책임을 지지
            않습니다.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            5. 약관 변경
          </Typography>
          <Typography variant="body1">
            약관은 필요에 따라 변경될 수 있으며, 변경 시 본 페이지에 공지합니다.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            문의
          </Typography>
          <Typography variant="body1">
            문의 사항은 helloqu@naver.com으로 연락해 주세요.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            English Summary
          </Typography>
          <Typography variant="body1">
            This site is a personal portfolio. All content is owned by the operator and may not be
            copied without permission. External links are provided for convenience, and the operator
            is not responsible for third-party sites. Contact: helloqu@naver.com.
          </Typography>

          <Link component={NextLink} href="/" underline="hover" color="primary">
            홈으로 돌아가기
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
