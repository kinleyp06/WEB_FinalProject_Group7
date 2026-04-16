export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-blue-600 text-white p-5 fixed">
      <h1 className="text-2xl font-bold mb-8">Mess System</h1>

      <ul className="space-y-4">
        <li className="hover:bg-blue-500 p-2 rounded">Dashboard</li>
        <li className="hover:bg-blue-500 p-2 rounded">Special Meals</li>
        <li className="hover:bg-blue-500 p-2 rounded">History</li>
        <li className="hover:bg-blue-500 p-2 rounded">Admin</li>
      </ul>
    </div>
  );
}