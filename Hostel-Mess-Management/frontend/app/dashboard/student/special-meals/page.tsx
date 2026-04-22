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