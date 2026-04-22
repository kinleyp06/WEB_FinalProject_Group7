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