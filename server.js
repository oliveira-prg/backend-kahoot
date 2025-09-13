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

// 🔽🔽🔽 VERIFICAÇÃO DAS VARIÁVEIS COM UNDERLINE 🔽🔽🔽
console.log("Variáveis de ambiente disponíveis:", {
  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_PORT: process.env.MYSQL_PORT,
  MYSQL_USER: process.env.MYSQL_USER,
  MYSQL_DATABASE: process.env.MYSQL_DATABASE,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ? '***HAS_PASSWORD***' : 'MISSING'
});

// 🔽🔽🔽 VALIDAÇÃO COM OS NOMES CORRETOS (COM UNDERLINE) 🔽🔽🔽
if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
  console.error('❌ VARIÁVEIS DE AMBIENTE FALTANDO! Verifique a configuração na Railway.');
  console.error('Variáveis necessárias: MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE');
  process.exit(1);
}

// 🔽🔽🔽 CONEXÃO COM OS NOMES CORRETOS (COM UNDERLINE) 🔽🔽🔽
const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,  
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar no MySQL:', err);
        console.error('Detalhes da conexão:', {
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            database: process.env.MYSQL_DATABASE
        });
        process.exit(1);
    }
    console.log('✅ Conectado ao MySQL!');
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
