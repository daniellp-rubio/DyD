"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Store
import { useNotificationStore } from "@/store/notification/notification";

interface Props {
  timeout: number;
};

export const Notification = ({ timeout }: Props) => {
  const [show, setShow] =  useState(true);
  const [progress, setProgress] =  useState("100%");

  const closeNotification = useNotificationStore(state => state.closeNotification);
  const openNotification = useNotificationStore(state => state.openNotification);

  useEffect(() => {
    setProgress("100%");
    const progressTimeout = setTimeout(() => setProgress("0%"), 0);
    const time = setTimeout(() => setShow(false), timeout);
    return () => {
      clearTimeout(progressTimeout);
      clearTimeout(time);
    };
  }, []);

  useEffect(() => {
    if (show) {
      openNotification();
    } else {
      closeNotification();
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className={`fixed bottom-5 left-5 z-50 bg-white rounded-xl shadow-lg border p-4 flex items-center gap-3 w-[340px] max-w-[95%] transition-all duration-500 ease-in-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5 pointer-events-none"}`}>
      <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src="/favicon.ico"
          alt="D&D"
          width={56}
          height={56}
          className="object-contain"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 text-sm text-gray-800">
          <p className="font-semibold">
            ¿Aún no has iniciado sesión?
          </p>
          <Link href="auth/login" className="font-bold text-gray-900 hover:underline">
            Inicia sesión aquí
          </Link>

          <div className="h-1 w-full bg-gray-200 rounded overflow-hidden mt-2">
            <div
              className="h-full bg-palet-found-black transition-[width] ease-linear"
              style={{
                width: progress,
                transitionDuration: `${timeout}ms`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
