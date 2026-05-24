  import { useNavigate } from "react-router-dom";
  import { useState } from "react";
  import styles from "../styles/login.module.css"; // ✅ Import correto
  import API from "../api"; //api
  
  const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [errorType, setErrorType] = useState("");
    const [loading, setLoading] = useState(false);



    const handleLogin = async () => {
      setLoading(true);
      setMessage("");
      setErrorType("");

      try {
        const res = await fetch(`${API}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.details) {
            setErrorType("validation");
            setMessage("Preencha todos os campos corretamente");
          } else {
            setErrorType("auth");
            setMessage(data.error || "Erro no login");
          }
          return;
        }

        if (data.token) {
          localStorage.setItem("token", data.token);
          setErrorType("success");
          setMessage("Login realizado com sucesso!");
          
          setTimeout(() => {
            navigate("/home");
          }, 1000);
        }

      } catch (err) {
        console.error(err);
        setErrorType("auth");
        setMessage("Erro ao conectar com o servidor");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.logo}>PostsMVP</h1>
          <p className={styles.subtitulo}>
            Conecte-se aos seus amigos, conheça pessoas e compartilhe seus melhores momentos!
          </p>
        </header>

        <main className={styles['main-content']}>
          <div className={styles['login-card']}>
            <div className={styles['login-header']}>
              <h2 className={styles['login-title']}>Bem-vindo(a) de volta</h2>
              <p className={styles['login-description']}>Olá! Informe seu e-mail e senha.</p>
            </div>

            {message && (
              <div className={`${styles.message} ${styles[errorType] || ''}`}>
                <span className={styles['message-text']}>{message}</span>
              </div>
            )}

            <form 
              className={styles['login-form']} 
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className={styles['input-group']}>
                <label htmlFor="email" className={styles['input-label']}>E-mail</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  className={styles['login-input']}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className={styles['input-group']}>
                <label htmlFor="password" className={styles['input-label']}>Senha</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  className={styles['login-input']}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className={styles['form-options']}>
                <label className={styles['checkbox-label']}>
                  <input type="checkbox" className={styles['checkbox-input']} />
                  <span>Lembre-me</span>
                </label>
                <button
                  type="button"
                  className={styles['btn-forgot']}
                  onClick={() => navigate("/forgot-password")}
                >
                  Esqueci minha senha
                </button>
              </div>

              <div className={styles['form-actions']}>
                <button
                  type="submit"
                  className={styles['btn-submit']}
                  disabled={loading}
                >
                  {loading ? "ENTRANDO..." : "ENTRAR"}
                </button>

                <div className={styles.divider}>
                  <span className={styles['divider-text']}>ou</span>
                </div>

                <button
                  type="button"
                  className={styles['btn-criar']}
                  onClick={() => navigate("/register")}
                >
                  CRIAR CONTA
                </button>
              </div>
            </form>

      
          </div>
        </main>
      </div>
    );
  };

  export default LoginPage;
