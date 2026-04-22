import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: string[];
  isActive: boolean;
  validUntil: string;
}

export interface PollResults {
  [key: string]: number;
}

// Fetch active polls
export function useActivePolls() {
  return useQuery({
    queryKey: ["polls", "active"],
    queryFn: async () => {
      const response = await api.get("/polls/active");
      return response.data as Poll[];
    },
  });
}

// Fetch poll results
export function usePollResults(pollId: string) {
  return useQuery({
    queryKey: ["polls", pollId, "results"],
    queryFn: async () => {
      const response = await api.get(`/polls/${pollId}/results`);
      return response.data as PollResults;
    },
    enabled: !!pollId,
  });
}

// Vote in a poll
export function useVote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ pollId, choice }: { pollId: string; choice: string }) => {
      const response = await api.post(`/polls/${pollId}/vote`, { choice });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["polls", variables.pollId, "results"] });
      toast.success("Vote recorded!");
    },
    onError: () => {
      toast.error("Failed to submit vote");
    },
  });
}

// Create a new poll (admin only)
export function useCreatePoll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pollData: Omit<Poll, "id">) => {
      const response = await api.post("/polls", pollData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast.success("Poll created successfully!");
    },
    onError: () => {
      toast.error("Failed to create poll");
    },
  });
}