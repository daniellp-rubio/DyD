declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const fbq = (...args: unknown[]) => {
  if (typeof window !== "undefined") {
    window.fbq?.(...args);
  }
};
