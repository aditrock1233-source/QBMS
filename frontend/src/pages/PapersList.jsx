import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PapersList = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/papers');
        setPapers(data);
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
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Question Papers</h1>
          <p>All generated papers, with their sets and approval status.</p>
        </div>
        {canGenerate && (
          <Link to="/papers/generate" className="btn btn-primary">
            + Generate paper
          </Link>
        )}
      </div>

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : papers.length === 0 ? (
          <div className="empty-state">No question papers generated yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Exam type</th>
                  <th>Total marks</th>
                  <th>Sets</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p) => (
                  <tr key={p._id}>
                    <td>{p.title}</td>
                    <td>{p.subject}</td>
                    <td>{p.examType}</td>
                    <td>{p.totalMarks}</td>
                    <td>{p.sets?.length || 0}</td>
                    <td>
                      <span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status}</span>
                    </td>
                    <td>
                      <Link to={`/papers/${p._id}`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
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
