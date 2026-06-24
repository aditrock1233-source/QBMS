import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
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
    <div>
      <div className="page-header">
        <h1>Question Bank</h1>
        <p>Search, filter, and manage all questions in the repository.</p>
      </div>

      <form className="toolbar" onSubmit={handleSearch}>
        <input
          className="form-control"
          name="search"
          placeholder="Search by title..."
          value={filters.search}
          onChange={handleFilterChange}
          style={{ minWidth: 220 }}
        />
        <select className="form-control" name="difficulty" value={filters.difficulty} onChange={handleFilterChange}>
          <option value="">All difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select className="form-control" name="questionType" value={filters.questionType} onChange={handleFilterChange}>
          <option value="">All types</option>
          <option value="MCQ">MCQ</option>
          <option value="TrueFalse">True / False</option>
          <option value="ShortAnswer">Short Answer</option>
          <option value="LongAnswer">Long Answer</option>
          <option value="CaseStudy">Case Study</option>
          <option value="Programming">Programming</option>
        </select>
        <select className="form-control" name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button type="submit" className="btn btn-secondary">Apply filters</button>
      </form>

      <div className="card">
        {loading ? (
          <p>Loading questions...</p>
        ) : questions.length === 0 ? (
          <div className="empty-state">No questions match these filters yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Type</th>
                  <th>Marks</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q._id}>
                    <td style={{ maxWidth: 360 }}>{q.title}</td>
                    <td>{q.questionType}</td>
                    <td>{q.marks}</td>
                    <td>
                      <span className={`badge badge-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${q.status?.toLowerCase()}`}>{q.status}</span>
                    </td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/questions/${q._id}/history`} className="btn btn-secondary btn-sm">
                        History
                      </Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q._id)}>
                        Delete
                      </button>
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
