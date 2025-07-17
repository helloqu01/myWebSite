'use client';
import React, { useState } from 'react';
import {
  Container,
  Stack,
  Typography,
  IconButton,
  Box,
  TextField,
  Button,
  Alert
} from '@mui/material';
import { Mail, Linkedin, Github } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import en from '@/locales/en/common.json';
import ko from '@/locales/ko/common.json';
import { useLocale } from '@/context/LocaleContext';
import BusinessCardThumbnail from '@/components/BusinessCardThumbnail';

export default function ContactSection() {
  const { lang } = useLocale();
  const t = lang === 'en' ? en : ko;

    const vCard = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Oh;Hyunji;;;',
  'FN:Hyunji Oh',
  'TITLE:Fullstack Web Developer',
  'EMAIL;TYPE=WORK:ddaaadd01@gmail.com',
  'TEL;TYPE=CELL:+821090677472',
  'URL:https://codingbyohj.com/',
  'END:VCARD',
].join('\r\n');  // <-- CRLF 로 join

  // 폼 상태 관리
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error('Network error');
      setStatus('success');
      setName(''); setEmail(''); setMessage('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Container id="contact" sx={{ py: 10 }}>
      <Stack spacing={4} alignItems="center" textAlign="center">
        {/* 헤더 */}
        <Typography
          variant="h4"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}
        >
          <Mail size={24} /> {t.contactHeader}
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 500, color: 'text.secondary' }}>
          {t.contactSubtitle}
        </Typography>

        {/* 명함 썸네일 */}
        <Box sx={{ width: '100%', px: 2 }}>
          <BusinessCardThumbnail />
        </Box>

        {/* 문의 폼 */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: '100%', maxWidth: 600, px: 2 }}
        >
          <Stack spacing={2}>
            <TextField
              label={t.contactNameLabel}
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth required
            />
            <TextField
              label={t.contactEmailLabel}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth required
            />
            <TextField
              label={t.contactMessageLabel}
              value={message}
              onChange={e => setMessage(e.target.value)}
              fullWidth required multiline rows={4}
            />
            <Button type="submit" variant="contained" disabled={status === 'sending'}>
              {status === 'sending' ? '…' : t.contactSubmit}
            </Button>
            {status === 'success' && <Alert severity="success">{t.contactSuccess}</Alert>}
            {status === 'error'   && <Alert severity="error">{t.contactError}</Alert>}
          </Stack>
        </Box>

        {/* SNS 아이콘 */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <IconButton
            component="a"
            href="mailto:ddaaadd01@gmail.com"
            target="_blank"
            sx={{ border: '1px solid', borderRadius: 2, p: 1.5 }}
          >
            <Mail size={20} />
          </IconButton>
          <IconButton
            component="a"
            href="https://www.linkedin.com/in/hyunji-oh-13949233a/"
            target="_blank"
            sx={{ border: '1px solid', borderRadius: 2, p: 1.5 }}
          >
            <Linkedin size={20} />
          </IconButton>
          <IconButton
            component="a"
            href="https://github.com/helloqu01"
            target="_blank"
            sx={{ border: '1px solid', borderRadius: 2, p: 1.5 }}
          >
            <Github size={20} />
          </IconButton>
        </Stack>

        {/* QR 코드 */}
          {/* 연락처 저장용 QR 코드 */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <QRCodeSVG
            value={vCard}
            size={128}
            level="H"
            includeMargin
          />
          <Typography variant="caption" display="block" mt={1}>
            {lang === 'en'
              ? 'Scan to add contact'
              : '스캔해서 연락처 저장'}
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
}
