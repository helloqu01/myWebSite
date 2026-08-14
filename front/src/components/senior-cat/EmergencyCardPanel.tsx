"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import LocalHospitalRounded from "@mui/icons-material/LocalHospitalRounded";
import PrintRounded from "@mui/icons-material/PrintRounded";
import type { CatProfile, EmergencyInfo } from "@/types/cat-care";

interface EmergencyCardPanelProps {
  cat: CatProfile;
  info: EmergencyInfo | null;
  onSave: (info: EmergencyInfo) => void;
  onMessage: (message: string) => void;
}

function emptyInfo(catId: string): EmergencyInfo {
  return { catId, primaryVetName: "", primaryVetPhone: "", emergencyVetName: "", emergencyVetPhone: "", allergies: "", caregiverContacts: "", emergencyNotes: "", updatedAt: new Date().toISOString() };
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function cardText(cat: CatProfile, info: EmergencyInfo): string {
  return [
    `[${cat.name} 응급·병원 카드]`,
    `질환: ${cat.conditions.join(", ") || "없음/미입력"}`,
    `복용약: ${cat.medications.map(medication => `${medication.name}${medication.scheduleNote ? `(${medication.scheduleNote})` : ""}`).join(", ") || "없음/미입력"}`,
    `알레르기: ${info.allergies || "없음/미입력"}`,
    `주치의: ${info.primaryVetName || "미입력"} ${info.primaryVetPhone}`,
    `응급병원: ${info.emergencyVetName || "미입력"} ${info.emergencyVetPhone}`,
    `보호자 연락처: ${info.caregiverContacts || "미입력"}`,
    `응급 메모: ${info.emergencyNotes || "없음"}`,
  ].join("\n");
}

export default function EmergencyCardPanel({ cat, info, onSave, onMessage }: EmergencyCardPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<EmergencyInfo>(() => info ?? emptyInfo(cat.id));

  useEffect(() => {
    if (open) setDraft(info ? { ...info } : emptyInfo(cat.id));
  }, [cat.id, info, open]);

  const current = info ?? emptyInfo(cat.id);
  const update = <K extends keyof EmergencyInfo>(key: K, value: EmergencyInfo[K]) => setDraft(previous => ({ ...previous, [key]: value }));

  const copy = async () => {
    await navigator.clipboard.writeText(cardText(cat, current));
    onMessage("응급 카드를 클립보드에 복사했습니다.");
  };

  const print = () => {
    const popup = window.open("", "_blank");
    if (!popup) { onMessage("팝업 차단을 해제한 뒤 다시 시도해 주세요."); return; }
    popup.opener = null;
    popup.document.write(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${escapeHtml(cat.name)} 응급 카드</title><style>body{font-family:sans-serif;max-width:720px;margin:32px auto;padding:24px;color:#172033}h1{border-bottom:3px solid #7c3aed;padding-bottom:12px}.row{padding:10px 0;border-bottom:1px solid #ddd}.label{font-size:12px;color:#667085;display:block}button{padding:10px 16px;background:#7c3aed;color:white;border:0;border-radius:8px}@media print{button{display:none}}</style></head><body><button onclick="window.print()">인쇄 / PDF 저장</button><h1>${escapeHtml(cat.name)} 응급·병원 카드</h1><div class="row"><span class="label">질환</span>${escapeHtml(cat.conditions.join(", ") || "없음/미입력")}</div><div class="row"><span class="label">복용약</span>${escapeHtml(cat.medications.map(m => `${m.name}${m.scheduleNote ? ` · ${m.scheduleNote}` : ""}`).join(", ") || "없음/미입력")}</div><div class="row"><span class="label">알레르기</span>${escapeHtml(current.allergies || "없음/미입력")}</div><div class="row"><span class="label">주치의</span>${escapeHtml(`${current.primaryVetName} ${current.primaryVetPhone}`.trim() || "미입력")}</div><div class="row"><span class="label">응급병원</span>${escapeHtml(`${current.emergencyVetName} ${current.emergencyVetPhone}`.trim() || "미입력")}</div><div class="row"><span class="label">보호자 연락처</span>${escapeHtml(current.caregiverContacts || "미입력")}</div><div class="row"><span class="label">응급 메모</span>${escapeHtml(current.emergencyNotes || "없음")}</div><p>이 카드는 보호자가 입력한 참고 정보입니다. 응급 상황에서는 즉시 동물병원에 연락하세요.</p></body></html>`);
    popup.document.close();
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
        <Box><Stack direction="row" spacing={1} alignItems="center"><LocalHospitalRounded color="error" /><Typography variant="h6" fontWeight={800}>응급·병원 카드</Typography></Stack><Typography variant="body2" color="text.secondary">급하게 이동할 때 질환·복용약·연락처를 한 화면에서 확인합니다.</Typography></Box>
        <Stack direction="row" spacing={1}><Button startIcon={<EditRounded />} onClick={() => setOpen(true)}>정보 수정</Button><Button startIcon={<ContentCopyRounded />} onClick={copy}>복사</Button><Button variant="outlined" startIcon={<PrintRounded />} onClick={print}>카드 열기</Button></Stack>
      </Stack>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 1.5, mt: 2 }}>
        <Box sx={{ p: 1.5, bgcolor: "var(--surface)", borderRadius: 2 }}><Typography variant="caption" color="text.secondary">주치의</Typography><Typography fontWeight={800}>{current.primaryVetName || "미입력"}</Typography>{current.primaryVetPhone && <Link href={`tel:${current.primaryVetPhone}`}>{current.primaryVetPhone}</Link>}</Box>
        <Box sx={{ p: 1.5, bgcolor: "var(--surface)", borderRadius: 2 }}><Typography variant="caption" color="text.secondary">응급병원</Typography><Typography fontWeight={800}>{current.emergencyVetName || "미입력"}</Typography>{current.emergencyVetPhone && <Link href={`tel:${current.emergencyVetPhone}`}>{current.emergencyVetPhone}</Link>}</Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle>{cat.name} 응급 정보</DialogTitle><DialogContent dividers><Stack spacing={2}><Alert severity="warning">소변이 나오지 않음, 호흡 곤란, 쓰러짐·경련은 앱 기록보다 즉시 병원 연락이 우선입니다.</Alert><Stack direction={{ xs: "column", sm: "row" }} spacing={2}><TextField label="주치의 병원" value={draft.primaryVetName} onChange={event => update("primaryVetName", event.target.value)} fullWidth /><TextField label="주치의 전화" value={draft.primaryVetPhone} onChange={event => update("primaryVetPhone", event.target.value)} fullWidth /></Stack><Stack direction={{ xs: "column", sm: "row" }} spacing={2}><TextField label="24시·응급병원" value={draft.emergencyVetName} onChange={event => update("emergencyVetName", event.target.value)} fullWidth /><TextField label="응급병원 전화" value={draft.emergencyVetPhone} onChange={event => update("emergencyVetPhone", event.target.value)} fullWidth /></Stack><TextField label="약물·식품 알레르기" value={draft.allergies} onChange={event => update("allergies", event.target.value)} /><TextField label="보호자·대리 보호자 연락처" value={draft.caregiverContacts} onChange={event => update("caregiverContacts", event.target.value)} multiline minRows={2} /><TextField label="응급 시 전달할 메모" value={draft.emergencyNotes} onChange={event => update("emergencyNotes", event.target.value)} multiline minRows={2} /></Stack></DialogContent><DialogActions sx={{ px: 3, py: 2 }}><Button color="inherit" onClick={() => setOpen(false)}>취소</Button><Button variant="contained" onClick={() => { onSave({ ...draft, catId: cat.id, updatedAt: new Date().toISOString() }); setOpen(false); }}>저장</Button></DialogActions></Dialog>
    </Paper>
  );
}
