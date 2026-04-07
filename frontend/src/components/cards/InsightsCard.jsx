import React from 'react';
import { AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';

export default function InsightsCard() {
  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Smart Insights & Warnings</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--danger)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <AlertCircle color="var(--danger)" size={32} />
          <div>
            <h3 style={{ color: 'var(--danger)' }}>Dining Out limit exceeded!</h3>
            <p>You have spent ₹4,200 which is ₹1,200 over your allocated budget for dining.</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--warning)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <TrendingUp color="var(--warning)" size={32} />
          <div>
            <h3 style={{ color: 'var(--warning)' }}>EMI Warning</h3>
            <p>Your current EMIs constitute 25% of your Net Income. Try to keep this below 30%.</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--success)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <CheckCircle color="var(--success)" size={32} />
          <div>
            <h3 style={{ color: 'var(--success)' }}>Great Saving Track!</h3>
            <p>You are on track to save ₹10,000 this month. Keep it up!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
