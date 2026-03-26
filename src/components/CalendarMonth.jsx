import { DUDES, DUDE_COLORS } from '../lib/constants'
import { getDatesInMonth, firstDayOfMonth, daysInMonth, DAY_NAMES, MONTH_NAMES, toDateStr } from '../lib/dates'

export default function CalendarMonth({ year, month, dudesData, currentDudeId, recommendations, onToggleDate }) {
  const firstDay = firstDayOfMonth(year, month)
  const totalDays = daysInMonth(year, month)
  const today = toDateStr(new Date())

  // Flatten all recommendation date ranges into a set
  const recDateMap = {}
  const allRecs = [...(recommendations?.threeDay || []), ...(recommendations?.fourDay || [])]
  allRecs.forEach((rec) => {
    const start = new Date(rec.start + 'T12:00:00')
    const end = new Date(rec.end + 'T12:00:00')
    const cur = new Date(start)
    while (cur <= end) {
      const ds = toDateStr(cur)
      if (!recDateMap[ds]) recDateMap[ds] = []
      recDateMap[ds].push(rec)
      cur.setDate(cur.getDate() + 1)
    }
  })

  function getDateInfo(dateStr) {
    const available = []
    const unavailable = []
    DUDES.forEach(({ id }) => {
      const avail = dudesData?.[id]?.availability || {}
      if (avail[dateStr] === 'available') available.push(id)
      else if (avail[dateStr] === 'unavailable') unavailable.push(id)
    })
    return { available, unavailable }
  }

  const cells = []
  // Leading empty cells
  for (let i = 0; i < firstDay; i++) cells.push(null)
  // Day cells
  for (let d = 1; d <= totalDays; d++) {
    cells.push(d)
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="bg-gray-800 px-4 py-3">
        <h3 className="text-white font-semibold text-sm">{MONTH_NAMES[month]} {year}</h3>
      </div>
      <div className="grid grid-cols-7 border-b border-gray-700">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-gray-500 text-xs text-center py-2 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="border-r border-b border-gray-800 min-h-16" />

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const { available, unavailable } = getDateInfo(dateStr)
          const isToday = dateStr === today
          const recs = recDateMap[dateStr] || []
          const hasRec = recs.length > 0
          const isMyDate = currentDudeId && dudesData?.[currentDudeId]?.availability?.[dateStr] === 'available'
          const isMyUnavail = currentDudeId && dudesData?.[currentDudeId]?.availability?.[dateStr] === 'unavailable'

          // Check if this date is inside a top recommendation window
          const topRec = recs.find((r) => r.score >= 0.6)

          return (
            <div
              key={dateStr}
              onClick={() => currentDudeId && onToggleDate(dateStr)}
              className={[
                'border-r border-b border-gray-800 min-h-16 p-1 relative',
                currentDudeId ? 'cursor-pointer hover:bg-gray-800/50' : '',
                isToday ? 'ring-1 ring-inset ring-indigo-500' : '',
                topRec ? 'bg-indigo-950/40' : '',
              ].join(' ')}
            >
              {/* Recommendation glow */}
              {topRec && (
                <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
              )}

              {/* Day number */}
              <div className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                isToday ? 'bg-indigo-600 text-white' : 'text-gray-400'
              }`}>
                {day}
              </div>

              {/* Available dude dots */}
              {available.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mb-0.5">
                  {available.map((id) => (
                    <div
                      key={id}
                      title={DUDES.find((d) => d.id === id)?.label}
                      className={`w-2 h-2 rounded-full ${DUDE_COLORS[id].dot}`}
                    />
                  ))}
                </div>
              )}

              {/* Unavailable X marks */}
              {unavailable.length > 0 && (
                <div className="flex flex-wrap gap-0.5">
                  {unavailable.map((id) => (
                    <div
                      key={id}
                      title={`${DUDES.find((d) => d.id === id)?.label} unavailable`}
                      className={`w-2 h-2 rounded-sm ${DUDE_COLORS[id].dot} opacity-30`}
                      style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 60% 50%, 100% 80%, 80% 100%, 50% 60%, 20% 100%, 0% 80%, 40% 50%, 0% 20%)' }}
                    />
                  ))}
                </div>
              )}

              {/* Rec badge */}
              {topRec && (
                <div className="absolute bottom-0.5 right-0.5 text-indigo-400 text-xs">✦</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
