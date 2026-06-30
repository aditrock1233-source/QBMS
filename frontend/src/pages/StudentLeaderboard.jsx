import { useEffect, useState } from 'react';
import api from '../utils/api';

const StudentLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/quizzes/leaderboard');
      setLeaderboard(data);
    } catch (err) {
      console.error("Could not load leaderboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Helper to render medals/ranks for top 3
  const renderRankBadge = (index) => {
    if (index === 0) return <span style={{ fontSize: '20px' }}>🥇</span>;
    if (index === 1) return <span style={{ fontSize: '20px' }}>🥈</span>;
    if (index === 2) return <span style={{ fontSize: '20px' }}>🥉</span>;
    return <span style={{ fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 13 }}>#{index + 1}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Page Header */}
      <div className="page-header" style={{ margin: 0 }}>
        <h1>Student Leaderboard</h1>
        <p>Overall rankings across all branches based on average mock quiz performance scores.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>
            🏆 University Rankings
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchLeaderboard} style={{ padding: '6px 12px', fontSize: 12 }}>
            🔄 Refresh Rankings
          </button>
        </div>

        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading leaderboard statistics...</p>
        ) : leaderboard.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13, margin: 0 }}>
            No quiz records logged yet. Be the first to take a quiz and establish the ranks!
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', width: 80, fontSize: 12, color: 'var(--color-text-muted)' }}>Rank</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)' }}>Student Name</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)' }}>Department / Stream</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: 12, color: 'var(--color-text-muted)' }}>Tests Attempted</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: 12, color: 'var(--color-text-muted)', width: 150 }}>Average Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, idx) => {
                  const studentDept = row.student?.department?.name || row.student?.department || 'General';
                  return (
                    <tr key={row._id} style={{ borderBottom: '1px solid var(--color-border)' }} className="table-row-hover">
                      <td style={{ padding: '14px 18px' }}>
                        {renderRankBadge(idx)}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                        {row.student?.name}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {studentDept}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center', fontSize: 13, fontWeight: 500 }}>
                        {row.totalAttempts}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>
                        {Math.round((row.totalCorrect / row.maxQuestions) * 100)}% ({row.totalCorrect} / {row.maxQuestions})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentLeaderboard;
