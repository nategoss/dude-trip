import { useState } from 'react'
import CalendarMonth from './CalendarMonth'
import RecommendationPanel from './RecommendationPanel'
import { DUDES, DUDE_COLORS } from '../lib/constants'
import { MONTH_NAMES } from '../lib/dates'

export default function CalendarView({
  year,
  dudesData,
  currentDudeId,
  recommendations,
  recsLoading,
  confirmedTrip,
  votes,
  location,
  onToggleDate,
  onRefreshRecs,
  onConfirmTrip,
  onVote,
  onSwitchDude,
  onGoToChat,
  onSaveLocation,
}) {
  const [showRecs, setShowRecs] = useState(true)

  // Show July–November only (Jul=6, Nov=10)
  // If we're past July already, start from current month but cap at November
  const now = new Date()
  const firstMonth = now.getFullYear() === year ? Math.max(now.getMonth(), 5) : 5
  const months = Array.from({ length: 11 - firstMonth }, (_, i) => firstMonth + i)

  const dudeSummary = DUDES.map(({ id, label, emoji }) => {
    const count = Object.keys(dudesData?.[id]?.availability || {}).length
    return { id, label, emoji, count }
  })

  const totalSet = dudeSummary.filter((d) => d.count > 0).length

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-700 px-4 py-3 flex items-center gap-3">
        <span className="text-xl">🏕️</span>
        <span className="text-white font-bold">Dude Trip {year}</span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={onGoToChat}
            className="text-xs bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition"
          >
            ✏️ My Availability
          </button>
          <button
            onClick={onSwitchDude}
            className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition"
          >
            Switch Dude
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-6 max-w-5xl mx-auto">

        {/* Confirmed trip banner */}
        {confirmedTrip && (
          <div className="bg-green-900/40 border border-green-600 rounded-xl p-4 text-center">
            <p className="text-green-300 font-bold text-lg">🎉 IT'S HAPPENING!</p>
            <p className="text-green-400 mt-1">
              {confirmedTrip.start} → {confirmedTrip.end}
            </p>
          </div>
        )}

        {/* Dude status row */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-300 text-sm font-medium">Who's filled in their availability?</p>
            <span className="text-xs text-gray-500">{totalSet} / 6</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dudeSummary.map(({ id, label, emoji, count }) => {
              const colors = DUDE_COLORS[id]
              const isMe = id === currentDudeId
              return (
                <div
                  key={id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm ${
                    isMe ? `border-current ${colors.text} bg-gray-800` : 'border-gray-700 text-gray-400 bg-gray-800'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                  {count > 0 ? (
                    <span className={`text-xs ${colors.text}`}>✓</span>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {DUDES.map(({ id, label, emoji }) => (
            <div key={id} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${DUDE_COLORS[id].dot}`} />
              <span className="text-gray-400 text-xs">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="text-indigo-400 text-xs">✦</span>
            <span className="text-gray-400 text-xs">Recommended window</span>
          </div>
        </div>

        {/* Main layout: calendar + recs panel */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Calendar grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {months.map((m) => (
              <CalendarMonth
                key={m}
                year={year}
                month={m}
                dudesData={dudesData}
                currentDudeId={currentDudeId}
                recommendations={recommendations}
                onToggleDate={onToggleDate}
              />
            ))}
          </div>

          {/* Recommendations panel */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-20">
              <RecommendationPanel
                recommendations={recommendations}
                loading={recsLoading}
                onRefresh={onRefreshRecs}
                confirmedTrip={confirmedTrip}
                onConfirm={onConfirmTrip}
                votes={votes}
                onVote={onVote}
                location={location}
                onSaveLocation={onSaveLocation}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
