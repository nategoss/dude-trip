const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

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
- Only include dates that are explicitly mentioned or clearly implied
- For "weekends" include Friday, Saturday, Sunday of those weekends
- For "last two weekends in July ${year}" expand to all three days of each weekend
- For "open in September/October" include all Fridays, Saturdays, Sundays in those months
- For "not at all in August" do NOT include any August dates as available
- Only include dates from ${year}
- Only mark dates as "available" (omit unavailable ones — the calendar handles that separately)
- Focus on weekend dates (Fri/Sat/Sun) unless the person specifies weekdays`

  return callGemini(prompt)
}

/**
 * Analyze all dudes' availability and recommend best 3-day and 4-day trip windows.
 * Returns { threeDay: [{start, end, score, availableDudes, note}], fourDay: [...] }
 */
export async function getRecommendations(dudesAvailability, year) {
  const summary = Object.entries(dudesAvailability)
    .map(([name, data]) => {
      const dates = Object.keys(data.availability || {}).sort()
      return `${name}: available on ${dates.length > 0 ? dates.join(', ') : 'no dates set yet'}`
    })
    .join('\n')

  const prompt = `You are scheduling a group trip for ${year}. Find the best trip windows.

Dude availability (these are the dates each person IS available):
${summary}

Find the top 3 windows for each trip length where the MOST people are available for ALL consecutive days in the window.

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
- "threeDay" windows are exactly 3 consecutive days (e.g. Fri-Sun or Sat-Mon)
- "fourDay" windows are exactly 4 consecutive days (e.g. Thu-Sun or Fri-Mon)
- score is a 0-1 float where 1.0 = all 6 dudes available
- rank by score descending
- only suggest dates in ${year}
- prefer windows where at least 4 of 6 dudes are available`

  return callGemini(prompt)
}
