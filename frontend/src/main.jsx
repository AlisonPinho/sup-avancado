import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registro from "./pages/telefonia/registro/index.jsx";

import PainelTelecom from './pages/telefonia/tn/index.jsx'

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
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
