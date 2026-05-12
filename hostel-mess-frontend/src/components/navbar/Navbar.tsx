import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-black text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">
        Mess System
      </h1>

      <div className="flex gap-6">
        <Link href="/student">Student</Link>
        <Link href="/admin">Admin</Link>
      </div>
    </nav>
  );
}