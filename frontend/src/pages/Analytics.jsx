import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import api from '../utils/api';

const DIFFICULTY_COLORS = { Easy: '#16a34a', Medium: '#d97706', Hard: '#dc2626' };
const TYPE_COLOR = '#4338ca';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/questions/stats');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (!stats) return <p>No data available.</p>;

  const difficultyData = (stats.byDifficulty || []).map((d) => ({ name: d._id, value: d.count }));
  const typeData = (stats.byType || []).map((t) => ({ name: t._id, value: t.count }));
  const bloomData = (stats.byBloomLevel || []).map((b) => ({ name: b._id, value: b.count }));
  const subjectData = (stats.bySubject || []).map((s) => ({ name: s._id, value: s.count }));

  return (
    <div>
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Visual breakdown of your question bank and usage patterns.</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="card stat-card">
          <span className="stat-label">Total Questions</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Approved</span>
          <span className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.approved}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value" style={{ color: 'var(--color-warning)' }}>{stats.pending}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Rejected</span>
          <span className="stat-value" style={{ color: 'var(--color-danger)' }}>{stats.rejected}</span>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="section-title">Questions by Difficulty</div>
          {difficultyData.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={difficultyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {difficultyData.map((entry, i) => (
                    <Cell key={i} fill={DIFFICULTY_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="section-title">Questions by Type</div>
          {typeData.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill={TYPE_COLOR} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="section-title">Bloom's Taxonomy Distribution</div>
          {bloomData.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={bloomData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="section-title">Top Subjects</div>
          {subjectData.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No data yet.</p>
          ) : (
            subjectData.map((s) => (
              <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, borderBottom: '1px solid var(--color-border)' }}>
                <span>{s.name}</span>
                <span style={{ fontWeight: 600 }}>{s.value}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-title">Most Used Questions (in generated papers)</div>
        {(!stats.mostUsed || stats.mostUsed.length === 0) ? (
          <div className="empty-state">No papers generated yet — usage data will appear here once you do.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Subject</th>
                  <th>Times used</th>
                </tr>
              </thead>
              <tbody>
                {stats.mostUsed.map((q) => (
                  <tr key={q._id}>
                    <td>{q.title}</td>
                    <td>{q.subject}</td>
                    <td>{q.usageCount}</td>
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

export default Analytics;
