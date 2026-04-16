import Sidebar from "../components/sidebar";

export default function AdminDashboard() {
  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

        <div className="bg-white p-4 rounded shadow">
          <p>Upload Grocery Bill</p>
          <input type="file" className="mt-2" />
        </div>
      </div>
    </div>
  );
}