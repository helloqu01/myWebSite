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

  if (consent !== "accepted") return null;

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-C2589TCWZ6"
        strategy="afterInteractive"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html:
            "window.dataLayer = window.dataLayer || [];" +
            "function gtag(){dataLayer.push(arguments);}" +
            "gtag('js', new Date());" +
            "gtag('config', 'G-C2589TCWZ6');",
        }}
      />
      {/* End Google tag (gtag.js) */}

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

      {/* Google AdSense */}
      <Script
        async
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1115617071874827"
        crossOrigin="anonymous"
      />
    </>
  );
}
