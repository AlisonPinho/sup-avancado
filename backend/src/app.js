const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')

const app = express()

app.use(cors())
app.use(express.json())

/*

app.get('/telefonia/tn', async (req, res)=> {
    const tn = req.body.tn

    const conection = await 

    res.json({"TN enviado": tn})
})

*/

// Configuração da conexão com o MariaDB fs.voice
const dbConfigFsAsttpProducao = mysql.createPool({
  host: '192.168.201.243',
  port: 3308,
  user: 'root',
  password: 'Z1mBr@',
  database: 'asttp_producao',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})


const dbConfigFsFreeswitchConnections = mysql.createPool({
  host: '192.168.201.243',
  port: 3308,
  user: 'root',
  password: 'Z1mBr@',
  database: 'freeswitch_connections',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})


const dbConfigOpensips = mysql.createPool({
  host: '192.168.201.243',
  port: 3308,
  user: 'root',
  password: 'Z1mBr@',
  database: 'opensips',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

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

  try {
    const [rows] = await dbConfigFsAsttpProducao.query('SELECT terminalid,terminaltipo,codcidade,codinst,terminalnumber,password,dataativacao,datacancelamento,osid FROM terminal WHERE terminalid LIKE ? OR terminaltipo LIKE ? OR codcidade LIKE ? OR codinst LIKE ? OR terminalnumber LIKE ? OR password LIKE ? OR dataativacao LIKE ? OR datacancelamento LIKE ? OR osid LIKE ? LIMIT 100',
      Array(9).fill(`%${tn}%`))
    const [rowsdids] = await dbConfigFsAsttpProducao.query('SELECT number,extensions FROM dids WHERE number LIKE ? OR extensions LIKE ? LIMIT 100',
      Array(2).fill(`%${tn}%`))
    const [rowssipdevices] = await dbConfigFsAsttpProducao.query('SELECT username,dir_params,dir_vars FROM sip_devices WHERE username LIKE ? OR dir_params LIKE ? OR dir_vars LIKE ? LIMIT 100',
      Array(3).fill(`%${tn}%`))
    const [rowsaccounts] = await dbConfigFsAsttpProducao.query('SELECT number,password FROM accounts WHERE number LIKE ? OR password LIKE ? LIMIT 100',
      Array(2).fill(`%${tn}%`))
    res.json({
      resultado: rows,
      dids: rowsdids,
      sipdevices: rowssipdevices,
      accounts: rowsaccounts
    })
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
  const numero = req.query.numero

  try {
    const [rows] = await dbConfigOpensips.query('SELECT id, username, whitelist FROM userblacklist WHERE username LIKE ? LIMIT 100',
      Array(1).fill(`%${numero}%`))
    res.json({ resultado: rows })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao consultar o banco de dados', detalhes: err.message })
  }
})

app.patch('/telefonia/blacklist/:id/desbloquear', async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  try {
    const [rows] = await dbConfigOpensips.query(
      'UPDATE `opensips`.`userblacklist` SET `whitelist` = 1 WHERE `id` = ?',
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

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  try {
    const [rows] = await dbConfigOpensips.query(
      'UPDATE `opensips`.`userblacklist` SET `whitelist` = 0 WHERE `id` = ?',
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
      const parsedVars   = JSON.parse(rows[0].dir_vars   || '{}')

      if (sip_dir_params !== undefined) parsedParams.password = sip_dir_params
      if (sip_dir_vars   !== undefined) parsedVars.effective_caller_id_number = sip_dir_vars

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
      const accountid   = termRows[0]?.terminalid ?? 0
      const sip_profile_id = 1

      const newParams = JSON.stringify({ password: sip_dir_params ?? '' })
      const last8 = sip_username.slice(-8);
      
      
      await dbConfigFsAsttpProducao.query(
        `INSERT INTO sip_devices
           (username, sip_profile_id, accountid, pricelist_id, dir_params, id,dir_vars)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sip_username, sip_profile_id, accountid, 2, newParams, last8, '{"effective_caller_id_name":"'+sip_username+'","effective_caller_id_number":"'+sip_username+'}","user_context":"default"}']  // ← id = last8 do username
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




module.exports = app
