import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `block p-2 rounded ${
      pathname === path ? "bg-blue-500" : "hover:bg-blue-400"
    }`;

  return (
    <div className="w-64 h-screen bg-blue-600 text-white p-5 fixed">
      <h1 className="text-2xl font-bold mb-8">Mess System</h1>

      <nav className="space-y-3">
        <Link to="/" className={linkClass("/")}>Dashboard</Link>
        <Link to="/meals" className={linkClass("/meals")}>Meals</Link>
        <Link to="/history" className={linkClass("/history")}>History</Link>
        <Link to="/admin" className={linkClass("/admin")}>Admin</Link>
      </nav>
    </div>
  );
}