// File: components/ContactSection.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  IconButton,
  TextField,
  Button,
  Alert,
  useTheme,
} from '@mui/material';
import { Mail, Linkedin, Github } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import en from '@/locales/en/common.json';
import ko from '@/locales/ko/common.json';
import { useLocale } from '@/context/LocaleContext';
import ThreeScene from './ThreeScene';
import BusinessCardThumbnail from '@/components/BusinessCardThumbnail';

export default function ContactSection() {
  const theme = useTheme();
  const { lang } = useLocale();
  const t = lang === 'en' ? en : ko;

  // vCard 데이터
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
  ].join('\r\n');
  const vCardDataUri = `data:text/vcard;charset=utf-8,${encodeURIComponent(vCard)}`;

  // 폼 상태
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setName(''); setEmail(''); setMessage('');
    } catch {
      setStatus('error');
    }
  };

  // 3D tilt 값
  const bcX = useMotionValue(0), bcY = useMotionValue(0);
  const bcRotX = useTransform(bcY, [-80, 80], [15, -15]);
  const bcRotY = useTransform(bcX, [-80, 80], [-15, 15]);
  const bcScale = useMotionValue(1);

  const qrX = useMotionValue(0), qrY = useMotionValue(0);
  const qrRotX = useTransform(qrY, [-50, 50], [10, -10]);
  const qrRotY = useTransform(qrX, [-50, 50], [-10, 10]);
  const qrScale = useMotionValue(1);

  // TextField 스타일
  const inputSx = {
    backgroundColor: '#fff',
    borderRadius: 1,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#ccc',
      },
      '&:hover fieldset': {
        borderColor: '#888',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#888',
        borderWidth: 2,
      },
    },
    '& .MuiInputBase-input': {
      color: '#333',
    },
    '& .MuiInputLabel-root': {
      color: '#555',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.palette.primary.main,
    },
    '& .MuiOutlinedInput-input::placeholder': {
      color: '#999',
      opacity: 1,
    },
  };

  return (
    <Box
      id="contact"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #4e54c8 0%, #6e72fc 33%, #8f94fb 66%, #b388ff 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(14px)',
          background: theme.palette.mode === 'dark'
            ? 'rgba(0,0,0,0.3)'
            : 'rgba(255,255,255,0.2)',
          zIndex: 1,
        },
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      {/* 3D 배경 */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <ThreeScene />
      </Box>

      {/* 콘텐츠 */}
      <Container sx={{ position: 'relative', zIndex: 2, py: 10 }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          {/* 헤더 */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: '#fff',
              textShadow: '0 2px 4px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Mail size={28} /> {t.contactHeader}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: 500,
              color: '#f0f0f0',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {t.contactSubtitle}
          </Typography>

          {/* 3D 명함 */}
          <motion.div
            style={{ perspective: 700, rotateX: bcRotX, rotateY: bcRotY, scale: bcScale }}
            onMouseMove={e => {
              const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              bcX.set(e.clientX - r.left - r.width / 2);
              bcY.set(e.clientY - r.top - r.height / 2);
            }}
            onMouseEnter={() => bcScale.set(1.04)}
            onMouseLeave={() => { bcX.set(0); bcY.set(0); bcScale.set(1); }}
          >
            <BusinessCardThumbnail />
          </motion.div>

          {/* 문의 폼 */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              maxWidth: 600,
              px: 2,
              py: 4,
              borderRadius: 3,
              background: '#fff',
              position: 'relative',
              border: '2px solid transparent',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                margin: '-2px',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4e54c8, #8f94fb)',
                zIndex: -1,
              },
            }}
          >
            <Stack spacing={2}>
              <TextField
                label={t.contactNameLabel}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                fullWidth
                required
                sx={inputSx}
              />
              <TextField
                label={t.contactEmailLabel}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                fullWidth
                required
                sx={inputSx}
              />
              <TextField
                label={t.contactMessageLabel}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your message"
                fullWidth
                required
                multiline
                rows={4}
                sx={inputSx}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={status === 'sending'}
                sx={{
                  mt: 1,
                  background: 'linear-gradient(135deg, #6e72fc, #8f94fb)',
                  '&:hover': { background: 'linear-gradient(135deg, #8f94fb, #b388ff)' },
                }}
              >
                {status === 'sending' ? '…' : t.contactSubmit}
              </Button>

              {status === 'success' && <Alert severity="success">{t.contactSuccess}</Alert>}
              {status === 'error' && <Alert severity="error">{t.contactError}</Alert>}
            </Stack>
          </Box>

          {/* 소셜 아이콘 */}
          <Stack direction="row" spacing={2} justifyContent="center">
            {[
              { icon: <Mail size={20} />, href: 'mailto:ddaaadd01@gmail.com' },
              { icon: <Linkedin size={20} />, href: 'https://www.linkedin.com/in/hyunji-oh-13949233a/' },
              { icon: <Github size={20} />, href: 'https://github.com/helloqu01' },
            ].map((s, i) => (
              <motion.div key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 300 }}>
                <IconButton
                  component="a"
                  href={s.href}
                  target="_blank"
                  sx={{
                    border: '1px solid rgba(255,255,255,0.7)',
                    color: '#fff',
                    p: 1.5,
                    boxShadow: '0 0 6px rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(4px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.15)',
                      boxShadow: '0 0 12px rgba(255,255,255,0.8)',
                    },
                  }}
                >
                  {s.icon}
                </IconButton>
              </motion.div>
            ))}
          </Stack>

          {/* 3D QR */}
          <motion.div
            style={{
              perspective: 600,
              rotateX: qrRotX,
              rotateY: qrRotY,
              scale: qrScale,
              marginTop: theme.spacing(4),
            }}
            onMouseMove={e => {
              const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              qrX.set(e.clientX - r.left - r.width / 2);
              qrY.set(e.clientY - r.top - r.height / 2);
            }}
            onMouseEnter={() => qrScale.set(1.07)}
            onMouseLeave={() => { qrX.set(0); qrY.set(0); qrScale.set(1); }}
          >
            <Box
              sx={{
                display: 'inline-block',
                p: 2,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <QRCodeSVG value={vCard} size={128} level="H" includeMargin />
              <Typography variant="caption" display="block" mt={1} sx={{ color: '#333', textShadow: 'none' }}>
                {lang === 'en' ? 'Scan to add contact' : '스캔해서 연락처 저장'}
              </Typography>
            </Box>
          </motion.div>

          {/* vCard 다운로드 */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 300 }} style={{ marginTop: 16 }}>
            <Button
              variant="outlined"
              component="a"
              href={vCardDataUri}
              download="HyunjiOh.vcf"
              sx={{
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.7)',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 0 6px rgba(255,255,255,0.5)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255,255,255,0.15)',
                  borderColor: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 0 12px rgba(255,255,255,0.8)',
                },
              }}
            >
              {lang === 'en' ? 'Download vCard' : 'vCard 다운로드'}
            </Button>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );
}
