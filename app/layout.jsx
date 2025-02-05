import '@/global.css'

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='antialiased'>
      <body>{children}</body>
    </html>
  )
}
