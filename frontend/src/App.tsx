import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/home";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import ProfilePage from "./pages/profile";
import EditProfilePage from "./pages/edit-profile";

import ProtectedRoute from "./pages/ProtectedRoute";
import AuthRedirect from "./pages/AuthRedirect";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔥 rota raiz inteligente */}
        <Route path="/" element={<AuthRedirect />} />

        {/* 🔓 públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🔒 privadas */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}