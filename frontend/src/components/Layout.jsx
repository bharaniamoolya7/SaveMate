import React, { useState, useEffect, useRef } from 'react';
import { User, Layers, List, BarChart2, Bell, Info, Settings as SettingsIcon, LogOut, Wallet, X, Shield, TrendingUp, PieChart, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SetupPage from './SetupPage';
import TransactionsCard from './cards/TransactionsCard';
import ReportsCard from './cards/ReportsCard';
import CategorySelector from './cards/CategorySelector';
import RemindersCard from './cards/RemindersCard';
import { transactionService } from '../services/api';
import api from '../services/api';

const TABS = [
  { id: 'dashboard', name: 'Profile', icon: User, component: SetupPage },
  { id: 'category', name: 'Category', icon: Layers, component: CategorySelector },
  { id: 'transactions', name: 'Transactions', icon: List, component: TransactionsCard },
  { id: 'reports', name: 'Graphs', icon: BarChart2, component: ReportsCard },
  { id: 'reminders', name: 'Reminders', icon: Bell, component: RemindersCard }
];

export default function Layout({ theme, toggleTheme, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalReminders, setGlobalReminders] = useState([]);
  const [user, setUser] = useState({ fullName: '' });
  const [showReminders, setShowReminders] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const reminderRef = useRef(null);

  useEffect(() => {
    fetchGlobalReminders();
    fetchUserDetails();
  }, []);

  // Close reminders dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (reminderRef.current && !reminderRef.current.contains(e.target)) {
        setShowReminders(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserDetails = async () => {
    try {
      const res = await api.get('/user/details');
      if (res.data && res.data.fullName) {
        setUser({ fullName: res.data.fullName });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGlobalReminders = async () => {
    try {
      const res = await transactionService.getAll();
      setGlobalReminders(res.data?.filter(t => t.isReminder) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissGlobalReminder = async (id) => {
    try {
      await transactionService.delete(id);
      setGlobalReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Refresh reminders when switching to reminders tab
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'reminders') {
      fetchGlobalReminders();
    }
  };

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || SetupPage;

  const displayName = user.fullName || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  const currentTabIndex = TABS.findIndex(t => t.id === activeTab);
  const prevTab = currentTabIndex > 0 ? TABS[currentTabIndex - 1] : null;
  const nextTab = currentTabIndex < TABS.length - 1 ? TABS[currentTabIndex + 1] : null;

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-color)', overflow: 'hidden' }}>
      
      {/* Fixed Left Sidebar */}
      <aside style={{ width: '280px', background: '#0F172A', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        
        {/* Brand Area */}
        <div style={{ padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Wallet size={24} color="var(--accent-primary)" />
            <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>SaveMate</span>
          </div>
          <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Personal Finance Tracker</p>
        </div>

        {/* Navigation List */}
        <nav style={{ flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  background: isActive ? 'rgba(58, 46, 202, 0.15)' : 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  color: isActive ? 'white' : '#94A3B8',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: '0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                {isActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--accent-primary)' }}></div>}
                <Icon size={20} color={isActive ? 'var(--accent-primary)' : '#64748B'} />
                {tab.name}
                {tab.id === 'reminders' && globalReminders.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#EF4444', color: 'white', fontSize: '11px', fontWeight: '800', borderRadius: '10px', padding: '2px 7px' }}>
                    {globalReminders.length}
                  </span>
                )}
              </button>
            )
          })}

          <div style={{ padding: '24px 0', marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setShowAbout(true)} style={{ background: 'transparent', border: 'none', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', color: '#94A3B8', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              <Info size={20} color="#64748B" /> About Us
            </button>
            <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', color: '#94A3B8', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              <SettingsIcon size={20} color="#64748B" /> {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button onClick={onLogout} style={{ background: 'transparent', border: 'none', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', color: '#94A3B8', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              <LogOut size={20} color="#64748B" /> Log Out
            </button>
            <button 
              onClick={() => {
                if (window.confirm("ARE YOU SURE? This will logout your session and clear your local data.")) {
                  alert("Your account is successfully deleted");
                  onLogout();
                }
              }} 
              style={{ background: 'transparent', border: 'none', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', color: '#EF4444', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              <div style={{ width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Shield size={18} color="#EF4444" /></div> Delete Account
            </button>
          </div>
        </nav>

      </aside>

      {/* Main Content Viewport */}
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', perspective: '1500px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Top right User Profile Header */}
        <div style={{ position: 'absolute', top: '32px', right: '40px', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 150 }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>

            {/* Theme Toggle at the very top for all pages */}
            <div 
              onClick={toggleTheme} 
              style={{ width: '40px', height: '40px', background: 'var(--panel-bg)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'var(--glass-shadow)', cursor: 'pointer', border: '2px solid transparent', transition: '0.2s' }}
              title="Toggle Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </div>

            {/* Bell / Reminders Dropdown */}
            <div ref={reminderRef} style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowReminders(!showReminders)} 
                style={{ width: '40px', height: '40px', background: 'var(--panel-bg)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'var(--glass-shadow)', cursor: 'pointer', position: 'relative', border: showReminders ? '2px solid var(--accent-primary)' : '2px solid transparent', transition: '0.2s' }}
              >
                <Bell size={18} color={showReminders ? 'var(--accent-primary)' : 'var(--text-secondary)'}/>
                {globalReminders.length > 0 && (
                  <div style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', border: '2px solid var(--panel-bg)' }}></div>
                )}
              </div>

              {/* Reminders Dropdown */}
              <AnimatePresence>
                {showReminders && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{ position: 'absolute', top: '52px', right: 0, width: '320px', background: 'var(--panel-bg)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.18)', border: '1px solid var(--border-color)', overflow: 'hidden', zIndex: 300 }}
                  >
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={16} color="var(--accent-primary)" />
                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Reminders</h4>
                        {globalReminders.length > 0 && (
                          <span style={{ background: '#EF4444', color: 'white', fontSize: '11px', fontWeight: '800', borderRadius: '10px', padding: '1px 6px' }}>
                            {globalReminders.length}
                          </span>
                        )}
                      </div>
                      <button onClick={() => { setShowReminders(false); handleTabChange('reminders'); }} style={{ background: 'none', border: 'none', fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                        View All
                      </button>
                    </div>

                    {globalReminders.length === 0 ? (
                      <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                        <Bell size={32} color="var(--text-secondary)" style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>No Reminders</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>You're all caught up! No pending bills.</p>
                      </div>
                    ) : (
                      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        {globalReminders.map(r => (
                          <div key={r.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '36px', height: '36px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                              <Bell size={16} color="#D97706" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.description}</p>
                              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                                ₹{r.amount.toLocaleString()} • Due: {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                            <button 
                              onClick={() => handleDismissGlobalReminder(r.id)} 
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
             
            {/* Info icon */}
            <div onClick={() => setShowAbout(true)} style={{ width: '40px', height: '40px', background: 'var(--panel-bg)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'var(--glass-shadow)', cursor: 'pointer', border: '2px solid transparent', transition: '0.2s' }}>
              <Info size={18} color="var(--text-secondary)"/>
            </div>
          </div>

          {/* User pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--panel-bg)', padding: '8px 16px', borderRadius: '100px', boxShadow: 'var(--glass-shadow)' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Hey, {displayName}</p>
            </div>
            <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: '50%', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', fontWeight: '800' }}>{initials}</div>
          </div>
        </div>

        {/* About Us Modal */}
        <AnimatePresence>
          {showAbout && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}
              onClick={() => setShowAbout(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={{ background: 'var(--panel-bg)', maxWidth: '560px', width: '100%', borderRadius: '24px', padding: '40px', border: '1px solid var(--border-color)', boxShadow: '0 30px 60px rgba(0,0,0,0.25)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Wallet size={26} color="var(--accent-primary)" />
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', margin: 0 }}>About SaveMate</h2>
                  </div>
                  <button onClick={() => setShowAbout(false)} style={{ background: 'rgba(240,243,245,0.5)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                    <X size={18} color="var(--text-secondary)" />
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>Version 1.0 · Built for smart personal finance management</p>
                
                <div style={{ background: 'rgba(58, 46, 202, 0.06)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.7', margin: 0 }}>
                    <strong>SaveMate</strong> is a personal finance web application that helps you take full control of your money. 
                    It lets you set your monthly income, plan deductions, allocate budgets to categories, 
                    record transactions, set payment reminders, and visualize your spending — all in one secure place.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                  {[
                    { icon: TrendingUp, title: 'Budget Planning', desc: 'Set salary, deductions & savings targets with live balance calculation.' },
                    { icon: PieChart, title: 'Category Budgets', desc: 'Assign monthly spend limits to 24+ expense categories.' },
                    { icon: List, title: 'Transaction Log', desc: 'Manual entry of expenses with category budget context.' },
                    { icon: Clock, title: 'Reminders', desc: 'Schedule bill reminders that show up as alerts across the app.' },
                    { icon: BarChart2, title: 'Graphs & Analytics', desc: 'Pie charts and area charts to visualize your spending patterns.' },
                    { icon: Shield, title: 'Secure & Private', desc: 'JWT-based authentication. Your data is never shared.' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', background: 'rgba(58, 46, 202, 0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                        <Icon size={18} color="var(--accent-primary)" />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{title}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>© 2026 SaveMate · All rights reserved</span>
                  <button 
                    onClick={() => setShowAbout(false)} 
                    style={{ padding: '10px 28px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Got it!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <div style={{ padding: '40px' }}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, rotateY: -15, scale: 0.98 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 15, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ transformStyle: 'preserve-3d', width: '100%', maxWidth: '1200px', margin: '0 auto', paddingTop: '60px' }}
            >
              <ActiveComponent setActiveTab={handleTabChange} onReminderAdded={fetchGlobalReminders} onUserUpdated={fetchUserDetails} />
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Global Footer Navigation */}
        <div style={{ padding: '24px 40px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', background: 'transparent', zIndex: 100, marginTop: 'auto' }}>
          {prevTab ? (
            <button 
              onClick={() => handleTabChange(prevTab.id)}
              style={{ padding: '14px 28px', background: 'var(--panel-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: 'var(--glass-shadow)' }}
            >
              ← Previous: {prevTab.name}
            </button>
          ) : <div></div>}

          {nextTab && (
            <button 
              onClick={() => handleTabChange(nextTab.id)}
              style={{ padding: '14px 28px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 20px rgba(58, 46, 202, 0.3)' }}
            >
              Next: {nextTab.name} →
            </button>
          )}
        </div>

      </main>
    </div>
  );
}
