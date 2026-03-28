import { useState } from 'react'
import CalendarMonth from './CalendarMonth'
import RecommendationPanel from './RecommendationPanel'
import AccessibilityMenu from './AccessibilityMenu'
import { DUDES } from '../lib/constants'
import { MONTH_NAMES } from '../lib/dates'
import { useColorProfile } from '../contexts/ColorProfileContext'

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
  const { getDudeColor, getDotStyle, dotSizeClass } = useColorProfile()

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
      <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-700 px-4 py-3 flex items-center gap-3">
        <span className="text-xl" aria-hidden="true">🏕️</span>
        <span className="text-white font-bold">Dude Trip {year}</span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={onGoToChat}
            aria-label="Edit my availability"
            className="text-xs bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
          >
            <span aria-hidden="true">✏️</span> My Availability
          </button>
          <button
            onClick={onSwitchDude}
            className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            Switch Dude
          </button>
          <AccessibilityMenu />
        </div>
      </header>

      <main className="p-4 flex flex-col gap-6 max-w-5xl mx-auto">

        {/* Confirmed trip banner */}
        {confirmedTrip && (
          <div
            role="status"
            aria-live="polite"
            className="bg-green-900/40 border border-green-600 rounded-xl p-4 text-center"
          >
            <p className="text-green-300 font-bold text-lg">
              <span aria-hidden="true">🎉</span> IT'S HAPPENING!
            </p>
            <p className="text-green-400 mt-1">
              {confirmedTrip.start} → {confirmedTrip.end}
            </p>
          </div>
        )}

        {/* Dude status row */}
        <section aria-labelledby="dude-status-heading" className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p id="dude-status-heading" className="text-gray-300 text-sm font-medium">
              Who's filled in their availability?
            </p>
            <span className="text-xs text-gray-500" aria-label={`${totalSet} of 6 dudes have set availability`}>
              {totalSet} / 6
            </span>
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="Dude availability status">
            {dudeSummary.map(({ id, label, emoji, count }) => {
              const color = getDudeColor(id)
              const isMe = id === currentDudeId
              const hasData = count > 0
              return (
                <li
                  key={id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm ${
                    isMe ? 'border-current bg-gray-800' : 'border-gray-700 text-gray-400 bg-gray-800'
                  }`}
                  style={isMe ? { color, borderColor: color } : undefined}
                  aria-label={`${label}: ${hasData ? `${count} dates set` : 'not set up'}${isMe ? ' (you)' : ''}`}
                >
                  <span aria-hidden="true">{emoji}</span>
                  <span>{label}</span>
                  {hasData ? (
                    <span aria-hidden="true" style={{ color }}>✓</span>
                  ) : (
                    <span aria-hidden="true" className="text-gray-600">—</span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        {/* Legend */}
        <section aria-label="Calendar legend" className="flex flex-wrap gap-x-4 gap-y-2">
          {DUDES.map(({ id, label }) => (
            <div key={id} className="flex items-center gap-1.5">
              <div
                className={dotSizeClass}
                style={getDotStyle(id)}
                aria-hidden="true"
              />
              <span className="text-gray-400 text-xs">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="text-indigo-400 text-xs" aria-hidden="true">✦</span>
            <span className="text-gray-400 text-xs">Recommended window</span>
          </div>
        </section>

        {/* Main layout: calendar + recs panel */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Calendar grid */}
          <section aria-label="Availability calendar" className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </section>

          {/* Recommendations panel */}
          <aside aria-label="Trip recommendations" className="lg:w-80 flex-shrink-0">
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
          </aside>
        </div>
      </main>
    </div>
  )
}
