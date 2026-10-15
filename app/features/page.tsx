import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features — Khas_khus',
}

const features = [
  {
    icon: '📋',
    title: 'Shared Clipboard',
    desc: 'Type in the shared text area and it syncs to every device on your network in real time. Perfect for moving URLs, snippets, and passwords across devices.',
  },
  {
    icon: '📁',
    title: 'File Sharing',
    desc: 'Upload photos, PDFs, or any file on one device and instantly download it on another — straight from the browser, no cloud storage required.',
  },
  {
    icon: '🚫',
    title: 'No Account Needed',
    desc: 'Zero sign-up, zero login. Open the page and it works. Your data stays on your local network.',
  },
  {
    icon: '🌐',
    title: 'LAN Only',
    desc: 'By default everything stays within your WiFi network. Files and clipboard text are never sent to external servers.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Sync',
    desc: 'Powered by WebSockets. Changes appear on all devices within milliseconds, without polling or refreshing.',
  },
]

export default function FeaturesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 w-full">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Features</h1>
        <p className="mt-3 text-gray-500">
          Everything you need to move content between devices on your network.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h2 className="font-semibold text-gray-900 mb-2">{f.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-teal-50 border border-teal-100 rounded-2xl p-6 text-center">
        <h2 className="font-semibold text-teal-800 mb-2">How it works</h2>
        <p className="text-sm text-teal-700">
          Khas_khus runs a local WebSocket server on your device. Every browser tab
          connected to the same server shares a live clipboard and file list. Secret notes
          are encrypted in your browser before being sent — the server only stores an
          unreadable blob that disappears after the first read.
        </p>
      </div>
    </div>
  )
}
