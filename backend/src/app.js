const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')

const app = express()

app.use(cors())
app.use(express.json())





const dbConfigFsAsttpProducao = mysql.createPool({
  host: '192.168.200.253',
  port: 3306,
  user: 'valenet',
  password: 'expl@de!',
  database: 'astpp_producao',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

/*

const dbConfigFsAsttpProducao = mysql.createPool({
  host: '192.168.201.243',
  port: 3308,
  user: 'root',
  password: 'Z1mBr@',
  database: 'astpp_producao',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

*/

//Ja está no bando de produção
const dbConfigFsFreeswitchConnections = mysql.createPool({
  host: '192.168.200.253',
  port: 3306,
  user: 'valenet',
  password: 'expl@de!',
  database: 'freeswitch_connections',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})




//Ja está no bando de produção
const dbBlacklistPorOperadora = {
  Vivo: mysql.createPool({
    host: '192.168.100.28',
    port: 3306,
    user: 'opensips',
    password: 'opensipsrw',
    database: 'opensips',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }),
  Claro: mysql.createPool({
    host: '192.168.100.30',
    port: 3306,
    user: 'opensips',
    password: 'opensipsrw',
    database: 'opensips',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }),
  Tim: mysql.createPool({
    host: '192.168.100.27',
    port: 3306,
    user: 'opensips',
    password: 'opensipsrw',
    database: 'opensips',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }),
  Oi: mysql.createPool({
    host: '192.168.100.29',
    port: 3306,
    user: 'opensips',
    password: 'opensipsrw',
    database: 'opensips',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }),
};




//Ja está no bando de produção
const dbConfigCallcenter = mysql.createPool({
  host: '189.90.240.180',
  port: 3306,
  user: 'valenet',
  password: 'apendice',
  database: 'callcenter',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})


app.get('/telefonia/tn', async (req, res) => {
  const tn = req.query.tn
  const like = `%${tn}%`

  try {
    const [
      [rows],
      [rowsdids],
      [rowssipdevices],
      [rowsaccounts]
    ] = await Promise.all([
      dbConfigFsAsttpProducao.query(
        `SELECT terminalid, terminaltipo, codcidade, codinst, terminalnumber,
                dataativacao, datacancelamento, osid, password
         FROM terminal
         WHERE terminalnumber LIKE ? OR codcidade LIKE ? OR codinst LIKE ?
         LIMIT 10`,
        [like, like, like]
      ),
      dbConfigFsAsttpProducao.query(
        `SELECT number, extensions FROM dids
         WHERE number LIKE ? OR extensions LIKE ?
         LIMIT 100`,
        [like, like]
      ),
      dbConfigFsAsttpProducao.query(
        `SELECT username, dir_params, dir_vars FROM sip_devices
         WHERE username LIKE ?
         LIMIT 10`,
        [like]
      ),
      dbConfigFsAsttpProducao.query(
        `SELECT number, password FROM accounts
         WHERE number LIKE ?
         LIMIT 10`,
        [like]
      )
    ])

    res.json({ resultado: rows, dids: rowsdids, sipdevices: rowssipdevices, accounts: rowsaccounts })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao consultar o banco de dados', detalhes: err.message })
  }
})



app.get('/telefonia/registro', async (req, res) => {
  const tn = req.query.tn

  try {
    const [rows] = await dbConfigFsFreeswitchConnections.query('SELECT reg_user,network_ip,hostname,id FROM registrations WHERE network_ip LIKE ? OR reg_user LIKE ? LIMIT 100',
      Array(2).fill(`%${tn}%`))
    res.json({ resultado: rows })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao consultar o banco de dados', detalhes: err.message })
  }
})

app.delete('/telefonia/registro', async (req, res) => {
  const tnid = req.query.tnid

  if (!tnid) {
    return res.status(400).json({ erro: 'tnid é obrigatório' });
  }

  try {
    const [result] = await dbConfigFsFreeswitchConnections.query(
      'DELETE FROM registrations WHERE id = ?',
      [tnid]
    );

    res.json({
      sucesso: true,
      afetados: result.affectedRows
    });

  } catch (err) {
    res.status(500).json({
      erro: 'Erro ao deletar registro',
      detalhes: err.message
    });
  }
})















app.get('/telefonia/blacklist', async (req, res) => {
  const { numero, operadora } = req.query;

  if (!operadora) {
    return res.status(400).json({ erro: 'Operadora é obrigatória' });
  }

  const pool = dbBlacklistPorOperadora[operadora];
  if (!pool) {
    return res.status(400).json({ erro: `Operadora inválida: ${operadora}` });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, whitelist FROM userblacklist WHERE username LIKE ? LIMIT 100',
      [`%${numero}%`]
    );
    res.json({ resultado: rows });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao consultar o banco de dados', detalhes: err.message });
  }
});


app.patch('/telefonia/blacklist/:id/desbloquear', async (req, res) => {
  const { id } = req.params;
  const { operadora } = req.query; // ← recebe operadora

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ erro: 'ID inválido' });
  }
  if (!operadora) {
    return res.status(400).json({ erro: 'Operadora é obrigatória' });
  }

  const pool = dbBlacklistPorOperadora[operadora];
  if (!pool) {
    return res.status(400).json({ erro: `Operadora inválida: ${operadora}` });
  }

  try {
    const [rows] = await pool.query(
      'UPDATE `userblacklist` SET `whitelist` = 1 WHERE `id` = ?',
      [id]
    );
    if (rows.affectedRows === 0) {
      return res.status(404).json({ erro: 'Registro não encontrado' });
    }
    res.json({ resultado: rows });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar o banco de dados', detalhes: err.message });
  }
});


app.patch('/telefonia/blacklist/:id/bloquear', async (req, res) => {
  const { id } = req.params;
  const { operadora } = req.query; // ← recebe operadora

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ erro: 'ID inválido' });
  }
  if (!operadora) {
    return res.status(400).json({ erro: 'Operadora é obrigatória' });
  }

  const pool = dbBlacklistPorOperadora[operadora];
  if (!pool) {
    return res.status(400).json({ erro: `Operadora inválida: ${operadora}` });
  }

  try {
    const [rows] = await pool.query(
      'UPDATE `userblacklist` SET `whitelist` = 0 WHERE `id` = ?',
      [id]
    );
    if (rows.affectedRows === 0) {
      return res.status(404).json({ erro: 'Registro não encontrado' });
    }
    res.json({ resultado: rows });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar o banco de dados', detalhes: err.message });
  }
});







