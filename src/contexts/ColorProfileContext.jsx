import { createContext, useContext, useState } from 'react'
import { COLOR_PROFILES, DUDE_SHAPES, SHAPE_STYLES } from '../lib/colorProfiles'

const ColorProfileContext = createContext(null)

export function ColorProfileProvider({ children }) {
  const [profileId, setProfileId] = useState(
    () => localStorage.getItem('dt_colorProfile') || 'default'
  )
  const [shapeMode, setShapeModeState] = useState(
    () => localStorage.getItem('dt_shapeMode') === '1'
  )

  const profile = COLOR_PROFILES[profileId] || COLOR_PROFILES.default

  function setProfile(id) {
    setProfileId(id)
    localStorage.setItem('dt_colorProfile', id)
  }

  function setShapeMode(val) {
    setShapeModeState(val)
    localStorage.setItem('dt_shapeMode', val ? '1' : '0')
  }

  function getDudeColor(dudeId) {
    return profile.colors[dudeId] || '#888888'
  }

  // Returns inline style object for a calendar dot
  function getDotStyle(dudeId) {
    const color = getDudeColor(dudeId)
    if (!shapeMode) return { backgroundColor: color, borderRadius: '50%' }
    const shape = DUDE_SHAPES[dudeId] || 'circle'
    return { backgroundColor: color, ...SHAPE_STYLES[shape] }
  }

  // Size class for dots — slightly larger in shape mode so shapes are distinguishable
  const dotSizeClass = shapeMode ? 'w-3 h-3' : 'w-2 h-2'

  return (
    <ColorProfileContext.Provider value={{
      profileId,
      profile,
      shapeMode,
      setProfile,
      setShapeMode,
      getDudeColor,
      getDotStyle,
      dotSizeClass,
    }}>
      {children}
    </ColorProfileContext.Provider>
  )
}

export function useColorProfile() {
  const ctx = useContext(ColorProfileContext)
  if (!ctx) throw new Error('useColorProfile must be used within ColorProfileProvider')
  return ctx
}
