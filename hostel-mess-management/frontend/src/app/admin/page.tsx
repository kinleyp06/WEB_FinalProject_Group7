'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import useAuthStore from '@/store/authStore';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#15803d'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [meals, setMeals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [mealForm, setMealForm] = useState({ day: 'Monday', breakfast: '', lunch: '', dinner: '', weekStart: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [replyForm, setReplyForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    try {
      const [m, s_data, a, st] = await Promise.all([
        api.get('/meals'), api.get('/suggestions'),
        api.get('/announcements'), api.get('/feedback/stats'),
      ]);
      setMeals(m.data);
      setSuggestions(s_data.data);
      setAnnouncements(a.data);
      setStats(st.data);
    } catch { toast.error('Failed to load data'); }
  };

  const createMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/meals', mealForm);
      toast.success('Meal plan created!');
      setMealForm({ day: 'Monday', breakfast: '', lunch: '', dinner: '', weekStart: '' });
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const deleteMeal = async (id: number) => {
    if (!confirm('Delete this meal?')) return;
    try { await api.delete(`/meals/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Error'); }
  };

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/announcements', announcementForm);
      toast.success('Announcement posted!');
      setAnnouncementForm({ title: '', content: '' });
      fetchAll();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const deleteAnnouncement = async (id: number) => {
    try { await api.delete(`/announcements/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Error'); }
  };

  const replyToSuggestion = async (id: number) => {
    const form = replyForm[id];
    if (!form?.reply) return toast.error('Enter a reply');
    try {
      await api.patch(`/suggestions/${id}`, { adminReply: form.reply, status: form.status || 'REVIEWED' });
      toast.success('Reply sent!');
      setReplyForm({ ...replyForm, [id]: {} });
      fetchAll();
    } catch { toast.error('Error'); }
  };

  const TABS = ['dashboard', 'meals', 'announcements', 'suggestions'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-medium text-sm capitalize transition-all ${tab === t ? 'bg-green-700 text-white shadow' : 'bg-white text-gray-600 border hover:border-green-400'}`}>
              {t === 'dashboard' ? '📊 Dashboard' : t === 'meals' ? '🍛 Meal Plans' : t === 'announcements' ? '📢 Announcements' : '💡 Suggestions'}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border p-5 text-center shadow-sm">
                <p className="text-3xl font-bold text-green-700">{stats.totalFeedbacks}</p>
                <p className="text-gray-500 text-sm mt-1">Total Feedbacks</p>
              </div>
              <div className="bg-white rounded-xl border p-5 text-center shadow-sm">
                <p className="text-3xl font-bold text-yellow-500">{stats.avgRating} ⭐</p>
                <p className="text-gray-500 text-sm mt-1">Average Rating</p>
              </div>
              <div className="bg-white rounded-xl border p-5 text-center shadow-sm">
                <p className="text-3xl font-bold text-blue-600">{meals.length}</p>
                <p className="text-gray-500 text-sm mt-1">Meal Plans</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border p-5 shadow-sm">
                <h3 className="font-semibold mb-4 text-gray-700">Avg Rating by Meal Type</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.mealTypeAvg}>
                    <XAxis dataKey="type" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="avg" fill="#15803d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl border p-5 shadow-sm">
                <h3 className="font-semibold mb-4 text-gray-700">Rating Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={stats.ratingDist} dataKey="count" nameKey="rating" cx="50%" cy="50%" outerRadius={80} label={({ rating }: any) => `${rating}★`}>
                      {stats.ratingDist.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {tab === 'meals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4 text-gray-800">Add Meal Plan</h2>
              <form onSubmit={createMeal} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select value={mealForm.day} onChange={(e) => setMealForm({ ...mealForm, day: e.target.value })}
                  className="border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
                <input type="date" value={mealForm.weekStart} onChange={(e) => setMealForm({ ...mealForm, weekStart: e.target.value })} required
                  className="border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <input placeholder="Breakfast" value={mealForm.breakfast} onChange={(e) => setMealForm({ ...mealForm, breakfast: e.target.value })} required
                  className="border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <input placeholder="Lunch" value={mealForm.lunch} onChange={(e) => setMealForm({ ...mealForm, lunch: e.target.value })} required
                  className="border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <input placeholder="Dinner" value={mealForm.dinner} onChange={(e) => setMealForm({ ...mealForm, dinner: e.target.value })} required
                  className="border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button type="submit" disabled={loading}
                  className="bg-green-700 text-white rounded-lg px-6 py-3 font-semibold hover:bg-green-800 disabled:opacity-50 transition-colors">
                  {loading ? 'Saving...' : 'Add Meal'}
                </button>
              </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meals.map((meal) => (
                <div key={meal.id} className="bg-white border rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-green-800">{meal.day}</h3>
                    <button onClick={() => deleteMeal(meal.id)} className="text-red-400 hover:text-red-600 text-sm">🗑</button>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>🌅 {meal.breakfast}</p>
                    <p>☀️ {meal.lunch}</p>
                    <p>🌙 {meal.dinner}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6 shadow-sm max-w-lg">
              <h2 className="font-bold text-lg mb-4">Post Announcement</h2>
              <form onSubmit={createAnnouncement} className="space-y-4">
                <input placeholder="Title" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} required
                  className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <textarea placeholder="Content" value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} required rows={3}
                  className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                <button type="submit" disabled={loading}
                  className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50">
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </form>
            </div>
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="bg-white border rounded-xl p-4 flex justify-between items-start shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-800">📢 {a.title}</p>
                    <p className="text-gray-500 text-sm mt-1">{a.content}</p>
                    <p className="text-gray-400 text-xs mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteAnnouncement(a.id)} className="text-red-400 hover:text-red-600">🗑</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'suggestions' && (
          <div className="space-y-4">
            {suggestions.length === 0 && <p className="text-gray-400 text-center py-12">No suggestions yet.</p>}
            {suggestions.map((s) => (
              <div key={s.id} className="bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{s.user?.name}</p>
                    <p className="text-gray-800 mt-1">{s.content}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.status === 'IMPLEMENTED' ? 'bg-green-100 text-green-700' : s.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
                </div>
                {s.adminReply && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-3">✅ Admin: {s.adminReply}</p>}
                <div className="flex gap-2 flex-wrap">
                  <input placeholder="Your reply..." value={replyForm[s.id]?.reply || ''} onChange={(e) => setReplyForm({ ...replyForm, [s.id]: { ...replyForm[s.id], reply: e.target.value } })}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-0" />
                  <select value={replyForm[s.id]?.status || 'REVIEWED'} onChange={(e) => setReplyForm({ ...replyForm, [s.id]: { ...replyForm[s.id], status: e.target.value } })}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                    <option value="REVIEWED">Reviewed</option>
                    <option value="IMPLEMENTED">Implemented</option>
                  </select>
                  <button onClick={() => replyToSuggestion(s.id)} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800">Reply</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}