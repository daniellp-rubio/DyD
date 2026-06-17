import type { Metadata } from "next";
import Script from "next/script";

// Components
import { TitleWatcher } from "@/components/title/TitleWatcher";
import { Provider } from "@/components";

// Fonts
import { inter } from "@/config/fonts";

// Styles
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | DYD Tech — Gadgets y Audio Premium Colombia",
    default: "DYD Tech | Gadgets y Audio Premium en Colombia"
  },
  description: "Auriculares, AirPods, gaming y smart tech de alta fidelidad. Envío express en Colombia, pagos seguros y garantía extendida.",
  icons: {
    icon: "/favicon_(640x640px).png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO">
      <head>
        {/* Adelanta la conexión al CDN de imágenes (mejora LCP en PDP) */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* <!-- Meta Pixel Code --> */}
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>

          {/* NoScript para backup */}
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              alt=""
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${process.env.META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        {/* <!-- End Meta Pixel Code --> */}
      </head>
      <body className={inter.className}>
        <Provider>
          <TitleWatcher />

          {children}
        </Provider>
      </body>
    </html>
  );
};
