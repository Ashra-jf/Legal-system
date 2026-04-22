// login component that handles user authentication and password recovery
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Scale, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../api/authService';

export default function LoginPage({ onNavigate, onLogin }) {
  // --- Form State Management ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- Password Reset Flow State ---
  // Controls the multi-step dialog for resetting forgotten passwords
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState('email');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Handles the primary login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      const data = await authService.login({ email, password });
      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  // Manages the multi-step password reset process (Email verification -> Code -> New Password)
  const handleForgotPasswordSubmit = () => {
    if (resetStep === 'email') {
      // Check if email exists
      const users = JSON.parse(localStorage.getItem('dnjUsers') || '[]');
      const user = users.find((u) => u.email === resetEmail);

      if (!user) {
        setError('Email not found');
        return;
      }

      // In a real app, an API call would trigger an email. For now, we mock it.
      // Mock reset code (in reality, this would be sent via email)
      localStorage.setItem('resetCode', '123456');
      setResetStep('code');
      setError('');
    } else if (resetStep === 'code') {
      const storedCode = localStorage.getItem('resetCode');
      if (resetCode !== storedCode) {
        setError('Invalid reset code');
        return;
      }
      setResetStep('newPassword');
      setError('');
    } else if (resetStep === 'newPassword') {
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('Passwords do not match');
        return;
      }

      // Update password in localStorage
      const users = JSON.parse(localStorage.getItem('dnjUsers') || '[]');
      const userIndex = users.findIndex((u) => u.email === resetEmail);
      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('dnjUsers', JSON.stringify(users));
      }

      setResetStep('success');
      setError('');

      // Close dialog after 2 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        resetForgotPasswordForm();
      }, 2000);
    }
  };

  const resetForgotPasswordForm = () => {
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetStep('email');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#E5F1FB] flex flex-col">
      {/* Branding Header with Navigation back to Landing */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-[#0A2342]" />
              <span className="text-[#0A2342]">DNJ Legal Firm</span>
            </div>
            <Button
              variant="outline"
              onClick={() => onNavigate('landing')}
              className="border-[#0A2342] text-[#0A2342] hover:bg-[#0A2342] hover:text-white"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Login Form Container */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-[#0A2342] mb-2">Login to DNJ Legal Firm Portal</h1>
              <p className="text-gray-600">Access your account dashboard</p>
            </div>

            {error && (
              <Alert className="mb-6 border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[#0A2342] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
              >
                Login
              </Button>

              <div className="text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="text-[#0A2342] hover:underline"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Password Recovery Modal - Conditionally rendered based on resetStep state */}
      <Dialog open={showForgotPassword} onOpenChange={(open) => {
        setShowForgotPassword(open);
        if (!open) resetForgotPasswordForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {resetStep === 'email' && 'Enter your registered email address to receive a reset code.'}
              {resetStep === 'code' && 'Enter the 6-digit code sent to your email.'}
              {resetStep === 'newPassword' && 'Create a new password for your account.'}
              {resetStep === 'success' && 'Your password has been successfully reset!'}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert className="border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          )}

          {resetStep === 'email' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="resetEmail">Email Address</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          )}

          {resetStep === 'code' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="resetCode">Reset Code</Label>
                <Input
                  id="resetCode"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
                <p className="text-sm text-gray-500 mt-2">Demo code: 123456</p>
              </div>
            </div>
          )}

          {resetStep === 'newPassword' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          {resetStep === 'success' && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Password reset successful! You can now login with your new password.
              </AlertDescription>
            </Alert>
          )}

          {resetStep !== 'success' && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForgotPassword(false);
                  resetForgotPasswordForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleForgotPasswordSubmit}
                className="bg-[#0A2342] text-white hover:bg-[#0A2342]/90"
              >
                {resetStep === 'email' && 'Send Code'}
                {resetStep === 'code' && 'Verify Code'}
                {resetStep === 'newPassword' && 'Reset Password'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
