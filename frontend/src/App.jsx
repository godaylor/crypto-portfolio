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
      colorBgContainer: '#101a2c',
      colorBgElevated: '#111c30',
      colorBorder: '#263958',
      colorText: '#f7fbff',
      colorTextSecondary: '#91a5c8',
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
      colorBgContainer: 'rgba(25, 28, 58, 0.68)',
      colorBgElevated: 'rgba(30, 34, 70, 0.82)',
      colorBorder: 'rgba(145, 156, 255, 0.24)',
      colorText: '#f8fbff',
      colorTextSecondary: '#b6bde2',
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
      colorBorder: '#dde6f7',
      colorText: '#101729',
      colorTextSecondary: '#61708a',
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
      InputNumber: {
        controlHeight: 44,
      },
      Select: {
        controlHeight: 44,
      },
      Table: {
        headerBg: 'transparent',
      },
    },
  }
}

export default function App() {
  const [themeName, setThemeName] = useState('dark-modern')
  const appTheme = useMemo(() => createAntTheme(themeName), [themeName])

  return (
    <ConfigProvider locale={ruRU} theme={appTheme}>
      <CryptoContextProvider>
        <AppLayout themeName={themeName} setThemeName={setThemeName} />
      </CryptoContextProvider>
    </ConfigProvider>
  )
}
