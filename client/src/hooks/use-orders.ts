import { useMutation } from "@tanstack/react-query";
import { api, type CreateOrderInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

// Helper to deserialize product from API
export function deserializeProduct(raw: any): Product {
  return {
    ...raw,
    images: typeof raw.images === 'string' ? JSON.parse(raw.images) : raw.images,
    specs: typeof raw.specs === 'string' ? JSON.parse(raw.specs) : raw.specs,
  };
}

export function useCreateOrder() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create order");
      }

      return await res.json();
    },
    onError: (error) => {
      toast({
        title: "Ошибка оформления заказа",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
