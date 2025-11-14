import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../authStore';
import { SCHOOLS } from '../../../utils/schools';
import { API_URL } from '../../../config/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    studentId: ''
  });
  const [error, setError] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const { register, verifyEmail, resendOtp, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const departments = SCHOOLS.map(s => s.value);
  
  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Check if email indicates student role
  const isStudentEmail = formData.email?.endsWith('@students.iitmandi.ac.in');

  // Auto-extract student ID from email when student email is entered
  useEffect(() => {
    if (isStudentEmail) {
      const rollNo = formData.email.split('@')[0];
      if (rollNo && rollNo !== formData.studentId) {
        setFormData(prev => ({ ...prev, studentId: rollNo }));
      }
    }
  }, [formData.email, formData.studentId, isStudentEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    const result = await register(formData);
    if (result.success && result.requiresVerification) {
      setOtpStep(true);
      setPendingEmail(result.email);
      // Start 10 minute countdown (600 seconds) when OTP step begins
      setRemainingSeconds(10 * 60);
    } else if (!result.success) {
      setError(result.error);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email');
      return;
    }
    const result = await verifyEmail(pendingEmail, otp);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleResend = async () => {
    setError('');
    const res = await resendOtp(pendingEmail);
    if (!res.success) {
      setError(res.error);
      return;
    }
    // Reset countdown to 10 minutes after successful resend
    setRemainingSeconds(10 * 60);
  };

  // Countdown effect for OTP timer
  useEffect(() => {
    if (!otpStep) return;
    if (remainingSeconds <= 0) return;

    const id = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [otpStep, remainingSeconds]);

  const formatTime = (secs) => {
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
  {!otpStep ? (
  <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <input
              type="email"
              required
              className="form-input"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          
          <div>
            <input
              type="password"
              required
              className="form-input"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          
          <div>
            <select
              required
              className="form-select"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          {isStudentEmail && (
            <div>
              <input
                type="text"
                required
                readOnly
                className="form-input bg-gray-100 cursor-not-allowed"
                placeholder="Student ID / Roll Number (e.g., B21001)"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value.trim() })}
              />
              <p className="mt-1 text-xs text-gray-500">
                Auto-filled from your email address
              </p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-gray-600 hover:text-gray-800">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
        ) : (
        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <p className="text-gray-600 text-sm">We sent a 6-digit verification code to <strong>{pendingEmail}</strong>. Enter it below to activate your account.</p>

          <div>
            <input
              type="text"
              inputMode="numeric"
              pattern="^[0-9]{6}$"
              maxLength={6}
              required
              autoComplete="one-time-code"
              className="form-input tracking-widest text-center text-lg"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResend}
              disabled={remainingSeconds > 0}
              className={`text-sm ${remainingSeconds > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
            >
              {remainingSeconds > 0 ? `Resend in ${formatTime(remainingSeconds)}` : 'Resend OTP'}
            </button>
            <button type="button" onClick={() => setOtpStep(false)} className="text-sm text-gray-600 hover:underline">
              Edit details
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default Register;