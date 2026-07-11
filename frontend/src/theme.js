import { theme as antdTheme } from 'antd'

export const THEME_STORAGE_KEY = 'crypto-portfolio-theme'
export const DEFAULT_THEME = 'premium-dark'

export const appThemes = {
  'premium-dark': {
    label: 'Премиум тёмная',
    description: 'Глубокая и сдержанная fintech-тема',
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
    description: 'Чистая светлая тема с мягкими поверхностями',
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
  'blue-fintech': {
    label: 'Blue Fintech',
    description: 'Тёмно-синяя крипто-тема с холодными акцентами',
    colorScheme: 'dark',
    algorithm: antdTheme.darkAlgorithm,
    colors: {
      primary: '#377ef2',
      success: '#2fbf8f',
      error: '#ee6273',
      warning: '#e0a044',
      info: '#2bc7e6',
      page: '#07111f',
      container: '#0d1b2d',
      elevated: '#11253b',
      muted: '#091625',
      border: '#294767',
      borderSecondary: '#1c344e',
      text: '#f2f7fd',
      textSecondary: '#a9bdd4',
      textTertiary: '#7890aa',
      fill: 'rgba(67, 128, 202, 0.14)',
      mask: 'rgba(2, 8, 17, 0.7)',
    },
  },
  'dark-glass': {
    label: 'Dark Glass',
    description: 'Тёмное стекло с умеренным blur и глубиной',
    colorScheme: 'dark',
    algorithm: antdTheme.darkAlgorithm,
    colors: {
      primary: '#776ce8',
      success: '#36bc8c',
      error: '#ed6679',
      warning: '#dca14c',
      info: '#50b9d5',
      page: '#080a14',
      container: '#111629',
      elevated: '#171d33',
      muted: '#0d1120',
      border: '#343b59',
      borderSecondary: '#272e48',
      text: '#f3f4fb',
      textSecondary: '#b5bad0',
      textTertiary: '#858ca8',
      fill: 'rgba(130, 126, 198, 0.14)',
      mask: 'rgba(3, 5, 12, 0.7)',
    },
  },
  'chatgpt-dark': {
    label: 'ChatGPT Dark',
    description: 'Спокойная графитовая тема для комфортного чтения',
    colorScheme: 'dark',
    algorithm: antdTheme.darkAlgorithm,
    colors: {
      primary: '#10a37f',
      success: '#35b889',
      error: '#e2656f',
      warning: '#cf9746',
      info: '#6f9f91',
      page: '#171717',
      container: '#212121',
      elevated: '#2a2a2a',
      muted: '#1c1c1c',
      border: '#3b3b3b',
      borderSecondary: '#303030',
      text: '#ececec',
      textSecondary: '#b4b4b4',
      textTertiary: '#858585',
      fill: 'rgba(160, 160, 160, 0.1)',
      mask: 'rgba(0, 0, 0, 0.68)',
    },
  },
  'mocha-code': {
    label: 'Mocha Code',
    description: 'Тёплая mocha-тема в стиле premium developer tool',
    colorScheme: 'dark',
    algorithm: antdTheme.darkAlgorithm,
    colors: {
      primary: '#c98252',
      success: '#8eaf78',
      error: '#db6d69',
      warning: '#d49a57',
      info: '#d4a574',
      page: '#17130f',
      container: '#221c17',
      elevated: '#2b231d',
      muted: '#1b1612',
      border: '#493a2e',
      borderSecondary: '#382d24',
      text: '#f2e8dc',
      textSecondary: '#c2b2a2',
      textTertiary: '#918173',
      fill: 'rgba(194, 155, 116, 0.12)',
      mask: 'rgba(10, 7, 5, 0.7)',
    },
  },
  'ios-glass': {
    label: 'iOS Glass',
    description: 'Светлое матовое стекло с мягкой глубиной',
    colorScheme: 'light',
    algorithm: antdTheme.defaultAlgorithm,
    colors: {
      primary: '#3478f6',
      success: '#24845f',
      error: '#d84d5c',
      warning: '#ad711d',
      info: '#4f8fc8',
      page: '#eaf1f7',
      container: '#f9fbfd',
      elevated: '#ffffff',
      muted: '#eef3f7',
      border: '#ccd8e2',
      borderSecondary: '#dce5ec',
      text: '#19212a',
      textSecondary: '#566574',
      textTertiary: '#7e8d9b',
      fill: 'rgba(67, 104, 140, 0.08)',
      mask: 'rgba(25, 39, 52, 0.25)',
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
      boxShadow: selectedTheme.colorScheme === 'dark'
        ? '0 18px 54px rgba(0, 0, 0, 0.34)'
        : '0 18px 48px rgba(45, 55, 72, 0.14)',
      boxShadowSecondary: selectedTheme.colorScheme === 'dark'
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
