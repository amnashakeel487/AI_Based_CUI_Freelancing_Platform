import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

/* ---------- Icon Component ---------- */
const Ico = ({ children, size = '1.23em', color = '#7d8db0', w = 1.8 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    {children}
  </svg>
);

/* ---------- Embedded CSS ---------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.login {
  font-family: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif;
  display: flex;
  height: 100vh;
  background: #fbfdff;
  margin: 0;
  overflow: hidden;
}
.login-left {
  flex: 0 0 53%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 3vh, 40px) clamp(24px, 4vw, 60px);
}
.login-form {
  width: 100%;
  max-width: clamp(360px, 90%, 460px);
}
.login-logo {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.2vh, 12px);
  font-size: clamp(20px, 3.2vh, 26px);
  font-weight: 700;
  color: #102B52;
  margin-bottom: clamp(24px, 4vh, 40px);
}
.login-logo svg {
  width: clamp(32px, 5vh, 44px);
  height: clamp(32px, 5vh, 44px);
  flex-shrink: 0;
}
.login h1 {
  font-size: clamp(24px, 4vh, 34px);
  font-weight: 700;
  color: #102B52;
  margin: 0 0 clamp(6px, 1vh, 10px) 0;
  line-height: 1.2;
}
.login-subtitle {
  font-size: clamp(13px, 1.8vh, 15px);
  color: #5b6b8c;
  margin: 0 0 clamp(24px, 4vh, 32px) 0;
  line-height: 1.5;
}
.login-label {
  display: block;
  font-size: clamp(12.5px, 1.7vh, 14px);
  font-weight: 600;
  color: #102B52;
  margin-bottom: clamp(6px, 1vh, 8px);
}
.login-box {
  position: relative;
  margin-bottom: clamp(14px, 2.2vh, 18px);
}
.login-box input {
  width: 100%;
  height: clamp(36px, 4.5vh, 44px);
  padding: 0 clamp(12px, 1.8vh, 14px);
  border: 1.5px solid #d3e0f4;
  border-radius: clamp(6px, 1vh, 8px);
  font-size: clamp(13px, 1.8vh, 15px);
  color: #102B52;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.login-box input:focus {
  outline: none;
  border-color: #1769E8;
}
.login-box input::placeholder {
  color: #a0b0d0;
}
.login-box.has-icon input {
  padding-right: clamp(36px, 5vh, 44px);
}
.login-toggle-pw {
  position: absolute;
  right: clamp(10px, 1.5vh, 12px);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: clamp(4px, 0.6vh, 6px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7d8db0;
  transition: color 0.2s;
}
.login-toggle-pw:hover {
  color: #1769E8;
}
.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(18px, 2.8vh, 24px);
  font-size: clamp(12.5px, 1.7vh, 14px);
}
.login-check {
  display: flex;
  align-items: center;
  gap: clamp(6px, 0.9vh, 8px);
  color: #5b6b8c;
  cursor: pointer;
}
.login-check input {
  width: clamp(15px, 2vh, 18px);
  height: clamp(15px, 2vh, 18px);
  cursor: pointer;
  accent-color: #1769E8;
}
.login-forgot {
  color: #1769E8;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}
.login-forgot:hover {
  opacity: 0.8;
}
.login button[type="submit"] {
  width: 100%;
  height: clamp(38px, 4.8vh, 46px);
  background: #1769E8;
  color: #fff;
  border: none;
  border-radius: clamp(6px, 1vh, 8px);
  font-size: clamp(13.5px, 1.9vh, 15px);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(6px, 1vh, 8px);
  transition: background 0.2s;
  font-family: inherit;
  margin-bottom: clamp(16px, 2.5vh, 20px);
}
.login button[type="submit"]:hover:not(:disabled) {
  background: #1557c4;
}
.login button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.login-signup {
  text-align: center;
  font-size: clamp(12.5px, 1.7vh, 14px);
  color: #5b6b8c;
  margin: 0;
}
.login-signup a {
  color: #1769E8;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}
.login-signup a:hover {
  opacity: 0.8;
}
.login-right {
  flex: 0 0 47%;
  background: linear-gradient(135deg, #eaf2ff 0%, #d9e9ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 3vh, 40px) clamp(24px, 4vw, 60px);
  position: relative;
  overflow: hidden;
}
.login-hero-content {
  text-align: center;
  z-index: 1;
  max-width: clamp(300px, 85%, 480px);
}
.login-hero-content h2 {
  font-size: clamp(22px, 3.5vh, 30px);
  font-weight: 700;
  color: #102B52;
  margin: 0 0 clamp(12px, 2vh, 16px) 0;
  line-height: 1.3;
}
.login-hero-content p {
  font-size: clamp(13px, 1.8vh, 15px);
  color: #4a5f8a;
  line-height: 1.6;
  margin: 0 0 clamp(24px, 4vh, 32px) 0;
}
.login-hero-img {
  width: clamp(240px, 50vh, 400px);
  height: clamp(200px, 42vh, 340px);
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 340'%3E%3Crect fill='%23fff' rx='8' width='320' height='200' x='40' y='70'/%3E%3Crect fill='%231769E8' rx='6' width='280' height='24' x='60' y='90'/%3E%3Crect fill='%23d3e0f4' rx='4' width='200' height='16' x='60' y='130'/%3E%3Crect fill='%23d3e0f4' rx='4' width='240' height='16' x='60' y='156'/%3E%3Crect fill='%231769E8' opacity='0.3' rx='20' width='80' height='80' x='280' y='20'/%3E%3Ccircle fill='%231769E8' opacity='0.2' r='40' cx='80' cy='280'/%3E%3C/svg%3E") center/contain no-repeat;
  margin-top: clamp(16px, 3vh, 24px);
}
.login-error {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: clamp(6px, 1vh, 8px);
  padding: clamp(10px, 1.5vh, 12px);
  margin-bottom: clamp(14px, 2.2vh, 18px);
  font-size: clamp(12.5px, 1.7vh, 14px);
  color: #c33;
  display: flex;
  align-items: center;
  gap: clamp(6px, 1vh, 8px);
}
@media (max-width: 1024px) {
  .login { flex-direction: column; }
  .login-left, .login-right { flex: none; width: 100%; }
  .login-left { min-height: 100vh; }
  .login-right { display: none; }
}
`;

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log('Login submitted:', formData);
      alert(
        'Demo Mode: Authentication will be available after Supabase Auth integration.\n\n' +
        'Email: ' + formData.email + '\n' +
        'Remember me: ' + (formData.rememberMe ? 'Yes' : 'No')
      );
    }, 1500);
  };

  return (
    <div className="login">
      <style>{css}</style>

      <div className="login-left">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-logo">
            <svg viewBox="0 0 36 32" aria-hidden="true">
              <path d="M18 2 2 10l16 8 16-8z" fill="#12265a" />
              <path d="M8 15v7c0 3 4.5 6 10 6s10-3 10-6v-7l-10 5z" fill="#1d3a8a" />
              <rect x="31" y="11" width="2" height="10" rx="1" fill="#2563eb" />
            </svg>
            CUI Freelance
          </div>

          <h1>Welcome back</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>

          {error && (
            <div className="login-error">
              <Ico size="16px" color="#c33">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </Ico>
              {error}
            </div>
          )}

          <div className="login-box">
            <label className="login-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@comsats.edu.pk"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="login-box has-icon">
            <label className="login-label">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              className="login-toggle-pw"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="login-options">
            <label className="login-check">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
              />
              Remember me
            </label>
            <a href="/forgot-password" className="login-forgot">
              Forgot password?
            </a>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>

          <p className="login-signup">
            Don't have an account? <a href="/freelancer/register">Sign up</a>
          </p>
        </form>
      </div>

      <div className="login-right">
        <div className="login-hero-content">
          <h2>Connect with CUI's Top Talent</h2>
          <p>
            Access exclusive freelancing opportunities, AI-powered project matching, 
            and collaborate with COMSATS students and alumni on innovative projects.
          </p>
          <div className="login-hero-img" />
        </div>
      </div>
    </div>
  );
};

export default Login;