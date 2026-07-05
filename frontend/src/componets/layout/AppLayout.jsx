import { Layout, Spin } from 'antd'
import AppHeader from './AppHeader'
import AppSider from './AppSider'
import AppContent from './AppContent'
import { useContext } from 'react'
import CryptoContext from '../../context/CryptoContext'

export default function AppLayout({ themeName, setThemeName }) {
  const { loading } = useContext(CryptoContext)
  if (loading) {
    return <Spin fullscreen />
  }
  return (
    <Layout className='app-shell' data-theme={themeName}>
      <AppHeader themeName={themeName} setThemeName={setThemeName} />
      <Layout className='app-body'>
        <AppSider />
        <AppContent themeName={themeName} />
      </Layout>
    </Layout>
  )
}
