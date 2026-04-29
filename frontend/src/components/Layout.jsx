import { useNavigate } from "react-router-dom";

export default function Layout({ children, submenuAtivo, input }) {
  const navigate = useNavigate();

  return (
    <div className="app">

      <header className="header">
        <div className="logo">Sup Avançado</div>
        <nav className="menu">
          <button className="active">Telefonia</button>
          <button>GPON</button>
          <button>Mikrotik</button>
          <button>Outros</button>
        </nav>
        <div className="user">👤</div>
      </header>

      <div className="submenu">
        <button className={submenuAtivo === "tn" ? "active" : ""} title="Terminal Number" onClick={() => navigate("/")}>TN</button>
        <button className={submenuAtivo === "registro" ? "active" : ""} title="Registro de Números" onClick={() => navigate("/registro")}>Registro</button>
        <button className={submenuAtivo === "blacklist" ? "active" : ""} title="Números Bloqueados" onClick={() => navigate("/blacklist")}>Blacklist</button>
        <button className={submenuAtivo === "cng" ? "active" : ""} title="Codigo Não Geografico" onClick={() => navigate("/cng")}>CNG</button>
        <button className={submenuAtivo === "sup" ? "active" : ""} title="Tridigito" onClick={() => navigate("/sup")}>SUP</button>
        <button className={submenuAtivo === "ldi" ? "active" : ""} title="Ligação Internacional" onClick={() => navigate("/ldi")}>LDI</button>
        <button className={submenuAtivo === "lac" ? "active" : ""} title="Ligação a Cobrar" onClick={() => navigate("/lac")}>LAC</button>
        
        <button className={submenuAtivo === "tecnico" ? "active" : ""} title="Número de Técnico" onClick={() => navigate("/tecnico")}>Tecnico</button>
        <button className={submenuAtivo === "gs" ? "active" : ""} title="Provisionador de Telefone IP GrandStream"  onClick={() => navigate("/gs")}>GS</button>
        <button className={submenuAtivo === "consultalog" ? "active" : ""} title="Redirecionar Número" onClick={() => navigate("/consultalog")}>ConsultaLog</button>
        <button className={submenuAtivo === "rastreador" ? "active" : ""} title="Rastrear Chamada">Rastreador</button>
        
        {input && (
          <div className="search-bar">
            {input}
          </div>
        )}
        
      </div>

      {children}

    </div>
  );
}