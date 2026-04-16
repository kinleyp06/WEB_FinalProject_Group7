import Sidebar from "../components/sidebar";

export default function History() {
  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 p-6">
        <h1 className="text-2xl font-bold mb-4">My Activity</h1>

        <div className="bg-white p-4 rounded shadow">
          <p>✔ Feedback submitted: Improve breakfast</p>
          <p>✔ Suggestion: Add momo day</p>
        </div>
      </div>
    </div>
  );
}