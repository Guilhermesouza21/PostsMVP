require('dotenv').config();

// 🔐 validações de ambiente
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não definida no .env');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Rotas
const postsRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

// 🔐 Middlewares (ordem correta)

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());

// 📁 arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🧭 rotas
app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.use('/user', userRoutes);

// 🚀 server
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});