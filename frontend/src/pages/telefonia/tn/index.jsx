import "./style.css";
import { PencilLine } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";



export default function PainelTelecom() {

  const navigate = useNavigate();
  const [valor, setValor] = useState("");
  const [dados, setDados] = useState({
    resultado: [],
    dids: [],
    sipdevices: [],
    accounts: []
  });
  const backend = import.meta.env.VITE_URI_BACKEND;

  const buscar = async () => {
    if (!valor) return;

    const res = await fetch(`${backend}/telefonia/tn?tn=${encodeURIComponent(valor)}`);
    const data = await res.json();

    setDados({
      resultado: data.resultado ?? [],
      dids: data.dids ?? [],
      sipdevices: data.sipdevices ?? [],
      accounts: data.accounts ?? []
    });
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
        <button className="active" title="Terminal Number" onClick={() => navigate("/")}>TN</button>
        <button title="Registro de Números" onClick={() => navigate("/registro")}>Registro</button>
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

              {dados.resultado.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center" }}>
                    Nenhum resultado na tabela Terminal
                  </td>
                </tr>
              ) : (

                dados.resultado.map((item) => (

                  <tr key={item.terminalid}>

                    <td>{item.terminalnumber}</td>
                    <td>{item.terminalid}</td>
                    <td>{item.codinst}</td>
                    <td>{item.codcidade}</td>
                    <td>{item.password}</td>

                    <td>{dados.dids
                      .filter(did => String(item.terminalnumber).includes(String(did.number)))
                      .map(did => did.extensions.split("@")[0])
                      .join(", ")}</td>

                    {/* TERMINAL */}
                    <td>
                      {dados.resultado.filter(resultado =>
                        String(item.terminalnumber).includes(String(resultado.terminalnumber))
                      ).length > 0
                        ? <span className="dot green"></span>
                        : <span className="dot red"></span>}
                    </td>

                    {/* SIP DEVICES */}
                    <td>
                      {dados.sipdevices.filter(sipdevices =>
                        String(item.terminalnumber).includes(String(sipdevices.username))
                      ).length > 0
                        ? <span className="dot green"></span>
                        : <span className="dot red"></span>}
                    </td>

                    {/* ACCOUNT */}
                    <td>
                      {dados.accounts.filter(accounts =>
                        String(item.terminalnumber).includes(String(accounts.number))
                      ).length > 0
                        ? <span className="dot green"></span>
                        : <span className="dot red"></span>}
                    </td>

                    {/* DID */}
                    <td>
                      {dados.dids.filter(did =>
                        String(item.terminalnumber).includes(String(did.number))
                      ).length > 0
                        ? <span className="dot green"></span>
                        : <span className="dot red"></span>}
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


            <tbody>

              {dados.resultado.length === 0 && dados.dids.length !== 0 && (

                dados.dids.map((item) => (

                  <tr key={item.number}>

                    <td>{item.number}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{String(item.extensions).split("@")[0]}</td>

                    {/* TERMINAL */}
                    <td>
                      {dados.resultado.filter(resultado =>
                        String(item.terminalnumber).includes(String(resultado.terminalnumber))
                      ).length > 0
                        ? <span className="dot green"></span>
                        : <span className="dot red"></span>}
                    </td>

                    {/* SIP DEVICES */}
                    <td>
                      {dados.sipdevices.filter(sipdevices =>
                        String(item.terminalnumber).includes(String(sipdevices.username))
                      ).length > 0
                        ? <span className="dot green"></span>
                        : <span className="dot red"></span>}
                    </td>

                    {/* ACCOUNT */}
                    <td>
                      {dados.accounts.filter(accounts =>
                        String(item.terminalnumber).includes(String(accounts.number))
                      ).length > 0
                        ? <span className="dot green"></span>
                        : <span className="dot red"></span>}
                    </td>

                    {/* DID */}
                    <td>
                      {dados.dids.filter(did =>
                        String(item.number).includes(String(did.number))
                      ).length > 0
                        ? <span className="dot green"></span>
                        : <span className="dot red"></span>}
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
