import { ConfigProvider, theme } from 'antd'
import ruRU from 'antd/locale/ru_RU'

import AppLayout from './componets/layout/AppLayout'

import { CryptoContextProvider } from './context/CryptoContext'

const appTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#2563eb',
    colorSuccess: '#22c55e',
    colorError: '#ef4444',
    colorWarning: '#f59e0b',
    colorBgBase: '#08111f',
    colorBgContainer: '#111c2e',
    colorBgElevated: '#111c2e',
    colorBorder: '#25344d',
    colorText: '#e2e8f0',
    colorTextSecondary: '#94a3b8',
    borderRadius: 12,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 10,
    },
    Card: {
      borderRadiusLG: 14,
      paddingLG: 20,
    },
    Drawer: {
      colorBgElevated: '#0f172a',
    },
    InputNumber: {
      controlHeight: 42,
    },
    Select: {
      controlHeight: 42,
    },
  },
}

export default function App() {
  return (
    <ConfigProvider locale={ruRU} theme={appTheme}>
      <CryptoContextProvider>
        <AppLayout />
      </CryptoContextProvider>
    </ConfigProvider>
  )
}
