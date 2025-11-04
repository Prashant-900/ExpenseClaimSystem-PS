import { useState, useEffect } from 'react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';

const OTPVerification = ({ email, onSuccess, type = 'signin' }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!otp || otp.length < 6) {
        setError('Please enter a valid 6-digit code');
        setIsLoading(false);
        return;
      }

      let result;
      if (type === 'signin') {
        result = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: otp,
        });

        if (result.status === 'complete') {
          await setActiveSignIn({ session: result.createdSessionId });
          onSuccess();
        }
      } else {
        // For sign up
        result = await signUp.attemptEmailAddressVerification({
          code: otp,
        });

        if (result.status === 'complete') {
          await setActiveSignUp({ session: result.createdSessionId });
          onSuccess();
        }
      }
    } catch (err) {
      setError(err?.errors?.[0]?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (type === 'signin') {
        await signIn.create({
          identifier: email,
          strategy: 'email_code',
        });
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      }
      setResendTimer(60);
      setOtp('');
    } catch (err) {
      setError(err?.errors?.[0]?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a verification code to<br />
            <span className="font-medium">{email}</span>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <input
              type="text"
              maxLength="6"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="form-input text-center text-2xl tracking-widest"
              required
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
              Check your email for the verification code
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendTimer > 0 || isLoading}
              className="text-gray-600 hover:text-gray-800 text-sm disabled:text-gray-400"
            >
              {resendTimer > 0
                ? `Resend code in ${resendTimer}s`
                : 'Didn\'t receive code? Resend'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
