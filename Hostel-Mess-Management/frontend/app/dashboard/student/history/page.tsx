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