import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { api } from "@shared/routes";

export default function Admin() {
  const { data: products = [], isLoading } = useProducts();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      name: "",
      price: 0,
      oldPrice: 0,
      inStock: true,
      image: "",
      images: [],
      description: "",
      specs: [],
      popular: false,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({});
  };

  const saveProduct = async () => {
    try {
      if (!formData.name || !formData.price) {
        toast({
          title: "Ошибка",
          description: "Заполните название и цену",
          variant: "destructive",
        });
        return;
      }

      const url = editingId 
        ? `/api/products/${editingId}` 
        : "/api/products";
      
      const method = editingId ? "PUT" : "POST";
      
      const payload = {
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^а-яa-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        price: formData.price,
        oldPrice: formData.oldPrice || null,
        inStock: formData.inStock ?? true,
        image: formData.image || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80",
        images: formData.images || [formData.image || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80"],
        description: formData.description || "",
        specs: formData.specs || [],
        popular: formData.popular ?? false,
      };

      console.log("Saving product:", payload);
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Ошибка сохранения");
      }

      toast({
        title: editingId ? "Товар обновлен" : "Товар создан",
      });

      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      cancelEdit();
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Ошибка",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Удалить товар?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Ошибка удаления");

      toast({ title: "Товар удален" });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">Загрузка...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Админ-панель</h1>
          <Button onClick={startCreate}>
            <Plus className="w-4 h-4 mr-2" /> Добавить товар
          </Button>
        </div>

        {/* Форма создания/редактирования */}
        {(isCreating || editingId) && (
          <div className="bg-card border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {isCreating ? "Новый товар" : "Редактирование"}
            </h2>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Цена (₽)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || 0}
                    onChange={(e) => updateField("price", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="oldPrice">Старая цена (₽)</Label>
                  <Input
                    id="oldPrice"
                    type="number"
                    value={formData.oldPrice || 0}
                    onChange={(e) => updateField("oldPrice", Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Изображение</Label>
                <div className="space-y-2">
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        updateField("image", reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <Input
                    id="imageUrl"
                    placeholder="Или вставьте URL изображения"
                    value={formData.image || ""}
                    onChange={(e) => updateField("image", e.target.value)}
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Превью"
                      className="w-32 h-32 object-cover rounded border"
                    />
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) => updateField("inStock", checked)}
                  />
                  <Label htmlFor="inStock">В наличии</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="popular"
                    checked={formData.popular ?? false}
                    onCheckedChange={(checked) => updateField("popular", checked)}
                  />
                  <Label htmlFor="popular">Популярный</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveProduct}>
                  <Save className="w-4 h-4 mr-2" /> Сохранить
                </Button>
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="w-4 h-4 mr-2" /> Отмена
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Список товаров */}
        <div className="space-y-4">
          {products.map((product: Product) => (
            <div
              key={product.id}
              className="bg-card border rounded-lg p-4 flex items-center gap-4"
            >
              <img
                src={product.image || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&q=80"}
                alt={product.name}
                className="w-20 h-20 object-cover rounded"
              />
              
              <div className="flex-1">
                <h3 className="font-bold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {product.price.toLocaleString()} ₽
                  {product.oldPrice && (
                    <span className="ml-2 line-through">
                      {product.oldPrice.toLocaleString()} ₽
                    </span>
                  )}
                </p>
                <div className="flex gap-2 mt-1">
                  {product.inStock ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      В наличии
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      Нет в наличии
                    </span>
                  )}
                  {product.popular && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Хит
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEdit(product)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteProduct(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
