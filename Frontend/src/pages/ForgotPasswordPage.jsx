import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authApi } from '../api/services';
import { useToast } from '../context/ToastContext';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: enter email, 2: enter code & new password
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [demoCode, setDemoCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.forgotPassword({ email });
      toast.success(data.message || 'Verification code sent!');
      if (data.resetCode) {
        setDemoCode(data.resetCode);
        setResetCode(data.resetCode); // auto-fill for convenience
      }
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to request reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.resetPassword({
        email,
        resetCode,
        newPassword,
      });
      toast.success(data.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(229, 9, 20, 0.15)',
              color: 'var(--accent)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <KeyRound size={26} />
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {step === 1
              ? "Don't worry! Enter your email to receive a 6-digit verification code."
              : `Enter the 6-digit code sent to ${email} and choose your new password.`}
          </p>
        </div>

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleSendCode}>
            <div className="field">
              <label htmlFor="reset-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-email"
                  type="email"
                  className="input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--block btn--lg"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              <Mail size={18} />
              {loading ? 'Sending Code…' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleResetPassword}>
            {demoCode && (
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: 'var(--radius)',
                  padding: '0.85rem 1rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'var(--text)',
                }}
              >
                <ShieldCheck size={20} color="var(--success)" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                    Verification Code:
                  </span>{' '}
                  <strong style={{ letterSpacing: '0.15em', fontSize: '1.05rem', color: '#fff' }}>
                    {demoCode}
                  </strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Auto-filled below for quick verification
                  </div>
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="reset-code">6-Digit Verification Code</label>
              <input
                id="reset-code"
                type="text"
                className="input"
                placeholder="123456"
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
                style={{ letterSpacing: '0.2em', fontWeight: 700, fontSize: '1.1rem' }}
              />
            </div>

            <div className="field">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                className="input"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                className="input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--block btn--lg"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              <CheckCircle2 size={18} />
              {loading ? 'Resetting Password…' : 'Update Password'}
            </button>

            <button
              type="button"
              className="btn btn--ghost btn--block btn--sm"
              onClick={() => setStep(1)}
              style={{ marginTop: '0.25rem' }}
            >
              Use a different email
            </button>
          </form>
        )}

        <p className="auth-form__footer" style={{ marginTop: '1.5rem' }}>
          <Link
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
