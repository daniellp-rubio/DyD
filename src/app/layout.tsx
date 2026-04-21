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
    template:  "%s - DYD Tech | Gadgets",
    default: "Home - DYD Tech | Gadgets"
  },
  description: "Accesorios tecnológicos",
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
    <html lang="en">
      <head>
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
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src="https://www.facebook.com/tr?id=4077092855881726&ev=PageView&noscript=1"
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
