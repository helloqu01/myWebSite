"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CloudDoneRounded from "@mui/icons-material/CloudDoneRounded";
import CloudDownloadRounded from "@mui/icons-material/CloudDownloadRounded";
import CloudOffRounded from "@mui/icons-material/CloudOffRounded";
import CloudUploadRounded from "@mui/icons-material/CloudUploadRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import type { Session } from "@supabase/supabase-js";
import type { CareState, CloudMemberRole } from "@/types/cat-care";
import { getCloudClient, isCloudConfigured } from "@/lib/cat-care/cloud";
import { normalizeCareState } from "@/lib/cat-care/storage";

interface CloudSyncPanelProps {
  care: CareState;
  onRestore: (care: CareState) => void;
  onMessage: (message: string) => void;
}

interface HouseholdState {
  id: string;
  name: string;
  inviteCode: string;
  role: CloudMemberRole;
  careData: CareState | null;
  updatedAt: string;
}

const AUTO_SYNC_KEY = "ohj-cat-care-cloud-auto";
const LAST_SYNC_KEY = "ohj-cat-care-cloud-last-sync";

function parseHousehold(data: unknown): HouseholdState | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;
  const value = row as Record<string, unknown>;
  if (typeof value.id !== "string") return null;
  return {
    id: value.id,
    name: String(value.name ?? "우리 고양이 가족"),
    inviteCode: String(value.invite_code ?? ""),
    role: (value.role as CloudMemberRole) ?? "viewer",
    careData: value.care_data && typeof value.care_data === "object" ? normalizeCareState(value.care_data as Partial<CareState>) : null,
    updatedAt: String(value.updated_at ?? ""),
  };
}

