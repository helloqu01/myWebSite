import type { Metadata } from "next";
import { isResumePublic } from "@/lib/featureFlags";

export const metadata: Metadata = {
  title: "이력서 | Oh Hyunji",
  robots: isResumePublic
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true },
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return children;
}

