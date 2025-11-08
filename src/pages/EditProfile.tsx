import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ProfilePictureUpload } from '@/components/ProfilePictureUpload';
import { useUploadProfilePicture } from '@/hooks/useUploadProfilePicture';

const editProfileSchema = z.object({
  email: z.string().email('Invalid email address'),
  allow_phone_contact: z.boolean(),
  phone: z.string().optional(),
}).refine((data) => {
  if (data.allow_phone_contact) {
    return data.phone && data.phone.length > 0;
  }
  return true;
}, {
  message: 'Phone number is required when phone contact is enabled',
  path: ['phone'],
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useWorldApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { uploadPicture, deletePicture, uploading } = useUploadProfilePicture();

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      email: '',
      allow_phone_contact: false,
      phone: '',
    },
  });

  const allowPhoneContact = form.watch('allow_phone_contact');

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      form.reset({
        email: data.email || '',
        allow_phone_contact: data.allow_phone_contact || false,
        phone: data.phone || '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPicture = async (file: File) => {
    if (!user?.id) return;

    const url = await uploadPicture(file, user.id);
    if (url) {
      const { error } = await supabase
        .from('user_profiles')
        .update({ profile_picture_url: url })
        .eq('id', user.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update profile picture',
          variant: 'destructive',
        });
      } else {
        setProfile({ ...profile, profile_picture_url: url });
        toast({
          title: 'Success',
          description: 'Profile picture updated',
        });
      }
    }
  };

  const handleDeletePicture = async () => {
    if (!user?.id) return;

    const success = await deletePicture(user.id);
    if (success) {
      const { error } = await supabase
        .from('user_profiles')
        .update({ profile_picture_url: null })
        .eq('id', user.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove profile picture',
          variant: 'destructive',
        });
      } else {
        setProfile({ ...profile, profile_picture_url: null });
        toast({
          title: 'Success',
          description: 'Profile picture removed',
        });
      }
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          email: data.email,
          allow_phone_contact: data.allow_phone_contact,
          phone: data.allow_phone_contact ? data.phone : null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      navigate('/profile');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-2xl mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate('/profile')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <ProfilePictureUpload
              currentImageUrl={profile?.profile_picture_url}
              onUpload={handleUploadPicture}
              onDelete={handleDeletePicture}
              uploading={uploading}
              userName={profile?.name || profile?.username}
            />

            <div className="space-y-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                <p className="text-base">{profile?.username || 'Not set'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-base">{profile?.display_location || 'Not set'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Wallet Address</p>
                <p className="text-base font-mono text-xs break-all">
                  {profile?.wallet_address || 'Not set'}
                </p>
              </div>

              {profile?.is_seller && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <p className="text-base">⭐ {profile?.rating || 0}/5</p>
                </div>
              )}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allow_phone_contact"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-input"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Allow users to contact you via phone
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Your phone number will be visible to potential buyers
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {allowPhoneContact && (
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
