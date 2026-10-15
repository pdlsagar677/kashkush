import ClipboardSync from '@/components/ClipboardSync'
import FileShare from '@/components/FileShare'

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 w-full">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Sync text and files across<br className="hidden sm:block" /> every device on your WiFi
        </h1>
        <p className="mt-3 text-gray-500">
          Open this page on any device on your network — it just works.
          No account, no install.
        </p>
      </div>

      {/* Clipboard */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Shared Clipboard
        </h2>
        <ClipboardSync />
      </section>

      {/* File sharing */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          File Sharing
        </h2>
        <FileShare />
      </section>

      {/* How it works */}
      <section className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {[
          { step: '1', title: 'Open the page', desc: 'Visit this URL on any device connected to your WiFi.' },
          { step: '2', title: 'Type or upload', desc: 'Write text or drop a file — it appears instantly on all devices.' },
          { step: '3', title: 'Done', desc: 'No login, no cloud, no extensions. Works right in the browser.' },
        ].map((item) => (
          <div key={item.step} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 text-sm font-bold
                            flex items-center justify-center mx-auto mb-3">
              {item.step}
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
