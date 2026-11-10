require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuração do Pool de conexão com a URI do Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessário para aceitar a conexão SSL do Supabase
  }
});

// Testa a conexão e garante que a tabela 'alunos' seja criada no PostgreSQL
pool.query(`
  CREATE TABLE IF NOT EXISTS alunos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
  );
`, (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao Supabase/PostgreSQL:', err.stack);
  } else {
    console.log('Conectado ao Supabase com sucesso!');
    console.log('Tabela alunos pronta para uso!');
  }
});

// Rota para buscar todos os alunos
app.get('/alunos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alunos');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro na consulta:', err);
    res.status(500).json({ erro: 'Erro ao buscar alunos' });
  }
});

// Rota para cadastrar um novo aluno
app.post('/alunos', async (req, res) => {
  const { nome } = req.body;
  
  if (!nome) {
    return res.status(400).json({ erro: 'O campo nome é obrigatório' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO alunos (nome) VALUES ($1) RETURNING *',
      [nome]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao inserir aluno:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar aluno' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});