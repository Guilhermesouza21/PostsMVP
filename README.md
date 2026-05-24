# PostsMVP 🚀

> Rede social de portfólio para desenvolvedores — compartilhe projetos, conecte-se com a comunidade e construa sua presença profissional.

![TypeScript](https://img.shields.io/badge/TypeScript-46.9%25-3178C6?style=flat-square&logo=typescript)
![JavaScript](https://img.shields.io/badge/JavaScript-23.9%25-F7DF1E?style=flat-square&logo=javascript)
![CSS](https://img.shields.io/badge/CSS-28.7%25-1572B6?style=flat-square&logo=css3)

## 📌 Sobre o projeto

PostsMVP é uma aplicação web full stack que combina o melhor das redes sociais com a praticidade de um portfólio técnico. Desenvolvedores podem criar posts sobre seus projetos, seguir outros profissionais e construir sua rede dentro da comunidade dev.

**Acesse em produção:** [posts-mvp.vercel.app](https://posts-mvp.vercel.app)

---

## 🛠️ Tecnologias

### Frontend
- **React** com TypeScript
- Vite (build tool)
- CSS Modules
- Deploy via **Vercel**

### Backend
- **Node.js** com JavaScript
- API RESTful
- Autenticação de usuários

---

## 📁 Estrutura do projeto

```
PostsMVP/
├── frontend/       # Aplicação React + TypeScript
│   └── src/
├── backend/        # API Node.js
│   └── src/
└── .gitignore
```

---

## ⚙️ Como rodar localmente

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

> O frontend roda em `http://localhost:5173` e o backend em `http://localhost:3000` (verifique as variáveis de ambiente).

---

## 🔑 Variáveis de ambiente

Crie um arquivo `.env` na pasta `backend/` com:

```env
PORT=3000
DATABASE_URL=sua_url_aqui
JWT_SECRET=seu_secret_aqui
```

---

## ✨ Funcionalidades

- [x] Autenticação de usuários (cadastro e login)
- [x] Criação e listagem de posts
- [x] Perfil de usuário / portfólio
- [x] Feed social
- [ ] Likes e comentários *(em desenvolvimento)*
- [ ] Sistema de seguidores *(em desenvolvimento)*
- [ ] Upload de imagens *(planejado)*

---

## 🗺️ Roadmap

- **v0.2** — Likes, comentários e notificações
- **v0.3** — Sistema de seguidores e feed personalizado
- **v0.4** — Upload de imagens e mídia nos posts
- **v1.0** — Busca de usuários, tags de tecnologia e versão mobile

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra uma issue ou envie um pull request.

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 👤 Autor

**Guilherme Souza**
- GitHub: [@Guilhermesouza21](https://github.com/Guilhermesouza21)

---

## 📄 Licença

Este projeto está sob a licença MIT.
