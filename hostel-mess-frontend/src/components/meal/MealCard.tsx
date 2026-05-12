interface MealCardProps {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export default function MealCard({
  day,
  breakfast,
  lunch,
  dinner,
}: MealCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">
        {day}
      </h2>

      <div className="space-y-2">
        <p>
          <strong>Breakfast:</strong> {breakfast}
        </p>

        <p>
          <strong>Lunch:</strong> {lunch}
        </p>

        <p>
          <strong>Dinner:</strong> {dinner}
        </p>
      </div>
    </div>
  );
}