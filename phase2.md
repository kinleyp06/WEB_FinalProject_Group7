---

## 🎨 Phase 2: Frontend Foundation (April 13-19)
**Assigned to: Sonam Wangmo (Frontend Lead)**

### Overview
In this phase, you'll build the core UI components, layouts, and state management that will be used throughout the application. By the end of this phase, you'll have a working dashboard with navigation, reusable components, and data fetching setup.

**Learning Outcomes:**
- Create reusable React components
- Implement protected routes with role-based access
- Set up TanStack Query for server state management
- Build responsive layouts with Tailwind CSS

---

## Section 6: Install Additional Dependencies (April 13)

### Step 6.1: Install Frontend Packages

```bash
cd Desktop/hostel-mess-system/frontend

# Install UI and state management libraries
npm install @tanstack/react-query axios react-hot-toast
npm install lucide-react  # Icons library
npm install recharts      # Charts for admin dashboard (alternative to Chart.js)
npm install date-fns      # Date formatting utilities
```

### Step 6.2: Install shadcn/ui Components (Optional but Recommended)

shadcn/ui provides beautiful, accessible components that work great with Tailwind.

```bash
cd Desktop/hostel-mess-system/frontend

# Initialize shadcn/ui
npx shadcn-ui@latest init

# When prompted:
# - Would you like to use TypeScript? → Yes
# - Which style would you like? → Default
# - Which color would you like? → Slate
# - Where is your global CSS file? → app/globals.css
# - Do you want to use CSS variables for colors? → Yes

# Add useful components
npx shadcn-ui@latest add button card dialog dropdown-menu
npx shadcn-ui@latest add input label select tabs toast
```

---

## Section 7: Create Layout Components (April 13-14)

### Step 7.1: Create the Main Layout Structure

Create the layout files that will wrap all dashboard pages.

**File: `frontend/components/layout/Sidebar.tsx`**

```tsx
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
```

**File: `frontend/components/layout/Header.tsx`**

```tsx
"use client";
import { useState, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [notifications, setNotifications] = useState<string[]>([]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1" />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuItem className="font-medium border-b">
              Notifications
            </DropdownMenuItem>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map((notif, i) => (
                <DropdownMenuItem key={i} className="text-sm py-2">
                  {notif}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

**File: `frontend/components/layout/DashboardLayout.tsx`**

```tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { getCurrentUser } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "STUDENT" | "ADMIN";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/auth/login");
    } else if (role === "ADMIN" && user.role !== "ADMIN") {
      router.push("/dashboard/student");
    } else if (role === "STUDENT" && user.role !== "STUDENT") {
      router.push("/dashboard/admin");
    }
    setIsLoading(false);
  }, [router, role]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile by default */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative w-64">
          <Sidebar role={role} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar role={role} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

### Step 7.2: Create Wrapper Components for Each Dashboard

**File: `frontend/components/providers/AuthProvider.tsx`**

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
```

**Update `frontend/app/layout.tsx` to include the provider:**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hostel Mess Management System",
  description: "Manage hostel meals, feedback, and polls",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <main className="min-h-screen bg-gray-50">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
```

### Step 7.3: Update Dashboard Pages

**Update `frontend/app/dashboard/student/page.tsx`:**

```tsx
"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Star, MessageSquare, Calendar } from "lucide-react";

export default function StudentDashboardPage() {
  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-gray-600">Here's what's happening with your mess today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Meals</CardTitle>
              <Utensils className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-gray-500">Breakfast, Lunch, Dinner</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Special Meal</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Today</div>
              <p className="text-xs text-gray-500">Chicken Biryani for Lunch</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Your Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-gray-500">Submitted this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-gray-500">Veg vs Non-Veg for Thursday</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Meal Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Meal Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Breakfast (7:00 AM - 8:30 AM)</h3>
                  <p className="text-sm text-gray-600">Puri Sabji + Tea</p>
                </div>
                <span className="text-sm text-green-600">Available</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Lunch (12:00 PM - 1:30 PM)</h3>
                  <p className="text-sm text-gray-600">Chicken Curry, Rice, Dal, Salad</p>
                </div>
                <span className="text-sm text-orange-600">Upcoming</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Dinner (7:00 PM - 8:30 PM)</h3>
                  <p className="text-sm text-gray-600">Roti, Paneer Butter Masala, Rice</p>
                </div>
                <span className="text-sm text-gray-500">Not Started</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

**Update `frontend/app/dashboard/admin/page.tsx`:**

```tsx
"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Star, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your hostel mess operations.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-gray-500">Active mess subscribers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-gray-500">Need moderation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹45,230</div>
              <p className="text-xs text-gray-500">+12% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                📅 Create Weekly Meal Plan
              </button>
              <button className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                📊 Upload Grocery Bill
              </button>
              <button className="w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                📝 Moderate Pending Feedback
              </button>
              <button className="w-full text-left px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100">
                🗳️ Create Special Meal Poll
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">New feedback submitted</p>
                  <p className="text-gray-500 text-xs">2 minutes ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Grocery bill uploaded</p>
                  <p className="text-gray-500 text-xs">1 hour ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Meal plan updated for Monday</p>
                  <p className="text-gray-500 text-xs">3 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

