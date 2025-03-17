import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../../globals.css";
import Nav from "@/components/nav";
import { AuthProvider } from "@/context/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "1001 Movies Generator - One Movie A Day",
  description: "Explore the history of cinema. One movie a day. From the book 1001 Movies You Must See Before You Die.",
  icons: {
    icon: "/favicon.ico",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function RootLayout({
  children,
  params: { locale }
}: RootLayoutProps) {
  // Validate that the locale is supported
  const isValidLocale = ["en", "es"].includes(locale);
  if (!isValidLocale) notFound();

  // Load messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Nav />
              <main className="flex-grow">
                {children}
              </main>
              <footer className="bg-zinc-100 border-t border-zinc-200 py-6 mt-auto">
                <div className="container mx-auto text-center text-sm text-zinc-600">
                  <p>Based on the book "1001 Movies You Must See Before You Die"</p>
                  <p className="mt-2">© {new Date().getFullYear()} 1001 Movies Generator</p>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
