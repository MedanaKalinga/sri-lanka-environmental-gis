const FALLBACK_COLORS = ['#fef3c7', '#34d399', '#0f766e']

function hexToRgb(hex) {
  const normalized = hex.replace('#', '')
  const value = Number.parseInt(normalized.length === 3
    ? normalized.split('').map((character) => character + character).join('')
    : normalized, 16)
  return {
    red: (value >> 16) & 255,
    green: (value >> 8) & 255,
    blue: value & 255,
  }
}

function toHex(value) {
  return Math.round(value).toString(16).padStart(2, '0')
}

function mix(start, end, ratio) {
  const first = hexToRgb(start)
  const second = hexToRgb(end)
  return `#${toHex(first.red + (second.red - first.red) * ratio)}${toHex(first.green + (second.green - first.green) * ratio)}${toHex(first.blue + (second.blue - first.blue) * ratio)}`
}

export function continuousColor(value, domain, colors = FALLBACK_COLORS) {
  if (!Number.isFinite(value) || !domain) return null
  const ramp = colors.length >= 2 ? colors : FALLBACK_COLORS
  const spread = domain.max - domain.min
  const ratio = spread === 0 ? 0.5 : Math.max(0, Math.min(1, (value - domain.min) / spread))
  const scaled = ratio * (ramp.length - 1)
  const index = Math.min(Math.floor(scaled), ramp.length - 2)
  return mix(ramp[index], ramp[index + 1], scaled - index)
}

export function gradientStyle(colors = FALLBACK_COLORS) {
  const ramp = colors.length >= 2 ? colors : FALLBACK_COLORS
  const stops = ramp.map((color, index) => `${color} ${(index / (ramp.length - 1)) * 100}%`)
  return { backgroundImage: `linear-gradient(to right, ${stops.join(', ')})` }
}
