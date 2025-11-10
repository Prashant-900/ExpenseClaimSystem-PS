import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignUp, useAuth } from '@clerk/clerk-react';
import { SCHOOLS } from '../../../utils/schools';
import { API_URL } from '../../../config/api';
import OTPVerification from './OTPVerification';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    studentId: '',
    roleno: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);
  const navigate = useNavigate();
  const { signUp } = useSignUp();
  const { getToken } = useAuth();
  const departments = SCHOOLS.map(s => s.value);
  
  // Check if email indicates student role and whether it's an IIT Mandi email
  const validDomains = [
    '@students.iitmandi.ac.in',
    '@faculty.iitmandi.ac.in',
    '@audit.iitmandi.ac.in',
    '@finance.iitmandi.ac.in',
    '@admin.iitmandi.ac.in'
  ];
  const isIITDomain = validDomains.some(d => formData.email?.endsWith(d));
  const isStudentEmail = formData.email?.endsWith('@students.iitmandi.ac.in');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Allow any email. If it's not an IIT Mandi email, the form will require `roleno`.
      if (!formData.email || !formData.email.includes('@')) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Validate password length
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        setIsLoading(false);
        return;
      }

      // Split name into firstName and lastName
      const nameParts = formData.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Determine role client-side for convenience (backend will also enforce defaults)
      let role = 'Student';
      if (formData.email?.endsWith('@faculty.iitmandi.ac.in')) role = 'Faculty';
      else if (formData.email?.endsWith('@audit.iitmandi.ac.in')) role = 'Audit';
      else if (formData.email?.endsWith('@finance.iitmandi.ac.in')) role = 'Finance';
      else if (formData.email?.endsWith('@admin.iitmandi.ac.in')) role = 'Admin';
      else if (formData.email?.endsWith('@students.iitmandi.ac.in')) role = 'Student';
      else {
        // For non-IIT emails, default to Faculty (external users)
        role = 'Faculty';
      }

      // Step 1: Create user in Clerk
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: firstName,
        lastName: lastName,
      });

      // Step 2: Prepare email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Store user data to send to backend after OTP verification
      setPendingUserData({
        name: `${firstName} ${lastName}`.trim(),
        email: formData.email,
        department: formData.department,
        studentId: formData.studentId,
        roleno: formData.roleno,
        role,
      });

      // Show OTP verification
      setShowOTP(true);
    } catch (err) {
      setError(err?.errors?.[0]?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = async () => {
    try {
      // Wait for Clerk session to be fully established
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the auth token from Clerk (retry if needed)
      let token = null;
      let retries = 0;
      while (!token && retries < 5) {
        try {
          token = await getToken();
          if (token) break;
        } catch (err) {
          console.log('Waiting for token, retry:', retries + 1);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }

      if (!token) {
        console.error('Failed to get auth token after OTP verification');
        setError('Authentication error. Please try logging in.');
        // Still try to redirect, user can login
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      console.log('Got auth token, saving user to MongoDB...');
      
      // After OTP verification, save user to MongoDB with auth token
      const response = await fetch(`${API_URL}/auth/save-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(pendingUserData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save user:', errorData);
        setError(errorData.message || 'Failed to save user data');
        // Still redirect to dashboard, data will be saved on next login
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      console.log('User saved successfully to MongoDB');
      
      // Wait a bit more for state to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Registration successful - redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error in handleOTPSuccess:', err);
      setError(err?.message || 'Failed to save user data');
      // Still try to redirect, user can login
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  if (showOTP) {
    return <OTPVerification email={formData.email} onSuccess={handleOTPSuccess} type="signup" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
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
                className="form-input"
                placeholder="Student ID / Roll Number (e.g., B21001)"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value.trim() })}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter your official student ID/roll number
              </p>
            </div>
          )}

          {!isIITDomain && (
            <div>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Role No / ID (required for non-IIT emails)"
                value={formData.roleno}
                onChange={(e) => setFormData({ ...formData, roleno: e.target.value.trim() })}
              />
              <p className="mt-1 text-xs text-gray-500">
                Please enter your role number / external ID so admins can verify your account.
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
      </div>
    </div>
  );
};

export default Register;