import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  image_url: string | null;
  gallery_urls: string[];
  fragrance_notes: Record<string, string> | null;
  size: string | null;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    slug: string;
    name: string;
  } | null;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await db
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    },
  });
};

export const useProducts = (categorySlug?: string) => {
  return useQuery({
    queryKey: ['products', categorySlug],
    queryFn: async () => {
      let query = db
        .from('products')
        .select(`
          *,
          category:categories(id, slug, name)
        `)
        .order('created_at', { ascending: false });
      
      if (categorySlug) {
        // First get category ID by slug
        const { data: categoryData } = await db
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await db
        .from('products')
        .select(`
          *,
          category:categories(id, slug, name)
        `)
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    enabled: !!productId,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>) => {
      const { data, error } = await db
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create product: ' + error.message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { category, ...updateData } = product;
      const { data, error } = await db
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update product: ' + error.message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete product: ' + error.message);
    },
  });
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `product-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const useUploadProductImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      return uploadProductImage(file);
    },
  });
};
