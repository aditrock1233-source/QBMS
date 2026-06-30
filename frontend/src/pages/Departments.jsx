import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Departments = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [populating, setPopulating] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/departments');
      setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: '', code: '', description: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, form);
        setSuccess('Department updated successfully.');
      } else {
        await api.post('/departments', form);
        setSuccess('Department created successfully.');
      }
      resetForm();
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save department.');
    }
  };

  const handleEdit = (dept) => {
    setForm({ name: dept.name, code: dept.code || '', description: dept.description || '' });
    setEditingId(dept._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? This cannot be undone.')) return;
    try {
      await api.delete(`/departments/${id}`);
      setDepartments(departments.filter((d) => d._id !== id));
      setSuccess('Department deleted successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete department.');
    }
  };

  // Prepopulate standard university departments template helper
  const handlePopulateTemplate = async () => {
    setPopulating(true);
    setError('');
    setSuccess('');
    const templates = [
      { name: "Pharmacy & Pharmacology", code: "PHARM", description: "Studies relating to pharmaceutical science, drug analysis, clinical trials, dosages, and drug structures." },
      { name: "Business Administration", code: "MBA", description: "Focuses on strategic management, business operations, SWOT analysis, and leadership models." },
      { name: "Commerce & Financial Studies", code: "COMM", description: "Covers financial accounting, balance sheets, corporate taxation, and market analysis." },
      { name: "Computer Science & Engineering", code: "CSE", description: "Information technology, database systems, software engineering, and modern stack development." },
      { name: "Mechanical Engineering", code: "ME", description: "Deals with industrial manufacturing, thermodynamics, mechanics, and design methodologies." },
      { name: "Electrical & Electronics", code: "EEE", description: "Covers power distribution, electronics design, microcontrollers, and signal processing." },
      { name: "Civil Engineering", code: "CE", description: "Focuses on structural engineering, geotechnics, urban transport systems, and architecture." }
    ];

    try {
      let createdCount = 0;
      for (const dept of templates) {
        // Only create if it doesn't already exist in the list
        if (!departments.some(d => d.name.toLowerCase() === dept.name.toLowerCase() || (d.code && d.code.toUpperCase() === dept.code))) {
          await api.post('/departments', dept);
          createdCount++;
        }
      }
      setSuccess(`Successfully populated ${createdCount} standard university departments!`);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Error populating department template.');
    } finally {
      setPopulating(false);
    }
  };

  // Helper to map color borders based on department code
  const getDeptColor = (code) => {
    const c = (code || '').toUpperCase();
    if (c === 'PHARM') return '#f59e0b'; // Amber
    if (c === 'MBA' || c === 'COMM') return '#3b82f6'; // Blue
    if (c === 'CSE' || c === 'IT') return '#8b5cf6'; // Purple
    if (c === 'ME') return '#ef4444'; // Red
    if (c === 'EEE') return '#10b981'; // Green
    return '#6b7280'; // Slate
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Departments</h1>
          <p>Configure the university's academic branches, streams, and code identifiers.</p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-secondary"
            onClick={handlePopulateTemplate}
            disabled={populating}
            style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {populating ? '⚡ Populating...' : '⚡ Load University Templates'}
          </button>
        )}
      </div>

      {/* Grid Layout: Form on Left (if admin), beautiful card list on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '350px 1fr' : '1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Admin input panel */}
        {isAdmin && (
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
              {editingId ? '✏️ Edit Department' : '➕ Add Department'}
            </div>
            {error && <div className="error-banner" style={{ marginBottom: 14 }}>{error}</div>}
            {success && <div className="success-banner" style={{ marginBottom: 14 }}>{success}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Department Name</label>
                <input
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Pharmacy & Pharmacology"
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Code / Abbreviation</label>
                <input
                  className="form-control"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. PHARM"
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Add details about the subjects and studies..."
                  style={{ minHeight: 80 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontWeight: 600 }}>
                  {editingId ? 'Save changes' : 'Create'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Departments detailed card list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🏫 Configured Branches ({departments.length})</span>
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-muted)' }}>
              Streams control the subject/topic suggestions for faculty credentials
            </span>
          </div>

          {loading ? (
            <p style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading departments...</p>
          ) : departments.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div className="empty-state" style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                No branches configured. Click "Load University Templates" at the top to initialize standard streams!
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
              {departments.map((d) => {
                const accent = getDeptColor(d.code);
                return (
                  <div
                    key={d._id}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      borderTop: `4px solid ${accent}`,
                      padding: 18,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>
                        {d.name}
                      </span>
                      {d.code && (
                        <span className="badge" style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40`, fontWeight: 700 }}>
                          {d.code}
                        </span>
                      )}
                    </div>

                    <p style={{ flex: 1, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.4, margin: 0 }}>
                      {d.description || "No curriculum description added. Edit this department to configure one."}
                    </p>

                    {isAdmin && (
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 4 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(d)} style={{ padding: '4px 10px', fontSize: 11 }}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id)} style={{ padding: '4px 10px', fontSize: 11 }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Departments;
