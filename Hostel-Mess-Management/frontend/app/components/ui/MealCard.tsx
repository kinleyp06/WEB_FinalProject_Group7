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