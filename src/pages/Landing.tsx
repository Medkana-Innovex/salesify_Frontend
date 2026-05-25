import { useNavigate } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-16 px-6"
      style={{ background: 'linear-gradient(160deg, #557d24 0%, #6fa42e 50%, #8dc63f 100%)' }}>

      {/* Logo */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="bg-white/20 rounded-3xl p-8">
          <TrendingUp size={80} color="white" strokeWidth={2} />
        </div>

        <div className="text-center mt-4">
          <h1 className="text-5xl font-bold text-white tracking-tight">Salesify</h1>
          <p className="text-white/80 text-lg mt-3 leading-relaxed">
            Empower your business.<br />Streamline your sales.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-white text-lemon-600 font-semibold text-lg py-4 rounded-2xl"
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('/register')}
          className="w-full bg-white/20 border border-white/40 text-white font-semibold text-lg py-4 rounded-2xl"
        >
          Create New Business
        </button>
      </div>
    </div>
  )
}
