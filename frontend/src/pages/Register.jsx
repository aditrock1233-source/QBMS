import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'faculty',
    department: '',
    designation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <h1>Create your account</h1>
        <p className="subtitle">Join QBMS as faculty, HOD, exam cell, or admin.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Anand Singh"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@college.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select className="form-control" name="role" value={form.role} onChange={handleChange}>
                <option value="faculty">Faculty</option>
                <option value="hod">HOD / Moderator</option>
                <option value="examcell">Exam Cell</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                className="form-control"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Computer Science"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Designation</label>
            <input
              className="form-control"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="Assistant Professor"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
