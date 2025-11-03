import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useUploadProfilePicture = () => {
  const [uploading, setUploading] = useState(false);

  const uploadPicture = async (file: File, userId: string): Promise<string | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;

      // Delete old profile picture if exists
      const { data: existingFiles } = await supabase.storage
        .from('profile-pictures')
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
        await supabase.storage
          .from('profile-pictures')
          .remove(filesToDelete);
      }

      // Upload new picture
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload profile picture',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deletePicture = async (userId: string): Promise<boolean> => {
    setUploading(true);
    try {
      const { data: files } = await supabase.storage
        .from('profile-pictures')
        .list(userId);

      if (files && files.length > 0) {
        const filesToDelete = files.map(f => `${userId}/${f.name}`);
        const { error } = await supabase.storage
          .from('profile-pictures')
          .remove(filesToDelete);

        if (error) throw error;
      }

      return true;
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete profile picture',
        variant: 'destructive',
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  return { uploadPicture, deletePicture, uploading };
};
