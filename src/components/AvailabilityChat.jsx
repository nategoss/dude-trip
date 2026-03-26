import { useState } from 'react'
import { parseAvailability } from '../lib/gemini'
import { DUDES, DUDE_COLORS } from '../lib/constants'

export default function AvailabilityChat({ dudeId, year, currentAvailability, onSave, onViewCalendar }) {
  const dude = DUDES.find((d) => d.id === dudeId)
  const colors = DUDE_COLORS[dudeId]

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
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
      setPreview(result)
    } catch (e) {
      setError(`Gemini error: ${e.message}. Try again.`)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function handleSave() {
    if (!preview) return
    onSave(preview.availability)
    setSaved(true)
    setPreview(null)
    setMessage('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleParse()
    }
  }

  const previewDates = preview ? Object.keys(preview.availability).sort() : []

  return (
    <div className="min-h-screen bg-gray-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-lg flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{dude.emoji}</span>
          <div>
            <h2 className="text-2xl font-bold text-white">{dude.label}'s Availability</h2>
            <p className="text-gray-400 text-sm">{year} trip planning</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={onViewCalendar}
              className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition"
            >
              📅 Calendar
            </button>
          </div>
        </div>

        {/* Current status */}
        {dateCount > 0 && (
          <div className={`bg-gray-900 border border-gray-700 rounded-xl p-4`}>
            <p className="text-gray-400 text-sm">
              You currently have <span className={`font-semibold ${colors.text}`}>{dateCount} available dates</span> set for {year}.
              Submitting new dates will <span className="text-yellow-400">merge</span> with your existing ones.
            </p>
          </div>
        )}

        {/* Chat input */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-4">
          <p className="text-gray-300 text-sm">
            Tell me when you can make it in plain English. Be as specific or vague as you want.
          </p>
          <div className="bg-gray-800 rounded-lg p-3 text-gray-500 text-xs italic">
            e.g. "I can do the last two weekends in July, I'm completely out in August, and September/October I'm wide open."
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Hey ${dude.label}, when can you make it?`}
            rows={4}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none text-sm"
          />
          <button
            onClick={handleParse}
            disabled={loading || !message.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-2.5 rounded-lg transition text-sm"
          >
            {loading ? '🤔 Thinking...' : '✨ Parse with AI'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-4">
            <div>
              <p className="text-white font-semibold text-sm mb-1">Gemini understood:</p>
              <p className="text-gray-300 text-sm italic">"{preview.interpretation}"</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-2">Dates it will mark as available ({previewDates.length}):</p>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {previewDates.map((d) => (
                  <span
                    key={d}
                    className={`text-xs px-2 py-0.5 rounded-full bg-gray-800 ${colors.text} border border-gray-700`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 rounded-lg transition text-sm"
              >
                ✅ Looks good, save it
              </button>
              <button
                onClick={() => setPreview(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2.5 rounded-lg transition text-sm"
              >
                ✏️ Re-word it
              </button>
            </div>
          </div>
        )}

        {/* Saved confirmation */}
        {saved && (
          <div className="bg-green-900/40 border border-green-700 rounded-xl p-4 text-center">
            <p className="text-green-400 font-semibold">Saved! Your availability is on the calendar.</p>
            <button onClick={onViewCalendar} className="mt-2 text-green-300 underline text-sm">
              View the group calendar →
            </button>
          </div>
        )}

        {/* Manual override note */}
        <p className="text-gray-600 text-xs text-center">
          You can also click individual days on the calendar to manually toggle your availability.
        </p>
      </div>
    </div>
  )
}
