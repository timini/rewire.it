import { Inter, Montserrat } from "next/font/google"
import Header from "@/components/header"
import "./globals.css"
import type { Metadata } from 'next'

// Load fonts
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })
const montserrat = Montserrat({ 
  subsets: ["latin"], 
  variable: '--font-montserrat',
  display: 'swap' 
})

export const metadata: Metadata = {
  metadataBase: new URL('https://rewire.it'),
  title: {
    default: "rewire.it Blog - Tim Richardson",
    template: "%s | rewire.it Blog"
  },
  description: "Tech consultancy, app building, creative engineering, and musings on philosophy and technology",
  keywords: ["blog", "technology", "AI", "software development", "cognitive science", "programming"],
  authors: [{ name: "Tim Richardson" }],
  creator: "Tim Richardson",
  publisher: "rewire.it",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  verification: {
    // Add verification codes for Google Search Console, Bing Webmaster, etc.
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://rewire.it',
    languages: {
      'en': 'https://rewire.it',
    },
  },
  // Set generator to something other than Next.js to prevent revealing tech stack
  generator: undefined,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={`${inter.variable} ${montserrat.variable} font-sans flex flex-col min-h-screen relative`}
      >
        {/* Single unified background element with no seams */}
        <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 -z-10"></div>
        
        {/* Subtle gradient overlays with no hard edges */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(120,40,200,0.08),transparent_70%)]"></div>
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,100,150,0.08),transparent_70%)]"></div>
        
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 mt-14 relative z-10">{children}</main>
        <footer className="bg-white/80 backdrop-blur-sm shadow-inner py-6 relative z-10">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>© {new Date().getFullYear()} rewire.it. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}