app.get('/telefonia/tecnico', async (req, res) => {
  const tn = req.query.tn

  try {
    const [rows] = await dbConfigCallcenter.query('SELECT phoneNumber,coduser,createdAt FROM lookup_tecnicos WHERE phoneNumber LIKE ?  LIMIT 100',
      Array(3).fill(`%${tn}%`))
    res.json({ resultado: rows })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao consultar o banco de dados', detalhes: err.message })
    console.error("Erro:", err.message);
  }
})

app.delete('/telefonia/tecnico', async (req, res) => {
  const tn = req.query.tn

  if (!tn) {
    return res.status(400).json({ erro: 'tn é obrigatório' });
  }

  try {
    const [result] = await dbConfigCallcenter.query(
      'DELETE FROM lookup_tecnicos WHERE phoneNumber = ?',
      [tn]
    );

    res.json({
      sucesso: true,
      afetados: result.affectedRows
    });

  } catch (err) {
    res.status(500).json({
      erro: 'Erro ao deletar registro',
      detalhes: err.message
    });
  }
})

app.post('/telefonia/tecnico', async (req, res) => {
  const tn = req.query.tn

  if (!tn) {
    return res.status(400).json({ erro: 'tn é obrigatório' });
  }

  try {
    const [result] = await dbConfigCallcenter.query(
      'INSERT INTO lookup_tecnicos (`phoneNumber`, `coduser`) VALUES (?, 1)',
      [tn]
    );

    res.json({
      sucesso: true,
      afetados: result.affectedRows
    });

  } catch (err) {
    res.status(500).json({
      erro: 'Erro ao adicionar registro',
      detalhes: err.message
    });
  }
})
















// ─── TERMINAL ───────────────────────────────────────────

app.post('/telefonia/terminal', async (req, res) => {
  const { terminalid, terminaltipo, terminalnumber, password,
    codcidade, codinst, osid, dataativacao, datacancelamento } = req.body

  if (!terminalnumber) return res.status(400).json({ erro: 'terminalnumber é obrigatório' })

  try {
    const [rows] = await dbConfigFsAsttpProducao.query(
      'SELECT * FROM terminal WHERE terminalid = ? LIMIT 1', [terminalid]
    )

    if (rows.length > 0) {
      // ── EDITAR: atualiza só os campos que o frontend expõe ──
      await dbConfigFsAsttpProducao.query(
        `UPDATE terminal SET
           terminaltipo      = ?,
           password          = ?,
           codcidade         = ?,
           codinst           = ?,
           osid              = ?,
           dataativacao      = ?,
           datacancelamento  = ?
         WHERE terminalid = ?`,
        [terminaltipo, password, codcidade, codinst, osid,
          dataativacao || null, datacancelamento || null, terminalid]
      )
    } else {
      // ── CRIAR: precisa de codcont e codclie — vem do body ou usa 0 como fallback ──
      const { codcont = 0, codclie = 0, codstatus = 1, canaissimultaneos = 1 } = req.body
      await dbConfigFsAsttpProducao.query(
        `INSERT INTO terminal
           (codcont, codclie, terminaltipo, codcidade, codinst,
            terminalnumber, password, codstatus, canaissimultaneos,
            osid, dataativacao, datacancelamento)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [codcont, codclie, terminaltipo, codcidade, codinst,
          terminalnumber, password, codstatus, canaissimultaneos,
          osid || null, dataativacao || null, datacancelamento || null]
      )
    }

    res.json({ sucesso: true })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao salvar terminal', detalhes: err.message })
  }
})


app.delete('/telefonia/terminal/:id', async (req, res) => {
  const { id } = req.params
  if (!id) return res.status(400).json({ erro: 'id é obrigatório' })

  try {
    const [result] = await dbConfigFsAsttpProducao.query(
      'DELETE FROM terminal WHERE terminalid = ?', [id]
    )
    res.json({ sucesso: true, afetados: result.affectedRows })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar terminal', detalhes: err.message })
  }
})


// ─── SIP DEVICE ─────────────────────────────────────────

app.post('/telefonia/sip', async (req, res) => {
  const { sip_username, sip_dir_params, sip_dir_vars } = req.body

  if (!sip_username) return res.status(400).json({ erro: 'sip_username é obrigatório' })

  try {
    const [rows] = await dbConfigFsAsttpProducao.query(
      'SELECT * FROM sip_devices WHERE username = ? LIMIT 1', [sip_username]
    )

    if (rows.length > 0) {
      // ── EDITAR: reconstrói os JSONs preservando outros campos ──
      const parsedParams = JSON.parse(rows[0].dir_params || '{}')
      const parsedVars = JSON.parse(rows[0].dir_vars || '{}')

      if (sip_dir_params !== undefined) parsedParams.password = sip_dir_params
      if (sip_dir_vars !== undefined) parsedVars.effective_caller_id_number = sip_dir_vars

      await dbConfigFsAsttpProducao.query(
        'UPDATE sip_devices SET dir_params = ?, dir_vars = ? WHERE username = ?',
        [JSON.stringify(parsedParams), JSON.stringify(parsedVars), sip_username]
      )
    } else {
      // ── CRIAR: busca accountid e pricelist_id do terminal relacionado ──
      const [termRows] = await dbConfigFsAsttpProducao.query(
        'SELECT terminalid FROM terminal WHERE terminalnumber LIKE ? LIMIT 1',
        [`%${sip_username}%`]
      )
      const accountid = termRows[0]?.terminalid ?? 0
      const sip_profile_id = 1

      const newParams = JSON.stringify({ password: sip_dir_params ?? '' })
      const last8 = sip_username.slice(-8);


      await dbConfigFsAsttpProducao.query(
        `INSERT INTO sip_devices
           (username, sip_profile_id, accountid, pricelist_id, dir_params, id,dir_vars)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sip_username, sip_profile_id, accountid, 2, newParams, last8, '{"effective_caller_id_name":"' + sip_username + '","effective_caller_id_number":"' + sip_username + '}","user_context":"default"}']  // ← id = last8 do username
      )
    }

    res.json({ sucesso: true })
  } catch (err) {
    console.log('ERRO SIPDEVICES:', err.message)
    res.status(500).json({ erro: 'Erro ao salvar sip_device', detalhes: err.message })
  }
})



