import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/edit-profile.module.css";

interface User {
  name: string;
  bio: string;
  avatar_url: string;
  email?: string;
}

const EditProfilePage = () => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(""); // URL atual
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Arquivo novo
  const [previewUrl, setPreviewUrl] = useState(""); // Preview local
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorType, setErrorType] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // 🔒 Proteção de rota
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);

  // 📥 Carregar dados atuais
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3333/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data: User = await res.json();
        setName(data.name || "");
        setBio(data.bio || "");
        setAvatar(data.avatar_url || "");
        setPreviewUrl(data.avatar_url || "");
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  // 🖼️ Lidar com seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validar tipo
      if (!file.type.startsWith("image/")) {
        setErrorType("error");
        setMessage("❌ Selecione apenas arquivos de imagem");
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorType("error");
        setMessage("❌ Imagem muito grande. Máximo 5MB");
        return;
      }

      setAvatarFile(file);
      
      // Criar preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 💾 Salvar alterações
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorType("");

    try {
      let avatar_url = avatar;

      // 📤 Se tem arquivo novo, faz upload primeiro
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

      const uploadRes = await fetch("http://localhost:3333/user/avatar", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: formData
});

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatar_url = uploadData.url; // URL retornada pelo servidor
        } else {
          setErrorType("error");
          setMessage("❌ Erro ao fazer upload da imagem");
          setLoading(false);
          return;
        }
      }

      // Atualizar perfil
      const res = await fetch("http://localhost:3333/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          bio,
          avatar_url
        })
      });

      if (res.ok) {
        setErrorType("success");
        setMessage("✅ Perfil atualizado com sucesso!");
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } else {
        const data = await res.json();
        setErrorType("error");
        setMessage(data.error || "❌ Erro ao atualizar perfil");
      }
    } catch (err) {
      console.error(err);
      setErrorType("error");
      setMessage("❌ Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Remover foto
  const handleRemovePhoto = () => {
    setAvatarFile(null);
    setPreviewUrl("");
    setAvatar("");
  };

  return (
    <div className={styles['edit-container']}>
      <header className={styles['edit-header']}>
        <h1 className={styles.logo}>PostsMVP</h1>
        <nav className={styles['header-nav']}>
          <button onClick={() => navigate("/profile")} className={styles['nav-btn']}>
            ← Voltar
          </button>
          <button onClick={() => navigate("/")} className={styles['nav-btn']}>
            Home
          </button>
        </nav>
      </header>

      <main className={styles['edit-main']}>
        <div className={styles['edit-card']}>
          <h2 className={styles['edit-title']}>✏️ Editar Perfil</h2>

          {message && (
            <div className={`${styles.message} ${styles[errorType] || ''}`}>
              {message}
            </div>
          )}

          {/* 📸 Upload de Foto */}
          <div className={styles['avatar-section']}>
            <div className={styles['avatar-preview']}>
              <img 
                src={previewUrl || "https://via.placeholder.com/200"} 
                alt="Preview" 
                className={styles['preview-img']}
              />
            </div>

            <div className={styles['avatar-actions']}>
              <label className={styles['btn-upload']}>
                📁 Escolher Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles['file-input']}
                  disabled={loading}
                />
              </label>
              
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className={styles['btn-remove']}
                  disabled={loading}
                >
                  🗑️ Remover
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleUpdate} className={styles['edit-form']}>
            <div className={styles['form-group']}>
              <label htmlFor="name" className={styles['form-label']}>
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className={styles['form-input']}
                disabled={loading}
                required
              />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="bio" className={styles['form-label']}>
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre você..."
                className={styles['form-textarea']}
                rows={5}
                disabled={loading}
              />
            </div>

            <div className={styles['form-actions']}>
              <button 
                type="submit" 
                className={styles['btn-save']}
                disabled={loading}
              >
                {loading ? "⏳ Salvando..." : "💾 Salvar Alterações"}
              </button>
              
              <button 
                type="button" 
                className={styles['btn-cancel']}
                onClick={() => navigate("/profile")}
                disabled={loading}
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfilePage;