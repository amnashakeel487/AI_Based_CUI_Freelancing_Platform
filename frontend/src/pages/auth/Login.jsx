import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login submitted:', formData);
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Welcome back! Please sign in to continue."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your.email@comsats.edu.pk"
          required
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-border-color rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-text">
              Remember me
            </label>
          </div>

          <Link
            to="/forgot-password"
            className="text-sm text-primary-blue hover:text-blue-600"
          >
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" className="w-full">
          Sign In
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-text">
            Don't have an account?{' '}
            <Link
              to="/freelancer/register"
              className="font-medium text-primary-blue hover:text-blue-600"
            >
              Sign up as a freelancer
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;