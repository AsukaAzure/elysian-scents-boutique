import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Search, Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct, useUploadProductImage } from '@/hooks/useProducts';
import { toast } from 'sonner';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category_id: string;
  size: string;
  in_stock: boolean;
  image_url: string;
}

const AdminInventory = () => {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadImage = useUploadProductImage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category_id: '',
    size: '',
    in_stock: true,
    image_url: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      size: '',
      in_stock: true,
      image_url: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingProductId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id || '',
      size: product.size || '',
      in_stock: product.in_stock ?? true,
      image_url: product.image_url || '',
    });
    setImagePreview(product.image_url || null);
    setEditingProductId(product.id);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        imageUrl = await uploadImage.mutateAsync(imageFile);
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        size: formData.size.trim() || null,
        in_stock: formData.in_stock,
        image_url: imageUrl || null,
        gallery_urls: [],
        fragrance_notes: null,
        featured: false,
      };

      if (editingProductId) {
        await updateProduct.mutateAsync({ id: editingProductId, ...productData });
        toast.success('Product updated successfully');
      } else {
        await createProduct.mutateAsync(productData);
        toast.success('Product created successfully');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct.mutateAsync(productId);
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories?.find((c) => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Inventory</h1>
            <p className="text-muted-foreground mt-1">Manage your product catalog</p>
          </div>
          <Button variant="luxury" onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 luxury-input"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-card border border-border/50 overflow-hidden group">
                <div className="aspect-[3/4] bg-secondary relative">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                  )}
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <span className="text-sm uppercase tracking-widest text-muted-foreground">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-primary uppercase tracking-wider">{getCategoryName(product.category_id)}</p>
                    <h3 className="font-serif text-lg text-foreground mt-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium">${product.price}</span>
                    {product.size && <span className="text-xs text-muted-foreground">{product.size}</span>}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(product)}>
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Product Image</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-secondary border border-border rounded overflow-hidden flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Upload className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input type="file" accept="image/*" onChange={handleImageChange} className="luxury-input" />
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="luxury-input"
                  placeholder="Enter product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-muted-foreground">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="luxury-input min-h-[80px]"
                  placeholder="Enter product description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-muted-foreground">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    className="luxury-input"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-muted-foreground">Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData((prev) => ({ ...prev, size: e.target.value }))}
                    className="luxury-input"
                    placeholder="e.g., 100ml"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}>
                  <SelectTrigger className="luxury-input">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="in_stock" className="text-muted-foreground">In Stock</Label>
                <Switch
                  id="in_stock"
                  checked={formData.in_stock}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, in_stock: checked }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button
                  type="submit"
                  variant="luxury"
                  className="flex-1"
                  disabled={createProduct.isPending || updateProduct.isPending || uploadImage.isPending}
                >
                  {createProduct.isPending || updateProduct.isPending || uploadImage.isPending
                    ? 'Saving...'
                    : editingProductId
                    ? 'Update Product'
                    : 'Add Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
