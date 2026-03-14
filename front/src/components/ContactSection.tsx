// File: components/ContactSection.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  TextField,
  Button,
  Alert,
  useTheme,
  Chip,
  Divider,
} from '@mui/material';
import { Mail, Linkedin, Github, Send, Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import en from '@/locales/en/common.json';
import ko from '@/locales/ko/common.json';
import { useLocale } from '@/context/LocaleContext';
import BusinessCardThumbnail from '@/components/BusinessCardThumbnail';
import { trackEvent } from '@/lib/analytics';
import { siteConfig } from '@/lib/siteConfig';

export default function ContactSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { lang } = useLocale();
  const t = lang === 'en' ? en : ko;

  const vCard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Oh;Hyunji;;;',
    'FN:Hyunji Oh',
    'TITLE:Freelance Full-stack Developer',
    `EMAIL;TYPE=WORK:${siteConfig.email}`,
    `TEL;TYPE=CELL:${siteConfig.phoneE164}`,
    `URL:${siteConfig.siteUrl}`,
    'END:VCARD',
  ].join('\r\n');
  const vCardDataUri = `data:text/vcard;charset=utf-8,${encodeURIComponent(vCard)}`;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (company.trim()) { setStatus('success'); return; }
    setStatus('sending');
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, company }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setName(''); setEmail(''); setMessage(''); setCompany('');
      trackEvent('contact_submit', { status: 'success' });
    } catch {
      setStatus('error');
      trackEvent('contact_submit', { status: 'error' });
    }
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
      borderRadius: '10px',
      '& fieldset': {
        borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(109,40,217,0.12)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(139,92,246,0.35)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#a78bfa',
        borderWidth: '1.5px',
      },
    },
    '& .MuiInputBase-input': { color: theme.palette.text.primary },
    '& .MuiInputLabel-root': { color: theme.palette.text.disabled, fontSize: '0.88rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' },
  };

  const socialLinks = [
    { icon: <Mail size={17} />, href: `mailto:${siteConfig.email}`, label: 'Email' },
    { icon: <Linkedin size={17} />, href: siteConfig.linkedInUrl, label: 'LinkedIn' },
    { icon: <Github size={17} />, href: siteConfig.githubUrl, label: 'GitHub' },
  ];

  return (
    <Box
      id="contact"
      sx={{
        borderTop: '1px solid var(--card-border)',
        py: { xs: 10, md: 16 },
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        {/* Section header */}
        <Stack spacing={1.5} alignItems="flex-start" mb={{ xs: 6, md: 10 }}>
          <Chip
            label={lang === 'en' ? 'Contact' : '연락처'}
            sx={{
              borderRadius: 999,
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.22)',
              color: '#a78bfa',
              fontWeight: 700,
              letterSpacing: '0.07em',
              fontSize: '0.7rem',
            }}
          />
          <Typography
            variant="h2"
            sx={{ fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            {t.contactHeader}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
            {t.contactSubtitle}
          </Typography>
        </Stack>

        {/* Two-column layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: { xs: 6, lg: 10 },
            alignItems: 'start',
          }}
        >
          {/* ── Left col ── */}
          <Stack spacing={5}>
            {/* Business card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <BusinessCardThumbnail />
            </motion.div>

            {/* Social links */}
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: theme.palette.text.disabled,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  fontSize: '0.63rem',
                  display: 'block',
                  mb: 2,
                }}
              >
                {lang === 'en' ? 'Connect' : '소셜'}
              </Typography>
              <Stack direction="row" spacing={1.5}>
                {socialLinks.map((s, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Button
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      startIcon={s.icon}
                      size="small"
                      sx={{
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(109,40,217,0.12)'}`,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
                        color: theme.palette.text.secondary,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 2,
                        py: 0.9,
                        '&:hover': {
                          borderColor: 'rgba(139,92,246,0.4)',
                          color: '#a78bfa',
                          backgroundColor: 'rgba(139,92,246,0.07)',
                        },
                      }}
                    >
                      {s.label}
                    </Button>
                  </motion.div>
                ))}
              </Stack>
            </Box>

            <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

            {/* QR + vCard */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(109,40,217,0.12)'}`,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                  flexShrink: 0,
                }}
              >
                <QRCodeSVG
                  value={vCard}
                  size={90}
                  level="H"
                  fgColor={isDark ? '#e9d5ff' : '#4c1d95'}
                  bgColor="transparent"
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <QrCode size={14} color="#a78bfa" />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '0.85rem' }}
                  >
                    {lang === 'en' ? 'Scan to add contact' : '스캔해서 연락처 저장'}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.7, display: 'block', mb: 2 }}>
                  {lang === 'en'
                    ? 'Scan the QR code with your phone camera to instantly save contact info.'
                    : '카메라로 QR 코드를 스캔하면 연락처가 바로 저장됩니다.'}
                </Typography>
                <Button
                  href={vCardDataUri}
                  download="HyunjiOh.vcf"
                  size="small"
                  startIcon={<Download size={14} />}
                  sx={{
                    borderRadius: '8px',
                    border: `1px solid ${isDark ? 'rgba(139,92,246,0.25)' : 'rgba(109,40,217,0.2)'}`,
                    color: '#a78bfa',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    px: 2,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(139,92,246,0.08)',
                      borderColor: 'rgba(139,92,246,0.45)',
                    },
                  }}
                >
                  {lang === 'en' ? 'Download vCard' : 'vCard 다운로드'}
                </Button>
              </Box>
            </Box>
          </Stack>

          {/* ── Right col: Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: '16px',
                backgroundColor: isDark ? '#0c1122' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(139,92,246,0.15)' : 'rgba(109,40,217,0.12)'}`,
                boxShadow: isDark
                  ? '0 24px 64px rgba(0,0,0,0.6)'
                  : '0 12px 40px rgba(109,40,217,0.08)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #7c3aed, #22d3ee)',
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 0.5, fontSize: '1rem' }}
              >
                {lang === 'en' ? 'Send a message' : '메시지 보내기'}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 3 }}>
                {lang === 'en' ? 'I usually reply within 24 hours.' : '보통 24시간 내에 답변드립니다.'}
              </Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  {/* Honeypot */}
                  <TextField
                    label="Company"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    autoComplete="off"
                    sx={{ position: 'absolute', left: '-9999px', height: 0, opacity: 0 }}
                    tabIndex={-1}
                  />
                  <TextField
                    label={t.contactNameLabel}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    fullWidth
                    required
                    size="small"
                    sx={inputSx}
                  />
                  <TextField
                    label={t.contactEmailLabel}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    fullWidth
                    required
                    size="small"
                    sx={inputSx}
                  />
                  <TextField
                    label={t.contactMessageLabel}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    fullWidth
                    required
                    multiline
                    rows={5}
                    sx={inputSx}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={status === 'sending'}
                    endIcon={<Send size={15} />}
                    sx={{
                      mt: 0.5,
                      py: 1.3,
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                    }}
                  >
                    {status === 'sending' ? '…' : t.contactSubmit}
                  </Button>

                  {status === 'success' && (
                    <Alert
                      severity="success"
                      sx={{
                        borderRadius: '10px',
                        backgroundColor: 'rgba(52,211,153,0.1)',
                        border: '1px solid rgba(52,211,153,0.25)',
                        color: '#6ee7b7',
                        '& .MuiAlert-icon': { color: '#34d399' },
                      }}
                    >
                      {t.contactSuccess}
                    </Alert>
                  )}
                  {status === 'error' && (
                    <Alert
                      severity="error"
                      sx={{
                        borderRadius: '10px',
                        backgroundColor: 'rgba(248,113,113,0.1)',
                        border: '1px solid rgba(248,113,113,0.25)',
                      }}
                    >
                      {t.contactError}
                    </Alert>
                  )}
                  <Typography
                    component="span"
                    aria-live="polite"
                    sx={{ position: 'absolute', left: -9999, top: 'auto', height: 1, width: 1, overflow: 'hidden' }}
                  >
                    {status === 'sending'
                      ? lang === 'en' ? 'Sending message.' : '메시지 전송 중입니다.'
                      : status === 'success' ? t.contactSuccess
                      : status === 'error' ? t.contactError : ''}
                  </Typography>
                </Stack>
              </form>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
