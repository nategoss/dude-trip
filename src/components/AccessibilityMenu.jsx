import { useState, useRef, useEffect } from 'react'
import { COLOR_PROFILES } from '../lib/colorProfiles'
import { useColorProfile } from '../contexts/ColorProfileContext'

export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false)
  const { profileId, setProfile, shapeMode, setShapeMode } = useColorProfile()
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Accessibility settings"
        className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-2.5 py-1.5 rounded-lg transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
      >
        <span aria-hidden="true">♿</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            ref={menuRef}
            role="dialog"
            aria-label="Accessibility settings"
            aria-modal="true"
            className="absolute right-0 top-full mt-2 z-50 bg-gray-900 border border-gray-700 rounded-xl p-4 w-72 shadow-xl flex flex-col gap-5"
          >
            {/* Color profile */}
            <section aria-labelledby="profile-heading">
              <p id="profile-heading" className="text-white text-sm font-semibold mb-1">Color Profile</p>
              <p className="text-gray-500 text-xs mb-3">Optimized for color vision deficiency</p>
              <div className="flex flex-col gap-1.5" role="radiogroup" aria-labelledby="profile-heading">
                {Object.values(COLOR_PROFILES).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProfile(p.id)}
                    role="radio"
                    aria-checked={profileId === p.id}
                    className={`text-left text-xs px-3 py-2 rounded-lg border transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                      profileId === p.id
                        ? 'bg-indigo-900/50 border-indigo-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span className="font-medium">{p.label}</span>
                    <span className="block text-gray-400 mt-0.5">{p.description}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Shape mode */}
            <section aria-labelledby="shape-heading">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p id="shape-heading" className="text-white text-sm font-semibold">Shape Indicators</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Adds distinct shapes to calendar dots so color is not the only differentiator
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={shapeMode}
                  aria-label="Toggle shape indicators"
                  onClick={() => setShapeMode(!shapeMode)}
                  className={`flex-shrink-0 w-10 h-5 rounded-full transition relative focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                    shapeMode ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      shapeMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
