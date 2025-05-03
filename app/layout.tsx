import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import { PlayerBar } from "@/components/player/PlayerBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | Spotify Clone',
    default: 'Spotify Clone',
  },
  description: "A professional music streaming interface",
  generator: 'v0.dev',
  icons: [
    {
      rel: 'icon',
      url: '/spotify-logo.png', // Đường dẫn đến file icon của bạn trong thư mục public
    },
    // Bạn có thể thêm các icon khác nhau cho các mục đích khác nhau
    // {
    //   rel: 'apple-touch-icon',
    //   url: '/apple-icon.png',
    //   sizes: '180x180',
    // },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PlayerProvider>
              <main className="pb-24">
                {children}
              </main>
              <PlayerBar />
            </PlayerProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
