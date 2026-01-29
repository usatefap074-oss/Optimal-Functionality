import { useMutation } from "@tanstack/react-query";
import { api, type CreateOrderInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCreateOrder() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      // Validate with schema first
      const validated = api.orders.create.input.parse(data);
      
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.orders.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create order");
      }

      return api.orders.create.responses[201].parse(await res.json());
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
