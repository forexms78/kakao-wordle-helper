import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '카카오 단어맞추기 도우미',
  description: '카카오 단어맞추기 게임을 위한 힌트 기반 단어 추천 도우미',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
