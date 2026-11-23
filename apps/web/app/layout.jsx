import './globals.css'

export const metadata = {
  title: 'GIBRAS - Groundwater Intelligence & Borewell Risk Assessment System',
  description: 'Government-grade groundwater decision support platform for Kolar and Chikkaballapur, Karnataka.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  )
}
