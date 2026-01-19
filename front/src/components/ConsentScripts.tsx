"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";

type ConsentValue = "accepted" | "declined" | null;

export default function ConsentScripts() {
  const [consent, setConsent] = useState<ConsentValue>(null);

  useEffect(() => {
    const read = () => window.localStorage.getItem("cookieConsent") as ConsentValue;
    setConsent(read());

    const handleConsent = (event: Event) => {
      const detail = (event as CustomEvent<ConsentValue>).detail;
      setConsent(detail ?? read());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "cookieConsent") setConsent(read());
    };

    window.addEventListener("cookie-consent", handleConsent as EventListener);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("cookie-consent", handleConsent as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (consent === null) return;
    if (typeof window.gtag !== "function") return;
    const status = consent === "accepted" ? "granted" : "denied";
    window.gtag("consent", "update", {
      ad_storage: status,
      analytics_storage: status,
      ad_user_data: status,
      ad_personalization: status,
    });
  }, [consent]);

  if (consent !== "accepted") return null;

  return (
    <>
      {/* Microsoft Clarity */}
      <Script
        id="clarity-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html:
            "(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};" +
            "t=l.createElement(r);t.async=1;t.src=\"https://www.clarity.ms/tag/\"+i;" +
            "y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);" +
            "})(window, document, \"clarity\", \"script\", \"v2sj4o2bvk\");",
        }}
      />
    </>
  );
}
