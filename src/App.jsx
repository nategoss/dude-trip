import { useState, useEffect } from 'react'
import { ref, onValue, set, update } from 'firebase/database'
import { db } from './lib/firebase'
import { getRecommendations } from './lib/gemini'
import PasswordGate from './components/PasswordGate'
import DudeSelect from './components/DudeSelect'
import AvailabilityChat from './components/AvailabilityChat'
import CalendarView from './components/CalendarView'
import { ColorProfileProvider } from './contexts/ColorProfileContext'

const YEAR = new Date().getFullYear()

const VIEWS = {
  PASSWORD: 'password',
  SELECT: 'select',
  CHAT: 'chat',
  CALENDAR: 'calendar',
}

function isAuthed() {
  return sessionStorage.getItem('dt_auth') === '1'
}

export default function App() {
  const [view, setView] = useState(isAuthed() ? VIEWS.SELECT : VIEWS.PASSWORD)
  const [currentDudeId, setCurrentDudeId] = useState(
    () => localStorage.getItem('dt_dude') || null
  )
  const [dudesData, setDudesData] = useState({})
  const [recommendations, setRecommendations] = useState(null)
  const [recsLoading, setRecsLoading] = useState(false)
  const [confirmedTrip, setConfirmedTrip] = useState(null)
  const [votes, setVotes] = useState({})
  const [location, setLocation] = useState('')
  const [fbReady, setFbReady] = useState(false)

  // Subscribe to Firebase once authed
  useEffect(() => {
    if (!isAuthed()) return
    const tripRef = ref(db, `trips/${YEAR}`)
    const unsub = onValue(tripRef, (snapshot) => {
      const data = snapshot.val() || {}
      setDudesData(data.dudes || {})
      setRecommendations(data.recommendations || null)
      setConfirmedTrip(data.confirmedTrip || null)
      setVotes(data.votes || {})
      setLocation(data.location || '')
      setFbReady(true)
    })
    return () => unsub()
  }, [view === VIEWS.SELECT || view === VIEWS.CHAT || view === VIEWS.CALENDAR])

  function handleUnlock() {
    setView(VIEWS.SELECT)
  }

  function handleSelectDude(dudeId) {
    setCurrentDudeId(dudeId)
    localStorage.setItem('dt_dude', dudeId)
    setView(VIEWS.CHAT)
  }

  async function handleSaveAvailability(newAvailability) {
    if (!currentDudeId) return
    const existing = dudesData?.[currentDudeId]?.availability || {}
    const merged = { ...existing, ...newAvailability }
    await update(ref(db, `trips/${YEAR}/dudes/${currentDudeId}`), {
      availability: merged,
      lastUpdated: new Date().toISOString(),
    })
  }

  async function handleToggleDate(dateStr) {
    if (!currentDudeId) return
    const existing = dudesData?.[currentDudeId]?.availability || {}
    const current = existing[dateStr]
    const updated = { ...existing }

    if (current === 'available') {
      updated[dateStr] = 'unavailable'
    } else if (current === 'unavailable') {
      delete updated[dateStr]
    } else {
      updated[dateStr] = 'available'
    }

    await update(ref(db, `trips/${YEAR}/dudes/${currentDudeId}`), {
      availability: updated,
      lastUpdated: new Date().toISOString(),
    })
  }

  async function handleSaveLocation(newLocation) {
    setLocation(newLocation)
    await set(ref(db, `trips/${YEAR}/location`), newLocation)
  }

  async function handleRefreshRecs() {
    setRecsLoading(true)
    try {
      const recs = await getRecommendations(dudesData, YEAR, location)
      await set(ref(db, `trips/${YEAR}/recommendations`), recs)
    } catch (e) {
      console.error('Recs failed:', e)
    } finally {
      setRecsLoading(false)
    }
  }

  async function handleConfirmTrip(rec) {
    await set(ref(db, `trips/${YEAR}/confirmedTrip`), {
      start: rec.start,
      end: rec.end,
      confirmedBy: currentDudeId,
      confirmedAt: new Date().toISOString(),
    })
  }

  async function handleVote(rec, isUp) {
    if (!currentDudeId) return
    await set(ref(db, `trips/${YEAR}/votes/${rec.start}/${currentDudeId}`), isUp)
  }

  const content = (() => {
    if (view === VIEWS.PASSWORD) return <PasswordGate onUnlock={handleUnlock} />
    if (view === VIEWS.SELECT) return (
      <DudeSelect
        dudesData={dudesData}
        onSelect={handleSelectDude}
        onViewCalendar={() => setView(VIEWS.CALENDAR)}
      />
    )
    if (view === VIEWS.CHAT) return (
      <AvailabilityChat
        dudeId={currentDudeId}
        year={YEAR}
        currentAvailability={dudesData?.[currentDudeId]?.availability || {}}
        onSave={handleSaveAvailability}
        onViewCalendar={() => setView(VIEWS.CALENDAR)}
      />
    )
    if (view === VIEWS.CALENDAR) return (
      <CalendarView
        year={YEAR}
        dudesData={dudesData}
        currentDudeId={currentDudeId}
        recommendations={recommendations}
        recsLoading={recsLoading}
        confirmedTrip={confirmedTrip}
        votes={votes}
        location={location}
        onToggleDate={handleToggleDate}
        onRefreshRecs={handleRefreshRecs}
        onConfirmTrip={handleConfirmTrip}
        onVote={handleVote}
        onSwitchDude={() => setView(VIEWS.SELECT)}
        onGoToChat={() => setView(VIEWS.CHAT)}
        onSaveLocation={handleSaveLocation}
      />
    )
    return null
  })()

  return <ColorProfileProvider>{content}</ColorProfileProvider>
}
