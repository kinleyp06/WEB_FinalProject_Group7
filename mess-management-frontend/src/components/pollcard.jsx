export default function PollCard() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold mb-3">Special Meal Poll</h3>

      <button className="block w-full bg-green-500 text-white p-2 mb-2 rounded">
        Veg
      </button>

      <button className="block w-full bg-red-500 text-white p-2 rounded">
        Non-Veg
      </button>
    </div>
  );
}