---

## Section 8: Create Reusable Components (April 14-16)

### Step 8.1: Meal Card Component

**File: `frontend/components/ui/MealCard.tsx`**

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Star } from "lucide-react";

interface MealCardProps {
  mealName: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  description: string;
  time: string;
  rating?: number;
  isSpecial?: boolean;
}

export function MealCard({ mealName, mealType, description, time, rating, isSpecial }: MealCardProps) {
  const getMealTypeColor = () => {
    switch (mealType) {
      case "BREAKFAST":
        return "bg-orange-100 text-orange-700";
      case "LUNCH":
        return "bg-green-100 text-green-700";
      case "DINNER":
        return "bg-blue-100 text-blue-700";
    }
  };

  const getMealTypeLabel = () => {
    switch (mealType) {
      case "BREAKFAST":
        return "Breakfast";
      case "LUNCH":
        return "Lunch";
      case "DINNER":
        return "Dinner";
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isSpecial ? "border-yellow-400 bg-yellow-50/30" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getMealTypeColor()}`}>
                {getMealTypeLabel()}
              </span>
              {isSpecial && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                  ⭐ Special
                </span>
              )}
              {rating && (
                <span className="text-xs flex items-center gap-1 text-yellow-600">
                  <Star size={12} className="fill-yellow-500" />
                  {rating.toFixed(1)}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg">{mealName}</h3>
            <p className="text-gray-600 text-sm mt-1">{description}</p>
            <div className="flex items-center gap-1 mt-3 text-gray-500 text-sm">
              <Clock size={14} />
              <span>{time}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 8.2: Poll Widget Component

**File: `frontend/components/ui/PollWidget.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PollWidgetProps {
  pollId: string;
  title: string;
  description?: string;
  options: string[];
  onVote?: (pollId: string, choice: string) => Promise<void>;
  hasVoted?: boolean;
  results?: Record<string, number>;
}

export function PollWidget({ 
  pollId, 
  title, 
  description, 
  options, 
  onVote, 
  hasVoted = false,
  results 
}: PollWidgetProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isVoting, setIsVoting] = useState(false);
  const [voted, setVoted] = useState(hasVoted);

  const handleVote = async () => {
    if (!selectedOption || voted) return;
    setIsVoting(true);
    try {
      await onVote?.(pollId, selectedOption);
      setVoted(true);
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const getTotalVotes = () => {
    if (!results) return 0;
    return Object.values(results).reduce((a, b) => a + b, 0);
  };

  const getPercentage = (count: number) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return (count / total) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </CardHeader>
      <CardContent>
        {!voted ? (
          <div className="space-y-3">
            {options.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedOption === option
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name={`poll-${pollId}`}
                  value={option}
                  checked={selectedOption === option}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
            <Button
              onClick={handleVote}
              disabled={!selectedOption || isVoting}
              className="w-full"
            >
              {isVoting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Voting...
                </>
              ) : (
                "Submit Vote"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {results && options.map((option) => (
              <div key={option}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{option}</span>
                  <span>{results[option] || 0} votes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${getPercentage(results[option] || 0)}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-center text-sm text-gray-500 mt-2">
              Total votes: {getTotalVotes()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 8.3: Feedback Form Component

**File: `frontend/components/ui/FeedbackForm.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

interface FeedbackFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      toast.success("Feedback submitted successfully!");
      setRating(0);
      setComment("");
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      (hoverRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about today's meal..."
              className="mt-2"
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Step 8.4: Notification Toast Component

**File: `frontend/components/ui/NotificationToast.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface NotificationToastProps {
  message: string;
  type?: "info" | "success" | "warning" | "error";
  duration?: number;
}

// This component is for displaying notifications
// To use it: toast.success("Meal plan updated!")

export function showNotification(message: string, type: "info" | "success" | "warning" | "error" = "info") {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "warning":
      toast.custom((t) => (
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {message}
        </div>
      ));
      break;
    default:
      toast.custom((t) => (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {message}
        </div>
      ));
  }
}

// For WebSocket notifications (will be used in Phase 3)
export function useNotificationListener() {
  useEffect(() => {
    // This will be implemented in Phase 3 with Socket.io
    console.log("Notification listener ready");
  }, []);
}
```

---

## Section 9: Set Up TanStack Query for Data Fetching (April 16-17)

### Step 9.1: Create API Hooks

**File: `frontend/hooks/useMeals.ts`**

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export interface Meal {
  id: string;
  dayOfWeek: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  name: string;
  description: string;
}

// Fetch all meals
export function useMeals() {
  return useQuery({
    queryKey: ["meals"],
    queryFn: async () => {
      const response = await api.get("/meals");
      return response.data as Meal[];
    },
  });
}

// Fetch today's meals
export function useTodaysMeals() {
  return useQuery({
    queryKey: ["meals", "today"],
    queryFn: async () => {
      const response = await api.get("/meals/today");
      return response.data as Meal[];
    },
  });
}

// Create a new meal (admin only)
export function useCreateMeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mealData: Omit<Meal, "id">) => {
      const response = await api.post("/meals", mealData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      toast.success("Meal created successfully!");
    },
    onError: () => {
      toast.error("Failed to create meal");
    },
  });
}

// Update a meal (admin only)
export function useUpdateMeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Meal> & { id: string }) => {
      const response = await api.put(`/meals/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      toast.success("Meal updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update meal");
    },
  });
}

// Delete a meal (admin only)
export function useDeleteMeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/meals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      toast.success("Meal deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete meal");
    },
  });
}
```

**File: `frontend/hooks/useFeedback.ts`**

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export interface Feedback {
  id: string;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

// Fetch user's feedback history
export function useMyFeedback() {
  return useQuery({
    queryKey: ["feedback", "my"],
    queryFn: async () => {
      const response = await api.get("/feedback/my");
      return response.data as Feedback[];
    },
  });
}

// Fetch pending feedback (admin only)
export function usePendingFeedback() {
  return useQuery({
    queryKey: ["feedback", "pending"],
    queryFn: async () => {
      const response = await api.get("/feedback/pending");
      return response.data as Feedback[];
    },
  });
}

// Submit new feedback
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
      const response = await api.post("/feedback", { rating, comment });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", "my"] });
      toast.success("Feedback submitted! Awaiting moderation.");
    },
    onError: () => {
      toast.error("Failed to submit feedback");
    },
  });
}

// Moderate feedback (admin only)
export function useModerateFeedback() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) => {
      const response = await api.put(`/feedback/${id}/moderate`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", "pending"] });
      toast.success("Feedback moderated!");
    },
    onError: () => {
      toast.error("Failed to moderate feedback");
    },
  });
}
```

**File: `frontend/hooks/usePolls.ts`**

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: string[];
  isActive: boolean;
  validUntil: string;
}

export interface PollResults {
  [key: string]: number;
}

// Fetch active polls
export function useActivePolls() {
  return useQuery({
    queryKey: ["polls", "active"],
    queryFn: async () => {
      const response = await api.get("/polls/active");
      return response.data as Poll[];
    },
  });
}

// Fetch poll results
export function usePollResults(pollId: string) {
  return useQuery({
    queryKey: ["polls", pollId, "results"],
    queryFn: async () => {
      const response = await api.get(`/polls/${pollId}/results`);
      return response.data as PollResults;
    },
    enabled: !!pollId,
  });
}

// Vote in a poll
export function useVote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ pollId, choice }: { pollId: string; choice: string }) => {
      const response = await api.post(`/polls/${pollId}/vote`, { choice });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["polls", variables.pollId, "results"] });
      toast.success("Vote recorded!");
    },
    onError: () => {
      toast.error("Failed to submit vote");
    },
  });
}

