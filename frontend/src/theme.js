import { theme as antdTheme } from 'antd'

export const THEME_STORAGE_KEY = 'crypto-portfolio-theme'
export const DEFAULT_THEME = 'premium-dark'

export const appThemes = {
  'premium-dark': {
    label: 'Premium Dark',
    description: 'Deep, focused fintech UI',
    colorScheme: 'dark',
    algorithm: antdTheme.darkAlgorithm,
    colors: {
      primary: '#5b82d6',
      success: '#34b982',
      error: '#e45e6b',
      warning: '#d99a3d',
      info: '#6d9ee8',
      page: '#080d15',
      container: '#111925',
      elevated: '#151f2c',
      muted: '#0d1520',
      border: '#2a3748',
      borderSecondary: '#202b39',
      text: '#f3f6fa',
      textSecondary: '#aab5c4',
      textTertiary: '#7d8999',
      fill: 'rgba(126, 143, 166, 0.12)',
      mask: 'rgba(2, 6, 12, 0.68)',
    },
  },
  'apple-light': {
    label: 'Apple Light',
    description: 'Soft, calm and spacious',
    colorScheme: 'light',
    algorithm: antdTheme.defaultAlgorithm,
    colors: {
      primary: '#2864c7',
      success: '#18805a',
      error: '#d44755',
      warning: '#ad6d1a',
      info: '#2d6ebf',
      page: '#f2f4f7',
      container: '#ffffff',
      elevated: '#ffffff',
      muted: '#f5f6f8',
      border: '#d4d9e0',
      borderSecondary: '#e4e7eb',
      text: '#1d1d1f',
      textSecondary: '#5d626a',
      textTertiary: '#858b94',
      fill: 'rgba(74, 82, 94, 0.08)',
      mask: 'rgba(25, 30, 38, 0.28)',
    },
  },
}

export function isThemeName(value) {
  return Object.prototype.hasOwnProperty.call(appThemes, value)
}

export function readStoredTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeName(storedTheme) ? storedTheme : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function applyThemeToDocument(themeName) {
  if (typeof document === 'undefined') return

  const resolvedTheme = isThemeName(themeName) ? themeName : DEFAULT_THEME
  document.documentElement.dataset.theme = resolvedTheme
  document.documentElement.style.colorScheme = appThemes[resolvedTheme].colorScheme
}

export function persistTheme(themeName) {
  applyThemeToDocument(themeName)

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeName)
  } catch {
    // Theme switching still works when storage is unavailable.
  }
}

export function createAntTheme(themeName) {
  const selectedTheme = appThemes[themeName] ?? appThemes[DEFAULT_THEME]
  const { colors } = selectedTheme
  const focusShadow = `0 0 0 3px ${colors.primary}22`

  return {
    algorithm: selectedTheme.algorithm,
    hashed: false,
    token: {
      colorPrimary: colors.primary,
      colorSuccess: colors.success,
      colorError: colors.error,
      colorWarning: colors.warning,
      colorInfo: colors.info,
      colorBgBase: colors.page,
      colorBgLayout: colors.page,
      colorBgContainer: colors.container,
      colorBgElevated: colors.elevated,
      colorBgContainerDisabled: colors.muted,
      colorBorder: colors.border,
      colorBorderSecondary: colors.borderSecondary,
      colorText: colors.text,
      colorTextSecondary: colors.textSecondary,
      colorTextTertiary: colors.textTertiary,
      colorTextPlaceholder: colors.textTertiary,
      colorFillSecondary: colors.fill,
      colorBgMask: colors.mask,
      borderRadius: 12,
      borderRadiusLG: 18,
      borderRadiusSM: 9,
      controlHeight: 42,
      controlOutline: `${colors.primary}2b`,
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      boxShadow: themeName === 'premium-dark'
        ? '0 18px 54px rgba(0, 0, 0, 0.34)'
        : '0 18px 48px rgba(45, 55, 72, 0.14)',
      boxShadowSecondary: themeName === 'premium-dark'
        ? '0 12px 36px rgba(0, 0, 0, 0.28)'
        : '0 10px 32px rgba(45, 55, 72, 0.12)',
    },
    components: {
      Button: {
        controlHeight: 42,
        borderRadius: 12,
        defaultBg: colors.container,
        defaultBorderColor: colors.border,
        defaultColor: colors.text,
        defaultHoverBg: colors.muted,
        defaultHoverBorderColor: colors.primary,
        defaultHoverColor: colors.text,
        textHoverBg: colors.fill,
      },
      Card: {
        colorBgContainer: colors.container,
        colorBorderSecondary: colors.borderSecondary,
        borderRadiusLG: 18,
      },
      DatePicker: {
        colorBgContainer: colors.muted,
        colorBgElevated: colors.elevated,
        colorBorder: colors.border,
        hoverBorderColor: colors.primary,
        activeBorderColor: colors.primary,
        activeShadow: focusShadow,
      },
      Drawer: {
        colorBgElevated: colors.elevated,
        colorBgMask: colors.mask,
        colorSplit: colors.borderSecondary,
      },
      Dropdown: {
        colorBgElevated: colors.elevated,
        controlItemBgHover: colors.fill,
        controlItemBgActive: `${colors.primary}1f`,
      },
      Input: {
        colorBgContainer: colors.muted,
        colorBorder: colors.border,
        hoverBorderColor: colors.primary,
        activeBorderColor: colors.primary,
        activeShadow: focusShadow,
      },
      InputNumber: {
        controlHeight: 44,
        colorBgContainer: colors.muted,
        colorBorder: colors.border,
        hoverBorderColor: colors.primary,
        activeBorderColor: colors.primary,
        activeShadow: focusShadow,
      },
      Message: { contentBg: colors.elevated },
      Modal: {
        contentBg: colors.elevated,
        headerBg: colors.elevated,
        titleColor: colors.text,
      },
      Notification: {
        colorBgElevated: colors.elevated,
        colorTextHeading: colors.text,
        colorText: colors.textSecondary,
      },
      Popconfirm: {
        colorBgElevated: colors.elevated,
        colorTextHeading: colors.text,
      },
      Select: {
        controlHeight: 44,
        colorBgContainer: colors.muted,
        colorBgElevated: colors.elevated,
        colorBorder: colors.border,
        hoverBorderColor: colors.primary,
        activeBorderColor: colors.primary,
        activeOutlineColor: `${colors.primary}22`,
        optionActiveBg: colors.fill,
        optionSelectedBg: `${colors.primary}1f`,
        optionSelectedColor: colors.text,
      },
      Table: {
        colorBgContainer: 'transparent',
        headerBg: colors.muted,
        headerColor: colors.textSecondary,
        borderColor: colors.borderSecondary,
        rowHoverBg: colors.fill,
      },
      Tooltip: {
        colorBgSpotlight: '#252a31',
        colorTextLightSolid: '#ffffff',
      },
    },
  }
}
