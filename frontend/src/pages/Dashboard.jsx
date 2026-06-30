import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = {
  Easy: '#16a34a',
  Medium: '#d97706',
  Hard: '#dc2626'
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [approvalSummary, setApprovalSummary] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentStats, setStudentStats] = useState({ totalQuizzes: 0, avgScore: 0, attempts: [] });

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role === 'student') {
          const { data } = await api.get('/quizzes/stats');
          setStudentStats(data);
          setLoading(false);
          return;
        }

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

  const renderStudentDashboard = () => {
    const lastAttempt = studentStats.attempts[0];
    const avgScore = studentStats.avgScore;
    const totalQuizzes = studentStats.totalQuizzes;

    // AI suggestions calculation
    let suggestionText = '';
    let suggestionTitle = 'Recommended Learning Path';
    if (totalQuizzes === 0) {
      suggestionTitle = 'Get Started with Mock Quizzes 🚀';
      suggestionText = 'Select "Mock Quizzes" from the sidebar to take your first evaluation quiz! Once finished, the AI engine will analyze your weaknesses and suggest targeted subjects and difficulty streams.';
    } else if (avgScore >= 80) {
      suggestionTitle = 'Excellent Performance! 🏆';
      suggestionText = `Outstanding! Your average score is ${avgScore}%. You have mastered the core topics. To push your boundaries, focus on "Hard" difficulty mock tests and try long-answer architectural and coding questions.`;
    } else if (avgScore >= 50) {
      suggestionTitle = 'Keep Practicing & Refining 📈';
      suggestionText = `You are doing well with an average score of ${avgScore}%. You have solid baseline understanding but need refinement. Focus on reviewing your incorrect answers, and study subjects where you scored lowest (like ${lastAttempt?.subject || 'general topics'}).`;
    } else {
      suggestionTitle = 'Targeted Concept Review Required 📚';
      suggestionText = `Your current average score is ${avgScore}%. We recommend starting with "Easy" difficulty quizzes and focusing strictly on a single topic prompt at a time. Review correct answers thoroughly in the logs.`;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          color: '#ffffff',
          padding: '28px 32px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)' }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '14px' }}>
              Student Terminal: Attempt mock tests, analyze weaknesses, and check leaderboard standings.
            </p>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(4px)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 600,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            🎓 Department: {user?.department?.name || user?.department || 'General'}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-4">
          <div className="card stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <span className="stat-label">📝 Quizzes Attempted</span>
            <span className="stat-value">{totalQuizzes}</span>
          </div>
          <div className="card stat-card" style={{ borderLeft: '4px solid #10b981' }}>
            <span className="stat-label">📊 Average Score</span>
            <span className="stat-value" style={{ color: '#10b981' }}>{avgScore}%</span>
          </div>
          <div className="card stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <span className="stat-label">⭐ Last Test Score</span>
            <span className="stat-value" style={{ color: '#f59e0b' }}>
              {lastAttempt ? `${Math.round((lastAttempt.score / lastAttempt.totalQuestions) * 100)}%` : '—'}
            </span>
          </div>
          <div className="card stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <span className="stat-label">🎯 Last Subject</span>
            <span className="stat-value" style={{ fontSize: '16px', marginTop: '10px' }}>
              {lastAttempt?.subject || 'No attempts yet'}
            </span>
          </div>
        </div>

        {/* Interactive Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, alignItems: 'start' }}>
          
          {/* Recent Quiz Attempts Card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>
                ⏱️ Recent Quiz Attempts
              </div>
            </div>
            {studentStats.attempts.length === 0 ? (
              <p style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13, margin: 0 }}>
                No mock quizzes taken yet. Get started with quizzes to see your records!
              </p>
            ) : (
              <div className="table-wrap">
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)' }}>Subject</th>
                      <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)' }}>Difficulty</th>
                      <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)' }}>Score</th>
                      <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: 12, color: 'var(--color-text-muted)' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentStats.attempts.map((attempt) => (
                      <tr key={attempt._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 600 }}>{attempt.subject}</td>
                        <td style={{ padding: '12px 18px' }}>
                          <span className={`badge badge-${attempt.difficulty?.toLowerCase()}`}>{attempt.difficulty}</span>
                        </td>
                        <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
                          {attempt.score} / {attempt.totalQuestions} ({Math.round((attempt.score / attempt.totalQuestions) * 100)}%)
                        </td>
                        <td style={{ padding: '12px 18px', textAlign: 'right', fontSize: 12, color: 'var(--color-text-muted)' }}>
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Performance Analysis & AI Suggestions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* AI Advisor Panel */}
            <div className="card" style={{ borderLeft: '4px solid #a855f7', background: 'linear-gradient(to right, var(--color-surface), var(--color-primary-light))', padding: '18px 20px' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✨</span> AI Study Coach Recommendations
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-primary-dark)', marginBottom: 6 }}>
                {suggestionTitle}
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.4, margin: 0 }}>
                {suggestionText}
              </p>
            </div>

            {/* Quick Actions Panel */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', marginBottom: 12 }}>
                🚀 Quick Actions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary" onClick={() => navigate('/student/quizzes')} style={{ textAlign: 'left', width: '100%', padding: '10px 14px' }}>
                  🎯 Start a New Mock Quiz
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/student/leaderboard')} style={{ textAlign: 'left', width: '100%', padding: '10px 14px' }}>
                  🏆 View Overall Leaderboard
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  };

  if (loading) return <p style={{ padding: 40, textAlign: 'center', fontSize: 16, color: 'var(--color-text-muted)' }}>Loading dashboard...</p>;

  if (user?.role === 'student') {
    return renderStudentDashboard();
  }

  // Prepare Chart Data
  const difficultyData = stats?.byDifficulty?.map((item) => ({
    name: item._id,
    value: item.count
  })) || [];

  const subjectData = stats?.bySubject?.map((item) => ({
    name: item._id,
    questions: item.count
  })) || [];

  const bloomColors = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Premium Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        color: '#ffffff',
        padding: '28px 32px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '14px' }}>
            Question Bank Management System Dashboard: Check question bank statistics, review papers, and invoke AI generation.
          </p>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(4px)',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          📅 {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Main Grid: 4 Summary Widgets */}
      <div className="grid grid-4">
        {/* Total Questions */}
        <div className="card stat-card" style={{ borderLeft: '4px solid #3b82f6', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => navigate('/questions')}>
          <span className="stat-label">📁 Total Questions</span>
          <span className="stat-value">{stats?.total ?? 0}</span>
        </div>
        {/* Approved */}
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--color-success)', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => navigate('/questions?status=Approved')}>
          <span className="stat-label">✅ Approved Pool</span>
          <span className="stat-value" style={{ color: 'var(--color-success)' }}>{stats?.approved ?? 0}</span>
        </div>
        {/* Pending */}
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--color-warning)', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => navigate(user?.role === 'faculty' ? '/questions?status=Pending' : '/approvals')}>
          <span className="stat-label">⏳ Pending Review</span>
          <span className="stat-value" style={{ color: 'var(--color-warning)' }}>{stats?.pending ?? 0}</span>
        </div>
        {/* Rejected */}
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--color-danger)', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => navigate('/questions?status=Rejected')}>
          <span className="stat-label">❌ Rejected Drafts</span>
          <span className="stat-value" style={{ color: 'var(--color-danger)' }}>{stats?.rejected ?? 0}</span>
        </div>
      </div>

      {/* Two-Column Responsive Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }} className="dashboard-layout">
        {/* Left Side: Analytics Charts and Recent Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Subject Question Density */}
            <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
              <div className="section-title" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Question Density by Subject</div>
              <div style={{ flex: 1, minHeight: '220px' }}>
                {subjectData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                      <Bar dataKey="questions" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>No subject data.</div>
                )}
              </div>
            </div>

            {/* Difficulty Mix Pie Chart */}
            <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
              <div className="section-title" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Difficulty Distribution</div>
              <div style={{ flex: 1, minHeight: '220px', display: 'flex', alignItems: 'center' }}>
                {difficultyData.length ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ flex: 1, maxHeight: '180px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={difficultyData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {difficultyData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6366f1'} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 14, fontSize: 12, fontWeight: 500, marginTop: 4 }}>
                      {difficultyData.map((entry) => (
                        <span key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[entry.name] }} />
                          {entry.name} ({entry.value})
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>No difficulty data.</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Question Papers Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="section-title" style={{ margin: 0 }}>Recent Question Papers</div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/papers')}>View all</button>
            </div>
            {papers.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {papers.map((p) => (
                  <div
                    key={p._id}
                    className="card-row"
                    onClick={() => navigate(`/papers/${p._id}`)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: 'var(--color-surface)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{p.title}</span>
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 10 }}>({p.subject})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {p.isAIGenerated && (
                        <span className="badge" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', fontSize: 11 }}>
                          ✨ AI
                        </span>
                      )}
                      <span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No papers generated yet.</p>
            )}
          </div>

          {/* Most Reused Questions Card */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 14 }}>Most Reused Questions</div>
            {stats?.mostUsed?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.mostUsed.map((q, idx) => (
                  <div key={q._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid var(--color-border)', fontSize: 13, alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '350px' }}>
                      {idx + 1}. {q.title}
                    </span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'var(--color-primary-light)', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}>
                      Used {q.usageCount} times
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No analytical metrics on question reuse yet.</p>
            )}
          </div>

        </div>

        {/* Right Side: Quick Action Widgets & Sidebar Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Actions Panel */}
          <div className="card" style={{ background: 'linear-gradient(to bottom, var(--color-surface), var(--color-bg))' }}>
            <div className="section-title" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['faculty', 'admin'].includes(user?.role) && (
                <button className="btn btn-primary" onClick={() => navigate('/questions/add')} style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}>
                  ➕ Create Question
                </button>
              )}
              {['faculty', 'examcell', 'admin'].includes(user?.role) && (
                <button className="btn btn-secondary" onClick={() => navigate('/papers/generate')} style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}>
                  🖨️ Generate Paper
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => navigate('/questions')} style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}>
                🔍 Search Question Bank
              </button>
              {['hod', 'admin'].includes(user?.role) && (
                <button className="btn btn-secondary" onClick={() => navigate('/approvals')} style={{ width: '100%', justifyContent: 'flex-start', gap: 8, borderLeft: '4px solid var(--color-warning)' }}>
                  ⏳ View Pending Approvals
                </button>
              )}
            </div>
          </div>

          {/* Action Required: Approvals Alerts */}
          {approvalSummary && approvalSummary.pending > 0 && (
            <div className="card" style={{ borderLeft: '4px solid var(--color-warning)', background: 'var(--color-warning-light)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                ⚠️ Review Action Required
              </div>
              <p style={{ color: 'var(--color-text)', fontSize: 13, margin: '0 0 10px' }}>
                You have <strong>{approvalSummary.pending}</strong> question(s) waiting for review and approval before they can be added to standard tests.
              </p>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/approvals')} style={{ color: 'var(--color-warning)', borderColor: 'var(--color-warning)' }}>
                Go to Approvals
              </button>
            </div>
          )}

          {/* Bloom's Level Taxonomy Progress Metrics */}
          <div className="card">
            <div className="section-title" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Bloom's Taxonomy Coverage</div>
            {stats?.byBloomLevel?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.byBloomLevel.map((bloom, index) => {
                  const percent = Math.round((bloom.count / (stats.total || 1)) * 100);
                  return (
                    <div key={bloom._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        <span>{bloom._id}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>{bloom.count} ({percent}%)</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          background: bloomColors[index % bloomColors.length],
                          width: `${percent}%`,
                          borderRadius: 3
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '10px 0' }}>No Bloom level metrics available.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
