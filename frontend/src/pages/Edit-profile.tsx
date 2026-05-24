import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/edit-profile.module.css";
import API from "../api";

interface User {
  name: string;
  bio: string;
  avatar_url: string;
  email?: string;
}

const EditProfilePage = () => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [errorType, setErrorType] = useState("");

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // 🔒 proteção rota
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // 📥 carregar perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Erro ao carregar perfil");
        }

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

  // 🖼️ selecionar imagem
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // validar imagem
    if (!file.type.startsWith("image/")) {
      setErrorType("error");
      setMessage("❌ Selecione apenas imagens");
      return;
    }

    // validar tamanho
    if (file.size > 5 * 1024 * 1024) {
      setErrorType("error");
      setMessage("❌ Imagem muito grande (máx 5MB)");
      return;
    }

    setAvatarFile(file);

    // preview local
    const reader = new FileReader();

    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  // 💾 atualizar perfil
  const handleUpdate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    setMessage("");
    setErrorType("");

    try {
      let avatar_url = avatar;

      // 📤 upload da imagem
      if (avatarFile) {
        const formData = new FormData();

        formData.append("avatar", avatarFile);

        const uploadRes = await fetch(
          `${API}/user/avatar`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          throw new Error(
            "Erro ao fazer upload da imagem"
          );
        }

        const uploadData =
          await uploadRes.json();

        avatar_url = uploadData.url;
      }

      // 💾 atualizar perfil
      const res = await fetch(
        `${API}/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            bio,
            avatar_url,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();

        throw new Error(
          data.error ||
            "Erro ao atualizar perfil"
        );
      }

      setErrorType("success");

      setMessage(
        "✅ Perfil atualizado com sucesso!"
      );

      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err: any) {
      console.error(err);

      setErrorType("error");

      setMessage(
        err.message || "❌ Erro de conexão"
      );
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ remover foto
  const handleRemovePhoto = () => {
    setAvatarFile(null);

    setPreviewUrl("");

    setAvatar("");
  };

  return (
    <div className={styles["edit-container"]}>
      {/* HEADER */}
      <header className={styles["edit-header"]}>
        <h1 className={styles.logo}>
          PostsMVP
        </h1>

        <nav className={styles["header-nav"]}>
          <button
            onClick={() =>
              navigate("/profile")
            }
            className={styles["nav-btn"]}
          >
            ← Voltar
          </button>

          <button
            onClick={() => navigate("/")}
            className={styles["nav-btn"]}
          >
            Home
          </button>
        </nav>
      </header>

      {/* MAIN */}
      <main className={styles["edit-main"]}>
        <div className={styles["edit-card"]}>
          <h2 className={styles["edit-title"]}>
            ✏️ Editar Perfil
          </h2>

          {message && (
            <div
              className={`${styles.message} ${
                styles[errorType] || ""
              }`}
            >
              {message}
            </div>
          )}

          {/* FOTO */}
          <div
            className={styles["avatar-section"]}
          >
            <div
              className={styles["avatar-preview"]}
            >
              <img
                src={
                  previewUrl ||
                  "https://via.placeholder.com/200"
                }
                alt="Preview"
                className={
                  styles["preview-img"]
                }
              />
            </div>

            <div
              className={styles["avatar-actions"]}
            >
              <label
                className={
                  styles["btn-upload"]
                }
              >
                📁 Escolher Foto

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={
                    styles["file-input"]
                  }
                  disabled={loading}
                />
              </label>

              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className={
                    styles["btn-remove"]
                  }
                  disabled={loading}
                >
                  🗑️ Remover
                </button>
              )}
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleUpdate}
            className={styles["edit-form"]}
          >
            {/* nome */}
            <div
              className={styles["form-group"]}
            >
              <label
                htmlFor="name"
                className={
                  styles["form-label"]
                }
              >
                Nome
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Seu nome completo"
                className={
                  styles["form-input"]
                }
                disabled={loading}
                required
              />
            </div>

            {/* bio */}
            <div
              className={styles["form-group"]}
            >
              <label
                htmlFor="bio"
                className={
                  styles["form-label"]
                }
              >
                Bio
              </label>

              <textarea
                id="bio"
                value={bio}
                onChange={(e) =>
                  setBio(e.target.value)
                }
                placeholder="Conte um pouco sobre você..."
                className={
                  styles["form-textarea"]
                }
                rows={5}
                disabled={loading}
              />
            </div>

            {/* ações */}
            <div
              className={styles["form-actions"]}
            >
              <button
                type="submit"
                className={
                  styles["btn-save"]
                }
                disabled={loading}
              >
                {loading
                  ? "⏳ Salvando..."
                  : "💾 Salvar Alterações"}
              </button>

              <button
                type="button"
                className={
                  styles["btn-cancel"]
                }
                onClick={() =>
                  navigate("/profile")
                }
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

//