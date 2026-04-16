import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import MealCard from "../components/mealcard";
import PollCard from "../components/pollcard";
import Notification from "../components/Notification";

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Navbar />

        <div className="p-6">
          <Notification message="Meal time changed to 8 PM" />

          <div className="grid grid-cols-3 gap-4 mt-4">
            <MealCard title="Breakfast" items={["Bread", "Egg", "Milk"]} />
            <MealCard title="Lunch" items={["Rice", "Chicken", "Dal"]} />
            <MealCard title="Dinner" items={["Rice", "Veg Curry"]} />
          </div>

          <div className="mt-6">
            <PollCard />
          </div>
        </div>
      </div>
    </div>
  );
}