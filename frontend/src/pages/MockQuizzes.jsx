import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SIMULATED_QUESTIONS = {
  mern: [
    {
      title: "Which React Hook is used to manage local state inside a functional component?",
      options: ["useEffect", "useContext", "useState", "useReducer"],
      correctAnswer: "useState",
      marks: 2,
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "What does the Virtual DOM do in React to improve performance?",
      options: [
        "It directly edits the browser HTML elements on every keypress",
        "It compares changes in memory and updates only the modified real DOM elements",
        "It compiles Javascript into high-speed machine assembler code",
        "It stores all database states on the local client storage"
      ],
      correctAnswer: "It compares changes in memory and updates only the modified real DOM elements",
      marks: 2,
      difficulty: "Medium",
      bloomLevel: "Understand"
    },
    {
      title: "Which HTTP method is typically used to create a new resource on a REST API server?",
      options: ["GET", "POST", "PUT", "DELETE"],
      correctAnswer: "POST",
      marks: 2,
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "In Express.js, what is the purpose of middleware functions?",
      options: [
        "To compile HTML templates into dynamic CSS layouts",
        "To execute code, mutate request/response objects, and end request cycles",
        "To load balancing server requests to backup databases",
        "To backup security tokens into cloud server log files"
      ],
      correctAnswer: "To execute code, mutate request/response objects, and end request cycles",
      marks: 2,
      difficulty: "Medium",
      bloomLevel: "Apply"
    },
    {
      title: "What database schema design does MongoDB use to store collection records?",
      options: ["Table-based relational records", "BSON/JSON-like document structures", "Key-Value flat strings", "XML grid layouts"],
      correctAnswer: "BSON/JSON-like document structures",
      marks: 2,
      difficulty: "Easy",
      bloomLevel: "Remember"
    }
  ],
  pharm: [
    {
      title: "Which term refers to the rate and extent to which an active drug enters systemic circulation?",
      options: ["Clearance", "Bioavailability", "Half-life", "First-pass effect"],
      correctAnswer: "Bioavailability",
      marks: 2,
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "Which autonomic nervous system receptor is responsible for increasing heart rate and contractility?",
      options: ["Alpha-1 adrenergic", "Beta-1 adrenergic", "Muscarinic M2", "Nicotinic acetylcholine"],
      correctAnswer: "Beta-1 adrenergic",
      marks: 2,
      difficulty: "Medium",
      bloomLevel: "Understand"
    },
    {
      title: "What is the primary site of drug metabolism and detoxification in the human body?",
      options: ["Kidneys", "Lungs", "Liver", "Small Intestine"],
      correctAnswer: "Liver",
      marks: 2,
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "Which route of drug administration completely bypasses first-pass hepatic metabolism?",
      options: ["Oral administration", "Intravenous injection", "Sublingual tablet", "Inhalation delivery"],
      correctAnswer: "Intravenous injection",
      marks: 2,
      difficulty: "Medium",
      bloomLevel: "Apply"
    },
    {
      title: "What does the Structure-Activity Relationship (SAR) define in pharmacology?",
      options: [
        "The absorption speed of tablets in gastric fluid",
        "How chemical modifications on a molecular structure alter its biological action",
        "The financial costs of clinical research phases",
        "The storage shelf-life of drug packaging components"
      ],
      correctAnswer: "How chemical modifications on a molecular structure alter its biological action",
      marks: 2,
      difficulty: "Medium",
      bloomLevel: "Understand"
    }
  ],
  bus: [
    {
      title: "Which financial document displays a company's assets, liabilities, and equity at a specific point in time?",
      options: ["Income Statement", "Cash Flow Statement", "Balance Sheet", "Trial Ledger"],
      correctAnswer: "Balance Sheet",
      marks: 2,
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "What are the four core components of the classic marketing mix?",
      options: [
        "Price, Promotion, Product, Place",
        "Planning, Process, Performance, Profit",
        "People, Product, Promotion, Payments",
        "Production, Purchasing, Positioning, Pricing"
      ],
      correctAnswer: "Price, Promotion, Product, Place",
      marks: 2,
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "In double-entry bookkeeping, what is the impact of an increase in an asset account?",
      options: ["It is always credited", "It is always debited", "It decreases owner equity", "It increases liabilities"],
      correctAnswer: "It is always debited",
      marks: 2,
      difficulty: "Medium",
      bloomLevel: "Apply"
    },
    {
      title: "What framework is used to analyze external opportunities and threats alongside internal capabilities?",
      options: ["SWOT Analysis", "Maslow's Hierarchy", "Product Life Cycle", "BCG Growth Matrix"],
      correctAnswer: "SWOT Analysis",
      marks: 2,
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "Which economic term refers to the value of the next best alternative forgone when making a choice?",
      options: ["Sunk Cost", "Marginal Cost", "Opportunity Cost", "Fixed Cost"],
      correctAnswer: "Opportunity Cost",
      marks: 2,
      difficulty: "Medium",
      bloomLevel: "Understand"
    }
  ],
  general: [
    {
      title: "Which field of math is primarily concerned with rates of change and accumulation of quantities?",
      options: ["Linear Algebra", "Calculus", "Probability", "Discrete Mathematics"],
      correctAnswer: "Calculus",
      marks: 2,
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "What is the primary goal of writing a technical report's executive summary?",
      options: [
        "To list the index catalog numbers",
        "To summarize the entire report's core findings, methods, and recommendations",
        "To serve as an acknowledgement directory",
        "To list references and bibliographic definitions"
      ],
      correctAnswer: "To summarize the entire report's core findings, methods, and recommendations",
      marks: 2,
      difficulty: "Medium",
      bloomLevel: "Understand"
    },
    {
      title: "Which of the following is considered a core tenet of professional engineering ethics?",
      options: [
        "Maximizing shareholder return regardless of public risk",
        "Holding paramount the safety, health, and welfare of the public",
        "Completing projects below cost even if design rules are omitted",
        "Obtaining maximum patents regardless of original work source"
      ],
      correctAnswer: "Holding paramount the safety, health, and welfare of the public",
      marks: 2,
      difficulty: "Easy",
      bloomLevel: "Remember"
    },
    {
      title: "Which process refers to the mitigation of environmental impact by planting trees to capture carbon emissions?",
      options: ["Deforestation", "Carbon Sequestration", "Salinization", "Eutrophication"],
      correctAnswer: "Carbon Sequestration",
      marks: 2,
      difficulty: "Medium",
      bloomLevel: "Understand"
    },
    {
      title: "What does Intellectual Property (IP) law primarily protect?",
      options: [
        "Corporate real estate assets",
        "Creations of the human mind like inventions, literary works, and designs",
        "Cash balances in corporate treasury accounts",
        "Enrolled students list registered at university campuses"
      ],
      correctAnswer: "Creations of the human mind like inventions, literary works, and designs",
      marks: 2,
      difficulty: "Easy",
      bloomLevel: "Remember"
    }
  ]
};

