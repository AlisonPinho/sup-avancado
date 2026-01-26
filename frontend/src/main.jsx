import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import PainelTelecom from './pages/home/index.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PainelTelecom/>
  </StrictMode>,
)
