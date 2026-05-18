const express = require('express'); 
const router = express.Router(); //rotas
const bcrypt = require('bcryptjs'); //hash
const jwt = require('jsonwebtoken'); //token
const db = require('../database'); //banco de dados 
const { z } = require("zod"); //zod verificador de inpunt
const rateLimit = require('express-rate-limit'); //limite de tempo

// 🔐 proteção do login
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 100, // 5 tentativas
  standardHeaders: true, // mostra info nos headers
  legacyHeaders: false,

  message: {
    error: "Muitas tentativas de login. Tente novamente em 10 minutos."
  }
});

/* =========================================================
   🔐 SCHEMAS DE VALIDAÇÃO (ZOD)
   ========================================================= */

// Register com validação e sanitização
const RegisterSchema = z.object({
  name: z
    .string()            
    .min(2,   "Nome muito curto"  )   
    .max(100, "Nome muito longo")
    .trim(),

  email: z
    .string()
    .email("Email inválido")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(6, "Senha muito curta")
});



// 🔥 NOVO: schema de login (ANTES NÃO EXISTIA)
const LoginSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase().trim(),
  password: z.string().min(1, "Senha obrigatória"),
});



/* =========================================================
   🟢 REGISTER
   ========================================================= */

router.post('/register', async (req, res) => {

  // validação com Zod
  const result = RegisterSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Erro de validação",
      //details: result.error.format(),
      details: result.error.flatten().fieldErrors
    });
  }

  const { name, email, password } = result.data;

  try {
    // verifica se usuário já existe
    const existing = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email);

    if (existing) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // 🔥 MELHORIA: bcrypt assíncrono (não bloqueia servidor)
    const hash = await bcrypt.hash(password, 10);

    // salva no banco
    const resultDb = db
      .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
      .run(name, email, hash);

    return res.status(201).json({
      message: 'Usuário criado!',
      id: resultDb.lastInsertRowid,
    });

  } catch (err) {
    // 🔥 proteção contra erro inesperado no banco
    return res.status(500).json({ error: 'Erro interno' });
  }
});



/* =========================================================
   🔐 LOGIN
   ========================================================= */

router.post('/login', loginLimiter, async (req, res) => {
  
  // 🔥 NOVO: validação com Zod (antes não existia)
  const result = LoginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Erro de validação",
      details: result.error.format(),
    });
  }

  const { email, password } = result.data;

  try {
    // busca usuário
    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email);

    // 🔥 MELHORIA: mensagem genérica (evita enumeração de usuários)
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // compara senha (assíncrono = melhor performance)
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // gera token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,

        // 🔥 opcional: já deixa preparado pra roles
        // role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({ token });

  } catch (err) {
    // erro inesperado protegido
    return res.status(500).json({ error: 'Erro interno' });
  }
});



module.exports = router;