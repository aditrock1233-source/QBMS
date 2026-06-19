import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AddQuestion = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    questionType: 'MCQ',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 2,
    difficulty: 'Easy',
    bloomLevel: 'Remember',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const updated = [...form.options];
    updated[index] = value;
    setForm({ ...form, options: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = { ...form, marks: Number(form.marks) };
      if (form.questionType !== 'MCQ') {
        delete payload.options;
      } else {
        payload.options = form.options.filter((o) => o.trim() !== '');
      }

      await api.post('/questions', payload);
      setSuccess('Question added and sent for approval.');
      setForm({
        title: '',
        description: '',
        subject: form.subject, // keep subject for faster bulk entry
        questionType: 'MCQ',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 2,
        difficulty: 'Easy',
        bloomLevel: 'Remember',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add Question</h1>
        <p>New questions go to "Pending" status until an HOD approves them.</p>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Question title</label>
            <textarea
              className="form-control"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Explain the Virtual DOM in React..."
              required
            />
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              className="form-control"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Any extra context or instructions for this question"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Subject</label>
              <input
                className="form-control"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="MERN Stack"
                required
              />
            </div>
            <div className="form-group">
              <label>Question type</label>
              <select className="form-control" name="questionType" value={form.questionType} onChange={handleChange}>
                <option value="MCQ">MCQ</option>
                <option value="TrueFalse">True / False</option>
                <option value="ShortAnswer">Short Answer</option>
                <option value="LongAnswer">Long Answer</option>
                <option value="CaseStudy">Case Study</option>
                <option value="Programming">Programming</option>
              </select>
            </div>
          </div>

          {form.questionType === 'MCQ' && (
            <div className="form-group">
              <label>Options</label>
              {form.options.map((opt, i) => (
                <input
                  key={i}
                  className="form-control"
                  style={{ marginBottom: 8 }}
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                />
              ))}
            </div>
          )}

          <div className="form-group">
            <label>Correct answer</label>
            <input
              className="form-control"
              name="correctAnswer"
              value={form.correctAnswer}
              onChange={handleChange}
              placeholder="e.g. useState"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Marks</label>
              <input
                type="number"
                className="form-control"
                name="marks"
                value={form.marks}
                onChange={handleChange}
                min={1}
                required
              />
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select className="form-control" name="difficulty" value={form.difficulty} onChange={handleChange}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Bloom's taxonomy level</label>
            <select className="form-control" name="bloomLevel" value={form.bloomLevel} onChange={handleChange}>
              <option value="Remember">Remember</option>
              <option value="Understand">Understand</option>
              <option value="Apply">Apply</option>
              <option value="Analyze">Analyze</option>
              <option value="Evaluate">Evaluate</option>
              <option value="Create">Create</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Add question'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddQuestion;
