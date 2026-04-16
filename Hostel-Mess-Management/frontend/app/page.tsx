import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Hostel Mess Management System</h1>
        <p className="text-gray-600 mb-8">Manage meals, submit feedback, and vote on special meals</p>
        <div className="space-x-4">
          <Link href="/auth/login" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Login
          </Link>
          <Link href="/auth/register" className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}