import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export interface Meal {
  id: string;
  dayOfWeek: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  name: string;
  description: string;
}

// Fetch all meals
export function useMeals() {
  return useQuery({
    queryKey: ["meals"],
    queryFn: async () => {
      const response = await api.get("/meals");
      return response.data as Meal[];
    },
  });
}

// Fetch today's meals
export function useTodaysMeals() {
  return useQuery({
    queryKey: ["meals", "today"],
    queryFn: async () => {
      const response = await api.get("/meals/today");
      return response.data as Meal[];
    },
  });
}

// Create a new meal (admin only)
export function useCreateMeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mealData: Omit<Meal, "id">) => {
      const response = await api.post("/meals", mealData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      toast.success("Meal created successfully!");
    },
    onError: () => {
      toast.error("Failed to create meal");
    },
  });
}

// Update a meal (admin only)
export function useUpdateMeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Meal> & { id: string }) => {
      const response = await api.put(`/meals/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      toast.success("Meal updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update meal");
    },
  });
}

// Delete a meal (admin only)
export function useDeleteMeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/meals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      toast.success("Meal deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete meal");
    },
  });
}