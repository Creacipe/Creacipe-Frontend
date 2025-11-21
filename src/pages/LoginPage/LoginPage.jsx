// LOKASI: src/pages/LoginPage/LoginPage.jsx (VERSI DIPERBARUI)

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import "./LoginPage.scss";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { login, isLoggedIn, user } = useAuth();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect jika sudah login
  useEffect(() => {
    if (isLoggedIn && user) {
      const roleId = user.Role?.role_id;
      if (roleId === 1 || roleId === 2) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isLoggedIn, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(loginData);
      const profileResponse = await userService.getMyProfile();
      const userData = profileResponse.data.data;
      const roleId = userData?.Role?.role_id || userData?.Role?.RoleID;

      if (roleId === 1 || roleId === 2) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Email atau password salah.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-logo">Creacipe</h1>
            <p className="auth-tagline">Platform Resep Kreatif Indonesia</p>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("login");
                setError(null);
              }}>
              Masuk
            </button>
            <button
              className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
              onClick={() => {
                navigate("/register");
              }}>
              Daftar
            </button>
          </div>

          {/* Login Form */}
          <div className="auth-content">
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button
                type="submit"
                className="btn-submit"
                disabled={isLoading}>
                {isLoading ? "Memproses..." : "Masuk"}
              </button>

              <div className="form-footer">
                <Link to="/forgot-password" className="forgot-link">
                  Lupa Password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
