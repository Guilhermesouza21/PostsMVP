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

  if (!content || content.trim() === '') {
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
    SELECT 
      posts.id,
      posts.content,
      posts.created_at,
      posts.user_id,
      users.name
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


  if (!post) {
    return res.status(404).json({ error: 'Post não encontrado' });
  }
  
  res.json(post);

  
});

/////////////////////////

//put

//////////////////////////

router.put('/:id', auth, (req, res) => {
  const { content } = req.body;
 
  if (!content || content.trim() === '') {
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

/////////////////////////
// LIKES
/////////////////////////

// POST /posts/:id/like — dar ou remover like (toggle)
router.post('/:id/like', auth, (req, res) => {
  const postId = req.params.id;

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (!post) return res.status(404).json({ error: 'Post não encontrado' });

  const existing = db.prepare(
    'SELECT * FROM likes WHERE user_id = ? AND post_id = ?'
  ).get(req.userId, postId);

  if (existing) {
    // Já curtiu → remove like
    db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?')
      .run(req.userId, postId);

    db.prepare('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?')
      .run(postId);

    return res.json({ message: 'Like removido', liked: false });
  }

  // Ainda não curtiu → adiciona like
  db.prepare(
    'INSERT INTO likes (user_id, post_id) VALUES (?, ?)'
  ).run(req.userId, postId);

  db.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?')
    .run(postId);

  res.json({ message: 'Like adicionado', liked: true });
});


// GET /posts/:id/likes — lista quem curtiu
router.get('/:id/likes', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post não encontrado' });

  const likes = db.prepare(`
    SELECT users.id, users.name, likes.created_at
    FROM likes
    JOIN users ON users.id = likes.user_id
    WHERE likes.post_id = ?
    ORDER BY likes.created_at DESC
  `).all(req.params.id);

  res.json({ total: likes.length, likes });
});


/////////////////////////
// COMENTÁRIOS
/////////////////////////

// POST /posts/:id/comments — criar comentário
router.post('/:id/comments', auth, (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Conteúdo obrigatório' });
  }

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (!post) return res.status(404).json({ error: 'Post não encontrado' });

  const result = db.prepare(`
    INSERT INTO comments (user_id, post_id, content)
    VALUES (?, ?, ?)
  `).run(req.userId, postId, content.trim());

  res.status(201).json({
    message: 'Comentário criado!',
    commentId: result.lastInsertRowid
  });
});


// GET /posts/:id/comments — listar comentários do post
router.get('/:id/comments', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post não encontrado' });

  const comments = db.prepare(`
    SELECT 
      comments.id,
      comments.content,
      comments.created_at,
      users.id   AS user_id,
      users.name AS user_name
    FROM comments
    JOIN users ON users.id = comments.user_id
    WHERE comments.post_id = ?
    ORDER BY comments.created_at ASC
  `).all(req.params.id);

  res.json({ total: comments.length, comments });
});


// PUT /posts/:id/comments/:commentId — editar comentário
router.put('/:id/comments/:commentId', auth, (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Conteúdo obrigatório' });
  }

  const comment = db.prepare(
    'SELECT * FROM comments WHERE id = ? AND post_id = ?'
  ).get(req.params.commentId, req.params.id);

  if (!comment) return res.status(404).json({ error: 'Comentário não encontrado' });

  if (comment.user_id !== req.userId) {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  db.prepare('UPDATE comments SET content = ? WHERE id = ?')
    .run(content.trim(), req.params.commentId);

  res.json({ message: 'Comentário atualizado!' });
});


// DELETE /posts/:id/comments/:commentId — deletar comentário
router.delete('/:id/comments/:commentId', auth, (req, res) => {
  const comment = db.prepare(
    'SELECT * FROM comments WHERE id = ? AND post_id = ?'
  ).get(req.params.commentId, req.params.id);

  if (!comment) return res.status(404).json({ error: 'Comentário não encontrado' });

  if (comment.user_id !== req.userId) {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.commentId);

  res.json({ message: 'Comentário deletado!' });
});




module.exports = router;