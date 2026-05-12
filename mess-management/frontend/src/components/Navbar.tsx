'use client';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.push('/');
  };

  return (
    <nav className="bg-green-800 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🍽️</span>
        <div>
          <h1 className="font-bold text-lg leading-none">Mess Management</h1>
          <p className="text-green-300 text-xs">CST — Royal University of Bhutan</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">
          <span className="text-green-300">Hello, </span>
          <span className="font-semibold">{user?.name}</span>
          <span className="ml-2 bg-green-700 px-2 py-0.5 rounded-full text-xs">{user?.role}</span>
        </span>
        <button onClick={handleLogout}
          className="bg-white text-green-800 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
          Logout
        </button>
      </div>
    </nav>
  );
}