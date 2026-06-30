import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Set a new password</h1>

        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">Password updated! Redirecting to login...</div>}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Confirm new password</label>
              <input
                type="password"
                className="form-control"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Updating...' : 'Update password'}
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

export default ResetPassword;
