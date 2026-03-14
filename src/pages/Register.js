import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", role: "Client" });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setGlobalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGlobalError("");

    try {
      await api.post("register/", form);
      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const fieldErrors = {};
        let hasFieldError = false;
        ["email", "password", "role"].forEach((field) => {
          if (data[field]) {
            fieldErrors[field] = Array.isArray(data[field])
              ? data[field][0]
              : data[field];
            hasFieldError = true;
          }
        });
        if (hasFieldError) {
          setErrors(fieldErrors);
        } else {
          setGlobalError(
            data.error || data.detail || "Registration failed. Please try again."
          );
        }
      } else {
        setGlobalError("Network error. Is the server running?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="auth-card">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">🔐</div>
          <span className="brand-name">AuthFlow</span>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join us — it only takes a minute.</p>

        {globalError && <div className="alert alert-error">{globalError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input${errors.email ? " error" : ""}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-input${errors.password ? " error" : ""}`}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Role */}
          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              className="form-select"
              value={form.role}
              onChange={handleChange}
            >
              <option value="Client">Client</option>
              <option value="Reseller">Reseller</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </select>
            {errors.role && <span className="field-error">{errors.role}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <div className="auth-link">
          Already have an account?
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}