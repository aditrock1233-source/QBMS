import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const QuestionBank = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, MCQ: 0, Programming: 0, ShortAnswer: 0 });
  const [filters, setFilters] = useState({ search: '', difficulty: '', questionType: '', status: '' });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const { data } = await api.get('/questions', { params });
      setQuestions(data.questions);

      // Compute simple stats for the summary bar
      const tempStats = { total: data.total || data.questions.length, MCQ: 0, Programming: 0, ShortAnswer: 0 };
      data.questions.forEach(q => {
        if (q.questionType === 'MCQ') tempStats.MCQ++;
        else if (q.questionType === 'Programming') tempStats.Programming++;
        else if (q.questionType === 'ShortAnswer') tempStats.ShortAnswer++;
      });
      setStats(tempStats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleReset = () => {
    setFilters({ search: '', difficulty: '', questionType: '', status: '' });
    // Trigger immediate fetch with cleared filters
    setLoading(true);
    api.get('/questions').then(({ data }) => {
      setQuestions(data.questions);
      setLoading(false);
    }).catch(console.error);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question permanently?')) return;
    try {
      await api.delete(`/questions/${id}`);
      setQuestions(questions.filter((q) => q._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete question.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Question Bank</h1>
          <p>Search, filter, and manage all questions in the repository.</p>
        </div>
        {['faculty', 'admin'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => navigate('/questions/add')}>
            ➕ Add Question
          </button>
        )}
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-4">
        <div className="card stat-card" style={{ padding: '14px 20px', borderLeft: '4px solid #6366f1' }}>
          <span className="stat-label" style={{ fontSize: 11 }}>📁 Questions Shown</span>
          <span className="stat-value" style={{ fontSize: 20 }}>{questions.length}</span>
        </div>
        <div className="card stat-card" style={{ padding: '14px 20px', borderLeft: '4px solid #10b981' }}>
          <span className="stat-label" style={{ fontSize: 11 }}>📝 MCQ Type</span>
          <span className="stat-value" style={{ fontSize: 20 }}>{stats.MCQ}</span>
        </div>
        <div className="card stat-card" style={{ padding: '14px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <span className="stat-label" style={{ fontSize: 11 }}>💻 Programming</span>
          <span className="stat-value" style={{ fontSize: 20 }}>{stats.Programming}</span>
        </div>
        <div className="card stat-card" style={{ padding: '14px 20px', borderLeft: '4px solid #f59e0b' }}>
          <span className="stat-label" style={{ fontSize: 11 }}>💬 Short Answer</span>
          <span className="stat-value" style={{ fontSize: 20 }}>{stats.ShortAnswer}</span>
        </div>
      </div>

      {/* Premium Filter Toolbar Panel */}
      <div className="card" style={{ padding: 18 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔍</span> Filter Control Panel
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <input
                className="form-control"
                name="search"
                placeholder="Search question title..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <select className="form-control" name="difficulty" value={filters.difficulty} onChange={handleFilterChange}>
                <option value="">All difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <select className="form-control" name="questionType" value={filters.questionType} onChange={handleFilterChange}>
                <option value="">All types</option>
                <option value="MCQ">MCQ</option>
                <option value="TrueFalse">True / False</option>
                <option value="ShortAnswer">Short Answer</option>
                <option value="LongAnswer">Long Answer</option>
                <option value="CaseStudy">Case Study</option>
                <option value="Programming">Programming</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <select className="form-control" name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset</button>
            <button type="submit" className="btn btn-primary">Apply Filters</button>
          </div>
        </form>
      </div>

      {/* Questions Data List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading questions...</p>
        ) : questions.length === 0 ? (
          <div className="empty-state" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>No questions match these filters yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted)' }}>Question Statement</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted)' }}>Type</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted)' }}>Marks</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted)' }}>Difficulty</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted)' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: 13, color: 'var(--color-text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q._id} style={{ borderBottom: '1px solid var(--color-border)' }} className="table-row-hover">
                    <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 500, color: 'var(--color-text)', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.title}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--color-text-muted)' }}>
                      {q.questionType}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                      {q.marks}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge badge-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge badge-${q.status?.toLowerCase()}`}>{q.status}</span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Link to={`/questions/${q._id}/history`} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: 12 }}>
                          History
                        </Link>
                        {['admin', 'faculty'].includes(user?.role) && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q._id)} style={{ padding: '6px 12px', fontSize: 12 }}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;
