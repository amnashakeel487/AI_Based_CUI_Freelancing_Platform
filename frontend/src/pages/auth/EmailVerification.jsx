import React from 'react';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';

const EmailVerification = () => {
  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We've sent a verification link to your university email"
    >
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-primary-blue rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <p className="text-muted-text">
          Please check your email and click the verification link to activate your account.
          If you don't see the email, check your spam folder.
        </p>
        
        <div className="space-y-3">
          <Button className="w-full">
            Resend Verification Email
          </Button>
          
          <Button variant="secondary" className="w-full">
            Back to Login
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EmailVerification;