import "./style.css";
import { PencilLine } from "lucide-react";
import React, { useState } from "react";
import Layout from "../../../components/Layout";

export default function PainelTelecom() {

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
    <Layout
      submenuAtivo="tn"
      input={
        <input
          placeholder="Pesquisar"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") buscar(); }}
        />
      }
    >
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
              <th></th>
            </tr>
          </thead>

          {/* CASO 1: resultado encontrado */}
          <tbody>
            {dados.resultado.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: "center" }}>
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
                  <td>
                    {dados.dids
                      .filter(did => String(item.terminalnumber).includes(String(did.number)))
                      .map(did => did.extensions.split("@")[0])
                      .join(", ")}
                  </td>

                  {/* TERMINAL */}
                  <td>
                    {dados.resultado.filter(r =>
                      String(item.terminalnumber).includes(String(r.terminalnumber))
                    ).length > 0
                      ? <span className="dot green"></span>
                      : <span className="dot red"></span>}
                  </td>

                  {/* SIP DEVICES */}
                  <td>
                    {dados.sipdevices.filter(s =>
                      String(item.terminalnumber).includes(String(s.username))
                    ).length > 0
                      ? <span className="dot green"></span>
                      : <span className="dot red"></span>}
                  </td>

                  {/* ACCOUNT */}
                  <td>
                    {dados.accounts.filter(a =>
                      String(item.terminalnumber).includes(String(a.number))
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

          {/* CASO 2: só DIDs encontrados (sem resultado) */}
          {dados.resultado.length === 0 && dados.dids.length !== 0 && (
            <tbody>
              {dados.dids.map((item) => (
                <tr key={item.number}>
                  <td>{item.number}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>{String(item.extensions).split("@")[0]}</td>

                  {/* TERMINAL — sempre vermelho pois resultado está vazio */}
                  <td><span className="dot red"></span></td>

                  {/* SIP DEVICES */}
                  <td>
                    {dados.sipdevices.filter(s =>
                      String(s.username).includes(String(item.number))
                    ).length > 0
                      ? <span className="dot green"></span>
                      : <span className="dot red"></span>}
                  </td>

                  {/* ACCOUNT */}
                  <td>
                    {dados.accounts.filter(a =>
                      String(a.number).includes(String(item.number))
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
              ))}
            </tbody>
          )}


          {/* CASO 3: DID cujo ramal bate com o terminalnumber do resultado */}
          {dados.resultado.length !== 0 && dados.dids.length !== 0 && (
            <tbody>
              {dados.dids
                .filter(did =>
                  dados.resultado.some(r =>
                    String(r.terminalnumber) === String(did.extensions).split("@")[0]
                  )
                )
                .map((item) => (
                  <tr key={item.number}>
                    <td>{item.number}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{String(item.extensions).split("@")[0]}</td>

                    {/* TERMINAL */}
                    <td>
                      {dados.resultado.filter(r =>
                        String(r.terminalnumber) === String(item.number).split("@")[0]
                      ).length > 0
                        ? <span className="dot green"></span>
                        : <span className="dot red"></span>}
                    </td>

                    {/* SIP DEVICES */}
                    <td>
                      {dados.sipdevices.filter(s =>
                        String(item.terminalnumber).includes(String(s.username))
                      ).length > 0
                        ? <span className="dot green"></span>
                        : <span className="dot red"></span>}
                    </td>

                    {/* ACCOUNT */}
                    <td>
                      {dados.accounts.filter(a =>
                        String(item.terminalnumber).includes(String(a.number))
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
                ))}
            </tbody>
          )}

        </table>
      </div>
    </Layout>
  );
}