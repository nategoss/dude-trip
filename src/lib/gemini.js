const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`

async function callGemini(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gemini error ${res.status}: ${err?.error?.message || res.statusText}`)
  }
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
  return JSON.parse(cleaned)
}

/**
 * Parse a natural language availability message into structured date data.
 * Returns { interpretation: string, availability: { "YYYY-MM-DD": "available"|"unavailable" } }
 */
export async function parseAvailability(name, message, year) {
  const prompt = `You are helping schedule a group trip. Parse this person's availability for ${year}.

Person: ${name}
Message: "${message}"

Return ONLY valid JSON (no markdown) in this exact shape:
{
  "interpretation": "A friendly 1-2 sentence summary of what they said",
  "availability": {
    "YYYY-MM-DD": "available"
  }
}

Rules:
- CRITICAL: Exclusions override everything. Any date mentioned as unavailable, excluded, or "outside of" must NEVER appear in the availability map.
- When someone says "open in [month] except [dates]" — include ONLY dates in that month that are NOT in the excluded range
- When someone says "outside of [date range]" — do NOT include any dates within that range
- Only include dates from ${year}
- Only mark dates as "available" — omit any date that is unavailable, uncertain, or not mentioned
- A "weekend" for this group spans Thursday through Monday — always include Thu, Fri, Sat, Sun, Mon
- Never include Tuesday or Wednesday unless explicitly stated
- Double-check your output: if a date falls within an exclusion window the person described, remove it`

  return callGemini(prompt)
}

/**
 * Analyze all dudes' availability and recommend best 3-day and 4-day trip windows.
 * Returns { threeDay: [{start, end, score, availableDudes, note}], fourDay: [...] }
 */
export async function getRecommendations(dudesAvailability, year, location) {
  const summary = Object.entries(dudesAvailability)
    .map(([name, data]) => {
      const dates = Object.keys(data.availability || {}).sort()
      return `${name}: available on ${dates.length > 0 ? dates.join(', ') : 'no dates set yet'}`
    })
    .join('\n')

  const locationContext = location
    ? `The group is considering going to: ${location}. Factor in the best time of year to visit this destination when scoring windows. If it is a warm/hot destination (beach, desert, tropical), late fall or winter windows are acceptable. Otherwise, strongly prefer June–October.`
    : `No destination set yet. Strongly prefer June–October windows as the group rarely travels outside that range.`

  const prompt = `You are scheduling a group weekend trip for ${year}. Find the best trip windows.

Dude availability (dates each person IS available):
${summary}

${locationContext}

Find the top 3 windows for each trip length where the MOST people are available for ALL consecutive days.

Return ONLY valid JSON (no markdown):
{
  "threeDay": [
    {
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD",
      "score": 0.95,
      "availableDudes": ["Nate", "Buff", "Russ"],
      "missingDudes": ["Blitz", "Hawk", "Tim"],
      "note": "Short friendly note about why this is great or a tradeoff"
    }
  ],
  "fourDay": [
    { "start": "...", "end": "...", "score": 0.9, "availableDudes": [...], "missingDudes": [...], "note": "..." }
  ]
}

Rules:
- Trips happen over a weekend span: Thursday through Monday only. Never suggest midweek-only windows.
- Valid 3-day windows: Thu–Sat, Fri–Sun, Sat–Mon
- Valid 4-day windows: Thu–Sun, Fri–Mon
- score is a 0-1 float where 1.0 = all 6 dudes available AND ideal travel season for the destination
- rank by score descending
- only suggest dates in ${year}
- prefer windows where at least 4 of 6 dudes are available`

  return callGemini(prompt)
}
