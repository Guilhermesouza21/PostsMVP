require('dotenv').config();

// 🔐 validações de ambiente
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não definida no .env');
}

if (!process.env.PORT) {
  console.warn('PORT não definida, usando 3333 como padrão');
}

// imports
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Rotas
const postsRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express(); // 👈 PRIMEIRO cria o app

// 🔐 segurança da API

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);
app.use(cors());
app.use(express.json());

// 👈 DEPOIS configura arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 👈 DEPOIS as rotas
app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.use('/user', userRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));