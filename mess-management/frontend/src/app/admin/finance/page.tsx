'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function AdminFinance() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ description: '', totalCost: '', weekStart: '' });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/'); return; }
    fetchBills();
  }, [user]);

  const fetchBills = async () => {
    try {
      const { data } = await api.get('/finance/bills');
      setBills(data);
    } catch { toast.error('Failed to load bills'); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('description', form.description);
      fd.append('totalCost', form.totalCost);
      fd.append('weekStart', form.weekStart);
      if (file) fd.append('receipt', file);
      await api.post('/finance/bills', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Bill added!');
      setForm({ description: '', totalCost: '', weekStart: '' });
      setFile(null);
      fetchBills();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error saving bill');
    } finally {
      setLoading(false);
    }
  };

  const deleteBill = async (id: number) => {
    if (!confirm('Delete this bill?')) return;
    try {
      await api.delete(`/finance/bills/${id}`);
      toast.success('Deleted');
      fetchBills();
    } catch { toast.error('Error'); }
  };

  const chartData = [...bills]
    .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime())
    .map((b) => ({
      week: new Date(b.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cost: b.totalCost,
    }));

  const total = bills.reduce((s, b) => s + b.totalCost, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">💰 Financial Management</h1>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Bills Recorded</p>
            <p className="text-3xl font-bold text-green-700">{bills.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Expenditure</p>
            <p className="text-3xl font-bold text-green-700">Nu. {total.toLocaleString()}</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="bg-white rounded-xl border p-6 shadow-sm mb-8">
            <h2 className="font-bold text-gray-700 mb-4">📈 Weekly Cost Trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => `Nu. ${v}`} />
                <Line type="monotone" dataKey="cost" stroke="#15803d" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Add Bill Form */}
        <div className="bg-white rounded-xl border p-6 shadow-sm mb-8">
          <h2 className="font-bold text-lg mb-4">Add Grocery Bill</h2>
          <form onSubmit={submit} className="space-y-4">
            <input
              placeholder="Description (e.g. Week 3 groceries — vegetables & meat)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Total cost (Nu.)"
                value={form.totalCost}
                onChange={(e) => setForm({ ...form, totalCost: e.target.value })}
                required min="0" step="0.01"
                className="border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="date"
                value={form.weekStart}
                onChange={(e) => setForm({ ...form, weekStart: e.target.value })}
                required
                className="border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden" id="receipt-upload"
              />
              <label htmlFor="receipt-upload" className="cursor-pointer text-sm text-gray-500 hover:text-green-700">
                {file ? `📎 ${file.name}` : '📎 Upload receipt (JPEG, PNG, PDF — optional, max 5MB)'}
              </label>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Bill'}
            </button>
          </form>
        </div>

        {/* Bills List */}
        <div className="space-y-3">
          <h2 className="font-bold text-gray-700">All Bills</h2>
          {bills.length === 0 && <p className="text-gray-400 text-center py-8">No bills recorded yet.</p>}
          {bills.map((bill) => (
            <div key={bill.id} className="bg-white rounded-xl border p-4 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{bill.description}</p>
                <p className="text-sm text-gray-500">
                  Week of {new Date(bill.weekStart).toLocaleDateString()} —{' '}
                  <span className="font-bold text-green-700">Nu. {bill.totalCost.toLocaleString()}</span>
                </p>
                {bill.receiptUrl && (
                  
                    href={`http://localhost:5000${bill.receiptUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    View Receipt
                  </a>
                )}
              </div>
              <button onClick={() => deleteBill(bill.id)} className="text-red-400 hover:text-red-600 text-lg">🗑</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}