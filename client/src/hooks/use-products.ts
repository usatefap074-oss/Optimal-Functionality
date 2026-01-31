import { useQuery } from "@tanstack/react-query";
import { api, buildUrl, type ProductQueryParams } from "@shared/routes";
import type { Product } from "@shared/schema";

// Helper to deserialize product from API
function deserializeProduct(raw: any): Product {
  return {
    ...raw,
    images: typeof raw.images === 'string' ? JSON.parse(raw.images) : raw.images,
    specs: typeof raw.specs === 'string' ? JSON.parse(raw.specs) : raw.specs,
  };
}

export function useProducts(params?: ProductQueryParams) {
  const queryKey = [api.products.list.path, params];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL(window.location.origin + api.products.list.path);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      return data.map(deserializeProduct);
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: [api.products.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { slug });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      const data = await res.json();
      return deserializeProduct(data);
    },
    enabled: !!slug,
  });
}

export function useProductById(id: number) {
  return useQuery({
    queryKey: [api.products.getById.path, id],
    queryFn: async () => {
      const url = buildUrl(api.products.getById.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      const data = await res.json();
      return deserializeProduct(data);
    },
    enabled: !!id,
  });
}
