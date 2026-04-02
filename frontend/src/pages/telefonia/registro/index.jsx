import "./style.css";
import { Trash2 } from "lucide-react";
import React, { useState } from "react";
import Layout from "../../../components/Layout";

export default function PainelTelecom() {

  const [valor, setValor] = useState("");
  const [dados, setDados] = useState([]);
  const backend = import.meta.env.VITE_URI_BACKEND;

  const buscar = async () => {
    if (!valor) return;
    const res = await fetch(`${backend}/telefonia/registro?tn=${encodeURIComponent(valor)}`);
    const data = await res.json();
    setDados(data.resultado);
  };

  const deletarRegistro = async (tnid) => {
    try {
      const res = await fetch(`${backend}/telefonia/registro?tnid=${tnid}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao deletar");
      setDados(prev => prev.filter(item => item.id !== tnid));
    } catch (err) {
      console.error("Erro:", err.message);
    }
  };

  return (
    <Layout
      submenuAtivo="registro"
      input={
        <input
          placeholder="Pesquisar"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") buscar(); }}
        />
      }
    >
      <div className="content-registro">
        <table className="telecom-table-registro">

          <thead>
            <tr>
              <th>Número</th>
              <th>IP</th>
              <th>FreeSwitch</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {dados.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
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
                    <button
                      className="buttonalterar"
                      title="Deletar Registro"
                      onClick={() => {
                        if (window.confirm(`Deseja realmente deletar o registro ${item.reg_user}?`)) {
                          deletarRegistro(item.id);
                        }
                      }}
                    >
                      Remover
                      {/*<Trash2 size={18} />*/}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </Layout>
  );
}