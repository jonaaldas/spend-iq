import type React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/lib/providers'
import { ThemeProvider } from '@/components/theme-provider'
import { ClerkThemeProvider } from '@/components/clerk-theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spend IQ - Join the Waitlist',
  description: 'Join the waitlist for our smart finance tracking app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClerkThemeProvider>{children}</ClerkThemeProvider>
          </ThemeProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
