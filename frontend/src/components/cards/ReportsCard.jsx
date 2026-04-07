import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { transactionService } from '../../services/api';
import api from '../../services/api';

export default function ReportsCard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCategories, setUserCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      transactionService.getAll(),
      api.get('/categories/user')
    ]).then(([txRes, catRes]) => {
      setTransactions(txRes.data || []);
      setUserCategories(catRes.data || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div style={{ padding: '40px' }}>Analyzing your wealth...</div>;

  // Process core logic strictly isolating Expenses
  const completed = transactions.filter(t => !t.isReminder && t.type === 'EXPENSE');

  let totalExpense = 0;
  completed.forEach(t => {
    totalExpense += t.amount;
  });

  // 1. Category Budgets: PieChart (Sum of all selected category amounts)
  const budgetPieData = userCategories
    .filter(c => (c.selected === true || c.isSelected === true) && c.customAmount > 0)
    .map(c => ({
      name: c.category?.name || 'Unnamed',
      value: parseFloat(c.customAmount) || 0
    }))
    .sort((a,b) => b.value - a.value);
  
  const totalBudget = budgetPieData.reduce((sum, item) => sum + item.value, 0);
  const BUDGET_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899'];

  // 2. Expense Distribution: Pie Chart (Amount spent per transaction category)
  const spendCatStats = completed.reduce((acc, t) => {
    const cName = t.category?.name || 'Other';
    if (!acc[cName]) acc[cName] = { name: cName, value: 0 };
    acc[cName].value += t.amount;
    return acc;
  }, {});
  const spendPieData = Object.values(spendCatStats).sort((a,b) => b.value - a.value);
  const SPEND_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#06B6D4', '#6366F1'];

  // 3. Yearly Monthly Spending: Bar Graph (Jan to Dec)
  const currentYear = 2026;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const janToDecData = monthNames.map((month, i) => ({ month, Spent: 0, index: i }));
  completed.forEach(t => {
    const d = new Date(t.date);
    if (d.getFullYear() === currentYear) {
      const monthIdx = d.getMonth();
      janToDecData[monthIdx].Spent += t.amount;
    }
  });

  // 4. All Months Summary (For the list below the graph)
  const monthlyStats = completed.reduce((acc, t) => {
    const d = new Date(t.date);
    const month = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = { month, Expenses: 0, timestamp: d.getTime() };
    acc[month].Expenses += t.amount;
    return acc;
  }, {});
  const allMonthsSorted = Object.values(monthlyStats).sort((a,b) => b.timestamp - a.timestamp);

  const remainingOverall = totalBudget - totalExpense;

  return (
    <div id="report-card-container" style={{ animation: 'fadeIn 0.5s ease', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent-primary)', margin: 0 }}>Expense Analytics Report</h1>
      </div>

      {/* Top Section: Budget Distribution Pie Chart */}
      <div style={{ marginBottom: '32px' }}>
        
        {/* 1. Category Budgets Pie Chart (Selected Sum) */}
        <div style={{ background: 'var(--panel-bg)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)', display: 'flex', flexDirection: 'column', maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>Budget Distribution</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Total sum of all your selected category budgets.</p>
          
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '280px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetPieData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                    {budgetPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={BUDGET_COLORS[index % BUDGET_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} contentStyle={{borderRadius: '8px', border: 'none'}} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>₹{totalBudget.toLocaleString()}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>TOTAL BUDGET</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Grid: Yearly Spending Bar Graph (Jan - Dec) */}
      <div style={{ background: 'var(--panel-bg)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>Spending Overview 2026</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '32px' }}>Tracking structural expense volume from January to December.</p>
        
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={janToDecData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--text-secondary)'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--text-secondary)'}} width={40} />
              <Tooltip cursor={{fill: 'rgba(58, 46, 202, 0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', background: 'white', color: 'black'}} />
              <Bar dataKey="Spent" fill="var(--accent-primary)" radius={[6,6,0,0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Month Summary List */}
      <div style={{ background: 'var(--panel-bg)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>Monthly Spending History</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allMonthsSorted.length > 0 ? allMonthsSorted.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{item.month}</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-primary)' }}>₹{item.Expenses.toLocaleString()}</span>
            </div>
          )) : (
            <div style={{ opacity: 0.5, fontSize: '13px', textAlign: 'center', padding: '20px' }}>No history available.</div>
          )}
        </div>
      </div>

    </div>
  );
}
