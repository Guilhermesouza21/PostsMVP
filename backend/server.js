require('dotenv').config();

// 🔐 validações de ambiente
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não definida no .env');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// Rotas
const postsRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());

// 📁 garantir pasta uploads (IMPORTANTE no Render)
const uploadsPath = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

app.use('/uploads', express.static(uploadsPath));

// 🧭 rotas
app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.use('/user', userRoutes);

// 🚀 server
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});