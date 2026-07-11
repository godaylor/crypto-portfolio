import { useEffect, useMemo, useState } from 'react'

import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'

import AppLayout from './componets/layout/AppLayout'
import { CryptoContextProvider } from './context/CryptoContext'
import { createAntTheme, persistTheme, readStoredTheme } from './theme'

export default function App() {
  const [themeName, setThemeName] = useState(readStoredTheme)
  const appTheme = useMemo(() => createAntTheme(themeName), [themeName])

  useEffect(() => {
    persistTheme(themeName)
  }, [themeName])

  return (
    <ConfigProvider
      locale={ruRU}
      theme={appTheme}
      getPopupContainer={(triggerNode) =>
        triggerNode?.closest?.('.ant-drawer') ??
        triggerNode?.closest?.('.app-shell') ??
        document.querySelector('.app-shell') ??
        document.body
      }
    >
      <CryptoContextProvider>
        <AppLayout themeName={themeName} setThemeName={setThemeName} />
      </CryptoContextProvider>
    </ConfigProvider>
  )
}
