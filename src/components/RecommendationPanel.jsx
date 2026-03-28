import { useState } from 'react'
import { DUDES } from '../lib/constants'
import { MONTH_NAMES } from '../lib/dates'
import { useColorProfile } from '../contexts/ColorProfileContext'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}`
}

function ScoreBar({ score }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : '#f97316'
  const label = pct >= 80 ? 'High' : pct >= 60 ? 'Medium' : 'Low'
  return (
    <div className="flex items-center gap-2" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Compatibility score: ${pct}% (${label})`}>
      <div className="flex-1 bg-gray-800 rounded-full h-1.5" aria-hidden="true">
        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-gray-400" aria-hidden="true">{pct}%</span>
    </div>
  )
}

function RecCard({ rec, label, confirmedTrip, onConfirm, onVote, votes }) {
  const { getDudeColor } = useColorProfile()
  const isConfirmed = confirmedTrip?.start === rec.start && confirmedTrip?.end === rec.end
  const voteCount = votes ? Object.values(votes).filter(Boolean).length : 0

  return (
    <article
      className={`bg-gray-900 border rounded-xl p-4 flex flex-col gap-3 ${
        isConfirmed ? 'border-green-500' : 'border-gray-700'
      }`}
      aria-label={`${label}: ${formatDate(rec.start)} to ${formatDate(rec.end)}${isConfirmed ? ', confirmed' : ''}`}
    >
      {isConfirmed && (
        <div
          role="status"
          className="bg-green-900/40 text-green-400 text-xs font-semibold px-2 py-1 rounded-lg text-center"
        >
          <span aria-hidden="true">🎉</span> IT'S HAPPENING
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-white font-semibold text-sm">{label}</span>
          <p className="text-indigo-400 font-bold">{formatDate(rec.start)} – {formatDate(rec.end)}</p>
        </div>
        <div className="flex-shrink-0 w-28">
          <ScoreBar score={rec.score} />
        </div>
      </div>

      {rec.note && <p className="text-gray-400 text-xs italic">"{rec.note}"</p>}

      <div>
        <p className="text-gray-500 text-xs mb-1">
          In ({rec.availableDudes?.length || 0}):
        </p>
        <ul className="flex flex-wrap gap-1" aria-label="Available dudes">
          {(rec.availableDudes || []).map((name) => {
            const dude = DUDES.find((d) => d.label === name || d.id === name.toLowerCase())
            const color = dude ? getDudeColor(dude.id) : '#d1d5db'
            return (
              <li key={name}>
                <span
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-800"
                  style={{ color }}
                >
                  {name}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {rec.missingDudes?.length > 0 && (
        <div>
          <p className="text-gray-500 text-xs mb-1">
            Can't make it ({rec.missingDudes.length}):
          </p>
          <ul className="flex flex-wrap gap-1" aria-label="Dudes who can't make it">
            {rec.missingDudes.map((name) => (
              <li key={name}>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 line-through">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onVote(rec, true)}
          aria-label={`Vote: this window works for me${voteCount > 0 ? `, ${voteCount} vote${voteCount !== 1 ? 's' : ''}` : ''}`}
          className="flex-1 text-xs bg-gray-800 hover:bg-green-900/50 border border-gray-600 hover:border-green-600 text-gray-300 hover:text-green-400 py-1.5 rounded-lg transition focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none"
        >
          <span aria-hidden="true">👍</span> Works for me {voteCount > 0 ? `(${voteCount})` : ''}
        </button>
        {!isConfirmed && (
          <button
            onClick={() => onConfirm(rec)}
            aria-label={`Lock in ${formatDate(rec.start)} to ${formatDate(rec.end)} as the trip dates`}
            className="flex-1 text-xs bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-700 text-indigo-300 hover:text-white py-1.5 rounded-lg transition font-semibold focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <span aria-hidden="true">🔒</span> Lock it in
          </button>
        )}
      </div>
    </article>
  )
}

export default function RecommendationPanel({ recommendations, loading, onRefresh, confirmedTrip, onConfirm, votes, onVote, location, onSaveLocation }) {
  const [locationInput, setLocationInput] = useState(location || '')
  const [editingLocation, setEditingLocation] = useState(!location)

  const threeDayRecs = recommendations?.threeDay || []
  const fourDayRecs = recommendations?.fourDay || []

  function handleLocationSave() {
    onSaveLocation(locationInput.trim())
    setEditingLocation(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">
          <span aria-hidden="true">🤖</span> AI Recommendations
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          aria-busy={loading}
          aria-label={loading ? 'Loading recommendations…' : 'Refresh recommendations'}
          className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          {loading ? '⏳ Loading...' : '↻ Refresh'}
        </button>
      </div>

      {/* Location */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col gap-2">
        <p className="text-gray-400 text-xs font-medium">
          <span aria-hidden="true">📍</span> Destination (optional)
        </p>
        {editingLocation ? (
          <div className="flex gap-2">
            <label htmlFor="location-input" className="sr-only">Trip destination</label>
            <input
              id="location-input"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLocationSave()}
              placeholder="e.g. Cabo, Colorado ski trip, Smoky Mountains..."
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
            <button
              onClick={handleLocationSave}
              aria-label="Save destination"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-white text-sm">{location}</span>
            <button
              onClick={() => setEditingLocation(true)}
              aria-label={`Change destination from ${location}`}
              className="text-gray-500 hover:text-gray-300 text-xs underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
            >
              Change
            </button>
          </div>
        )}
        <p className="text-gray-600 text-xs">Gemini will factor in the best season for this destination.</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-gray-500" role="status" aria-live="polite">
          <div className="text-2xl mb-2" aria-hidden="true">🤔</div>
          <p className="text-sm">Gemini is crunching the calendars…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && threeDayRecs.length === 0 && fourDayRecs.length === 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm">Not enough availability data yet.</p>
          <p className="text-gray-500 text-xs mt-1">More dudes need to add their dates.</p>
        </div>
      )}

      {/* Recommendations live region */}
      <div aria-live="polite" aria-atomic="false">
        {threeDayRecs.length > 0 && (
          <section aria-labelledby="three-day-heading" className="flex flex-col gap-3">
            <h3 id="three-day-heading" className="text-gray-300 font-semibold text-sm">3-Day Trips</h3>
            {threeDayRecs.map((rec, i) => (
              <RecCard
                key={`3d-${i}`}
                rec={rec}
                label={`Option ${i + 1}`}
                confirmedTrip={confirmedTrip}
                onConfirm={onConfirm}
                onVote={onVote}
                votes={votes?.[rec.start]}
              />
            ))}
          </section>
        )}

        {fourDayRecs.length > 0 && (
          <section aria-labelledby="four-day-heading" className="flex flex-col gap-3 mt-3">
            <h3 id="four-day-heading" className="text-gray-300 font-semibold text-sm">4-Day Trips</h3>
            {fourDayRecs.map((rec, i) => (
              <RecCard
                key={`4d-${i}`}
                rec={rec}
                label={`Option ${i + 1}`}
                confirmedTrip={confirmedTrip}
                onConfirm={onConfirm}
                onVote={onVote}
                votes={votes?.[rec.start]}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
