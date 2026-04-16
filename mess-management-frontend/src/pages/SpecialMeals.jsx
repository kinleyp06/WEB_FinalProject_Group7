import Sidebar from "../components/sidebar";

export default function SpecialMeals() {
  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 p-6">
        <h1 className="text-2xl font-bold mb-4">Special Meals</h1>

        <div className="bg-white p-4 rounded shadow">
          <p>Thursday Special: Chicken Curry 🍗</p>
        </div>
      </div>
    </div>
  );
}