import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/register.css";
import API from "../api";


const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorType, setErrorType] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setMessage("");
    setErrorType("");
    setErrors({});

    try {
      if (!name || !email || !password) {
        setErrorType("validation");
        setMessage("Preencha todos os campos");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setErrors(data.details);
          setErrorType("validation");
          setMessage("Verifique os campos abaixo");
        } else {
          setErrorType("auth");
          setMessage(data.error || "Erro ao cadastrar");
        }
        return;
      }

      // Sucesso
      setErrorType("success");
      setMessage("Conta criada com sucesso! Redirecionando...");
      setErrors({});

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error(err);
      setErrorType("auth");
      setMessage("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">PostsMVP</h1>
        <p className="subtitulo">
          Conecte-se aos seus amigos, conheça pessoas e compartilhe seus melhores momentos!
        </p>
      </header>

      <main className="main-content">
        <div className="register-card">
          <div className="register-header">
            <h2 className="register-title">Criar sua conta</h2>
            <p className="register-description">
              Preencha os campos abaixo para começar
            </p>
          </div>

          {/* Mensagem de feedback */}
          {message && (
            <div className={`message ${errorType}`}>
              <span className="message-text">{message}</span>
            </div>
          )}

          <form 
            className="register-form" 
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >
            {/* Campo Nome */}
            <div className="input-group">
              <label htmlFor="name" className="input-label">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                className={`login-input ${errors.name ? 'input-error' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
              {errors.name && (
                <span className="field-error">
                  {errors.name[0]}
                </span>
              )}
            </div>

            {/* Campo Email */}
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                className={`login-input ${errors.email ? 'input-error' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {errors.email && (
                <span className="field-error">
                  {errors.email[0]}
                </span>
              )}
            </div>

            {/* Campo Senha */}
            <div className="input-group">
              <label htmlFor="password" className="input-label">
                Senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                className={`login-input ${errors.password ? 'input-error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              {errors.password && (
                <span className="field-error">
                  {errors.password[0]}
                </span>
              )}
            </div>

            {/* Botões */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    CRIANDO CONTA...
                  </span>
                ) : (
                  "CRIAR CONTA"
                )}
              </button>

              <div className="divider">
                <span className="divider-text">ou</span>
              </div>

              <button
                type="button"
                className="btn-criar"
                onClick={() => navigate("/login")}
              >
                JÁ TENHO CONTA
              </button>
            </div>
          </form>


        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
