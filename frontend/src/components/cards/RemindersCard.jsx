import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/api';
import { Bell, CheckCircle2, Clock, CalendarDays, Plus, Trash2 } from 'lucide-react';

export default function RemindersCard() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await transactionService.getAll();
      if (res.data) {
        setReminders(res.data.filter(t => t.isReminder));
      }
    } catch (err) {
      console.error('Error fetching reminders', err);
    }
    setLoading(false);
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    
    try {
      await transactionService.add({
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        type: 'EXPENSE',
        isReminder: true
      });
      setFormData({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      await fetchReminders();
    } catch (err) {
      console.error(err);
      alert('Error creating reminder');
    }
  };

  const handleCloseReminder = async (id) => {
    try {
      await transactionService.delete(id);
      await fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', position: 'relative' }}>
      
      {/* Header View */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent-primary)', marginBottom: '8px' }}>Your Reminders</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Track upcoming bills and payments seamlessly.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
        
        {/* ADD REMINDER PUSH FORM */}
        <div style={{ background: 'var(--panel-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '32px', boxShadow: 'var(--glass-shadow)', height: 'fit-content' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>Create Alert</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '32px' }}>This will trigger a global pop-up until paid.</p>

          <form onSubmit={handleAddReminder} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '1px' }}>DESCRIPTION</label>
              <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. Electricity Bill on 20th" style={{ width: '100%', background: 'rgba(240, 243, 245, 0.6)', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '1px' }}>ESTIMATED AMOUNT (₹)</label>
              <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="2000" style={{ width: '100%', background: 'rgba(240, 243, 245, 0.6)', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '1px' }}>DUE DATE</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', background: 'rgba(240, 243, 245, 0.6)', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', outline: 'none' }} />
            </div>

            <button type="submit" style={{ marginTop: '16px', background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 16px rgba(58, 46, 202, 0.2)' }}>
              <Plus size={18} /> Schedule Reminder
            </button>
          </form>
        </div>

        {/* PENDING LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading && <p>Loading reminders...</p>}
          
          {!loading && reminders.length === 0 && (
            <div style={{ background: 'var(--panel-bg)', borderRadius: '24px', padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>All Caught Up!</h3>
              <p style={{ fontSize: '14px' }}>You have no pending bills or upcoming reminders scheduled.</p>
            </div>
          )}

          {reminders.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-bg)', padding: '24px 32px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)', color: '#D97706', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Bell size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>{r.description}</h3>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarDays size={14} /> {new Date(r.date).toLocaleDateString()}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Pending</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>₹{r.amount.toLocaleString()}</span>
                <button onClick={() => handleCloseReminder(r.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: '0.2s' }}>
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}