export default function CloudSyncPanel({ care, onRestore, onMessage }: CloudSyncPanelProps) {
  const configured = isCloudConfigured();
  const client = getCloudClient();
  const [session, setSession] = useState<Session | null>(null);
  const [household, setHousehold] = useState<HouseholdState | null>(null);
  const [loading, setLoading] = useState(configured);
  const [working, setWorking] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [householdName, setHouseholdName] = useState("우리 고양이 가족");
  const [inviteCode, setInviteCode] = useState("");
  const [autoSync, setAutoSync] = useState(false);
  const [error, setError] = useState("");
  const initializedRef = useRef(false);
  const careRef = useRef(care);
  const householdRef = useRef(household);
  const onRestoreRef = useRef(onRestore);
  const onMessageRef = useRef(onMessage);
  const activeHouseholdId = household?.id ?? "";
  const activeHouseholdRole = household?.role ?? "viewer";
  careRef.current = care;
  householdRef.current = household;
  onRestoreRef.current = onRestore;
  onMessageRef.current = onMessage;

  const loadHousehold = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    const { data, error: loadError } = await client.rpc("get_my_cat_care_household");
    if (loadError) {
      setError(`클라우드 구조를 불러오지 못했습니다: ${loadError.message}`);
      setLoading(false);
      return;
    }
    const parsed = parseHousehold(data);
    setHousehold(parsed);
    const storedAuto = window.localStorage.getItem(AUTO_SYNC_KEY) === "true";
    setAutoSync(storedAuto);
    if (parsed?.careData && storedAuto) {
      const lastSync = window.localStorage.getItem(LAST_SYNC_KEY) ?? "";
      if (parsed.updatedAt > lastSync) {
        onRestoreRef.current(parsed.careData);
        window.localStorage.setItem(LAST_SYNC_KEY, parsed.updatedAt);
      }
    }
    initializedRef.current = true;
    setLoading(false);
  }, [client]);

  useEffect(() => {
    if (!client) { setLoading(false); return; }
    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) void loadHousehold(); else setLoading(false);
    });
    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) void loadHousehold(); else { setHousehold(null); setLoading(false); }
    });
    return () => subscription.subscription.unsubscribe();
  }, [client, loadHousehold]);

  const push = useCallback(async (showMessage = true) => {
    const target = householdRef.current;
    if (!client || !target || target.role === "viewer") return;
    setWorking(true);
    const { data, error: pushError } = await client
      .from("cat_care_households")
      .update({ care_data: careRef.current, updated_at: new Date().toISOString() })
      .eq("id", target.id)
      .select("updated_at")
      .single();
    setWorking(false);
    if (pushError) { setError(pushError.message); return; }
    const updatedAt = String(data.updated_at);
    window.localStorage.setItem(LAST_SYNC_KEY, updatedAt);
    setHousehold(previous => previous ? { ...previous, careData: careRef.current, updatedAt } : previous);
    if (showMessage) onMessageRef.current("현재 기기 기록을 클라우드에 백업했습니다.");
  }, [client]);

  useEffect(() => {
    if (!autoSync || !initializedRef.current || !activeHouseholdId || activeHouseholdRole === "viewer") return;
    const timer = window.setTimeout(() => void push(false), 1800);
    return () => window.clearTimeout(timer);
  }, [activeHouseholdId, activeHouseholdRole, autoSync, care, push]);

  const signIn = async (signup: boolean) => {
    if (!client) return;
    setWorking(true); setError("");
    const result = signup
      ? await client.auth.signUp({ email, password })
      : await client.auth.signInWithPassword({ email, password });
    setWorking(false);
    if (result.error) { setError(result.error.message); return; }
    if (signup && !result.data.session) onMessage("가입 확인 메일을 보냈습니다. 이메일 인증 후 로그인해 주세요.");
  };

  const createHousehold = async () => {
    if (!client) return;
    setWorking(true); setError("");
    const { data, error: rpcError } = await client.rpc("create_cat_care_household", { p_name: householdName.trim() || "우리 고양이 가족", p_care_data: care });
    setWorking(false);
    if (rpcError) { setError(rpcError.message); return; }
    setHousehold(parseHousehold(data));
    setAutoSync(true);
    window.localStorage.setItem(AUTO_SYNC_KEY, "true");
    onMessage("가족 클라우드 공간을 만들고 현재 기록을 백업했습니다.");
  };

  const joinHousehold = async () => {
    if (!client) return;
    setWorking(true); setError("");
    const { data, error: rpcError } = await client.rpc("join_cat_care_household", { p_invite_code: inviteCode.trim().toUpperCase() });
    setWorking(false);
    if (rpcError) { setError(rpcError.message); return; }
    const parsed = parseHousehold(data);
    setHousehold(parsed);
    if (parsed?.careData) onRestore(parsed.careData);
    onMessage("가족 공유 공간에 참여하고 최신 기록을 불러왔습니다.");
  };

  const pull = async () => {
    if (!client || !household) return;
    setWorking(true);
    const { data, error: pullError } = await client.from("cat_care_households").select("care_data,updated_at").eq("id", household.id).single();
    setWorking(false);
    if (pullError) { setError(pullError.message); return; }
    if (!window.confirm("이 기기의 건강 기록을 클라우드 최신 기록으로 교체할까요? 현재 로컬 기록은 JSON 백업 후 진행하는 것을 권장합니다.")) return;
    onRestore(normalizeCareState((data.care_data ?? {}) as Partial<CareState>));
    window.localStorage.setItem(LAST_SYNC_KEY, String(data.updated_at));
    onMessage("클라우드 최신 기록을 이 기기에 적용했습니다.");
  };

  if (!configured) {
    return <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}><Stack direction="row" spacing={1} alignItems="center"><CloudOffRounded color="disabled" /><Typography variant="h6" fontWeight={800}>클라우드 백업·가족 공유</Typography><Chip label="설정 필요" size="small" /></Stack><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>현재는 로컬 저장 모드입니다. Supabase에 제공된 보안 스키마를 적용하고 환경변수 2개를 설정하면 이메일 로그인·자동 백업·공유 코드가 활성화됩니다.</Typography></Paper>;
  }

  if (loading) return <Paper elevation={0} sx={{ p: 3, border: "1px solid var(--card-border)", borderRadius: 4 }}><Stack direction="row" spacing={1.5} alignItems="center"><CircularProgress size={22} /><Typography>클라우드 연결을 확인하는 중입니다.</Typography></Stack></Paper>;

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction="row" spacing={1} alignItems="center"><CloudDoneRounded color={session ? "success" : "disabled"} /><Typography variant="h6" fontWeight={800}>클라우드 백업·가족 공유</Typography>{session && <Chip label={session.user.email ?? "로그인됨"} size="small" variant="outlined" />}</Stack>
      {error && <Alert severity="error" onClose={() => setError("")} sx={{ mt: 1.5 }}>{error}</Alert>}
      {!session ? <Stack spacing={1.5} sx={{ mt: 2 }}><Typography variant="body2" color="text.secondary">보호자별 이메일 계정으로 로그인합니다. 가족 구성원은 각자 계정을 만든 뒤 공유 코드로 참여합니다.</Typography><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><TextField label="이메일" type="email" size="small" value={email} onChange={event => setEmail(event.target.value)} fullWidth /><TextField label="비밀번호" type="password" size="small" value={password} onChange={event => setPassword(event.target.value)} fullWidth /></Stack><Stack direction="row" spacing={1}><Button variant="contained" disabled={working || !email || password.length < 6} onClick={() => signIn(false)}>로그인</Button><Button disabled={working || !email || password.length < 6} onClick={() => signIn(true)}>새 계정 만들기</Button></Stack></Stack>
      : !household ? <Stack spacing={2} sx={{ mt: 2 }}><Typography variant="body2">새 가족 공간을 만들거나 받은 공유 코드로 기존 공간에 참여하세요.</Typography><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><TextField label="가족 공간 이름" size="small" value={householdName} onChange={event => setHouseholdName(event.target.value)} fullWidth /><Button variant="contained" disabled={working} onClick={createHousehold}>새 공간 만들기</Button></Stack><Divider>또는</Divider><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><TextField label="공유 코드" size="small" value={inviteCode} onChange={event => setInviteCode(event.target.value.toUpperCase())} fullWidth /><Button disabled={working || !inviteCode.trim()} onClick={joinHousehold}>가족 공간 참여</Button></Stack><Button color="inherit" startIcon={<LogoutRounded />} onClick={() => client?.auth.signOut()} sx={{ alignSelf: "flex-start" }}>로그아웃</Button></Stack>
      : <Stack spacing={1.5} sx={{ mt: 2 }}><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}><Box><Typography fontWeight={900}>{household.name}</Typography><Typography variant="caption" color="text.secondary">권한: {{ owner: "소유자", editor: "편집자", viewer: "보기 전용" }[household.role]} · 마지막 클라우드 갱신 {household.updatedAt ? new Date(household.updatedAt).toLocaleString("ko-KR") : "없음"}</Typography></Box>{household.inviteCode && <Button startIcon={<ContentCopyRounded />} onClick={async () => { await navigator.clipboard.writeText(household.inviteCode); onMessage("가족 공유 코드를 복사했습니다."); }}>공유 코드 {household.inviteCode}</Button>}</Stack><FormControlLabel control={<Switch checked={autoSync} disabled={household.role === "viewer"} onChange={event => { setAutoSync(event.target.checked); window.localStorage.setItem(AUTO_SYNC_KEY, String(event.target.checked)); }} />} label="변경 후 자동 클라우드 백업" /><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><Button variant="contained" startIcon={<CloudUploadRounded />} disabled={working || household.role === "viewer"} onClick={() => push(true)}>이 기기 기록 백업</Button><Button variant="outlined" startIcon={<CloudDownloadRounded />} disabled={working} onClick={pull}>클라우드 기록 가져오기</Button><Button color="inherit" startIcon={<LogoutRounded />} onClick={() => client?.auth.signOut()}>로그아웃</Button></Stack><Alert severity="info">가족 편집은 마지막 저장 내용이 우선합니다. 다른 기기에서 기록하기 전 ‘가져오기’를 눌러 최신 상태를 확인하면 충돌을 줄일 수 있습니다.</Alert></Stack>}
    </Paper>
  );
}
