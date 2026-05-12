import Navbar from "@/components/navbar/Navbar";
import MealCard from "@/components/meal/MealCard";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { meals } from "@/data/mockData";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="p-8 grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              day={meal.day}
              breakfast={meal.breakfast}
              lunch={meal.lunch}
              dinner={meal.dinner}
            />
          ))}
        </div>

        <FeedbackForm />
      </div>
    </div>
  );
}