// Create a new poll (admin only)
export function useCreatePoll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pollData: Omit<Poll, "id">) => {
      const response = await api.post("/polls", pollData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast.success("Poll created successfully!");
    },
    onError: () => {
      toast.error("Failed to create poll");
    },
  });
}
```

---

## Section 10: Create Protected Routes (April 17-18)

### Step 10.1: Create Middleware for Route Protection

**File: `frontend/middleware.ts`**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard'];
const studentRoutes = ['/dashboard/student'];
const adminRoutes = ['/dashboard/admin'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  const { pathname } = request.nextUrl;
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (!token && isProtectedRoute) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // For role-based redirection, we'll handle it client-side
  // since we can't easily decode JWT in middleware without a secret
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

### Step 10.2: Create a Custom Hook for Auth

**File: `frontend/hooks/useAuth.ts`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/api";

export function useAuth(requiredRole?: "STUDENT" | "ADMIN") {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = getCurrentUser();
    
    if (!userData) {
      router.push("/auth/login");
      return;
    }
    
    if (requiredRole && userData.role !== requiredRole) {
      // Redirect to appropriate dashboard
      if (userData.role === "STUDENT") {
        router.push("/dashboard/student");
      } else {
        router.push("/dashboard/admin");
      }
      return;
    }
    
    setUser(userData);
    setIsLoading(false);
  }, [router, requiredRole]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return { user, isLoading, logout: handleLogout };
}
```

