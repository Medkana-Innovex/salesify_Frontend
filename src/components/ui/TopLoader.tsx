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
  const [width, setWidth] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      const { active } = (e as CustomEvent).detail
      if (active) {
        setFading(false)
        setActive(true)
        setWidth(70)
      } else {
        setWidth(100)
        setTimeout(() => {
          setFading(true)
          setTimeout(() => {
            setActive(false)
            setWidth(0)
            setFading(false)
          }, 300)
        }, 150)
      }
    }
    window.addEventListener('toploader', handler)
    return () => window.removeEventListener('toploader', handler)
  }, [])

  if (!active) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5">
      <div
        className="h-full bg-lemon-400 transition-all duration-500 ease-out"
        style={{
          width: `${width}%`,
          opacity: fading ? 0 : 1,
          transition: fading ? 'opacity 0.3s ease' : 'width 0.5s ease-out',
        }}
      />
    </div>
  )
}