const MockQuizzes = () => {
  const { user } = useAuth();
  const [phase, setPhase] = useState('config'); // config, quiz, result
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOption }
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [scoreObj, setScoreObj] = useState(null);
  const [saving, setSaving] = useState(false);

  // Timer effect
  useEffect(() => {
    if (phase !== 'quiz') return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  const getActiveStream = () => {
    const dept = (user?.department?.name || user?.department || '').toString().toLowerCase();
    if (dept.includes('pharm') || dept.includes('med')) return 'Pharmacy';
    if (dept.includes('bus') || dept.includes('comm') || dept.includes('mgt') || dept.includes('finance') || dept.includes('eco')) return 'Business Studies';
    if (dept.includes('comp') || dept.includes('cse') || dept.includes('it') || dept.includes('software')) return 'Computer Science';
    return 'General';
  };

  const getSuggestedSubjects = () => {
    const stream = getActiveStream();
    if (stream === 'Pharmacy') return ["Pharmacology", "Pharmaceutics", "Medicinal Chemistry", "Clinical Pharmacy"];
    if (stream === 'Business Studies') return ["Financial Accounting", "Business Management", "Marketing Strategy", "Corporate Finance"];
    if (stream === 'Computer Science') return ["MERN Stack", "Python Programming", "Database Management", "Data Structures"];
    return ["Engineering Mathematics", "Technical Writing", "Professional Ethics", "Environmental Sciences"];
  };

  const handleStartQuiz = async () => {
    if (!subject) {
      setError('Please select or input a subject first.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Try to load approved questions from the live database matching subject & difficulty
      const { data } = await api.get('/questions', {
        params: {
          subject,
          difficulty,
          status: 'Approved',
          limit: 5
        }
      });

      // Filter for MCQ or questions that have options
      let liveQs = (data.questions || []).filter(q => q.options && q.options.length > 0);

      if (liveQs.length < 3) {
        // If not enough questions exist in database, fall back to our rich local simulated lists based on stream keywords
        console.log("Not enough live questions found. Loading context-aware simulated mock exam...");
        const subLower = subject.toLowerCase();
        if (subLower.includes('mern') || subLower.includes('react') || subLower.includes('web') || subLower.includes('db') || subLower.includes('code') || subLower.includes('computer')) {
          liveQs = SIMULATED_QUESTIONS.mern;
        } else if (subLower.includes('pharm') || subLower.includes('med') || subLower.includes('drug') || subLower.includes('chem')) {
          liveQs = SIMULATED_QUESTIONS.pharm;
        } else if (subLower.includes('acc') || subLower.includes('ledger') || subLower.includes('market') || subLower.includes('bus') || subLower.includes('finance') || subLower.includes('cost')) {
          liveQs = SIMULATED_QUESTIONS.bus;
        } else {
          liveQs = SIMULATED_QUESTIONS.general;
        }
      }

      setQuestions(liveQs.slice(0, 5));
      setAnswers({});
      setCurrentIdx(0);
      setTimeLeft(180);
      setPhase('quiz');
    } catch (err) {
      console.error(err);
      setError('Could not connect to server. Loading local general study quiz instead.');
      setQuestions(SIMULATED_QUESTIONS.general);
      setAnswers({});
      setCurrentIdx(0);
      setTimeLeft(180);
      setPhase('quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (opt) => {
    setAnswers({ ...answers, [currentIdx]: opt });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleAutoSubmit = () => {
    alert('Time has run out! Submitting your answers automatically.');
    submitQuiz();
  };

  const submitQuiz = async () => {
    setSaving(true);
    let correctCount = 0;
    
    questions.forEach((q, idx) => {
      const studentAnswer = answers[idx] || '';
      if (studentAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        correctCount++;
      }
    });

    const finalScore = correctCount;
    const finalTotal = questions.length;
    const percentage = Math.round((finalScore / finalTotal) * 100);

    // Save score to backend DB
    try {
      await api.post('/quizzes/score', {
        subject,
        score: finalScore,
        totalQuestions: finalTotal,
        difficulty
      });
    } catch (err) {
      console.error("Could not save score to backend:", err);
    }

    setScoreObj({
      correct: finalScore,
      total: finalTotal,
      percentage
    });
    setPhase('result');
    setSaving(false);
  };

  // Compile AI evaluation recommendations
  const getAIRecommendations = () => {
    if (!scoreObj) return [];
    const p = scoreObj.percentage;
    const recommendations = [];

    if (p === 100) {
      recommendations.push("🎉 Perfect Score! You displayed total mastery of the concepts.");
      recommendations.push("🚀 Next Step: Set difficulty to 'Hard' to challenge yourself on complex use cases.");
    } else {
      recommendations.push(`📚 Score: ${scoreObj.correct}/${scoreObj.total} (${p}%). Try practicing topics where your options were wrong.`);
      
      // Analyze missed answers
      questions.forEach((q, idx) => {
        const isCorrect = (answers[idx] || '').trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        if (!isCorrect) {
          recommendations.push(`🔍 Topic Review: "${q.title.slice(0, 45)}..." - Review ${q.correctAnswer} references.`);
        }
      });

      if (p < 50) {
        recommendations.push("💡 Coach Tip: Start with 'Easy' difficulty level quizzes first to lock in foundational principles.");
      }
    }
    return recommendations;
  };

  // Format remaining seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      
      {/* Configuration Phase */}
      {phase === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="page-header" style={{ margin: 0 }}>
            <h1>Mock Quiz Terminal</h1>
            <p>Select your subject and difficulty to begin a timed evaluation quiz. Compiles answers instantly with feedback.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, color: 'var(--color-text)' }}>
                ⚙️ Set Quiz Parameters
              </div>
              {error && <div className="error-banner" style={{ marginBottom: 14 }}>{error}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600 }}>Subject Area</label>
                  <input
                    className="form-control"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. MERN Stack, Pharmacology, Accounting..."
                    required
                  />
                  {/* Subject Suggestions based on stream */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {getSuggestedSubjects().map(subj => (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => setSubject(subj)}
                        style={{
                          background: subject === subj ? 'var(--color-primary-light)' : 'rgba(0,0,0,0.04)',
                          border: subject === subj ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: 'var(--color-text)',
                          transition: 'all 0.15s'
                        }}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 600 }}>Difficulty Level</label>
                  <select className="form-control" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStartQuiz}
                  disabled={loading}
                  style={{ alignSelf: 'flex-start', padding: '10px 24px', fontWeight: 600, marginTop: 8 }}
                >
                  {loading ? 'Compiling questions...' : '🚀 Start Evaluation Quiz'}
                </button>
              </div>
            </div>

            {/* Instruction Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card" style={{ borderLeft: '4px solid #10b981', padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)', marginBottom: 8 }}>
                  💡 Quiz Guidelines
                </div>
                <ul style={{ fontSize: 12, color: 'var(--color-text-muted)', paddingLeft: 18, lineHeight: 1.5, margin: 0 }}>
                  <li style={{ marginBottom: 6 }}>This quiz contains <strong>5 questions</strong>.</li>
                  <li style={{ marginBottom: 6 }}>You have <strong>3 minutes (180 seconds)</strong> total.</li>
                  <li style={{ marginBottom: 6 }}>Answers are graded instantly upon completion.</li>
                  <li>Graded scores are logged onto the student leaderboard.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Attempt Phase */}
      {phase === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <span className="badge badge-primary" style={{ fontSize: 12, padding: '4px 10px' }}>
                Subject: {subject}
              </span>
              <span className={`badge badge-${difficulty.toLowerCase()}`} style={{ fontSize: 12, padding: '4px 10px', marginLeft: 8 }}>
                {difficulty}
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, background: '#fee2e2', color: '#dc2626', padding: '6px 14px', borderRadius: 20, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 6 }}>
              ⏱️ Time Remaining: {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${((currentIdx + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.2s' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
            
            {/* Question Card */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 600 }}>
                QUESTION {currentIdx + 1} OF {questions.length}
              </div>

              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 18, lineHeight: 1.4 }}>
                {questions[currentIdx]?.title}
              </div>

              {/* Options list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {questions[currentIdx]?.options?.map((opt, i) => {
                  const isSelected = answers[currentIdx] === opt;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        background: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: isSelected ? 600 : 500,
                        color: 'var(--color-text)',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span style={{
                        background: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                        color: isSelected ? 'white' : 'var(--color-text)',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                        fontSize: 10,
                        fontWeight: 700
                      }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                >
                  ◀️ Previous
                </button>
                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                  >
                    Next ▶️
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={submitQuiz}
                    disabled={saving}
                    style={{ background: 'var(--color-success)', color: 'white', border: 'none', padding: '8px 24px', fontWeight: 700, borderRadius: 6, cursor: 'pointer' }}
                  >
                    {saving ? 'Saving...' : '🏁 Finish Quiz'}
                  </button>
                )}
              </div>
            </div>

            {/* Answer Navigation Map Sidebar */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)', marginBottom: 12 }}>
                🗺️ Question Map
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {questions.map((_, idx) => {
                  const hasAnswered = answers[idx] !== undefined;
                  const isCurrent = currentIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIdx(idx)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        border: isCurrent ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        background: hasAnswered ? '#d1fae5' : 'var(--color-bg)',
                        color: hasAnswered ? '#065f46' : 'var(--color-text)',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Valuation & Results Phase */}
      {phase === 'result' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="page-header" style={{ margin: 0 }}>
            <h1>Quiz Valuation Report</h1>
            <p>Here is your comprehensive evaluation, detailed answers analysis, and AI study coach advice.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
            
            {/* Answer valuation list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {questions.map((q, idx) => {
                const isCorrect = (answers[idx] || '').trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                return (
                  <div key={idx} className="card" style={{ borderLeft: isCorrect ? '4px solid #10b981' : '4px solid #ef4444', padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)' }}>
                        QUESTION {idx + 1}
                      </span>
                      <span className={`badge badge-${isCorrect ? 'success' : 'danger'}`}>
                        {isCorrect ? '✔️ Correct' : '❌ Incorrect'}
                      </span>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>
                      {q.title}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>Your Answer:</span>{' '}
                        <span style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {answers[idx] || '(Not answered)'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>Correct Answer:</span>{' '}
                          <span style={{ color: 'var(--color-text)' }}>{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Performance breakdown card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Score Display Card */}
              <div className="card" style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                  YOUR SCORE
                </div>
                <div style={{ fontSize: 42, fontWeight: 900, color: scoreObj?.percentage >= 60 ? 'var(--color-success)' : 'var(--color-danger)', margin: '10px 0' }}>
                  {scoreObj?.correct} / {scoreObj?.total}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
                  {scoreObj?.percentage}%
                </div>
                <div style={{ marginTop: 14, fontWeight: 600 }}>
                  {scoreObj?.percentage >= 60 ? (
                    <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: 12 }}>Pass</span>
                  ) : (
                    <span className="badge badge-danger" style={{ padding: '6px 14px', fontSize: 12 }}>Needs Review</span>
                  )}
                </div>
              </div>

              {/* Study Coach Panel */}
              <div className="card" style={{ borderLeft: '4px solid #a855f7', background: 'linear-gradient(to right, var(--color-surface), var(--color-primary-light))', padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>✨</span> Coach Valuation Advice
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, lineHeight: 1.4, color: 'var(--color-text-muted)' }}>
                  {getAIRecommendations().map((rec, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6 }}>
                      <span>•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exit/Retry Button */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setPhase('config')}
                style={{ width: '100%', padding: '10px 14px', fontWeight: 600 }}
              >
                🔄 Try Another Quiz
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MockQuizzes;
