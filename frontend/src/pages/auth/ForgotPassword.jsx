import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log('Forgot password submitted:', email);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F4F7FC' }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm border p-8" style={{ borderColor: '#E2E8F0' }}>
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#EBF4FF' }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: '#1769E8' }} />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#102B52' }}>
              Check your email
            </h1>

            {/* Subtitle */}
            <p className="text-center text-sm mb-6" style={{ color: '#64748B' }}>
              If an account exists for <strong style={{ color: '#102B52' }}>{email}</strong>, 
              you will receive a password reset link shortly.
            </p>

            {/* Demo Notice */}
            <div 
              className="mb-6 p-3 rounded-lg text-sm" 
              style={{ backgroundColor: '#FEF3C7', borderLeft: '3px solid #F59E0B', color: '#92400E' }}
            >
              <strong>Demo Mode:</strong> Email delivery will be available after Supabase Auth is integrated.
            </div>

            {/* Instructions */}
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E2E8F0' }}>
              <p className="text-sm mb-2" style={{ color: '#64748B' }}>
                <strong style={{ color: '#102B52' }}>Next steps:</strong>
              </p>
              <ol className="text-sm space-y-1 ml-4" style={{ color: '#64748B', listStyle: 'decimal' }}>
                <li>Check your inbox for the reset link</li>
                <li>Click the link in the email</li>
                <li>Enter your new password</li>
              </ol>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setSubmitted(false)}
                className="w-full h-11 rounded-lg font-medium text-sm transition-colors"
                style={{ 
                  backgroundColor: '#1769E8', 
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1557c4'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1769E8'}
              >
                Try another email
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center w-full h-11 rounded-lg font-medium text-sm transition-colors"
                style={{ 
                  border: '1.5px solid #D6E5FA',
                  color: '#1769E8',
                  textDecoration: 'none'
                }}
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to login
              </Link>
            </div>
          </div>

          {/* Help text */}
          <div className="mt-4 text-center">
            <p className="text-xs" style={{ color: '#64748B' }}>
              Didn't receive an email? Check your spam folder or try again.
            </p>
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
              <Mail className="w-8 h-8" style={{ color: '#1769E8' }} />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#102B52' }}>
            Forgot your password?
          </h1>

          {/* Subtitle */}
          <p className="text-center text-sm mb-6" style={{ color: '#64748B' }}>
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#102B52' }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="your.email@comsats.edu.pk"
                disabled={loading}
                className="w-full h-11 px-4 rounded-lg text-sm transition-colors"
                style={{
                  border: error ? '1.5px solid #EF4444' : '1.5px solid #D6E5FA',
                  color: '#102B52',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = '#1769E8';
                }}
                onBlur={(e) => {
                  if (!error) e.target.style.borderColor = '#D6E5FA';
                }}
              />
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
              {loading ? 'Sending...' : 'Send reset link'}
            </button>

            {/* Back to login link */}
            <div className="pt-4 border-t text-center" style={{ borderColor: '#E2E8F0' }}>
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium"
                style={{ color: '#1769E8', textDecoration: 'none' }}
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to login
              </Link>
            </div>
          </form>
        </div>

        {/* Security note */}
        <div className="mt-4 text-center">
          <p className="text-xs" style={{ color: '#64748B' }}>
            For security reasons, we'll send the link only to registered email addresses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;