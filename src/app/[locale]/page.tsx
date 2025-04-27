import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from "@/components/ui/toaster";
import { NextIntlProvider } from 'next-intl'; // Use NextIntlProvider instead of NextIntlClientProvider
import { locales } from '@/../i18n'; // Assuming i18n.ts file is at root level

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SkinDeep AI',
  description: 'Detect facial skin diseases from uploaded images.',
};

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Dynamically load the correct messages based on locale
  const messages = await import(`../../messages/${locale}.json`);

  // Check if the locale is supported
  if (!locales.includes(locale as any)) {
    // Handle invalid locale or fallback
    return notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlProvider locale={locale} messages={messages}>
            {children}
            <Toaster />
          </NextIntlProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
