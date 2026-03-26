import { DUDES, DUDE_COLORS } from '../lib/constants'
import { MONTH_NAMES } from '../lib/dates'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}`
}

function ScoreBar({ score }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400">{pct}%</span>
    </div>
  )
}

function RecCard({ rec, label, confirmedTrip, onConfirm, onVote, votes }) {
  const isConfirmed = confirmedTrip?.start === rec.start && confirmedTrip?.end === rec.end
  const voteCount = votes ? Object.values(votes).filter(Boolean).length : 0

  return (
    <div className={`bg-gray-900 border rounded-xl p-4 flex flex-col gap-3 ${
      isConfirmed ? 'border-green-500' : 'border-gray-700'
    }`}>
      {isConfirmed && (
        <div className="bg-green-900/40 text-green-400 text-xs font-semibold px-2 py-1 rounded-lg text-center">
          🎉 IT'S HAPPENING
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-white font-semibold text-sm">{label}</span>
          <p className="text-indigo-400 font-bold">{formatDate(rec.start)} – {formatDate(rec.end)}</p>
        </div>
        <ScoreBar score={rec.score} />
      </div>

      {rec.note && <p className="text-gray-400 text-xs italic">"{rec.note}"</p>}

      <div>
        <p className="text-gray-500 text-xs mb-1">In ({rec.availableDudes?.length || 0}):</p>
        <div className="flex flex-wrap gap-1">
          {(rec.availableDudes || []).map((name) => {
            const dude = DUDES.find((d) => d.label === name || d.id === name.toLowerCase())
            return (
              <span
                key={name}
                className={`text-xs px-2 py-0.5 rounded-full bg-gray-800 ${dude ? DUDE_COLORS[dude.id].text : 'text-gray-300'}`}
              >
                {name}
              </span>
            )
          })}
        </div>
      </div>

      {(rec.missingDudes?.length > 0) && (
        <div>
          <p className="text-gray-500 text-xs mb-1">Can't make it ({rec.missingDudes.length}):</p>
          <div className="flex flex-wrap gap-1">
            {rec.missingDudes.map((name) => (
              <span key={name} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 line-through">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onVote(rec, true)}
          className="flex-1 text-xs bg-gray-800 hover:bg-green-900/50 border border-gray-600 hover:border-green-600 text-gray-300 hover:text-green-400 py-1.5 rounded-lg transition"
        >
          👍 Works for me {voteCount > 0 ? `(${voteCount})` : ''}
        </button>
        {!isConfirmed && (
          <button
            onClick={() => onConfirm(rec)}
            className="flex-1 text-xs bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-700 text-indigo-300 hover:text-white py-1.5 rounded-lg transition font-semibold"
          >
            🔒 Lock it in
          </button>
        )}
      </div>
    </div>
  )
}

export default function RecommendationPanel({ recommendations, loading, onRefresh, confirmedTrip, onConfirm, votes, onVote }) {
  const threeDayRecs = recommendations?.threeDay || []
  const fourDayRecs = recommendations?.fourDay || []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">🤖 AI Recommendations</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
        >
          {loading ? '⏳ Loading...' : '↻ Refresh'}
        </button>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">🤔</div>
          <p className="text-sm">Gemini is crunching the calendars...</p>
        </div>
      )}

      {!loading && threeDayRecs.length === 0 && fourDayRecs.length === 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm">Not enough availability data yet.</p>
          <p className="text-gray-500 text-xs mt-1">More dudes need to add their dates.</p>
        </div>
      )}

      {threeDayRecs.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-gray-300 font-semibold text-sm">3-Day Trips</h3>
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
        </div>
      )}

      {fourDayRecs.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-gray-300 font-semibold text-sm">4-Day Trips</h3>
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
        </div>
      )}
    </div>
  )
}