app.delete('/telefonia/sip/:username', async (req, res) => {
  const { username } = req.params
  if (!username) return res.status(400).json({ erro: 'username é obrigatório' })

  try {
    const [result] = await dbConfigFsAsttpProducao.query(
      'DELETE FROM sip_devices WHERE username = ?', [username]
    )
    res.json({ sucesso: true, afetados: result.affectedRows })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar sip_device', detalhes: err.message })
  }
})


// ─── ACCOUNT ────────────────────────────────────────────

app.post('/telefonia/account', async (req, res) => {
  //console.log('BODY recebido:', req.body)
  const { acc_number, acc_password } = req.body
  const last8 = acc_number.slice(-8);
  //console.log('acc_number:', acc_number, 'acc_password:', acc_password, 'last8:', last8)

  if (!acc_number) return res.status(400).json({ erro: 'acc_number é obrigatório' })

  try {
    const [rows] = await dbConfigFsAsttpProducao.query(
      'SELECT * FROM accounts WHERE `number` = ? LIMIT 1', [acc_number]
    )

    if (rows.length > 0) {
      // ── EDITAR: só atualiza a senha ──
      await dbConfigFsAsttpProducao.query(
        'UPDATE accounts SET password = ? WHERE `number` = ?',
        [acc_password, acc_number]
      )
    } else {
      // ── CRIAR: campos NOT NULL sem default recebem valores neutros ──

      await dbConfigFsAsttpProducao.query(
        `INSERT INTO accounts
           ( \`number\`, password, pricelist_id, id, dialed_modify)
         VALUES (?, ?, 2, ?, ' ')`,
        [acc_number, acc_password, last8]  // ← id = acc_number
      )
    }

    res.json({ sucesso: true })
  } catch (err) {
    //console.log('ERRO ACCOUNT:', err.message)
    res.status(500).json({ erro: 'Erro ao salvar account', detalhes: err.message })
  }
})


app.delete('/telefonia/account/:number', async (req, res) => {
  const { number } = req.params
  if (!number) return res.status(400).json({ erro: 'number é obrigatório' })

  try {
    const [result] = await dbConfigFsAsttpProducao.query(
      'DELETE FROM accounts WHERE `number` = ?', [number]
    )
    res.json({ sucesso: true, afetados: result.affectedRows })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar account', detalhes: err.message })
  }
})


// ─── DID ────────────────────────────────────────────────

app.post('/telefonia/did', async (req, res) => {
  //console.log('BODY recebido:', req.body)
  const { did_number, did_extensions, codinst } = req.body

  if (!did_number) return res.status(400).json({ erro: 'did_number é obrigatório' })

  const extensionFull = codinst
    ? `${did_extensions}@fs.voice.valenet.com.br`
    : `${did_extensions}@fs.voice.valenet.com.br`

  try {
    const [rows] = await dbConfigFsAsttpProducao.query(
      'SELECT * FROM dids WHERE `number` = ? LIMIT 1', [did_number]
    )

    if (rows.length > 0) {
      // ── EDITAR: só atualiza extensions ──
      await dbConfigFsAsttpProducao.query(
        'UPDATE dids SET extensions = ? WHERE `number` = ?',
        [extensionFull, did_number]
      )
    } else {
      // ── CRIAR: usa os valores da linha existente como base para NOT NULLs ──
      await dbConfigFsAsttpProducao.query(
        `INSERT INTO dids
           (id, \`number\`, extensions, accountid, connectcost, includedseconds,
            monthlycost, cost, inc, status, provider_id, country_id,
            prorate, setup, limittime, disconnectionfee,
            maxchannels, chargeonallocation, allocation_bill_status,
            dial_as, call_type, inuse, variables)
         VALUES (?, ?, ?, 0, 0.00, 0, 0.00, 0.00, 0, 1, 0, 0, 0, 0.00, 1, 0.00, 0, 1, 0, '', 0, 0, '')`,
        [did_number,      // ← id = did_number
          did_number, extensionFull]
      )
    }

    res.json({ sucesso: true })
  } catch (err) {
    //console.log('ERRO DID:', err.message)
    res.status(500).json({ erro: 'Erro ao salvar did', detalhes: err.message })
  }
})
app.delete('/telefonia/did/:number', async (req, res) => {
  const { number } = req.params
  if (!number) return res.status(400).json({ erro: 'number é obrigatório' })

  try {
    const [result] = await dbConfigFsAsttpProducao.query(
      'DELETE FROM dids WHERE `number` = ?', [number]
    )
    res.json({ sucesso: true, afetados: result.affectedRows })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar did', detalhes: err.message })
  }
})























// ── Pool de conexões MySQL ────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || "192.168.201.243",
  port:     process.env.DB_PORT     || 3309,
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASS     || "Z1mBr@",
  database: process.env.DB_NAME     || "provisionatip",
  waitForConnections: true,
  connectionLimit:    10,
});
 
// ── Helper ────────────────────────────────────────────────────────────────────
const db = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};
 
// ============================================================
//  TENANTS
// ============================================================
 
