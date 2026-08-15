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
import { siteConfig } from "@/lib/siteConfig";

interface CloudSyncPanelProps {
  care: CareState;
  onRestore: (care: CareState) => void;
  onLogout: () => void;
  onMessage: (message: string) => void;
}

interface HouseholdState {
  id: string;
  name: string;
  inviteCode: string;
  role: CloudMemberRole;
  careData: CareState | null;
  updatedAt: string;
  revision: number;
}

const AUTO_SYNC_KEY = "ohj-cat-care-cloud-auto";
const LAST_SYNC_KEY = "ohj-cat-care-cloud-last-sync";
const LOGOUT_CLEARED_KEY = "ohj-cat-care-cleared-on-logout";

function getAuthRedirectUrl(): string {
  if (typeof window === "undefined") return `${siteConfig.siteUrl}/senior-cat/index.html`;
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  return isLocal
    ? `${window.location.origin}/senior-cat/`
    : `${siteConfig.siteUrl}/senior-cat/index.html`;
}

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
    revision: Number(value.revision ?? 0),
  };
}

function hasHealthRecords(care: CareState): boolean {
  return care.cats.length > 0
    || care.records.length > 0
    || care.foodItems.length > 0
    || care.medicationAdministrations.length > 0
    || care.qualityOfLifeChecks.length > 0
    || care.observationMedia.length > 0
    || care.schedules.length > 0
    || care.labReports.length > 0
    || care.healthCheckups.length > 0
    || care.weeklyChecks.length > 0
    || care.monthlyChecks.length > 0
    || care.emergencyInfo.length > 0;
}

