import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShoppingCart, Home, Utensils, Bus, Zap, Stethoscope, Video, ShoppingBag, Dumbbell, GraduationCap, Plane, Bone, Shirt, Brush, UserCheck, Gift, Tv, Droplet, Landmark, ShieldAlert, HeartHandshake, Coffee, Calendar, Wrench, CheckCircle2, AlertTriangle } from 'lucide-react';

const CATEGORY_DATA = [
  { id: 1, name: 'Groceries', icon: ShoppingCart },
  { id: 2, name: 'Rent', icon: Home },
  { id: 3, name: 'Dining', icon: Utensils },
  { id: 4, name: 'Transport', icon: Bus },
  { id: 5, name: 'Utilities', icon: Zap },
  { id: 6, name: 'Healthcare', icon: Stethoscope },
  { id: 7, name: 'Entertainment', icon: Video },
  { id: 8, name: 'Shopping', icon: ShoppingBag },
  { id: 9, name: 'Gym', icon: Dumbbell },
  { id: 10, name: 'Education', icon: GraduationCap },
  { id: 11, name: 'Travel', icon: Plane },
  { id: 12, name: 'Pet Care', icon: Bone },
  { id: 13, name: 'Laundry', icon: Shirt },
  { id: 14, name: 'House Help', icon: Brush },
  { id: 15, name: 'Grooming', icon: UserCheck },
  { id: 16, name: 'Gifts', icon: Gift },
  { id: 17, name: 'Streaming', icon: Tv },
  { id: 18, name: 'Water', icon: Droplet },
  { id: 19, name: 'Taxes', icon: Landmark },
  { id: 20, name: 'Insurance', icon: ShieldAlert },
  { id: 21, name: 'Charity', icon: HeartHandshake },
  { id: 22, name: 'Coffee', icon: Coffee },
  { id: 23, name: 'Subscriptions', icon: Calendar },
  { id: 24, name: 'Maintenance', icon: Wrench },
];

