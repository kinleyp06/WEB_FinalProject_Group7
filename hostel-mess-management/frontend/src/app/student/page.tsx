'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import useWebSocket from '@/hooks/useWebSocket';
import api from '@/lib/api';

const STARS = [1, 2, 3, 4, 5];

const C = {
  bg:        '#0f1a0f',
  panel:     '#1a2e1a',
  panelAlt:  '#152215',
  border:    '#2d5a2d',
  text:      '#e8f5e9',
  textMuted: '#558b57',
  accent:    '#a5d6a7',
  accentMid: '#81c784',
  accentDim: '#66bb6a',
  danger:    '#ef5350',
  warn:      '#f59e0b',
  input:     '#0f1a0f',
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: C.input, border: `1px solid ${C.border}`,
  borderRadius: '6px', padding: '0.6rem 0.9rem', color: C.text,
  fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box',
  outline: 'none',
};

const btnPrimary: React.CSSProperties = {
  background: C.panelAlt, border: `1px solid ${C.accentDim}`, color: C.accentDim,
  padding: '0.5rem 1.4rem', borderRadius: '4px', cursor: 'pointer',
  fontSize: '0.9rem', fontFamily: 'inherit',
};

export default function StudentDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  useWebSocket();

  const [meals, setMeals] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [tab, setTab] = useState('meals');
  const [feedbackForm, setFeedbackForm] = useState({ mealPlanId: '', rating: 5, comment: '', mealType: 'lunch' });
  const [suggestionText, setSuggestionText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') { router.push('/'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    try {
      const [m, a, f, s] = await Promise.all([
        api.get('/api/meals'), api.get('/api/announcements'),
        api.get('/api/feedback'), api.get('/api/suggestions'),
      ]);
      setMeals(m.data); setAnnouncements(a.data);
      setFeedbacks(f.data); setSuggestions(s.data);
    } catch { toast.error('Failed to load data'); }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.mealPlanId) return toast.error('Select a meal first');
    setLoading(true);
    try {
      await api.post('/api/feedback', { ...feedbackForm, mealPlanId: parseInt(feedbackForm.mealPlanId) });
      toast.success('Feedback submitted!');
      setFeedbackForm({ mealPlanId: '', rating: 5, comment: '', mealType: 'lunch' });
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const submitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    setLoading(true);
    try {
      await api.post('/api/suggestions', { content: suggestionText });
      toast.success('Suggestion submitted!');
      setSuggestionText(''); fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); toast.success('Logged out'); router.push('/'); };

  const TABS = [
    { key: 'meals',       icon: '🍛', label: 'Meal Plan' },
    { key: 'feedback',    icon: '⭐', label: 'Give Feedback' },
    { key: 'suggestions', icon: '💡', label: 'Suggestions' },
    { key: 'history',     icon: '📋', label: 'My History' },
    { key: 'polls',       icon: '🗳️', label: 'Special Polls' },
  ];

  const statusColor: Record<string, string> = {
    IMPLEMENTED: C.accentDim, REVIEWED: '#3b82f6', FLAGGED: C.danger, PENDING: C.warn,
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Georgia', serif" }}>
      <Toaster position="top-right" />
      <header style={{
        background: C.panel, borderBottom: `2px solid ${C.border}`,
        padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🍽️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: C.accent, letterSpacing: '0.03em' }}>Mess Management</div>
            <div style={{ fontSize: '0.7rem', color: C.accentDim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>CST — Royal University of Bhutan</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: C.accentMid }}>👤 {user?.name} <span style={{ color: C.textMuted, fontSize: '0.75rem' }}>(Student)</span></span>
          <button onClick={handleLogout} style={{ background: 'transparent', border: `1px solid ${C.danger}`, color: C.danger, padding: '0.3rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>Logout</button>
        </div>
      </header>
      <nav style={{ background: C.panelAlt, borderBottom: `1px solid ${C.border}`, display: 'flex', padding: '0 2rem', overflowX: 'auto' }}>
        {TABS.map(({ key, icon, label }) => (
          <button key={key} type="button" onClick={() => setTab(key)} style={{
            background: 'transparent', border: 'none',
            borderBottom: tab === key ? `3px solid ${C.accentDim}` : '3px solid transparent',
            color: tab === key ? C.accent : C.textMuted,
            padding: '1rem 1.5rem', cursor: 'pointer', fontSize: '0.9rem',
            fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'color 0.2s',
          }}>{icon} {label}</button>
        ))}
      </nav>
      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {announcements.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            {announcements.slice(0, 2).map((a) => (
              <div key={a.id} style={{ background: '#2a1f0a', border: `1px solid ${C.warn}`, borderLeft: `4px solid ${C.warn}`, borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: C.warn }}>📢 {a.title}: </span>
                <span style={{ color: '#d4b483', fontSize: '0.9rem' }}>{a.content}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'meals' && (
          <div>
            <h2 style={{ color: C.accent, marginBottom: '1.5rem', fontSize: '1.3rem' }}>🍛 Weekly Meal Plan</h2>
            {meals.length === 0 && <div style={{ textAlign: 'center', color: C.textMuted, padding: '3rem', background: C.panel, borderRadius: '8px', border: `1px dashed ${C.border}` }}>No meal plans available yet.</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {meals.map((meal) => (
                <div key={meal.id} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ fontWeight: 700, color: C.accent, fontSize: '1.05rem', marginBottom: '0.75rem' }}>{meal.day}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
                    <div><span style={{ color: C.textMuted }}>🌅 Breakfast: </span><span style={{ color: C.text }}>{meal.breakfast}</span></div>
                    <div><span style={{ color: C.textMuted }}>☀️ Lunch: </span><span style={{ color: C.text }}>{meal.lunch}</span></div>
                    <div><span style={{ color: C.textMuted }}>🌙 Dinner: </span><span style={{ color: C.text }}>{meal.dinner}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'feedback' && (
          <div style={{ maxWidth: '500px' }}>
            <h2 style={{ color: C.accent, marginBottom: '1.5rem', fontSize: '1.3rem' }}>⭐ Rate a Meal</h2>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '1.5rem' }}>
              <form onSubmit={submitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: C.accentMid, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Meal Day</label>
                  <select value={feedbackForm.mealPlanId} onChange={(e) => setFeedbackForm({ ...feedbackForm, mealPlanId: e.target.value })} style={{ ...inputStyle }}>
                    <option value="">Select a meal day</option>
                    {meals.map((m) => <option key={m.id} value={m.id}>{m.day}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: C.accentMid, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Meal Type</label>
                  <select value={feedbackForm.mealType} onChange={(e) => setFeedbackForm({ ...feedbackForm, mealType: e.target.value })} style={{ ...inputStyle }}>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: C.accentMid, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {STARS.map((s) => (
                      <button type="button" key={s} onClick={() => setFeedbackForm({ ...feedbackForm, rating: s })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.8rem', color: feedbackForm.rating >= s ? C.warn : C.border }}>★</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', color: C.accentMid, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Comment (optional)</label>
                  <textarea value={feedbackForm.comment} onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })} placeholder="Share your thoughts..." rows={3} style={{ ...inputStyle, resize: 'none' }} />
                </div>
                <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.5 : 1 }}>{loading ? 'Submitting...' : 'Submit Feedback'}</button>
              </form>
            </div>
          </div>
        )}
        {tab === 'suggestions' && (
          <div style={{ maxWidth: '500px' }}>
            <h2 style={{ color: C.accent, marginBottom: '1.5rem', fontSize: '1.3rem' }}>💡 Suggest a Meal</h2>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '1.5rem' }}>
              <form onSubmit={submitSuggestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <textarea value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} placeholder="What would you like to see on the menu?" rows={4} required style={{ ...inputStyle, resize: 'none' }} />
                <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.5 : 1 }}>{loading ? 'Submitting...' : 'Submit Suggestion'}</button>
              </form>
            </div>
          </div>
        )}
        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ color: C.accent, marginBottom: '1rem', fontSize: '1.3rem' }}>📋 My Feedback History</h2>
              {feedbacks.length === 0 ? <p style={{ color: C.textMuted, fontSize: '0.9rem' }}>No feedback submitted yet.</p>
                : feedbacks.map((f) => (
                  <div key={f.id} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: C.accentMid }}>{f.mealPlan?.day} — {f.mealType}</p>
                      <p style={{ color: C.textMuted, fontSize: '0.85rem', marginTop: '0.25rem' }}>{f.comment || 'No comment'}</p>
                      <p style={{ color: C.textMuted, fontSize: '0.75rem', marginTop: '0.25rem' }}>{new Date(f.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span style={{ color: C.warn, fontWeight: 700, fontSize: '1rem' }}>{'★'.repeat(f.rating)}</span>
                  </div>
                ))}
            </div>
            <div>
              <h2 style={{ color: C.accent, marginBottom: '1rem', fontSize: '1.3rem' }}>💡 My Suggestions</h2>
              {suggestions.length === 0 ? <p style={{ color: C.textMuted, fontSize: '0.9rem' }}>No suggestions yet.</p>
                : suggestions.map((s) => (
                  <div key={s.id} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.9rem', color: C.text }}>{s.content}</p>
                    <p style={{ fontSize: '0.75rem', color: C.textMuted, marginTop: '0.25rem' }}>{new Date(s.createdAt).toLocaleDateString()}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '999px', border: `1px solid ${statusColor[s.status] || C.textMuted}`, color: statusColor[s.status] || C.textMuted }}>{s.status}</span>
                      {s.adminReply && <p style={{ fontSize: '0.8rem', color: C.accentMid, fontStyle: 'italic' }}>Admin: {s.adminReply}</p>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        {tab === 'polls' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1.25rem' }}>
            <p style={{ color: C.textMuted, fontSize: '1rem' }}>View and vote on special meal polls</p>
            <button onClick={() => router.push('/student/polls')} style={{ ...btnPrimary, padding: '0.65rem 2rem', fontSize: '1rem' }}>🗳️ Go to Special Polls</button>
          </div>
        )}
      </main>
    </div>
  );
}
