import "./style.css";
import { Trash2, Plus, X } from "lucide-react";
import React, { useState } from "react";
import Layout from "../../../components/Layout";

export default function PainelTelecom() {

  const [valor, setValor] = useState("");
  const [dados, setDados] = useState([]);
  const [novoNumero, setNovoNumero] = useState("");
  const [adicionando, setAdicionando] = useState(false);
  const [erro, setErro] = useState(null);
  const backend = import.meta.env.VITE_URI_BACKEND;

  const buscar = async () => {
    if (!valor) return;
    const res = await fetch(`${backend}/telefonia/tecnico?tn=${encodeURIComponent(valor)}`);
    const data = await res.json();
    setDados(data.resultado);
  };

  const adicionar = async () => {
    if (!novoNumero) return;
    try {
      const res = await fetch(`${backend}/telefonia/tecnico?tn=${encodeURIComponent(novoNumero)}`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao adicionar");
      setDados(prev => [...prev, { phoneNumber: novoNumero, createdAt: new Date().toLocaleString() }]);
      setNovoNumero("");
      setAdicionando(false);
      setErro(null);
    } catch (err) {
      setErro(err.message);
    }
  };

  const deletarRegistro = async (tn) => {
    try {
      const res = await fetch(`${backend}/telefonia/tecnico?tn=${tn}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao deletar");
      setDados(prev => prev.filter(item => item.phoneNumber !== tn));
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <Layout
      submenuAtivo="tecnico"
      input={
        <input
          placeholder="Pesquisar"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") buscar(); }}
        />
      }
    >
      <div className="content-tecnico">

        {erro && (
          <div className="erro-banner">
            <span>{erro}</span>
            <button onClick={() => setErro(null)}><X size={16} /></button>
          </div>
        )}

        <div className="toolbar-tecnico">
          {adicionando ? (
            <div className="adicionar-form">
              <input
                placeholder="Número"
                value={novoNumero}
                onChange={(e) => setNovoNumero(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") adicionar(); }}
                autoFocus
              />
              <button className="buttonalterar" onClick={adicionar}>Confirmar</button>
              <button className="buttonalterar" onClick={() => { setAdicionando(false); setNovoNumero(""); setErro(null); }}>Cancelar</button>
            </div>
          ) : (
            <button className="buttonalterar" title="Adicionar Registro" onClick={() => setAdicionando(true)}>
              <Plus size={18} /> Adicionar
            </button>
          )}
        </div>

        <table className="telecom-table-tecnico">
          <thead>
            <tr>
              <th>Número</th>
              <th>Adicionado</th>
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
                <tr key={item.phoneNumber}>
                  <td>{item.phoneNumber}</td>
                  <td>{item.createdAt || "null"}</td>
                  <td className="status-cell-tecnico">
                    <button
                      className="buttonalterar"
                      title="Deletar Registro"
                      onClick={() => {
                        if (window.confirm(`Deseja realmente deletar o registro ${item.phoneNumber}?`)) {
                          deletarRegistro(item.phoneNumber);
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