import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  gallery_urls: string[] | null;
  category_id: string | null;
  fragrance_notes: {
    top?: string[];
    middle?: string[];
    base?: string[];
  } | null;
  size: string | null;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export const useDbProducts = () => {
  return useQuery({
    queryKey: ['db-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DbProduct[];
    },
  });
};

export const useDbProductsByCategory = (categorySlug: string) => {
  return useQuery({
    queryKey: ['db-products', 'category', categorySlug],
    queryFn: async () => {
      // First get the category
      const { data: category, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .maybeSingle();
      
      if (catError) throw catError;
      if (!category) return { products: [], category: null };

      // Then get products for that category
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .eq('category_id', category.id)
        .order('created_at', { ascending: false });
      
      if (prodError) throw prodError;
      return { products: products as DbProduct[], category: category as DbCategory };
    },
    enabled: !!categorySlug,
  });
};

export const useDbProduct = (productId: string) => {
  return useQuery({
    queryKey: ['db-product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .eq('id', productId)
        .maybeSingle();
      
      if (error) throw error;
      return data as DbProduct | null;
    },
    enabled: !!productId,
  });
};

export const useDbCategories = () => {
  return useQuery({
    queryKey: ['db-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as DbCategory[];
    },
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .eq('featured', true)
        .eq('in_stock', true)
        .limit(6);
      
      if (error) throw error;
      return data as DbProduct[];
    },
  });
};

export const useRelatedProducts = (productId: string, categoryId: string | null) => {
  return useQuery({
    queryKey: ['related-products', productId, categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .eq('category_id', categoryId)
        .neq('id', productId)
        .eq('in_stock', true)
        .limit(4);
      
      if (error) throw error;
      return data as DbProduct[];
    },
    enabled: !!categoryId,
  });
};
