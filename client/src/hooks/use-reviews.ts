import { useQuery } from "@tanstack/react-query";
import type { Review } from "@shared/schema";

export function useReviews() {
  return useQuery<Review[]>({
    queryKey: ["reviews"],
    queryFn: async () => {
      const response = await fetch("/api/reviews");
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    },
  });
}
