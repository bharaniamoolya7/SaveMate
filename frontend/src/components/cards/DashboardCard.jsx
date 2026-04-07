import React from 'react';

export default function DashboardCard() {
  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Dashboard Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Net Income</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>₹43,000</p>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Total Expenses</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>₹25,000</p>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Target Savings</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>₹10,000</p>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Remaining Balance</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>₹8,000</p>
        </div>
      </div>
      <div className="glass-panel" style={{ marginTop: '20px', padding: '20px' }}>
        <h3>50/30/20 Rule Analysis</h3>
        <p style={{ marginTop: '10px' }}>Needs (50%): Ideal = ₹21,500 | Current = ₹20,000 (Excellent)</p>
        <p>Wants (30%): Ideal = ₹12,900 | Current = ₹5,000 (Excellent)</p>
        <p>Savings (20%): Ideal = ₹8,600 | Current = ₹10,000 (Target Exceeds minimum)</p>
      </div>
    </div>
  );
}
