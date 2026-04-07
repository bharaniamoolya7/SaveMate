import React from 'react';

export default function ExpenseCard() {
  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Expense Breakdown</h2>
      <div className="glass-panel" style={{ padding: '20px', marginTop: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '10px' }}>Category</th>
              <th style={{ padding: '10px' }}>Allocated Amount</th>
              <th style={{ padding: '10px' }}>Actual Spent</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px' }}>Housing (Rent)</td>
              <td style={{ padding: '10px' }}>₹15,000</td>
              <td style={{ padding: '10px' }}>₹15,000</td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>Groceries</td>
              <td style={{ padding: '10px' }}>₹5,000</td>
              <td style={{ padding: '10px' }}>₹4,500</td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>Dining Out</td>
              <td style={{ padding: '10px' }}>₹3,000</td>
              <td style={{ padding: '10px', color: 'var(--danger)' }}>₹4,200</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
