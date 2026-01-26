import "./style.css";

export default function PainelTelecom() {
  return (
    <div className="app">
      {/* Header */}
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

      {/* Submenu */}
      <div className="submenu">
        <button className="active">Registro</button>
        <button>CNG</button>
        <button>SUP</button>
        <button>Blacklist</button>
        <button>Ligação Internacional</button>
        <button>ConsultaLog</button>

        <input placeholder="Pesquisar" />
      </div>

      {/* Conteúdo */}
        <div className="content content-grid">
            {/* Tabela */}
            <div className="content">
                <table className="telecom-table">
                    <thead>
                    <tr>
                        <th>TN</th>
                        <th>ID</th>
                        <th>FreeSwitch</th>
                        <th>IP Registro</th>
                        <th>Host</th>
                        <th>Cidade</th>
                        <th>Senha</th>
                        <th>Tronco</th>

                        {/* STATUS */}
                        <th>Terminal</th>
                        <th>SipDevices</th>
                        <th>Account</th>
                        <th>Dids</th>
                    </tr>
                    </thead>

                    <tbody>
                    <tr>
                        <td>3131991010</td>
                        <td>6544</td>
                        <td>corporativo</td>
                        <td>192.168.201.100</td>
                        <td>56565</td>
                        <td>BCS</td>
                        <td className="password">••••••••</td>
                        <td>3131991010</td>

                        {/* STATUS */}
                        <td className="status-cell">
                        <span className="dot green"></span>
                        </td>
                        <td className="status-cell">
                        <span className="dot red"></span>
                        </td>
                        <td className="status-cell">
                        <span className="dot green"></span>
                        </td>
                        <td className="status-cell">
                        <span className="dot green"></span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}
