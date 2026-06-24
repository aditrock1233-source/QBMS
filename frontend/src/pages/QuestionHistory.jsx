import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const QuestionHistory = () => {
  const { id } = useParams();
  const [versions, setVersions] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [versionsRes, questionRes] = await Promise.all([
        api.get(`/questions/${id}/versions`),
        api.get(`/questions/${id}`),
      ]);
      setVersions(versionsRes.data);
      setCurrent(questionRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRestore = async (versionId) => {
    if (!window.confirm('Restore the question to this older version? Current state will be saved as a new version first.')) return;
    try {
      await api.put(`/questions/${id}/restore/${versionId}`);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not restore version.');
    }
  };

  if (loading) return <p>Loading version history...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Version History</h1>
        <p><Link to="/questions">← Back to Question Bank</Link></p>
      </div>

      {current && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-title">Current version</div>
          <p style={{ fontWeight: 600 }}>{current.title}</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {current.difficulty} · {current.marks} marks · {current.questionType}
          </p>
        </div>
      )}

      <div className="card">
        <div className="section-title">Edit history ({versions.length} version{versions.length !== 1 ? 's' : ''})</div>

        {versions.length === 0 ? (
          <div className="empty-state">This question hasn't been edited yet — no version history.</div>
        ) : (
          versions.map((v) => (
            <div key={v._id} className="version-item">
              <div className="version-item-header">
                <strong>Version {v.versionNumber}</strong>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  {new Date(v.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: 14, marginBottom: 6 }}>{v.snapshot.title}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Edited by {v.editedBy?.name || 'Unknown'} · {v.snapshot.difficulty} · {v.snapshot.marks} marks
              </p>
              <button className="btn btn-secondary btn-sm" onClick={() => handleRestore(v._id)}>
                Restore this version
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionHistory;
