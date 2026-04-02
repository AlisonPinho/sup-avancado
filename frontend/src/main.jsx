import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";

import PainelTelecom from './pages/telefonia/tn/index.jsx'
import Registro from "./pages/telefonia/registro/index.jsx";
import Blacklist from "./pages/telefonia/blacklist/index.jsx";
import Tecnico from "./pages/telefonia/tecnico/index.jsx";



/*
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PainelTelecom />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  );
}
*/

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PainelTelecom />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/blacklist" element={<Blacklist />} />
        <Route path="/tecnico" element={<Tecnico />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
