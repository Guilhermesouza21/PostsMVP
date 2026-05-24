const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../database');
const multer = require('multer');
const path = require('path');

/* =========================
   📸 CONFIGURAÇÃO UPLOAD
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens são permitidas'));
  }
});

/* =========================
   🔐 MIDDLEWARE AUTH
========================= */
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: 'Token não enviado' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

/* =========================
   👤 GET PROFILE
========================= */
router.get('/profile', auth, (req, res) => {
  const user = db.prepare(
    'SELECT id, name, email, bio, avatar_url FROM users WHERE id = ?'
  ).get(req.userId);

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  return res.json(user);
});

/* =========================
   ✏️ UPDATE PROFILE
========================= */
router.put('/profile', auth, (req, res) => {
  const { name, bio, avatar_url } = req.body;

  const user = db.prepare(
    'SELECT name, bio, avatar_url FROM users WHERE id = ?'
  ).get(req.userId);

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  db.prepare(`
    UPDATE users 
    SET name = ?, bio = ?, avatar_url = ?
    WHERE id = ?
  `).run(
    name ?? user.name,
    bio ?? user.bio,
    avatar_url ?? user.avatar_url,
    req.userId
  );

  return res.json({ message: 'Perfil atualizado!' });
});

/* =========================
   📤 UPLOAD AVATAR  👈 ADICIONE ISSO
========================= */
router.post('/avatar', auth, (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('❌ Erro no upload:', err.message);
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log('✅ Upload realizado:', req.file.filename);

    const avatarUrl =  `/uploads/avatars/${req.file.filename}`;
    
    return res.json({ url: avatarUrl });
  });
});

module.exports = router;