import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "../components/theme-provider"
import { Navigation } from "../components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Moskal Report Generator",
  description: "Generate sentiment analysis reports for any topic",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
