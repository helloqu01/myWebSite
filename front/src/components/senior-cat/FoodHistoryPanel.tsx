"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import RestaurantRounded from "@mui/icons-material/RestaurantRounded";
import type { CatProfile, FoodCategory, FoodItem } from "@/types/cat-care";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";

interface FoodHistoryPanelProps {
  cat: CatProfile;
  items: FoodItem[];
  openRequestKey: number;
  onSave: (item: FoodItem) => void;
  onDelete: (item: FoodItem) => void;
}

interface FoodDraft {
  category: FoodCategory;
  brand: string;
  productName: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const foodCategoryLabels: Record<FoodCategory, string> = {
  dry: "건사료",
  wet: "습식사료",
  prescription: "처방식",
  treat: "간식",
  other: "기타",
};

function toDraft(item: FoodItem | null): FoodDraft {
  return item
    ? {
        category: item.category,
        brand: item.brand,
        productName: item.productName,
        startDate: item.startDate,
        endDate: item.endDate,
        notes: item.notes,
      }
    : {
        category: "dry",
        brand: "",
        productName: "",
        startDate: toLocalDateKey(new Date()),
        endDate: "",
        notes: "",
      };
}

function isActive(item: FoodItem, today: string): boolean {
  return item.startDate <= today && (!item.endDate || item.endDate >= today);
}

export default function FoodHistoryPanel({ cat, items, openRequestKey, onSave, onDelete }: FoodHistoryPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [draft, setDraft] = useState<FoodDraft>(() => toDraft(null));
  const [error, setError] = useState("");
  const today = toLocalDateKey(new Date());
  const orderedItems = useMemo(
    () => [...items].sort((a, b) => Number(isActive(b, today)) - Number(isActive(a, today)) || b.startDate.localeCompare(a.startDate)),
    [items, today],
  );

  const openNew = () => {
    setEditing(null);
    setDraft(toDraft(null));
    setError("");
    setDialogOpen(true);
  };

  useEffect(() => {
    if (openRequestKey > 0) openNew();
  }, [openRequestKey]);

  const openEdit = (item: FoodItem) => {
    setEditing(item);
    setDraft(toDraft(item));
    setError("");
    setDialogOpen(true);
  };

  const update = <K extends keyof FoodDraft>(key: K, value: FoodDraft[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  const save = () => {
    if (!draft.brand.trim()) {
      setError("브랜드를 입력해 주세요.");
      return;
    }
    if (!draft.startDate) {
      setError("급여 시작일을 입력해 주세요.");
      return;
    }
    if (draft.endDate && draft.endDate < draft.startDate) {
      setError("급여 종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }

    const now = new Date().toISOString();
    onSave({
      id: editing?.id ?? createId("food"),
      catId: cat.id,
      category: draft.category,
      brand: draft.brand.trim(),
      productName: draft.productName.trim(),
      startDate: draft.startDate,
      endDate: draft.endDate,
      notes: draft.notes.trim(),
      createdAt: editing?.createdAt ?? now,
      updatedAt: now,
    });
    setDialogOpen(false);
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <RestaurantRounded color="primary" />
            <Typography variant="h6" fontWeight={800}>사료·간식 이력</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">브랜드와 제품, 실제로 먹인 기간을 고양이별로 기록합니다.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<AddRounded />} onClick={openNew} data-testid="add-food-item">사료·간식 추가</Button>
      </Stack>

      {orderedItems.length ? (
        <Stack spacing={1}>
          {orderedItems.map(item => {
            const active = isActive(item, today);
            return (
              <Box key={item.id} sx={{ p: 1.5, border: "1px solid", borderColor: active ? "primary.light" : "divider", bgcolor: active ? "rgba(139,92,246,0.05)" : "var(--surface)", borderRadius: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography fontWeight={800}>{item.brand}{item.productName ? ` · ${item.productName}` : ""}</Typography>
                      <Chip size="small" label={foodCategoryLabels[item.category]} />
                      {active && <Chip size="small" color="primary" variant="outlined" label="현재 급여 중" />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {item.startDate} ~ {item.endDate || "현재"}
                    </Typography>
                    {item.notes && <Typography variant="body2" sx={{ mt: 0.5 }}>{item.notes}</Typography>}
                  </Box>
                  <Stack direction="row">
                    <Tooltip title="수정"><IconButton size="small" onClick={() => openEdit(item)}><EditRounded fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="삭제"><IconButton size="small" color="error" onClick={() => onDelete(item)}><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
          <RestaurantRounded />
          <Typography variant="body2">등록된 사료·간식 이력이 없습니다.</Typography>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "사료·간식 정보 수정" : `${cat.name} 사료·간식 추가`}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {error && <Typography color="error.main" variant="body2">{error}</Typography>}
            <FormControl fullWidth>
              <InputLabel>종류</InputLabel>
              <Select label="종류" value={draft.category} onChange={event => update("category", event.target.value as FoodCategory)}>
                {Object.entries(foodCategoryLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
              </Select>
            </FormControl>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="브랜드" value={draft.brand} onChange={event => update("brand", event.target.value)} placeholder="예: 로얄캐닌" autoFocus required fullWidth inputProps={{ "data-testid": "food-brand" }} />
              <TextField label="제품명" value={draft.productName} onChange={event => update("productName", event.target.value)} placeholder="예: 인도어 7+" fullWidth />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="급여 시작일" type="date" value={draft.startDate} onChange={event => update("startDate", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required fullWidth />
              <TextField label="급여 종료일" type="date" value={draft.endDate} onChange={event => update("endDate", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText="계속 먹이는 중이면 비워 두세요." fullWidth />
            </Stack>
            <TextField label="메모" value={draft.notes} onChange={event => update("notes", event.target.value)} placeholder="기호성, 알레르기 반응, 하루 급여량 등" minRows={3} multiline fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={save} data-testid="save-food-item">저장</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
