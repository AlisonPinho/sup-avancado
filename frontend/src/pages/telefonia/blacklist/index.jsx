import "./style.css";
import React, { useState, useCallback } from "react";
import { LockOpen, Ban } from "lucide-react";
import Layout from "../../../components/Layout";

const OPERADORAS = ["Vivo", "Claro", "Tim", "Oi"];
const BACKEND = import.meta.env.VITE_URI_BACKEND;

export default function Blacklist() {
  const [valor, setValor] = useState("");
  const [operadora, setOperadora] = useState("");
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Busca ────────────────────────────────────────────────────────
  const buscar = useCallback(async () => {
    if (!valor.trim()) return;
    setLoading(true);
    try {
      const url = new URL(`${BACKEND}/telefonia/blacklist`);
      url.searchParams.set("numero", valor.trim());
      if (operadora) url.searchParams.set("operadora", operadora);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDados(data.resultado ?? []);
    } catch (err) {
      console.error("Erro ao buscar:", err.message);
      setDados([]);
    } finally {
      setLoading(false);
    }
  }, [valor, operadora]);

  // ── Desbloquear ──────────────────────────────────────────────────
  const desbloquear = useCallback(async (id) => {
    try {
      const res = await fetch(`${BACKEND}/telefonia/blacklist/${id}/desbloquear`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDados((prev) =>
        prev.map((item) => (item.id === id ? { ...item, whitelist: 1 } : item))
      );
    } catch (err) {
      console.error("Erro ao desbloquear:", err.message);
    }
  }, []);

  // ── Bloquear ──────────────────────────────────────────────────
  const bloquear = useCallback(async (id) => {
    try {
      const res = await fetch(`${BACKEND}/telefonia/blacklist/${id}/bloquear`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDados((prev) =>
        prev.map((item) => (item.id === id ? { ...item, whitelist: 0 } : item))
      );
    } catch (err) {
      console.error("Erro ao bloquear:", err.message);
    }
  }, []);

  // ── Deletar ──────────────────────────────────────────────────────
  const deletar = useCallback(async (id) => {
    try {
      const res = await fetch(`${BACKEND}/telefonia/blacklist/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDados((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Erro ao deletar:", err.message);
    }
  }, []);

  // ── Toggle operadora ─────────────────────────────────────────────
  const toggleOperadora = useCallback((op) => {
    setOperadora((prev) => (prev === op ? "" : op));
  }, []);

  // ── Conteúdo do tbody ────────────────────────────────────────────
  const renderRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={3} className="bl__empty">Buscando…</td>
        </tr>
      );
    }

    if (dados.length === 0) {
      return (
        <tr>
          <td colSpan={3} className="bl__empty">
            {valor.trim() ? "Nenhum resultado encontrado." : ""}
          </td>
        </tr>
      );
    }

    return dados.map((item) => {
      const bloqueado = item.whitelist === 0;
      const numero = item.username ?? item.tn;

      return (
        <tr key={item.id ?? numero}>
          <td>
            <span className="bl__number">{numero}</span>
          </td>
          <td>
            <span className={`bl__status ${bloqueado ? "bl__status--blocked" : "bl__status--active"}`}>
              {bloqueado ? "Bloqueado" : "Liberado"}
            </span>
          </td>
          <td>
            <div className="bl__actions">
              <button
                className="bl__action-btn bl__action-btn--allow"
                title="Desbloquear"
                aria-label={`Desbloquear ${numero}`}
                onClick={() => desbloquear(item.id)}
              >
                <LockOpen size={15} />
              </button>
              <button
                className="bl__action-btn bl__action-btn--block"
                title="Deletar"
                aria-label={`Deletar ${numero}`}
                onClick={() => bloquear(item.id)}
              >
                <Ban size={15} />
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <Layout
      submenuAtivo="blacklist"
      input={
        <input
          placeholder="Pesquisar"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
        />
      }
    >
      <div className="bl">

        {/* Toolbar */}
        <div className="bl__toolbar">
          <div className="bl__filters">
            {OPERADORAS.map((op) => (
              <button
                key={op}
                className={`bl__filter-btn ${operadora === op ? "bl__filter-btn--active" : ""}`}
                onClick={() => toggleOperadora(op)}
                aria-pressed={operadora === op}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela */}
        <div className="bl__table-wrapper">
          <table className="bl__table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>

      </div>
    </Layout>
  );
}