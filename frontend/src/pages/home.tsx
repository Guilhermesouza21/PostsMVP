import { useEffect, useState } from "react";
import Header from "../components/header";

interface User {
  avatar_url: string;
}

interface Post {
  id: number;
  content: string;
  name: string;
  created_at: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");

  const token = localStorage.getItem("token");

  // 👤 user
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3333/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, [token]);

  // 📌 feed
  useEffect(() => {
    loadPosts();
  }, []);

  function loadPosts() {
    fetch("http://localhost:3333/posts")
      .then(res => res.json())
      .then(data => setPosts(data));
  }

  // ✍️ criar post
  async function handleCreatePost() {
    if (!content.trim()) return;

    await fetch("http://localhost:3333/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    setContent("");
    loadPosts(); // atualiza feed
  }

  return (
    <>
      <Header user={user} />

      <div style={{ maxWidth: 600, margin: "20px auto" }}>

        {/* CREATE POST */}
        <div style={{
          background: "#fff",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20
        }}>
          <textarea
            placeholder="O que você está pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              height: 80,
              padding: 10
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
              borderRadius: 6
            }}
          >
            Postar
          </button>
        </div>

        {/* FEED */}
        {posts.map(post => (
          <div
            key={post.id}
            style={{
              background: "#fff",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10
            }}
          >
            <strong>{post.name}</strong>
            <p>{post.content}</p>
          </div>
        ))}

      </div>
    </>
  );
}