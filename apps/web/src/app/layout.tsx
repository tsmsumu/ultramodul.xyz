import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import { ThemeCustomizer } from "../components/layout/theme-customizer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UltraModul Enterprise Platform",
  description: "Zero Amnesia. Zero Redundancy.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  
  // Fast initial paint check for Layout and Skin without DB blocking
  const cookieStore = await cookies();
  const skin = cookieStore.get("PREF_SKIN")?.value || "default";
  const layout = cookieStore.get("PREF_LAYOUT")?.value || "sidebar";

  return (
    <html
      lang={locale}
      data-skin={skin}
      data-layout={layout}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative text-sm">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
            <ThemeCustomizer currentSkin={skin} currentLayout={layout} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
