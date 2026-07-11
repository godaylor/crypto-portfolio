import { createRoot } from 'react-dom/client'

import App from './App'
import './index.css'
import { applyThemeToDocument, readStoredTheme } from './theme'

const root = document.getElementById('root')

applyThemeToDocument(readStoredTheme())

createRoot(root).render(<App />)