export default function CloudSyncPanel({ care, onRestore, onLogout, onMessage }: CloudSyncPanelProps) {
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
  const [remoteConflict, setRemoteConflict] = useState<HouseholdState | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const initializedRef = useRef(false);
  const careRef = useRef(care);
  const householdRef = useRef(household);
  const onRestoreRef = useRef(onRestore);
  const onLogoutRef = useRef(onLogout);
  const onMessageRef = useRef(onMessage);
  const activeHouseholdId = household?.id ?? "";
  const activeHouseholdRole = household?.role ?? "viewer";
  useEffect(() => {
    careRef.current = care;
    householdRef.current = household;
    onRestoreRef.current = onRestore;
    onLogoutRef.current = onLogout;
    onMessageRef.current = onMessage;
  }, [care, household, onLogout, onMessage, onRestore]);

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
    const restoreAfterLogout = window.localStorage.getItem(LOGOUT_CLEARED_KEY) === "true";
    setAutoSync(storedAuto);
    if (parsed?.careData && (storedAuto || restoreAfterLogout)) {
      const lastSync = window.localStorage.getItem(LAST_SYNC_KEY) ?? "";
      if (restoreAfterLogout || parsed.updatedAt > lastSync) {
        onRestoreRef.current(parsed.careData);
        window.localStorage.setItem(LAST_SYNC_KEY, parsed.updatedAt);
        window.localStorage.removeItem(LOGOUT_CLEARED_KEY);
      }
    }
    initializedRef.current = true;
    setLoading(false);
  }, [client]);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const authErrorCode = hash.get("error_code");
    const authError = hash.get("error_description");
    if (hash.get("type") === "recovery") setPasswordRecovery(true);
    if (authError) {
      setError(authErrorCode === "otp_expired"
        ? "인증 링크가 만료되었거나 이미 사용되었습니다. 이미 인증했다면 로그인하고, 인증 전이라면 아래에서 인증 메일을 다시 보내 주세요."
        : authError.replaceAll("+", " "));
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  useEffect(() => {
    if (!client) { setLoading(false); return; }
    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) void loadHousehold(); else setLoading(false);
    });
    const { data: subscription } = client.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
        setError("");
      }
      setSession(nextSession);
      if (nextSession) void loadHousehold(); else { setHousehold(null); setLoading(false); }
    });
    return () => subscription.subscription.unsubscribe();
  }, [client, loadHousehold]);

  const push = useCallback(async (showMessage = true): Promise<boolean> => {
    const target = householdRef.current;
    if (!client || !target || target.role === "viewer") return true;
    setWorking(true);
    const { data, error: pushError } = await client
      .from("cat_care_households")
      .update({
        care_data: careRef.current,
        revision: target.revision + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", target.id)
      .eq("revision", target.revision)
      .select("updated_at,revision")
      .maybeSingle();
    setWorking(false);
    if (pushError) { setError(pushError.message); return false; }
    if (!data) {
      const { data: latest, error: latestError } = await client
        .from("cat_care_households")
        .select("care_data,updated_at,revision")
        .eq("id", target.id)
        .single();
      if (latestError) { setError(latestError.message); return false; }
      const conflict: HouseholdState = {
        ...target,
        careData: normalizeCareState((latest.care_data ?? {}) as Partial<CareState>),
        updatedAt: String(latest.updated_at),
        revision: Number(latest.revision ?? target.revision),
      };
      householdRef.current = conflict;
      setHousehold(conflict);
      setRemoteConflict(conflict);
      setAutoSync(false);
      window.localStorage.setItem(AUTO_SYNC_KEY, "false");
      setError("다른 가족이 먼저 기록을 저장했습니다. 두 기록 중 어떤 내용을 유지할지 선택해 주세요.");
      return false;
    }
    const updatedAt = String(data.updated_at);
    window.localStorage.setItem(LAST_SYNC_KEY, updatedAt);
    setRemoteConflict(null);
    setHousehold(previous => previous ? { ...previous, careData: careRef.current, updatedAt, revision: Number(data.revision) } : previous);
    if (showMessage) onMessageRef.current("고양이별 건강검진·검사결과를 포함한 현재 기록을 클라우드에 백업했습니다.");
    return true;
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
      ? await client.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: getAuthRedirectUrl() },
        })
      : await client.auth.signInWithPassword({ email, password });
    setWorking(false);
    if (result.error) { setError(result.error.message); return; }
    if (signup && !result.data.session) {
      setConfirmationSent(true);
      onMessage("가입 확인 메일을 보냈습니다. 새 메일의 링크를 한 번만 눌러 인증해 주세요.");
    }
  };

  const resendConfirmation = async () => {
    if (!client || !email.trim()) return;
    setWorking(true); setError("");
    const { error: resendError } = await client.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: getAuthRedirectUrl() },
    });
    setWorking(false);
    if (resendError) { setError(resendError.message); return; }
    setConfirmationSent(true);
    onMessage("미인증 계정이면 확인 메일이 발송됩니다. 이미 인증한 계정이면 로그인하거나 비밀번호를 재설정해 주세요.");
  };

  const requestPasswordReset = async () => {
    if (!client || !email.trim()) return;
    setWorking(true); setError(""); setPasswordResetSent(false);
    const { error: resetError } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getAuthRedirectUrl(),
    });
    setWorking(false);
    if (resetError) { setError(resetError.message); return; }
    setPasswordResetSent(true);
    onMessage("비밀번호 재설정 메일을 요청했습니다. 가장 최근 메일의 링크를 열어 주세요.");
  };

  const updateRecoveredPassword = async () => {
    if (!client) return;
    if (newPassword.length < 6) {
      setError("새 비밀번호는 6자 이상 입력해 주세요.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError("새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }
    setWorking(true); setError("");
    const { error: updateError } = await client.auth.updateUser({ password: newPassword });
    setWorking(false);
    if (updateError) { setError(updateError.message); return; }
    setPasswordRecovery(false);
    setNewPassword("");
    setNewPasswordConfirm("");
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    onMessage("새 비밀번호를 저장했습니다. 로그인 상태로 연결되었습니다.");
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
    window.localStorage.removeItem(LOGOUT_CLEARED_KEY);
    onMessage("가족 공유 공간에 참여하고 최신 기록을 불러왔습니다.");
  };

  const pull = async () => {
    if (!client || !household) return;
    setWorking(true);
    const { data, error: pullError } = await client.from("cat_care_households").select("care_data,updated_at,revision").eq("id", household.id).single();
    setWorking(false);
    if (pullError) { setError(pullError.message); return; }
    if (!window.confirm("이 기기의 건강 기록을 클라우드 최신 기록으로 교체할까요? 현재 로컬 기록은 JSON 백업 후 진행하는 것을 권장합니다.")) return;
    onRestore(normalizeCareState((data.care_data ?? {}) as Partial<CareState>));
    window.localStorage.setItem(LAST_SYNC_KEY, String(data.updated_at));
    const nextHousehold = { ...household, careData: normalizeCareState((data.care_data ?? {}) as Partial<CareState>), updatedAt: String(data.updated_at), revision: Number(data.revision ?? household.revision) };
    householdRef.current = nextHousehold;
    setHousehold(nextHousehold);
    setRemoteConflict(null);
    setError("");
    onMessage("클라우드 최신 기록을 이 기기에 적용했습니다.");
  };

  const logout = async () => {
    if (!client) return;
    setError("");
    const target = householdRef.current;
    if (!target && hasHealthRecords(careRef.current)) {
      const confirmed = window.confirm("아직 가족 클라우드 공간이 없어 현재 기록을 복구할 수 없습니다. 로그아웃하고 이 기기의 기록을 완전히 지울까요?");
      if (!confirmed) return;
    }
    if (target?.role === "owner" || target?.role === "editor") {
      const backedUp = await push(false);
      if (!backedUp) {
        setError("클라우드 백업에 실패해 로그아웃을 중단했습니다. 기록을 확인한 뒤 다시 시도해 주세요.");
        return;
      }
    }

    const previousHousehold = householdRef.current;
    const wasInitialized = initializedRef.current;
    initializedRef.current = false;
    householdRef.current = null;
    setWorking(true);
    const { error: signOutError } = await client.auth.signOut({ scope: "local" });
    setWorking(false);
    if (signOutError) {
      householdRef.current = previousHousehold;
      initializedRef.current = wasInitialized;
      setError(signOutError.message);
      return;
    }

    setHousehold(null);
    setAutoSync(false);
    window.localStorage.removeItem(LAST_SYNC_KEY);
    window.localStorage.setItem(LOGOUT_CLEARED_KEY, "true");
    onLogoutRef.current();
    onMessageRef.current("로그아웃하여 이 기기의 건강 기록을 비웠습니다. 클라우드 기록은 안전하게 유지됩니다.");
  };

  if (!configured) {
    return <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}><Stack direction="row" spacing={1} alignItems="center"><CloudOffRounded color="disabled" /><Typography variant="h6" fontWeight={800}>클라우드 백업·가족 공유</Typography><Chip label="설정 필요" size="small" /></Stack><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>현재는 로컬 저장 모드입니다. Supabase에 제공된 보안 스키마를 적용하고 환경변수 2개를 설정하면 이메일 로그인·자동 백업·공유 코드가 활성화됩니다.</Typography></Paper>;
  }

  if (loading) return <Paper elevation={0} sx={{ p: 3, border: "1px solid var(--card-border)", borderRadius: 4 }}><Stack direction="row" spacing={1.5} alignItems="center"><CircularProgress size={22} /><Typography>클라우드 연결을 확인하는 중입니다.</Typography></Stack></Paper>;

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction="row" spacing={1} alignItems="center"><CloudDoneRounded color={session ? "success" : "disabled"} /><Typography variant="h6" fontWeight={800}>클라우드 백업·가족 공유</Typography>{session && <Chip label={session.user.email ?? "로그인됨"} size="small" variant="outlined" />}</Stack>
      {error && <Alert severity={remoteConflict ? "warning" : "error"} onClose={() => { setError(""); if (!remoteConflict) setRemoteConflict(null); }} sx={{ mt: 1.5 }} action={remoteConflict ? <Stack direction="row" spacing={0.5}><Button color="inherit" size="small" onClick={() => { if (!remoteConflict.careData) return; onRestore(remoteConflict.careData); window.localStorage.setItem(LAST_SYNC_KEY, remoteConflict.updatedAt); setRemoteConflict(null); setError(""); onMessage("클라우드 최신 기록을 적용했습니다."); }}>클라우드 적용</Button><Button color="inherit" size="small" onClick={async () => { if (!window.confirm("다른 가족이 저장한 내용 대신 이 기기 기록을 유지할까요?")) return; setRemoteConflict(null); setError(""); await push(true); }}>이 기기 유지</Button></Stack> : undefined}>{error}</Alert>}
      {passwordRecovery ? <Stack spacing={1.5} sx={{ mt: 2 }}><Alert severity="info">이메일 복구 링크가 확인됐습니다. 앞으로 로그인할 때 사용할 새 비밀번호를 입력해 주세요.</Alert><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><TextField label="새 비밀번호" type="password" size="small" value={newPassword} onChange={event => setNewPassword(event.target.value)} slotProps={{ htmlInput: { autoComplete: "new-password" } }} fullWidth /><TextField label="새 비밀번호 확인" type="password" size="small" value={newPasswordConfirm} onChange={event => setNewPasswordConfirm(event.target.value)} slotProps={{ htmlInput: { autoComplete: "new-password" } }} fullWidth /></Stack><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><Button variant="contained" disabled={working || newPassword.length < 6 || newPasswordConfirm.length < 6} onClick={updateRecoveredPassword}>{working ? "저장 중" : "새 비밀번호 저장"}</Button><Button color="inherit" disabled={working} onClick={logout}>취소</Button></Stack></Stack>
      : !session ? <Stack spacing={1.5} sx={{ mt: 2 }}><Typography variant="body2" color="text.secondary">보호자별 이메일 계정으로 로그인합니다. 가족 구성원은 각자 계정을 만든 뒤 공유 코드로 참여합니다.</Typography><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><TextField label="이메일" type="email" size="small" value={email} onChange={event => setEmail(event.target.value)} slotProps={{ htmlInput: { autoComplete: "email" } }} fullWidth /><TextField label="비밀번호" type="password" size="small" value={password} onChange={event => setPassword(event.target.value)} slotProps={{ htmlInput: { autoComplete: "current-password" } }} fullWidth /></Stack><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><Button variant="contained" disabled={working || !email || password.length < 6} onClick={() => signIn(false)}>로그인</Button><Button disabled={working || !email || password.length < 6} onClick={() => signIn(true)}>새 계정 만들기</Button><Button color="inherit" disabled={working || !email.trim()} onClick={requestPasswordReset}>비밀번호 재설정</Button><Button color="inherit" disabled={working || !email.trim()} onClick={resendConfirmation}>인증 메일 다시 보내기</Button></Stack>{passwordResetSent && <Alert severity="success">비밀번호 재설정 메일을 요청했습니다. 가장 최근 메일의 링크를 열면 이 페이지에서 새 비밀번호를 저장할 수 있습니다.</Alert>}{confirmationSent && <Alert severity="info">미인증 계정에만 새 확인 메일이 발송됩니다. 이미 인증했다면 로그인하거나 비밀번호 재설정을 이용해 주세요.</Alert>}</Stack>
      : !household ? <Stack spacing={2} sx={{ mt: 2 }}><Typography variant="body2">새 가족 공간을 만들거나 받은 공유 코드로 기존 공간에 참여하세요.</Typography><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><TextField label="가족 공간 이름" size="small" value={householdName} onChange={event => setHouseholdName(event.target.value)} fullWidth /><Button variant="contained" disabled={working} onClick={createHousehold}>새 공간 만들기</Button></Stack><Divider>또는</Divider><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><TextField label="공유 코드" size="small" value={inviteCode} onChange={event => setInviteCode(event.target.value.toUpperCase())} fullWidth /><Button disabled={working || !inviteCode.trim()} onClick={joinHousehold}>가족 공간 참여</Button></Stack><Button color="inherit" startIcon={<LogoutRounded />} disabled={working} onClick={logout} sx={{ alignSelf: "flex-start" }}>로그아웃</Button></Stack>
      : <Stack spacing={1.5} sx={{ mt: 2 }}><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}><Box><Typography fontWeight={900}>{household.name}</Typography><Typography variant="caption" color="text.secondary">권한: {{ owner: "소유자", editor: "편집자", viewer: "보기 전용" }[household.role]} · 마지막 클라우드 갱신 {household.updatedAt ? new Date(household.updatedAt).toLocaleString("ko-KR") : "없음"}</Typography></Box>{household.inviteCode && <Button startIcon={<ContentCopyRounded />} onClick={async () => { await navigator.clipboard.writeText(household.inviteCode); onMessage("가족 공유 코드를 복사했습니다."); }}>공유 코드 {household.inviteCode}</Button>}</Stack><Typography variant="caption" color="text.secondary">백업 대상: 고양이 {care.cats.length}마리 · 사료·간식 {care.foodItems.length}건 · 투약 {care.medicationAdministrations.length}건 · 삶의 질 {care.qualityOfLifeChecks.length}건 · 월간 점검 {care.monthlyChecks.length}건 · 관찰 미디어 {care.observationMedia.length}건 · 건강검진 {care.healthCheckups.length}건 · 병원 검사결과 {care.labReports.length}건 · 원본 자료 {[...care.healthCheckups, ...care.labReports].filter(record => record.originalDocument).length + care.observationMedia.length}개 · 일별 기록 {care.records.length}건</Typography><FormControlLabel control={<Switch checked={autoSync} disabled={household.role === "viewer" || Boolean(remoteConflict)} onChange={event => { setAutoSync(event.target.checked); window.localStorage.setItem(AUTO_SYNC_KEY, String(event.target.checked)); }} />} label="변경 후 자동 클라우드 백업" /><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><Button variant="contained" startIcon={<CloudUploadRounded />} disabled={working || household.role === "viewer" || Boolean(remoteConflict)} onClick={() => push(true)}>이 기기 기록 백업</Button><Button variant="outlined" startIcon={<CloudDownloadRounded />} disabled={working} onClick={pull}>클라우드 기록 가져오기</Button><Button color="inherit" startIcon={<LogoutRounded />} disabled={working} onClick={logout}>로그아웃</Button></Stack><Alert severity="info">원본 사진·영상은 비공개 Storage에 저장됩니다. 가족이 동시에 수정하면 자동 저장을 멈추고 어느 기록을 유지할지 물어보므로 조용히 덮어쓰지 않습니다.</Alert></Stack>}
    </Paper>
  );
}
