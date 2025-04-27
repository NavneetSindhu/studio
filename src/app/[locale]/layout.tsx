
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Removed metadata export - define it in page.tsx
// export const metadata: Metadata = {
//   title: 'SkinSeva - स्वस्थ जीवन सुखी जीवन',
//   description: 'Detect facial skin diseases from uploaded images.',
// };

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default function RootLayout({
  children,
  params: { locale }, // Destructure locale here
}: RootLayoutProps) { // Add type annotation for props
  return (
    // Use the locale in the lang attribute
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={false} // Ensure system preference is not overriding toggle
          disableTransitionOnChange
        >
          {children}
          <Toaster /> {/* Add Toaster component */}
        </ThemeProvider>
      </body>
    </html>
  );
}

    