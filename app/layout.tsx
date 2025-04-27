import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
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
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
