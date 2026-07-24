import { useContext, useEffect, useState } from 'react'

import { Layout, Spin } from 'antd'

import CryptoContext from '../../context/CryptoContext'
import AppContent from './AppContent'
import AppHeader from './AppHeader'
import AppSider from './AppSider'

const availableSections = new Set([
  'dashboard',
  'dashboard-aperture',
  'dashboard-ledger',
  'dashboard-orbit',
  'dashboard-v2',
  'assets',
  'analytics',
  'markets',
  'transactions',
  'settings',
])

function readSectionFromHash() {
  if (typeof window === 'undefined') {
    return 'dashboard'
  }

  const sectionFromHash = window.location.hash.replace('#', '')

  return availableSections.has(sectionFromHash) ? sectionFromHash : 'dashboard'
}

export default function AppLayout({ themeName, setThemeName }) {
  const { loading } = useContext(CryptoContext)
  const [currentSection, setCurrentSection] = useState(readSectionFromHash)
  const [isAddAssetDrawerOpen, setIsAddAssetDrawerOpen] = useState(false)

  useEffect(() => {
    function handleHashChange() {
      setCurrentSection(readSectionFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('popstate', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('popstate', handleHashChange)
    }
  }, [])

  function handleNavigate(sectionKey) {
    const nextSection = availableSections.has(sectionKey)
      ? sectionKey
      : 'dashboard'

    setCurrentSection(nextSection)

    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `#${nextSection}`)
    }
  }

  if (loading) {
    return <Spin fullscreen />
  }

  const shellVariant = currentSection === 'dashboard-v2' ? 'flagship' : 'default'

  return (
    <Layout
      className={`app-shell is-${shellVariant}-shell`}
      data-theme={themeName}
    >
      <AppHeader
        isDrawerOpen={isAddAssetDrawerOpen}
        onCloseDrawer={() => setIsAddAssetDrawerOpen(false)}
        onOpenDrawer={() => setIsAddAssetDrawerOpen(true)}
        onNavigate={handleNavigate}
        setThemeName={setThemeName}
        shellVariant={shellVariant}
        themeName={themeName}
      />
      <Layout className='app-body'>
        <AppSider
          currentSection={currentSection}
          onNavigate={handleNavigate}
          setThemeName={setThemeName}
          shellVariant={shellVariant}
          themeName={themeName}
        />
        <AppContent
          currentSection={currentSection}
          onNavigate={handleNavigate}
          onOpenDrawer={() => setIsAddAssetDrawerOpen(true)}
          setThemeName={setThemeName}
          themeName={themeName}
        />
      </Layout>
    </Layout>
  )
}
