'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function HomePage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;
      const { data } = await api.post(endpoint, payload);
      setAuth(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      router.push(data.user.role === 'ADMIN' ? '/admin' : '/student');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-700 to-green-900 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-800">Mess Management System</h1>
          <p className="text-gray-500 text-sm mt-1">College of Science and Technology</p>
        </div>

        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          {['login', 'register'].map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === m ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}>
              {m === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <input name="name" placeholder="Full Name" value={form.name} onChange={handle} required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          )}
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handle} required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle} required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          {mode === 'register' && (
            <select name="role" value={form.role} onChange={handle}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white">
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin (Mess Manager)</option>
            </select>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors disabled:opacity-50">
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}