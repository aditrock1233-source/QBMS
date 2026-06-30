import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      // Always show the same message whether or not the email exists —
      // this avoids leaking which emails are registered.
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset your password</h1>
        <p className="subtitle">We'll send a reset link to your email.</p>

        {error && <div className="error-banner">{error}</div>}

        {sent ? (
          <div className="success-banner">
            If an account exists for <strong>{email}</strong>, a password reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.com"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">← Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
