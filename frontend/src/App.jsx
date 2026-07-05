import { useMemo, useState } from 'react'

import { ConfigProvider, theme } from 'antd'
import ruRU from 'antd/locale/ru_RU'

import AppLayout from './componets/layout/AppLayout'

import { CryptoContextProvider } from './context/CryptoContext'

const themeConfigs = {
  'dark-modern': {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#3478f6',
      colorSuccess: '#20d486',
      colorError: '#ff4d5e',
      colorWarning: '#ff9f1a',
      colorBgBase: '#060b16',
      colorBgContainer: '#101b2f',
      colorBgElevated: '#0f1a2e',
      colorBorder: '#314766',
      colorText: '#f7fbff',
      colorTextSecondary: '#a7b7d4',
    },
  },
  'dark-glass': {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#6d5dfc',
      colorSuccess: '#21d6a3',
      colorError: '#ff5268',
      colorWarning: '#ff9f1a',
      colorBgBase: '#08091a',
      colorBgContainer: 'rgba(24, 29, 68, 0.78)',
      colorBgElevated: 'rgba(32, 36, 82, 0.86)',
      colorBorder: 'rgba(204, 211, 255, 0.26)',
      colorText: '#f8fbff',
      colorTextSecondary: '#c7cdf0',
    },
  },
  'light-modern': {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: '#2563eb',
      colorSuccess: '#16b981',
      colorError: '#ef334d',
      colorWarning: '#f59e0b',
      colorBgBase: '#f6f8ff',
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBorder: '#d7e1f2',
      colorText: '#081120',
      colorTextSecondary: '#47566f',
    },
  },
}

function createAntTheme(themeName) {
  const selectedTheme = themeConfigs[themeName] ?? themeConfigs['dark-modern']

  return {
    ...selectedTheme,
    token: {
      ...selectedTheme.token,
      borderRadius: 14,
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    components: {
      Button: {
        controlHeight: 42,
        borderRadius: 12,
      },
      Card: {
        borderRadiusLG: 16,
        paddingLG: 22,
      },
      Drawer: {
        colorBgElevated: selectedTheme.token.colorBgElevated,
      },
      Dropdown: {
        controlItemBgHover: selectedTheme.token.colorPrimary,
      },
      InputNumber: {
        controlHeight: 44,
      },
      Select: {
        controlHeight: 44,
      },
      Table: {
        headerBg: 'transparent',
        rowHoverBg: 'transparent',
      },
    },
  }
}

export default function App() {
  const [themeName, setThemeName] = useState('dark-modern')
  const appTheme = useMemo(() => createAntTheme(themeName), [themeName])

  return (
    <ConfigProvider
      locale={ruRU}
      theme={appTheme}
      getPopupContainer={(triggerNode) =>
        triggerNode?.closest?.('.app-shell') ?? document.body
      }
    >
      <CryptoContextProvider>
        <AppLayout themeName={themeName} setThemeName={setThemeName} />
      </CryptoContextProvider>
    </ConfigProvider>
  )
}
