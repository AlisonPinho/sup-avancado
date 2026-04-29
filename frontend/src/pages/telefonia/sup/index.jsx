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
function TridigitoModal({ row, onClose, onSaved }) {
  const isEdit = !!row?.TRIDIGITOID;
  const [form, setForm] = useState({
    CNL:       row?.CNL       ?? "",
    TRIDIGITO: row?.TRIDIGITO ?? "",
    DESTINO:   row?.DESTINO   ?? "",
    DDD:       row?.DDD       ?? "",
    RN1:       row?.RN1       ?? "",
    CIDADE:    row?.CIDADE    ?? "",
    codcidade: row?.codcidade ?? "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.CNL.toString().trim())       { toast("CNL é obrigatório", "error"); return; }
    if (!form.TRIDIGITO.toString().trim()) { toast("Tridigito é obrigatório", "error"); return; }
    if (!form.DESTINO.toString().trim())   { toast("Destino é obrigatório", "error"); return; }
    setLoading(true);
    try {
      const url    = isEdit
        ? `${API}/tridigito/${row.TRIDIGITOID}`
        : `${API}/tridigito`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro");
      }
      toast(isEdit ? "Registro atualizado!" : "Registro criado!");
      onSaved();
    } catch (e) {
      toast(e.message || "Erro ao salvar", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-title">
              {isEdit ? "Editar Tridigito" : "Novo Tridigito"}
            </span>
            {isEdit && <span className="modal-badge">#{row.TRIDIGITOID}</span>}
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Identificação */}
          <div className="modal-section">
            <div className="section-label">Identificação</div>
            <div className="field-grid-2">
              <div className="field">
                <label>CNL</label>
                <input
                  type="number"
                  value={form.CNL}
                  onChange={e => set("CNL", e.target.value)}
                  placeholder="Ex: 31508"
                />
              </div>
              <div className="field">
                <label>Tridigito</label>
                <input
                  type="number"
                  value={form.TRIDIGITO}
                  onChange={e => set("TRIDIGITO", e.target.value)}
                  placeholder="Ex: 193"
                />
              </div>
            </div>
          </div>

          {/* Roteamento */}
          <div className="modal-section">
            <div className="section-label">Roteamento</div>
            <div className="field">
              <label>Destino</label>
              <input
                value={form.DESTINO}
                onChange={e => set("DESTINO", e.target.value)}
                placeholder="Ex: 193 ou 38344448"
              />
            </div>
            <div className="field-grid-2">
              <div className="field">
                <label>DDD</label>
                <input
                  type="number"
                  value={form.DDD}
                  onChange={e => set("DDD", e.target.value)}
                  placeholder="Ex: 31"
                />
              </div>
              <div className="field">
                <label>RN1</label>
                <input
                  value={form.RN1}
                  onChange={e => set("RN1", e.target.value)}
                  placeholder="Ex: 55131"
                />
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="modal-section">
            <div className="section-label">Localização</div>
            <div className="field-grid-2">
              <div className="field">
                <label>SAIDA</label>
                <input
                  value={form.CIDADE}
                  onChange={e => set("CIDADE", e.target.value)}
                  placeholder="Ex: rs-siptestes"
                />
              </div>
              <div className="field">
                <label>Cód. Cidade</label>
                <input
                  value={form.codcidade}
                  onChange={e => set("codcidade", e.target.value)}
                  placeholder="Ex: IBA"
                />
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

export default function PainelSUP() {
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
      const res  = await fetch(`${API}/tridigito?${params}`);
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
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/tridigito/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Registro removido!");
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

  // ── Helpers de exibição ────────────────────────────────────────────────────
  const nullCell = (val) =>
    val === null || val === undefined || val === ""
      ? <span style={{ color: "#334155", fontStyle: "italic" }}>NULL</span>
      : <span className="gs-code">{val}</span>;

  // ── Input submenu ──────────────────────────────────────────────────────────
  const searchInput = (
    <div className="search-container">
      <input
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar tridigito, cidade, destino..."
        style={{ width: 260 }}
      />
      <button
        className="btn-add-main"
        title="Novo Tridigito"
        onClick={() => setModal({ type: "form" })}
      >
        ＋
      </button>
    </div>
  );

  return (
    <Layout submenuAtivo="sup" input={searchInput}>
      <div className="content">

        {/* Toolbar */}
        <div className="gs-toolbar" style={{ marginBottom: 12 }}>
          <div className="gs-stats">
            <span className="gs-stat">
              <span className="gs-stat-val">{total.toLocaleString("pt-BR")}</span> registros
            </span>
            {search && (
              <span className="gs-stat" style={{ color: "var(--primary)" }}>
                filtrando: <strong>{search}</strong>
                <button
                  onClick={() => { setInputVal(""); setSearch(""); setPage(1); }}
                  style={{
                    marginLeft: 8, background: "none", border: "none",
                    color: "#f87171", cursor: "pointer", fontSize: 12,
                  }}
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
                <th style={{ width: 40 }}>#</th>
                <th>ID</th>
                <th>CNL</th>
                <th>Tridigito</th>
                <th>Destino</th>
                <th>DDD</th>
                <th>RN1</th>
                <th>Cidade</th>
                <th>Cód. Cidade</th>
                <th style={{ width: 90 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="gs-empty">
                    <span className="cl-spinner" /> Carregando...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="gs-empty">Nenhum registro encontrado</td>
                </tr>
              ) : rows.map((row, i) => (
                <tr key={row.TRIDIGITOID}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td>
                    <span className="gs-code" style={{ color: "#60a5fa" }}>{row.TRIDIGITOID}</span>
                  </td>
                  <td>
                    <span className="gs-code" style={{ color: "#94a3b8" }}>{row.CNL}</span>
                  </td>
                  <td>
                    <span className="gs-code" style={{ color: "#f0883e" }}>{row.TRIDIGITO}</span>
                  </td>
                  <td>{nullCell(row.DESTINO)}</td>
                  <td>{nullCell(row.DDD)}</td>
                  <td>{nullCell(row.RN1)}</td>
                  <td>
                    {row.CIDADE
                      ? <span className="gs-tag-desc">{row.CIDADE}</span>
                      : <span style={{ color: "#334155", fontStyle: "italic" }}>NULL</span>
                    }
                  </td>
                  <td>{nullCell(row.codcidade)}</td>
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
              <button
                key={p}
                className={`cl-page-btn ${p === page ? "cl-page-active" : ""}`}
                onClick={() => goPage(p)}
              >
                {p}
              </button>
            ))}
            <button className="cl-page-btn" onClick={() => goPage(page + 1)} disabled={page >= totalPages}>›</button>
            <button className="cl-page-btn" onClick={() => goPage(totalPages)} disabled={page >= totalPages}>»</button>
          </div>
        )}
      </div>

      {/* Modais */}
      {modal?.type === "form" && (
        <TridigitoModal
          row={modal.data}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchRows(search, page); }}
        />
      )}
      {modal?.type === "confirm" && (
        <ConfirmModal
          message={`Remover o tridigito ID #${modal.data.TRIDIGITOID} (CNL: ${modal.data.CNL})?`}
          onConfirm={() => handleDelete(modal.data.TRIDIGITOID)}
          onClose={() => setModal(null)}
        />
      )}
    </Layout>
  );
}