export default function CategorySelector({ setActiveTab }) {
  const [categories] = useState(CATEGORY_DATA);
  const [selectedCats, setSelectedCats] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState({
    salary: 0,
    taxAmount: 0,
    loanEmis: 0,
    otherDeductions: 0,
    targetSavings: 0,
    afterTaxAndFixed: 0
  });

  useEffect(() => {
    // Fetch user details for balance calculation
    api.get('/user/details').then(res => {
      if (res.data) {
        const salary = res.data.monthlySalary || 0;
        const taxPct = res.data.incomeTaxPercentage || 0;
        const taxAmt = salary * (taxPct / 100);
        const afterTax = salary - taxAmt;
        const loans = res.data.loanEmis || 0;
        const other = (res.data.otherDeductions || 0) + (res.data.housingRent || 0) + (res.data.otherCustom || 0);
        const savings = res.data.targetSavings || 0;
        const afterFixed = afterTax - loans - other - savings;
        setUserProfile({
          salary,
          taxAmount: taxAmt,
          loanEmis: loans,
          otherDeductions: other,
          targetSavings: savings,
          afterTaxAndFixed: afterFixed
        });
      }
    }).catch(console.error);

    // Load existing user category selections
    api.get('/categories/user').then(response => {
      const dbSelections = {};
      response.data.forEach(uc => {
        if (uc && uc.category && uc.category.id) {
          dbSelections[uc.category.id] = { selected: uc.selected, range: uc.customAmount };
        }
      });
      setSelectedCats(dbSelections);
    }).catch(console.error);
  }, []);

  const toggleCategory = (id) => {
    setSaveSuccess(false);
    setSelectedCats(prev => {
      const isCurrentlySelected = prev[id]?.selected;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          selected: !isCurrentlySelected,
          range: prev[id]?.range || 500
        }
      };
    });
  };

  const handleRangeChange = (id, value) => {
    setSaveSuccess(false);
    setSelectedCats(prev => ({ ...prev, [id]: { ...prev[id], range: parseInt(value) } }));
  };

  const handleDeselectAll = () => {
    setSaveSuccess(false);
    setSelectedCats(prev => {
      const updated = {};
      Object.keys(prev).forEach(key => {
        updated[key] = { ...prev[key], selected: false };
      });
      return updated;
    });
  };

  const handleSaveCategories = async () => {
    setLoading(true);
    try {
      const payload = Object.keys(selectedCats).map(catId => ({
        categoryId: parseInt(catId),
        isSelected: selectedCats[catId].selected,
        customAmount: selectedCats[catId].range || 0
      }));
      await api.post('/categories/user', payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error saving categories. Ensure Categories exist in DB.');
    }
    setLoading(false);
  };

  const selectedCount = Object.values(selectedCats).filter(c => c.selected).length;
  const totalAllocated = Object.values(selectedCats)
    .filter(c => c.selected)
    .reduce((sum, c) => sum + (parseInt(c.range) || 0), 0);

  const remaining = userProfile.afterTaxAndFixed - totalAllocated;
  const usedPct = userProfile.afterTaxAndFixed > 0
    ? Math.min(100, (totalAllocated / userProfile.afterTaxAndFixed) * 100)
    : 0;
  const isOverBudget = remaining < 0;

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        @keyframes pulse-red { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        .range-slider { width: 100%; accent-color: var(--accent-primary); cursor: pointer; }
        .cat-btn { transition: all 0.18s ease; }
        .cat-btn:hover { transform: translateY(-2px); }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>Category Budgets</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Select your spending categories and assign monthly budget limits.</p>
      </div>

      {/* Balance Context Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Gross Salary', value: `₹${userProfile.salary.toLocaleString('en-IN')}`, color: 'var(--text-primary)', bg: 'var(--panel-bg)' },
          { label: 'After Tax & Deductions', value: `₹${(userProfile.salary - userProfile.taxAmount - userProfile.loanEmis - userProfile.otherDeductions).toLocaleString('en-IN')}`, color: '#F59E0B', bg: 'var(--panel-bg)' },
          { label: 'Allocated to Categories', value: `₹${totalAllocated.toLocaleString('en-IN')}`, color: 'var(--accent-primary)', bg: 'var(--panel-bg)' },
          {
            label: isOverBudget ? '⚠ Exceeds Budget!' : 'Remaining to Allocate',
            value: `₹${Math.abs(remaining).toLocaleString('en-IN')}`,
            color: isOverBudget ? '#EF4444' : '#10B981',
            bg: isOverBudget ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
            border: isOverBudget ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.2)'
          },
        ].map((item, i) => (
          <div key={i} style={{
            background: item.bg || 'var(--panel-bg)',
            border: item.border || '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: 'var(--glass-shadow)'
          }}>
            <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</p>
            <p style={{ fontSize: '22px', fontWeight: '800', color: item.color, margin: 0 }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Overall Progress Bar */}
      <div style={{ background: 'var(--panel-bg)', borderRadius: '16px', padding: '20px 28px', marginBottom: '32px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {selectedCount} categories selected &nbsp;·&nbsp; ₹{totalAllocated.toLocaleString('en-IN')} allocated
          </span>
          <span style={{ fontSize: '13px', fontWeight: '800', color: isOverBudget ? '#EF4444' : 'var(--text-secondary)' }}>
            {usedPct.toFixed(1)}% of budget used
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${usedPct}%`,
            height: '100%',
            background: isOverBudget ? '#EF4444' : usedPct > 80 ? '#F59E0B' : 'var(--accent-primary)',
            borderRadius: '4px',
            transition: 'width 0.3s ease, background 0.3s ease'
          }} />
        </div>
        {isOverBudget && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#EF4444', fontSize: '12px', fontWeight: '700' }}>
            <AlertTriangle size={14} /> You have exceeded your available budget by ₹{Math.abs(remaining).toLocaleString('en-IN')}. Please reduce some category amounts.
          </div>
        )}
      </div>

      {/* Category Grid */}
      <div style={{ background: 'var(--panel-bg)', borderRadius: '24px', padding: '32px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '24px' }}>
          Choose Your Spending Categories
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
          {categories.map(cat => {
            const isSelected = selectedCats[cat.id]?.selected;
            const Icon = cat.icon;
            const isHighBudget = cat.name === 'Education' || cat.name === 'Healthcare' || cat.name === 'Rent';
            const minVal = 500;
            const maxVal = isHighBudget ? 30000 : 10000;
            const range = selectedCats[cat.id]?.range || minVal;
            const hypotheticalRemaining = remaining - (isSelected ? 0 : range);

            return (
              <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className="cat-btn"
                  onClick={() => toggleCategory(cat.id)}
                  title={isSelected ? `₹${range.toLocaleString('en-IN')}/month` : 'Click to select'}
                  style={{
                    height: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    background: isSelected ? 'var(--accent-primary)' : 'rgba(240, 243, 245, 0.5)',
                    color: isSelected ? 'white' : 'var(--text-primary)',
                    border: isSelected ? 'none' : '1px solid var(--border-color)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px rgba(58, 46, 202, 0.3)' : 'none',
                  }}
                >
                  <Icon size={22} />
                  <span style={{ fontSize: '12px', fontWeight: '700', textAlign: 'center', lineHeight: '1.2' }}>{cat.name}</span>
                  {isSelected && (
                    <span style={{ fontSize: '11px', fontWeight: '800', opacity: 0.85 }}>₹{range.toLocaleString('en-IN')}</span>
                  )}
                </button>

                {isSelected && (
                  <div style={{ padding: '0 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="range"
                      min={minVal}
                      max={maxVal}
                      step={100}
                      value={range}
                      onChange={(e) => handleRangeChange(cat.id, e.target.value)}
                      className="range-slider"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>₹{minVal.toLocaleString()}</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-primary)' }}>₹{range.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>₹{(maxVal/1000).toFixed(0)}K</span>
                    </div>
                    {/* Show balance hint */}
                    <div style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      color: hypotheticalRemaining < 0 ? '#EF4444' : '#64748B',
                      background: hypotheticalRemaining < 0 ? 'rgba(239,68,68,0.07)' : 'rgba(0,0,0,0.04)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      width: '100%',
                      textAlign: 'center',
                      boxSizing: 'border-box'
                    }}>
                      Balance left: ₹{remaining.toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handleSaveCategories}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: saveSuccess ? 'rgba(16,185,129,0.12)' : 'var(--accent-primary)',
            color: saveSuccess ? '#10B981' : 'white',
            border: saveSuccess ? '1.5px solid #10B981' : 'none',
            padding: '14px 32px', borderRadius: '12px',
            fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: '0.2s'
          }}
        >
          {loading ? 'Saving...' : saveSuccess ? <><CheckCircle2 size={16} /> Saved!</> : 'Save Category Budgets'}
        </button>

        <button
          onClick={handleDeselectAll}
          style={{
            padding: '14px 24px', fontSize: '14px', background: 'transparent',
            border: '2px solid var(--border-color)', color: 'var(--text-secondary)',
            borderRadius: '12px', cursor: 'pointer', fontWeight: '600', transition: '0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
        >
          Deselect All
        </button>

        {setActiveTab && (
          <button
            onClick={async () => { await handleSaveCategories(); if (setActiveTab) setActiveTab('transactions'); }}
            style={{
              marginLeft: 'auto', padding: '14px 28px', fontSize: '14px',
              background: '#0F172A', color: 'white', border: 'none',
              borderRadius: '12px', cursor: 'pointer', fontWeight: '700', transition: '0.2s',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            Save & Go to Transactions →
          </button>
        )}
      </div>
    </div>
  );
}
