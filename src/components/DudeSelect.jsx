import { DUDES, DUDE_COLORS } from '../lib/constants'

export default function DudeSelect({ onSelect, dudesData }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
      <div className="flex flex-col items-center gap-8 w-full max-w-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">🏕️</div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Dude Trip</h1>
          <p className="text-gray-400 mt-2">Who are you?</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          {DUDES.map((dude) => {
            const colors = DUDE_COLORS[dude.id]
            const hasData = dudesData?.[dude.id]?.availability
            const dateCount = hasData ? Object.keys(hasData).length : 0

            return (
              <button
                key={dude.id}
                onClick={() => onSelect(dude.id)}
                className="flex flex-col items-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-2xl p-6 transition group"
              >
                <span className="text-4xl">{dude.emoji}</span>
                <span className="text-xl font-semibold text-white">{dude.label}</span>
                {dateCount > 0 ? (
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-800 ${colors.text}`}>
                    {dateCount} dates set
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">
                    Not set up
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
