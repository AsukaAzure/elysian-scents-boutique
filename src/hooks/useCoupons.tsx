import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

export const useCoupons = () => {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await db
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Coupon[];
    },
  });
};

export const useValidateCoupon = () => {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (code: string) => {
      // Get coupon by code
      const { data: coupon, error } = await db
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();
      
      if (error || !coupon) {
        throw new Error('Invalid or expired coupon code');
      }
      
      // Check if user has already used this coupon
      if (user) {
        const { data: usage } = await db
          .from('coupon_usage')
          .select('id')
          .eq('coupon_id', coupon.id)
          .eq('user_id', user.id)
          .single();
        
        if (usage) {
          throw new Error('You have already used this coupon');
        }
      }
      
      return coupon as Coupon;
    },
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (coupon: Omit<Coupon, 'id' | 'created_at' | 'usage_count'>) => {
      const { data, error } = await db
        .from('coupons')
        .insert({ ...coupon, code: coupon.code.toUpperCase() })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create coupon: ' + error.message);
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...coupon }: Partial<Coupon> & { id: string }) => {
      const updateData = coupon.code ? { ...coupon, code: coupon.code.toUpperCase() } : coupon;
      
      const { data, error } = await db
        .from('coupons')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update coupon: ' + error.message);
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db
        .from('coupons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete coupon: ' + error.message);
    },
  });
};

export const useRecordCouponUsage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ couponId, orderId }: { couponId: string; orderId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Record usage
      const { error: usageError } = await db
        .from('coupon_usage')
        .insert({
          coupon_id: couponId,
          user_id: user.id,
          order_id: orderId,
        });
      
      if (usageError) throw usageError;
      
      // Get current count and increment
      const { data: couponData } = await db
        .from('coupons')
        .select('usage_count')
        .eq('id', couponId)
        .single();
      
      if (couponData) {
        await db
          .from('coupons')
          .update({ usage_count: (couponData.usage_count || 0) + 1 })
          .eq('id', couponId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};
