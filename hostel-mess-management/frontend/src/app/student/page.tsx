'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import useWebSocket from '@/hooks/useWebSocket';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

const STARS = [1, 2, 3, 4, 5];

export default function StudentDashboard() {
  const { user } = useAuthStore();
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
        api.get('/meals'), api.get('/announcements'),
        api.get('/feedback'), api.get('/suggestions'),
      ]);
      setMeals(m.data);
      setAnnouncements(a.data);
      setFeedbacks(f.data);
      setSuggestions(s.data);
    } catch { toast.error('Failed to load data'); }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.mealPlanId) return toast.error('Select a meal first');
    setLoading(true);
    try {
      await api.post('/feedback', { ...feedbackForm, mealPlanId: parseInt(feedbackForm.mealPlanId) });
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
      await api.post('/suggestions', { content: suggestionText });
      toast.success('Suggestion submitted!');
      setSuggestionText('');
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const TABS = ['meals', 'feedback', 'suggestions', 'history', 'polls'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {announcements.length > 0 && (
          <div className="mb-6 space-y-2">
            {announcements.slice(0, 2).map((a) => (
              <div key={a.id} className="bg-yellow-50 border-l-4 border-yellow-400 px-4 py-3 rounded-r-lg">
                <span className="font-semibold text-yellow-800">📢 {a.title}:</span>
                <span className="text-yellow-700 ml-2 text-sm">{a.content}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-medium text-sm capitalize transition-all ${tab === t ? 'bg-green-700 text-white shadow' : 'bg-white text-gray-600 border hover:border-green-400'}`}>
              {t === 'meals' ? '🍛 Meal Plan'
                : t === 'feedback' ? '⭐ Give Feedback'
                : t === 'suggestions' ? '💡 Suggestions'
                : t === 'history' ? '📋 My History'
                : '🗳️ Special Polls'}
            </button>
          ))}
        </div>

        {tab === 'meals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meals.length === 0 && <p className="text-gray-400 col-span-3 text-center py-12">No meal plans yet.</p>}
            {meals.map((meal) => (
              <div key={meal.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-green-800 text-lg mb-3">{meal.day}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2"><span className="text-lg">🌅</span><div><span className="font-medium">Breakfast</span><p className="text-gray-600">{meal.breakfast}</p></div></div>
                  <div className="flex items-start gap-2"><span className="text-lg">☀️</span><div><span className="font-medium">Lunch</span><p className="text-gray-600">{meal.lunch}</p></div></div>
                  <div className="flex items-start gap-2"><span className="text-lg">🌙</span><div><span className="font-medium">Dinner</span><p className="text-gray-600">{meal.dinner}</p></div></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'feedback' && (
          <div className="bg-white rounded-xl shadow-sm border p-6 max-w-lg">
            <h2 className="font-bold text-lg mb-4 text-gray-800">Rate a Meal</h2>
            <form onSubmit={submitFeedback} className="space-y-4">
              <select value={feedbackForm.mealPlanId} onChange={(e) => setFeedbackForm({ ...feedbackForm, mealPlanId: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select a meal day</option>
                {meals.map((m) => <option key={m.id} value={m.id}>{m.day}</option>)}
              </select>
              <select value={feedbackForm.mealType} onChange={(e) => setFeedbackForm({ ...feedbackForm, mealType: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
              <div>
                <p className="text-sm text-gray-600 mb-2">Rating</p>
                <div className="flex gap-2">
                  {STARS.map((s) => (
                    <button type="button" key={s} onClick={() => setFeedbackForm({ ...feedbackForm, rating: s })}
                      className={`text-2xl transition-transform hover:scale-110 ${feedbackForm.rating >= s ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                  ))}
                </div>
              </div>
              <textarea value={feedbackForm.comment} onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                placeholder="Comments (optional)" rows={3}
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              <button type="submit" disabled={loading}
                className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        )}

        {tab === 'suggestions' && (
          <div className="bg-white rounded-xl shadow-sm border p-6 max-w-lg">
            <h2 className="font-bold text-lg mb-4 text-gray-800">Suggest a Meal</h2>
            <form onSubmit={submitSuggestion} className="space-y-4">
              <textarea value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)}
                placeholder="What would you like to see on the menu?" rows={4}
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" required />
              <button type="submit" disabled={loading}
                className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Suggestion'}
              </button>
            </form>
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-lg mb-3 text-gray-800">My Feedback History</h2>
              {feedbacks.length === 0 ? <p className="text-gray-400 text-sm">No feedback submitted yet.</p> : (
                <div className="space-y-3">
                  {feedbacks.map((f) => (
                    <div key={f.id} className="bg-white border rounded-xl p-4 flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{f.mealPlan?.day} — {f.mealType}</p>
                        <p className="text-gray-500 text-sm mt-1">{f.comment || 'No comment'}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(f.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-yellow-500 font-bold">{'★'.repeat(f.rating)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-bold text-lg mb-3 text-gray-800">My Suggestions</h2>
              {suggestions.length === 0 ? <p className="text-gray-400 text-sm">No suggestions yet.</p> : (
                <div className="space-y-3">
                  {suggestions.map((s) => (
                    <div key={s.id} className="bg-white border rounded-xl p-4">
                      <p className="text-sm text-gray-700">{s.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(s.createdAt).toLocaleDateString()}</p>
                      <div className="flex justify-between mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          s.status === 'IMPLEMENTED' ? 'bg-green-100 text-green-700'
                          : s.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700'
                          : s.status === 'FLAGGED' ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600'}`}>
                          {s.status}
                        </span>
                        {s.adminReply && <p className="text-xs text-green-700 italic">Admin: {s.adminReply}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'polls' && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-gray-500 text-lg">View and vote on special meal polls</p>
            <button
              onClick={() => router.push('/student/polls')}
              className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800">
              🗳️ Go to Special Polls
            </button>
          </div>
        )}

      </div>
    </div>
  );
}