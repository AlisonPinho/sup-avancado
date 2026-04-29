import { useState, useEffect, useCallback } from "react";
import Layout from "../../../components/Layout";
import "./style.css";

const backend = import.meta.env.VITE_URI_BACKEND;
const API = backend+"/api";

const TIPO_OPTIONS = ["DDI", "DDDOUTROS", "VC1", "DDIOUTROS"];
const ACAO_OPTIONS = [
  { value: "L", label: "L — Liberar" },
  { value: "B", label: "B — Bloquear" },
];

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
function LdiModal({ row, onClose, onSaved }) {
  const isEdit = !!row;
  const [form, setForm] = useState({
    accountname: row?.accountname || "",
    tipoligacao: row?.tipoligacao || "DDI",
    acao:        row?.acao        || "L",
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.accountname.trim()) { toast("Account name é obrigatório", "error"); return; }
    setLoading(true);
    try {
      const url    = isEdit
        ? `${API}/ldi/${encodeURIComponent(row.accountname)}/${encodeURIComponent(row.tipoligacao)}`
        : `${API}/ldi`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Erro");
      }
      toast(isEdit ? "Registro atualizado!" : "Registro criado!");
      onSaved();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-title">{isEdit ? "Editar Registro" : "Novo Registro"}</span>
            {isEdit && <span className="modal-badge">{row.accountname} · {row.tipoligacao}</span>}
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <div className="section-label">Identificação</div>
            <div className="field">
              <label>Account Name</label>
              <input
                value={form.accountname}
                onChange={e => set("accountname", e.target.value.replace(/\D/g, ""))}
                placeholder="Ex: 3131032280"
                maxLength={20}
                readOnly={isEdit}
                style={isEdit ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              />
            </div>
          </div>

          <div className="modal-section">
            <div className="section-label">Configuração</div>
            <div className="field-grid-2">
              <div className="field">
                <label>Tipo de Ligação</label>
                <select
                  value={form.tipoligacao}
                  onChange={e => set("tipoligacao", e.target.value)}
                  disabled={isEdit}
                  style={isEdit ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  {TIPO_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Ação</label>
                <select value={form.acao} onChange={e => set("acao", e.target.value)}>
                  {ACAO_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
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
      <div className="modal-box" style={{ width: 380 }} onClick={e => e.stopPropagation()}>
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

const TIPO_COLORS = {
  DDI:       "#60a5fa",
  DDDOUTROS: "#f0883e",
  VC1:       "#a78bfa",
  DDIOUTROS: "#4ade80",
};

export default function PainelLDI() {
  const [rows, setRows]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [inputVal, setInputVal] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterAcao, setFilterAcao] = useState("");
  const [loading, setLoading]   = useState(false);
  const [modal, setModal]       = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchRows = useCallback(async (q = search, p = page, tipo = filterTipo, acao = filterAcao) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: PAGE_SIZE });
      if (q.trim())   params.append("q",    q.trim());
      if (tipo)       params.append("tipo", tipo);
      if (acao)       params.append("acao", acao);
      const res  = await fetch(`${API}/ldi?${params}`);
      const data = await res.json();
      setRows(data.rows);
      setTotal(data.total);
    } catch {
      toast("Erro ao conectar ao servidor", "error");
    } finally {
      setLoading(false);
    }
  }, [search, page, filterTipo, filterAcao]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  // ── Debounce busca ─────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setSearch(inputVal); setPage(1); }, 600);
    return () => clearTimeout(t);
  }, [inputVal]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { setSearch(inputVal); setPage(1); }
  };

  // ── Filtros rápidos ────────────────────────────────────────────────────────
  const handleFilterTipo = (v) => {
    const novo = filterTipo === v ? "" : v;
    setFilterTipo(novo);
    setPage(1);
    fetchRows(search, 1, novo, filterAcao);
  };

  const handleFilterAcao = (v) => {
    const novo = filterAcao === v ? "" : v;
    setFilterAcao(novo);
    setPage(1);
    fetchRows(search, 1, filterTipo, novo);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (accountname, tipoligacao) => {
    try {
      const res = await fetch(
        `${API}/ldi/${encodeURIComponent(accountname)}/${encodeURIComponent(tipoligacao)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      toast("Registro removido!");
      fetchRows(search, page, filterTipo, filterAcao);
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
    fetchRows(search, p, filterTipo, filterAcao);
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
        placeholder="Buscar account name..."
        style={{ width: 210 }}
      />
      <button
        className="btn-add-main"
        title="Novo Registro"
        onClick={() => setModal({ type: "form" })}
      >
        ＋
      </button>
    </div>
  );

  return (
    <Layout submenuAtivo="ldi" input={searchInput}>
      <div className="content">

        {/* Toolbar */}
        <div className="gs-toolbar" style={{ marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div className="gs-stats">
            <span className="gs-stat">
              <span className="gs-stat-val">{total.toLocaleString("pt-BR")}</span> registros
            </span>
            {(search || filterTipo || filterAcao) && (
              <button
                onClick={() => {
                  setInputVal(""); setSearch("");
                  setFilterTipo(""); setFilterAcao("");
                  setPage(1);
                  fetchRows("", 1, "", "");
                }}
                style={{ marginLeft: 8, background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12 }}
              >
                ✕ limpar filtros
              </button>
            )}
          </div>

          {/* Filtros rápidos */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TIPO_OPTIONS.map(t => (
              <button
                key={t}
                onClick={() => handleFilterTipo(t)}
                className="ldi-filter-btn"
                style={{
                  color: TIPO_COLORS[t] || "#94a3b8",
                  borderColor: filterTipo === t ? (TIPO_COLORS[t] || "#94a3b8") : "var(--border)",
                  background: filterTipo === t ? `${(TIPO_COLORS[t] || "#94a3b8")}22` : "transparent",
                }}
              >
                {t}
              </button>
            ))}
            <div style={{ width: 1, background: "var(--border)", margin: "0 2px" }} />
            {ACAO_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => handleFilterAcao(o.value)}
                className="ldi-filter-btn"
                style={{
                  color: o.value === "L" ? "#4ade80" : "#f87171",
                  borderColor: filterAcao === o.value ? (o.value === "L" ? "#4ade80" : "#f87171") : "var(--border)",
                  background: filterAcao === o.value
                    ? (o.value === "L" ? "#4ade8022" : "#f8717122")
                    : "transparent",
                }}
              >
                {o.value === "L" ? "✓ Liberar" : "✕ Bloquear"}
              </button>
            ))}
          </div>

          {/* Paginação topo */}
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
                <th style={{ textAlign: "left" }}>Account Name</th>
                <th>Tipo de Ligação</th>
                <th>Ação</th>
                <th style={{ width: 90 }}>Editar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="gs-empty"><span className="cl-spinner" /> Carregando...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="gs-empty">Nenhum registro encontrado</td></tr>
              ) : rows.map((row, i) => (
                <tr key={`${row.accountname}-${row.tipoligacao}`}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td>
                    <span className="gs-code" style={{ color: "#e2e8f0" }}>{row.accountname}</span>
                  </td>
                  <td>
                    <span className="ldi-tipo-badge" style={{
                      color: TIPO_COLORS[row.tipoligacao] || "#94a3b8",
                      borderColor: `${TIPO_COLORS[row.tipoligacao] || "#94a3b8"}44`,
                      background:  `${TIPO_COLORS[row.tipoligacao] || "#94a3b8"}11`,
                    }}>
                      {row.tipoligacao}
                    </span>
                  </td>
                  <td>
                    <span className={`ldi-acao-badge ${row.acao === "L" ? "ldi-acao-l" : "ldi-acao-b"}`}>
                      {row.acao === "L" ? "✓ Liberar" : "✕ Bloquear"}
                    </span>
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
        <LdiModal
          row={modal.data}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchRows(search, page, filterTipo, filterAcao); }}
        />
      )}
      {modal?.type === "confirm" && (
        <ConfirmModal
          message={`Remover "${modal.data.accountname}" — ${modal.data.tipoligacao}?`}
          onConfirm={() => handleDelete(modal.data.accountname, modal.data.tipoligacao)}
          onClose={() => setModal(null)}
        />
      )}
    </Layout>
  );
}