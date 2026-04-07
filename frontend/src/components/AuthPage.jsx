import React, { useState } from 'react';
import { Wallet, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';

export default function AuthPage({ theme, toggleTheme, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return setError("Please fill all fields.");
    setError(''); setMessage(''); setLoading(true);
    try {
      if (isLogin) {
        const res = await authService.login(formData.username, formData.password);
        localStorage.setItem('token', res.data.token);
        onLoginSuccess();
      } else {
        await authService.register(formData.username, formData.password);
        setIsLogin(true);
        setMessage('Account created! Please sign in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', transition: 'background-color 0.3s ease', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .landing-container {
          font-family: 'Inter', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 0;
        }
        .btn-outline {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-weight: 600;
          cursor: pointer;
          padding: 10px 20px;
        }
        .hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: center;
          margin: auto 0;
        }
        .auth-card {
          background: var(--panel-bg);
          border: 1px solid var(--border-color);
          box-shadow: var(--glass-shadow);
          padding: 40px;
          border-radius: 24px;
        }
        .auth-input {
          width: 100%;
          padding: 14px 16px;
          margin-bottom: 16px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: rgba(240, 243, 245, 0.4);
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
        }
        [data-theme="light"] .auth-input { background: #F8FAFC; }
        [data-theme="dark"] .auth-input { background: rgba(0,0,0,0.2); }

        .hero-title {
          font-size: 50px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -1px;
        }
        .hero-accent { color: var(--accent-primary); }

        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; padding-bottom: 40px; }
        }
      `}</style>

      <div className="landing-container">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={24} color="var(--accent-primary)" />
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-primary)', letterSpacing: '-0.5px' }}>SaveMate</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn-outline" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button className="btn-outline" onClick={() => setIsLogin(true)}>Login</button>
            <button className="btn-primary" onClick={() => setIsLogin(false)} style={{ padding: '10px 24px', width: 'auto', borderRadius: '8px' }}>Get Started</button>
          </div>
        </header>

        <div className="hero">
          <div className="auth-card">
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {isLogin ? 'Welcome Back' : 'Join SaveMate'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              {isLogin ? 'Enter your credentials to access your dashboard.' : 'Start managing your personal finances with ease.'}
            </p>

            {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '600' }}>{error}</div>}
            {message && <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '600' }}>{message}</div>}

            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email / Username</label>
              <input type="text" className="auth-input" placeholder="name@example.com" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />

              <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{isLogin ? 'Password' : 'Create Password'}</label>
              <input type="password" className="auth-input" placeholder="Min. 8 characters" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '12px', fontSize: '15px', marginTop: '12px', boxShadow: '0 8px 20px rgba(58, 46, 202, 0.25)' }}>
                {loading ? 'Processing...' : (isLogin ? 'Log In to Dashboard' : 'Create Free Account')}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '24px' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--accent-primary)', fontWeight: '700', cursor: 'pointer' }}>
                {isLogin ? 'Sign Up' : 'Log In'}
              </span>
            </p>
          </div>

          <div>
            <h1 className="hero-title" style={{ marginBottom: '20px' }}>
              Master your money <br /><span className="hero-accent">with confidence.</span>
            </h1>

            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px', maxWidth: '420px' }}>
              SaveMate is your personal finance companion. Set income, track deductions, assign category budgets, log transactions, and visualize your spending — all in one secure place.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                'Real-time spending power after all deductions',
                'Secure & private — JWT-protected, data never shared',
                'Set payment reminders & category budget limits',
                'Visual graphs showing exactly where money goes',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600' }}>
                  <CheckCircle2 color="var(--accent-primary)" size={20} fill="rgba(58, 46, 202, 0.2)" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>© 2026 SaveMate. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--success)' }}>🔒 SECURE CONNECTION</span>
          </div>
        </div>
      </div>
    </div>
  );
}
