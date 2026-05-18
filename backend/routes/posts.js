const express = require('express');
const router = express.Router();
const db = require('../database');
const jwt = require('jsonwebtoken');

// middleware auth (igual ao que você já tem)
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token não enviado' });

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}



/////////////////////////

//posts

//////////////////////////

router.post('/', auth, (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Conteúdo obrigatório' });
  }

  const result = db.prepare(`
    INSERT INTO posts (user_id, content, created_at)
    VALUES (?, ?, datetime('now'))
  `).run(req.userId, content);

  res.json({
    message: 'Post criado!',
    postId: result.lastInsertRowid
  });
});


/////////////////////////

//get

//////////////////////////


router.get('/', (req, res) => {
  const posts = db.prepare(`
    SELECT posts.*, users.name
    FROM posts
    JOIN users ON users.id = posts.user_id
    ORDER BY posts.created_at DESC
  `).all();

  res.json(posts);
});


router.get('/:id', (req, res) => {
  const post = db.prepare(`
    SELECT posts.*, users.name
    FROM posts
    JOIN users ON users.id = posts.user_id
    WHERE posts.id = ?
  `).get(req.params.id);

  res.json(post);
});

/////////////////////////

//put

//////////////////////////

router.put('/:id', auth, (req, res) => {
  const { content } = req.body;
 
  if (!content) {
    return res.status(400).json({ error: 'Conteúdo obrigatório' });
  }

  const post = db.prepare(
    'SELECT * FROM posts WHERE id = ?'
  ).get(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post não encontrado' });
  }

  if (post.user_id !== req.userId) {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  db.prepare(
    'UPDATE posts SET content = ? WHERE id = ?'
  ).run(content, req.params.id);

  res.json({ message: 'Post atualizado!' });
});



/////////////////////////

//delete

//////////////////////////


router.delete('/:id', auth, (req, res) => {
  const post = db.prepare(
    'SELECT * FROM posts WHERE id = ?'
  ).get(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post não encontrado' });
  }

  if (post.user_id !== req.userId) {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  db.prepare(
    'DELETE FROM posts WHERE id = ?'
  ).run(req.params.id);

  res.json({ message: 'Post deletado!' });
});

module.exports = router;