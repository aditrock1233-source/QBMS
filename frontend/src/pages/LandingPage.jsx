import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SAMPLE_QUESTIONS = [
  { id: 1, marks: 2, text: 'Which hook manages state in a functional component?' },
  { id: 2, marks: 5, text: 'Explain the purpose of middleware in Express.js.' },
  { id: 3, marks: 2, text: 'What does CSS stand for?' },
  { id: 4, marks: 8, text: 'Design a schema for a multi-product order system.' },
  { id: 5, marks: 5, text: 'Differentiate SQL and NoSQL with an example each.' },
  { id: 6, marks: 2, text: 'Which command initializes a new npm project?' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SetPaper = ({ label, questions, active }) => (
  <div className={`paper-card ${active ? 'paper-card--active' : ''}`}>
    <div className="paper-card__head">
      <span className="paper-card__set">{label}</span>
      <span className="paper-card__marks">{questions.reduce((s, q) => s + q.marks, 0)} marks</span>
    </div>
    {questions.map((q, i) => (
      <div className="paper-card__row" key={q.id}>
        <span className="paper-card__num">{String(i + 1).padStart(2, '0')}</span>
        <span className="paper-card__text">{q.text}</span>
        <span className="paper-card__tag">{q.marks}m</span>
      </div>
    ))}
  </div>
);

const LandingPage = () => {
  const { user } = useAuth();
  const [sets, setSets] = useState([shuffle(SAMPLE_QUESTIONS), shuffle(SAMPLE_QUESTIONS)]);
  const [activeSet, setActiveSet] = useState(0);

  const handleReshuffle = () => {
    setSets([shuffle(SAMPLE_QUESTIONS), shuffle(SAMPLE_QUESTIONS)]);
    setActiveSet((a) => (a === 0 ? 1 : 0));
  };

  return (
    <div className="lp">
      <style>{`
        .lp {
          --bg-deep: #0E0B1F;
          --violet: #7C3AED;
          --violet-light: #A78BFA;
          --magenta: #EC4899;
          --cyan: #22D3EE;
          --paper: #FAF8FF;
          --text-dim: rgba(250,248,255,0.68);
          --line: rgba(250,248,255,0.12);
          color: var(--paper);
          font-family: 'Inter', system-ui, sans-serif;
          overflow-x: hidden;
          background: var(--bg-deep);
        }
        .lp * { box-sizing: border-box; }
        .lp .display { font-family: 'Fraunces', Georgia, serif; }

        .lp-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(circle at 18% 8%, rgba(124,58,237,0.55), transparent 42%),
            radial-gradient(circle at 85% 18%, rgba(236,72,153,0.4), transparent 45%),
            radial-gradient(circle at 60% 70%, rgba(34,211,238,0.18), transparent 50%),
            var(--bg-deep);
        }
        .lp-content { position: relative; z-index: 1; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lp-anim { animation: fadeUp 0.7s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .lp-anim { animation: none; }
        }

        /* ---- Nav ---- */
        .lp-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 56px; max-width: 1320px; margin: 0 auto;
        }
        .lp-nav__brand { display: flex; align-items: baseline; gap: 8px; font-family: 'Fraunces', serif; font-weight: 600; font-size: 20px; }
        .lp-nav__brand span { background: linear-gradient(90deg, var(--violet-light), var(--cyan)); -webkit-background-clip: text; background-clip: text; color: transparent; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; letter-spacing: 0.1em; text-transform: uppercase; }
        .lp-nav__links { display: flex; gap: 30px; align-items: center; }
        .lp-nav__links a { color: var(--text-dim); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .lp-nav__links a:hover { color: var(--paper); }
        .lp-nav__cta {
          background: linear-gradient(90deg, var(--violet), var(--magenta));
          color: white !important; padding: 11px 22px; border-radius: 999px; font-weight: 600;
          box-shadow: 0 6px 20px -6px rgba(124,58,237,0.6);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .lp-nav__cta:hover { transform: translateY(-2px); box-shadow: 0 10px 26px -6px rgba(236,72,153,0.65); }

        /* ---- Hero ---- */
        .lp-hero {
          max-width: 1320px; margin: 0 auto; padding: 40px 56px 28px;
          display: grid; grid-template-columns: 1.05fr 1fr; gap: 56px; align-items: center;
          min-height: 70vh;
        }
        .lp-hero__eyebrow {
          display: inline-flex; align-items: center; gap: 10px; font-size: 12.5px;
          letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 22px;
          padding: 7px 14px; border-radius: 999px; border: 1px solid var(--line);
          background: rgba(124,58,237,0.12); color: var(--violet-light); width: fit-content;
        }
        .lp-hero__title { font-size: 56px; line-height: 1.06; font-weight: 600; margin: 0 0 22px; letter-spacing: -0.01em; }
        .lp-hero__title .grad {
          background: linear-gradient(95deg, var(--violet-light) 10%, var(--magenta) 55%, var(--cyan) 95%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .lp-hero__sub { font-size: 17px; line-height: 1.6; color: var(--text-dim); max-width: 460px; margin: 0 0 32px; }
        .lp-hero__actions { display: flex; gap: 14px; align-items: center; margin-bottom: 40px; }

        .lp-btn-primary {
          background: linear-gradient(90deg, var(--violet), var(--magenta));
          color: white; border: none; padding: 15px 28px; border-radius: 10px;
          font-size: 15px; font-weight: 600; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 10px 28px -8px rgba(124,58,237,0.6);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .lp-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 16px 34px -8px rgba(236,72,153,0.65); }

        .lp-btn-ghost {
          color: var(--paper); border: 1px solid var(--line); background: rgba(255,255,255,0.03);
          padding: 14px 24px; border-radius: 10px; font-size: 15px; font-weight: 500; text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .lp-btn-ghost:hover { border-color: var(--violet-light); background: rgba(124,58,237,0.1); }

        .lp-hero__stats { display: flex; gap: 32px; padding-top: 24px; border-top: 1px solid var(--line); }
        .lp-hero__stat-num {
          font-family: 'Fraunces', serif; font-size: 26px; font-weight: 600;
          background: linear-gradient(90deg, var(--violet-light), var(--cyan));
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .lp-hero__stat-label { font-size: 12px; color: var(--text-dim); margin-top: 2px; }

        /* ---- Hero visual ---- */
        .lp-visual__deck { position: relative; height: 400px; }
        .paper-card {
          position: absolute; inset: 0; background: var(--paper); color: #1a1330;
          border-radius: 14px; padding: 26px 24px;
          box-shadow: 0 30px 70px -20px rgba(124,58,237,0.5), 0 0 0 1px rgba(255,255,255,0.06);
          transform: rotate(-2.5deg) translate(12px, 10px);
          transition: opacity 0.35s ease, transform 0.35s ease; opacity: 0.5;
        }
        .paper-card--active { transform: rotate(0.8deg) translate(0,0); opacity: 1; z-index: 2; }
        .paper-card__head {
          display: flex; justify-content: space-between; align-items: baseline;
          border-bottom: 2px solid #1a1330; padding-bottom: 10px; margin-bottom: 16px;
        }
        .paper-card__set { font-family: 'Fraunces', serif; font-weight: 600; font-size: 16px; }
        .paper-card__marks { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(26,19,48,0.55); }
        .paper-card__row {
          display: grid; grid-template-columns: 24px 1fr 30px; gap: 10px;
          padding: 9px 0; border-bottom: 1px dashed rgba(26,19,48,0.14); font-size: 12.5px; line-height: 1.45;
        }
        .paper-card__num { font-family: 'Fraunces', serif; font-weight: 600; color: var(--magenta); font-size: 12px; }
        .paper-card__text { color: rgba(26,19,48,0.82); }
        .paper-card__tag { text-align: right; font-size: 11px; color: rgba(26,19,48,0.5); font-weight: 600; }

        .lp-visual__caption { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; padding: 0 4px; }
        .lp-visual__caption-text { font-size: 12.5px; color: var(--text-dim); }
        .lp-shuffle-btn {
          display: inline-flex; align-items: center; gap: 7px; background: rgba(124,58,237,0.14);
          border: 1px solid var(--line); color: var(--paper); font-size: 12.5px; font-weight: 600;
          padding: 9px 16px; border-radius: 999px; cursor: pointer; transition: background 0.2s, border-color 0.2s;
        }
        .lp-shuffle-btn:hover { background: rgba(236,72,153,0.18); border-color: var(--magenta); }
        .lp-shuffle-btn svg { width: 13px; height: 13px; }

        /* ---- Section header ---- */
        .lp-section-head { max-width: 1320px; margin: 0 auto; padding: 0 56px; margin-top: 64px; margin-bottom: 36px; }
        .lp-section-tag {
          display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--cyan); margin-bottom: 14px;
        }
        .lp-section-tag::before { content: ''; width: 18px; height: 1px; background: var(--cyan); }
        .lp-section-head h2 { font-family: 'Fraunces', serif; font-size: 32px; font-weight: 600; max-width: 600px; margin: 0 0 12px; }
        .lp-section-head p { color: var(--text-dim); font-size: 15px; max-width: 540px; line-height: 1.6; margin: 0; }

        /* ---- Roles ---- */
        .lp-section { max-width: 1320px; margin: 0 auto; padding: 0 56px; }
        .lp-roles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .lp-role {
          background: rgba(255,255,255,0.035); border: 1px solid var(--line); border-radius: 14px;
          padding: 28px 24px; min-height: 190px; display: flex; flex-direction: column;
          transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .lp-role:hover { transform: translateY(-4px); border-color: var(--violet-light); background: rgba(124,58,237,0.08); }
        .lp-role__letter { font-family: 'Fraunces', serif; font-size: 12.5px; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 16px; color: var(--magenta); }
        .lp-role__name { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 600; margin-bottom: 10px; }
        .lp-role__desc { font-size: 13.5px; color: var(--text-dim); line-height: 1.55; }

        /* ---- Features ---- */
        .lp-features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
        .lp-feature {
          background: rgba(255,255,255,0.035); border: 1px solid var(--line); border-radius: 14px; padding: 28px;
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .lp-feature:hover { transform: translateY(-4px); border-color: var(--cyan); }
        .lp-feature__num {
          display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px;
          border-radius: 8px; background: linear-gradient(135deg, var(--violet), var(--magenta));
          font-family: 'Fraunces', serif; font-size: 13px; font-weight: 700; margin-bottom: 16px;
        }
        .lp-feature__name { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 600; margin-bottom: 10px; }
        .lp-feature__desc { color: var(--text-dim); font-size: 14px; line-height: 1.6; }

        /* ---- CTA ---- */
        .lp-cta { max-width: 1320px; margin: 80px auto 0; padding: 0 56px 80px; }
        .lp-cta__panel {
          border-radius: 20px; padding: 64px 48px; text-align: center; position: relative; overflow: hidden;
          background: linear-gradient(120deg, rgba(124,58,237,0.35), rgba(236,72,153,0.25));
          border: 1px solid var(--line);
        }
        .lp-cta__title { font-family: 'Fraunces', serif; font-size: 34px; font-weight: 600; max-width: 540px; margin: 0 auto 12px; }
        .lp-cta__sub { color: var(--text-dim); font-size: 15px; margin-bottom: 28px; }

        .lp-footer {
          max-width: 1320px; margin: 0 auto; padding: 28px 56px 44px;
          display: flex; justify-content: space-between; border-top: 1px solid var(--line);
          font-size: 13px; color: var(--text-dim);
        }

        @media (max-width: 900px) {
          .lp-hero { grid-template-columns: 1fr; padding: 32px 22px; min-height: auto; }
          .lp-nav { padding: 20px 22px; }
          .lp-nav__links a:not(.lp-nav__cta) { display: none; }
          .lp-hero__title { font-size: 36px; }
          .lp-section, .lp-section-head, .lp-cta, .lp-footer { padding-left: 22px; padding-right: 22px; }
          .lp-roles { grid-template-columns: 1fr 1fr; }
          .lp-features { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="lp-bg" />
      <div className="lp-content">
        <nav className="lp-nav">
          <div className="lp-nav__brand">QBMS <span>Question Bank</span></div>
          <div className="lp-nav__links">
            <a href="#workflow">Workflow</a>
            <a href="#features">Features</a>
            {user ? (
              <Link to="/dashboard" className="lp-nav__cta">Go to dashboard →</Link>
            ) : (
              <>
                <Link to="/login">Log in</Link>
                <Link to="/register" className="lp-nav__cta">Get started</Link>
              </>
            )}
          </div>
        </nav>

        <section className="lp-hero">
          <div className="lp-anim">
            <div className="lp-hero__eyebrow">⚡ Randomized paper generation</div>
            <h1 className="lp-hero__title display">
              Every paper, <span className="grad">different.</span><br />Every time.
            </h1>
            <p className="lp-hero__sub">
              QBMS turns one approved question bank into unlimited exam sets — same syllabus,
              same difficulty, never the same paper twice.
            </p>
            <div className="lp-hero__actions">
              {user ? (
                <Link to="/dashboard" className="lp-btn-primary">Go to your dashboard →</Link>
              ) : (
                <Link to="/register" className="lp-btn-primary">Create your bank →</Link>
              )}
              <a href="#workflow" className="lp-btn-ghost">See how it works</a>
            </div>
            <div className="lp-hero__stats">
              <div><div className="lp-hero__stat-num display">4</div><div className="lp-hero__stat-label">Review roles</div></div>
              <div><div className="lp-hero__stat-num display">6</div><div className="lp-hero__stat-label">Question types</div></div>
              <div><div className="lp-hero__stat-num display">∞</div><div className="lp-hero__stat-label">Unique sets</div></div>
            </div>
          </div>

          <div className="lp-anim" style={{ animationDelay: '0.15s' }}>
            <div className="lp-visual__deck">
              {sets.map((qs, i) => (
                <SetPaper key={i} label={i === 0 ? 'Set A' : 'Set B'} questions={qs} active={i === activeSet} />
              ))}
            </div>
            <div className="lp-visual__caption">
              <span className="lp-visual__caption-text">Same pattern · different questions</span>
              <button className="lp-shuffle-btn" onClick={handleReshuffle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7h4l3-3M3 17h4l3 3M21 7h-4l-3-3M21 17h-4l-3 3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Shuffle again
              </button>
            </div>
          </div>
        </section>

        <div className="lp-section-head" id="workflow">
          <div className="lp-section-tag">Roles</div>
          <h2 className="display">One bank, four people, zero overlap.</h2>
          <p>Each role sees exactly what it needs — modeled on how exam cells actually run.</p>
        </div>
        <section className="lp-section">
          <div className="lp-roles">
            <div className="lp-role">
              <div className="lp-role__letter display">Faculty</div>
              <div className="lp-role__name display">Writes</div>
              <div className="lp-role__desc">Adds and tags questions by topic, difficulty, and Bloom's level.</div>
            </div>
            <div className="lp-role">
              <div className="lp-role__letter display">HOD</div>
              <div className="lp-role__name display">Reviews</div>
              <div className="lp-role__desc">Approves or rejects with feedback before anything becomes usable.</div>
            </div>
            <div className="lp-role">
              <div className="lp-role__letter display">Exam Cell</div>
              <div className="lp-role__name display">Generates</div>
              <div className="lp-role__desc">Sets the pattern once, produces as many sets as the hall needs.</div>
            </div>
            <div className="lp-role">
              <div className="lp-role__letter display">Admin</div>
              <div className="lp-role__name display">Oversees</div>
              <div className="lp-role__desc">Manages departments, subjects, and access across every role.</div>
            </div>
          </div>
        </section>

        <div className="lp-section-head" id="features">
          <div className="lp-section-tag">Capabilities</div>
          <h2 className="display">Built for departments, not demos.</h2>
        </div>
        <section className="lp-section">
          <div className="lp-features">
            <div className="lp-feature">
              <div className="lp-feature__num">01</div>
              <div className="lp-feature__name display">Difficulty-aware shuffling</div>
              <div className="lp-feature__desc">Set a 30/50/20 easy-medium-hard split once — every generated set respects it automatically.</div>
            </div>
            <div className="lp-feature">
              <div className="lp-feature__num">02</div>
              <div className="lp-feature__name display">Multiple sets, same pattern</div>
              <div className="lp-feature__desc">Generate Set A through F in one click — same marks distribution, different questions in every seat.</div>
            </div>
            <div className="lp-feature">
              <div className="lp-feature__num">03</div>
              <div className="lp-feature__name display">Version history</div>
              <div className="lp-feature__desc">Every edit is snapshotted. Roll back to any earlier version in one click.</div>
            </div>
            <div className="lp-feature">
              <div className="lp-feature__num">04</div>
              <div className="lp-feature__name display">Print-ready PDF export</div>
              <div className="lp-feature__desc">Download any set, formatted the way an invigilator actually expects to see it.</div>
            </div>
          </div>
        </section>

        <section className="lp-cta">
          <div className="lp-cta__panel">
            {user ? (
              <>
                <h2 className="lp-cta__title display">Pick up right where you left off.</h2>
                <p className="lp-cta__sub">Your question bank and generated papers are waiting in your dashboard.</p>
                <Link to="/dashboard" className="lp-btn-primary">Go to dashboard →</Link>
              </>
            ) : (
              <>
                <h2 className="lp-cta__title display">Stop writing the same paper from scratch.</h2>
                <p className="lp-cta__sub">Set up your question bank in minutes — your first randomized paper is one click after that.</p>
                <Link to="/register" className="lp-btn-primary">Create your account →</Link>
              </>
            )}
          </div>
        </section>

        <footer className="lp-footer">
          <span>QBMS — Question Bank Management System</span>
          <span>Built for departments, not just demos</span>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
