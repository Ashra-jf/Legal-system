// Component for new client registration, including email verification logic
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Scale, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../api/authService';

export default function RegistrationPage({ onNavigate }) {
  // Holds all user input for the registration form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Local validation logic to ensure data integrity before API calls
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number';
      } else if (!/[@$!%*?&#]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one special character (@$!%*?&#)';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1: Submit the main registration form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (validateForm()) {
      try {
        await authService.register({
          name: formData.fullName,
          email: formData.email,
          password: formData.password
        });

        setSuccess(true);
        setRegisteredEmail(formData.email);
        setTimeout(() => {
          setIsVerifying(true);
          setSuccess(false); // hide the registration success banner
        }, 1500);
      } catch (err) {
        setApiError(err.error || err.message || 'Registration failed');
      }
    }
  };

  // Step 2: Handle the 6-digit OTP verification process
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setApiError('');
    if (verificationCode.length !== 6) {
      setApiError('Verification code must be 6 digits');
      return;
    }

    try {
      await authService.verifyEmail({
        email: registeredEmail,
        code: verificationCode
      });

      setSuccess(true);
      setTimeout(() => {
        onNavigate('login');
      }, 1500);
    } catch (err) {
      setApiError(err.error || err.message || 'Verification failed');
    }
  };

  // Updates form state and clears error messages on the fly as user types
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#E5F1FB] flex flex-col">
      {/* Basic Navigation Header */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Scale className="w-8 h-8 text-[#0A2342]" />
            <span className="text-[#0A2342]">DNJ Legal Firm</span>
          </div>
        </div>
      </div>

      {/* Registration / Verification Form Area */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-[#0A2342] mb-2">Create Your Account</h1>
              <p className="text-gray-600">Join DNJ Legal Firm as a Client to access our services</p>
            </div>

            {apiError && (
              <Alert className="mb-6 border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600">{apiError}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Registration successful! Redirecting to login page...
                </AlertDescription>
              </Alert>
            )}

            {/* The UI toggles between the initial sign-up form and the OTP verification screen */}
            {isVerifying ? (
              <form onSubmit={handleVerifyEmail} className="space-y-5">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600">
                    We've sent a 6-digit verification code to <strong>{registeredEmail}</strong>. Please enter it below to activate your account.
                  </p>
                </div>
                <div>
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="text-center text-2xl tracking-widest h-14"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0A2342] text-white hover:bg-[#0A2342]/90 h-11"
                >
                  Verify Email
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#0A2342] text-[#0A2342] hover:bg-[#0A2342] hover:text-white"
                  onClick={() => setIsVerifying(false)}
                >
                  Cancel / Return
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={errors.fullName ? 'border-red-500' : ''}
                    placeholder="e.g. John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={errors.password ? 'border-red-500' : ''}
                    placeholder="At least 8 characters"
                  />

                  {formData.password.length > 0 && (
                    <div className="mt-2 text-sm space-y-1">
                      <p className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className="w-3 h-3" /> Minimum 8 characters
                      </p>
                      <p className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className="w-3 h-3" /> At least 1 lowercase letter
                      </p>
                      <p className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className="w-3 h-3" /> At least 1 uppercase letter
                      </p>
                      <p className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className="w-3 h-3" /> At least 1 number
                      </p>
                      <p className={`flex items-center gap-1 ${/[@$!%*?&#]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className="w-3 h-3" /> At least 1 special character
                      </p>
                    </div>
                  )}

                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                    placeholder="Repeat your password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0A2342] text-white hover:bg-[#0A2342]/90 h-11"
                >
                  Create Client Account
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#0A2342] text-[#0A2342] hover:bg-[#0A2342] hover:text-white"
                  onClick={() => onNavigate('login')}
                >
                  Back to Login
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
