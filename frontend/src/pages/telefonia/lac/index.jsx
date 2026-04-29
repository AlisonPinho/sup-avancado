import { useState, useEffect, useCallback } from "react";
import Layout from "../../../components/Layout";
import "./style.css";
const backend = import.meta.env.VITE_URI_BACKEND;
const API = backend+"/api";

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, type = "success") {
  const el = document.createElement("div");
  el.className = `gs-toast gs-toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("gs-toast-show"), 10);
  setTimeout(() => {
    el.classList.remove("gs-toast-show");
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

// ── Modal Adicionar / Editar ──────────────────────────────────────────────────
function LacModal({ row, onClose, onSaved }) {
  const isEdit = !!row;
  const [numero, setNumero] = useState(row?.numero || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!numero.trim()) { toast("Número é obrigatório", "error"); return; }
    setLoading(true);
    try {
      const url    = isEdit
        ? `${API}/lac/${encodeURIComponent(row.numero)}`
        : `${API}/lac`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Erro");
      }
      toast(isEdit ? "Número atualizado!" : "Número adicionado!");
      onSaved();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" style={{ width: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-title">{isEdit ? "Editar Número" : "Novo Número"}</span>
            {isEdit && <span className="modal-badge">{row.numero}</span>}
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <div className="section-label">Número a Cobrar</div>
            <div className="field">
              <label>Número</label>
              <input
                value={numero}
                onChange={e => setNumero(e.target.value.replace(/\D/g, ""))}
                placeholder="Ex: 3121106214"
                maxLength={20}
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "✓ Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Confirmar exclusão ──────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" style={{ width: 360 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-title">Confirmar exclusão</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-section">
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>{message}</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button
            className="btn-save"
            style={{ background: "#dc2626", borderColor: "#b91c1c" }}
            onClick={onConfirm}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
const PAGE_SIZE = 50;

export default function PainelLAC() {
  const [rows, setRows]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading]   = useState(false);
  const [modal, setModal]       = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchRows = useCallback(async (q = search, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: PAGE_SIZE });
      if (q.trim()) params.append("q", q.trim());
      const res  = await fetch(`${API}/lac?${params}`);
      const data = await res.json();
      setRows(data.rows);
      setTotal(data.total);
    } catch {
      toast("Erro ao conectar ao servidor", "error");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  // ── Debounce busca ─────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setSearch(inputVal); setPage(1); }, 600);
    return () => clearTimeout(t);
  }, [inputVal]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { setSearch(inputVal); setPage(1); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (numero) => {
    try {
      const res = await fetch(`${API}/lac/${encodeURIComponent(numero)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Número removido!");
      fetchRows(search, page);
    } catch {
      toast("Erro ao remover", "error");
    }
    setModal(null);
  };

  // ── Paginação ──────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  const goPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    fetchRows(search, p);
  };

  const pageNumbers = () => {
    const start = Math.max(1, Math.min(page - 3, totalPages - 6));
    const end   = Math.min(start + 6, totalPages);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // ── Input submenu ──────────────────────────────────────────────────────────
  const searchInput = (
    <div className="search-container">
      <input
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar número..."
        style={{ width: 210 }}
      />
      <button
        className="btn-add-main"
        title="Novo Número"
        onClick={() => setModal({ type: "form" })}
      >
        ＋
      </button>
    </div>
  );

  return (
    <Layout submenuAtivo="lac" input={searchInput}>
      <div className="content">

        {/* Toolbar */}
        <div className="gs-toolbar" style={{ marginBottom: 12 }}>
          <div className="gs-stats">
            <span className="gs-stat">
              <span className="gs-stat-val">{total.toLocaleString("pt-BR")}</span> Números liberados para receber chamadas á cobrar
            </span>
            {search && (
              <span className="gs-stat" style={{ color: "var(--primary)" }}>
                filtrando: <strong>{search}</strong>
                <button
                  onClick={() => { setInputVal(""); setSearch(""); setPage(1); }}
                  style={{ marginLeft: 8, background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12 }}
                >
                  ✕ limpar
                </button>
              </span>
            )}
          </div>

          <div className="cl-pagination">
            <button className="cl-page-btn" onClick={() => goPage(1)} disabled={page === 1}>«</button>
            <button className="cl-page-btn" onClick={() => goPage(page - 1)} disabled={page === 1}>‹</button>
            <span className="cl-page-info">{page} / {totalPages}</span>
            <button className="cl-page-btn" onClick={() => goPage(page + 1)} disabled={page >= totalPages}>›</button>
            <button className="cl-page-btn" onClick={() => goPage(totalPages)} disabled={page >= totalPages}>»</button>
          </div>
        </div>

        {/* Tabela */}
        <div className="table-wrapper">
          <table className="telecom-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th style={{ textAlign: "left" }}>Número</th>
                <th style={{ width: 90 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="gs-empty"><span className="cl-spinner" /> Carregando...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={3} className="gs-empty">Nenhum número cadastrado</td></tr>
              ) : rows.map((row, i) => (
                <tr key={row.numero}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td>
                    <span className="gs-code" style={{ color: "#4ade80" }}>{row.numero}</span>
                  </td>
                  <td>
                    <div className="gs-actions">
                      <button
                        className="buttonalterar"
                        title="Editar"
                        onClick={() => setModal({ type: "form", data: row })}
                      >
                        ✏
                      </button>
                      <button
                        className="buttonalterar gs-danger"
                        title="Excluir"
                        onClick={() => setModal({ type: "confirm", data: row })}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação inferior */}
        {totalPages > 1 && (
          <div className="cl-pagination" style={{ justifyContent: "center", marginTop: 16 }}>
            <button className="cl-page-btn" onClick={() => goPage(1)} disabled={page === 1}>«</button>
            <button className="cl-page-btn" onClick={() => goPage(page - 1)} disabled={page === 1}>‹</button>
            {pageNumbers().map(p => (
              <button key={p} className={`cl-page-btn ${p === page ? "cl-page-active" : ""}`} onClick={() => goPage(p)}>{p}</button>
            ))}
            <button className="cl-page-btn" onClick={() => goPage(page + 1)} disabled={page >= totalPages}>›</button>
            <button className="cl-page-btn" onClick={() => goPage(totalPages)} disabled={page >= totalPages}>»</button>
          </div>
        )}
      </div>

      {/* Modais */}
      {modal?.type === "form" && (
        <LacModal
          row={modal.data}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchRows(search, page); }}
        />
      )}
      {modal?.type === "confirm" && (
        <ConfirmModal
          message={`Remover o número "${modal.data.numero}" da lista de cobrar?`}
          onConfirm={() => handleDelete(modal.data.numero)}
          onClose={() => setModal(null)}
        />
      )}
    </Layout>
  );
}