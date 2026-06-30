import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PaperDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [paper, setPaper] = useState(null);
  const [activeSet, setActiveSet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/papers/${id}`);
        setPaper(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleApprove = async () => {
    try {
      const { data } = await api.put(`/papers/${id}/approve`);
      setPaper({ ...paper, status: data.status });
    } catch (err) {
      alert(err.response?.data?.message || 'Could not approve paper.');
    }
  };

  const handleDownload = async (setName) => {
    setDownloading(true);
    try {
      const response = await api.get(`/papers/${id}/download/${setName}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${paper.subject}-${setName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Could not download PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <p>Loading paper...</p>;
  if (!paper) return <p>Paper not found.</p>;

  const currentSet = paper.sets[activeSet];
  const canApprove = ['hod', 'admin'].includes(user?.role) && paper.status === 'Pending';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{paper.title}</h1>
          <p>
            {paper.subject} · {paper.examType} · {paper.totalMarks} marks · {paper.durationMinutes} minutes
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {paper.isAIGenerated && (
            <span className="badge" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              ✨ AI Generated
            </span>
          )}
          <span className={`badge badge-${paper.status?.toLowerCase()}`}>{paper.status}</span>
        </div>
      </div>

      {canApprove && (
        <div className="card" style={{ marginBottom: 18, borderLeft: paper.isAIGenerated ? '4px solid #a855f7' : undefined }}>
          <p style={{ marginBottom: 10, fontSize: 14 }}>
            This paper is awaiting your approval before it can be used.
            {paper.isAIGenerated && (
              <strong> Approving this paper will also automatically approve and add its AI-generated questions to the active Question Bank.</strong>
            )}
          </p>
          <button className="btn btn-success" onClick={handleApprove}>
            Approve paper
          </button>
        </div>
      )}

      <div className="toolbar">
        {paper.sets.map((s, i) => (
          <button
            key={s.setName}
            className={`btn btn-sm ${i === activeSet ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSet(i)}
          >
            {s.setName}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="section-title" style={{ margin: 0 }}>{currentSet.setName} preview</div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleDownload(currentSet.setName)}
            disabled={downloading}
          >
            {downloading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </div>

        {currentSet.questions.map((q, i) => (
          <div key={q._id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--color-border)' }}>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>
              {i + 1}. {q.title} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>[{q.marks} marks]</span>
            </p>
            {q.options?.length > 0 && (
              <ul style={{ fontSize: 13, color: 'var(--color-text-muted)', paddingLeft: 18 }}>
                {q.options.map((opt, idx) => (
                  <li key={idx}>{opt}</li>
                ))}
              </ul>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span className={`badge badge-${q.difficulty?.toLowerCase()}`}>
                {q.difficulty}
              </span>
              {q.status === 'Pending' && (
                <span className="badge" style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }}>
                  ⏳ Pending review (AI)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaperDetail;
