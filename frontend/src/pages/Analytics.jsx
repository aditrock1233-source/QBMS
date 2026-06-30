import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import api from '../utils/api';

const DIFFICULTY_COLORS = { Easy: '#16a34a', Medium: '#d97706', Hard: '#dc2626' };
const TYPE_COLOR = '#6366f1';
const bloomColors = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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

  if (loading) return <p style={{ padding: 40, textAlign: 'center', fontSize: 16, color: 'var(--color-text-muted)' }}>Loading analytics...</p>;
  if (!stats) return <p style={{ padding: 40, textAlign: 'center', fontSize: 16, color: 'var(--color-text-muted)' }}>No statistics data available.</p>;

  const difficultyData = (stats.byDifficulty || []).map((d) => ({ name: d._id, value: d.count }));
  const typeData = (stats.byType || []).map((t) => ({ name: t._id, value: t.count }));
  const bloomData = (stats.byBloomLevel || []).map((b) => ({ name: b._id, value: b.count }));
  const subjectData = (stats.bySubject || []).map((s) => ({ name: s._id, value: s.count }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Header */}
      <div className="page-header" style={{ margin: 0 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Analytics</h1>
        <p>Visual breakdown of your question bank density, difficulty mixing, and usage patterns.</p>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-4">
        <div className="card stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <span className="stat-label">📁 Total Questions</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <span className="stat-label">✅ Approved Pool</span>
          <span className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.approved}</span>
        </div>
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <span className="stat-label">⏳ Pending Review</span>
          <span className="stat-value" style={{ color: 'var(--color-warning)' }}>{stats.pending}</span>
        </div>
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <span className="stat-label">❌ Rejected Drafts</span>
          <span className="stat-value" style={{ color: 'var(--color-danger)' }}>{stats.rejected}</span>
        </div>
      </div>

      {/* Charts Grid Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Difficulty Mix Pie Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 340 }}>
          <div className="section-title" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Questions by Difficulty</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {difficultyData.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No data yet.</p>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ flex: 1, maxHeight: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={difficultyData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                        {difficultyData.map((entry, i) => (
                          <Cell key={i} fill={DIFFICULTY_COLORS[entry.name] || '#999'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, fontSize: 12, fontWeight: 600, marginTop: 10 }}>
                  {difficultyData.map((entry) => (
                    <span key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: DIFFICULTY_COLORS[entry.name] }} />
                      {entry.name} ({entry.value})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Questions by Type Bar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 340 }}>
          <div className="section-title" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Questions by Type</div>
          <div style={{ flex: 1 }}>
            {typeData.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 80 }}>No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={11} allowDecimals={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill={TYPE_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Bloom's Taxonomy Bar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 340 }}>
          <div className="section-title" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Bloom's Taxonomy Level Distribution</div>
          <div style={{ flex: 1 }}>
            {bloomData.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 80 }}>No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={bloomData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={11} allowDecimals={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Subjects Progress Metrics */}
        <div className="card" style={{ minHeight: 340 }}>
          <div className="section-title" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Top Subjects Density</div>
          {subjectData.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', paddingTop: 80 }}>No data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
              {subjectData.map((s, index) => {
                const percent = Math.min(100, Math.round((s.value / (stats.total || 1)) * 100));
                return (
                  <div key={s.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      <span style={{ color: 'var(--color-text)' }}>{s.name}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{s.value} questions ({percent}%)</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        background: bloomColors[index % bloomColors.length],
                        width: `${percent}%`,
                        borderRadius: 4
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Reused Questions Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="section-title" style={{ padding: '18px 20px 0', margin: 0 }}>Most Used Questions (in generated papers)</div>
        {(!stats.mostUsed || stats.mostUsed.length === 0) ? (
          <div className="empty-state" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>No papers generated yet — usage data will appear here once you do.</div>
        ) : (
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted)' }}>Question Statement</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, color: 'var(--color-text-muted)' }}>Subject</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: 13, color: 'var(--color-text-muted)' }}>Times Used</th>
                </tr>
              </thead>
              <tbody>
                {stats.mostUsed.map((q, idx) => (
                  <tr key={q._id} style={{ borderBottom: '1px solid var(--color-border)' }} className="table-row-hover">
                    <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
                      {idx + 1}. {q.title}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--color-text-muted)' }}>{q.subject}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
                      {q.usageCount} times
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

export default Analytics;
