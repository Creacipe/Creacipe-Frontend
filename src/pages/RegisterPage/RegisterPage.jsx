import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import "./RegisterPage.scss";

const RegisterPage = () => {
  const [activeTab, setActiveTab] = useState("register");
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };
  // 4. Handler Captcha
  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    // 5. Validasi Frontend
    if (!captchaToken) {
      setError("Silakan centang 'Saya bukan robot' terlebih dahulu.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({...registerData, recaptcha_token: captchaToken,});
      setSuccess(
        response.data.message || "Registrasi berhasil! Silakan login."
      );
      setRegisterData({ name: "", email: "", password: "" });

      // Reset Captcha setelah sukses
      setCaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Registrasi gagal. Coba lagi.";
      setError(errorMessage);
      // 7. Reset Captcha jika gagal
      setCaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    } finally {
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
                navigate("/login");
              }}>
              Masuk
            </button>
            <button
              className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("register");
                setError(null);
                setSuccess(null);
              }}>
              Daftar
            </button>
          </div>

          {/* Register Form */}
          <div className="auth-content">
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nama Lengkap
                </label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={registerData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Nama Lengkap"
                    required
                  />
                </div>
              </div>

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
                    value={registerData.email}
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
                    value={registerData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Min. 6 karakter"
                    minLength="6"
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

              <div className="form-group captcha-container">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={onCaptchaChange}
                />
              </div>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Daftar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
