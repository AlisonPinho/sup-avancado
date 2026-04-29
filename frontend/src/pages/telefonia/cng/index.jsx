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

// ── Modal principal (visualizar + editar número) ──────────────────────────────
function CngModal({ item, onClose, onSaved }) {
  const isNew = !item;

  // Dados do formulário
  const [numero, setNumero]         = useState(item?.numero    || "");
  const [rn1, setRn1]               = useState(item?.cng?.rn1  ?? "");
  const [routeData, setRouteData]   = useState(
    item?.route
      ? { ...item.route }
      : { pattern: "", comment: "", connectcost: "0", includedseconds: "0", cost: "0", pricelist_id: "1", inc: "1", reseller_id: "0", precedence: "0", status: "1" }
  );
  const [hasCng, setHasCng]         = useState(!!item?.cng);
  const [hasRoute, setHasRoute]     = useState(!!item?.route);
  const [loading, setLoading]       = useState(false);

  const setRoute = (k, v) => setRouteData(r => ({ ...r, [k]: v }));

  // Quando numero muda, atualiza o pattern automaticamente
  useEffect(() => {
    if (!item && numero) {
      setRouteData(r => ({ ...r, pattern: `^0${numero}$` }));
    }
  }, [numero, item]);

  const handleSave = async () => {
    if (!numero.trim()) { toast("Número é obrigatório", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch(
        isNew ? `${API}/cng` : `${API}/cng/${encodeURIComponent(item.numero)}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numero,
            cng:   hasCng   ? { rn1 }      : null,
            route: hasRoute ? routeData     : null,
          }),
        }
      );
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Erro");
      }
      toast(isNew ? "Número criado!" : "Número atualizado!");
      onSaved();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" style={{ width: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-title">{isNew ? "Novo Número CNG" : `Editar — ${item.numero}`}</span>
            {!isNew && <span className="modal-badge">{item.numero}</span>}
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {/* Número */}
          <div className="modal-section">
            <div className="section-label">Número</div>
            <div className="field">
              <label>Número (sem prefixo 0)</label>
              <input
                value={numero}
                onChange={e => setNumero(e.target.value.replace(/\D/g, ""))}
                placeholder="Ex: 800992150"
                readOnly={!isNew}
                style={!isNew ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              />
            </div>
          </div>

          {/* CNG */}
          <div className="modal-section">
            <div className="section-header">
              <span className="section-label" style={{ flex: "none", marginBottom: 0 }}>
                Tabela CNG
              </span>
              <div style={{ flex: 1, height: 1, background: "#1b3558", margin: "0 12px" }} />
              <div className="section-header-btns">
                <button
                  className={`sec-btn ${hasCng ? "sec-btn-cancel" : "sec-btn-add"}`}
                  onClick={() => setHasCng(v => !v)}
                >
                  {hasCng ? "✕ Remover" : "+ Adicionar"}
                </button>
              </div>
            </div>

            {hasCng ? (
              <div className="field" style={{ marginTop: 12 }}>
                <label>RN1</label>
                <input
                  value={rn1}
                  onChange={e => setRn1(e.target.value)}
                  placeholder="Ex: 55321"
                />
              </div>
            ) : (
              <p className="sec-empty" style={{ marginTop: 8 }}>
                Número não cadastrado na tabela CNG
              </p>
            )}
          </div>

          {/* Route */}
          <div className="modal-section">
            <div className="section-header">
              <span className="section-label" style={{ flex: "none", marginBottom: 0 }}>
                Tabela Routes
              </span>
              <div style={{ flex: 1, height: 1, background: "#1b3558", margin: "0 12px" }} />
              <div className="section-header-btns">
                <button
                  className={`sec-btn ${hasRoute ? "sec-btn-cancel" : "sec-btn-add"}`}
                  onClick={() => setHasRoute(v => !v)}
                >
                  {hasRoute ? "✕ Remover" : "+ Adicionar"}
                </button>
              </div>
            </div>

            {hasRoute ? (
              <div style={{ marginTop: 12 }}>
                <div className="field-grid-2">
                  <div className="field">
                    <label>Pattern</label>
                    <input
                      value={routeData.pattern}
                      onChange={e => setRoute("pattern", e.target.value)}
                      placeholder="Ex: ^08000992150$"
                    />
                  </div>
                  <div className="field">
                    <label>Comment</label>
                    <input
                      value={routeData.comment}
                      onChange={e => setRoute("comment", e.target.value)}
                      placeholder="Ex: DID:Brazil,,"
                    />
                  </div>
                </div>
                <div className="field-grid-2">
                  <div className="field">
                    <label>Connect Cost</label>
                    <input type="number" value={routeData.connectcost} onChange={e => setRoute("connectcost", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Included Seconds</label>
                    <input type="number" value={routeData.includedseconds} onChange={e => setRoute("includedseconds", e.target.value)} />
                  </div>
                </div>
                <div className="field-grid-2">
                  <div className="field">
                    <label>Cost</label>
                    <input type="number" value={routeData.cost} onChange={e => setRoute("cost", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Pricelist ID</label>
                    <input type="number" value={routeData.pricelist_id} onChange={e => setRoute("pricelist_id", e.target.value)} />
                  </div>
                </div>
                <div className="field-grid-2">
                  <div className="field">
                    <label>Inc</label>
                    <input type="number" value={routeData.inc} onChange={e => setRoute("inc", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Reseller ID</label>
                    <input type="number" value={routeData.reseller_id} onChange={e => setRoute("reseller_id", e.target.value)} />
                  </div>
                </div>
                <div className="field-grid-2">
                  <div className="field">
                    <label>Precedence</label>
                    <input type="number" value={routeData.precedence} onChange={e => setRoute("precedence", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Status</label>
                    <select value={routeData.status} onChange={e => setRoute("status", e.target.value)}>
                      <option value="1">Ativo (1)</option>
                      <option value="0">Inativo (0)</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <p className="sec-empty" style={{ marginTop: 8 }}>
                Número não cadastrado na tabela Routes
              </p>
            )}
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
      <div className="modal-box" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
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
          <button className="btn-save" style={{ background: "#dc2626", borderColor: "#b91c1c" }} onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
const PAGE_SIZE = 50;

export default function PainelCNG() {
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
      const res  = await fetch(`${API}/cng?${params}`);
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
      const res = await fetch(`${API}/cng/${encodeURIComponent(numero)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Número removido das duas tabelas!");
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
        placeholder="Buscar número CNG..."
        style={{ width: 230 }}
      />
      <button
        className="btn-add-main"
        title="Novo Número CNG"
        onClick={() => setModal({ type: "form" })}
      >
        ＋
      </button>
    </div>
  );

  return (
    <Layout submenuAtivo="cng" input={searchInput}>
      <div className="content">

        {/* Toolbar */}
        <div className="gs-toolbar" style={{ marginBottom: 12 }}>
          <div className="gs-stats">
            <span className="gs-stat">
              <span className="gs-stat-val">{total.toLocaleString("pt-BR")}</span> números
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
                {/* CNG */}
                <th>RN1 (CNG)</th>
                {/* Routes */}
                <th style={{ textAlign: "left" }}>Pattern (Route)</th>
                <th>Comment</th>
                <th>Status</th>
                <th style={{ width: 90 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="gs-empty"><span className="cl-spinner" /> Carregando...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="gs-empty">Nenhum registro encontrado</td></tr>
              ) : rows.map((row, i) => (
                <tr key={row.numero}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td>
                    <span className="gs-code" style={{ color: "#4ade80" }}>{row.numero}</span>
                  </td>

                  {/* CNG */}
                  <td>
                    {row.cng
                      ? <span className="gs-code">{row.cng.rn1}</span>
                      : <span className="cng-absent">— sem CNG —</span>
                    }
                  </td>

                  {/* Routes */}
                  <td>
                    {row.route
                      ? <span className="gs-code" style={{ color: "#f0883e" }}>{row.route.pattern}</span>
                      : <span className="cng-absent">— sem route —</span>
                    }
                  </td>
                  <td>
                    {row.route
                      ? <span className="gs-code" style={{ color: "#94a3b8" }}>{row.route.comment}</span>
                      : <span style={{ color: "#334155" }}>—</span>
                    }
                  </td>
                  <td>
                    {row.route
                      ? <span className={`dot ${row.route.status == 1 ? "green" : "red"}`} title={row.route.status == 1 ? "Ativo" : "Inativo"} />
                      : <span style={{ color: "#334155" }}>—</span>
                    }
                  </td>

                  <td>
                    <div className="gs-actions">
                      <button className="buttonalterar" title="Editar"
                        onClick={() => setModal({ type: "form", data: row })}>
                        ✏
                      </button>
                      <button className="buttonalterar gs-danger" title="Excluir"
                        onClick={() => setModal({ type: "confirm", data: row })}>
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
        <CngModal
          item={modal.data}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchRows(search, page); }}
        />
      )}
      {modal?.type === "confirm" && (
        <ConfirmModal
          message={`Remover o número "${modal.data.numero}" das tabelas CNG e Routes?`}
          onConfirm={() => handleDelete(modal.data.numero)}
          onClose={() => setModal(null)}
        />
      )}
    </Layout>
  );
}