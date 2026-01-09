import './globals.css'

export const metadata = {
  title: 'Boardify',
  description: 'A lightweight, feature-rich Kanban board.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

