import { useEffect, useState } from 'react'

let count = 0

export function loaderStart() {
  count++
  window.dispatchEvent(new CustomEvent('toploader', { detail: { active: true } }))
}

export function loaderDone() {
  count = Math.max(0, count - 1)
  if (count === 0) {
    window.dispatchEvent(new CustomEvent('toploader', { detail: { active: false } }))
  }
}

export default function TopLoader() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      setActive((e as CustomEvent).detail.active)
    }
    window.addEventListener('toploader', handler)
    return () => window.removeEventListener('toploader', handler)
  }, [])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/40 backdrop-blur-sm">
      <div className="w-12 h-12 rounded-full border-4 border-lemon-100 border-t-lemon-500 animate-spin" />
    </div>
  )
}
