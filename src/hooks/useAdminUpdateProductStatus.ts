import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAdminUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      productId, 
      status, 
      suspensionReason 
    }: { 
      productId: string; 
      status: string; 
      suspensionReason?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: any = { status };
      
      if (status === 'suspended') {
        if (!suspensionReason) throw new Error('Suspension reason is required');
        updateData.suspension_reason = suspensionReason;
        updateData.suspended_at = new Date().toISOString();
        updateData.suspended_by = user?.id;
      } else {
        // Clear suspension fields if status changes from suspended
        updateData.suspension_reason = null;
        updateData.suspended_at = null;
        updateData.suspended_by = null;
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Product status updated successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to update product status', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
};
