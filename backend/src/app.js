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



module.exports = app
