import { type ReactNode } from 'react'
import { TrendingUp, BarChart3, Users, GitBranch } from 'lucide-react'

const highlights = [
  { icon: BarChart3, text: 'Real-time sales dashboard' },
  { icon: Users,     text: 'Multi-role staff management' },
  { icon: GitBranch, text: 'Multi-branch support' },
]

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* Left — branded panel (desktop only) */}
      <div className="hidden md:flex flex-col justify-between w-[420px] flex-shrink-0 p-10"
        style={{ background: 'linear-gradient(160deg, #557d24 0%, #6fa42e 50%, #8dc63f 100%)' }}>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} color="white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-white text-xl">Salesify</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Smarter sales,<br />every branch.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            Track transactions, manage your team, and accept Telebirr payments — all in one place.
          </p>
          <div className="flex flex-col gap-3">
            {highlights.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={15} color="white" />
                </div>
                <span className="text-white/90 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs">© 2026 Medkainovex</p>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col md:items-center md:justify-center md:p-6 md:bg-gray-50">

        {/* Mobile — green header */}
        <div className="md:hidden flex flex-col items-center justify-center pt-14 pb-10 px-6"
          style={{ background: 'linear-gradient(160deg, #557d24 0%, #6fa42e 60%, #8dc63f 100%)' }}>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp size={28} color="white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-white">Salesify</h1>
          <p className="text-white/70 text-sm mt-1">Smarter sales, every branch.</p>
        </div>

        {/* Mobile — white card form */}
        <div className="md:hidden flex-1 bg-white rounded-t-3xl -mt-4 px-6 pt-8 pb-10 w-full">
          {children}
        </div>

        {/* Desktop — plain form */}
        <div className="hidden md:block w-full max-w-sm">
          {children}
        </div>

      </div>

    </div>
  )
}
