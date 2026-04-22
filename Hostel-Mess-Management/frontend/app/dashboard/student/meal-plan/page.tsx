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