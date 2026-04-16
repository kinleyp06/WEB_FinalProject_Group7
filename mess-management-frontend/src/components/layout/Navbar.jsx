export default function Navbar() {
  return (
    <div className="bg-white shadow p-4 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Dashboard</h2>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Sonam</span>
        <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
      </div>
    </div>
  );
}