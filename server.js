// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3036;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 🔽🔽🔽 VERIFICAÇÃO SIMPLES DA MYSQL_URL 🔽🔽🔽
console.log("MYSQL_URL disponível:", process.env.MYSQL_URL ? '✅ SIM' : '❌ NÃO');

if (!process.env.MYSQL_URL) {
  console.error('❌ VARIÁVEL MYSQL_URL FALTANDO!');
  console.error('Adicione a referência para MYSQL_URL nas variáveis do Railway');
  process.exit(1);
}

// 🔽🔽🔽 CONEXÃO SIMPLES COM MYSQL_URL 🔽🔽🔽
const db = mysql.createConnection(process.env.MYSQL_URL);

db.connect(err => {
    if (err) {
        console.error('❌ Erro ao conectar no MySQL:', err.message);
        process.exit(1);
    }
    console.log('✅ Conectado ao MySQL via URL!');
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
    console.log(`🚀 Servidor HTTP rodando na porta ${PORT}`);
});
