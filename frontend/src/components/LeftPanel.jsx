import React, { useState, useEffect } from 'react';
import { Sun, Moon, PiggyBank, LogOut, CheckCircle } from 'lucide-react';
import { userService } from '../services/api';

export default function LeftPanel({ theme, toggleTheme, onLogout, onDataUpdated }) {
  const [formData, setFormData] = useState({
    monthlySalary: 0,
    loanEmis: 0,
    otherDeductions: 0,
    incomeTaxPercentage: 0,
    targetSavings: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch existing user details on mount
    userService.getDetails()
      .then(res => {
        if (res.data) setFormData({
          monthlySalary: res.data.monthlySalary || 0,
          loanEmis: res.data.loanEmis || 0,
          otherDeductions: res.data.otherDeductions || 0,
          incomeTaxPercentage: res.data.incomeTaxPercentage || 0,
          targetSavings: res.data.targetSavings || 0
        });
      })
      .catch(err => console.error("Could not fetch user details"));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setLoading(true);
    setMessage('');
    try {
      await userService.updateDetails(formData);
      setMessage('Updated Successfully!');
      if (onDataUpdated) onDataUpdated(formData);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error updating');
    }
    setLoading(false);
  };

  return (
    <div className="left-panel glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="title-gradient" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PiggyBank /> SaveMate
        </h2>
        <div>
          <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', marginLeft: '10px' }} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>Monthly Salary (₹)</label>
        <input type="number" name="monthlySalary" className="input-field" value={formData.monthlySalary} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Loan / EMIs (₹)</label>
        <input type="number" name="loanEmis" className="input-field" value={formData.loanEmis} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Other Deductions (₹)</label>
        <input type="number" name="otherDeductions" className="input-field" value={formData.otherDeductions} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Income Tax (%)</label>
        <select name="incomeTaxPercentage" className="input-field" value={formData.incomeTaxPercentage} onChange={handleChange}>
          <option value={0}>0%</option>
          <option value={5}>5%</option>
          <option value={10}>10%</option>
          <option value={20}>20%</option>
          <option value={30}>30%</option>
        </select>
      </div>

      <div className="form-group">
        <label>Target Savings (₹)</label>
        <input type="number" name="targetSavings" className="input-field" value={formData.targetSavings} onChange={handleChange} />
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {message && (
          <div style={{ color: 'var(--success)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <CheckCircle size={16} /> {message}
          </div>
        )}
        <button className="btn-primary" onClick={handleUpdate} disabled={loading}>
          {loading ? 'Updating...' : 'Update Financials'}
        </button>
      </div>
    </div>
  );
}
