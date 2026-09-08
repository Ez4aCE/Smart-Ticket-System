import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student",
  });
  
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const payload = {
        email: form.email,
        password: form.password
      };
      
      const response = await login(payload);
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      // Route based on the ACTUAL role from the backend, not the dropdown
      const role = response.user.role.toUpperCase();
      if (role === "STUDENT") {
        navigate("/student/dashboard");
      } else if (role === "STAFF") {
        navigate("/staff/dashboard");
      } else if (role === "ADMIN") {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || "Login failed. Check your credentials.";
      setError(detail);
    }
  };

  return (
    <div className="login-page">

      {/* =====================================
          LEFT BRANDING SECTION
      ===================================== */}

      <section className="login-brand-section">

        <div className="brand-content">

          {/* Logo */}

          <div className="brand-logo">
            🎓
          </div>

          <h1>
            Smart Student
            <br />
            Support
          </h1>

          <p className="brand-tagline">
            AI-powered support for a smarter
            and faster college experience.
          </p>


          {/* AI Assistant Preview */}

          <div className="ai-preview">

            <div className="ai-preview-header">

              <div className="ai-preview-icon">
                🤖
              </div>

              <div>
                <strong>
                  AI Student Assistant
                </strong>

                <span>
                  ● Online
                </span>
              </div>

            </div>


            <div className="preview-message ai">
              Hello! How can I help you today?
            </div>

            <div className="preview-message user">
              My fee payment is not reflected.
            </div>

            <div className="preview-message ai">
              I'll analyze your issue and route
              it to the right department.
            </div>

          </div>


          {/* Features */}

          <div className="brand-features">

            <div>
              <span>✓</span>
              AI-powered ticket classification
            </div>

            <div>
              <span>✓</span>
              Automatic department routing
            </div>

            <div>
              <span>✓</span>
              Real-time ticket tracking
            </div>

          </div>

        </div>


        <div className="brand-footer">
          © 2026 Smart Student Support
        </div>

      </section>


      {/* =====================================
          RIGHT LOGIN SECTION
      ===================================== */}

      <section className="login-form-section">

        <div className="login-card">

          {/* Header */}

          <div className="login-header">

            <div className="mobile-logo">
              🎓
            </div>

            <h2>
              Welcome Back
            </h2>

            <p>
              Sign in to access your support portal
            </p>

            {error && (
              <div className="alert alert-danger py-2 mt-2 mb-0" style={{fontSize: '0.85rem'}}>
                {error}
              </div>
            )}

          </div>


          {/* Form */}

          <form onSubmit={handleSubmit}>

            {/* Email */}

            <div className="login-field">

              <label>
                Email Address
              </label>

              <div className="input-container">

                <span className="input-icon">
                  ✉
                </span>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* Password */}

            <div className="login-field">

              <label>
                Password
              </label>

              <div className="input-container">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "🙈" : "👁"}
                </button>

              </div>

            </div>


            {/* Role */}

            <div className="login-field">

              <label>
                Login As
              </label>

              <div className="role-options">

                <button
                  type="button"
                  className={
                    form.role === "student"
                      ? "role-option active"
                      : "role-option"
                  }
                  onClick={() =>
                    setForm({
                      ...form,
                      role: "student",
                    })
                  }
                >
                  <span>🎓</span>
                  <div>
                    <strong>Student</strong>
                    <small>Student Portal</small>
                  </div>
                </button>


                <button
                  type="button"
                  className={
                    form.role === "staff"
                      ? "role-option active"
                      : "role-option"
                  }
                  onClick={() =>
                    setForm({
                      ...form,
                      role: "staff",
                    })
                  }
                >
                  <span>👨‍💼</span>
                  <div>
                    <strong>Staff</strong>
                    <small>Department Staff</small>
                  </div>
                </button>


                <button
                  type="button"
                  className={
                    form.role === "admin"
                      ? "role-option active"
                      : "role-option"
                  }
                  onClick={() =>
                    setForm({
                      ...form,
                      role: "admin",
                    })
                  }
                >
                  <span>⚙️</span>
                  <div>
                    <strong>Admin</strong>
                    <small>Administrator</small>
                  </div>
                </button>

              </div>

            </div>


            {/* Remember */}

            <div className="login-options">

              <label className="remember-me">

                <input type="checkbox" />

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>

            </div>


            {/* Login */}

            <button
              type="submit"
              className="login-button"
            >
              <span>
                Sign In
              </span>

              <span>
                →
              </span>
            </button>

          </form>


          {/* Security */}

          <div className="login-security">

            <span>
              🛡️
            </span>

            <div>
              <strong>
                Secure Login
              </strong>

              <p>
                Your account information is protected.
              </p>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;