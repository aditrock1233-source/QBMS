import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PapersList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, approved: 0, pending: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/papers');
        setPapers(data);

        const tempSummary = { total: data.length, approved: 0, pending: 0 };
        data.forEach(p => {
          if (p.status === 'Approved') tempSummary.approved++;
          else if (p.status === 'Pending') tempSummary.pending++;
        });
        setSummary(tempSummary);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const canGenerate = ['faculty', 'examcell', 'admin'].includes(user?.role);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Question Papers</h1>
          <p>All generated papers, with their sets and approval status.</p>
        </div>
        {canGenerate && (
          <Link to="/papers/generate" className="btn btn-primary">
            🖨️ Generate Paper
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-3">
        <div className="card stat-card" style={{ padding: '14px 20px', borderLeft: '4px solid #6366f1' }}>
          <span className="stat-label" style={{ fontSize: 11 }}>🗂️ Total Papers</span>
          <span className="stat-value" style={{ fontSize: 20 }}>{summary.total}</span>
        </div>
        <div className="card stat-card" style={{ padding: '14px 20px', borderLeft: '4px solid var(--color-success)' }}>
          <span className="stat-label" style={{ fontSize: 11 }}>✅ Approved Papers</span>
          <span className="stat-value" style={{ color: 'var(--color-success)', fontSize: 20 }}>{summary.approved}</span>
        </div>
        <div className="card stat-card" style={{ padding: '14px 20px', borderLeft: '4px solid var(--color-warning)' }}>
          <span className="stat-label" style={{ fontSize: 11 }}>⏳ Pending Approval</span>
          <span className="stat-value" style={{ color: 'var(--color-warning)', fontSize: 20 }}>{summary.pending}</span>
        </div>
      </div>

      {/* Data List Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading papers...</p>
        ) : papers.length === 0 ? (
          <div className="empty-state" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No question papers generated yet. Get started by clicking "Generate Paper".
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted)' }}>Title</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted)' }}>Subject</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted)' }}>Exam Type</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted)' }}>Total Marks</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted)' }}>Sets</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted)' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: 13, color: 'var(--color-text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--color-border)' }} className="table-row-hover">
                    <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
                      {p.title}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--color-text-muted)' }}>{p.subject}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--color-text-muted)' }}>{p.examType}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{p.totalMarks}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--color-text-muted)' }}>
                      <span style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                        {p.sets?.length || 0} Sets
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {p.isAIGenerated && (
                          <span className="badge" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', fontSize: 11 }}>
                            ✨ AI
                          </span>
                        )}
                        <span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/papers/${p._id}`)} style={{ padding: '6px 14px', fontSize: 12 }}>
                        View details
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

export default PapersList;
