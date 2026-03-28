import { DUDES } from '../lib/constants'
import { firstDayOfMonth, daysInMonth, DAY_NAMES, MONTH_NAMES, toDateStr } from '../lib/dates'
import { useColorProfile } from '../contexts/ColorProfileContext'

export default function CalendarMonth({ year, month, dudesData, currentDudeId, recommendations, onToggleDate }) {
  const { getDotStyle, dotSizeClass } = useColorProfile()
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

  function buildCellAriaLabel(day, dateStr, available, unavailable, isToday, topRec) {
    const parts = []
    const dateObj = new Date(dateStr + 'T12:00:00')
    const formatted = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    parts.push(formatted)
    if (isToday) parts.push('Today')
    if (available.length > 0) {
      const names = available.map((id) => DUDES.find((d) => d.id === id)?.label).join(', ')
      parts.push(`Available: ${names}`)
    }
    if (unavailable.length > 0) {
      const names = unavailable.map((id) => DUDES.find((d) => d.id === id)?.label).join(', ')
      parts.push(`Unavailable: ${names}`)
    }
    if (topRec) parts.push('Recommended trip window')
    if (currentDudeId) {
      const myStatus = dudesData?.[currentDudeId]?.availability?.[dateStr]
      parts.push(myStatus === 'available' ? 'You: available — click to mark unavailable'
                : myStatus === 'unavailable' ? 'You: unavailable — click to clear'
                : 'Click to mark yourself available')
    }
    return parts.join('. ')
  }

  // Build rows of 7 cells for proper grid semantics
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)
  // Pad last row to complete 7-col grid
  while (cells.length % 7 !== 0) cells.push(null)

  const rows = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="bg-gray-800 px-4 py-3">
        <h3 className="text-white font-semibold text-sm" id={`month-label-${year}-${month}`}>
          {MONTH_NAMES[month]} {year}
        </h3>
      </div>

      <table
        role="grid"
        aria-labelledby={`month-label-${year}-${month}`}
        className="w-full border-collapse"
      >
        <thead>
          <tr role="row">
            {DAY_NAMES.map((d) => (
              <th
                key={d}
                role="columnheader"
                scope="col"
                abbr={d}
                className="text-gray-500 text-xs text-center py-2 font-medium border-b border-gray-700 w-[14.28%]"
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} role="row">
              {row.map((day, ci) => {
                if (!day) {
                  return (
                    <td
                      key={`empty-${ri}-${ci}`}
                      role="gridcell"
                      aria-hidden="true"
                      className="border-r border-b border-gray-800 min-h-16 p-1"
                    />
                  )
                }

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const { available, unavailable } = getDateInfo(dateStr)
                const isToday = dateStr === today
                const recs = recDateMap[dateStr] || []
                const topRec = recs.find((r) => r.score >= 0.6)
                const isInteractive = !!currentDudeId

                function handleActivate(e) {
                  if (!isInteractive) return
                  if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return
                  if (e.type === 'keydown') e.preventDefault()
                  onToggleDate(dateStr)
                }

                return (
                  <td
                    key={dateStr}
                    role="gridcell"
                    aria-label={buildCellAriaLabel(day, dateStr, available, unavailable, isToday, topRec)}
                    tabIndex={isInteractive ? 0 : -1}
                    onClick={isInteractive ? handleActivate : undefined}
                    onKeyDown={isInteractive ? handleActivate : undefined}
                    className={[
                      'border-r border-b border-gray-800 min-h-16 p-1 relative',
                      isInteractive ? 'cursor-pointer hover:bg-gray-800/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 focus-visible:outline-none' : '',
                      isToday ? 'ring-1 ring-inset ring-indigo-500' : '',
                      topRec ? 'bg-indigo-950/40' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {/* Recommendation glow */}
                    {topRec && (
                      <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" aria-hidden="true" />
                    )}

                    {/* Day number */}
                    <div
                      className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-indigo-600 text-white' : 'text-gray-400'
                      }`}
                      aria-hidden="true"
                    >
                      {day}
                    </div>

                    {/* Available dude dots */}
                    {available.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mb-0.5" aria-hidden="true">
                        {available.map((id) => {
                          const dude = DUDES.find((d) => d.id === id)
                          return (
                            <div
                              key={id}
                              className={dotSizeClass}
                              style={getDotStyle(id)}
                              title={dude?.label}
                            />
                          )
                        })}
                      </div>
                    )}

                    {/* Unavailable X marks */}
                    {unavailable.length > 0 && (
                      <div className="flex flex-wrap gap-0.5" aria-hidden="true">
                        {unavailable.map((id) => {
                          const dude = DUDES.find((d) => d.id === id)
                          return (
                            <div
                              key={id}
                              className={`${dotSizeClass} opacity-30`}
                              style={{
                                ...getDotStyle(id),
                                clipPath: 'polygon(20% 0%,80% 0%,100% 20%,60% 50%,100% 80%,80% 100%,50% 60%,20% 100%,0% 80%,40% 50%,0% 20%)',
                                borderRadius: '0',
                              }}
                              title={`${dude?.label} unavailable`}
                            />
                          )
                        })}
                      </div>
                    )}

                    {/* Rec badge */}
                    {topRec && (
                      <div className="absolute bottom-0.5 right-0.5 text-indigo-400 text-xs" aria-hidden="true">✦</div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
