import { useEffect, useState } from 'react';
import api from '../utils/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

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
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, form);
      } else {
        await api.post('/departments', form);
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
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete department.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Departments</h1>
        <p>Manage the academic departments available across QBMS.</p>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="section-title">{editingId ? 'Edit department' : 'Add a department'}</div>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Department name</label>
              <input
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Computer Science"
                required
              />
            </div>
            <div className="form-group">
              <label>Code</label>
              <input
                className="form-control"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="CSE"
              />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <textarea
                className="form-control"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short note about this department"
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save changes' : 'Add department'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="section-title">All departments ({departments.length})</div>
          {loading ? (
            <p>Loading...</p>
          ) : departments.length === 0 ? (
            <div className="empty-state">No departments yet — add your first one.</div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => (
                    <tr key={d._id}>
                      <td>{d.name}</td>
                      <td>{d.code || '—'}</td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(d)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id)}>
                          Delete
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
    </div>
  );
};

export default Departments;
