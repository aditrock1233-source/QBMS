import { useEffect, useState } from 'react';
import api from '../utils/api';

const Approvals = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/approvals/pending');
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/approvals/${id}/approve`);
      setQuestions(questions.filter((q) => q._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not approve question.');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/approvals/${id}/reject`, { reason });
      setQuestions(questions.filter((q) => q._id !== id));
      setRejectingId(null);
      setReason('');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not reject question.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Pending Approvals</h1>
        <p>Review questions submitted by faculty before they enter the active question bank.</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : questions.length === 0 ? (
        <div className="card">
          <div className="empty-state">All caught up — no questions waiting for review.</div>
        </div>
      ) : (
        <div className="grid grid-2">
          {questions.map((q) => (
            <div className="card" key={q._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className={`badge badge-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{q.questionType}</span>
              </div>

              <p style={{ fontWeight: 600, marginBottom: 8 }}>{q.title}</p>

              {q.options?.length > 0 && (
                <ul style={{ fontSize: 13, color: 'var(--color-text-muted)', paddingLeft: 18, marginBottom: 8 }}>
                  {q.options.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
              )}

              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                Marks: {q.marks} · Bloom's level: {q.bloomLevel}
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 14 }}>
                Submitted by: {q.createdBy?.name || 'Unknown'}
              </p>

              {rejectingId === q._id ? (
                <div>
                  <textarea
                    className="form-control"
                    placeholder="Reason for rejection..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(q._id)}>
                      Confirm reject
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setRejectingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-success btn-sm" onClick={() => handleApprove(q._id)}>
                    Approve
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setRejectingId(q._id)}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Approvals;
