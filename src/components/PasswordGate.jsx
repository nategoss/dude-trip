import { useState } from 'react'

const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD

export default function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (input === APP_PASSWORD) {
      sessionStorage.setItem('dt_auth', '1')
      onUnlock()
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="text-5xl">🏕️</div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dude Trip</h1>
        <p className="text-gray-400 text-sm text-center">Dudes only. Enter the password.</p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false) }}
            placeholder="Password"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm text-center">Wrong password, dude.</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition"
          >
            Let's go
          </button>
        </form>
      </div>
    </div>
  )
}
