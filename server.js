// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
// REMOVA O DOTENV - na Railway as variáveis são injetadas automaticamente
// require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3036;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 🔽🔽🔽 CORREÇÃO CRÍTICA - VERIFICAÇÃO DE VARIÁVEIS 🔽🔽🔽
console.log("Variáveis de ambiente disponíveis:", {
  MYSQLHOST: process.env.MYSQLHOST,
  MYSQLPORT: process.env.MYSQLPORT,
  MYSQLUSER: process.env.MYSQLUSER,
  MYSQLDATABASE: process.env.MYSQLDATABASE,
  MYSQLPASSWORD: process.env.MYSQLPASSWORD ? '***HAS_PASSWORD***' : 'MISSING'
});

// 🔽🔽🔽 CORREÇÃO - VALIDAÇÃO ANTES DE CONECTAR 🔽🔽🔽
if (!process.env.MYSQLHOST || !process.env.MYSQLUSER || !process.env.MYSQLPASSWORD || !process.env.MYSQLDATABASE) {
  console.error('❌ VARIÁVEIS DE AMBIENTE FALTANDO! Verifique a configuração na Railway.');
  console.error('Variáveis necessárias: MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE');
  process.exit(1);
}

// Conexão com MySQL
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,  
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306 // fallback apenas para a porta
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar no MySQL:', err);
        console.error('Detalhes da conexão:', {
            host: process.env.MYSQLHOST,
            port: process.env.MYSQLPORT,
            user: process.env.MYSQLUSER,
            database: process.env.MYSQLDATABASE
        });
        process.exit(1);
    }
    console.log('✅ Conectado ao MySQL!');
});

// ... (o restante do código permanece igual) ...

// Rota POST para salvar nome
app.post('/nomes', (req, res) => {
    const { nome } = req.body;
    if (!nome || nome.trim() === '') {
        return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const query = 'INSERT INTO nomes_table (nome) VALUES (?)';
    db.query(query, [nome.trim()], (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao salvar no banco' });
        res.json({ nome: nome.trim() });
    });
});

// Rota GET para testar nomes salvos
app.get('/nomes', (req, res) => {
    db.query('SELECT * FROM nomes_table', (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao ler banco' });
        res.json(results);
    });
});

// Atualiza pontos de um jogador
app.post('/pontos', (req, res) => {
    const { nome, pontos } = req.body;
    if (!nome || pontos == null) return res.status(400).json({ error: 'Nome e pontos são obrigatórios' });

    const query = 'UPDATE nomes_table SET pontos = ? WHERE nome = ?';
    db.query(query, [pontos, nome], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar pontos:', err);
            return res.status(500).json({ error: 'Erro ao atualizar pontos' });
        }
        res.json({ nome, pontos });
    });
});

// Lista pódio ordenado por pontos
app.get('/podio', (req, res) => {
    db.query('SELECT nome, pontos FROM nomes_table ORDER BY pontos DESC, id ASC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao ler banco' });
        res.json(results);
    });
});

// Inicia servidor HTTP
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor HTTP rodando na porta ${PORT}`);
});
