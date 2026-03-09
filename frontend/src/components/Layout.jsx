import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
