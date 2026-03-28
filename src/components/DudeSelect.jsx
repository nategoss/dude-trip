import { DUDES } from '../lib/constants'
import { useColorProfile } from '../contexts/ColorProfileContext'
import AccessibilityMenu from './AccessibilityMenu'

export default function DudeSelect({ onSelect, dudesData, onViewCalendar }) {
  const { getDudeColor } = useColorProfile()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
      <div className="flex flex-col items-center gap-8 w-full max-w-lg">
        <div className="text-center">
          <div className="text-6xl mb-4" aria-hidden="true">🏕️</div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Dude Trip</h1>
          <p className="text-gray-400 mt-2">Who are you?</p>
        </div>

        <div
          className="grid grid-cols-2 gap-4 w-full"
          role="list"
          aria-label="Select your dude"
        >
          {DUDES.map((dude) => {
            const color = getDudeColor(dude.id)
            const hasData = dudesData?.[dude.id]?.availability
            const dateCount = hasData ? Object.keys(hasData).length : 0

            return (
              <button
                key={dude.id}
                role="listitem"
                onClick={() => onSelect(dude.id)}
                aria-label={`Select ${dude.label}${dateCount > 0 ? `, ${dateCount} dates set` : ', not set up yet'}`}
                className="flex flex-col items-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-2xl p-6 transition group focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                <span className="text-4xl" aria-hidden="true">{dude.emoji}</span>
                <span className="text-xl font-semibold text-white">{dude.label}</span>
                {dateCount > 0 ? (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full bg-gray-800"
                    style={{ color }}
                    aria-hidden="true"
                  >
                    {dateCount} dates set
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500" aria-hidden="true">
                    Not set up
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onViewCalendar}
            className="text-sm text-gray-400 hover:text-white underline underline-offset-4 transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
          >
            <span aria-hidden="true">📅</span> Just checking the calendar →
          </button>
          <AccessibilityMenu />
        </div>
      </div>
    </div>
  )
}
