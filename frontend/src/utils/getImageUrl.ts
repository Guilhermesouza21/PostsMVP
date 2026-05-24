const API =
  import.meta.env.VITE_API_URL ||
  "https://postsmvp.onrender.com";

export function getImageUrl(path?: string | null) {
  if (!path || typeof path !== "string") {
    return "/default-avatar.png";
  }

  const cleanPath = path.trim();

  if (cleanPath.startsWith("http")) {
    return cleanPath;
  }

  return `${API}${cleanPath}`;
}