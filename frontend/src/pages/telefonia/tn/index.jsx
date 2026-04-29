import React, { useState, useEffect } from "react";
import { PencilLine, X, Save, Plus, Trash2 } from "lucide-react";
import Layout from "../../../components/Layout";
import "./style.css";

/* ─────────────────────────────────────────────
   Componente de Seção (Reutilizável)
───────────────────────────────────────────── */
function Secao({ titulo, temDado, onSalvar, onCancelar, onRemover, children }) {
  const [editando, setEditando] = useState(false);
  const [adicionando, setAdicionando] = useState(false);

  const ativo = temDado ? editando : adicionando;

  const handleSalvar = () => {
    onSalvar();
    setEditando(false);
    setAdicionando(false);
  };

  const handleCancelar = () => {
    onCancelar();
    setEditando(false);
    setAdicionando(false);
  };

  return (
    <div className="modal-section">
      <div className="section-header">
        <div className="section-label">{titulo}</div>
        {!ativo && (
          <div className="section-header-btns">
            {temDado ? (
              <>
                <button className="sec-btn sec-btn-remove" onClick={onRemover} title="Remover">
                  <Trash2 size={12} /> Remover
                </button>
                <button className="sec-btn sec-btn-edit" onClick={() => setEditando(true)} title="Editar">
                  <PencilLine size={12} /> Editar
                </button>
              </>
            ) : (
              <button className="sec-btn sec-btn-add" onClick={() => setAdicionando(true)} title="Adicionar">
                <Plus size={12} /> Adicionar
              </button>
            )}
          </div>
        )}
      </div>

      {!temDado && !adicionando && <p className="sec-empty">Nenhum registro encontrado.</p>}

      {(temDado || adicionando) && (
        <>
          <div className={ativo ? "" : "sec-readonly-wrap"}>{children(ativo)}</div>
          {ativo && (
            <div className="sec-actions">
              <button className="sec-btn sec-btn-cancel" onClick={handleCancelar}>
                <X size={12} /> Cancelar
              </button>
              <button className="sec-btn sec-btn-save" onClick={handleSalvar}>
                <Save size={12} /> Salvar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Modal de Edição
───────────────────────────────────────────── */
function ModalEdicao({ aberto, onFechar, registro, dados, onSalvar }) {
  const [form, setForm] = useState({});
  const [original, setOriginal] = useState({});

  useEffect(() => {
    if (!registro) return;

    const tn = String(registro.terminalnumber ?? registro.number ?? "");
    const sip = dados.sipdevices.find(s => tn.includes(String(s.username))) || dados.sipdevices.find(s => s.username.includes(String(registro.number))) || null;
    const acc = dados.accounts.find(a => tn.includes(String(a.number)))  || null;
    const did = dados.dids.find(d => tn.includes(String(d.number))) || null;

    let sipPassword = "";
    try { sipPassword = JSON.parse(sip?.dir_params || "{}").password ?? ""; } catch { }
    try { sipPassword = JSON.parse(sip?.dir_params || "{}").PASSWORD ?? ""; } catch { }
    let sipCallerId = "";
    try { sipCallerId = JSON.parse(sip?.dir_vars || "{}").effective_caller_id_number ?? ""; } catch { }

    const valores = {
      terminalid: registro.terminalid ?? "",
      terminaltipo: registro.terminaltipo ?? "TT_1",
      terminalnumber: tn,
      password: registro.password ?? "",
      codcidade: registro.codcidade ?? "",
      codinst: registro.codinst ?? "",
      osid: registro.osid ?? "",
      dataativacao: registro.dataativacao ? registro.dataativacao.split("T")[0] : "",
      datacancelamento: registro.datacancelamento ? registro.datacancelamento.split("T")[0] : "",
      sip_username: sip?.username ?? tn,
      sip_dir_params: sipPassword,
      sip_dir_vars: sipCallerId,
      acc_number: acc?.number ?? tn,
      acc_password: acc?.password ?? "",
      did_number: did?.number ?? tn,
      did_extensions: (did?.extensions ?? "").split("@")[0],
      _temTerminal: !!registro.terminalid,
      _temSip: !!sip,
      _temAcc: !!acc,
      _temDid: !!did,
    };

    setForm(valores);
    setOriginal(valores);
  }, [registro, dados]);
  //console.log("Form atualizado:", form);


  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const cancelarSecao = (keys) => {
    setForm(f => {
      const restore = {};
      keys.forEach(k => { restore[k] = original[k]; });
      return { ...f, ...restore };
    });
  };

  if (!aberto) return null;

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-title">Alterar Registro</span>
            <span className="modal-badge">{form.terminalnumber}</span>
          </div>
          <button className="modal-close-btn" onClick={onFechar}><X size={15} /></button>
        </div>

        <div className="modal-body">
          <Secao
            titulo="Terminal"
            temDado={form._temTerminal}
            onSalvar={() => onSalvar({ secao: "terminal", acao: "salvar", dados: form })}
            onRemover={() => onSalvar({ secao: "terminal", acao: "remover", dados: form })}
            onCancelar={() => cancelarSecao(["terminaltipo", "password", "codcidade", "codinst"])}
          >
            {(ativo) => (
              <>
                <div className="field-grid-2">
                  <div className="field"><label>Terminal ID</label><input readOnly value={form.terminalid} /></div>
                  <div className="field">
                    <label>Provisiona</label>
                    <select disabled={!ativo} value={form.terminaltipo} onChange={e => set("terminaltipo", e.target.value)}>
                      <option value="TT_1">Sim</option><option value="TT_2">Não</option>
                    </select>
                  </div>
                </div>
                <div className="field-grid-2">
                  <div className="field"><label>Número (TN)</label><input readOnly value={form.terminalnumber} /></div>
                  <div className="field"><label>Senha</label><input readOnly={!ativo} value={form.password} onChange={e => set("password", e.target.value)} /></div>
                </div>
                <div className="field-grid-2">
                  <div className="field"><label>Cidade</label><input readOnly={!ativo} value={form.codcidade} onChange={e => set("codcidade", e.target.value)} /></div>
                  <div className="field"><label>Host</label><input readOnly={!ativo} value={form.codinst} onChange={e => set("codinst", e.target.value)} /></div>
                </div>
              </>
            )}
          </Secao>

          <Secao
            titulo="SIP Device"
            temDado={form._temSip}
            onSalvar={() => onSalvar({ secao: "sip", acao: "salvar", dados: form })}
            onRemover={() => onSalvar({ secao: "sip", acao: "remover", dados: form })}
            onCancelar={() => cancelarSecao(["sip_username", "sip_dir_params"])}
          >
            {(ativo) => (
              <div className="field-grid-2">
                <div className="field"><label>Username</label><input readOnly={!ativo} value={form.sip_username} onChange={e => set("sip_username", e.target.value)} /></div>
                <div className="field"><label>Senha</label><input readOnly={!ativo} value={form.sip_dir_params} onChange={e => set("sip_dir_params", e.target.value)} /></div>
              </div>
            )}
          </Secao>

          <Secao
            titulo="Account"
            temDado={form._temAcc}
            onSalvar={() => onSalvar({ secao: "account", acao: "salvar", dados: form })}
            onRemover={() => onSalvar({ secao: "account", acao: "remover", dados: form })}
            onCancelar={() => cancelarSecao(["acc_number", "acc_password"])}
          >
            {(ativo) => (
              <div className="field-grid-2">
                <div className="field"><label>Número</label><input readOnly={!ativo} value={form.acc_number} onChange={e => set("acc_number", e.target.value)} /></div>
                <div className="field"><label>Senha</label><input readOnly={!ativo} value={form.acc_password} onChange={e => set("acc_password", e.target.value)} /></div>
              </div>
            )}
          </Secao>

          <Secao
            titulo="DID"
            temDado={form._temDid}
            onSalvar={() => onSalvar({ secao: "did", acao: "salvar", dados: form })}
            onRemover={() => onSalvar({ secao: "did", acao: "remover", dados: form })}
            onCancelar={() => cancelarSecao(["did_number", "did_extensions"])}
          >
            {(ativo) => (
              <div className="field-grid-2">
                <div className="field"><label>Número</label><input readOnly={!ativo} value={form.did_number} onChange={e => set("did_number", e.target.value)} /></div>
                <div className="field"><label>Ramal (Extensions)</label><input readOnly={!ativo} value={form.did_extensions} onChange={e => set("did_extensions", e.target.value)} /></div>
              </div>
            )}
          </Secao>
        </div>
        <div className="modal-footer"><button className="btn-cancel" onClick={onFechar}>Fechar</button></div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Painel Principal
───────────────────────────────────────────── */
export default function PainelTelecom() {
  const [valor, setValor] = useState("");
  const [dados, setDados] = useState({ resultado: [], dids: [], sipdevices: [], accounts: [] });
  const [modalAberto, setModalAberto] = useState(false);
  const [registroEditando, setRegistroEditando] = useState(null);

  const buscar = async () => {
    if (!valor) return;
    const res = await fetch(`${import.meta.env.VITE_URI_BACKEND}/telefonia/tn?tn=${encodeURIComponent(valor)}`);
    const data = await res.json();
    setDados({
      resultado: data.resultado ?? [],
      dids: data.dids ?? [],
      sipdevices: data.sipdevices ?? [],
      accounts: data.accounts ?? []
    });
  };

  const abrirModal = (reg) => { setRegistroEditando(reg); setModalAberto(true); };
  const handleNovo = () => { setRegistroEditando({ terminalnumber: valor }); setModalAberto(true); };

  const salvar = async ({ secao, acao, dados: form }) => {
    if (acao === "remover" && !window.confirm(`Excluir permanentemente a seção ${secao}?`)) return;

    try {
      let url = `${import.meta.env.VITE_URI_BACKEND}/telefonia/${secao}`;
      let method = acao === "remover" ? "DELETE" : "POST";

      if (acao === "remover") {
        const idMap = { terminal: form.terminalid, sip: form.sip_username, account: form.acc_number, did: form.did_number };
        url += `/${idMap[secao]}`;
      }

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: acao === "salvar" ? JSON.stringify(form) : null
      });

      if (response.ok) {
        alert("Operação realizada com sucesso!");
        buscar();
      } else {
        const err = await response.json();
        alert(`Erro: ${err.erro}`);
      }
    } catch (error) { alert("Erro de conexão."); }
  };

  const dot = (ok) => <span className={`dot ${ok ? "green" : "red"}`}></span>;

  return (
    <Layout
      submenuAtivo="tn"
      input={
        <div className="search-container">
          <input
            placeholder="Pesquisar"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
          />
          <button className="btn-add-main" onClick={handleNovo} title="Novo Registro"><Plus size={20} /></button>
        </div>
      }
    >
      <div className="content">
        <table className="telecom-table">
          <thead>
            <tr><th>TN</th><th>ID</th><th>Host</th><th>Cidade</th><th>Senha</th><th>Tronco</th><th>Terminal</th><th>SIP</th><th>ACC</th><th>DID</th><th></th></tr>
          </thead>
          <tbody>
            {dados.resultado.length === 0 ? (
              <tr><td colSpan={9}>Busque um número para exibir resultados.</td></tr>
            ) : (
              dados.resultado.map((item) => (
                <tr key={item.terminalid}>
                  <td>{item.terminalnumber}</td><td>{item.terminalid}</td><td>{item.codinst}</td><td>{item.codcidade}</td><td>{item.password}</td><td>{dados.dids
                    .filter(did => String(item.terminalnumber).includes(String(did.number)))
                    .map(did => did.extensions.split("@")[0])
                    .join(", ")}</td>
                  <td>{dot(true)}</td>
                  <td>{dot(dados.sipdevices.some(s => String(item.terminalnumber).includes(String(s.username))))}</td>
                  <td>{dot(dados.accounts.some(a => String(item.terminalnumber).includes(String(a.number))))}</td>
                  <td>{dot(dados.dids.some(d => String(item.terminalnumber).includes(String(d.number))))}</td>
                  <td><button className="buttonalterar" onClick={() => abrirModal(item)}><PencilLine size={18} /></button></td>
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


                  <td><button className="buttonalterar" onClick={() => abrirModal(item)}><PencilLine size={18} /></button></td>

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


                    <td><button className="buttonalterar" onClick={() => abrirModal(item)}><PencilLine size={18} /></button></td>

                  </tr>
                ))}
            </tbody>
          )}



          {/* CASO 4: só account encontrados (sem resultado) */}
          {dados.resultado.length === 0 && dados.dids.length === 0 && dados.accounts.length !== 0 && dados.sipdevices.length === 0 && (
            <tbody>
              {dados.accounts.map((item) => (
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


                  <td><button className="buttonalterar" onClick={() => abrirModal(item)}><PencilLine size={18} /></button></td>

                </tr>
              ))}
            </tbody>
          )}



          {/* CASO : só sipdevices encontrados (sem resultado) */}
          {dados.resultado.length === 0 && dados.dids.length === 0 && dados.accounts.length === 0 && dados.sipdevices !== 0 && (
            <tbody>
              {dados.sipdevices.map((item) => (
                <tr key={item.username}>
                  <td>{item.username}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>{String(item.extensions).split("@")[0]}</td>


                  <td><span className="dot red"></span></td>

                  {/* SIP DEVICES */}
                  <td>
                    <span className="dot green"></span>

                  </td>

                  {/* ACCOUNT */}
                  <td>

                    <span className="dot red"></span>
                  </td>

                  {/* DID */}
                  <td>

                    <span className="dot red"></span>
                  </td>


                  <td><button className="buttonalterar" onClick={() => abrirModal(item)}><PencilLine size={18} /></button></td>

                </tr>
              ))}
            </tbody>
          )}

          {/* CASO : só sipdevices encontrados (sem resultado) */}
          {dados.resultado.length === 0 && dados.dids.length === 0 && dados.accounts.length !== 0 && dados.sipdevices !== 0 && (
            <tbody>
              {dados.accounts.map((item) => (
                <tr key={item.number}>
                  <td>{item.number}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>{String(item.extensions).split("@")[0]}</td>


                  <td><span className="dot red"></span></td>

                  {/* SIP DEVICES */}
                  <td>
                    <span className="dot green"></span>

                  </td>

                  {/* ACCOUNT */}
                  <td>

                    <span className="dot green"></span>
                  </td>

                  {/* DID */}
                  <td>

                    <span className="dot red"></span>
                  </td>


                  <td><button className="buttonalterar" onClick={() => abrirModal(item)}><PencilLine size={18} /></button></td>

                </tr>
              ))}
            </tbody>
          )}

        </table>
      </div>
      <ModalEdicao aberto={modalAberto} onFechar={() => setModalAberto(false)} registro={registroEditando} dados={dados} onSalvar={salvar} />
    </Layout>
  );
}