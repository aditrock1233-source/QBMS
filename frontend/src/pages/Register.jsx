import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const [searchParams] = useSearchParams();
  const queryRole = searchParams.get('role') || 'faculty';

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: queryRole === 'student' ? 'student' : 'faculty',
    department: '',
    designation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const isStudent = queryRole === 'student';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      setGeneratedPassword(res.data.generatedPassword);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    navigate(`/login?role=${isStudent ? 'student' : 'faculty'}&registered=true`);
  };

  // Show the one-time password screen after successful registration
  if (generatedPassword) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: 440 }}>
          <h1>✅ Account created!</h1>
          <p className="subtitle">
            Save this password now — it will only be shown this one time.
          </p>

          <div
            style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              padding: 15,
              margin: '20px 0',
            }}
          >
            <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>
              Email
            </div>
            <div style={{ marginBottom: 14, color: '#4b5563' }}>{form.email}</div>

            <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>
              Password
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <code
                style={{
                  fontFamily: 'monospace',
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#4f46e5',
                  background: '#eef2ff',
                  padding: '6px 10px',
                  borderRadius: 4,
                }}
              >
                {generatedPassword}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="btn"
                style={{ padding: '6px 12px', fontSize: 13 }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>
            Important: change your password from your profile settings after logging in.
          </p>

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleContinue}
          >
            Continue to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <h1>{isStudent ? '🎓 Student Registration' : '📝 Staff Registration'}</h1>
        <p className="subtitle">
          {isStudent
            ? 'Create a student account to practice mock quizzes and check ranks.'
            : 'Join QBMS as faculty, HOD, exam cell, or admin.'}
        </p>

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

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select className="form-control" name="role" value={form.role} onChange={handleChange} disabled={isStudent}>
                {isStudent ? (
                  <option value="student">Student (Terminal Access)</option>
                ) : (
                  <>
                    <option value="faculty">Faculty</option>
                    <option value="hod">HOD / Moderator</option>
                    <option value="examcell">Exam Cell</option>
                    <option value="admin">Admin</option>
                  </>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Department / Stream</label>
              <input
                className="form-control"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder={isStudent ? "e.g. Pharmacy, Computer Science" : "e.g. CSE, IT, PHARM"}
              />
            </div>
          </div>
          {!isStudent && (
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
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : isStudent ? 'Create Student Account' : 'Create Staff Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to={isStudent ? '/login?role=student' : '/login?role=faculty'}>Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;