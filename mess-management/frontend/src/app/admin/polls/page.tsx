'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function AdminPolls() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [specialMeals, setSpecialMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    day: 'Monday',
    date: '',
    polls: [
      { question: 'Veg or Non-Veg?', options: ['Veg', 'Non-Veg'] },
      { question: 'Meat preference?', options: ['Chicken', 'Pork', 'Beef'] },
    ],
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/'); return; }
    fetchMeals();
  }, [user]);

  const fetchMeals = async () => {
    try {
      const { data } = await api.get('/polls/special-meals');
      setSpecialMeals(data);
    } catch { toast.error('Failed to load'); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/polls/special-meals', form);
      toast.success('Special meal & polls created!');
      setForm({ title: '', day: 'Monday', date: '', polls: [
        { question: 'Veg or Non-Veg?', options: ['Veg', 'Non-Veg'] },
        { question: 'Meat preference?', options: ['Chicken', 'Pork', 'Beef'] },
      ]});
      fetchMeals();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const deleteMeal = async (id: number) => {
    if (!confirm('Delete this special meal?')) return;
    try { await api.delete(`/polls/special-meals/${id}`); toast.success('Deleted'); fetchMeals(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🍽️ Special Meals & Polls</h1>

        <div className="bg-white rounded-xl border p-6 shadow-sm mb-8">
          <h2 className="font-bold text-lg mb-4">Create Special Meal Event</h2>
          <form onSubmit={submit} className="space-y-4">
            <input placeholder="Event title (e.g. Thursday Special — Bhutanese Night)"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <div className="grid grid-cols-2 gap-4">
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="Monday">Monday</option>
                <option value="Thursday">Thursday</option>
              </select>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required
                className="border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600">Poll Questions (pre-filled, editable):</p>
              {form.polls.map((poll, pi) => (
                <div key={pi} className="border rounded-lg p-4 bg-gray-50">
                  <input value={poll.question}
                    onChange={(e) => { const p = [...form.polls]; p[pi].question = e.target.value; setForm({ ...form, polls: p }); }}
                    className="w-full border rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <div className="flex gap-2 flex-wrap">
                    {poll.options.map((opt, oi) => (
                      <input key={oi} value={opt}
                        onChange={(e) => { const p = [...form.polls]; p[pi].options[oi] = e.target.value; setForm({ ...form, polls: p }); }}
                        className="border rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Special Meal & Polls'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {specialMeals.length === 0 && <p className="text-gray-400 text-center py-8">No special meals yet.</p>}
          {specialMeals.map((meal) => (
            <div key={meal.id} className="bg-white rounded-xl border p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-green-800 text-lg">{meal.title}</h3>
                  <p className="text-sm text-gray-500">{meal.day} — {new Date(meal.date).toLocaleDateString()}</p>
                </div>
                <button onClick={() => deleteMeal(meal.id)} className="text-red-400 hover:text-red-600">🗑</button>
              </div>
              {meal.polls.map((poll: any) => (
                <div key={poll.id} className="mb-3">
                  <p className="font-medium text-sm text-gray-700 mb-2">📊 {poll.question}</p>
                  <div className="flex gap-3 flex-wrap">
                    {poll.options.map((opt: any) => (
                      <div key={opt.id} className="bg-green-50 border border-green-200 rounded-lg px-3 py-1 text-sm">
                        {opt.label}: <span className="font-bold text-green-700">{opt.votes.length} votes</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}