// File: app/AnalyticsTracker.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, trackPageView } from "@/lib/analytics";

const SECTION_IDS = [
  "hero",
  "metrics",
  "projects",
  "case-studies",
  "experience",
  "skills",
  "summary",
  "contact",
];

const SCROLL_THRESHOLDS = [25, 50, 75, 100];

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    trackPageView(pathname);

    const seenScroll = new Set<number>();
    const seenSections = new Set<string>();

    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const percent = Math.round((scrollTop / scrollHeight) * 100);
      SCROLL_THRESHOLDS.forEach(threshold => {
        if (percent >= threshold && !seenScroll.has(threshold)) {
          seenScroll.add(threshold);
          trackEvent("scroll_depth", {
            percent: threshold,
            page_path: pathname,
          });
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          if (!id || seenSections.has(id)) return;
          seenSections.add(id);
          trackEvent("section_view", { section: id, page_path: pathname });
        });
      },
      { threshold: 0.4 }
    );

    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const rawHref = anchor.getAttribute("href") || "";
      if (!rawHref) return;

      const isMailto = rawHref.startsWith("mailto:");
      const isTel = rawHref.startsWith("tel:");
      const isData = rawHref.startsWith("data:");
      const isDownload =
        anchor.hasAttribute("download") ||
        isData ||
        /\.(pdf|vcf|docx?|xlsx?|pptx?)($|\?)/i.test(rawHref);

      if (isMailto) {
        trackEvent("mailto_click", { address: rawHref.replace("mailto:", "") });
      }
      if (isTel) {
        trackEvent("tel_click", { number: rawHref.replace("tel:", "") });
      }
      if (isDownload) {
        trackEvent("file_download", {
          file: anchor.getAttribute("download") || rawHref,
        });
      }

      if (rawHref.startsWith("http")) {
        try {
          const url = new URL(anchor.href);
          if (url.origin !== window.location.origin) {
            trackEvent("outbound_click", {
              url: anchor.href,
              text: anchor.textContent?.trim() || undefined,
            });
          }
        } catch {
          // Ignore malformed URLs.
        }
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      document.removeEventListener("click", handleClick, true);
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

    let lcpValue: number | null = null;
    let clsValue = 0;
    let inpEntry: PerformanceEventTiming | null = null;
    let reported = false;

    const reportOnce = () => {
      if (reported) return;
      reported = true;
      if (lcpValue !== null) {
        trackEvent("web_vitals", { metric: "LCP", value: Math.round(lcpValue) });
      }
      if (clsValue > 0) {
        trackEvent("web_vitals", {
          metric: "CLS",
          value: Number(clsValue.toFixed(3)),
        });
      }
      if (inpEntry) {
        trackEvent("web_vitals", {
          metric: "INP",
          value: Math.round(inpEntry.duration),
          target: inpEntry.name,
        });
      }
    };

    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) lcpValue = last.startTime;
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

    const clsObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries() as PerformanceEntry[]) {
        const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!shift.hadRecentInput) clsValue += shift.value;
      }
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });

    const inpObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries() as PerformanceEventTiming[]) {
        const interactionId = (entry as PerformanceEventTiming & { interactionId?: number })
          .interactionId;
        if (!interactionId) continue;
        if (!inpEntry || entry.duration > inpEntry.duration) {
          inpEntry = entry;
        }
      }
    });
    try {
      inpObserver.observe({
        type: "event",
        buffered: true,
        durationThreshold: 40,
      } as PerformanceObserverInit & { durationThreshold: number });
    } catch {
      // Some browsers do not support INP yet.
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") reportOnce();
    };
    window.addEventListener("visibilitychange", onVisibility);

    return () => {
      reportOnce();
      lcpObserver.disconnect();
      clsObserver.disconnect();
      inpObserver.disconnect();
      window.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname]);

  return null;
}