---

## Section 11: Create Additional Page Components (April 18-19)

### Step 11.1: Student Meal Plan Page

**File: `frontend/app/dashboard/student/meal-plan/page.tsx`**

```tsx
"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MealCard } from "@/components/ui/MealCard";
import { useMeals } from "@/hooks/useMeals";
import { Loader2 } from "lucide-react";

export default function MealPlanPage() {
  const { data: meals, isLoading, error } = useMeals();

  if (isLoading) {
    return (
      <DashboardLayout role="STUDENT">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="STUDENT">
        <div className="text-center text-red-500">Failed to load meal plan</div>
      </DashboardLayout>
    );
  }

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Weekly Meal Plan</h1>
          <p className="text-gray-600">View your meals for the week</p>
        </div>

        {daysOfWeek.map((day) => {
          const dayMeals = meals?.filter((meal) => meal.dayOfWeek === day) || [];
          if (dayMeals.length === 0) return null;
          
          return (
            <div key={day}>
              <h2 className="text-xl font-semibold mb-3">{day}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dayMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    mealName={meal.name}
                    mealType={meal.mealType}
                    description={meal.description}
                    time={meal.mealType === "BREAKFAST" ? "7:00 AM" : meal.mealType === "LUNCH" ? "12:00 PM" : "7:00 PM"}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
```

### Step 11.2: Student Feedback Page

**File: `frontend/app/dashboard/student/feedback/page.tsx`**

```tsx
"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FeedbackForm } from "@/components/ui/FeedbackForm";
import { useSubmitFeedback, useMyFeedback } from "@/hooks/useFeedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function FeedbackPage() {
  const submitFeedback = useSubmitFeedback();
  const { data: feedbackHistory } = useMyFeedback();

  const handleSubmit = async (rating: number, comment: string) => {
    await submitFeedback.mutateAsync({ rating, comment });
  };

  return (
    <DashboardLayout role="STUDENT">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeedbackForm onSubmit={handleSubmit} />

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Feedback History</h2>
          <div className="space-y-3">
            {feedbackHistory?.map((feedback) => (
              <Card key={feedback.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      feedback.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      feedback.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {feedback.status}
                    </span>
                  </div>
                  {feedback.comment && (
                    <p className="text-sm text-gray-600 mt-2">{feedback.comment}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
            {(!feedbackHistory || feedbackHistory.length === 0) && (
              <p className="text-gray-500 text-center py-8">No feedback submitted yet</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

### Step 11.3: Student History Page

**File: `frontend/app/dashboard/student/history/page.tsx`**

```tsx
"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useMyFeedback } from "@/hooks/useFeedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MessageSquare } from "lucide-react";

