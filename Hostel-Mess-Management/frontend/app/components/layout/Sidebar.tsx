"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Utensils, 
  Star, 
  History, 
  BarChart3, 
  FileText, 
  Users,
  LogOut,
  Bell,
  PieChart,
  MessageSquare
} from "lucide-react";
import { logout, getCurrentUser } from "@/lib/api";

interface SidebarProps {
  role: "STUDENT" | "ADMIN";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getCurrentUser();

  const studentNavItems = [
    { name: "Dashboard", href: "/dashboard/student", icon: Home },
    { name: "Meal Plan", href: "/dashboard/student/meal-plan", icon: Utensils },
    { name: "Special Meals", href: "/dashboard/student/special-meals", icon: Star },
    { name: "Feedback", href: "/dashboard/student/feedback", icon: MessageSquare },
    { name: "My History", href: "/dashboard/student/history", icon: History },
  ];

  const adminNavItems = [
    { name: "Dashboard", href: "/dashboard/admin", icon: Home },
    { name: "Manage Meals", href: "/dashboard/admin/meals", icon: Utensils },
    { name: "Moderate Feedback", href: "/dashboard/admin/moderation", icon: MessageSquare },
    { name: "Grocery Bills", href: "/dashboard/admin/bills", icon: FileText },
    { name: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
    { name: "Poll Results", href: "/dashboard/admin/polls", icon: PieChart },
    { name: "Users", href: "/dashboard/admin/users", icon: Users },
  ];

  const navItems = role === "STUDENT" ? studentNavItems : adminNavItems;

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">Hostel Mess</h1>
          <p className="text-sm text-gray-500 mt-1">
            {role === "STUDENT" ? "Student Portal" : "Admin Portal"}
          </p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b bg-gray-50">
          <p className="font-medium text-sm">{user?.name || "User"}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
            {role === "STUDENT" ? "Student" : "Administrator"}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}