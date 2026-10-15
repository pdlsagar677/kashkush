import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-teal-600 tracking-tight">
          Khas_khus
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <Link href="/features" className="hover:text-teal-600 transition-colors">Features</Link>
        </div>
      </div>
    </nav>
  )
}