export default function HistoryPage() {
  const { data: feedback } = useMyFeedback();

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Activity</h1>
          <p className="text-gray-600">View your feedback and suggestion history</p>
        </div>

        <Tabs defaultValue="feedback">
          <TabsList>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="votes">Poll Votes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feedback" className="space-y-4 mt-4">
            {feedback?.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{item.rating}/5</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === "APPROVED" ? "bg-green-100 text-green-700" : 
                      item.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : 
                      "bg-red-100 text-red-700"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  {item.comment && <p className="text-gray-600 mt-2">{item.comment}</p>}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
            {(!feedback || feedback.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No feedback submitted yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="suggestions">
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Suggestions feature coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="votes">
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Your poll votes will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
```

### Step 11.4: Create Special Meals Page (Placeholder)

**File: `frontend/app/dashboard/student/special-meals/page.tsx`**

```tsx
"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PollWidget } from "@/components/ui/PollWidget";
import { MealCard } from "@/components/ui/MealCard";
import { useActivePolls, useVote, usePollResults } from "@/hooks/usePolls";
import { Loader2 } from "lucide-react";

export default function SpecialMealsPage() {
  const { data: polls, isLoading: pollsLoading } = useActivePolls();
  const vote = useVote();

  const handleVote = async (pollId: string, choice: string) => {
    await vote.mutateAsync({ pollId, choice });
  };

  if (pollsLoading) {
    return (
      <DashboardLayout role="STUDENT">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Special Meals</h1>
          <p className="text-gray-600">Bi-weekly special meals on Monday & Thursday</p>
        </div>

        {/* Today's Special Meal */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Today's Special</h2>
          <MealCard
            mealName="Chicken Biryani"
            mealType="LUNCH"
            description="Special Hyderabadi Chicken Biryani served with raita"
            time="12:00 PM - 1:30 PM"
            isSpecial={true}
            rating={4.5}
          />
        </div>

        {/* Polls */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Vote for Next Special Meal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {polls?.map((poll) => (
              <PollWidget
                key={poll.id}
                pollId={poll.id}
                title={poll.title}
                description={poll.description}
                options={poll.options}
                onVote={handleVote}
              />
            ))}
            {(!polls || polls.length === 0) && (
              <p className="text-gray-500">No active polls at the moment</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

---

## ✅ Phase 2 Completion Checklist

By the end of April 19, you should have:

- [ ] Sidebar navigation working for both Student and Admin roles
- [ ] Dashboard layouts responsive (mobile + desktop)
- [ ] Reusable components created (MealCard, PollWidget, FeedbackForm)
- [ ] TanStack Query configured and hooks created
- [ ] Protected routes with middleware
- [ ] Student dashboard with stats cards
- [ ] Admin dashboard with quick actions
- [ ] Meal plan page displaying meals
- [ ] Feedback page with form and history
- [ ] History page with tabs
- [ ] Special meals page with polls (placeholder)

---

## 🧪 Testing Phase 2

### Test the Application

```bash
# Terminal 1 - Backend
cd Desktop/hostel-mess-system/backend
npm run start

# Terminal 2 - Frontend
cd Desktop/hostel-mess-system/frontend
npm run dev
```

### Test Scenarios

1. **Login Flow**
   - Navigate to http://localhost:3000
   - Click Login
   - Enter credentials (create a test account first via register)
   - Verify redirect to Student Dashboard

2. **Navigation**
   - Click through all sidebar links
   - Verify pages load correctly
   - Test mobile view (resize browser to < 1024px)

3. **Components**
   - Meal cards display correctly
   - Feedback form accepts input
   - Poll widget renders options

4. **Responsive Design**
   - Check layout on mobile, tablet, and desktop

---

## 📁 Project Structure After Phase 2

```
hostel-mess-system/
├── frontend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   │   └── page.tsx
│   │   │   └── student/
│   │   │       ├── page.tsx
│   │   │       ├── meal-plan/
│   │   │       │   └── page.tsx
│   │   │       ├── special-meals/
│   │   │       │   └── page.tsx
│   │   │       ├── feedback/
│   │   │       │   └── page.tsx
│   │   │       └── history/
│   │   │           └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── providers/
│   │   │   └── AuthProvider.tsx
│   │   └── ui/
│   │       ├── MealCard.tsx
│   │       ├── PollWidget.tsx
│   │       ├── FeedbackForm.tsx
│   │       └── NotificationToast.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useMeals.ts
│   │   ├── useFeedback.ts
│   │   └── usePolls.ts
│   ├── lib/
│   │   └── api.ts
│   ├── middleware.ts
│   └── package.json
└── backend/
    └── (same as Phase 1)
```

---

## 🚀 Ready for Phase 3?

Phase 3 will cover:
- Admin Financial Module (Grocery bill upload, charts)
- Profanity Filter & Content Moderation
- Special Meal Poll System (full implementation)
- Real-time WebSocket Notifications
- Integration & Testing
- Deployment to Render

**Estimated time to complete Phase 2:** 4-6 days for beginners

**Team coordination for Phase 2:**
- Sonam Wangmo: Lead all frontend development
- Kinley Pem: Help with API integration and middleware
- Team: Test all pages and components together

---

## 📝 Notes for Team Members

1. **Always pull latest changes** before starting work:
   ```bash
   git pull origin main
   ```

2. **Create feature branches** for new components:
   ```bash
   git checkout -b feature/meal-card-component
   ```

3. **Commit frequently** with clear messages:
   ```bash
   git add .
   git commit -m "Add MealCard component with rating display"
   git push origin feature/meal-card-component
   ```

4. **Run both servers** simultaneously during development

5. **Check browser console** for errors (F12 → Console tab)