export const chartColorPalettes = {
  'premium-dark': ['#d99a3d', '#7890c2', '#4c78bd', '#45a783', '#8d78ad'],
  'apple-light': ['#b77b2c', '#6b7fa8', '#3569b5', '#277d60', '#756390'],
}

export const defaultThemeValues = {
  surfaceCard: '#0f172a',
  surfaceElevated: '#111c33',
  surfaceMuted: '#0b1020',
  borderSubtle: 'rgba(148, 163, 184, 0.16)',
  borderStrong: 'rgba(148, 163, 184, 0.28)',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  accent: '#3b82f6',
  accent2: '#22d3ee',
  accentSoft: 'rgba(59, 130, 246, 0.16)',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#22d3ee',
}

function getThemeValue(name, fallback) {
  if (typeof window === 'undefined') {
    return fallback
  }

  const themeRoot = document.querySelector('.app-shell') ?? document.documentElement
  const value = getComputedStyle(themeRoot)
    .getPropertyValue(name)
    .trim()

  return value || fallback
}

export function readChartThemeValues() {
  return {
    surfaceCard: getThemeValue('--surface-card', defaultThemeValues.surfaceCard),
    surfaceElevated: getThemeValue(
      '--surface-elevated',
      defaultThemeValues.surfaceElevated
    ),
    surfaceMuted: getThemeValue(
      '--surface-muted',
      defaultThemeValues.surfaceMuted
    ),
    borderSubtle: getThemeValue(
      '--border-subtle',
      defaultThemeValues.borderSubtle
    ),
    borderStrong: getThemeValue(
      '--border-strong',
      defaultThemeValues.borderStrong
    ),
    textPrimary: getThemeValue('--text-primary', defaultThemeValues.textPrimary),
    textSecondary: getThemeValue(
      '--text-secondary',
      defaultThemeValues.textSecondary
    ),
    textMuted: getThemeValue('--text-muted', defaultThemeValues.textMuted),
    accent: getThemeValue('--accent-blue', defaultThemeValues.accent),
    accent2: getThemeValue('--accent-cyan', defaultThemeValues.accent2),
    accentSoft: getThemeValue('--accent-soft', defaultThemeValues.accentSoft),
    success: getThemeValue('--positive', defaultThemeValues.success),
    danger: getThemeValue('--negative', defaultThemeValues.danger),
    warning: getThemeValue('--warning', defaultThemeValues.warning),
    info: getThemeValue('--accent-cyan', defaultThemeValues.info),
  }
}

export function withAlpha(color, alpha) {
  const normalizedColor = color.trim()

  if (normalizedColor.startsWith('#')) {
    const hex = normalizedColor.slice(1)
    const expandedHex =
      hex.length === 3
        ? hex
            .split('')
            .map((char) => char + char)
            .join('')
        : hex

    const red = parseInt(expandedHex.slice(0, 2), 16)
    const green = parseInt(expandedHex.slice(2, 4), 16)
    const blue = parseInt(expandedHex.slice(4, 6), 16)

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
  }

  const rgbMatch = normalizedColor.match(/^rgba?\(([^)]+)\)$/)

  if (rgbMatch) {
    const [red, green, blue] = rgbMatch[1]
      .split(',')
      .map((part) => part.trim())

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
  }

  return normalizedColor
}
