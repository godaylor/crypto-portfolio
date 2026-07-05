export const chartColorPalettes = {
  'dark-modern': ['#ff9f1a', '#6380f6', '#21d6a3', '#3b82f6', '#14f195'],
  'dark-glass': ['#ffb020', '#6d5dfc', '#2ed3aa', '#38c6ff', '#8b5cf6'],
  'light-modern': ['#ff9f1a', '#4f7cff', '#16b981', '#2563eb', '#7c3aed'],
}

export const defaultThemeValues = {
  surfaceCard: '#111c30',
  surfaceElevated: '#101a2c',
  surfaceMuted: '#0b1628',
  borderSubtle: 'rgba(126, 153, 205, 0.24)',
  borderStrong: '#25344d',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#71829f',
  accent: '#3478f6',
  accent2: '#6d5dfc',
  accentSoft: 'rgba(52, 120, 246, 0.16)',
  success: '#20d486',
  danger: '#ff4d5e',
  warning: '#ff9f1a',
  info: '#39c6ff',
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
    accent: getThemeValue('--accent', defaultThemeValues.accent),
    accent2: getThemeValue('--accent-2', defaultThemeValues.accent2),
    accentSoft: getThemeValue('--accent-soft', defaultThemeValues.accentSoft),
    success: getThemeValue('--success', defaultThemeValues.success),
    danger: getThemeValue('--danger', defaultThemeValues.danger),
    warning: getThemeValue('--warning', defaultThemeValues.warning),
    info: getThemeValue('--info', defaultThemeValues.info),
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
