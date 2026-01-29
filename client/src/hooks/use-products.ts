import { useQuery } from "@tanstack/react-query";
import { api, buildUrl, type ProductQueryParams } from "@shared/routes";

export function useProducts(params?: ProductQueryParams) {
  // Create a unique key based on params
  const queryKey = [api.products.list.path, params];

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build query string manually since buildUrl handles path params
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
      return api.products.list.responses[200].parse(await res.json());
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
      return api.products.get.responses[200].parse(await res.json());
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
      return api.products.getById.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const res = await fetch(api.categories.list.path);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return api.categories.list.responses[200].parse(await res.json());
    },
  });
}
