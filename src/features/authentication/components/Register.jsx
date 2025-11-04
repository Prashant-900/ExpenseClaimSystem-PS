import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignUp } from '@clerk/clerk-react';
import { SCHOOLS } from '../../../utils/schools';
import OTPVerification from './OTPVerification';
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
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState('');
  const [registrationData, setRegistrationData] = useState(null);
  const navigate = useNavigate();
  const { signUp } = useSignUp();
  const departments = SCHOOLS.map(s => s.value);
  
  // Check if email indicates student role
  const isStudentEmail = formData.email.endsWith('@students.iitmandi.ac.in');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate email domain
      const validDomains = [
        '@students.iitmandi.ac.in',
        '@faculty.iitmandi.ac.in',
        '@audit.iitmandi.ac.in',
        '@finance.iitmandi.ac.in',
        '@admin.iitmandi.ac.in'
      ];
      
      const isValidDomain = validDomains.some(domain => formData.email.endsWith(domain));
      if (!isValidDomain) {
        setError('Please use an IIT Mandi email address (@students.iitmandi.ac.in, @faculty.iitmandi.ac.in, @audit.iitmandi.ac.in, @finance.iitmandi.ac.in, or @admin.iitmandi.ac.in)');
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

      // Create sign-up with email verification
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: firstName,
        lastName: lastName,
      });

      // Prepare email verification (OTP)
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Store registration data for saving to DB after OTP verification
      setRegistrationData({
        firstName,
        lastName,
        email: formData.email,
        department: formData.department,
        studentId: formData.studentId,
      });

      setVerifyingEmail(formData.email);
      setShowOTP(true);
    } catch (err) {
      setError(err?.errors?.[0]?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = async () => {
    try {
      // Save user to database after OTP verification
      if (registrationData) {
        const response = await fetch(`${API_URL}/auth/save-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `${registrationData.firstName} ${registrationData.lastName}`.trim(),
            email: registrationData.email,
            department: registrationData.department,
            studentId: registrationData.studentId,
          }),
          credentials: 'include',
        });

        if (!response.ok) {
          console.error('Failed to save user to database');
          // Still redirect to dashboard even if DB save fails (user is authenticated)
        }
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving user:', err);
      // Still redirect to dashboard even if there's an error
      navigate('/dashboard');
    }
  };

  if (showOTP) {
    return <OTPVerification email={verifyingEmail} onSuccess={handleOTPSuccess} type="signup" />;
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