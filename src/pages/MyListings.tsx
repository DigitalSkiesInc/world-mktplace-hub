import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorldApp } from '@/contexts/WorldAppContext';
import { supabase } from '@/integrations/supabase/client';

export default function MyListings() {
  const navigate = useNavigate();
  const { user } = useWorldApp();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchListings();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      pending: 'outline',
      sold: 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const activeListings = listings.filter(l => l.status === 'active');
  const inactiveListings = listings.filter(l => l.status === 'inactive');
  const soldListings = listings.filter(l => l.status === 'sold');

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button onClick={() => navigate('/list-product')}>
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Button>
        </div>

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
                <TabsTrigger value="inactive">Inactive ({inactiveListings.length})</TabsTrigger>
                <TabsTrigger value="sold">Sold ({soldListings.length})</TabsTrigger>
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
                  listings.map(listing => (
                    <Card key={listing.id} className="cursor-pointer hover:border-primary" onClick={() => navigate(`/product/${listing.id}`)}>
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
                              <div>
                                <h3 className="font-semibold">{listing.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {listing.description}
                                </p>
                              </div>
                              {getStatusBadge(listing.status)}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-bold">
                                {listing.price} {listing.currency}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {listing.views} views
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="active" className="space-y-4 mt-6">
                {activeListings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No active listings</p>
                ) : (
                  activeListings.map(listing => (
                    <Card key={listing.id} className="cursor-pointer hover:border-primary" onClick={() => navigate(`/product/${listing.id}`)}>
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
                            <h3 className="font-semibold">{listing.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {listing.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-bold">
                                {listing.price} {listing.currency}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {listing.views} views
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="inactive" className="space-y-4 mt-6">
                {inactiveListings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No inactive listings</p>
                ) : (
                  inactiveListings.map(listing => (
                    <Card key={listing.id} className="cursor-pointer hover:border-primary" onClick={() => navigate(`/product/${listing.id}`)}>
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
                            <h3 className="font-semibold">{listing.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {listing.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-bold">
                                {listing.price} {listing.currency}
                              </span>
                              <Button 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/list-product/${listing.id}/payment`);
                                }}
                              >
                                Complete Payment
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="sold" className="space-y-4 mt-6">
                {soldListings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No sold listings</p>
                ) : (
                  soldListings.map(listing => (
                    <Card key={listing.id} className="cursor-pointer hover:border-primary" onClick={() => navigate(`/product/${listing.id}`)}>
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
                            <h3 className="font-semibold">{listing.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {listing.description}
                            </p>
                            <span className="font-bold">
                              {listing.price} {listing.currency}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
