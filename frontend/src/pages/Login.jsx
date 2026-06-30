import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'faculty';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = role === 'student';

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{isStudent ? '🎓 Student Terminal Login' : '🔐 Staff Portal Login'}</h1>
        <p className="subtitle">
          {isStudent
            ? 'Log in to attempt mock quizzes, review tutor grades, and track rankings.'
            : 'Log in to manage questions, moderate approvals, and generate papers.'}
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.com"
              required
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 13 }}>Forgot password?</Link>
            </div>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : isStudent ? 'Enter Student Terminal' : 'Enter Staff Portal'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to={isStudent ? '/register?role=student' : '/register?role=faculty'}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
