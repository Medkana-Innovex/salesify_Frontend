import { useNavigate } from 'react-router-dom'
import { TrendingUp, Users, GitBranch, Zap, CreditCard, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Real-time Dashboard',
    desc: 'Track your sales performance across all branches at a glance.',
  },
  {
    icon: Users,
    title: 'Staff Management',
    desc: 'Manage your team, assign roles, and track individual performance.',
  },
  {
    icon: GitBranch,
    title: 'Multi-Branch Support',
    desc: 'Run multiple branches from one account with full visibility.',
  },
  {
    icon: CreditCard,
    title: 'Telebirr Payments',
    desc: 'Accept payments via Telebirr and track every transaction instantly.',
  },
  {
    icon: Zap,
    title: 'Instant Tip Alerts',
    desc: 'Staff get notified instantly when they receive a tip from a customer.',
  },
  {
    icon: TrendingUp,
    title: 'Sales Reports',
    desc: 'Download detailed reports by branch, staff, or date range.',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-lemon-400 rounded-xl flex items-center justify-center">
            <TrendingUp size={16} color="white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-900 text-lg">Salesify</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="text-sm font-semibold bg-lemon-400 hover:bg-lemon-500 active:scale-95 text-white px-4 py-2 rounded-xl transition-all duration-150"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center gap-12">

        {/* Left — text */}
        <div className="flex-1 text-center md:text-left animate-fade-up">
          <span className="inline-block bg-lemon-50 text-lemon-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            Built for Ethiopian businesses
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-5">
            Smarter sales,<br />
            <span className="text-lemon-500">every branch.</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
            Track sales, manage staff, and accept Telebirr payments — all from one simple dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <button
              onClick={() => navigate('/register')}
              className="bg-lemon-400 hover:bg-lemon-500 active:scale-95 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-150 shadow-sm"
            >
              Create Your Business
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border border-gray-200 hover:border-lemon-300 hover:bg-lemon-50 text-gray-700 font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-150"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Right — mock dashboard */}
        <div className="flex-1 w-full max-w-sm md:max-w-none animate-fade-up">
          <div className="bg-lemon-50 rounded-3xl p-5 space-y-3">
            <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Today's Sales</p>
                <p className="text-2xl font-bold text-gray-900">ETB 24,500</p>
              </div>
              <div className="w-11 h-11 bg-lemon-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-lemon-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Transactions</p>
                <p className="text-xl font-bold text-gray-900">142</p>
                <p className="text-xs text-lemon-500 mt-1">+12% today</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Active Staff</p>
                <p className="text-xl font-bold text-gray-900">8</p>
                <p className="text-xs text-lemon-500 mt-1">3 branches</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 bg-lemon-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                D
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Dawit received a reward</p>
                <p className="text-xs text-gray-400">ETB 50 · just now</p>
              </div>
              <span className="text-xs bg-lemon-50 text-lemon-600 px-2 py-1 rounded-full font-medium flex-shrink-0">New</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Everything you need</h2>
            <p className="text-gray-500 max-w-md mx-auto">One platform to run your entire sales operation.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-lemon-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-lemon-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Ready to grow your business?</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Join businesses already using Salesify to manage sales smarter.</p>
        <button
          onClick={() => navigate('/register')}
          className="bg-lemon-400 hover:bg-lemon-500 active:scale-95 text-white font-semibold px-10 py-4 rounded-2xl text-base transition-all duration-150 shadow-sm"
        >
          Create Your Business — Free
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-lemon-400 rounded-md flex items-center justify-center">
            <TrendingUp size={10} color="white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-gray-500">Salesify</span>
        </div>
        <span>© 2026 Medkainovex · All rights reserved</span>
      </footer>

    </div>
  )
}
