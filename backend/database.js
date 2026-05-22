// database.js
const Database = require('better-sqlite3');

// Cria (ou abre) o arquivo do banco
const db = new Database('database.db');

// Cria a tabela se não existir ainda
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    email     TEXT NOT NULL UNIQUE,
    password  TEXT NOT NULL,
    bio       TEXT DEFAULT '',
    avatar_url TEXT DEFAULT ''
  )
`);



db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER,
    content     TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now')),
    likes_count INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// NOVO: Tabela de likes
db.exec(`
  CREATE TABLE IF NOT EXISTS likes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    post_id    INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
  )
`);

// NOVO: Tabela de tags dos posts
db.exec(`
  CREATE TABLE IF NOT EXISTS post_tags (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    tag     TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id)
  )
`);

// NOVO: Tabela de interesses
db.exec(`
  CREATE TABLE IF NOT EXISTS user_interests (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tag     TEXT NOT NULL,
    weight  INTEGER DEFAULT 1,
    UNIQUE(user_id, tag),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);



//db.exec(`
  //CREATE TABLE IF NOT EXISTS posts (
    //id          INTEGER PRIMARY KEY AUTOINCREMENT,
    //user_id     INTEGER,
    //content     TEXT NOT NULL,
    //created_at  TEXT
  //)
//`);

db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    post_id    INTEGER NOT NULL,
    content    TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
  )
`);


module.exports = db;