import React, { useState, useEffect } from 'react';
import { transactionService, userService } from '../../services/api';
import api from '../../services/api';
import { Plus, X, Zap, ShoppingBag, Utensils, Bus, Landmark, Home as HomeIcon, Banknote, Briefcase, CheckCircle2, Info, AlertCircle } from 'lucide-react';

export default function TransactionsCard() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({ monthlySalary: 0, targetSavings: 0, incomeTaxPercentage: 0, loanEmis: 0, otherDeductions: 0 });
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [formData, setFormData] = useState({
    amount: '',
    categoryName: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isReminder: false
  });

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
    fetchUserDetails();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await transactionService.getAll();
      setTransactions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/user');
      if (res.data) {
        setCategories(res.data.filter(uc => uc.selected !== false).map(uc => uc.category).filter(Boolean));
        const budgets = {};
        res.data.forEach(uc => {
          if (uc.category) budgets[uc.category.id] = uc.customAmount || 0;
        });
        setCategoryBudgets(budgets);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await userService.getDetails();
      if (res.data) {
        setUserDetails({
          monthlySalary: res.data.monthlySalary || 0,
          targetSavings: res.data.targetSavings || 0,
          incomeTaxPercentage: res.data.incomeTaxPercentage || 0,
          loanEmis: res.data.loanEmis || 0,
          otherDeductions: res.data.otherDeductions || 0,
          housingRent: res.data.housingRent || 0,
          otherCustom: res.data.otherCustom || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load user details', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const matchedCategory = categories.find(c => c.name.toLowerCase() === formData.categoryName.toLowerCase());
    
    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        categoryName: formData.categoryName,
        date: formData.date,
        description: formData.description,
        type: formData.isReminder ? 'REMINDER' : 'EXPENSE',
        isReminder: formData.isReminder
      };
      await transactionService.add(payload);
      setFormData({ amount: '', categoryName: '', date: new Date().toISOString().split('T')[0], description: '', isReminder: false });
      await fetchTransactions();
    } catch (err) {
      console.error('Failed to add transaction', err);
      alert('Error adding transaction. Make sure backend is running.');
    }
    setLoading(false);
  };

  // Financial computations
  const taxAmount = userDetails.monthlySalary * (userDetails.incomeTaxPercentage / 100);
  const afterTaxSalary = userDetails.monthlySalary - taxAmount - userDetails.loanEmis - userDetails.otherDeductions - (userDetails.housingRent || 0) - (userDetails.otherCustom || 0);

  // Filter ONLY current month transactions for the balance display
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpent = currentMonthTxs.filter(t => t.type === 'EXPENSE' && !t.isReminder).reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = currentMonthTxs.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const remainingMoney = (afterTaxSalary + totalIncome) - totalSpent - userDetails.targetSavings;

  // Per-category spent (Current Month only)
  const spentByCategory = {};
  currentMonthTxs.filter(t => t.type === 'EXPENSE' && !t.isReminder).forEach(t => {
    const cid = t.category?.id;
    if (cid) spentByCategory[cid] = (spentByCategory[cid] || 0) + t.amount;
  });

  // Selected category budget info for the form
  const matchedCat = formData.categoryName ? categories.find(c => c.name.toLowerCase() === formData.categoryName.toLowerCase()) : null;
  const selectedCatId = matchedCat ? matchedCat.id : null;
  const selectedBudget = selectedCatId ? (categoryBudgets[selectedCatId] || 0) : 0;
  const spentInCat = selectedCatId ? (spentByCategory[selectedCatId] || 0) : 0;
  const catRemaining = selectedBudget - spentInCat;

  const getIconForCategory = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('hous') || n.includes('rent')) return <HomeIcon size={18} />;
    if (n.includes('sal') || n.includes('income')) return <Banknote size={18} />;
    if (n.includes('invest') || n.includes('save') || n.includes('sip')) return <Landmark size={18} />;
    if (n.includes('emi') || n.includes('loan')) return <Briefcase size={18} />;
    if (n.includes('food') || n.includes('din')) return <Utensils size={18} />;
    if (n.includes('travel') || n.includes('trans')) return <Bus size={18} />;
    return <ShoppingBag size={18} />;
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(240, 243, 245, 0.6)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', position: 'relative' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>Transactions</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>Manually record your expenses and track them against your budget.</p>

      {/* === MANUAL ENTRY FORM === */}
      <div style={{ background: 'var(--panel-bg)', borderRadius: '20px', padding: '28px 32px', marginBottom: '32px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Add Manual Entry</h2>
          <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-primary)', letterSpacing: '1px', background: 'rgba(58,46,202,0.1)', padding: '4px 10px', borderRadius: '6px' }}>MANUAL ENTRY</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr auto', gap: '16px', alignItems: 'end', marginBottom: '16px' }}>
            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Category</label>
              <input
                required
                type="text"
                placeholder="e.g. Food"
                value={formData.categoryName}
                onChange={e => setFormData({ ...formData, categoryName: e.target.value })}
                style={{ ...inputStyle }}
              />
            </div>

            {/* Amount */}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount (₹)</label>
              <input required type="number" min="1" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" style={inputStyle} />
            </div>

            {/* Date */}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={inputStyle} />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</label>
              <input required type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Grocery run" style={inputStyle} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ background: '#0F172A', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', height: '45px' }}
            >
              {loading ? '...' : <><Plus size={16} /> Add</>}
            </button>
          </div>

          {/* Reminder toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={formData.isReminder}
                onChange={e => setFormData({ ...formData, isReminder: e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
              />
              Save as Reminder (upcoming bill)
            </label>
          </div>
        </form>

        {/* Category Budget Context — shown when a category is selected */}
        {selectedCatId && selectedBudget > 0 && (
          <div style={{
            marginTop: '16px',
            background: catRemaining < 0 ? 'rgba(239,68,68,0.08)' : 'rgba(58,46,202,0.06)',
            border: `1px solid ${catRemaining < 0 ? 'rgba(239,68,68,0.25)' : 'rgba(58,46,202,0.2)'}`,
            borderRadius: '12px',
            padding: '14px 20px',
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} color={catRemaining < 0 ? '#EF4444' : 'var(--accent-primary)'} />
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>Category Budget Context</span>
            </div>
            {[
              { label: 'Monthly Budget', val: `₹${selectedBudget.toLocaleString('en-IN')}`, col: 'var(--text-primary)' },
              { label: 'Already Spent', val: `₹${spentInCat.toLocaleString('en-IN')}`, col: '#EF4444' },
              { label: 'Remaining in Category', val: `₹${catRemaining.toLocaleString('en-IN')}`, col: catRemaining < 0 ? '#EF4444' : '#10B981' },
            ].map(item => (
              <div key={item.label}>
                <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                <p style={{ fontSize: '16px', fontWeight: '800', color: item.col, margin: 0 }}>{item.val}</p>
              </div>
            ))}
            {catRemaining < 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '12px', fontWeight: '700' }}>
                <AlertCircle size={14} /> Over budget by ₹{Math.abs(catRemaining).toLocaleString('en-IN')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* === LAYOUT: History + Smart Sidebar === */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>

        {/* Transaction History */}
        <div style={{ background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Transaction History</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{transactions.length} total entries</p>
          </div>

          {/* Column Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.5fr 0.9fr 0.8fr 0.8fr', gap: '12px', padding: '12px 28px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            {['DATE', 'CATEGORY', 'DESCRIPTION', 'CAT. BUDGET', 'TYPE', 'AMOUNT'].map(h => (
              <span key={h} style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '1px' }}>{h}</span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <ShoppingBag size={32} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>No transactions yet. Add your first entry above!</p>
              </div>
            )}

            {transactions.map(t => {
              const catName = t.category?.name || 'General';
              const isInc = t.type === 'INCOME';
              const typeLabel = t.isReminder ? 'REMINDER' : (isInc ? 'INCOME' : 'EXPENSE');
              const budget = categoryBudgets[t.category?.id] || 0;

              let typeBg = 'rgba(240,243,245,0.8)', typeCol = 'var(--text-secondary)';
              if (t.isReminder) { typeBg = 'rgba(245,158,11,0.15)'; typeCol = '#D97706'; }
              else if (isInc) { typeBg = 'rgba(16,185,129,0.15)'; typeCol = '#059669'; }
              else if (t.type === 'EXPENSE') { typeBg = 'rgba(239,68,68,0.12)'; typeCol = '#DC2626'; }

              return (
                <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.5fr 0.9fr 0.8fr 0.8fr', gap: '12px', padding: '18px 28px', borderBottom: '1px solid rgba(0,0,0,0.03)', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    {new Date(t.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(58,46,202,0.07)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                      {getIconForCategory(catName)}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{catName}</span>
                  </div>

                  <span style={{ fontSize: '13px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description || '—'}</span>

                  {/* Category Budget column */}
                  <span style={{ fontSize: '12px', fontWeight: '700', color: budget > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                    {budget > 0 ? `₹${budget.toLocaleString('en-IN')}` : '—'}
                  </span>

                  <div>
                    <span style={{ fontSize: '9px', fontWeight: '800', background: typeBg, color: typeCol, padding: '3px 7px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                      {typeLabel}
                    </span>
                  </div>

                  <span style={{ fontSize: '15px', fontWeight: '800', color: isInc ? 'var(--success)' : 'var(--text-primary)', textAlign: 'right' }}>
                    {isInc ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '16px 28px', background: 'rgba(240,243,245,0.3)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '1px' }}>
              SHOWING {transactions.length} OF {transactions.length} ENTRIES
            </span>
          </div>
        </div>

        {/* Right Smart Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Smart Insight Card */}
          <div style={{ background: '#0F172A', borderRadius: '16px', padding: '28px', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.04 }}><Zap size={140} /></div>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#38BDF8', display: 'block', marginBottom: '6px' }}>Smart Insight</span>
            <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '28px' }}>
              After your salary, taxes, fixed deductions, and savings target — here's how much you have available.
            </p>
            <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '800', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>AVAILABLE BUFFER</span>
            <h2 style={{ fontSize: '34px', fontWeight: '800', color: remainingMoney < 0 ? '#EF4444' : 'white', margin: '0 0 20px 0' }}>
              ₹{Math.max(0, remainingMoney).toLocaleString('en-IN')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '12px' }}>
              {[
                { label: 'Net Income (after tax)', val: `₹${afterTaxSalary.toLocaleString('en-IN')}`, col: 'white' },
                { label: 'Tracked Expenses', val: `-₹${totalSpent.toLocaleString('en-IN')}`, col: '#EF4444' },
                { label: 'Savings Target', val: `-₹${userDetails.targetSavings.toLocaleString('en-IN')}`, col: '#F59E0B' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8' }}>
                  <span>{r.label}</span>
                  <span style={{ color: r.col, fontWeight: '600' }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Health */}
          <div style={{ background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px', boxShadow: 'var(--glass-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CheckCircle2 size={18} color="var(--success)" fill="rgba(16,185,129,0.2)" />
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>Financial Health</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: `${Math.min(100, Math.max(0, (totalSpent / (userDetails.monthlySalary || 1)) * 100))}%`, height: '100%', background: 'var(--success)', borderRadius: '4px' }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
              SCORE: {remainingMoney > 0 ? '820' : '640'}/900
            </span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '12px 0 0 0', lineHeight: '1.5' }}>
              {remainingMoney > 0 ? 'You are within your budget. Great work!' : 'You have exceeded your budget this month.'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
