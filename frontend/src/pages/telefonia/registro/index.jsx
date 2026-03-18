import "./style.css";
import { Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";



export default function PainelTelecom() {

  const navigate = useNavigate();
  const [valor, setValor] = useState("");
  const [dados, setDados] = useState([]);
 

  const buscar = async () => {
    if (!valor) return;

    const res = await fetch(`http://localhost:3001/telefonia/registro?tn=${encodeURIComponent(valor)}`);
    const data = await res.json();

    setDados(data.resultado);
  };
  
  const deletarRegistro = async (tnid) => {
    try {
      const res = await fetch(
        `http://localhost:3001/telefonia/registro?tnid=${tnid}`,
        {
          method: "DELETE"
        }
      );
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.erro || "Erro ao deletar");
      }

      setDados(prev => prev.filter(item => item.id !== tnid));


      console.log("Deletado:", data);
      return data;

      
  
    } catch (err) {
      console.error("Erro:", err.message);
    }
  };
  
  
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
        <button title="Terminal Number" onClick={() => navigate("/")}>TN</button>
        <button className="active" title="Registro de Números" onClick={() => navigate("/registro")}>Registro</button>
        <button title="Números Bloqueados">Blacklist</button>
        <button title="Codigo Não Geografico">CNG</button>
        <button title="Tridigito">SUP</button>
        <button title="Ligação Internacional">LDI</button>
        <button title="Ligação a Cobrar">LAC</button>
        <button title="Aréa Local">AL</button>
        <button title="Número de Técnico">Tecnico</button>
        <button title="Provisionador de Telefone IP GrandStream">GS</button>
        <button title="Redirecionar Número">ConsultaLog</button>
        <button title="Rastrear Chamada">Rastreador</button>

        <input
          placeholder="Pesquisar"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") buscar();
          }}
        />
      </div>

      <div className="content content-grid">
        <div className="content">

          <table className="telecom-table">

            <thead>
              <tr>
                <th>Número</th>
                <th>IP</th>
                <th>FreeSwitch</th>
              </tr>
            </thead>

            <tbody>

              {dados.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center" }}>
                    Nenhum resultado
                  </td>
                </tr>
              ) : (

                dados.map((item) => (

                  <tr key={item.id}>

                    <td>{item.reg_user}</td>
                    <td>{item.network_ip}</td>
                    <td>{item.hostname}</td>



                    <td className="status-cell">
                      <button className="buttonalterar" title="Deletar Registro" onClick={() => deletarRegistro(item.id)}>
                        <Trash2  size={18} />
                      </button>
                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>
      </div>
    </div>
  );
}



/*
import "./style.css";
import { PencilLine } from 'lucide-react'; // Ícone moderno e limpo
import React, { useState } from 'react'




export default function PainelTelecom() {

  const [valor, setValor] = useState('');
  const [resultado, setResultado] = useState([]);
  const [resultadodids, setResultadodids] = useState([]);
  const [resultadosipdevices, setResultadosipdevices] = useState([]);
  const [resultadoaccount, setResultadoaccount] = useState([]);
  const [dados, setDados] = useState(null);


  const buscar = async () => {
    if (!valor) return;
    const res = await fetch(`http://localhost:3001/telefonia/tn?tn=${encodeURIComponent(valor)}`);
    const data = await res.json();
    setDados(data);
    setResultado(data.resultado);
    setResultadodids(data.dids);
    setResultadosipdevices(data.sipdevices);
    setResultadoaccount(data.accounts);
  };



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
        <button className="active" title="Terminal Number">TN</button>
        <button title="Registro de Números">Registro</button>
        <button title="Números Bloqueados">Blacklist</button>
        <button title="Codigo Não Geografico">CNG</button>
        <button title="Tridigito">SUP</button>
        <button title="Ligação Internacional">LDI</button>
        <button title="Ligação a Cobrar">LAC</button>
        <button title="Aréa Local">AL</button>
        <button title="Número de Técnico">Tecnico</button>
        <button title="Provisionador de Telefone IP GrandStream">GS</button>
        <button title="Redirecionar Número">ConsultaLog</button>
        <button title="Rastrear Chamada">Rastreador</button>

        <input
          placeholder="Pesquisar"
          value={valor}
          onChange={e => setValor(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') buscar()
          }}
        />
      </div>

      
      <div className="content content-grid">
       
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

                
                <th>Terminal</th>
                <th>SipDevices</th>
                <th>Account</th>
                <th>Dids</th>
              </tr>
            </thead>

            <tbody>
              {dados?.resultado.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center' }}>Nenhum resultado</td>
                </tr>
              ) : (
                dados?.resultado.map(item => (
                  <tr key={item.terminalid}>
                    <td>{item.terminalnumber}</td>
                    <td>{item.terminalid}</td>
                    <td>{item.codinst}</td>
                    <td>{item.codcidade}</td>
                    <td>{item.password}</td>
                    <td>
                      {(dados?.dids ?? [])
                        .filter(did => String(did.number).includes(String(item.terminalnumber)))
                        .map(did => did.number)
                        .join(', ')}
                    </td>


                    <td>
                      {dados?.resultado.length > 0 ? (
                        <span className="dot green"></span>
                      ) : (
                        <span className="dot red"></span>
                      )}
                    </td>
                    <td>
                      {dados?.sipdevices.length > 0 ? (
                        <span className="dot green"></span>
                      ) : (
                        <span className="dot red"></span>
                      )}
                    </td>
                    <td>
                      {(dados?.accounts ?? [])
                        .filter(accounts => accounts.number == item.terminalnumber).length > 0 ? (
                        <span className="dot green"></span>
                      ) : (
                        <span className="dot red"></span>
                      )}
                    </td>
                    <td>
                      {(dados?.dids ?? [])
                        .filter(did => String(item.terminalnumber).startsWith(String(did.number))).length > 0 ? (
                        <span className="dot green"></span>
                      ) : (
                        <span className="dot red"></span>
                      )}
                    </td>
                    <td className="status-cell">
                      <button className="buttonalterar" title="Alterar Registro">
                        <PencilLine size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
*/
