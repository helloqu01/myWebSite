export {};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
