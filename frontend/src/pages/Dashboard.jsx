import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [approvalSummary, setApprovalSummary] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, papersRes] = await Promise.all([
          api.get('/questions/stats'),
          api.get('/papers'),
        ]);
        setStats(statsRes.data);
        setPapers(papersRes.data.slice(0, 5));

        if (user?.role === 'hod' || user?.role === 'admin') {
          const summaryRes = await api.get('/approvals/summary');
          setApprovalSummary(summaryRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p>Here's what's happening in your question bank.</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="card stat-card">
          <span className="stat-label">Total Questions</span>
          <span className="stat-value">{stats?.total ?? 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Approved</span>
          <span className="stat-value" style={{ color: 'var(--color-success)' }}>
            {stats?.approved ?? 0}
          </span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Pending Review</span>
          <span className="stat-value" style={{ color: 'var(--color-warning)' }}>
            {stats?.pending ?? 0}
          </span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Rejected</span>
          <span className="stat-value" style={{ color: 'var(--color-danger)' }}>
            {stats?.rejected ?? 0}
          </span>
        </div>
      </div>

      {approvalSummary && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">Approval Workflow</div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            You have <strong>{approvalSummary.pending}</strong> question(s) waiting for your review.
          </p>
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">Questions by Difficulty</div>
          {stats?.byDifficulty?.length ? (
            stats.byDifficulty.map((d) => (
              <div
                key={d._id}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}
              >
                <span className={`badge badge-${d._id?.toLowerCase()}`}>{d._id}</span>
                <span>{d.count} questions</span>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No data yet.</p>
          )}
        </div>

        <div className="card">
          <div className="section-title">Recent Question Papers</div>
          {papers.length ? (
            papers.map((p) => (
              <div
                key={p._id}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}
              >
                <span>{p.title}</span>
                <span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status}</span>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No papers generated yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
