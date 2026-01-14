import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CareConnect - Care with compassion, anytime, anywhere",
  description: "Connecting Vitals with compassionate Guardians for quality healthcare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('careconnect-theme');
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var appliedTheme = theme || systemTheme;
                  if (appliedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                  var lang = localStorage.getItem('careconnect-language') || 'en';
                  document.documentElement.lang = lang;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

