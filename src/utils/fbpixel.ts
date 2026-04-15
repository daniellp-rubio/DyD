declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

export const fbq = (...args: any[]) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
};
