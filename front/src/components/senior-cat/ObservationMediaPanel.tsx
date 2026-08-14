"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddPhotoAlternateRounded from "@mui/icons-material/AddPhotoAlternateRounded";
import CollectionsRounded from "@mui/icons-material/CollectionsRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import type { CatProfile, ObservationMediaCategory, ObservationMediaRecord } from "@/types/cat-care";
import { createMedicalDocumentSignedUrl, uploadMedicalDocument } from "@/lib/cat-care/medical-documents";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";

interface ObservationMediaPanelProps {
  cat: CatProfile;
  records: ObservationMediaRecord[];
  onSave: (record: ObservationMediaRecord) => void;
  onDelete: (record: ObservationMediaRecord) => void;
}

const categoryLabels: Record<ObservationMediaCategory, string> = {
  mobility: "보행·점프",
  behavior: "행동 변화",
  vomit: "구토물",
  stool: "대변",
  urine: "소변",
  skin: "피부 이상",
  wound: "상처",
  other: "기타",
};

function currentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function ObservationMediaPanel({ cat, records, onSave, onDelete }: ObservationMediaPanelProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ObservationMediaCategory>("mobility");
  const [date, setDate] = useState(toLocalDateKey(new Date()));
  const [time, setTime] = useState(currentTime());
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const catRecords = useMemo(
    () => records.filter(record => record.catId === cat.id).sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)),
    [cat.id, records],
  );
  const mobilityComparison = catRecords.filter(record => record.category === "mobility" || record.category === "behavior").slice(0, 2);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const openNew = () => {
    setCategory("mobility");
    setDate(toLocalDateKey(new Date()));
    setTime(currentTime());
    setTitle("");
    setNotes("");
    setFile(null);
    setError("");
    setOpen(true);
  };

  const view = async (record: ObservationMediaRecord) => {
    const popup = window.open("", "_blank");
    if (popup) popup.opener = null;
    try {
      const signedUrl = await createMedicalDocumentSignedUrl(record.document.storagePath);
      if (popup) popup.location.href = signedUrl;
      else window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (caught) {
      popup?.close();
      window.alert(caught instanceof Error ? caught.message : "사진·영상을 열지 못했습니다.");
    }
  };

  const save = async () => {
    if (!file) {
      setError("저장할 사진이나 영상을 선택해 주세요.");
      return;
    }
    if (!date) {
      setError("촬영 날짜를 입력해 주세요.");
      return;
    }
    setUploading(true);
    setError("");
    const id = createId("observation-media");
    try {
      const document = await uploadMedicalDocument({ file, catId: cat.id, recordId: id, kind: "observation" });
      const now = new Date().toISOString();
      onSave({
        id,
        catId: cat.id,
        date,
        time,
        category,
        title: title.trim(),
        notes: notes.trim(),
        document,
        createdAt: now,
        updatedAt: now,
      });
      setOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "사진·영상을 저장하지 못했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center"><CollectionsRounded color="primary" /><Typography variant="h6" fontWeight={800}>통증·행동·증상 사진/영상</Typography></Stack>
          <Typography variant="body2" color="text.secondary">보행·점프 영상과 구토물·배변·피부·상처 사진을 날짜별로 비공개 저장합니다.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<AddPhotoAlternateRounded />} onClick={openNew}>사진·영상 추가</Button>
      </Stack>

      <Alert severity="info" sx={{ mb: 2 }}>파일은 로그인한 가족만 볼 수 있는 비공개 Storage에 저장됩니다. 사진은 10MB, 관찰 영상은 30MB 이하를 권장합니다.</Alert>

      {mobilityComparison.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight={800} sx={{ mb: 1 }}>최근 보행·행동 자료 비교</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 1 }}>
            {mobilityComparison.map(record => (
              <Box key={record.id} sx={{ p: 1.5, bgcolor: "var(--surface)", borderRadius: 2.5 }}>
                <Typography fontWeight={800}>{record.date} {record.time}</Typography>
                <Typography variant="body2">{record.title || categoryLabels[record.category]}</Typography>
                <Button size="small" startIcon={<OpenInNewRounded />} onClick={() => view(record)}>자료 보기</Button>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {catRecords.length ? (
        <Stack spacing={1}>
          {catRecords.slice(0, 12).map(record => (
            <Box key={record.id} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}>
                <Box>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
                    <Typography fontWeight={800}>{record.title || categoryLabels[record.category]}</Typography>
                    <Chip size="small" label={categoryLabels[record.category]} />
                    <Chip size="small" variant="outlined" label={record.document.mimeType.startsWith("video/") ? "영상" : "사진"} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{record.date} {record.time} · {record.document.fileName}</Typography>
                  {record.notes && <Typography variant="body2">{record.notes}</Typography>}
                </Box>
                <Stack direction="row" alignSelf={{ xs: "flex-end", sm: "flex-start" }}>
                  <Button size="small" startIcon={<OpenInNewRounded />} onClick={() => view(record)}>보기</Button>
                  <Button size="small" color="error" onClick={() => onDelete(record)}>삭제</Button>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : <Typography color="text.secondary" sx={{ py: 2 }}>저장된 관찰 사진·영상이 없습니다.</Typography>}

      <Dialog open={open} onClose={() => !uploading && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{cat.name} 관찰 사진·영상 추가</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <FormControl fullWidth>
              <InputLabel>자료 종류</InputLabel>
              <Select label="자료 종류" value={category} onChange={event => setCategory(event.target.value as ObservationMediaCategory)}>
                {Object.entries(categoryLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
              </Select>
            </FormControl>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="촬영 날짜" type="date" value={date} onChange={event => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <TextField label="촬영 시각" type="time" value={time} onChange={event => setTime(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            </Stack>
            <TextField label="제목" value={title} onChange={event => setTitle(event.target.value)} placeholder="예: 소파에서 내려올 때 오른쪽 다리" />
            <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateRounded />}>
              {file ? file.name : "사진·영상 선택"}
              <input hidden type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" onChange={event => setFile(event.target.files?.[0] ?? null)} />
            </Button>
            {previewUrl && (file?.type.startsWith("video/")
              ? <Box component="video" src={previewUrl} controls sx={{ width: "100%", maxHeight: 320, borderRadius: 2 }} />
              : <Box component="img" src={previewUrl} alt="선택한 관찰 자료 미리보기" sx={{ width: "100%", maxHeight: 320, objectFit: "contain", borderRadius: 2 }} />)}
            <TextField label="관찰 메모" value={notes} onChange={event => setNotes(event.target.value)} multiline minRows={3} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button color="inherit" disabled={uploading} onClick={() => setOpen(false)}>취소</Button><Button variant="contained" disabled={uploading} onClick={save}>{uploading ? "업로드 중..." : "비공개 저장"}</Button></DialogActions>
      </Dialog>
    </Paper>
  );
}
