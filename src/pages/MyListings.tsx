import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MoreVertical, Edit, Trash2, Pause, Play, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateProduct } from '@/hooks/useUpdateProduct';
import { useDeleteProduct } from '@/hooks/useDeleteProduct';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function MyListings() {
  const navigate = useNavigate();
  const { user } = useWorldApp();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [pauseDialog, setPauseDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  useEffect(() => {
    fetchListings();
  }, [user]);

  const fetchListings = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  };

  const handlePause = async (id: string) => {
    await updateProduct.mutateAsync({ id, status: 'paused' });
    fetchListings();
    setPauseDialog({ open: false, id: null });
  };

  const handleResume = async (id: string) => {
    await updateProduct.mutateAsync({ id, status: 'active' });
    fetchListings();
  };

  const handleDelete = async (id: string) => {
    await deleteProduct.mutateAsync(id);
    fetchListings();
    setDeleteDialog({ open: false, id: null });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      pending: 'outline',
      sold: 'destructive',
      paused: 'outline',
      suspended: 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const ListingCard = ({ listing, showActions = true }: { listing: any; showActions?: boolean }) => (
  <Card
    className="cursor-pointer hover:border-primary"
    onClick={() => navigate(`/product/${listing.id}`)}
  >
    <CardContent className="p-4">
      <div className="flex gap-4">
        {listing.images?.[0] && (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-20 h-20 object-cover rounded-md"
          />
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold">{listing.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {listing.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(listing.status)}
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-product/${listing.id}`);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>

                    {listing.status === 'active' && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setPauseDialog({ open: true, id: listing.id });
                        }}
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </DropdownMenuItem>
                    )}

                    {listing.status === 'paused' && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResume(listing.id);
                        }}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </DropdownMenuItem>
                    )}

                    {listing.status !== 'sold' && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog({ open: true, id: listing.id });
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Responsive layout for price & button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-2">
            <span className="font-bold">
              {listing.price} {listing.currency}
            </span>

            {listing.status === 'inactive' ? (
              <Button
                size="sm"
                className="w-fit sm:w-auto self-start"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/list-product/${listing.id}/payment`);
                }}
              >
                Complete Payment
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground">
                {listing.views} views
              </span>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);


  const activeListings = listings.filter(l => l.status === 'active');
  const inactiveListings = listings.filter(l => l.status === 'inactive');
  const pausedListings = listings.filter(l => l.status === 'paused');
  const soldListings = listings.filter(l => l.status === 'sold');
  const suspendedListings = listings.filter(l => l.status === 'suspended');

  const SuspendedListingCard = ({ listing }: { listing: any }) => (
    <Card className="border-destructive">
      <CardContent className="p-4">
        <div className="flex gap-4">
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold">{listing.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {listing.description}
                </p>
              </div>
              <Badge variant="destructive">Suspended</Badge>
            </div>
            <p className="font-bold mb-3">
              {listing.price} {listing.currency}
            </p>
          </div>
        </div>
        
        <div className="bg-destructive/10 border-destructive border p-3 rounded-md mt-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive mb-1">
                Suspended on {listing.suspended_at ? format(new Date(listing.suspended_at), 'MMM dd, yyyy') : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Reason:</strong> {listing.suspension_reason || 'No reason provided'}
              </p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edit-product/${listing.id}`);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Review & Edit Listing
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button onClick={() => navigate('/list-product')}>
          <Plus className="mr-2 h-4 w-4" />
          New Listing
        </Button>
      </div>

      {/* Suspended Listings Section - Appears at top if any exist */}
      {suspendedListings.length > 0 && (
        <Card className="mb-6 border-destructive bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <CardTitle className="text-destructive text-1xl font-semibold">
                  Action Required: {suspendedListings.length} Suspended Listing{suspendedListings.length > 1 ? 's' : ''}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {suspendedListings.map(listing => (
              <SuspendedListingCard key={listing.id} listing={listing} />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>My Listings</CardTitle>
          <CardDescription>Manage your product listings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeListings.length})</TabsTrigger>
              <TabsTrigger value="paused">Paused ({pausedListings.length})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive ({inactiveListings.length})</TabsTrigger>
            </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading...</p>
                ) : listings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No listings yet</p>
                    <Button onClick={() => navigate('/list-product')}>
                      Create Your First Listing
                    </Button>
                  </div>
                ) : (
                  listings.map(listing => <ListingCard key={listing.id} listing={listing} />)
                )}
              </TabsContent>

              <TabsContent value="active" className="space-y-4 mt-6">
                {activeListings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No active listings</p>
                ) : (
                  activeListings.map(listing => <ListingCard key={listing.id} listing={listing} />)
                )}
              </TabsContent>

              <TabsContent value="paused" className="space-y-4 mt-6">
                {pausedListings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No paused listings</p>
                ) : (
                  pausedListings.map(listing => <ListingCard key={listing.id} listing={listing} />)
                )}
              </TabsContent>

              <TabsContent value="inactive" className="space-y-4 mt-6">
                {inactiveListings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No inactive listings</p>
                ) : (
                  inactiveListings.map(listing => <ListingCard key={listing.id} listing={listing} />)
                )}
              </TabsContent>

            <TabsContent value="sold" className="space-y-4 mt-6">
              {soldListings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No sold listings</p>
              ) : (
                soldListings.map(listing => <ListingCard key={listing.id} listing={listing} showActions={false} />)
              )}
            </TabsContent>
          </Tabs>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, id: null })}
          onConfirm={() => deleteDialog.id && handleDelete(deleteDialog.id)}
          title="Delete Listing"
          description="Are you sure you want to delete this listing? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />

        <ConfirmDialog
          open={pauseDialog.open}
          onOpenChange={(open) => setPauseDialog({ open, id: null })}
          onConfirm={() => pauseDialog.id && handlePause(pauseDialog.id)}
          title="Pause Listing"
          description="This listing will be hidden from the marketplace. You can resume it anytime."
          confirmText="Pause"
        />
      </div>
    </div>
  );
}
