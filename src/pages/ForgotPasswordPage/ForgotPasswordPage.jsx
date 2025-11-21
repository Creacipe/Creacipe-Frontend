import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import "./ForgotPasswordPage.scss";
import api from "../../services/api";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Input Email, 2: Input OTP + New Password
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await api.post("/forgot-password", { email });
      setSuccess(response.data.message);
      setStep(2); // Move to step 2
    } catch (err) {
      setError(err.response?.data?.error || "Gagal mengirim kode verifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (verificationCode.length !== 6) {
      setError("Kode verifikasi harus 6 digit");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/forgot-password/verify", {
        email,
        verification_code: verificationCode,
        new_password: newPassword,
      });

      setSuccess(response.data.message);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Gagal mereset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          {/* Header */}
          <div className="forgot-header">
            <Link to="/login" className="back-button">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="forgot-title">Lupa Password</h1>
            <p className="forgot-subtitle">
              {step === 1
                ? "Masukkan email Anda untuk menerima kode verifikasi"
                : "Masukkan kode OTP dan password baru Anda"}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? "active" : ""}`}>
              <div className="step-circle">1</div>
              <span className="step-label">Email</span>
            </div>
            <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
            <div className={`step ${step >= 2 ? "active" : ""}`}>
              <div className="step-circle">2</div>
              <span className="step-label">Verifikasi</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="forgot-content">
            {step === 1 ? (
              // STEP 1: Input Email
              <form onSubmit={handleRequestOTP} className="forgot-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Alamat Email
                  </label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      className="form-input"
                      placeholder="nama@email.com"
                      required
                    />
                  </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && (
                  <div className="alert alert-success">{success}</div>
                )}

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isLoading}>
                  {isLoading ? "Mengirim..." : "Kirim Kode OTP"}
                </button>

                <div className="form-footer">
                  <Link to="/login" className="back-link">
                    Kembali ke Login
                  </Link>
                </div>
              </form>
            ) : (
              // STEP 2: Input OTP + New Password
              <form onSubmit={handleResetPassword} className="forgot-form">
                <div className="info-box">
                  <p>
                    Kode verifikasi telah dikirim ke <strong>{email}</strong>
                  </p>
                  <p className="info-note">
                    Cek inbox atau folder spam Anda. Kode berlaku 10 menit.
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="verification-code" className="form-label">
                    Kode Verifikasi (6 digit)
                  </label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" />
                    <input
                      type="text"
                      id="verification-code"
                      name="verification-code"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value.replace(/\D/g, ""));
                        setError(null);
                      }}
                      className="form-input"
                      placeholder="123456"
                      maxLength="6"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="new-password" className="form-label">
                    Password Baru
                  </label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="new-password"
                      name="new-password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError(null);
                      }}
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

                {error && <div className="alert alert-error">{error}</div>}
                {success && (
                  <div className="alert alert-success">{success}</div>
                )}

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Reset Password"}
                </button>

                <div className="form-footer">
                  <button
                    type="button"
                    className="resend-link"
                    onClick={() => {
                      setStep(1);
                      setVerificationCode("");
                      setNewPassword("");
                      setError(null);
                      setSuccess(null);
                    }}>
                    Kirim ulang kode
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
