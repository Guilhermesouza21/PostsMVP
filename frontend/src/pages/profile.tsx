import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/profile.module.css"; // ✅ Import correto

// Interface do usuário
interface User {
  name: string;
  bio: string;
  avatar_url: string;
  email?: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // 🔒 Proteção de rota
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);

  // 📥 GET - Buscar perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3333/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data: User = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return <div className={styles.loading}>Carregando...</div>;

  return (
    <div className={styles['profile-container']}>
      {/* Header */}
      <header className={styles['profile-header']}>
       <h1
  className={styles.logo}
  onClick={() => navigate("/home")}
  style={{ cursor: "pointer" }}
>
  PostsMVP
</h1>
        <nav className={styles['header-nav']}>
          <button onClick={() => navigate("/")} className={styles['nav-btn']}>Home</button>
          <button onClick={() => navigate("/edit-profile")} className={styles['nav-btn']}>✏️ Editar Perfil</button>
          <button onClick={handleLogout} className={`${styles['nav-btn']} ${styles.logout}`}>Sair</button>
          
        </nav>
      </header>

      <main className={styles['profile-main']}>
        {/* Coluna Esquerda - Foto e Nome */}
        <aside className={styles['profile-sidebar']}>
          <div className={styles['photo-card']}>
            <img 
              src={user.avatar_url || "https://via.placeholder.com/200"} 
              alt={user.name}
              className={styles.avatar}
            />
            <h2 className={styles['user-name']}>{user.name}</h2>
            <span className={styles['user-status']}>online</span>
          </div>
        </aside>

        {/* Coluna Central - Bio */}
        <section className={styles['profile-content']}>
          <div className={styles['bio-card']}>
            <h2 className={styles['bio-title']}>📋 Sobre mim</h2>
            <p className={styles['bio-text']}>
              {user.bio || "Nenhuma bio cadastrada."}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;