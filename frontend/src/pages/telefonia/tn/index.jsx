import "./style.css";
import { PencilLine } from 'lucide-react'; // Ícone moderno e limpo

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
        <button className="active" title="Terminal Number">TN</button>
        <button title="Registro de Números">Registro</button>
        <button title="Números Bloqueados">Blacklist</button>
        <button title="Codigo Não Geografico">CNG</button>
        <button title="Tridigito">SUP</button>
        <button title="Ligação Internacional">LDI</button>
        <button title="Ligação a Cobrar">LAC</button>
        <button title="Aréa Local">AL</button>
        <button title="Número de Técnico">TN-Tecnico</button>
        <button title="Redirecionar Número">ConsultaLog</button>

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
                        <th>Host</th>
                        <th>Cidade</th>
                        <th>Senha</th>
                        <th>Tronco</th>

                        {/* STATUS */}
                        <th>Terminal</th>
                        <th>SipDevices</th>
                        <th>Account</th>
                        <th>Dids</th>
                        <th>Registro</th>
                    </tr>
                    </thead>

                    <tbody>
                    <tr>
                        <td>3131991010</td>
                        <td>6544</td>
                        <td>56565</td>
                        <td>BCS</td>
                        <td>ZZ38401000</td>
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
                        <td className="status-cell">
                        <span className="dot red"></span>
                        </td>
                        <td className="status-cell">
                        <button onClick={() => handleEdit(item.id)} className="buttonalterar" title="Alterar Registro">
                        <PencilLine size={18} />
                        </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}
