import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444',
  '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1',
  '#14B8A6', '#FBBF24', '#A78BFA', '#34D399', '#FB923C',
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div style={{
        background: 'var(--panel-bg)', border: '1px solid var(--border-color)',
        borderRadius: '12px', padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
      }}>
        <p style={{ margin: '0 0 4px', fontWeight: '800', fontSize: '14px', color: 'var(--text-primary)' }}>{d.name}</p>
        <p style={{ margin: 0, fontWeight: '700', fontSize: '16px', color: d.payload.fill }}>₹{d.value.toLocaleString('en-IN')}</p>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>{d.payload.pct}% of total budget</p>
      </div>
    );
  }
  return null;
};

export default function GraphsCard() {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBudget, setTotalBudget] = useState(0);

  useEffect(() => {
    api.get('/categories/user').then(res => {
      const selected = (res.data || []).filter(uc => (uc.selected === true || uc.isSelected === true) && uc.customAmount > 0);
      const total = selected.reduce((sum, uc) => sum + (parseFloat(uc.customAmount) || 0), 0);
      setTotalBudget(total);
      const data = selected.map((uc, i) => ({
        name: uc.category?.name || 'Unknown',
        value: uc.customAmount || 0,
        pct: total > 0 ? ((uc.customAmount / total) * 100).toFixed(1) : '0',
        fill: COLORS[i % COLORS.length],
      })).sort((a, b) => b.value - a.value);
      setCategoryData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading category data…</p>
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>No Category Budgets Set</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Go to the <strong>Category</strong> page, select your spending categories and assign budget amounts — then come back here to see your pie chart.
        </p>
      </div>
    );
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, pct }) => {
    if (parseFloat(pct) < 4) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={800}>
        {pct}%
      </text>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>Expense Analytics</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Visual breakdown of your monthly category budget allocations.</p>
      </div>

      {/* Total Budget Stat */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--panel-bg)', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)' }}>
          <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Monthly Budget</p>
          <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent-primary)', margin: 0 }}>₹{totalBudget.toLocaleString('en-IN')}</p>
        </div>
        <div style={{ background: 'var(--panel-bg)', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)' }}>
          <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Categories Budgeted</p>
          <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{categoryData.length}</p>
        </div>
        <div style={{ background: 'var(--panel-bg)', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)' }}>
          <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg. Per Category</p>
          <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            ₹{Math.round(totalBudget / categoryData.length).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Main Grid: Pie + Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>

        {/* Pie Chart Panel */}
        <div style={{ background: 'var(--panel-bg)', borderRadius: '24px', padding: '32px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Category Budget Distribution</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 28px 0' }}>Monthly amounts assigned per category in the Categories page.</p>

          <div style={{ height: '380px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend / Breakdown Panel */}
        <div style={{ background: 'var(--panel-bg)', borderRadius: '24px', padding: '32px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)', overflowY: 'auto', maxHeight: '520px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 24px 0' }}>Budget Breakdown</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categoryData.map((cat, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.fill, flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{cat.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: cat.fill }}>₹{cat.value.toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '6px' }}>({cat.pct}%)</span>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.pct}%`, height: '100%', background: cat.fill, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Allocated</span>
              <span style={{ color: 'var(--accent-primary)' }}>₹{totalBudget.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
