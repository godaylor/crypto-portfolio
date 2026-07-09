import { ConfigProvider, theme } from 'antd'
import ruRU from 'antd/locale/ru_RU'

import AppLayout from './componets/layout/AppLayout'
import { CryptoContextProvider } from './context/CryptoContext'

const appTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#3b82f6',
    colorSuccess: '#22c55e',
    colorError: '#ef4444',
    colorWarning: '#f59e0b',
    colorBgBase: '#070a12',
    colorBgContainer: '#0f172a',
    colorBgElevated: '#111c33',
    colorBorder: 'rgba(148, 163, 184, 0.22)',
    colorText: '#f8fafc',
    colorTextSecondary: '#94a3b8',
    borderRadius: 14,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    Button: {
      controlHeight: 42,
      borderRadius: 12,
      primaryShadow: '0 14px 34px rgba(59, 130, 246, 0.28)',
    },
    Card: {
      borderRadiusLG: 18,
      paddingLG: 22,
    },
    Drawer: {
      colorBgElevated: '#0f172a',
    },
    Dropdown: {
      controlItemBgHover: 'rgba(59, 130, 246, 0.14)',
    },
    InputNumber: {
      controlHeight: 44,
    },
    Select: {
      controlHeight: 44,
    },
    Table: {
      headerBg: 'transparent',
      rowHoverBg: 'rgba(59, 130, 246, 0.08)',
    },
  },
}

export default function App() {
  return (
    <ConfigProvider
      locale={ruRU}
      theme={appTheme}
      getPopupContainer={(triggerNode) =>
        triggerNode?.closest?.('.ant-drawer') ??
        triggerNode?.closest?.('.app-shell') ??
        document.body
      }
    >
      <CryptoContextProvider>
        <AppLayout />
      </CryptoContextProvider>
    </ConfigProvider>
  )
}
