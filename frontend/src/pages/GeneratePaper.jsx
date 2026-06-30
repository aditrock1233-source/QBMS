import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const emptySection = { sectionName: '', questionType: 'MCQ', numberOfQuestions: 5, marksPerQuestion: 2 };

const GeneratePaper = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    subject: '',
    examType: 'UnitTest',
    durationMinutes: 60,
    numberOfSets: 1,
  });
  const [difficultyMix, setDifficultyMix] = useState({ easy: 30, medium: 50, hard: 20 });
  const [sections, setSections] = useState([{ ...emptySection, sectionName: 'Section A' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [syllabusFocus, setSyllabusFocus] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  const totalMarks = sections.reduce(
    (sum, s) => sum + Number(s.numberOfQuestions || 0) * Number(s.marksPerQuestion || 0),
    0
  );

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDifficultyChange = (key, value) => {
    setDifficultyMix({ ...difficultyMix, [key]: Number(value) });
  };

  const handleSectionChange = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const addSection = () => {
    setSections([
      ...sections,
      { ...emptySection, sectionName: `Section ${String.fromCharCode(65 + sections.length)}` },
    ]);
  };

  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const getActiveStream = () => {
    const dept = (user?.department?.name || user?.department || '').toString().toLowerCase();
    if (dept.includes('pharm') || dept.includes('med')) {
      return 'Pharmacy';
    } else if (dept.includes('bus') || dept.includes('comm') || dept.includes('mgt') || dept.includes('finance') || dept.includes('eco')) {
      return 'Business Studies';
    } else if (dept.includes('comp') || dept.includes('cse') || dept.includes('it') || dept.includes('software')) {
      return 'Computer Science';
    }
    return 'General';
  };

  const getSuggestedSubjects = () => {
    const stream = getActiveStream();
    if (stream === 'Pharmacy') {
      return ["Pharmacology", "Pharmaceutics", "Medicinal Chemistry", "Clinical Pharmacy"];
    } else if (stream === 'Business Studies') {
      return ["Financial Accounting", "Business Management", "Marketing Strategy", "Corporate Finance"];
    } else if (stream === 'Computer Science') {
      return ["MERN Stack", "Python Programming", "Database Management", "Data Structures"];
    }
    return ["Engineering Mathematics", "Technical Writing", "Professional Ethics", "Environmental Sciences"];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const mixTotal = difficultyMix.easy + difficultyMix.medium + difficultyMix.hard;
    if (mixTotal !== 100) {
      setError(`Difficulty mix must total 100% (currently ${mixTotal}%).`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        numberOfSets: Number(form.numberOfSets),
        totalMarks,
        difficultyMix,
        useAI,
        syllabusFocus,
        customInstructions,
        sections: sections.map((s) => ({
          ...s,
          numberOfQuestions: Number(s.numberOfQuestions),
          marksPerQuestion: Number(s.marksPerQuestion),
        })),
      };
      const { data } = await api.post('/papers/generate', payload);
      navigate(`/papers/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate paper. Make sure enough approved questions exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <h1>Generate Question Paper</h1>
        <p>Define a pattern once — get multiple randomized sets, ready to export.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        
        {/* Generation Method Choice Card */}
        <div className="card" style={{ marginBottom: 18, padding: 18 }}>
          <div className="section-title">Generation Method</div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
            Choose how you want to compile the questions for this paper:
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div
              className={`choice-card ${!useAI ? 'active' : ''}`}
              onClick={() => setUseAI(false)}
              style={{
                flex: 1,
                minWidth: '280px',
                border: !useAI ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                background: !useAI ? 'var(--color-primary-light)' : 'var(--color-surface)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📦</span> Standard Mode (Database)
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Pulls existing, approved questions randomly from the question bank.
              </div>
            </div>
            <div
              className={`choice-card ${useAI ? 'active' : ''}`}
              onClick={() => setUseAI(true)}
              style={{
                flex: 1,
                minWidth: '280px',
                border: useAI ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                background: useAI ? 'var(--color-primary-light)' : 'var(--color-surface)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✨</span> AI Generation Mode (Google Gemini)
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Generates new unique questions on the fly. <strong>Requires Admin approval.</strong>
              </div>
            </div>
          </div>
        </div>

        {/* AI Architect Parameters (Only displayed in AI Mode) */}
        {useAI && (
          <div className="card" style={{ marginBottom: 18, borderLeft: '4px solid #a855f7', background: 'linear-gradient(to right, var(--color-surface), var(--color-primary-light))', padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✨</span> AI Paper Architect Settings ({getActiveStream()} Stream)
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 14 }}>
              Define the syllabus focus and commands for the Google Gemini generation model.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 600 }}>Syllabus / Concept Focus (optional)</label>
                <input
                  className="form-control"
                  value={syllabusFocus}
                  onChange={(e) => setSyllabusFocus(e.target.value)}
                  placeholder="e.g. React hooks, pharmacology clinical trials, balance sheets, normalisation..."
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 600 }}>Custom Commands / Instructions to AI (optional)</label>
                <input
                  className="form-control"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Include code blocks, make MCQ options challenging, use clinical case scenario..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Paper details card */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-title">Paper details</div>
          <div className="form-row">
            <div className="form-group">
              <label>Paper title</label>
              <input
                className="form-control"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="e.g. End Semester Examination"
                required
              />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input
                className="form-control"
                name="subject"
                value={form.subject}
                onChange={handleFormChange}
                placeholder="e.g. Pharmacology, Finance, MERN Stack..."
                required
              />
              {/* Branch-specific Subject Suggestions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {getSuggestedSubjects().map(subj => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => setForm({ ...form, subject: subj })}
                    style={{
                      background: 'rgba(0, 0, 0, 0.05)',
                      border: '1px solid var(--color-border)',
                      padding: '3px 8px',
                      borderRadius: 8,
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: 'var(--color-text)',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.background = 'var(--color-primary-light)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Exam type</label>
              <select className="form-control" name="examType" value={form.examType} onChange={handleFormChange}>
                <option value="Internal">Internal Exam</option>
                <option value="MidTerm">Mid Term</option>
                <option value="EndSemester">End Semester</option>
                <option value="UnitTest">Unit Test</option>
                <option value="Placement">Placement Test</option>
                <option value="Mock">Mock Test</option>
                <option value="Assignment">Assignment</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                className="form-control"
                name="durationMinutes"
                value={form.durationMinutes}
                onChange={handleFormChange}
                min={10}
                required
              />
            </div>
          </div>
          <div className="form-group" style={{ maxWidth: 200 }}>
            <label>Number of sets</label>
            <input
              type="number"
              className="form-control"
              name="numberOfSets"
              value={form.numberOfSets}
              onChange={handleFormChange}
              min={1}
              max={6}
              required
            />
          </div>
        </div>

        {/* Difficulty mix card */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-title">Difficulty mix (%)</div>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="form-group">
              <label>Easy</label>
              <input
                type="number"
                className="form-control"
                value={difficultyMix.easy}
                onChange={(e) => handleDifficultyChange('easy', e.target.value)}
                min={0}
                max={100}
              />
            </div>
            <div className="form-group">
              <label>Medium</label>
              <input
                type="number"
                className="form-control"
                value={difficultyMix.medium}
                onChange={(e) => handleDifficultyChange('medium', e.target.value)}
                min={0}
                max={100}
              />
            </div>
            <div className="form-group">
              <label>Hard</label>
              <input
                type="number"
                className="form-control"
                value={difficultyMix.hard}
                onChange={(e) => handleDifficultyChange('hard', e.target.value)}
                min={0}
                max={100}
              />
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Total: {difficultyMix.easy + difficultyMix.medium + difficultyMix.hard}% (must equal 100%)
          </p>
        </div>

        {/* Question pattern card */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-title">Question pattern</div>

          {sections.map((section, i) => (
            <div
              key={i}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                <div className="form-group">
                  <label>Section name</label>
                  <input
                    className="form-control"
                    value={section.sectionName}
                    onChange={(e) => handleSectionChange(i, 'sectionName', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Question type</label>
                  <select
                    className="form-control"
                    value={section.questionType}
                    onChange={(e) => handleSectionChange(i, 'questionType', e.target.value)}
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="TrueFalse">True / False</option>
                    <option value="ShortAnswer">Short Answer</option>
                    <option value="LongAnswer">Long Answer</option>
                    <option value="CaseStudy">Case Study</option>
                    <option value="Programming">Programming</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>No. of questions</label>
                  <input
                    type="number"
                    className="form-control"
                    value={section.numberOfQuestions}
                    onChange={(e) => handleSectionChange(i, 'numberOfQuestions', e.target.value)}
                    min={1}
                  />
                </div>
                <div className="form-group">
                  <label>Marks each</label>
                  <input
                    type="number"
                    className="form-control"
                    value={section.marksPerQuestion}
                    onChange={(e) => handleSectionChange(i, 'marksPerQuestion', e.target.value)}
                    min={1}
                  />
                </div>
              </div>
              {sections.length > 1 && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => removeSection(i)}>
                  Remove section
                </button>
              )}
            </div>
          ))}

          <button type="button" className="btn btn-secondary btn-sm" onClick={addSection}>
            + Add section
          </button>

          <p style={{ marginTop: 14, fontSize: 14, fontWeight: 600 }}>
            Total marks: {totalMarks}
          </p>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '12px 28px', fontWeight: 700 }}>
          {loading ? 'Generating...' : `Generate ${form.numberOfSets} set(s) with AI ✨`}
        </button>
      </form>
    </div>
  );
};

export default GeneratePaper;
