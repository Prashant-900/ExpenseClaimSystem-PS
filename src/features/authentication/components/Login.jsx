import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn } from '@clerk/clerk-react';
import OTPVerification from './OTPVerification';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState('');
  const navigate = useNavigate();
  const { signIn } = useSignIn();

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

      // Create sign-in with email code strategy (OTP)
      await signIn.create({
        identifier: formData.email,
        password: formData.password,
        strategy: 'email_code',
      });

      setVerifyingEmail(formData.email);
      setShowOTP(true);
    } catch (err) {
      setError(err?.errors?.[0]?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = () => {
    navigate('/dashboard');
  };

  if (showOTP) {
    return <OTPVerification email={verifyingEmail} onSuccess={handleOTPSuccess} type="signin" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
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
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/register" className="text-gray-600 hover:text-gray-800">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;