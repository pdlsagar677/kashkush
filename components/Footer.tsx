import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-400 text-center">
          Share text and files across all devices on your wireless network
        </p>
        <div className="flex justify-center gap-6 mt-3 text-sm text-gray-400">
          <Link href="/features" className="hover:text-teal-600 transition-colors">Features</Link>
          <span>v1.0</span>
        </div>
        <p className="text-xs text-gray-300 text-center mt-4">
          © 2025 simple.savr
        </p>
      </div>
    </footer>
  )
}
