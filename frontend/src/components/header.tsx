import { useNavigate } from "react-router-dom";
import styles from "../styles/home.module.css";

interface User {
  avatar_url?: string;
}

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return (
    <header className={styles.header}>

      <div
        className={styles.brand}
        onClick={() => navigate("/home")}
      >
        PostsMVP
      </div>

      <nav className={styles.nav}>

        {!token ? (
          <button
            className={styles.buttonPrimary}
            onClick={() => navigate("/login")}
          >
            Entrar
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate("/profile")}
              className={styles.buttonAvatar}
            >
              <img
                src={user?.avatar_url || "https://via.placeholder.com/40"}
                alt="avatar"
                className={styles.avatar}
              />
              Perfil
            </button>

            <button
              className={styles.button}
              onClick={() => navigate("/edit-profile")}
            >
              Editar
            </button>

            <button
              className={styles.buttonDanger}
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
            >
              Sair
            </button>
          </>
        )}

      </nav>

    </header>
  );
}