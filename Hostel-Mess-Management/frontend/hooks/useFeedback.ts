import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export interface Feedback {
  id: string;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

// Fetch user's feedback history
export function useMyFeedback() {
  return useQuery({
    queryKey: ["feedback", "my"],
    queryFn: async () => {
      const response = await api.get("/feedback/my");
      return response.data as Feedback[];
    },
  });
}

// Fetch pending feedback (admin only)
export function usePendingFeedback() {
  return useQuery({
    queryKey: ["feedback", "pending"],
    queryFn: async () => {
      const response = await api.get("/feedback/pending");
      return response.data as Feedback[];
    },
  });
}

// Submit new feedback
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
      const response = await api.post("/feedback", { rating, comment });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", "my"] });
      toast.success("Feedback submitted! Awaiting moderation.");
    },
    onError: () => {
      toast.error("Failed to submit feedback");
    },
  });
}

// Moderate feedback (admin only)
export function useModerateFeedback() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) => {
      const response = await api.put(`/feedback/${id}/moderate`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", "pending"] });
      toast.success("Feedback moderated!");
    },
    onError: () => {
      toast.error("Failed to moderate feedback");
    },
  });
}