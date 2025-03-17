import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import { AuthProvider } from "@/context/auth-context";
import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "1001 Movies Generator - One Movie A Day",
  description: "Explore the history of cinema. One movie a day. From the book 1001 Movies You Must See Before You Die.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <Nav />
                <main className="flex-grow">
                  {children}
                </main>
                <footer className="bg-zinc-100 border-t border-zinc-200 py-6 mt-auto dark:bg-zinc-900 dark:border-zinc-800">
                  <div className="container mx-auto text-center text-sm text-zinc-600 dark:text-zinc-400">
                    <p>Based on the book "1001 Movies You Must See Before You Die"</p>
                    <p className="mt-2">© {new Date().getFullYear()} 1001 Movies Generator</p>
                  </div>
                </footer>
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
