import { useEffect, useState } from "react";
import Header from "../components/header";
import API from "../api";

interface User {
  id: number;
  avatar_url: string;
}

interface Comment {
  id: number;
  content: string;
  user_name: string;
  created_at: string;
  user_id: number;
}

interface Post {
  id: number;
  content: string;
  name: string;
  created_at: string;
  user_id: number;
  likes_count: number;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");

  // likes
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // comentários
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [openComments, setOpenComments] = useState<Set<number>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>(
    {}
  );

  const [token] = useState(() => localStorage.getItem("token"));

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 👤 carregar perfil
  useEffect(() => {
    if (!token) return;

    fetch(`${API}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar perfil");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => console.error(err));
  }, [token]);

  // 📌 carregar posts
  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const res = await fetch(`${API}/posts`);

      if (!res.ok) {
        throw new Error("Erro ao carregar posts");
      }

      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
    }
  }

  // ✍️ criar post
  async function handleCreatePost() {
    if (!content.trim() || !token) return;

    try {
      const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error("Erro ao criar post");
      }

      setContent("");
      loadPosts();
    } catch (err) {
      console.error(err);
    }
  }

  // 🗑 deletar post
  async function handleDeletePost(id: number) {
    if (!token) return;

    const confirmDelete = window.confirm(
      "Deseja realmente deletar este post?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API}/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erro ao deletar post");
      }

      setPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  // ✏️ editar post
  async function handleUpdatePost(id: number, oldContent: string) {
    if (!token) return;

    const newContent = window.prompt("Editar post:", oldContent);

    if (!newContent || !newContent.trim()) return;

    try {
      const res = await fetch(`${API}/posts/${id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ content: newContent }),
      });

      if (!res.ok) {
        throw new Error("Erro ao editar post");
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === id ? { ...post, content: newContent } : post
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  // ❤️ curtir/descurtir
  async function handleLike(postId: number) {
    if (!token) return;

    try {
      const res = await fetch(`${API}/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erro ao curtir post");
      }

      const data = await res.json();

      // atualizar likes locais
      setLikedPosts((prev) => {
        const next = new Set(prev);

        if (data.liked) {
          next.add(postId);
        } else {
          next.delete(postId);
        }

        return next;
      });

      // atualizar contador
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes_count:
                  post.likes_count + (data.liked ? 1 : -1),
              }
            : post
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  // 💬 abrir comentários
  async function toggleComments(postId: number) {
    setOpenComments((prev) => {
      const next = new Set(prev);

      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
        loadComments(postId);
      }

      return next;
    });
  }

  // 💬 carregar comentários
  async function loadComments(postId: number) {
    try {
      const res = await fetch(`${API}/posts/${postId}/comments`);

      if (!res.ok) {
        throw new Error("Erro ao carregar comentários");
      }

      const data = await res.json();

      setComments((prev) => ({
        ...prev,
        [postId]: data.comments,
      }));
    } catch (err) {
      console.error(err);
    }
  }

  // 💬 criar comentário
  async function handleCreateComment(postId: number) {
    const text = commentInputs[postId];

    if (!text?.trim() || !token) return;

    try {
      const res = await fetch(`${API}/posts/${postId}/comments`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        throw new Error("Erro ao comentar");
      }

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));

      loadComments(postId);
    } catch (err) {
      console.error(err);
    }
  }

  // 🗑 deletar comentário
  async function handleDeleteComment(
    postId: number,
    commentId: number
  ) {
    if (!token) return;

    try {
      const res = await fetch(
        `${API}/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao deletar comentário");
      }

      loadComments(postId);
    } catch (err) {
      console.error(err);
    }
  }

  const canEdit = (post: Post) => {
    return user?.id === post.user_id;
  };

  return (
    <>
      <Header user={user} />

      <div style={{ maxWidth: 600, margin: "20px auto" }}>
        {/* CREATE POST */}
        <div
          style={{
            background: "#fff",
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          <textarea
            placeholder="O que você está pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              height: 80,
              padding: 10,
            }}
          />

          <button
            onClick={handleCreatePost}
            style={{
              marginTop: 10,
              padding: 10,
              background: "#3c5a99",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Postar
          </button>
        </div>

        {/* FEED */}
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              background: "#fff",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <strong>{post.name}</strong>

            <p>{post.content}</p>

            {/* ações */}
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              {/* LIKE */}
              <button
                onClick={() => handleLike(post.id)}
                style={{
                  padding: "5px 12px",
                  background: likedPosts.has(post.id)
                    ? "#3c5a99"
                    : "#e4e6eb",
                  color: likedPosts.has(post.id)
                    ? "white"
                    : "#333",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                }}
              >
                👍{" "}
                {post.likes_count > 0
                  ? post.likes_count
                  : ""}{" "}
                Curtir
              </button>

              {/* comentar */}
              <button
                onClick={() => toggleComments(post.id)}
                style={{
                  padding: "5px 12px",
                  background: "#e4e6eb",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                }}
              >
                💬 Comentar
              </button>

              {/* editar/deletar */}
              {canEdit(post) && (
                <>
                  <button
                    onClick={() =>
                      handleUpdatePost(
                        post.id,
                        post.content
                      )
                    }
                    style={{
                      padding: 5,
                      background: "#f0ad4e",
                      border: "none",
                      borderRadius: 5,
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      handleDeletePost(post.id)
                    }
                    style={{
                      padding: 5,
                      background: "#d9534f",
                      border: "none",
                      borderRadius: 5,
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Deletar
                  </button>
                </>
              )}
            </div>

            {/* comentários */}
            {openComments.has(post.id) && (
              <div
                style={{
                  marginTop: 12,
                  borderTop: "1px solid #eee",
                  paddingTop: 10,
                }}
              >
                {(comments[post.id] ?? []).map(
                  (comment) => (
                    <div
                      key={comment.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                        background: "#f0f2f5",
                        borderRadius: 8,
                        padding: "8px 10px",
                      }}
                    >
                      <div>
                        <strong
                          style={{ fontSize: 13 }}
                        >
                          {comment.user_name}
                        </strong>

                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 14,
                          }}
                        >
                          {comment.content}
                        </p>
                      </div>

                      {user?.id ===
                        comment.user_id && (
                        <button
                          onClick={() =>
                            handleDeleteComment(
                              post.id,
                              comment.id
                            )
                          }
                          style={{
                            background: "none",
                            border: "none",
                            color: "#d9534f",
                            cursor: "pointer",
                            fontSize: 16,
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )
                )}

                {/* input comentário */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <input
                    placeholder="Escreva um comentário..."
                    value={
                      commentInputs[post.id] ?? ""
                    }
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [post.id]:
                          e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateComment(
                          post.id
                        );
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "6px 10px",
                      borderRadius: 20,
                      border:
                        "1px solid #ccc",
                    }}
                  />

                  <button
                    onClick={() =>
                      handleCreateComment(
                        post.id
                      )
                    }
                    style={{
                      padding: "6px 14px",
                      background: "#3c5a99",
                      color: "white",
                      border: "none",
                      borderRadius: 20,
                      cursor: "pointer",
                    }}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}