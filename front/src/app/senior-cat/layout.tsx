import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "노묘 건강관리 | Oh Hyunji",
  description: "여러 고양이의 음수량, 배변, 체중, 식욕과 투약을 기록하고 개인별 변화를 확인합니다.",
};

export default function SeniorCatLayout({ children }: { children: React.ReactNode }) {
  return children;
}

