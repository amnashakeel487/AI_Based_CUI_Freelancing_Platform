import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password strength validation
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: '#EF4444' };
    if (score === 3) return { score, label: 'Fair', color: '#F59E0B' };
    if (score === 4) return { score, label: 'Good', color: '#10B981' };
    return { score, label: 'Strong', color: '#059669' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'Contains uppercase & lowercase', test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
    { label: 'Contains a number', test: (p) => /\d/.test(p) },
    { label: 'Contains a special character', test: (p) => /[^a-zA-Z0-9]/.test(p) }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (passwordStrength.score < 3) {
      setError('Please choose a stronger password');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log('Password reset submitted:', { token, password: formData.password });
      
      if (!token) {
        alert(
          'Demo Mode: Password reset requires a valid token from the email link.\n\n' +
          'In production, this would validate the token and update the password via Supabase Auth.'
        );
      } else {
        setSuccess(true);
      }
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F4F7FC' }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm border p-8" style={{ borderColor: '#E2E8F0' }}>
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#DCFCE7' }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: '#10B981' }} />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#102B52' }}>
              Password updated!
            </h1>

            {/* Subtitle */}
            <p className="text-center text-sm mb-6" style={{ color: '#64748B' }}>
              Your password has been successfully updated. You can now sign in with your new password.
            </p>

            {/* Success Button */}
            <button
              onClick={() => navigate('/login')}
              className="w-full h-11 rounded-lg font-semibold text-sm transition-colors"
              style={{ 
                backgroundColor: '#10B981', 
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#10B981'}
            >
              Continue to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F4F7FC' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border p-8" style={{ borderColor: '#E2E8F0' }}>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#EBF4FF' }}
            >
              <Lock className="w-8 h-8" style={{ color: '#1769E8' }} />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#102B52' }}>
            Reset your password
          </h1>

          {/* Subtitle */}
          <p className="text-center text-sm mb-6" style={{ color: '#64748B' }}>
            Choose a strong password to protect your account
          </p>

          {/* Token warning */}
          {!token && (
            <div 
              className="mb-6 p-3 rounded-lg text-sm"
              style={{ backgroundColor: '#FEF3C7', borderLeft: '3px solid #F59E0B', color: '#92400E' }}
            >
              <strong>Demo Mode:</strong> In production, this page requires a valid reset token from the email link.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div 
                className="p-3 rounded-lg text-sm flex items-center gap-2"
                style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeWidth="2" strokeLinecap="round" d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </div>
            )}

            {/* New Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#102B52' }}
              >
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  disabled={loading}
                  className="w-full h-11 px-4 pr-12 rounded-lg text-sm transition-colors"
                  style={{
                    border: '1.5px solid #D6E5FA',
                    color: '#102B52',
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1769E8'}
                  onBlur={(e) => e.target.style.borderColor = '#D6E5FA'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2"
                  style={{ 
                    transform: 'translateY(-50%)', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: '#7d8db0',
                    padding: '4px',
                    display: 'flex'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: '#64748B' }}>
                      Password strength:
                    </span>
                    <span className="text-xs font-semibold" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300 rounded-full"
                      style={{ 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#102B52' }}
              >
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  disabled={loading}
                  className="w-full h-11 px-4 pr-12 rounded-lg text-sm transition-colors"
                  style={{
                    border: '1.5px solid #D6E5FA',
                    color: '#102B52',
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1769E8'}
                  onBlur={(e) => e.target.style.borderColor = '#D6E5FA'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2"
                  style={{ 
                    transform: 'translateY(-50%)', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: '#7d8db0',
                    padding: '4px',
                    display: 'flex'
                  }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Match indicator */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <CheckCircle2 size={14} style={{ color: '#10B981' }} />
                      <span style={{ color: '#10B981' }}>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X size={14} style={{ color: '#EF4444' }} />
                      <span style={{ color: '#EF4444' }}>Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Password requirements */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E2E8F0' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#102B52' }}>
                Password requirements:
              </p>
              <ul className="space-y-1">
                {passwordRequirements.map((req, index) => {
                  const isMet = req.test(formData.password);
                  return (
                    <li key={index} className="flex items-center gap-2 text-xs">
                      {isMet ? (
                        <CheckCircle2 size={14} style={{ color: '#10B981' }} />
                      ) : (
                        <div 
                          className="rounded-full" 
                          style={{ 
                            width: '14px', 
                            height: '14px', 
                            border: '2px solid #D1D5DB',
                            flexShrink: 0
                          }} 
                        />
                      )}
                      <span style={{ color: isMet ? '#10B981' : '#64748B' }}>
                        {req.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg font-semibold text-sm transition-colors"
              style={{ 
                backgroundColor: loading ? '#93C5FD' : '#1769E8', 
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1557c4')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#1769E8')}
            >
              {loading ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        </div>

        {/* Security note */}
        <div className="mt-4 text-center">
          <p className="text-xs" style={{ color: '#64748B' }}>
            Make sure your password is strong and unique to this account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;