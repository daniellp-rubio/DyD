"use client";

import { SessionProvider } from "next-auth/react";
import { WhatsAppButton } from "@/components/ui/whatsapp-button/WhatsAppButton";
import { ExitIntentPopup } from "@/components/ui/exit-intent/ExitIntentPopup";

interface Props {
  children: React.ReactNode;
}

export const Provider = ({ children }: Props) => {
  return (
    <SessionProvider>
      {children}
      <WhatsAppButton />
      <ExitIntentPopup />
    </SessionProvider>
  );
};
