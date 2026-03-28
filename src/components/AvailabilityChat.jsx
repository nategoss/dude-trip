import { useState } from 'react'
import { parseAvailability } from '../lib/gemini'
import { DUDES } from '../lib/constants'
import { useColorProfile } from '../contexts/ColorProfileContext'

export default function AvailabilityChat({ dudeId, year, currentAvailability, onSave, onViewCalendar }) {
  const dude = DUDES.find((d) => d.id === dudeId)
  const { getDudeColor } = useColorProfile()
  const color = getDudeColor(dudeId)

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [removedDates, setRemovedDates] = useState(new Set())
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const dateCount = Object.keys(currentAvailability || {}).length

  async function handleParse() {
    if (!message.trim()) return
    setLoading(true)
    setError(null)
    setPreview(null)
    setSaved(false)
    try {
      const result = await parseAvailability(dude.label, message, year)
      const filtered = Object.fromEntries(
        Object.entries(result.availability).filter(([date]) => {
          const month = parseInt(date.split('-')[1], 10)
          return month <= 10
        })
      )
      setPreview({ ...result, availability: filtered })
      setRemovedDates(new Set())
    } catch (e) {
      setError(`Gemini error: ${e.message}. Try again.`)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function handleRemoveDate(date) {
    setRemovedDates((prev) => new Set([...prev, date]))
  }

  function handleSave() {
    if (!preview) return
    const finalAvailability = Object.fromEntries(
      Object.entries(preview.availability).filter(([date]) => !removedDates.has(date))
    )
    onSave(finalAvailability)
    setSaved(true)
    setPreview(null)
    setRemovedDates(new Set())
    setMessage('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleParse()
    }
  }

  const previewAvailable = preview
    ? Object.entries(preview.availability)
        .filter(([d, v]) => v === 'available' && !removedDates.has(d))
        .map(([d]) => d).sort()
    : []
  const previewUnavailable = preview
    ? Object.entries(preview.availability)
        .filter(([d, v]) => v === 'unavailable' && !removedDates.has(d))
        .map(([d]) => d).sort()
    : []

  return (
    <div className="min-h-screen bg-gray-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-lg flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{dude.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">{dude.label}'s Availability</h1>
            <p className="text-gray-400 text-sm">{year} trip planning</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={onViewCalendar}
              aria-label="View group calendar"
              className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <span aria-hidden="true">📅</span> Calendar
            </button>
          </div>
        </div>

        {/* Current status */}
        {dateCount > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">
              You currently have{' '}
              <span className="font-semibold" style={{ color }}>{dateCount} available dates</span>{' '}
              set for {year}. Submitting new dates will{' '}
              <span className="text-yellow-400">merge</span> with your existing ones.
            </p>
          </div>
        )}

        {/* Chat input */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-4">
          <p className="text-gray-300 text-sm">
            Tell me when you can make it in plain English. Be as specific or vague as you want.
          </p>
          <div className="bg-gray-800 rounded-lg p-3 text-gray-500 text-xs italic" aria-label="Example input">
            e.g. "I can do the last two weekends in July, I'm completely out in August, and September/October I'm wide open."
          </div>
          <label htmlFor="availability-message" className="sr-only">
            Describe your availability for {year}
          </label>
          <textarea
            id="availability-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Hey ${dude.label}, when can you make it?`}
            rows={4}
            aria-describedby={error ? 'parse-error' : undefined}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none text-sm"
          />
          <button
            onClick={handleParse}
            disabled={loading || !message.trim()}
            aria-busy={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-2.5 rounded-lg transition text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            {loading ? '🤔 Thinking...' : '✨ Parse with AI'}
          </button>
          {error && (
            <p id="parse-error" role="alert" className="text-red-400 text-sm">
              {error}
            </p>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div
            className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-4"
            aria-live="polite"
            aria-label="Availability preview"
          >
            <div>
              <p className="text-white font-semibold text-sm mb-1">Gemini understood:</p>
              <p className="text-gray-300 text-sm italic">"{preview.interpretation}"</p>
            </div>
            {previewAvailable.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs mb-2">
                  Marking as available ({previewAvailable.length}) — activate to remove a date:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {previewAvailable.map((d) => (
                    <button
                      key={d}
                      onClick={() => handleRemoveDate(d)}
                      aria-label={`Remove ${d} from available dates`}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 hover:border-red-500 hover:text-red-400 transition group focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                      style={{ color }}
                    >
                      {d}
                      <span aria-hidden="true" className="opacity-40 group-hover:opacity-100">✕</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {previewUnavailable.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs mb-2">
                  Marking as unavailable ({previewUnavailable.length}) — overwrites existing:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {previewUnavailable.map((d) => (
                    <button
                      key={d}
                      onClick={() => handleRemoveDate(d)}
                      aria-label={`Remove ${d} from unavailable dates`}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-800 text-red-400 border border-gray-700 hover:border-red-500 line-through transition group focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    >
                      {d}
                      <span aria-hidden="true" className="opacity-40 group-hover:opacity-100">✕</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 rounded-lg transition text-sm focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none"
              >
                ✅ Looks good, save it
              </button>
              <button
                onClick={() => setPreview(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2.5 rounded-lg transition text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                ✏️ Re-word it
              </button>
            </div>
          </div>
        )}

        {/* Saved confirmation */}
        {saved && (
          <div
            className="bg-green-900/40 border border-green-700 rounded-xl p-4 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-green-400 font-semibold">Saved! Your availability is on the calendar.</p>
            <button
              onClick={onViewCalendar}
              className="mt-2 text-green-300 underline text-sm focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none rounded"
            >
              View the group calendar →
            </button>
          </div>
        )}

        <p className="text-gray-500 text-xs text-center">
          You can also click individual days on the calendar to manually toggle your availability.
        </p>
      </div>
    </div>
  )
}
