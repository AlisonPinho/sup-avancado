import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";

import PainelTelecom from './pages/telefonia/tn/index.jsx'
import Registro from "./pages/telefonia/registro/index.jsx";
import Blacklist from "./pages/telefonia/blacklist/index.jsx";
import Tecnico from "./pages/telefonia/tecnico/index.jsx";
import Gs from "./pages/telefonia/gs/index.jsx";
import ConsultaLog from './pages/telefonia/consultalog/index.jsx';
import Sup from './pages/telefonia/sup/index.jsx';
import Cng from './pages/telefonia/cng/index.jsx';
import Ldi from './pages/telefonia/ldi/index.jsx';
import Lac from './pages/telefonia/lac/index.jsx';




createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PainelTelecom />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/blacklist" element={<Blacklist />} />
        <Route path="/tecnico" element={<Tecnico />} />
        <Route path="/gs" element={<Gs />} />
        <Route path="/consultalog" element={<ConsultaLog />} />
        <Route path="/sup" element={<Sup />} />
        <Route path="/cng" element={<Cng />} />
        <Route path="/ldi" element={<Ldi />} />
        <Route path="/lac" element={<Lac />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
