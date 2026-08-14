import type { CareSchedule, CatProfile, DailyRecord, HealthAlert, LabReport } from "@/types/cat-care";
import { getCatAge } from "./insights";
import { scheduleRepeatLabel, scheduleTypeLabel } from "./schedules";
import { toLocalDateKey } from "./storage";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function displayNumber(value: number | null, unit: string): string {
  return value == null ? "—" : `${value}${unit}`;
}

function average(records: DailyRecord[], pick: (record: DailyRecord) => number | null): string {
  const values = records.map(pick).filter((value): value is number => value != null);
  if (!values.length) return "—";
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
}

const appetiteLabel = {
  good: "좋음",
  normal: "평소",
  low: "감소",
  none: "먹지 않음",
} as const;

const alertLevelLabel = {
  info: "정보",
  watch: "관찰 필요",
  consult: "상담 권장",
  urgent: "즉시 진료",
} as const;

interface VetReportInput {
  cat: CatProfile;
  records: DailyRecord[];
  alerts: HealthAlert[];
  schedules: CareSchedule[];
  labReports: LabReport[];
  days: number;
}

export function openVetReport({ cat, records, alerts, schedules, labReports, days }: VetReportInput): boolean {
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) return false;
  reportWindow.opener = null;

  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sortedRecords[0];
  const age = getCatAge(cat.birthDate);
  const dateRange = sortedRecords.length
    ? `${sortedRecords.at(-1)!.date} ~ ${sortedRecords[0].date}`
    : `최근 ${days}일 (기록 없음)`;
  const activeSchedules = schedules.filter(schedule => schedule.catId === cat.id && schedule.enabled);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const startKey = toLocalDateKey(start);
  const recentLabReports = labReports
    .filter(report => report.catId === cat.id && report.date >= startKey)
    .sort((a, b) => b.date.localeCompare(a.date));
  const symptoms = (record: DailyRecord) => [
    record.urinationStraining && "배뇨 힘주기",
    record.urineNotProduced && "소변 안 나옴",
    record.bloodInUrine && "혈뇨",
    record.breathingDifficulty && "호흡 곤란",
    record.collapseOrSeizure && "쓰러짐/경련",
  ].filter(Boolean).join(", ") || "—";

  const recordRows = sortedRecords.map(record => {
    const medicationDone = Object.values(record.medicationChecks).filter(Boolean).length;
    return `
      <tr>
        <td>${escapeHtml(record.date)}</td>
        <td>${escapeHtml(displayNumber(record.waterMl, "ml"))}</td>
        <td>${escapeHtml(displayNumber(record.urineCount, "회"))}</td>
        <td>${escapeHtml(displayNumber(record.stoolCount, "회"))}</td>
        <td>${escapeHtml(appetiteLabel[record.appetite])}</td>
        <td>${escapeHtml(displayNumber(record.weightKg, "kg"))}</td>
        <td>${cat.medications.length ? `${medicationDone}/${cat.medications.length}` : "—"}</td>
        <td>${escapeHtml(symptoms(record))}</td>
        <td>${escapeHtml(record.notes || "—")}</td>
      </tr>`;
  }).join("");

  const alertRows = alerts.length
    ? alerts.map(alert => `
      <li><strong>[${escapeHtml(alertLevelLabel[alert.level])}] ${escapeHtml(alert.title)}</strong><br />
      ${escapeHtml(alert.detail)}<br /><small>근거: ${escapeHtml(alert.evidence)}</small></li>`).join("")
    : "<li>현재 자동 감지된 주의 변화가 없습니다.</li>";

  const scheduleRows = activeSchedules.length
    ? activeSchedules.map(schedule => `
      <li><strong>${escapeHtml(schedule.title)}</strong> · ${escapeHtml(scheduleTypeLabel[schedule.type])} · ${escapeHtml(scheduleRepeatLabel[schedule.repeat])}
      ${schedule.time ? ` · ${escapeHtml(schedule.time)}` : ""}${schedule.notes ? `<br /><small>${escapeHtml(schedule.notes)}</small>` : ""}</li>`).join("")
    : "<li>활성화된 케어 일정이 없습니다.</li>";

  const labRows = recentLabReports.flatMap(report => report.items.map(item => `
    <tr>
      <td>${escapeHtml(report.date)}</td>
      <td>${escapeHtml(report.hospital || "—")}</td>
      <td>${escapeHtml(item.code)} · ${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.value ?? "—")} ${escapeHtml(item.unit)}</td>
      <td>${item.referenceLow == null && item.referenceHigh == null ? "—" : `${escapeHtml(item.referenceLow ?? "")}-${escapeHtml(item.referenceHigh ?? "")}`}</td>
      <td>${escapeHtml({ low: "낮음", normal: "기준 내", high: "높음", unknown: "확인 필요" }[item.flag])}</td>
    </tr>`)).join("");

  reportWindow.document.write(`<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(cat.name)} 건강 기록 리포트</title>
  <style>
    :root { color-scheme: light; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; }
    body { max-width: 1080px; margin: 0 auto; padding: 32px; line-height: 1.55; }
    header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; }
    h1 { margin: 0 0 8px; font-size: 28px; } h2 { margin: 28px 0 12px; font-size: 19px; }
    p { margin: 4px 0; } .muted, small { color: #667085; }
    .print { border: 0; border-radius: 8px; padding: 10px 16px; color: white; background: #7c3aed; cursor: pointer; font-weight: 700; white-space: nowrap; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 18px; }
    .summary div { border: 1px solid #d9dce3; border-radius: 10px; padding: 12px; }
    .summary span { display: block; color: #667085; font-size: 12px; } .summary strong { font-size: 17px; }
    .profile { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 24px; margin-top: 18px; }
    ul { padding-left: 22px; } li { margin: 9px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; } th, td { border: 1px solid #d9dce3; padding: 7px; text-align: left; vertical-align: top; }
    th { background: #f3f0ff; white-space: nowrap; }
    .notice { margin-top: 28px; border: 1px solid #f0b429; background: #fff8e6; border-radius: 10px; padding: 12px; font-size: 12px; }
    @media (max-width: 720px) { body { padding: 18px; } .summary, .profile { grid-template-columns: 1fr 1fr; } .table-wrap { overflow-x: auto; } }
    @media print { body { max-width: none; padding: 0; } .print { display: none; } h2 { break-after: avoid; } table { font-size: 10px; } tr { break-inside: avoid; } }
  </style>
</head>
<body>
  <header>
    <div><h1>${escapeHtml(cat.name)} 건강 기록 리포트</h1><p class="muted">기록 기간: ${escapeHtml(dateRange)} · 생성일: ${toLocalDateKey(new Date())}</p></div>
    <button class="print" type="button" onclick="window.print()">인쇄 / PDF 저장</button>
  </header>
  <section class="profile">
    <p><strong>나이</strong> ${age == null ? "미등록" : `${age}살`}</p><p><strong>성별</strong> ${escapeHtml({ female: "암컷", male: "수컷", unknown: "미확인" }[cat.sex])}</p>
    <p><strong>현재 체중</strong> ${escapeHtml(displayNumber(cat.currentWeightKg, "kg"))}</p><p><strong>목표 체중</strong> ${escapeHtml(displayNumber(cat.targetWeightKg, "kg"))}</p>
    <p><strong>질환·관심 항목</strong> ${escapeHtml(cat.conditions.join(", ") || "—")}</p><p><strong>복용약</strong> ${escapeHtml(cat.medications.map(item => item.name).join(", ") || "—")}</p>
    <p><strong>주치의 목표</strong> ${escapeHtml(cat.vetTargets || "—")}</p><p><strong>보호자 메모</strong> ${escapeHtml(cat.notes || "—")}</p>
  </section>
  <section class="summary">
    <div><span>기록 일수</span><strong>${records.length}일</strong></div>
    <div><span>평균 음수량</span><strong>${average(records, record => record.waterMl)}${records.some(record => record.waterMl != null) ? "ml" : ""}</strong></div>
    <div><span>평균 소변 횟수</span><strong>${average(records, record => record.urineCount)}${records.some(record => record.urineCount != null) ? "회" : ""}</strong></div>
    <div><span>최근 체중</span><strong>${escapeHtml(displayNumber(latest?.weightKg ?? cat.currentWeightKg, "kg"))}</strong></div>
  </section>
  <h2>자동 감지 요약</h2><ul>${alertRows}</ul>
  <h2>현재 케어 일정</h2><ul>${scheduleRows}</ul>
  <h2>병원 검사결과</h2>
  <div class="table-wrap"><table><thead><tr><th>검사일</th><th>병원</th><th>항목</th><th>결과</th><th>검사표 기준범위</th><th>표시</th></tr></thead><tbody>${labRows || '<tr><td colspan="6">해당 기간에 저장된 검사결과가 없습니다.</td></tr>'}</tbody></table></div>
  <h2>일별 상세 기록</h2>
  <div class="table-wrap"><table><thead><tr><th>날짜</th><th>음수량</th><th>소변</th><th>대변</th><th>식욕</th><th>체중</th><th>투약</th><th>이상 징후</th><th>메모</th></tr></thead><tbody>${recordRows || '<tr><td colspan="9">해당 기간에 기록이 없습니다.</td></tr>'}</tbody></table></div>
  <div class="notice"><strong>안내:</strong> 이 리포트는 보호자가 입력한 관찰 기록을 정리한 자료이며 수의사의 진단을 대신하지 않습니다.</div>
</body>
</html>`);
  reportWindow.document.close();
  reportWindow.focus();
  return true;
}
