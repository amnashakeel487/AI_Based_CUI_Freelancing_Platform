import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

const EmailVerification = () => {
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const maskEmail = (email) => {
    if (!email) return 'your email';
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) return email;
    const masked = localPart[0] + '***' + localPart.slice(-1);
    return `${masked}@${domain}`;
  };

  const handleChange = (index, value) => {
    // Only accept digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        setError('');
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only accept 6-digit numbers
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate verification (backend not connected)
    setTimeout(() => {
      setLoading(false);
      alert(
        'Demo Mode: Email verification will be available after Supabase Auth integration.\n\n' +
        'Your code: ' + code + '\n' +
        'Email: ' + (email || 'Not provided')
      );
    }, 1500);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setError('');

    // Simulate resend (backend not connected)
    setTimeout(() => {
      setResendLoading(false);
      setResendCooldown(60); // 60 second cooldown
      alert(
        'Demo Mode: Email delivery will be available after authentication is connected.\n\n' +
        'A new verification code would be sent to: ' + (email || 'your email')
      );
    }, 1000);
  };

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
            Verify your email
          </h1>

          {/* Subtitle */}
          <p className="text-center text-sm mb-2" style={{ color: '#64748B' }}>
            We've sent a verification code to
          </p>

          {/* Email display */}
          {email && (
            <p className="text-center font-medium mb-6" style={{ color: '#102B52' }}>
              {maskEmail(email)}
            </p>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP Input Label */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: '#102B52' }}>
                Enter the 6-digit verification code
              </label>

              {/* OTP Inputs */}
              <div className="flex gap-2 justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-full h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{
                      borderColor: error ? '#ef4444' : '#D6E5FA',
                      color: '#102B52',
                    }}
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>

              {/* Error message */}
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              style={{
                backgroundColor: '#1769E8',
                color: 'white',
              }}
            >
              {loading ? 'Verifying...' : 'Verify email'}
            </Button>

            {/* Resend section */}
            <div className="text-center">
              <p className="text-sm mb-2" style={{ color: '#64748B' }}>
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || resendLoading}
                className="text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
                style={{ color: '#1769E8' }}
              >
                {resendLoading
                  ? 'Sending...'
                  : resendCooldown > 0
                  ? `Resend code (${resendCooldown}s)`
                  : 'Resend code'}
              </button>
            </div>

            {/* Navigation links */}
            <div className="pt-4 border-t space-y-2 text-center" style={{ borderColor: '#E2E8F0' }}>
              <Link
                to="/freelancer/register"
                state={{ email }}
                className="block text-sm"
                style={{ color: '#64748B' }}
              >
                Change email address
              </Link>
              <Link
                to="/login"
                className="block text-sm font-medium"
                style={{ color: '#1769E8' }}
              >
                Back to login
              </Link>
            </div>
          </form>
        </div>

        {/* Demo notice */}
        <div className="mt-4 text-center">
          <p className="text-xs" style={{ color: '#64748B' }}>
            Demo Mode: Verification codes are not sent until Supabase Auth is integrated
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;