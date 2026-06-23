import AppLayout from './componets/layout/AppLayout'
import { CryptoContextProvider } from './context/CryptoContext'

export default function App() {
  return (
    <CryptoContextProvider>
      <AppLayout />
    </CryptoContextProvider>
  )
}
