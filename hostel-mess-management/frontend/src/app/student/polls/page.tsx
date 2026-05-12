'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function StudentPolls() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [specialMeals, setSpecialMeals] = useState<any[]>([]);
  const [voting, setVoting] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') { router.push('/'); return; }
    fetchMeals();
  }, [user]);

  const fetchMeals = async () => {
    try {
      const { data } = await api.get('/polls/special-meals');
      setSpecialMeals(data);
    } catch { toast.error('Failed to load special meals'); }
  };

  const vote = async (pollId: number, optionId: number) => {
    setVoting((v) => ({ ...v, [pollId]: true }));
    try {
      await api.post(`/polls/${pollId}/vote`, { optionId });
      toast.success('Vote submitted!');
      fetchMeals();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error voting');
    } finally {
      setVoting((v) => ({ ...v, [pollId]: false }));
    }
  };

  const totalVotes = (options: any[]) => options.reduce((s, o) => s + o.votes.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🍛 Special Meals & Polls</h1>
        {specialMeals.length === 0 && (
          <p className="text-gray-400 text-center py-16">No special meals this week yet. Check back on Monday or Thursday!</p>
        )}
        {specialMeals.map((meal) => (
          <div key={meal.id} className="bg-white rounded-xl border shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-green-800">{meal.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{meal.day} — {new Date(meal.date).toLocaleDateString()}</p>
            {meal.polls.map((poll: any) => {
              const total = totalVotes(poll.options);
              return (
                <div key={poll.id} className="mb-6">
                  <p className="font-semibold text-gray-700 mb-3">📊 {poll.question}</p>
                  <div className="space-y-2">
                    {poll.options.map((opt: any) => {
                      const pct = total > 0 ? Math.round((opt.votes.length / total) * 100) : 0;
                      return (
                        <div key={opt.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-gray-500">{opt.votes.length} votes ({pct}%)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-100 rounded-full h-3">
                              <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <button
                              onClick={() => vote(poll.id, opt.id)}
                              disabled={voting[poll.id]}
                              className="text-xs bg-green-700 text-white px-3 py-1 rounded-lg hover:bg-green-800 disabled:opacity-50">
                              Vote
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}