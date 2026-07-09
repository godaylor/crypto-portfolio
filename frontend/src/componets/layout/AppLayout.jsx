import { useContext, useEffect, useState } from 'react'

import { Layout, Spin } from 'antd'

import CryptoContext from '../../context/CryptoContext'
import AppContent from './AppContent'
import AppHeader from './AppHeader'
import AppSider from './AppSider'

const dashboardThemeName = 'dark-modern'
const availableSections = new Set([
  'dashboard',
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

export default function AppLayout() {
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

  return (
    <Layout className='app-shell' data-theme={dashboardThemeName}>
      <AppHeader
        isDrawerOpen={isAddAssetDrawerOpen}
        onCloseDrawer={() => setIsAddAssetDrawerOpen(false)}
        onOpenDrawer={() => setIsAddAssetDrawerOpen(true)}
      />
      <Layout className='app-body'>
        <AppSider
          currentSection={currentSection}
          onNavigate={handleNavigate}
        />
        <AppContent
          currentSection={currentSection}
          onNavigate={handleNavigate}
          onOpenAddAsset={() => setIsAddAssetDrawerOpen(true)}
          themeName={dashboardThemeName}
        />
      </Layout>
    </Layout>
  )
}