// GET /api/tenants — lista todos
app.get("/api/tenants", async (req, res) => {
  try {
    const rows = await db("SELECT * FROM tenant ORDER BY tenant_id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
});
 
// GET /api/tenants/:id — busca por id (PK)
app.get("/api/tenants/:id", async (req, res) => {
  try {
    const rows = await db("SELECT * FROM tenant WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar cliente" });
  }
});
 
// POST /api/tenants — criar
app.post("/api/tenants", async (req, res) => {
  const { tenant_name, active = 1 } = req.body;
  if (!tenant_name) return res.status(400).json({ error: "tenant_name é obrigatório" });
  try {
    // tenant_id auto-incrementado via trigger ou calculado aqui
    const [maxRow] = await pool.execute("SELECT COALESCE(MAX(tenant_id), 0) + 1 AS next FROM tenant");
    const tenant_id = maxRow[0].next;
    const result = await db(
      "INSERT INTO tenant (tenant_id, tenant_name, active) VALUES (?, ?, ?)",
      [tenant_id, tenant_name, active]
    );
    res.status(201).json({ id: result.insertId, tenant_id, tenant_name, active });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
});
 
// PUT /api/tenants/:id — atualizar
app.put("/api/tenants/:id", async (req, res) => {
  const { tenant_name, active } = req.body;
  try {
    await db(
      "UPDATE tenant SET tenant_name = ?, active = ? WHERE id = ?",
      [tenant_name, active, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
});
 
// DELETE /api/tenants/:id — remover (remove tags vinculadas também)
app.delete("/api/tenants/:id", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Busca tenant_id para remover tags relacionadas
    const [rows] = await conn.execute("SELECT tenant_id FROM tenant WHERE id = ?", [req.params.id]);
    if (rows.length) {
      await conn.execute("DELETE FROM tags WHERE tenant_id = ?", [rows[0].tenant_id]);
    }
    await conn.execute("DELETE FROM tenant WHERE id = ?", [req.params.id]);
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Erro ao remover cliente" });
  } finally {
    conn.release();
  }
});
 
// ============================================================
//  TAGS
// ============================================================
 
// GET /api/tags — lista todas (opcionalmente filtra por tenant_id)
app.get("/api/tags", async (req, res) => {
  try {
    const { tenant_id } = req.query;
    let sql    = "SELECT * FROM tags ORDER BY tenant_id ASC, id ASC";
    let params = [];
    if (tenant_id) {
      sql    = "SELECT * FROM tags WHERE tenant_id = ? ORDER BY id ASC";
      params = [tenant_id];
    }
    const rows = await db(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar tags" });
  }
});
 
// GET /api/tags/:id
app.get("/api/tags/:id", async (req, res) => {
  try {
    const rows = await db("SELECT * FROM tags WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Tag não encontrada" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar tag" });
  }
});
 
// POST /api/tags — criar
app.post("/api/tags", async (req, res) => {
  const { tag_id, tenant_id, value = "", tag_description = "", active = 1 } = req.body;
  if (!tag_id)    return res.status(400).json({ error: "tag_id é obrigatório" });
  if (!tenant_id) return res.status(400).json({ error: "tenant_id é obrigatório" });
  try {
    const result = await db(
      "INSERT INTO tags (tag_id, tenant_id, value, tag_description, active) VALUES (?, ?, ?, ?, ?)",
      [tag_id, tenant_id, value, tag_description, active]
    );
    res.status(201).json({ id: result.insertId, tag_id, tenant_id, value, tag_description, active });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar tag" });
  }
});
 
// PUT /api/tags/:id — atualizar
app.put("/api/tags/:id", async (req, res) => {
  const { tag_id, tenant_id, value, tag_description, active } = req.body;
  try {
    await db(
      "UPDATE tags SET tag_id = ?, tenant_id = ?, value = ?, tag_description = ?, active = ? WHERE id = ?",
      [tag_id, tenant_id, value, tag_description, active, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar tag" });
  }
});
 
// DELETE /api/tags/:id
app.delete("/api/tags/:id", async (req, res) => {
  try {
    await db("DELETE FROM tags WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover tag" });
  }
});
 
// ============================================================
//  HEALTH CHECK
// ============================================================
app.get("/api/health", async (req, res) => {
  try {
    await pool.execute("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});
 























// ── Pool de conexões MySQL ────────────────────────────────────────────────────
const pool2 = mysql.createPool({
  host: '192.168.200.253',
  port: 3306,
  user: 'valenet',
  password: 'expl@de!',
  database:"freeswitch_connections",
  waitForConnections: true,
  connectionLimit:    10,
});


const dbFS = async (sql, params = []) => {
  const [rows] = await pool2.execute(sql, params);
  return rows;
};
// ============================================================
//  ROTAS — freeswitch_connections.consultalog
//  Cole estas rotas dentro do seu server.js existente,
//  antes do app.listen(...)
//
//  A tabela esperada no MySQL:
//
//  CREATE TABLE IF NOT EXISTS `consultalog` (
//    `id`     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
//    `numero` VARCHAR(30)     NOT NULL,
//    `conta`  VARCHAR(30)     NOT NULL,
//    PRIMARY KEY (`id`),
//    INDEX idx_numero (`numero`),
//    INDEX idx_conta  (`conta`)
//  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
//
// ============================================================

// ── GET /api/consultalog — lista paginada com busca opcional ──────────────────
// Query params:
//   ?page=1        (default 1)
//   ?limit=50      (default 50)
//   ?q=texto       (busca em numero OR conta)
// ============================================================
//  ROTAS — freeswitch_connections.consultalog
//  Cole estas rotas no seu app.js antes do app.listen()
//
//  Requer um segundo pool apontando para freeswitch_connections:
//
//  const poolFS = mysql.createPool({
//    host:     process.env.DB_HOST,
//    port:     process.env.DB_PORT || 3306,
//    user:     process.env.DB_USER,
//    password: process.env.DB_PASS,
//    database: "freeswitch_connections",
//    waitForConnections: true,
//    connectionLimit: 10,
//  });
//  const dbFS = async (sql, params = []) => {
//    const [rows] = await poolFS.execute(sql, params);
//    return rows;
//  };
//
// ============================================================

const TABLE = "freeswitch_connections.consultaLog";

// ── GET /api/consultalog — lista paginada com busca ───────────────────────────
// Params: ?page=1 &limit=50 &q=texto
app.get("/api/consultalog", async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  || "1"));
    const limit  = Math.min(200, parseInt(req.query.limit || "50"));
    const q      = (req.query.q || "").trim();
    const offset = (page - 1) * limit;

    let where  = "";
    let params = [];

    if (q) {
      where  = "WHERE numero LIKE ? OR conta LIKE ?";
      params = [`%${q}%`, `%${q}%`];
    }

    const countRows = await dbFS(
      `SELECT COUNT(*) AS total FROM ${TABLE} ${where}`,
      params
    );
    const total = countRows[0].total;

    const rows = await dbFS(
      `SELECT numero, conta FROM ${TABLE} ${where} ORDER BY numero ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ rows, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar registros" });
  }
});

// ── POST /api/consultalog — criar ─────────────────────────────────────────────
app.post("/api/consultalog", async (req, res) => {
  const { numero, conta } = req.body;
  if (!numero) return res.status(400).json({ error: "numero é obrigatório" });
  if (!conta)  return res.status(400).json({ error: "conta é obrigatória" });
  try {
    // Verifica duplicata
    const existing = await dbFS(
      `SELECT numero FROM ${TABLE} WHERE numero = ?`,
      [numero]
    );
    if (existing.length) {
      return res.status(409).json({ error: "Número já cadastrado" });
    }
    await dbFS(
      `INSERT INTO ${TABLE} (numero, conta) VALUES (?, ?)`,
      [numero, conta]
    );
    res.status(201).json({ numero, conta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar registro" });
  }
});

// ── PUT /api/consultalog/:numero — atualizar conta ────────────────────────────
app.put("/api/consultalog/:numero", async (req, res) => {
  const { conta } = req.body;
  const numero    = decodeURIComponent(req.params.numero);
  if (!conta) return res.status(400).json({ error: "conta é obrigatória" });
  try {
    const result = await dbFS(
      `UPDATE ${TABLE} SET conta = ? WHERE numero = ?`,
      [conta, numero]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Registro não encontrado" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar registro" });
  }
});

// ── DELETE /api/consultalog/:numero — remover ─────────────────────────────────
app.delete("/api/consultalog/:numero", async (req, res) => {
  const numero = decodeURIComponent(req.params.numero);
  try {
    const result = await dbFS(
      `DELETE FROM ${TABLE} WHERE numero = ?`,
      [numero]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Registro não encontrado" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover registro" });
  }
});









// ============================================================
//  ROTAS — astpp_producao.TRIDIGITO
//  Cole estas rotas no seu app.js antes do app.listen()
//
//  Usa o pool já existente:
//    const dbConfigFsAsttpProducao = mysql.createPool({ ... })
//
//  Adicione também este helper logo após o pool (se ainda não tiver):
//    const dbSUP = async (sql, params = []) => {
//      const [rows] = await dbConfigFsAsttpProducao.execute(sql, params);
//      return rows;
//    };
// ============================================================

const dbSUP = async (sql, params = []) => {
  const [rows] = await dbConfigFsAsttpProducao.execute(sql, params);
  return rows;
};

const TBL = "astpp_producao.TRIDIGITO";

// ── GET /api/tridigito — lista paginada com busca ─────────────────────────────
// Params: ?page=1 &limit=50 &q=texto
app.get("/api/tridigito", async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  || "1"));
    const limit  = Math.min(200, parseInt(req.query.limit || "50"));
    const q      = (req.query.q || "").trim();
    const offset = (page - 1) * limit;

    let where  = "";
    let params = [];

    if (q) {
      where = `WHERE
        TRIDIGITOID LIKE ? OR
        CNL         LIKE ? OR
        TRIDIGITO   LIKE ? OR
        DESTINO     LIKE ? OR
        CIDADE      LIKE ? OR
        codcidade   LIKE ?`;
      params = Array(6).fill(`%${q}%`);
    }

    const countRows = await dbSUP(
      `SELECT COUNT(*) AS total FROM ${TBL} ${where}`,
      params
    );
    const total = countRows[0].total;

    const rows = await dbSUP(
      `SELECT TRIDIGITOID, CNL, TRIDIGITO, DESTINO, DDD, RN1, CIDADE, codcidade
       FROM ${TBL} ${where}
       ORDER BY TRIDIGITOID ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ rows, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar registros" });
  }
});

// ── GET /api/tridigito/:id ────────────────────────────────────────────────────
app.get("/api/tridigito/:id", async (req, res) => {
  try {
    const rows = await dbSUP(
      `SELECT * FROM ${TBL} WHERE TRIDIGITOID = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar registro" });
  }
});

// ── POST /api/tridigito — criar ───────────────────────────────────────────────
app.post("/api/tridigito", async (req, res) => {
  const { CNL, TRIDIGITO, DESTINO, DDD, RN1, CIDADE, codcidade } = req.body;

  if (!CNL)       return res.status(400).json({ error: "CNL é obrigatório" });
  if (!TRIDIGITO) return res.status(400).json({ error: "TRIDIGITO é obrigatório" });
  if (!DESTINO)   return res.status(400).json({ error: "DESTINO é obrigatório" });

  try {
    const result = await dbSUP(
      `INSERT INTO ${TBL} (CNL, TRIDIGITO, DESTINO, DDD, RN1, CIDADE, codcidade)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        CNL,
        TRIDIGITO,
        DESTINO,
        DDD       || null,
        RN1       || null,
        CIDADE    || null,
        codcidade || null,
      ]
    );
    res.status(201).json({ TRIDIGITOID: result.insertId, CNL, TRIDIGITO, DESTINO });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar registro" });
  }
});

// ── PUT /api/tridigito/:id — atualizar ────────────────────────────────────────
app.put("/api/tridigito/:id", async (req, res) => {
  const { CNL, TRIDIGITO, DESTINO, DDD, RN1, CIDADE, codcidade } = req.body;

  if (!CNL)       return res.status(400).json({ error: "CNL é obrigatório" });
  if (!TRIDIGITO) return res.status(400).json({ error: "TRIDIGITO é obrigatório" });
  if (!DESTINO)   return res.status(400).json({ error: "DESTINO é obrigatório" });

  try {
    const result = await dbSUP(
      `UPDATE ${TBL}
       SET CNL = ?, TRIDIGITO = ?, DESTINO = ?, DDD = ?, RN1 = ?, CIDADE = ?, codcidade = ?
       WHERE TRIDIGITOID = ?`,
      [
        CNL,
        TRIDIGITO,
        DESTINO,
        DDD       || null,
        RN1       || null,
        CIDADE    || null,
        codcidade || null,
        req.params.id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Registro não encontrado" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar registro" });
  }
});

// ── DELETE /api/tridigito/:id ─────────────────────────────────────────────────
app.delete("/api/tridigito/:id", async (req, res) => {
  try {
    const result = await dbSUP(
      `DELETE FROM ${TBL} WHERE TRIDIGITOID = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Registro não encontrado" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover registro" });
  }
});















// ============================================================
//  ROTAS — astpp_producao.CNG + astpp_producao.routes
//  Compatível com MySQL 5.7 (sem REGEXP_REPLACE)
//
//  Cole estas rotas no seu app.js antes do app.listen()
//
//  Adicione este helper logo após o pool (se ainda não tiver):
//    const dbCNG = async (sql, params = []) => {
//      const [rows] = await dbConfigFsAsttpProducao.execute(sql, params);
//      return rows;
//    };
//
//  Lógica de relacionamento:
//    routes.pattern = '^08000992150$'  ou  '^8000992150$'
//    CNG.codigo     = '08000992150'
//
//  O JOIN é feito por:
//    CNG.codigo = CONCAT('0', TRIM(LEADING '0' FROM numero_sem_ancora))
//    onde numero_sem_ancora = TRIM(TRAILING '$' FROM TRIM(LEADING '^' FROM pattern))
// ============================================================

const dbCNG = async (sql, params = []) => {
  const [rows] = await dbConfigFsAsttpProducao.execute(sql, params);
  return rows;
};

// ── Helpers JS (usados nas rotas de escrita) ──────────────────────────────────

// Remove âncoras do pattern  →  ^08000992150$  →  08000992150
const patternToNumero = (pattern) =>
  (pattern || "").replace(/^\^/, "").replace(/\$$/, "");

// Garante prefixo 0  →  8000992150  →  08000992150
const toCodigoCNG = (numero) =>
  numero.startsWith("0") ? numero : `0${numero}`;

// Os dois patterns possíveis para um número na tabela routes
const routePatterns = (numero) => {
  const sem0 = numero.replace(/^0+/, "");
  return [`^${sem0}$`, `^0${sem0}$`];
};

// ── Expressão SQL para extrair o numero_base do pattern ───────────────────────
// Remove ^ do início e $ do fim  →  resultado: '08000992150' ou '8000992150'
// Em seguida o JOIN testa as duas formas com CONCAT('0', LTRIM dos zeros) para
// normalizar sempre para a forma com '0' que é como o CNG armazena.
//
// LTRIM só remove espaços no MySQL 5.7; para remover zeros usamos TRIM(LEADING '0' FROM ...)
// Expressão final do JOIN:
//   c.codigo = CONCAT('0', TRIM(LEADING '0' FROM TRIM(TRAILING '$' FROM TRIM(LEADING '^' FROM r.pattern))))
//
// Isso funciona para ambos os casos:
//   ^8000992150$  → '8000992150' → ltrim0 → '8000992150' → concat0 → '08000992150' ✓
//   ^08000992150$ → '08000992150'→ ltrim0 → '8000992150' → concat0 → '08000992150' ✓

const JOIN_EXPR = `
  LEFT JOIN astpp_producao.CNG c
    ON c.codigo = CONCAT('0', TRIM(LEADING '0' FROM
        TRIM(TRAILING '$' FROM TRIM(LEADING '^' FROM r.pattern))
    ))
`;

// ============================================================
//  GET /api/cng  — lista paginada (routes + CNG)
// ============================================================
app.get("/api/cng", async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  || "1"));
    const limit  = Math.min(200, parseInt(req.query.limit || "50"));
    const q      = (req.query.q || "").trim();
    const offset = (page - 1) * limit;

    // Filtro base: só patterns que começam com ^8 ou ^08
    let where  = "(r.pattern LIKE '^8%' OR r.pattern LIKE '^08%')";
    let params = [];

    if (q) {
      where += " AND (r.pattern LIKE ? OR c.codigo LIKE ? OR c.rn1 LIKE ?)";
      params = [`%${q}%`, `%${q}%`, `%${q}%`];
    }

    // Contagem
    const countRows = await dbCNG(
      `SELECT COUNT(DISTINCT r.id) AS total
       FROM astpp_producao.routes r
       ${JOIN_EXPR}
       WHERE ${where}`,
      params
    );
    const total = countRows[0].total;

    // Dados paginados
    const rows = await dbCNG(
      `SELECT
         r.id              AS route_id,
         r.pattern,
         r.comment,
         r.connectcost,
         r.includedseconds,
         r.cost,
         r.pricelist_id,
         r.inc,
         r.reseller_id,
         r.precedence,
         r.status,
         c.codigo          AS cng_codigo,
         c.rn1             AS cng_rn1
       FROM astpp_producao.routes r
       ${JOIN_EXPR}
       WHERE ${where}
       ORDER BY r.pattern ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Formata para o frontend
    const formatted = rows.map(r => ({
      numero: patternToNumero(r.pattern),
      route: {
        id:              r.route_id,
        pattern:         r.pattern,
        comment:         r.comment,
        connectcost:     r.connectcost,
        includedseconds: r.includedseconds,
        cost:            r.cost,
        pricelist_id:    r.pricelist_id,
        inc:             r.inc,
        reseller_id:     r.reseller_id,
        precedence:      r.precedence,
        status:          r.status,
      },
      cng: r.cng_codigo
        ? { codigo: r.cng_codigo, rn1: r.cng_rn1 }
        : null,
    }));

    res.json({ rows: formatted, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar registros" });
  }
});

// ============================================================
//  POST /api/cng — criar número nas duas tabelas
// ============================================================
app.post("/api/cng", async (req, res) => {
  const { numero, cng, route } = req.body;
  if (!numero) return res.status(400).json({ error: "numero é obrigatório" });

  const conn = await dbConfigFsAsttpProducao.getConnection();
  try {
    await conn.beginTransaction();

    if (cng) {
      const codigo = toCodigoCNG(numero);
      await conn.execute(
        "INSERT INTO astpp_producao.CNG (codigo, rn1) VALUES (?, ?)",
        [codigo, cng.rn1 || null]
      );
    }

    if (route) {
      await conn.execute(
        `INSERT INTO astpp_producao.routes
           (pattern, comment, connectcost, includedseconds, cost,
            pricelist_id, inc, reseller_id, precedence, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          route.pattern          || `^0${numero.replace(/^0+/, "")}$`,
          route.comment          || null,
          route.connectcost      ?? 0,
          route.includedseconds  ?? 0,
          route.cost             ?? 0,
          route.pricelist_id     ?? 1,
          route.inc              ?? 1,
          route.reseller_id      ?? 0,
          route.precedence       ?? 0,
          route.status           ?? 1,
        ]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, numero });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Erro ao criar registro" });
  } finally {
    conn.release();
  }
});

// ============================================================
//  PUT /api/cng/:numero — atualizar nas duas tabelas
// ============================================================
app.put("/api/cng/:numero", async (req, res) => {
  const numero   = decodeURIComponent(req.params.numero);
  const { cng, route } = req.body;
  const patterns = routePatterns(numero);
  const codigo   = toCodigoCNG(numero);

  const conn = await dbConfigFsAsttpProducao.getConnection();
  try {
    await conn.beginTransaction();

    // ── CNG ──────────────────────────────────────────────────
    if (cng) {
      const [existing] = await conn.execute(
        "SELECT codigo FROM astpp_producao.CNG WHERE codigo = ?",
        [codigo]
      );
      if (existing.length) {
        await conn.execute(
          "UPDATE astpp_producao.CNG SET rn1 = ? WHERE codigo = ?",
          [cng.rn1 || null, codigo]
        );
      } else {
        await conn.execute(
          "INSERT INTO astpp_producao.CNG (codigo, rn1) VALUES (?, ?)",
          [codigo, cng.rn1 || null]
        );
      }
    } else {
      // Desmarcou CNG → remove
      await conn.execute(
        "DELETE FROM astpp_producao.CNG WHERE codigo = ?",
        [codigo]
      );
    }

    // ── Routes ───────────────────────────────────────────────
    if (route) {
      const [existing] = await conn.execute(
        "SELECT id FROM astpp_producao.routes WHERE pattern IN (?, ?)",
        patterns
      );
      if (existing.length) {
        await conn.execute(
          `UPDATE astpp_producao.routes
           SET comment = ?, connectcost = ?, includedseconds = ?, cost = ?,
               pricelist_id = ?, inc = ?, reseller_id = ?, precedence = ?, status = ?
           WHERE pattern IN (?, ?)`,
          [
            route.comment          || null,
            route.connectcost      ?? 0,
            route.includedseconds  ?? 0,
            route.cost             ?? 0,
            route.pricelist_id     ?? 1,
            route.inc              ?? 1,
            route.reseller_id      ?? 0,
            route.precedence       ?? 0,
            route.status           ?? 1,
            ...patterns,
          ]
        );
      } else {
        await conn.execute(
          `INSERT INTO astpp_producao.routes
             (pattern, comment, connectcost, includedseconds, cost,
              pricelist_id, inc, reseller_id, precedence, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            route.pattern || `^0${numero.replace(/^0+/, "")}$`,
            route.comment || null,
            route.connectcost      ?? 0,
            route.includedseconds  ?? 0,
            route.cost             ?? 0,
            route.pricelist_id     ?? 1,
            route.inc              ?? 1,
            route.reseller_id      ?? 0,
            route.precedence       ?? 0,
            route.status           ?? 1,
          ]
        );
      }
    } else {
      // Desmarcou route → remove
      await conn.execute(
        "DELETE FROM astpp_producao.routes WHERE pattern IN (?, ?)",
        patterns
      );
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar registro" });
  } finally {
    conn.release();
  }
});

// ============================================================
//  DELETE /api/cng/:numero — remove das duas tabelas
// ============================================================
app.delete("/api/cng/:numero", async (req, res) => {
  const numero   = decodeURIComponent(req.params.numero);
  const patterns = routePatterns(numero);
  const codigo   = toCodigoCNG(numero);

  const conn = await dbConfigFsAsttpProducao.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      "DELETE FROM astpp_producao.CNG WHERE codigo = ?",
      [codigo]
    );
    await conn.execute(
      "DELETE FROM astpp_producao.routes WHERE pattern IN (?, ?)",
      patterns
    );
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Erro ao remover registro" });
  } finally {
    conn.release();
  }
});




























// ============================================================
//  ROTAS — astpp_producao.sip_devices_liberacoes
//  Cole estas rotas no seu app.js antes do app.listen()
//
//  Chave primária composta: accountname + tipoligacao
//  Pool: dbConfigFsAsttpProducao
//
//  Adicione este helper (se ainda não tiver):
//    const dbLDI = async (sql, params = []) => {
//      const [rows] = await dbConfigFsAsttpProducao.execute(sql, params);
//      return rows;
//    };
// ============================================================

const dbLDI = async (sql, params = []) => {
  const [rows] = await dbConfigFsAsttpProducao.execute(sql, params);
  return rows;
};

const TBL_LDI = "astpp_producao.sip_devices_liberacoes";

// ============================================================
//  GET /api/ldi — lista paginada com busca e filtros
//  Params: ?page &limit &q &tipo &acao
// ============================================================
app.get("/api/ldi", async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  || "1"));
    const limit  = Math.min(200, parseInt(req.query.limit || "50"));
    const q      = (req.query.q    || "").trim();
    const tipo   = (req.query.tipo || "").trim();
    const acao   = (req.query.acao || "").trim();
    const offset = (page - 1) * limit;

    const conditions = [];
    const params     = [];

    if (q) {
      conditions.push("(accountname LIKE ? OR tipoligacao LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }
    if (tipo) {
      conditions.push("tipoligacao = ?");
      params.push(tipo);
    }
    if (acao) {
      conditions.push("acao = ?");
      params.push(acao);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countRows = await dbLDI(
      `SELECT COUNT(*) AS total FROM ${TBL_LDI} ${where}`,
      params
    );
    const total = countRows[0].total;

    const rows = await dbLDI(
      `SELECT accountname, tipoligacao, acao
       FROM ${TBL_LDI} ${where}
       ORDER BY accountname ASC, tipoligacao ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ rows, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar registros" });
  }
});

// ============================================================
//  POST /api/ldi — criar
// ============================================================
app.post("/api/ldi", async (req, res) => {
  const { accountname, tipoligacao, acao } = req.body;

  if (!accountname) return res.status(400).json({ error: "accountname é obrigatório" });
  if (!tipoligacao) return res.status(400).json({ error: "tipoligacao é obrigatório" });
  if (!acao)        return res.status(400).json({ error: "acao é obrigatório" });

  const TIPOS_VALIDOS = ["DDI", "DDDOUTROS", "VC1", "DDIOUTROS"];
  const ACOES_VALIDAS = ["L", "B"];
  if (!TIPOS_VALIDOS.includes(tipoligacao))
    return res.status(400).json({ error: `tipoligacao inválido. Use: ${TIPOS_VALIDOS.join(", ")}` });
  if (!ACOES_VALIDAS.includes(acao))
    return res.status(400).json({ error: `acao inválida. Use: L ou B` });

  try {
    // Verifica duplicata (PK composta)
    const existing = await dbLDI(
      `SELECT accountname FROM ${TBL_LDI} WHERE accountname = ? AND tipoligacao = ?`,
      [accountname, tipoligacao]
    );
    if (existing.length) {
      return res.status(409).json({ error: "Registro já existe para esse accountname + tipoligacao" });
    }

    await dbLDI(
      `INSERT INTO ${TBL_LDI} (accountname, tipoligacao, acao) VALUES (?, ?, ?)`,
      [accountname, tipoligacao, acao]
    );

    res.status(201).json({ accountname, tipoligacao, acao });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar registro" });
  }
});

// ============================================================
//  PUT /api/ldi/:accountname/:tipoligacao — atualizar acao
// ============================================================
app.put("/api/ldi/:accountname/:tipoligacao", async (req, res) => {
  const accountname = decodeURIComponent(req.params.accountname);
  const tipoligacao = decodeURIComponent(req.params.tipoligacao);
  const { acao }    = req.body;

  if (!acao) return res.status(400).json({ error: "acao é obrigatório" });

  const ACOES_VALIDAS = ["L", "B"];
  if (!ACOES_VALIDAS.includes(acao))
    return res.status(400).json({ error: "acao inválida. Use: L ou B" });

  try {
    const result = await dbLDI(
      `UPDATE ${TBL_LDI} SET acao = ? WHERE accountname = ? AND tipoligacao = ?`,
      [acao, accountname, tipoligacao]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Registro não encontrado" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar registro" });
  }
});

// ============================================================
//  DELETE /api/ldi/:accountname/:tipoligacao — remover
// ============================================================
app.delete("/api/ldi/:accountname/:tipoligacao", async (req, res) => {
  const accountname = decodeURIComponent(req.params.accountname);
  const tipoligacao = decodeURIComponent(req.params.tipoligacao);

  try {
    const result = await dbLDI(
      `DELETE FROM ${TBL_LDI} WHERE accountname = ? AND tipoligacao = ?`,
      [accountname, tipoligacao]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Registro não encontrado" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover registro" });
  }
});



































// ============================================================
//  ROTAS — freeswitch_connections.cobrar
//  Cole estas rotas no seu app.js antes do app.listen()
//
//  Pool: dbConfigFsFreeswitchConnections
//  Chave primária: numero
//
//  Adicione este helper (se ainda não tiver):
//    const dbLAC = async (sql, params = []) => {
//      const [rows] = await dbConfigFsFreeswitchConnections.execute(sql, params);
//      return rows;
//    };
// ============================================================

const dbLAC = async (sql, params = []) => {
  const [rows] = await dbConfigFsFreeswitchConnections.execute(sql, params);
  return rows;
};

const TBL_LAC = "freeswitch_connections.cobrar";

// ============================================================
//  GET /api/lac — lista paginada com busca
// ============================================================
app.get("/api/lac", async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  || "1"));
    const limit  = Math.min(200, parseInt(req.query.limit || "50"));
    const q      = (req.query.q || "").trim();
    const offset = (page - 1) * limit;

    let where  = "";
    let params = [];

    if (q) {
      where  = "WHERE numero LIKE ?";
      params = [`%${q}%`];
    }

    const countRows = await dbLAC(
      `SELECT COUNT(*) AS total FROM ${TBL_LAC} ${where}`,
      params
    );
    const total = countRows[0].total;

    const rows = await dbLAC(
      `SELECT numero FROM ${TBL_LAC} ${where} ORDER BY numero ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ rows, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar registros" });
  }
});

// ============================================================
//  POST /api/lac — adicionar número
// ============================================================
app.post("/api/lac", async (req, res) => {
  const { numero } = req.body;
  if (!numero) return res.status(400).json({ error: "numero é obrigatório" });

  try {
    const existing = await dbLAC(
      `SELECT numero FROM ${TBL_LAC} WHERE numero = ?`,
      [numero]
    );
    if (existing.length) {
      return res.status(409).json({ error: "Número já cadastrado" });
    }

    await dbLAC(
      `INSERT INTO ${TBL_LAC} (numero) VALUES (?)`,
      [numero]
    );

    res.status(201).json({ numero });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao adicionar número" });
  }
});

// ============================================================
//  PUT /api/lac/:numero — atualizar número (trocar valor da PK)
// ============================================================
app.put("/api/lac/:numero", async (req, res) => {
  const numeroAntigo = decodeURIComponent(req.params.numero);
  const { numero: numeroNovo } = req.body;

  if (!numeroNovo) return res.status(400).json({ error: "numero é obrigatório" });

  if (numeroAntigo === numeroNovo) {
    return res.json({ success: true }); // nada mudou
  }

  try {
    // Verifica se o novo número já existe
    const existing = await dbLAC(
      `SELECT numero FROM ${TBL_LAC} WHERE numero = ?`,
      [numeroNovo]
    );
    if (existing.length) {
      return res.status(409).json({ error: "Novo número já está cadastrado" });
    }

    await dbLAC(
      `UPDATE ${TBL_LAC} SET numero = ? WHERE numero = ?`,
      [numeroNovo, numeroAntigo]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar número" });
  }
});

// ============================================================
//  DELETE /api/lac/:numero — remover número
// ============================================================
app.delete("/api/lac/:numero", async (req, res) => {
  const numero = decodeURIComponent(req.params.numero);

  try {
    const result = await dbLAC(
      `DELETE FROM ${TBL_LAC} WHERE numero = ?`,
      [numero]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Número não encontrado" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover número" });
  }
});





















module.exports = app
