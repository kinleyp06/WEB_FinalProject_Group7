import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
        <h1 className="text-4xl font-bold mb-4">
          Hostel Mess Management System
        </h1>

        <p className="text-gray-600 mb-6">
          Meal plans, feedback, notifications and admin dashboard.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-black text-white px-6 py-3 rounded-xl"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="border border-black px-6 py-3 rounded-xl"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}