// File: components/ChatbotWidget.tsx
"use client";

import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  TextField,
  Button,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import { MessageCircle, Send, X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";

type BotMessage = {
  role: "bot" | "user";
  text: string;
};

type BotEntry = {
  keywords: string[];
  answer: string;
};

export default function ChatbotWidget() {
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;

  const botData = (t.chatbotData as BotEntry[]) || [];
  const suggestions = (t.chatbotSuggestions as string[]) || [];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<BotMessage[]>([]);

  const greeting = t.chatbotGreeting as string;
  const fallback = t.chatbotFallback as string;

  const normalized = (value: string) => value.trim().toLowerCase();

  const matchAnswer = (question: string) => {
    const q = normalized(question);
    if (!q) return fallback;
    const hit = botData.find(entry =>
      entry.keywords.some(k => q.includes(normalized(k)))
    );
    return hit?.answer || fallback;
  };

  const ensureGreeting = () => {
    setMessages(prev => (prev.length === 0 ? [{ role: "bot", text: greeting }] : prev));
  };

  const handleToggle = () => {
    setOpen(prev => {
      const next = !prev;
      if (next) ensureGreeting();
      return next;
    });
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { role: "user", text: trimmed }]);
    const response = matchAnswer(trimmed);
    setMessages(prev => [...prev, { role: "bot", text: response }]);
    setInput("");
  };

  const suggestionsToShow = suggestions.slice(0, 4);

  return (
    <>
      <IconButton
        onClick={handleToggle}
        aria-label="chatbot"
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 24 },
          bottom: { xs: 16, sm: 24 },
          zIndex: 1200,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
          color: "#fff",
          boxShadow: "var(--shadow-strong)",
          "&:hover": {
            background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
          },
        }}
      >
        <MessageCircle size={24} />
      </IconButton>

      {open && (
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            right: { xs: 16, sm: 24 },
            bottom: { xs: 84, sm: 96 },
            width: { xs: "calc(100% - 32px)", sm: 360 },
            maxHeight: { xs: "65vh", sm: 520 },
            display: "flex",
            flexDirection: "column",
            zIndex: 1200,
            backgroundColor: "var(--surface-strong)",
            border: "1px solid var(--card-border)",
            boxShadow: "var(--shadow-strong)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={1.5}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {t.chatbotTitle}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t.chatbotSubtitle}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <X size={18} />
            </IconButton>
          </Stack>
          <Divider />

          <Box sx={{ p: 2, overflowY: "auto", flex: 1 }}>
            <Stack spacing={1.5}>
              {messages.map((msg, idx) => (
                <Box
                  key={`${msg.role}-${idx}`}
                  sx={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor:
                      msg.role === "user"
                        ? "rgba(30,58,138,0.18)"
                        : "rgba(148,163,184,0.15)",
                    color: "text.primary",
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Box>
              ))}
            </Stack>

            {suggestionsToShow.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={1} mt={2}>
                {suggestionsToShow.map(s => (
                  <Chip
                    key={s}
                    label={s}
                    size="small"
                    onClick={() => sendMessage(s)}
                    sx={{
                      backgroundColor: "rgba(30,58,138,0.12)",
                      color: "text.primary",
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          <Divider />
          <Box sx={{ p: 1.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                fullWidth
                value={input}
                placeholder={t.chatbotPlaceholder}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={() => sendMessage(input)}
                sx={{
                  minWidth: 44,
                  height: 40,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
                  },
                }}
              >
                <Send size={16} />
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}
    </>
  );
}
