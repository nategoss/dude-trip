// Color profiles optimized for different types of color vision deficiency.
// Most common: deuteranopia (~5% males), protanopia (~2% males) — both cause red-green confusion.
// Tritanopia (blue-yellow) is rare. High Contrast boosts brightness for all.

export const DUDE_SHAPES = {
  buff:  'circle',
  blitz: 'square',
  hawk:  'diamond',
  nate:  'triangle',
  russ:  'hexagon',
  tim:   'plus',
}

export const SHAPE_STYLES = {
  circle:   { borderRadius: '50%' },
  square:   { borderRadius: '2px' },
  diamond:  { borderRadius: '2px', transform: 'rotate(45deg)' },
  triangle: { clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', borderRadius: '0' },
  hexagon:  { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', borderRadius: '0' },
  plus:     { clipPath: 'polygon(35% 0%,65% 0%,65% 35%,100% 35%,100% 65%,65% 65%,65% 100%,35% 100%,35% 65%,0% 65%,0% 35%,35% 35%)', borderRadius: '0' },
}

export const COLOR_PROFILES = {
  default: {
    id: 'default',
    label: 'Default',
    description: 'Standard colors',
    colors: {
      buff:  '#60a5fa',  // blue-400
      blitz: '#facc15',  // yellow-400
      hawk:  '#4ade80',  // green-400
      nate:  '#f87171',  // red-400
      russ:  '#c084fc',  // purple-400
      tim:   '#fb923c',  // orange-400
    },
  },
  deuteranopia: {
    id: 'deuteranopia',
    label: 'Deuteranopia',
    description: 'Red-green (missing green cones) — most common',
    // Green and red appear similar (yellowish-brown). Replace with cyan + pink.
    colors: {
      buff:  '#60a5fa',  // blue — safe
      blitz: '#facc15',  // yellow — safe
      hawk:  '#22d3ee',  // cyan — replaces green
      nate:  '#f472b6',  // pink — replaces red
      russ:  '#c084fc',  // purple — safe
      tim:   '#fb923c',  // orange — safe
    },
  },
  protanopia: {
    id: 'protanopia',
    label: 'Protanopia',
    description: 'Red-green (missing red cones)',
    // Red appears very dark; green and red are confused. Replace both.
    colors: {
      buff:  '#60a5fa',  // blue — safe
      blitz: '#facc15',  // yellow — safe
      hawk:  '#2dd4bf',  // teal — replaces green
      nate:  '#e879f9',  // fuchsia — replaces red (brighter than pink; visible without red cones)
      russ:  '#c084fc',  // purple — safe
      tim:   '#fb923c',  // orange — safe
    },
  },
  tritanopia: {
    id: 'Tritanopia',
    label: 'Tritanopia',
    description: 'Blue-yellow (missing blue cones) — rare',
    // Blue appears greenish; yellow appears gray. Replace both.
    colors: {
      buff:  '#ef4444',  // red — replaces blue
      blitz: '#ec4899',  // pink — replaces yellow
      hawk:  '#4ade80',  // green — safe
      nate:  '#f97316',  // orange — replaces original red (buff now holds red)
      russ:  '#06b6d4',  // cyan — replaces purple (purple looks reddish to tritanopes)
      tim:   '#84cc16',  // lime — replaces orange (nate now holds orange)
    },
  },
  highContrast: {
    id: 'highContrast',
    label: 'High Contrast',
    description: 'Maximum brightness and distinction',
    colors: {
      buff:  '#93c5fd',  // blue-300
      blitz: '#fef08a',  // yellow-200
      hawk:  '#86efac',  // green-300
      nate:  '#fca5a5',  // red-300
      russ:  '#d8b4fe',  // purple-300
      tim:   '#fed7aa',  // orange-200
    },
  },
}
