// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3036; // porta HTTP para o navegador

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serve os HTMLs e JS

console.log("Tentando conectar com:", {
  host: process.env.MYSQLHOST, // CORRIGIDO
  port: process.env.MYSQLPORT, // CORRIGIDO
  user: process.env.MYSQLUSER, // CORRIGIDO
  database: process.env.MYSQLDATABASE // CORRIGIDO
});

// Conexão com MariaDB - VARIÁVEIS CORRIGIDAS
const db = mysql.createConnection({
    host: process.env.MYSQLHOST, // CORRIGIDO
    user: process.env.MYSQLUSER, // CORRIGIDO  
    password: process.env.MYSQLPASSWORD, // CORRIGIDO
    database: process.env.MYSQLDATABASE, // CORRIGIDO
    port: process.env.MYSQLPORT // CORRIGIDO
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar no MariaDB:', err);
        process.exit(1);
    }
    console.log('Conectado ao MariaDB!');
});

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
    console.log(`Servidor HTTP rodando na porta ${PORT}`);
});
