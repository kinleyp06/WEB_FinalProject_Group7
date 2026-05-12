export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px]">
        <h1 className="text-3xl font-bold text-center mb-6">
          Register
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded-lg"
          />

          <select className="w-full border p-3 rounded-lg">
            <option>Student</option>
            <option>Admin</option>
          </select>

          <button className="w-full bg-black text-white p-3 rounded-lg">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}