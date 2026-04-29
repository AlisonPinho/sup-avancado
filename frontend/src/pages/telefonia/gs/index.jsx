import { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import "./style.css";

const backend = import.meta.env.VITE_URI_BACKEND;
const API = backend+"/api";

// ── Utilitários ──────────────────────────────────────────────────────────────
function toast(msg, type = "success") {
  const el = document.createElement("div");
  el.className = `gs-toast gs-toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("gs-toast-show"), 10);
  setTimeout(() => { el.classList.remove("gs-toast-show"); setTimeout(() => el.remove(), 300); }, 2800);
}

// ── Modal de Tenant ──────────────────────────────────────────────────────────
function TenantModal({ tenant, onClose, onSaved }) {
  const isEdit = !!tenant?.id;
  const [form, setForm] = useState({
    tenant_name: tenant?.tenant_name || "",
    active: tenant?.active ?? 1,
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.tenant_name.trim()) { toast("Nome é obrigatório", "error"); return; }
    setLoading(true);
    try {
      const url = isEdit ? `${API}/tenants/${tenant.id}` : `${API}/tenants`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast(isEdit ? "Cliente atualizado!" : "Cliente criado!");
      onSaved();
    } catch {
      toast("Erro ao salvar", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-title">{isEdit ? "Editar Cliente" : "Novo Cliente"}</span>
            {isEdit && <span className="modal-badge">#{tenant.tenant_id}</span>}
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <div className="section-label">Dados do Cliente</div>
            <div className="field">
              <label>Nome</label>
              <input value={form.tenant_name} onChange={e => set("tenant_name", e.target.value)} placeholder="Ex: Unimed" />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.active} onChange={e => set("active", Number(e.target.value))}>
                <option value={1}>Ativo</option>
                <option value={0}>Inativo</option>
              </select>
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

// ── Modal de Tag ─────────────────────────────────────────────────────────────
function TagModal({ tag, tenants, defaultTenantId, onClose, onSaved }) {
  const isEdit = !!tag?.id;
  const [form, setForm] = useState({
    tag_id: tag?.tag_id || "",
    tag_description: tag?.tag_description || "",
    value: tag?.value || "",
    tenant_id: tag?.tenant_id ?? defaultTenantId ?? tenants[0]?.tenant_id,
    active: tag?.active ?? 1,
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.tag_id.trim()) { toast("Tag ID é obrigatório", "error"); return; }
    setLoading(true);
    try {
      const url = isEdit ? `${API}/tags/${tag.id}` : `${API}/tags`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast(isEdit ? "Tag atualizada!" : "Tag criada!");
      onSaved();
    } catch {
      toast("Erro ao salvar", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-title">{isEdit ? "Editar Tag" : "Nova Tag"}</span>
            {isEdit && <span className="modal-badge">#{tag.id}</span>}
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <div className="section-label">Identificação</div>
            <div className="field-grid-2">
              <div className="field">
                <label>Tag ID</label>
                <input value={form.tag_id} onChange={e => set("tag_id", e.target.value)} placeholder="Ex: P47" />
              </div>
              <div className="field">
                <label>Status</label>
                <select value={form.active} onChange={e => set("active", Number(e.target.value))}>
                  <option value={1}>Ativo</option>
                  <option value={0}>Inativo</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Descrição</label>
              <input value={form.tag_description} onChange={e => set("tag_description", e.target.value)} placeholder="Ex: Sip Server" />
            </div>
          </div>

          <div className="modal-section">
            <div className="section-label">Configuração</div>
            <div className="field">
              <label>Valor</label>
              <input value={form.value} onChange={e => set("value", e.target.value)} placeholder="Ex: 192.168.1.1" />
            </div>
            <div className="field">
              <label>Cliente</label>
              <select value={form.tenant_id} onChange={e => set("tenant_id", Number(e.target.value))}>
                {tenants.map(t => (
                  <option key={t.tenant_id} value={t.tenant_id}>#{t.tenant_id} — {t.tenant_name}</option>
                ))}
              </select>
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

// ── Confirmar exclusão ────────────────────────────────────────────────────────
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
          <button className="btn-save" style={{ background: "#dc2626", borderColor: "#b91c1c" }} onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function PainelGS() {
  const [tab, setTab] = useState("clientes"); // "clientes" | "tags"
  const [tenants, setTenants] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  // modal: { type: "tenant"|"tag"|"confirmTenant"|"confirmTag", data?: any }

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tRes, gRes] = await Promise.all([
        fetch(`${API}/tenants`),
        fetch(`${API}/tags`),
      ]);
      const [tData, gData] = await Promise.all([tRes.json(), gRes.json()]);
      setTenants(tData);
      setTags(gData);
    } catch {
      toast("Erro ao conectar ao servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Deletar tenant ─────────────────────────────────────────────────────────
  const deleteTenant = async (id) => {
    try {
      await fetch(`${API}/tenants/${id}`, { method: "DELETE" });
      toast("Cliente removido!");
      if (selectedTenant?.id === id) setSelectedTenant(null);
      fetchAll();
    } catch { toast("Erro ao remover", "error"); }
    setModal(null);
  };

  // ── Deletar tag ────────────────────────────────────────────────────────────
  const deleteTag = async (id) => {
    try {
      await fetch(`${API}/tags/${id}`, { method: "DELETE" });
      toast("Tag removida!");
      fetchAll();
    } catch { toast("Erro ao remover", "error"); }
    setModal(null);
  };

  // ── Dados filtrados ────────────────────────────────────────────────────────
  const filteredTenants = tenants.filter(t =>
    t.tenant_name.toLowerCase().includes(search.toLowerCase()) ||
    String(t.tenant_id).includes(search)
  );

  const tenantTags = selectedTenant
    ? tags.filter(t => t.tenant_id === selectedTenant.tenant_id)
    : [];

  const filteredTags = tenantTags.filter(t =>
    t.tag_id.toLowerCase().includes(search.toLowerCase()) ||
    t.tag_description.toLowerCase().includes(search.toLowerCase()) ||
    t.value.toLowerCase().includes(search.toLowerCase())
  );

  const tagCountFor = (tid) => tags.filter(t => t.tenant_id === tid).length;

  // ── View de Clientes ───────────────────────────────────────────────────────
  const viewClientes = (
    <>
      <div className="gs-toolbar">
        <div className="gs-stats">
          <span className="gs-stat"><span className="gs-stat-val">{tenants.length}</span> clientes</span>
          <span className="gs-stat"><span className="gs-stat-val gs-green">{tenants.filter(t => t.active).length}</span> ativos</span>
          <span className="gs-stat"><span className="gs-stat-val">{tags.length}</span> tags totais</span>
        </div>
        <button className="btn-add-main" title="Novo Cliente" onClick={() => setModal({ type: "tenant" })}>＋</button>
      </div>

      <div className="table-wrapper">
        <table className="telecom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Cliente</th>
              <th>Tags</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="gs-empty">Carregando...</td></tr>
            ) : filteredTenants.length === 0 ? (
              <tr><td colSpan={6} className="gs-empty">Nenhum cliente encontrado</td></tr>
            ) : filteredTenants.map(t => (
              <tr key={t.id}>
                <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{t.id}</td>
                <td><span className="gs-code">{t.tenant_id}</span></td>
                <td style={{ fontWeight: 600, textAlign: "left" }}>{t.tenant_name}</td>
                <td>
                  <span className="gs-badge-blue">{tagCountFor(t.tenant_id)} tags</span>
                </td>
                <td>
                  <span className={`dot ${t.active ? "green" : "red"}`} title={t.active ? "Ativo" : "Inativo"} />
                </td>
                <td>
                  <div className="gs-actions">
                    <button className="buttonalterar" title="Ver Tags"
                      onClick={() => { setSelectedTenant(t); setTab("tags"); setSearch(""); }}>
                      ⚙
                    </button>
                    <button className="buttonalterar" title="Editar"
                      onClick={() => setModal({ type: "tenant", data: t })}>
                      ✏
                    </button>
                    <button className="buttonalterar gs-danger" title="Excluir"
                      onClick={() => setModal({ type: "confirmTenant", data: t })}>
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  // ── View de Tags ───────────────────────────────────────────────────────────
  const viewTags = selectedTenant && (
    <>
      <div className="gs-toolbar">
        <div className="gs-breadcrumb">
          <button className="gs-back" onClick={() => { setTab("clientes"); setSelectedTenant(null); setSearch(""); }}>
            ← Clientes
          </button>
          <span className="gs-breadcrumb-sep">/</span>
          <span className="gs-breadcrumb-cur">{selectedTenant.tenant_name}</span>
          <span className="gs-badge-blue">{tenantTags.length} tags</span>
        </div>
        <button className="btn-add-main" title="Nova Tag"
          onClick={() => setModal({ type: "tag", defaultTenantId: selectedTenant.tenant_id })}>
          ＋
        </button>
      </div>

      <div className="gs-mini-stats">
        <div className="gs-mini-stat">
          <span className="gs-mini-val gs-green">{tenantTags.filter(t => t.active).length}</span>
          <span className="gs-mini-label">Ativas</span>
        </div>
        <div className="gs-mini-stat">
          <span className="gs-mini-val gs-red">{tenantTags.filter(t => !t.active).length}</span>
          <span className="gs-mini-label">Inativas</span>
        </div>
        <div className="gs-mini-stat">
          <span className="gs-mini-val">{tenantTags.length}</span>
          <span className="gs-mini-label">Total</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="telecom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tag ID</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="gs-empty">Carregando...</td></tr>
            ) : filteredTags.length === 0 ? (
              <tr><td colSpan={6} className="gs-empty">Nenhuma tag encontrada</td></tr>
            ) : filteredTags.map(tag => (
              <tr key={tag.id}>
                <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{tag.id}</td>
                <td><span className="gs-code gs-orange">{tag.tag_id}</span></td>
                <td style={{ textAlign: "left" }}>
                  <span className="gs-tag-desc">{tag.tag_description}</span>
                </td>
                <td><span className="gs-code">{tag.value}</span></td>
                <td>
                  <span className={`dot ${tag.active ? "green" : "red"}`} title={tag.active ? "Ativo" : "Inativo"} />
                </td>
                <td>
                  <div className="gs-actions">
                    <button className="buttonalterar" title="Editar"
                      onClick={() => setModal({ type: "tag", data: tag })}>
                      ✏
                    </button>
                    <button className="buttonalterar gs-danger" title="Excluir"
                      onClick={() => setModal({ type: "confirmTag", data: tag })}>
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout
      submenuAtivo="gs"
      input={
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={tab === "clientes" ? "Buscar cliente..." : "Buscar tag..."}
          style={{ width: 220 }}
        />
      }
    >
      <div className="content">
        {/* Sub-abas internas */}
        <div className="gs-tabs">
          <button
            className={`gs-tab ${tab === "clientes" ? "active" : ""}`}
            onClick={() => { setTab("clientes"); setSelectedTenant(null); setSearch(""); }}
          >
            👥 Clientes
          </button>
          {selectedTenant && (
            <button className="gs-tab active">
              ⚙ {selectedTenant.tenant_name}
            </button>
          )}
        </div>

        {tab === "clientes" ? viewClientes : viewTags}
      </div>

      {/* Modais */}
      {modal?.type === "tenant" && (
        <TenantModal
          tenant={modal.data}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchAll(); }}
        />
      )}
      {modal?.type === "tag" && (
        <TagModal
          tag={modal.data}
          tenants={tenants}
          defaultTenantId={modal.defaultTenantId}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchAll(); }}
        />
      )}
      {modal?.type === "confirmTenant" && (
        <ConfirmModal
          message={`Remover o cliente "${modal.data.tenant_name}" e todas as suas tags?`}
          onConfirm={() => deleteTenant(modal.data.id)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "confirmTag" && (
        <ConfirmModal
          message={`Remover a tag "${modal.data.tag_id} — ${modal.data.tag_description}"?`}
          onConfirm={() => deleteTag(modal.data.id)}
          onClose={() => setModal(null)}
        />
      )}
    </Layout>
  );
}