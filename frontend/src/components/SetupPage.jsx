import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, Home, Landmark, Plus, ArrowRight, Save, TrendingDown, Wallet, Lock } from 'lucide-react';
import { userService, transactionService } from '../services/api';

export default function SetupPage({ setActiveTab, onUserUpdated }) {
  const [formData, setFormData] = useState({
    fullName: '',
    monthlySalary: '',
    targetSavings: '',
    taxBracket: 0,
    loanEmi: '',
    housingRent: '',
    otherCustom: ''
  });
  const [totalSpent, setTotalSpent] = useState(0);
  const [showOtherDeduction, setShowOtherDeduction] = useState(false);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Fetch User Details
    userService.getDetails()
      .then(res => {
        if (res.data) {
          setFormData({
            fullName: res.data.fullName || '',
            monthlySalary: res.data.monthlySalary || '',
            targetSavings: res.data.targetSavings || '',
            taxBracket: res.data.incomeTaxPercentage || 0,
            loanEmi: res.data.loanEmis || '',
            housingRent: res.data.housingRent || '',
            otherCustom: res.data.otherCustom || ''
          });
          if (res.data.otherCustom && res.data.otherCustom > 0) setShowOtherDeduction(true);
        }
      })
      .catch(() => {});

    // Fetch Transactions to calculate current month's spending
    transactionService.getAll().then(res => {
      if (res.data) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const spent = res.data
          .filter(t => {
            const d = new Date(t.date);
            return !t.isReminder && t.type !== 'INCOME' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        
        setTotalSpent(spent);
      }
    }).catch(console.error);
  }, []);

  const handleChange = (name, value) => {
    setSaveSuccess(false);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Live calculation
  const salary = parseFloat(formData.monthlySalary) || 0;
  const taxAmount = salary * (formData.taxBracket / 100);
  const afterTax = salary - taxAmount;
  const loanEmi = parseFloat(formData.loanEmi) || 0;
  const housing = parseFloat(formData.housingRent) || 0;
  const other = parseFloat(formData.otherCustom) || 0;
  const totalDeductions = taxAmount + loanEmi + housing + other;
  const remainingBalance = afterTax - loanEmi - housing - other;
  const targetSavings = parseFloat(formData.targetSavings) || 0;
  const spendablePower = remainingBalance - targetSavings - totalSpent;

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      setMessage('Please enter your full name.');
      return;
    }
    setIsSaving(true);
    setMessage('');
    try {
      await userService.updateDetails({
        fullName: formData.fullName,
        monthlySalary: salary || 0,
        activeLoans: 0,
        loanEmis: loanEmi,
        housingRent: housing,
        otherCustom: other,
        targetSavings: targetSavings,
        incomeTaxPercentage: formData.taxBracket
      });
      setSaveSuccess(true);
      setMessage('Profile saved successfully!');
      if (onUserUpdated) onUserUpdated(); // refresh username in header
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Failed to save. Please try again.');
    }
    setIsSaving(false);
  };

  const handleNextStep = async () => {
    await handleSave();
    if (setActiveTab) setActiveTab('category');
  };

  return (
    <div style={{ width: '100%', animation: 'fadeIn 0.5s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .setup-container {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 48px;
          font-family: 'Inter', sans-serif;
        }

        .form-card {
          background: var(--panel-bg);
          border-radius: 24px;
          padding: 40px;
          border: 1px solid var(--border-color);
          box-shadow: var(--glass-shadow);
        }

        .input-label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          color: var(--text-secondary);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .big-input-wrap {
          background: rgba(240, 243, 245, 0.5);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid var(--border-color);
          transition: border-color 0.2s;
        }
        .big-input-wrap:focus-within { border-color: var(--accent-primary); }
        [data-theme="dark"] .big-input-wrap { background: rgba(0,0,0,0.25); }
        
        .big-input {
          background: transparent;
          border: none;
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          width: 100%;
          outline: none;
          font-family: 'Inter', sans-serif;
        }
        .big-input::placeholder { color: var(--text-secondary); opacity: 0.4; }

        .text-input {
          width: 100%;
          background: rgba(240, 243, 245, 0.5);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          outline: none;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .text-input:focus { border-color: var(--accent-primary); }
        [data-theme="dark"] .text-input { background: rgba(0,0,0,0.25); }

        .tax-btn {
          padding: 12px 8px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          flex: 1;
          text-align: center;
          transition: 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .tax-btn:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
        .tax-btn.active {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .deduction-row {
          display: flex;
          align-items: center;
          background: rgba(240, 243, 245, 0.4);
          border-radius: 10px;
          padding: 14px 20px;
          margin-bottom: 10px;
          border: 1px solid var(--border-color);
        }
        [data-theme="dark"] .deduction-row { background: rgba(0,0,0,0.2); }
        
        .deduction-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 16px;
          font-weight: 700;
          width: 100px;
          text-align: right;
          font-family: 'Inter', sans-serif;
        }
        .deduction-input::placeholder { color: var(--text-secondary); opacity: 0.4; }

        .add-btn {
          width: 100%;
          padding: 14px;
          border: 2px dashed var(--border-color);
          border-radius: 10px;
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          transition: 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .add-btn:hover { border-color: var(--accent-primary); color: var(--accent-primary); }

        @media (max-width: 960px) {
          .setup-container { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="setup-container">
        
        {/* LEFT COLUMN — Info + Live Balance */}
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.2', marginBottom: '8px' }}>
            Your Financial <br /><span style={{ color: 'var(--accent-primary)' }}>Profile</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '28px' }}>
            Enter your income, deductions, and savings goals. SaveMate calculates your true spending power in real-time.
          </p>

          {/* Secure & Private card */}
          <div style={{ background: 'var(--panel-bg)', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '34px', height: '34px', background: 'rgba(58, 46, 202, 0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Lock size={16} color="var(--accent-primary)" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>Secure & Private</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Your financial data is encrypted with JWT and stored securely. We never share or sell your personal information.
            </p>
          </div>

          {/* Why This Matters */}
          <div style={{ background: 'var(--panel-bg)', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '1px', display: 'block', marginBottom: '14px' }}>WHY THIS MATTERS</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Accurate, real-time spending power calculation',
                'Personalized budget limits per category',
                'Automated tax deduction estimation',
                'Tracks exactly how much you can safely spend'
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>
                  <CheckCircle2 size={16} color="var(--accent-primary)" style={{ marginTop: '1px', flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Live Balance Card */}
          <div style={{ background: '#0F172A', color: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}>
              <Wallet size={120} />
            </div>
            <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Monthly Spending Power</span>
            <h2 style={{ fontSize: '34px', fontWeight: '800', margin: '4px 0 4px 0', color: spendablePower < 0 ? '#EF4444' : '#34D399' }}>
              ₹{Math.max(0, spendablePower).toLocaleString('en-IN')}
            </h2>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 20px 0' }}>After tax, deductions & savings target</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#94A3B8' }}>Gross Salary</span>
                <span style={{ color: 'white', fontWeight: '700' }}>₹{salary.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#94A3B8' }}>Tax ({formData.taxBracket}%)</span>
                <span style={{ color: '#EF4444', fontWeight: '700' }}>-₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#94A3B8' }}>Fixed Deductions</span>
                <span style={{ color: '#EF4444', fontWeight: '700' }}>-₹{(loanEmi + housing + other).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#94A3B8' }}>Savings Target</span>
                <span style={{ color: '#F59E0B', fontWeight: '700' }}>-₹{targetSavings.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#94A3B8' }}>Month's Expenses</span>
                <span style={{ color: '#EF4444', fontWeight: '700' }}>-₹{totalSpent.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#94A3B8', fontWeight: '700' }}>Available to Spend</span>
                <span style={{ color: spendablePower >= 0 ? '#34D399' : '#EF4444', fontWeight: '800' }}>₹{Math.max(0, spendablePower).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Form */}
        <div>
          <div className="form-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{ width: '28px', height: '28px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '13px', fontWeight: '800', flexShrink: 0 }}>1</div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Personal & Financial Profile</h2>
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: '28px' }}>
              <label className="input-label">Full Name</label>
              <input 
                type="text" 
                value={formData.fullName} 
                onChange={e => handleChange('fullName', e.target.value)} 
                placeholder="Enter your name"
                className="text-input"
              />
            </div>

            {/* Salary + Target Savings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
              <div>
                <label className="input-label">Monthly Salary (Gross)</label>
                <div className="big-input-wrap">
                  <span style={{ fontSize: '20px', color: 'var(--text-secondary)', fontWeight: '600' }}>₹</span>
                  <input type="number" value={formData.monthlySalary} onChange={e => handleChange('monthlySalary', e.target.value)} placeholder="0" className="big-input" />
                </div>
              </div>
              <div>
                <label className="input-label">Target Savings / Month</label>
                <div className="big-input-wrap">
                  <span style={{ fontSize: '20px', color: 'var(--text-secondary)', fontWeight: '600' }}>₹</span>
                  <input type="number" value={formData.targetSavings} onChange={e => handleChange('targetSavings', e.target.value)} placeholder="0" className="big-input" />
                </div>
              </div>
            </div>

            {/* Tax Bracket */}
            <div style={{ marginBottom: '32px' }}>
              <label className="input-label">Income Tax Bracket</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[0, 5, 10, 20, 30].map(pct => (
                  <button key={pct} className={`tax-btn ${formData.taxBracket === pct ? 'active' : ''}`} onClick={() => handleChange('taxBracket', pct)}>
                    {pct}%
                  </button>
                ))}
              </div>
              {formData.taxBracket > 0 && (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', margin: '8px 0 0 0' }}>
                  Tax deduction: ₹{taxAmount.toLocaleString('en-IN')} / month
                </p>
              )}
            </div>

            {/* Deductions */}
            <div style={{ marginBottom: '32px' }}>
              <label className="input-label" style={{ marginBottom: '14px', display: 'block' }}>Monthly Deductions (EMIs, Rent, Other)</label>
              
              <div className="deduction-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div style={{ width: '32px', height: '32px', background: 'var(--panel-bg)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                    <Landmark size={16} color="var(--text-secondary)" />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Loan EMI</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>₹</span>
                  <input type="number" value={formData.loanEmi} onChange={e => handleChange('loanEmi', e.target.value)} placeholder="0" className="deduction-input" />
                </div>
              </div>

              <div className="deduction-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div style={{ width: '32px', height: '32px', background: 'var(--panel-bg)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                    <Home size={16} color="var(--text-secondary)" />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Housing / Rent</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>₹</span>
                  <input type="number" value={formData.housingRent} onChange={e => handleChange('housingRent', e.target.value)} placeholder="0" className="deduction-input" />
                </div>
              </div>

              {showOtherDeduction && (
                <div className="deduction-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--panel-bg)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                      <Plus size={16} color="var(--text-secondary)" />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Other</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>₹</span>
                    <input type="number" value={formData.otherCustom} onChange={e => handleChange('otherCustom', e.target.value)} placeholder="0" className="deduction-input" />
                  </div>
                </div>
              )}

              {!showOtherDeduction && (
                <button className="add-btn" onClick={() => setShowOtherDeduction(true)}>
                  <Plus size={15} /> Add Other Deduction
                </button>
              )}
            </div>

            {/* Actions */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: saveSuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(58, 46, 202, 0.08)', color: saveSuccess ? 'var(--success)' : 'var(--accent-primary)', border: `1.5px solid ${saveSuccess ? 'var(--success)' : 'var(--accent-primary)'}`, padding: '12px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: '0.2s', fontFamily: 'Inter, sans-serif' }}
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save Profile'}
                </button>
                {message && (
                  <span style={{ color: saveSuccess ? 'var(--success)' : '#EF4444', fontSize: '13px', fontWeight: '700' }}>{message}</span>
                )}
              </div>
              
              <button 
                onClick={handleNextStep}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0F172A', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: '0.2s', fontFamily: 'Inter, sans-serif' }}
              >
                Next: Categories <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
