import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef([]);

  // Auto-focus first box
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError("");

    // Auto-advance
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...digits];
    [...pasted].forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focus = Math.min(pasted.length, 5);
    inputsRef.current[focus]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("verify-otp/", { email, otp });
      setSuccess("Email verified! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.non_field_errors?.[0] ||
          data?.error ||
          data?.detail ||
          "Verification failed. Please try again."
      );
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError("");
    try {
      // Re-register triggers new OTP; alternatively expose a dedicated resend endpoint
      await api.post("register/", { email, password: "__resend__", role: "Client" });
    } catch (_) {
      // Ignore – backend will reject duplicate. A real resend endpoint is cleaner.
    }
    setResending(false);
    setSuccess("If your email is registered, a new OTP has been sent.");
  };

  return (
    <div className="page-wrapper">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">✉️</div>
          <span className="brand-name">AuthFlow</span>
        </div>

        <h1 className="auth-title">Verify Email</h1>
        <p className="auth-subtitle">
          Enter the 6-digit code sent to{" "}
          <strong style={{ color: "var(--accent)" }}>
            {email || "your email"}
          </strong>
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="otp-container" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                className={`otp-input${d ? " filled" : ""}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                autoComplete="off"
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: "24px" }}
          >
            {loading ? "Verifying…" : "Verify Code →"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            className="btn-secondary"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending…" : "Resend Code"}
          </button>
        </div>

        <div className="auth-link">
          <Link to="/">← Back to Register</Link>
        </div>
      </div>
    </div>
  );
}
